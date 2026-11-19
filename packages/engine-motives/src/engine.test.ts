import { describe, expect, it } from "vitest";
import { motivesEngine as E, ITEMS, TRAITS } from "./index.ts";

/** Answer as a respondent leaning to the high (+1) or low (−1) pole of each trait, or neutral (0). */
function run(lean: Record<string, -1 | 0 | 1>, profile: Record<string, unknown> = {}) {
  let s = E.init(profile);
  for (let v = E.next(s); v; v = E.next(s)) {
    const it = ITEMS.find(i => i.id === v.id)!;
    const l = lean[it.scale]!; const keyed = l === 0 ? 3 : l > 0 ? 5 : 1;
    s = E.answer(s, v.id, it.reverse ? 6 - keyed : keyed);
  }
  return s;
}

describe("MOTIVES engine", () => {
  it("21 items, 3 per trait, some reverse-keyed", () => {
    expect(ITEMS).toHaveLength(21);
    for (const t of TRAITS) expect(ITEMS.filter(i => i.scale === t)).toHaveLength(3);
    expect(ITEMS.filter(i => i.reverse).length).toBeGreaterThanOrEqual(7);
  });
  it("scripted leanings give the expected strong letters, in M-O-T-I-V-E-S order", () => {
    const s = run({ M: -1, O: 1, T: 1, I: -1, V: 1, E: -1, S: -1 });
    const code = E.result(s).code.replace(/\|/g, "");
    expect(code).toBe("AOTWVRG");
    expect(E.bioTokens(s)[0]!.slot).toBe("motives");
  });
  it("neutral answers give X in every position", () => {
    expect(E.result(run({ M: 0, O: 0, T: 0, I: 0, V: 0, E: 0, S: 0 })).code.replace(/\|/g, "")).toBe("XXXXXXX");
  });
  it("never asks more than 3 per trait; strong answers stop early", () => {
    const s = run({ M: 1, O: 1, T: 1, I: 1, V: 1, E: 1, S: 1 });
    expect(s.answers.length).toBeLessThanOrEqual(21);
    for (const t of TRAITS) expect(s.answers.filter(a => a.itemId[0] === t.toLowerCase()).length).toBeLessThanOrEqual(3);
  });
  it("works with and without a Big Five prior", () => {
    const bf = { bigfive: { traits: { O: { theta: 2 }, C: { theta: 1 }, A: { theta: -1 }, E: { theta: 1 }, N: { theta: -1 } } } };
    const a = run({ M: 0, O: 0, T: 0, I: 0, V: 0, E: 0, S: 0 }, bf);
    expect(E.result(a).usedBigFive).toBe(true);
    expect(E.result(a).traits.O.pHigh).toBeGreaterThan(0.5);
    expect(E.result(run({ M: 0, O: 0, T: 0, I: 0, V: 0, E: 0, S: 0 })).usedBigFive).toBe(false);
  });
  it("pure answer, serialize round-trip, explain ≤ 3 per trait", () => {
    const s0 = E.init({}); const v = E.next(s0)!; const s1 = E.answer(s0, v.id, 4);
    expect(s0.answers).toHaveLength(0);
    expect(E.deserialize(E.serialize(s1))).toEqual(s1);
    for (const x of E.explain(run({ M: 1, O: 1, T: 1, I: 1, V: 1, E: 1, S: 1 }))) expect(x.topEvidence.length).toBeLessThanOrEqual(3);
  });
});

describe("fixed form (engine-motives)", async () => {
  const { motivesEngine: F } = await import("./index.ts");
  it("prints the whole bank once and finishes when answered in any order", () => {
    let s = F.init({});
    const form = F.form(s);
    expect(form).toHaveLength(21);
    expect(new Set(form.map(v => v.id)).size).toBe(21);
    for (const v of [...form].reverse()) s = F.answer(s, v.id, v.format === "rank" ? v.options!.map(o => o.id) : 4);
    expect(F.next(s)).toBeNull();
    expect(F.bioTokens(s)).toHaveLength(1);
  });
});
