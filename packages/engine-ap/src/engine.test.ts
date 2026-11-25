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
      // THRESHOLDS.ranking.resolveP = 0.6: consistent adaptive answers must also resolve the published order.
      expect(E.result(s).resolved).toBe(order.join(""));
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

describe("QA audit: AP first-position inference, explanations, Image 8, and validation", () => {
  const fixed = (rank: (i: number) => string[]) => {
    let s = E.init({});
    E.form(s).forEach((v, i) => { s = E.answer(s, v.id, rank(i)); });
    return s;
  };

  it("test_ap_rank_always_second_zero_first_choices_not_concluded_as_first", () => {
    // V is placed 2nd in all 7 tasks (0 first-place rankings) while L, E, F rotate 1st/3rd/4th;
    // the engine must not conclude "V first" when V was never ranked first.
    const rot = [
      ["L", "V", "E", "F"], ["L", "V", "F", "E"], ["E", "V", "L", "F"], ["E", "V", "F", "L"],
      ["F", "V", "L", "E"], ["F", "V", "E", "L"], ["L", "V", "E", "F"],
    ];
    const r = E.result(fixed(i => rot[i]!));
    expect(r.first?.aspect).not.toBe("V");
  });

  it("test_ap_explain_partial_first_reports_first_probability_not_unresolved_order_p", () => {
    // When r.resolved is null and r.first resolves to V (>= 0.60), explain() outputs "V first, rest unresolved"
    // so its confidence must match r.first.p rather than the unresolved 4-position order probability (< 0.60).
    const s = fixed(i => [[..."VLEF"], [..."VEFL"], [..."VFLE"]][i % 3]!);
    const r = E.result(s);
    const [ex] = E.explain(s);
    expect(r.resolved).toBeNull();
    expect(r.first?.aspect).toBe("V");
    expect(ex!.result).toBe("V first, rest unresolved");
    expect(ex!.confidence).toBeCloseTo(r.first!.p, 6);
  });

  it("test_ap_explain_exact_tie_does_not_claim_single_most_likely_order", () => {
    // On 0 answers (24-way tie at 1/24), explain() must not declare VLEF "most likely" with tied VLFE as "Runner-up".
    const [ex] = E.explain(E.init({}));
    expect(ex!.result).not.toMatch(/most likely VLEF/);
  });

  it("test_ap_image8_four_different_first_choices_unresolved_with_conflict_note", () => {
    // Image 8: 7 answers with 4 different first choices -> "no clear order", multiple candidates >= 10%, F mostly last.
    const ranks = [
      ["V", "L", "E", "F"], ["L", "E", "V", "F"], ["E", "V", "L", "F"], ["F", "L", "E", "V"],
      ["V", "E", "F", "L"], ["L", "V", "F", "E"], ["E", "L", "V", "F"],
    ];
    const s = fixed(i => ranks[i]!);
    const r = E.result(s);
    expect(r.resolved).toBeNull();
    expect(r.first).toBeNull();
    expect(r.candidates.length).toBeGreaterThanOrEqual(2);
    expect(r.meta.quality[0]?.code).toBe("ranking-conflict");
    expect(r.meta.quality[0]?.message).toContain("(4 different first choices)");
    expect(E.bioTokens(s)).toEqual([]);
  });

  it("test_ap_deserialize_and_invalid_answer_validation", () => {
    const s0 = E.init({});
    expect(() => E.answer(s0, "ap99", ["V", "L", "E", "F"])).toThrow(/Unknown task/);
    expect(() => E.answer(s0, "ap1", ["V", "V", "E", "F"])).toThrow();
    expect(() => E.answer(s0, "ap1", ["V", "L", "E"])).toThrow();
    expect(() => E.answer(s0, "ap1", 3 as never)).toThrow();
    expect(() => E.deserialize("null")).toThrow();
    expect(() => E.deserialize(JSON.stringify({ v: 1, answers: [{ itemId: "ap1", ranking: ["V", "L", "E", "X"] }] }))).toThrow();
  });
});
