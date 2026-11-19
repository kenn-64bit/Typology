import { describe, expect, it } from "vitest";
import { CENTERS, centerOf, enneagramEngine as E, legalTritypes, PICK_ID, TYPES, wingsOf } from "./index.ts";

type Persona = { core: number; wing: number; tri: number[]; stacking: string[]; pick?: number };
/** Agree with own-type statements, mildly with wing/tritype types, disagree otherwise; answer the form in reverse. */
function run(p: Persona) {
  let s = E.init({});
  for (const v of [...E.form(s)].reverse()) {
    if (v.format === "rank") s = E.answer(s, v.id, p.stacking);
    else if (v.id === PICK_ID) s = E.answer(s, v.id, p.pick ?? p.core);
    else {
      const t = Number(v.id[2]);
      s = E.answer(s, v.id, t === p.core ? 5 : t === p.wing ? 4 : t === p.tri[0] ? 4 : t === p.tri[1] ? 3 : 1);
    }
  }
  return s;
}
/** Every statement answered `x`, paragraph `pick`, instinct rankings from `ranks` (cycled). */
function uniform(x: number, pick: number, ranks: string[][] = [["sp", "so", "sx"]]) {
  let s = E.init({}); let k = 0;
  for (const v of E.form(s)) s = E.answer(s, v.id, v.format === "rank" ? ranks[k++ % ranks.length]! : v.id === PICK_ID ? pick : x);
  return s;
}
/** Legal-structure check for any (possibly partial) candidate tritype string. */
function legalPartial(core: number, tri: string) {
  const digits = [...tri.replace(/[()?]/g, "")].map(Number);
  expect(digits[0]).toBe(core);
  expect(new Set(digits.map(centerOf)).size).toBe(digits.length);
}

