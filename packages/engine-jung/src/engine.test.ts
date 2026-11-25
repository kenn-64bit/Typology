import { describe, expect, it } from "vitest";
import { FUNCS, ITEMS, jungEngine as E, mbtiStack, pMaximum, SCALES } from "./index.ts";

/** Adaptive run. lean per scale/function: +k agree-keyed, −k disagree-keyed, 0 neutral. */
function run(lean: Record<string, number>, profile: Record<string, unknown> = {}) {
  let s = E.init(profile);
  for (let v = E.next(s); v; v = E.next(s)) {
    const it = ITEMS.find(i => i.id === v.id)!;
    const l = lean[it.scale] ?? 0; const keyed = Math.max(1, Math.min(5, 3 + l));
    s = E.answer(s, v.id, it.reverse ? 6 - keyed : keyed);
  }
  return s;
}
type Item = (typeof ITEMS)[number];
/** Fixed form, every item; `pick` returns the RAW answer. */
function fixed(pick: (i: Item) => number, profile: Record<string, unknown> = {}, reverse = false) {
  let s = E.init(profile);
  const form = E.form(s);
  for (const v of reverse ? [...form].reverse() : form) s = E.answer(s, v.id, pick(ITEMS.find(i => i.id === v.id)!));
  return s;
}
/** Keyed answer 3 + lean, mapped back to raw for reverse items. */
const keyed = (lean: Record<string, number>) => (i: Item) => { const k = Math.max(1, Math.min(5, 3 + (lean[i.scale] ?? 0))); return i.reverse ? 6 - k : k; };
/** first listed function = +2, others listed = +1, rest −2 */
const fn = (high: string[]) => Object.fromEntries(FUNCS.map(f => [f, f === high[0] ? 2 : high.includes(f) ? 1 : -2]));

describe("Jung engine", () => {
  it("48 original items: 6 per preference scale balanced 3:3, 3 per function", () => {
    expect(ITEMS).toHaveLength(48);
    for (const sc of Object.keys(SCALES)) {
      expect(ITEMS.filter(i => i.scale === sc)).toHaveLength(6);
      expect(ITEMS.filter(i => i.scale === sc && i.reverse)).toHaveLength(3);
    }
    for (const f of FUNCS) expect(ITEMS.filter(i => i.scale === f)).toHaveLength(3);
  });
  it("letters follow the scale answers; stack is interpretation of those letters", () => {
    const r = E.result(fixed(keyed({ EI: -2, SN: 2, TF: 2, JP: -2, ...fn(["Ti", "Ne"]) })));
    expect(r.mbti).toBe("INTP");
    expect(r.mbtiStack).toEqual(["Ti", "Ne"]);
  });
  it("code comes from function scores and may be non-MBTI (Fi + Si) — JG-05 preserved", () => {
    const r = E.result(fixed(keyed({ EI: -2, SN: -2, TF: -2, JP: 2, ...fn(["Fi", "Si"]) })));
    expect(r.code).toBe("IF(S) (FiSi)");
    expect(r.mbti).toBe("ISFJ");
    expect(r.mbtiStack).toEqual(["Si", "Fe"]); // differs from the function code, and that is allowed
  });
  it("mbtiStack conventions", () => {
    expect(mbtiStack("ENFJ")).toEqual(["Fe", "Ni"]);
    expect(mbtiStack("ISTJ")).toEqual(["Si", "Te"]);
    expect(mbtiStack("ESTP")).toEqual(["Se", "Ti"]);
  });
  it("adaptive path still finishes and gives a token when the roles resolve", () => {
    expect(E.bioTokens(E.init({}))).toEqual([]);
    const s = run({ EI: -2, SN: 2, TF: 2, JP: -2, Ti: 2, Ne: 1, Te: -2, Fi: -2, Fe: -2, Si: -2, Se: -2, Ni: -2 });
    expect(E.bioTokens(s)[0]!.text).toBe("IT(N) (TiNe)");
    expect(E.deserialize(E.serialize(s))).toEqual(s);
    for (const x of E.explain(s)) expect(x.topEvidence.length).toBeLessThanOrEqual(3);
  });
});

