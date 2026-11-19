import { describe, expect, it } from "vitest";
import { createLikertCat, likertItems, type LikertAnswer } from "./index.ts";

const items = likertItems([
  ["a1", "A", false, "a1"], ["a2", "A", true, "a2"], ["a3", "A", false, "a3"], ["a4", "A", false, "a4"],
  ["b1", "B", false, "b1"], ["b2", "B", true, "b2"], ["b3", "B", false, "b3"], ["b4", "B", false, "b4"],
]);
const cat = createLikertCat({ items, scales: ["A", "B"], stop: () => ({ se: 0.1, letterP: 0.9, cap: 3 }) });

function run(keyed: Record<string, number>) {
  let ans: LikertAnswer[] = [];
  for (let it = cat.next(ans); it; it = cat.next(ans)) ans = cat.answer(ans, it.id, it.reverse ? 6 - keyed[it.scale]! : keyed[it.scale]!);
  return ans;
}

describe("likert-cat", () => {
  it("rotates scales and alternates A, B", () => {
    expect(run({ A: 3, B: 3 }).slice(0, 2).map(a => a.itemId[0])).toEqual(["a", "b"]);
  });
  it("letter-probability rule stops strong answers early; cap stops neutral answers", () => {
    expect(run({ A: 5, B: 1 }).length).toBeLessThan(6);
    expect(run({ A: 3, B: 3 })).toHaveLength(6);
  });
  it("reverse-keyed items are flipped", () => {
    const ans = run({ A: 5, B: 5 });
    expect(cat.estimate(ans, "A").pHigh).toBeGreaterThan(0.9);
  });
  it("evidence lists the most influential answers first", () => {
    const ev = cat.evidence(run({ A: 5, B: 1 }), "A");
    const d = ev.map(e => Math.abs(e.delta));
    expect(d).toEqual([...d].sort((x, y) => y - x));
  });
  it("rejects out-of-range answers", () => {
    expect(() => cat.answer([], "a1", 6)).toThrow();
    expect(() => cat.answer([], "zz", 3)).toThrow();
  });
});
