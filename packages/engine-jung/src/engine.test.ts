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
