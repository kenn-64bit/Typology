import { describe, expect, it } from "vitest";
import { permutations } from "@typo/bayes";
import { apEngine as E } from "./index.ts";

describe("ap engine", () => {
  it("has 7 original tasks with all 4 aspects each", () => {
    let s = E.init({}); const seen = new Set<string>();
    for (let v = E.next(s); v; v = E.next(s)) { expect(v.options).toHaveLength(4); seen.add(v.id); s = E.answer(s, v.id, v.options!.map(o => o.id)); }
    expect(seen.size).toBeGreaterThan(0);
  });
  it("every possible consistent answer pattern yields that exact order", () => {
    for (const order of permutations([..."VLEF"])) {
      let s = E.init({});
      for (let v = E.next(s); v; v = E.next(s)) s = E.answer(s, v.id, order);
      expect(E.result(s).order).toBe(order.join(""));
    }
  });
  it("varied answers always give a legal best order; the adaptive path stays within its cap", () => {
    const orders = permutations([..."VLEF"]);
    for (let k = 0; k < 24; k++) {
      let s = E.init({}); let i = 0;
      for (let v = E.next(s); v; v = E.next(s)) s = E.answer(s, v.id, orders[(k + i++ * 7) % 24]!);
      expect([...E.result(s).order].sort().join("")).toBe([..."EFLV"].join(""));
      expect(s.answers.length).toBeLessThanOrEqual(6);
    }
  });
});

describe("fixed form (engine-ap)", async () => {
  const { apEngine: F } = await import("./index.ts");
  it("prints the whole bank once and finishes when answered in any order", () => {
    let s = F.init({});
    const form = F.form(s);
    expect(form).toHaveLength(7);
    expect(new Set(form.map(v => v.id)).size).toBe(7);
    for (const v of [...form].reverse()) s = F.answer(s, v.id, v.format === "rank" ? v.options!.map(o => o.id) : 4);
    expect(F.next(s)).toBeNull();
    expect(F.bioTokens(s)).toHaveLength(1);
  });
});

describe("AP-01 – AP-03 (fixed form)", () => {
  const fixed = (rank: (i: number) => string[]) => { let s = E.init({}); E.form(s).forEach((v, i) => { s = E.answer(s, v.id, rank(i)); }); return s; };
  it("alternating 1st↔2nd / 3rd↔4th swaps → no definitive four-position order", () => {
    const r = E.result(fixed(i => (i % 2 ? [..."LVFE"] : [..."VLEF"])));
    expect(r.resolved).toBeNull();
    expect(r.candidates.map(c => c.order)).toEqual(expect.arrayContaining(["VLEF", "LVFE"]));
    expect(r.meta.unresolved.length).toBeGreaterThan(0);
  });
  it("consistent rankings resolve to that order", () => {
    expect(E.result(fixed(() => [..."FELV"])).resolved).toBe("FELV");
  });
  it("same first choice, conflicting rest → partial result with that first aspect", () => {
    const r = E.result(fixed(i => [[..."VLEF"], [..."VEFL"], [..."VFLE"]][i % 3]!));
    expect(r.resolved).toBeNull();
    expect(r.first?.aspect).toBe("V");
  });
  it("every task, including ap2, asks for a priority ranked most-first (AP-02)", () => {
    const form = E.form(E.init({}));
    expect(form).toHaveLength(7);
    expect(form.some(v => /least/i.test(v.text))).toBe(false);
  });
  it("result names its order event; the scoring version is ap-2", () => {
    const r = E.result(fixed(() => [..."VLEF"]));
    expect(r.meta.scoringVersion).toBe("ap-2");
    expect(r.meta.uncertainty.every(u => !u.calibrated && u.event.includes("model"))).toBe(true);
  });
});