describe("JG-01 / JG-04: unresolved and separate roles", () => {
  it("all-Neutral: no dominant/auxiliary code, all eight are candidates, bars are not maximal", () => {
    const r = E.result(fixed(() => 3));
    expect(r.code).toBe("unresolved");
    expect(r.dominant.f).toBeNull();
    expect(r.dominant.candidates).toHaveLength(8);
    for (const f of r.functions) { expect(f.percentile).toBe(50); expect(f.pTop).toBeCloseTo(1 / 8, 6); }
    expect(r.mbti).toBe("XXXX");
    expect(r.mbtiStack).toBeNull();
    expect(r.meta.unresolved).toContain("dominant function");
    expect(E.bioTokens(fixed(() => 3))).toEqual([]);
  });
  it("clear dominant with tied auxiliaries → partial code, auxiliary unresolved", () => {
    const r = E.result(fixed(keyed({ Ti: 2, Te: -2, Fi: -2, Fe: -2, Si: 0, Se: 0, Ni: 0, Ne: 0 })));
    expect(r.dominant.f).toBe("Ti");
    expect(r.auxiliary.f).toBeNull();
    expect(r.auxiliary.candidates.map(c => c.f).sort()).toEqual(["Ne", "Ni", "Se", "Si"]);
    expect(r.code).toBe("IT(?) (Ti)");
    expect(r.meta.unresolved).toContain("auxiliary function");
  });
  it("dominant and auxiliary report different probabilities with named events", () => {
    const r = E.result(fixed(keyed({ Ti: 2, Ne: 1, Te: -2, Fi: -2, Fe: -2, Si: -2, Se: -2, Ni: -1 })));
    expect(r.dominant.f).toBe("Ti");
    expect(r.auxiliary.f).toBe("Ne");
    const ex = E.explain(fixed(keyed({ Ti: 2, Ne: 1, Te: -2, Fi: -2, Fe: -2, Si: -2, Se: -2, Ni: -1 })));
    const [d, a] = ex;
    expect(d!.confidenceEvent).not.toBe(a!.confidenceEvent);
    expect(d!.confidence).toBe(r.dominant.p);
    expect(a!.confidence).toBe(r.auxiliary.p);
  });
  it("pMaximum: equal inputs give equal outputs; a clear leader dominates; sums to 1", () => {
    const eq = pMaximum([{ mu: 0, sd: 0.5 }, { mu: 0, sd: 0.5 }, { mu: 0, sd: 0.5 }]);
    expect(eq.every(p => Math.abs(p - 1 / 3) < 1e-9)).toBe(true);
    const lead = pMaximum([{ mu: 2, sd: 0.3 }, { mu: 0, sd: 0.3 }]);
    expect(lead[0]).toBeGreaterThan(0.99);
    expect(lead[0]! + lead[1]!).toBeCloseTo(1, 9);
    // two independent normals: P(X1 > X2) = Φ(Δ / √(s1² + s2²))
    expect(pMaximum([{ mu: 0.5, sd: 0.4 }, { mu: 0, sd: 0.3 }])[0]).toBeCloseTo(0.8413447, 4);
  });
});

describe("JG-02: balanced preference keying", () => {
  for (const [x, label] of [[4, "Agree"], [2, "Disagree"], [5, "Strongly agree"], [1, "Strongly disagree"]] as const) {
    it(`raw all-${label}: no letter, no function role; straight-line noted`, () => {
      const r = E.result(fixed(() => x));
      expect(r.mbti).toBe("XXXX");
      for (const sc of Object.keys(SCALES) as (keyof typeof SCALES)[]) expect(Math.abs(r.letters[sc].theta)).toBeLessThan(1e-9);
      expect(r.dominant.f).toBeNull(); // all functions lifted together → tie, not a type
      expect(r.meta.quality.some(q => q.code === "straight-line")).toBe(true);
    });
  }
});

