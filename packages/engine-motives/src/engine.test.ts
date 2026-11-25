import { describe, expect, it } from "vitest";
import { motivesDominance, motivesLetter, motivesToken } from "@typo/bio";
import { motivesEngine as E, ITEMS, priorFromBigFive, TRAITS } from "./index.ts";

/** Adaptive run as a respondent leaning to the high (+1) or low (−1) pole of each trait, or neutral (0). */
function run(lean: Record<string, -1 | 0 | 1>, profile: Record<string, unknown> = {}) {
  let s = E.init(profile);
  for (let v = E.next(s); v; v = E.next(s)) {
    const it = ITEMS.find(i => i.id === v.id)!;
    const l = lean[it.scale]!; const keyed = l === 0 ? 3 : l > 0 ? 5 : 1;
    s = E.answer(s, v.id, it.reverse ? 6 - keyed : keyed);
  }
  return s;
}
type Item = (typeof ITEMS)[number];
/** Fixed form, every item answered; `pick` returns the RAW answer. */
function fixed(pick: (i: Item) => number, profile: Record<string, unknown> = {}, reverse = false) {
  let s = E.init(profile);
  const form = E.form(s);
  for (const v of reverse ? [...form].reverse() : form) s = E.answer(s, v.id, pick(ITEMS.find(i => i.id === v.id)!));
  return s;
}
const NEUTRAL = { M: 0, O: 0, T: 0, I: 0, V: 0, E: 0, S: 0 } as const;

describe("MOTIVES engine", () => {
  it("28 items, 4 per trait, keying balanced 2:2 within every trait (MO-02)", () => {
    expect(ITEMS).toHaveLength(28);
    for (const t of TRAITS) {
      expect(ITEMS.filter(i => i.scale === t)).toHaveLength(4);
      expect(ITEMS.filter(i => i.scale === t && i.reverse)).toHaveLength(2);
    }
  });
  it("scripted leanings give the expected letters, in M-O-T-I-V-E-S order", () => {
    const s = run({ M: -1, O: 1, T: 1, I: -1, V: 1, E: -1, S: -1 });
    expect(E.result(s).code.replace(/\|/g, "")).toBe("AOTWVRG");
    expect(E.bioTokens(s)[0]!.slot).toBe("motives");
  });
  it("never asks more than the adaptive cap per trait", () => {
    const s = run({ M: 1, O: 1, T: 1, I: 1, V: 1, E: 1, S: 1 });
    for (const t of TRAITS) expect(s.answers.filter(a => a.itemId[0] === t.toLowerCase()).length).toBeLessThanOrEqual(3);
  });
  it("pure answer, serialize round-trip, explain ≤ 3 per trait", () => {
    const s0 = E.init({}); const v = E.next(s0)!; const s1 = E.answer(s0, v.id, 4);
    expect(s0.answers).toHaveLength(0);
    expect(E.deserialize(E.serialize(s1))).toEqual(s1);
    for (const x of E.explain(run({ M: 1, O: 1, T: 1, I: 1, V: 1, E: 1, S: 1 }))) expect(x.topEvidence.length).toBeLessThanOrEqual(3);
  });
});

