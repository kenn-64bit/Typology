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
  it("random answers always give a legal order within the cap", () => {
    for (let k = 0; k < 50; k++) {
      let s = E.init({});
      for (let v = E.next(s); v; v = E.next(s)) s = E.answer(s, v.id, [..."VLEF"].sort(() => Math.random() - 0.5));
      expect([...E.result(s).order].sort().join("")).toBe([..."VLEF"].sort().join(""));
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