describe("prior policy and validation", () => {
  it("no prior, a zero prior and a nonzero Big Five E give identical results", () => {
    const pick = keyed({ EI: 1, Ti: 1 });
    const base = E.result(fixed(pick));
    expect(E.result(fixed(pick, { bigfive: { traits: { E: { theta: 0 } } } }))).toEqual(base);
    expect(E.result(fixed(pick, { bigfive: { traits: { E: { theta: 2 } } } }))).toEqual(base);
    expect(base.usedBigFive).toBe(false);
  });
  it("answer order and replacement do not change the result", () => {
    const pick = (i: Item) => ((i.id.charCodeAt(0) * 5 + i.id.charCodeAt(2)) % 5) + 1;
    expect(E.result(fixed(pick, {}, true))).toEqual(E.result(fixed(pick)));
    const s = E.answer(fixed(i => (i.id === "ni2" ? 1 : pick(i))), "ni2", pick(ITEMS.find(i => i.id === "ni2")!));
    expect(E.result(s)).toEqual(E.result(fixed(pick)));
  });
  it("deserialize rejects malformed states", () => {
    const good = JSON.parse(E.serialize(fixed(() => 4)));
    const bad = (f: (o: any) => void) => { const o = structuredClone(good); f(o); return JSON.stringify(o); };
    expect(() => E.deserialize(JSON.stringify(good))).not.toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[0].x = 6; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[0].itemId = "xx1"; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[1] = { ...o.answers[0] }; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.prior = { EI: Number.NaN }; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.prior = { ZZ: 1 }; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.v = 2; }))).toThrow();
  });
  it("result carries scoring version and completion", () => {
    const r = E.result(fixed(() => 4));
    expect(r.meta.scoringVersion).toBe("jung-2");
    expect(r.meta.completion).toEqual({ answered: 48, total: 48, complete: true });
  });
});

describe("fixed form (engine-jung)", () => {
  it("prints the whole bank once and finishes when answered in any order", () => {
    let s = E.init({});
    const form = E.form(s);
    expect(form).toHaveLength(48);
    expect(new Set(form.map(v => v.id)).size).toBe(48);
    for (const v of [...form].reverse()) s = E.answer(s, v.id, 4);
    expect(E.next(s)).toBeNull();
  });
});

/** Exact 48-answer respondent reconstructed from Images 2, 3, 4, and 5. */
function image2To5State() {
  const ans: Record<string, number> = {
    ei1: 5, ei2: 5, ei3: 1, ei4: 5, ei5: 1, ei6: 5,
    sn1: 5, sn2: 5, sn3: 5, sn4: 5, sn5: 1, sn6: 5,
    tf1: 1, tf2: 5, tf3: 5, tf4: 1, tf5: 5, tf6: 5,
    jp1: 5, jp2: 5, jp3: 5, jp4: 4, jp5: 4, jp6: 3,
    ne1: 5, ne2: 5, ne3: 5,
    fi1: 5, fi2: 5, fi3: 4,
    si1: 5, si2: 5, si3: 4,
    ti1: 5, ti2: 5, ti3: 3,
    se1: 5, se2: 5, se3: 3,
    ni1: 5, ni2: 5, ni3: 3,
    fe1: 5, fe2: 5, fe3: 2,
    te1: 5, te2: 5, te3: 1,
  };
  let s = E.init({});
  for (const [id, x] of Object.entries(ans)) s = E.answer(s, id, x);
  return s;
}

