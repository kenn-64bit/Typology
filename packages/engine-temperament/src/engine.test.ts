import { describe, expect, it } from "vitest";
import { FALLBACK, importableBigFive, quadrant, RANK_ID, temperamentEngine as E, TEMPS } from "./index.ts";
import { temperamentToken, type Temp } from "@typo/bio";

/** Answer the whole form at once (any order), as the UI does. lean: +1 high, −1 low, 0 neutral (raw 3). */
function run(profile: Record<string, unknown>, lean: { E: number; N: number }, ranking: Temp[]) {
  let s = E.init(profile);
  for (const v of [...E.form(s)].reverse()) {
    if (v.id === RANK_ID) { s = E.answer(s, v.id, ranking); continue; }
    const it = FALLBACK.find(i => i.id === v.id)!;
    const l = (lean as Record<string, number>)[it.scale]!;
    const keyed = l > 0 ? 5 : l < 0 ? 1 : 3;
    s = E.answer(s, v.id, it.reverse ? 6 - keyed : keyed);
  }
  return s;
}
const bf = (E: number, N: number, se = 0.4, scoringVersion?: string) => ({
  bigfive: { published: { E: { theta: E, se }, N: { theta: N, se } }, ...(scoringVersion ? { meta: { scoringVersion } } : {}) },
});
const RANK: Temp[] = ["choleric", "sanguine", "melancholic", "phlegmatic"];

describe("temperament engine (fixed form)", () => {
  it("form: 8 items + 1 ranking alone; only the ranking with a Big Five result", () => {
    expect(E.form(E.init({}))).toHaveLength(9);
    expect(E.form(E.init(bf(0, 0))).map(v => v.id)).toEqual([RANK_ID]);
  });
  it("quadrants follow E × N on both paths", () => {
    expect(E.result(run(bf(-1.5, -1.5), { E: 0, N: 0 }, ["phlegmatic", "melancholic", "sanguine", "choleric"])).top).toBe("phlegmatic");
    expect(E.result(run(bf(-1.5, 1.5), { E: 0, N: 0 }, ["melancholic", "phlegmatic", "sanguine", "choleric"])).top).toBe("melancholic");
    expect(E.result(run({}, { E: 1, N: -1 }, ["sanguine", "choleric", "phlegmatic", "melancholic"])).top).toBe("sanguine");
    expect(E.result(run({}, { E: -1, N: 1 }, ["melancholic", "choleric", "phlegmatic", "sanguine"])).top).toBe("melancholic");
  });
  it("TM-03 preserved: a clear consistent profile is [dom]; a boundary E profile is a reachable blend", () => {
    expect(E.result(run(bf(2, 2), { E: 0, N: 0 }, RANK)).token).toBe("chol [dom]");
    expect(E.result(run(bf(0.05, 1.5), { E: 0, N: 0 }, ["melancholic", "choleric", "sanguine", "phlegmatic"])).token).toMatch(/^(mel|chol)-(mel|chol)$/);
  });
  it("finished only when the whole form is answered; next() walks the form", () => {
    let s = E.init({});
    expect(E.bioTokens(s)).toEqual([]);
    for (let v = E.next(s); v; v = E.next(s)) s = v.id === RANK_ID ? E.answer(s, v.id, TEMPS) : E.answer(s, v.id, 3);
    expect(E.bioTokens(s)[0]!.slot).toBe("temperament");
    expect(E.deserialize(E.serialize(s))).toEqual(s);
    expect(E.explain(s)[0]!.topEvidence.length).toBeLessThanOrEqual(3);
  });
  it("rejects an incomplete ranking", () => {
    expect(() => E.answer(E.init({}), RANK_ID, ["choleric"])).toThrow();
  });
});

describe("TM-01: certainty is not location", () => {
  it("same point, smaller SD → higher quadrant certainty, but the reported location is unchanged and flagged near the line", () => {
    const wide = E.result(run(bf(0.2, 0.2, 0.6), { E: 0, N: 0 }, RANK));
    const tight = E.result(run(bf(0.2, 0.2, 0.05), { E: 0, N: 0 }, RANK));
    expect(tight.traitProbs.choleric).toBeGreaterThan(wide.traitProbs.choleric);
    expect(tight.E.percentile).toBe(wide.E.percentile);
    expect(tight.token).toBe("chol [dom]");
    expect(tight.nearLine).toBe(true); // 58th percentile: certain quadrant, not far inside it
    expect(wide.nearLine).toBe(true);
  });
  it("a far point is not near the line", () => {
    expect(E.result(run(bf(1.5, 1.5), { E: 0, N: 0 }, RANK)).nearLine).toBe(false);
  });
});

