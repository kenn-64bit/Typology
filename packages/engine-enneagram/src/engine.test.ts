import { describe, expect, it } from "vitest";
import { CENTERS, centerOf, enneagramEngine as E, legalTritypes, PICK_ID, wingsOf } from "./index.ts";

type Persona = { core: number; wing: number; tri: number[]; stacking: string[] };
/** Agree with own-type statements, mildly with wing/tritype types, disagree otherwise; answer the form in reverse. */
function run(p: Persona) {
  let s = E.init({});
  for (const v of [...E.form(s)].reverse()) {
    if (v.format === "rank") s = E.answer(s, v.id, p.stacking);
    else if (v.id === PICK_ID) s = E.answer(s, v.id, p.core);
    else {
      const t = Number(v.id[2]);
      s = E.answer(s, v.id, t === p.core ? 5 : t === p.wing ? 4 : t === p.tri[0] ? 4 : t === p.tri[1] ? 3 : 1);
    }
  }
  return s;
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
  it("scripted persona → exact result 6w5, sp/so/sx, 638", () => {
    const s = run({ core: 6, wing: 5, tri: [3, 8], stacking: ["sp", "so", "sx"] });
    const r = E.result(s);
    expect([r.core, r.wing, r.stacking, r.tritype]).toEqual([6, 5, "sp/so/sx", "638"]);
    expect(E.bioTokens(s).map(t => t.text)).toEqual(["sp/so/sx", "638 (6w5)"]);
  });
  it("every core type is reachable with a legal wing and tritype", () => {
    for (let core = 1; core <= 9; core++) {
      const [w] = wingsOf(core);
      const others = (Object.keys(CENTERS) as (keyof typeof CENTERS)[]).filter(c => c !== centerOf(core)).map(c => CENTERS[c].find(t => !wingsOf(core).includes(t))!);
      const r = E.result(run({ core, wing: w, tri: others, stacking: ["sx", "sp", "so"] }));
      expect(r.core).toBe(core); expect(r.wing).toBe(w); expect(legalTritypes(core)).toContain(r.tritype);
    }
  });
  it("random answers always give legal output", () => {
    for (let k = 0; k < 100; k++) {
      let s = E.init({});
      for (const v of E.form(s)) s = E.answer(s, v.id, v.format === "rank" ? [...v.options!.map(o => o.id)].sort(() => Math.random() - 0.5) : v.id === PICK_ID ? 1 + Math.floor(Math.random() * 9) : 1 + Math.floor(Math.random() * 5));
      const r = E.result(s);
      expect(wingsOf(r.core)).toContain(r.wing);
      expect(r.stacking.split("/").sort()).toEqual(["so", "sp", "sx"]);
      expect(legalTritypes(r.core)).toContain(r.tritype);
    }
  });
  it("tokens only when the whole form is answered; serialize round-trips; explain ≤ 3", () => {
    let s = E.init({});
    expect(E.bioTokens(s)).toEqual([]);
    for (let v = E.next(s); v; v = E.next(s)) s = E.answer(s, v.id, v.format === "rank" ? v.options!.map(o => o.id) : v.id === PICK_ID ? 4 : 3);
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
