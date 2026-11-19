import { describe, expect, it } from "vitest";
import { createRankEngine, rankPosterior, worthFor } from "./index.ts";

const tasks = Array.from({ length: 7 }, (_, i) => ({
  id: `t${i}`, text: `Task ${i}`, options: ["A", "B", "C", "D"].map(id => ({ id, text: `opt ${id}` })),
}));
const E = createRankEngine({
  meta: { id: "ap", name: "Test", version: "0", evidence: {}, glossary: {} }, slot: "ap",
  aspects: ["A", "B", "C", "D"], tasks, stopP: 0.7, cap: 6, aspectNames: {},
});

function run(rank: (i: number) => string[]) {
  let s = E.init({}); let i = 0;
  for (let v = E.next(s); v; v = E.next(s)) s = E.answer(s, v.id, rank(i++));
  return s;
}

describe("rank engine", () => {
  it("consistent rankings converge on that order and stop early", () => {
    const s = run(() => ["C", "A", "D", "B"]);
    expect(E.result(s).order).toBe("CADB");
    expect(s.answers.length).toBeLessThan(6);
    expect(E.bioTokens(s)[0]!.text).toBe("CADB");
  });
  it("inconsistent rankings stop at the cap with a legal order", () => {
    const orders = [["A", "B", "C", "D"], ["D", "C", "B", "A"], ["B", "D", "A", "C"], ["C", "A", "D", "B"]];
    const s = run(i => orders[i % 4]!);
    expect(s.answers.length).toBe(6);
    expect([...E.result(s).order].sort().join("")).toBe("ABCD");
  });
  it("rejects incomplete rankings", () => {
    expect(() => E.answer(E.init({}), "t0", ["A", "B"])).toThrow();
  });
  it("posterior sums to 1; worths favour first place", () => {
    const p = rankPosterior(["AB", "BA"], [["A", "B"]]);
    expect(p.AB! + p.BA!).toBeCloseTo(1, 9);
    expect(p.AB!).toBeGreaterThan(p.BA!);
    expect(worthFor("so/sx/sp").so).toBeGreaterThan(worthFor("so/sx/sp").sp!);
  });
  it("explain lists at most 3 answers, serialize round-trips", () => {
    const s = run(() => ["C", "A", "D", "B"]);
    expect(E.explain(s)[0]!.topEvidence.length).toBeLessThanOrEqual(3);
    expect(E.deserialize(E.serialize(s))).toEqual(s);
  });
});