describe("Enneagram engine (fixed form)", () => {
  it("form: 27 statements + 1 description pick + 4 instinct rankings, all original", () => {
    const f = E.form(E.init({}));
    expect(f).toHaveLength(32);
    expect(f.filter(v => v.format === "likert5")).toHaveLength(27);
    expect(f.filter(v => v.format === "rank")).toHaveLength(4);
    expect(f.find(v => v.id === PICK_ID)!.options).toHaveLength(9);
  });
  it("rules: wings are neighbours, 18 legal tritypes per core", () => {
    expect(wingsOf(1)).toEqual([9, 2]); expect(wingsOf(9)).toEqual([8, 1]);
    for (let c = 1; c <= 9; c++) for (const t of legalTritypes(c)) { expect(t[0]).toBe(String(c)); expect(new Set([...t].map(d => centerOf(Number(d)))).size).toBe(3); }
  });
  it("scripted persona → 6w5, sp/so/sx, 638", () => {
    const s = run({ core: 6, wing: 5, tri: [3, 8], stacking: ["sp", "so", "sx"] });
    const r = E.result(s);
    expect([r.core, r.wing, r.stacking, r.tritype]).toEqual([6, 5, "sp/so/sx", "638"]);
    expect(r.selfPick).toEqual({ type: 6, statementP: r.coreP, agrees: true });
    expect(E.bioTokens(s).map(t => t.text)).toEqual(["sp/so/sx", "638 (6w5)"]);
  });
  it("every core type is reachable with a legal wing and tritype", () => {
    for (const core of TYPES) {
      const [w] = wingsOf(core);
      const others = (Object.keys(CENTERS) as (keyof typeof CENTERS)[]).filter(c => c !== centerOf(core)).map(c => CENTERS[c].find(t => !wingsOf(core).includes(t))!);
      const r = E.result(run({ core, wing: w, tri: others, stacking: ["sx", "sp", "so"] }));
      expect(r.core).toBe(core); expect(r.wing).toBe(w);
      // A wing type that is also in a tritype center can split that center → "?"; otherwise a full legal code.
      if (/[?(]/.test(r.tritype!)) legalPartial(core, r.tritype!); else expect(legalTritypes(core)).toContain(r.tritype);
    }
  });
  it("deterministic varied answers always give legal (possibly partial) structures", () => {
    for (let k = 0; k < 60; k++) {
      let s = E.init({}); let h = k * 2654435761 >>> 0;
      const rnd = (n: number) => { h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h % n; };
      for (const v of E.form(s)) {
        const opts = v.options!.map(o => o.id);
        s = E.answer(s, v.id, v.format === "rank" ? [...opts].sort((a, b) => (a < b ? -1 : 1) * (rnd(2) ? 1 : -1)).slice(0, 3) : v.id === PICK_ID ? 1 + rnd(9) : 1 + rnd(5));
      }
      const r = E.result(s);
      if (r.core !== null) {
        if (r.wing !== null) expect(wingsOf(r.core)).toContain(r.wing);
        legalPartial(r.core, r.tritype!);
      } else { expect(r.wing).toBeNull(); expect(r.tritype).toBeNull(); }
      if (r.stacking) expect(r.stacking.split("/").sort()).toEqual(["so", "sp", "sx"]);
    }
  });
  it("tokens only when the whole form is answered; serialize round-trips; explain ≤ 3", () => {
    let s = E.init({});
    expect(E.bioTokens(s)).toEqual([]);
    s = run({ core: 4, wing: 5, tri: [9, 6], stacking: ["sx", "so", "sp"] });
    expect(E.bioTokens(s)).toHaveLength(2);
    expect(E.deserialize(E.serialize(s))).toEqual(s);
    for (const x of E.explain(s)) expect(x.topEvidence.length).toBeLessThanOrEqual(3);
  });
  it("rejects invalid answers", () => {
    expect(() => E.answer(E.init({}), "s:1a", 6)).toThrow();
    expect(() => E.answer(E.init({}), PICK_ID, 10)).toThrow();
    expect(() => E.answer(E.init({}), "inst:in1", ["sp"])).toThrow();
  });
});

describe("EN-01: the paragraph pick does not manufacture core confidence", () => {
  for (const x of [3, 4, 2]) {
    it(`uniform statements (${x}) + paragraph pick → no core; the pick is shown separately`, () => {
      const r = E.result(uniform(x, 1));
      expect(r.core).toBeNull();
      expect(r.coreP).toBeCloseTo(1 / 9, 9);
      expect(r.coreCandidates).toHaveLength(9);
      expect(r.selfPick).toEqual({ type: 1, statementP: expect.closeTo(1 / 9, 9), agrees: null });
      expect(r.wing).toBeNull(); expect(r.tritype).toBeNull();
      expect(r.meta.unresolved).toContain("core type");
      expect(r.meta.quality.map(q => q.code)).toContain("straight-line");
      expect(E.bioTokens(uniform(x, 1)).map(t => t.slot)).not.toContain("tritype");
    });
  }
  it("the pick has no effect on the statement-based core", () => {
    const base = { core: 2, wing: 3, tri: [8, 5], stacking: ["so", "sp", "sx"] };
    const a = E.result(run(base)), b = E.result(run({ ...base, pick: 7 }));
    expect(b.core).toBe(a.core); expect(b.coreP).toBe(a.coreP);
    expect(b.selfPick!.agrees).toBe(false);
  });
});

describe("EN-03 / EN-04: wing and tritype honesty", () => {
  it("tied neighbours → w? in the result and the token", () => {
    // core 8 strongly; neighbours 7 and 9 answered identically.
    let s = E.init({});
    for (const v of E.form(s)) {
      if (v.format === "rank") { s = E.answer(s, v.id, ["sp", "so", "sx"]); continue; }
      if (v.id === PICK_ID) { s = E.answer(s, v.id, 8); continue; }
      const t = Number(v.id[2]);
      s = E.answer(s, v.id, t === 8 ? 5 : t === 7 || t === 9 ? 3 : t === 2 || t === 5 ? 4 : 1);
    }
    const r = E.result(s);
    expect(r.core).toBe(8);
    expect(r.wing).toBeNull();
    expect(r.wingP).toBeCloseTo(0.5, 9);
    expect(E.bioTokens(s).find(t => t.slot === "tritype")!.text).toMatch(/\(8w\?\)$/);
    expect(r.meta.uncertainty.find(u => u.output === "wing")!.kind).toBe("heuristic");
  });
  it("tied types inside a center → '?' digit; close secondaries → uncertain order", () => {
    const tie = E.result(run({ core: 1, wing: 2, tri: [0, 0], stacking: ["sp", "so", "sx"] })); // 3,4 and 5,6,7 all low
    expect(tie.core).toBe(1);
    expect(tie.tritype).toMatch(/\?/);
    legalPartial(1, tie.tritype!);
    // equal support for 3 and 7 → both centers resolve, order does not
    let s = E.init({});
    for (const v of E.form(s)) {
      if (v.format === "rank") { s = E.answer(s, v.id, ["sp", "so", "sx"]); continue; }
      if (v.id === PICK_ID) { s = E.answer(s, v.id, 1); continue; }
      const t = Number(v.id[2]);
      s = E.answer(s, v.id, t === 1 ? 5 : t === 3 || t === 7 ? 4 : 1);
    }
    const r = E.result(s);
    expect(r.tritype).toBe("1(37)");
    expect(r.tritypeOrderResolved).toBe(false);
    expect(r.meta.unresolved).toContain("tritype order");
    expect(r.meta.uncertainty.filter(u => u.output.endsWith("center")).every(u => u.kind === "heuristic")).toBe(true);
  });
});

describe("EN-05: instinct uncertainty", () => {
  it("conflicting instinct rankings → no full stacking, candidates kept", () => {
    const r = E.result(uniform(3, 1, [["sp", "so", "sx"], ["sx", "so", "sp"]]));
    expect(r.stacking).toBeNull();
    expect(r.stackingCandidates.length).toBeGreaterThan(1);
    expect(r.meta.unresolved).toContain("instinct order");
    expect(E.bioTokens(uniform(3, 1, [["sp", "so", "sx"], ["sx", "so", "sp"]])).find(t => t.slot === "instincts")).toBeUndefined();
  });
  it("consistent rankings resolve", () => {
    expect(E.result(uniform(3, 1)).stacking).toBe("sp/so/sx");
  });
  it("same first, conflicting rest → partial: first instinct only", () => {
    const r = E.result(uniform(3, 1, [["sp", "so", "sx"], ["sp", "sx", "so"]]));
    expect(r.stacking).toBeNull();
    expect(r.stackingFirst).toBe("sp");
  });
});

describe("answer replacement, order and validation (X-07, X-08)", () => {
  const P = { core: 3, wing: 4, tri: [1, 6], stacking: ["so", "sx", "sp"] };
  it("answer order does not change the result; replacement equals the direct answer", () => {
    let fwd = E.init({});
    const rev = run(P);
    for (const a of [...rev.answers].reverse()) fwd = E.answer(fwd, a.itemId, a.r);
    expect(E.result(fwd)).toEqual(E.result(rev));
    const replaced = E.answer(E.answer(rev, "s:3a", 1), "s:3a", 5);
    expect(E.result(replaced)).toEqual(E.result(rev));
  });
  it("deserialize rejects malformed states", () => {
    const good = JSON.parse(E.serialize(run(P)));
    const bad = (f: (o: any) => void) => { const o = structuredClone(good); f(o); return JSON.stringify(o); };
    expect(() => E.deserialize(JSON.stringify(good))).not.toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[0].itemId = "s:0z"; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers.push({ ...o.answers[0] }); }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers.find((a: any) => a.itemId === PICK_ID).r = 0; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers.find((a: any) => a.itemId.startsWith("inst:")).r = ["sp", "sp", "so"]; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers.find((a: any) => a.itemId.startsWith("s:")).r = 3.5; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.v = 1; }))).toThrow();
  });
  it("scoring version and completion", () => {
    const r = E.result(run(P));
    expect(r.meta.scoringVersion).toBe("enneagram-3");
    expect(r.meta.completion).toEqual({ answered: 32, total: 32, complete: true });
  });
});