describe("TM-02: description agreement is shown, not forced", () => {
  it("ranking the inherited top type last → conflicts, with the trait-only quadrant still reported", () => {
    const r = E.result(run(bf(2, 2, 0.3), { E: 0, N: 0 }, ["phlegmatic", "melancholic", "sanguine", "choleric"]));
    expect(r.traitTop).toBe("choleric");
    expect(r.agreement).toEqual({ rankOfTraitTop: 4, status: "conflicts", firstChoice: "phlegmatic" });
    expect(r.top).toBe("choleric"); // bounded ranking weights: no veto, no amplification
  });
  it("agrees / partly", () => {
    expect(E.result(run(bf(2, 2), { E: 0, N: 0 }, RANK)).agreement!.status).toBe("agrees");
    expect(E.result(run(bf(2, 2), { E: 0, N: 0 }, ["sanguine", "choleric", "melancholic", "phlegmatic"])).agreement!.status).toBe("partly");
  });
  it("tied quadrants: no trait-only top, no agreement claim, unresolved recorded; ranking alone decides the token", () => {
    const r = E.result(run({}, { E: 0, N: 0 }, RANK));
    expect(Object.values(r.traitProbs).every(p => Math.abs(p - 0.25) < 1e-9)).toBe(true);
    expect(r.traitTop).toBeNull();
    expect(r.agreement).toBeNull();
    expect(r.meta.unresolved).toEqual(["trait-derived quadrant"]);
    expect(r.top).toBe("choleric");
    expect(r.meta.quality.map(q => q.code)).toEqual(["straight-line"]);
  });
});

describe("fallback form and Big Five import", () => {
  it("every fallback answer contributes", () => {
    const pick = (id: string) => (id === "te1" || id === "tn3" ? 4 : 3);
    let base = E.init({});
    for (const v of E.form(base)) base = v.id === RANK_ID ? E.answer(base, v.id, RANK) : E.answer(base, v.id, pick(v.id));
    for (const it of FALLBACK) {
      const changed = E.answer(base, it.id, pick(it.id) === 4 ? 2 : 5);
      expect(quadrant(changed, false), it.id).not.toEqual(quadrant(base, false));
    }
  });
  it("records the Big Five dependency and version", () => {
    const r = E.result(run(bf(1, 1, 0.4, "bigfive-2"), { E: 0, N: 0 }, RANK));
    expect(r.meta.dependencies).toEqual([{ engine: "bigfive", scoringVersion: "bigfive-2", used: expect.stringContaining("E θ 1.000") }]);
    expect(E.result(run(bf(1, 1), { E: 0, N: 0 }, RANK)).meta.dependencies[0]!.scoringVersion).toBe("legacy");
    expect(E.result(run({}, { E: 1, N: 1 }, RANK)).meta.dependencies).toEqual([]);
  });
  it("incompatible or malformed Big Five results are not imported: the own-items form is used", () => {
    for (const p of [bf(1, 1, 0.4, "bigfive-99"), bf(Number.NaN, 1), bf(1, 1, 0), { bigfive: "x" }, { bigfive: { published: { E: { theta: 1, se: 0.4 } } } }]) {
      expect(importableBigFive(p)).toBeNull();
      expect(E.form(E.init(p))).toHaveLength(9);
    }
  });
  it("own answers are refused on the Big Five form", () => {
    expect(() => E.answer(E.init(bf(1, 1)), "te1", 4)).toThrow();
  });
  it("completion counts the actual form", () => {
    expect(E.result(run(bf(1, 1), { E: 0, N: 0 }, RANK)).meta.completion).toEqual({ answered: 1, total: 1, complete: true });
    expect(E.result(run({}, { E: 1, N: 0 }, RANK)).meta.completion).toEqual({ answered: 9, total: 9, complete: true });
  });
});

describe("saved-state validation (X-07)", () => {
  const good = JSON.parse(E.serialize(run({}, { E: 1, N: -1 }, RANK)));
  const bad = (f: (o: any) => void) => { const o = structuredClone(good); f(o); return JSON.stringify(o); };
  it("accepts a valid state and migrates v2", () => {
    expect(() => E.deserialize(JSON.stringify(good))).not.toThrow();
    const v2 = bad(o => { o.v = 2; delete o.bigFiveVersion; });
    expect(E.deserialize(v2).v).toBe(3);
  });
  it("rejects malformed states", () => {
    expect(() => E.deserialize(bad(o => { o.answers[0].x = 9; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[0].itemId = "zz"; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers.push({ ...o.answers[0] }); }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.ranking = ["choleric", "choleric", "sanguine", "phlegmatic"]; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.fromBigFive = { E: { theta: 1, se: -1 }, N: { theta: 0, se: 1 } }; o.answers = []; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.v = 7; }))).toThrow();
  });
});