describe("fixed-form fixtures (MO-01 – MO-03)", () => {
  it("all-Neutral: XXXXXXX with no bars, no lean, no dominant trait (MO-03)", () => {
    const r = E.result(fixed(() => 3));
    expect(r.code).toBe("XXXXXXX");
    expect(r.dominant).toEqual({ trait: null, candidates: [] });
    for (const t of TRAITS) expect(r.traits[t].lean).toBeNull();
  });
  for (const [x, label] of [[4, "Agree"], [2, "Disagree"], [5, "Strongly agree"], [1, "Strongly disagree"]] as const) {
    it(`raw all-${label}: balanced keying gives no high- or low-pole tilt (MO-02)`, () => {
      const r = E.result(fixed(() => x));
      expect(r.code).toBe("XXXXXXX");
      for (const t of TRAITS) expect(Math.abs(r.traits[t].theta)).toBeLessThan(1e-9);
      expect(r.meta.quality.filter(q => q.code === "reverse-key-conflict")).toHaveLength(7);
    });
  }
  it("keyed moderate answers: every letter leans, case from level; equal levels are a tie, so no bars", () => {
    const r = E.result(fixed(i => (i.reverse ? 2 : 4)));
    for (const t of TRAITS) expect(r.traits[t].lean).toBe("high");
    expect(r.code).not.toContain("|");
    expect(r.dominant.trait).toBeNull();
    expect(r.dominant.candidates).toEqual([...TRAITS]);
    expect(r.meta.unresolved).toContain("strongest trait");
  });
  it("one clearly further trait gets the bars", () => {
    const r = E.result(fixed(i => (i.scale === "O" ? (i.reverse ? 1 : 5) : i.reverse ? 2 : 4)));
    expect(r.dominant.trait).toBe("O");
    expect(r.code).toBe("m|O|tives"); // moderate keyed answers are medium (lowercase) by level
  });
  it("conflicting keyed answers on one trait → X there plus a conflict note", () => {
    const r = E.result(fixed(i => (i.scale === "I" ? 5 : 3)));
    expect(r.traits.I.letter).toBe("X");
    expect(r.meta.quality.find(q => q.code === "reverse-key-conflict")?.output).toBe("Interpersonal / Withholding");
  });
  it("case depends on level only, not on certainty", () => {
    expect(motivesToken([0.85, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5])).toBe("|M|XXXXXX");
    expect(motivesToken([0.65, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5])).toBe("|m|XXXXXX");
    expect(motivesDominance([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]).index).toBeNull();
    expect(motivesDominance([0.85, 0.84, 0.5, 0.5, 0.5, 0.5, 0.5])).toEqual({ index: null, candidates: [0, 1] });
  });
  it("answer order and replacement do not change the result", () => {
    const pick = (i: Item) => ((i.id.charCodeAt(0) + i.id.charCodeAt(1) * 3) % 5) + 1;
    expect(E.result(fixed(pick, {}, true))).toEqual(E.result(fixed(pick)));
    const s = E.answer(fixed(i => (i.id === "t2" ? 1 : pick(i))), "t2", pick(ITEMS.find(i => i.id === "t2")!));
    expect(E.result(s).traits).toEqual(E.result(fixed(pick)).traits);
  });
  it("result names its events, scoring version and completion", () => {
    const r = E.result(fixed(() => 4));
    expect(r.meta.scoringVersion).toBe("motives-2");
    expect(r.meta.completion).toEqual({ answered: 28, total: 28, complete: true });
    expect(r.meta.uncertainty.every(u => !u.calibrated && u.event)).toBe(true);
  });
});

describe("prior policy (X-04): independent of Big Five", () => {
  const nonzero = { bigfive: { traits: { O: { theta: 2 }, C: { theta: 1 }, A: { theta: -1 }, E: { theta: 1 }, N: { theta: -1 } } } };
  const zero = { bigfive: { traits: { O: { theta: 0 }, C: { theta: 0 }, A: { theta: 0 }, E: { theta: 0 }, N: { theta: 0 } } } };
  it("no prior, a zero prior and a nonzero prior give identical results", () => {
    const pick = (i: Item) => (i.reverse ? 3 : 4);
    const base = E.result(fixed(pick));
    expect(E.result(fixed(pick, zero))).toEqual(base);
    expect(E.result(fixed(pick, nonzero))).toEqual(base);
    expect(base.usedBigFive).toBe(false);
    expect(E.init(nonzero).prior).toEqual(NEUTRAL);
  });
  it("the documented mapping still exists (unapplied) and ignores non-finite inputs", () => {
    expect(priorFromBigFive(nonzero)!.O).toBe(1);
    expect(priorFromBigFive({ bigfive: { traits: { O: { theta: "x" } } } })!.O).toBe(0);
    expect(priorFromBigFive({})).toBeNull();
  });
  it("deserialize rejects malformed states", () => {
    const good = JSON.parse(E.serialize(fixed(() => 4)));
    const bad = (f: (o: any) => void) => { const o = structuredClone(good); f(o); return JSON.stringify(o); };
    expect(() => E.deserialize(JSON.stringify(good))).not.toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[0].itemId = "q1"; }))).toThrow(/Unknown/);
    expect(() => E.deserialize(bad(o => { o.answers[1] = { ...o.answers[0] }; }))).toThrow(/Duplicate/);
    expect(() => E.deserialize(bad(o => { o.answers[0].x = 0; }))).toThrow(/Invalid/);
    expect(() => E.deserialize(bad(o => { o.prior.M = "1"; }))).toThrow(/finite/);
  });
});

describe("fixed form (engine-motives)", () => {
  it("prints the whole bank once and finishes when answered in any order", () => {
    let s = E.init({});
    const form = E.form(s);
    expect(form).toHaveLength(28);
    expect(new Set(form.map(v => v.id)).size).toBe(28);
    for (const v of [...form].reverse()) s = E.answer(s, v.id, 4);
    expect(E.next(s)).toBeNull();
    expect(E.bioTokens(s)).toHaveLength(1);
  });
});

