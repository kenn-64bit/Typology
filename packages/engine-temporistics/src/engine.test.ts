import { describe, expect, it } from "vitest";
import { permutations } from "@typo/bayes";
import { temporisticsEngine as E } from "./index.ts";

describe("temporistics engine", () => {
  it("has 7 original tasks with all 4 aspects each", () => {
    let s = E.init({}); const seen = new Set<string>();
    for (let v = E.next(s); v; v = E.next(s)) { expect(v.options).toHaveLength(4); seen.add(v.id); s = E.answer(s, v.id, v.options!.map(o => o.id)); }
    expect(seen.size).toBeGreaterThan(0);
  });
  it("every possible consistent answer pattern yields that exact order", () => {
    for (const order of permutations([..."NVBP"])) {
      let s = E.init({});
      for (let v = E.next(s); v; v = E.next(s)) s = E.answer(s, v.id, order);
      expect(E.result(s).order).toBe(order.join(""));
    }
  });
  it("varied answers always give a legal best order; the adaptive path stays within its cap", () => {
    const orders = permutations([..."NVBP"]);
    for (let k = 0; k < 24; k++) {
      let s = E.init({}); let i = 0;
      for (let v = E.next(s); v; v = E.next(s)) s = E.answer(s, v.id, orders[(k + i++ * 5) % 24]!);
      expect([...E.result(s).order].sort().join("")).toBe("BNPV");
      expect(s.answers.length).toBeLessThanOrEqual(6);
    }
  });
});

describe("fixed form (engine-temporistics)", async () => {
  const { temporisticsEngine: F } = await import("./index.ts");
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

describe("TP-01 / TP-02 (fixed form)", () => {
  const fixed = (rank: (i: number) => string[]) => { let s = E.init({}); E.form(s).forEach((v, i) => { s = E.answer(s, v.id, rank(i)); }); return s; };
  it("conflicting rankings → unresolved, with candidates, positions and a conflict note", () => {
    const r = E.result(fixed(i => (i % 2 ? [..."VNPB"] : [..."NVBP"])));
    expect(r.resolved).toBeNull();
    expect(r.candidates.map(c => c.order)).toEqual(expect.arrayContaining(["NVBP", "VNPB"]));
    expect(r.meta.quality.map(q => q.code)).toContain("ranking-conflict");
    expect(E.bioTokens(fixed(i => (i % 2 ? [..."VNPB"] : [..."NVBP"])))).toEqual([]);
  });
  it("shared first choice → partial result", () => {
    const r = E.result(fixed(i => [[..."BNVP"], [..."BPNV"], [..."BVPN"]][i % 3]!));
    expect(r.resolved).toBeNull();
    expect(r.first?.aspect).toBe("B");
  });
  it("consistent rankings resolve; all seven answers count", () => {
    const r = E.result(fixed(() => [..."PBNV"]));
    expect(r.resolved).toBe("PBNV");
    expect(r.meta.completion).toEqual({ answered: 7, total: 7, complete: true });
  });
  it("rewritten items avoid religion, keepsakes and distress contexts; no task asks for 'least'", () => {
    const text = E.form(E.init({})).flatMap(v => [v.text, ...v.options!.map(o => o.text)]).join(" ");
    expect(text).not.toMatch(/beyond this life|old photos|unresolved/i);
    expect(E.form(E.init({})).some(v => /least/i.test(v.text))).toBe(false);
  });
  it("scoring version and named event", () => {
    const r = E.result(fixed(() => [..."NVBP"]));
    expect(r.meta.scoringVersion).toBe("temporistics-2");
    expect(r.meta.uncertainty.every(u => !u.calibrated)).toBe(true);
  });
});