describe("QA audit: Temperament no-match, deserialization, symmetry, and explanations", () => {
  it("test_temperament_empty_state_does_not_fabricate_named_blend", () => {
    // With 0 answers, no Big Five import, and no ranking, all four quadrants equal 0.25 and traitTop is null;
    // the engine must not conclude "chol-mel" solely from TEMPS array declaration order.
    const s0 = E.init({});
    const r = E.result(s0);
    expect(r.traitTop).toBeNull();
    expect(r.meta.unresolved).toContain("trait-derived quadrant");
    expect(r.token).toBe("unresolved");
  });

  it("test_temperament_deserialize_null_and_invalid_bigfive_version_rejected_cleanly", () => {
    // deserialize("null") must throw a validation Error (not unguarded TypeError reading .v),
    // and non-string bigFiveVersion must be rejected so Dependency.scoringVersion stays a string.
    expect(() => E.deserialize("null")).toThrow(/Unrecognised temperament state/);
    const nonStringVer = JSON.stringify({
      v: 3, fromBigFive: { E: { theta: 1, se: 0.4 }, N: { theta: 1, se: 0.4 } },
      bigFiveVersion: 12345, answers: [], ranking: null,
    });
    expect(() => E.deserialize(nonStringVer)).toThrow();
  });

  it("test_temperament_near_line_boundary_40th_and_60th_exact_0_10_not_strictly_inside", () => {
    // THRESHOLDS.temperament.nearLine = 0.1 with strict `< near`: exact 40th and 60th percentiles sit at distance 0.10
    // (not < 0.10), yet IEEE-754 `60/100 - 0.5 = 0.09999999999999998` makes `< 0.1` true.
    const hi = E.result(run(bf(0.2533, 1.5, 0.4), { E: 0, N: 0 }, RANK));
    const lo = E.result(run(bf(-0.2533, 1.5, 0.4), { E: 0, N: 0 }, RANK));
    expect(hi.E.percentile).toBe(60);
    expect(lo.E.percentile).toBe(40);
    expect(hi.nearLine).toBe(false);
    expect(lo.nearLine).toBe(false);
  });

  it("test_temperament_explain_bigfive_import_credits_imported_traits_with_nonzero_evidence", () => {
    // When Big Five E=2, N=2 overrides a conflicting phlegmatic-first ranking to produce chol [dom],
    // the Big Five evidence that decided choleric must carry positive delta ahead of the opposing ranking.
    const s = run(bf(2, 2, 0.3, "bigfive-2"), { E: 0, N: 0 }, ["phlegmatic", "melancholic", "sanguine", "choleric"]);
    const [ex] = E.explain(s);
    expect(ex!.result).toBe("chol [dom]");
    const bfEv = ex!.topEvidence.find(e => e.itemId === "bigfive")!;
    expect(bfEv.delta).toBeGreaterThan(0);
    expect(ex!.topEvidence[0]!.itemId).toBe("bigfive");
  });

  it("test_temperament_blend_cut_0_2_exact_boundary_dom_vs_blend", () => {
    // THRESHOLDS.temperament.blendCut = 0.2: runner-up < 0.2 -> [dom], runner-up >= 0.2 -> blend.
    expect(temperamentToken({ phlegmatic: 0.8001, melancholic: 0.1999, sanguine: 0, choleric: 0 })).toBe("phleg [dom]");
    expect(temperamentToken({ phlegmatic: 0.8, melancholic: 0.2, sanguine: 0, choleric: 0 })).toBe("phleg-mel");
  });

  it("test_temperament_fallback_reverse_key_conflict_emits_quality_note", () => {
    let s = E.init({});
    for (const v of E.form(s)) {
      if (v.id === RANK_ID) s = E.answer(s, v.id, RANK);
      else s = E.answer(s, v.id, v.id.startsWith("te") ? 5 : 3);
    }
    const r = E.result(s);
    expect(r.meta.quality.some(q => q.code === "reverse-key-conflict" && q.output === "Extraversion")).toBe(true);
  });

  it("test_temperament_ranking_flips_borderline_quadrant_winner", () => {
    // E slightly high (theta = 0.02), N high (theta = 1.5): traitTop is choleric, but ranking melancholic 1st flips top.
    const r = E.result(run(bf(0.02, 1.5, 0.5, "bigfive-2"), { E: 0, N: 0 }, ["melancholic", "choleric", "phlegmatic", "sanguine"]));
    expect(r.traitTop).toBe("choleric");
    expect(r.top).toBe("melancholic");
    expect(r.token).toBe("mel-chol");
    expect(r.agreement).toEqual({ rankOfTraitTop: 2, status: "partly", firstChoice: "melancholic" });
  });
});