describe("QA audit: MOTIVES boundary rules, dominance ties, explanations, and incomplete inputs", () => {
  it("test_motives_letter_strong_low_boundary_0_2_returns_uppercase_pole", () => {
    // THRESHOLDS.motives.strong = 0.8: "Uppercase at ≥ strong (or ≤ 1 − strong)", i.e. level <= 0.20 -> uppercase low pole.
    expect(motivesLetter(0.8, ["M", "A"])).toBe("M");
    expect(motivesLetter(0.2, ["M", "A"])).toBe("A");
  });

  it("test_motives_dominance_gap_0_05_consistent_across_equal_gaps", () => {
    // THRESHOLDS.motives.dominanceGap = 0.05: two pairs separated by the exact same 0.05 level gap must behave identically.
    const a = motivesDominance([0.65, 0.60, 0.5, 0.5, 0.5, 0.5, 0.5]);
    const b = motivesDominance([0.70, 0.65, 0.5, 0.5, 0.5, 0.5, 0.5]);
    expect(b.index).toBe(a.index);
  });

  it("test_motives_explain_low_pole_confidence_and_supporting_evidence", () => {
    // 3 low-pole answers (keyed 1) + 1 opposing high-pole answer (m1 = 5) on M -> Ascetic ('a').
    // explain() concludes 'a' so confidence must be 1 - pHigh and supporting items must lead topEvidence.
    const s = fixed(i => {
      if (i.scale !== "M") return 3;
      if (i.id === "m1") return 5;
      return i.reverse ? 5 : 1;
    });
    const r = E.result(s);
    const exM = E.explain(s)[0]!;
    expect(r.traits.M.lean).toBe("low");
    expect(exM.result).toMatch(/^[aA] /);
    expect(exM.confidence).toBeCloseTo(1 - r.traits.M.pHigh, 6);
    expect(exM.topEvidence[0]!.itemId).not.toBe("m1");
  });

  it("test_motives_percentile_80_matches_uppercase_strong_threshold", () => {
    // Keyed [1, 4, 5, 5] yields percentile === 80 (>= 80th rule), so letter must be uppercase 'M'.
    const seq = [1, 4, 5, 5];
    let k = 0;
    const s = fixed(i => {
      if (i.scale !== "M") return 3;
      const keyed = seq[k++]!;
      return i.reverse ? 6 - keyed : keyed;
    });
    expect(E.result(s).traits.M.percentile).toBe(80);
    expect(E.result(s).traits.M.letter).toBe("M");
  });

  it("test_motives_boundaries_medium_0_4_and_0_6_and_low_pole_dominance_bars", () => {
    expect(motivesLetter(0.199, ["M", "A"])).toBe("A");
    expect(motivesLetter(0.4, ["M", "A"])).toBe("a");
    expect(motivesLetter(0.401, ["M", "A"])).toBe("X");
    expect(motivesLetter(0.599, ["M", "A"])).toBe("X");
    expect(motivesLetter(0.6, ["M", "A"])).toBe("m");
    expect(motivesLetter(0.8, ["M", "A"])).toBe("M");
    const r = E.result(fixed(i => (i.scale === "S" ? (i.reverse ? 5 : 1) : 3)));
    expect(r.code).toBe("XXXXXX|G|");
    expect(r.dominant).toEqual({ trait: "S", candidates: ["S"] });
  });

  it("test_motives_empty_and_partial_state_unresolved_traits_and_incomplete_note", () => {
    const s0 = E.init({});
    const r0 = E.result(s0);
    expect(r0.code).toBe("XXXXXXX");
    expect(r0.meta.unresolved).toHaveLength(7);
    expect(r0.meta.quality.map(q => q.code)).toEqual(["incomplete"]);
    expect(E.bioTokens(s0)).toEqual([]);

    const s1 = E.answer(s0, "m1", 5);
    const r1 = E.result(s1);
    expect(r1.meta.completion).toEqual({ answered: 1, total: 28, complete: false });
    expect(r1.meta.unresolved).toHaveLength(6);
  });

  it("test_motives_prior_from_bigfive_all_mapped_traits_formula", () => {
    const p = priorFromBigFive({
      bigfive: { traits: { O: { theta: 2 }, C: { theta: -1 }, A: { theta: 0.8 }, E: { theta: 1.4 }, N: { theta: -0.6 } } },
    })!;
    expect(p.M).toBe(0);
    expect(p.O).toBeCloseTo(1.0, 9);
    expect(p.T).toBeCloseTo(-0.5, 9);
    expect(p.I).toBeCloseTo(0.4, 9);
    expect(p.V).toBeCloseTo(0.5 * (2.0 / Math.SQRT2), 9);
    expect(p.E).toBe(0);
    expect(p.S).toBe(0);
  });
});