describe("QA audit: Jung Images 2–5 mismatches, explanations, quality notes, and boundaries", () => {
  it("test_jung_image2_to_5_unresolved_dominant_explain_includes_function_evidence", () => {
    // Images 2–5: hero result is "no clear main function" (code: "unresolved"), yet explain() omits all 24 function
    // answers and returns only the 4 separate MBTI preference scales.
    const s = image2To5State();
    const r = E.result(s);
    expect(r.code).toBe("unresolved");
    const ex = E.explain(s);
    expect(ex.some(e => /function|dominant|Ne/i.test(e.output))).toBe(true);
  });

  it("test_jung_image4_explain_low_pole_S_and_I_ranks_supporting_answers_positive", () => {
    // Image 4 shows e/i = I (100%) and n/s = S (96%), yet topEvidence lists E-supporting ei1 (+0.46) and
    // N-supporting sn1/sn3 (+0.50) at the top while S/I-supporting answers appear below with negative deltas.
    const ex = E.explain(image2To5State());
    const ei = ex.find(e => e.output === "E / I")!;
    const sn = ex.find(e => e.output === "N / S")!;
    expect(ei.result).toBe("I");
    expect(sn.result).toBe("S");
    expect(ei.topEvidence[0]!.itemId).not.toBe("ei1");
    expect(["sn1", "sn3"]).not.toContain(sn.topEvidence[0]!.itemId);
  });

  it("test_jung_image4_jp_resolved_preference_note_and_tf_polarized_conflict", () => {
    // Images 2–5: J/P resolves to J, yet notes claim "J/P ... sits near the middle", while T/F is X from 3 extreme T
    // answers cancelling 3 extreme F answers with no conflict note.
    const r = E.result(image2To5State());
    expect(r.letters.JP.letter).toBe("J");
    expect(r.letters.TF.letter).toBe("X");
    const jpNote = r.meta.quality.find(q => q.output === "J/P");
    expect(jpNote?.message ?? "").not.toMatch(/sits near the middle/);
    expect(r.meta.quality.some(q => q.output === "T/F")).toBe(true);
  });

  it("test_jung_mbtiStack_rejects_unresolved_X_letter", () => {
    // Images 2–3 produce mbti = "ISXJ"; exported mbtiStack("ISXJ") must not return invalid function code "Xe".
    expect(() => mbtiStack("ISXJ")).toThrow();
  });

  it("test_jung_image2_candidates_threshold_0_10_filters_functions", () => {
    // Matches Images 2 & 3 breakdown: Ne (42%), Fi (14%), Si (14%) are candidates (>= 0.10); Ti/Se/Ni (7%), Fe (5%), Te (4%) excluded.
    const r = E.result(image2To5State());
    expect(r.mbti).toBe("ISXJ");
    expect(r.mbtiStack).toBeNull();
    expect(r.dominant.candidates.map(c => c.f)).toEqual(["Ne", "Fi", "Si"]);
    expect(Math.round(r.functions.find(f => f.f === "Ne")!.pTop * 100)).toBe(42);
    expect(r.functions.map(f => f.percentile)).toEqual([97, 91, 91, 86, 86, 86, 81, 77]);
  });

  it("test_jung_all_16_mbti_stacks_valid_functions_and_opposite_axes", () => {
    for (const ei of ["E", "I"]) for (const sn of ["S", "N"]) for (const tf of ["T", "F"]) for (const jp of ["J", "P"]) {
      const [dom, aux] = mbtiStack(`${ei}${sn}${tf}${jp}`);
      expect(FUNCS).toContain(dom);
      expect(FUNCS).toContain(aux);
      expect(dom[1]).toBe(ei.toLowerCase());
      expect(aux[1]).not.toBe(dom[1]);
      const isJudge = (f: string) => f[0] === "T" || f[0] === "F";
      expect(isJudge(dom)).not.toBe(isJudge(aux));
    }
  });

  it("test_jung_empty_state_all_roles_and_preferences_unresolved", () => {
    const s0 = E.init({});
    const r = E.result(s0);
    expect(r.code).toBe("unresolved");
    expect(r.mbti).toBe("XXXX");
    expect(r.meta.unresolved).toEqual(["dominant function", "E/I preference", "N/S preference", "T/F preference", "J/P preference"]);
    expect(r.meta.quality.map(q => q.code)).toEqual(["incomplete"]);
  });
});
