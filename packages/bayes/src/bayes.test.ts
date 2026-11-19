import { describe, expect, it } from "vitest";
import { permutations, plackettLuce, prune, top, uniform, update, updateRanking } from "./index.ts";

describe("bayes", () => {
  it("update favours the class whose likelihood fits the answer", () => {
    const item = { likelihood: { module: "ennea_core", table: { "1": [0.6, 0.2, 0.2], "2": [0.1, 0.6, 0.3] } } };
    const p = update(uniform(["1", "2"]), item, 0);
    expect(p["1"]).toBeCloseTo(0.6 / 0.7, 6);
  });
  it("prune zeroes illegal classes", () => {
    expect(prune(uniform(["a", "b"]), c => c === "a")).toEqual({ a: 1, b: 0 });
  });
  it("24 orders for 4 aspects", () => {
    const o = permutations(["V", "L", "E", "F"]);
    expect(o).toHaveLength(24);
    expect(new Set(o.map(x => x.join(""))).size).toBe(24);
  });
  it("Plackett–Luce sums to 1 over all rankings", () => {
    const w = { a: 3, b: 2, c: 1 };
    expect(permutations(["a", "b", "c"]).reduce((s, r) => s + plackettLuce(r, w), 0)).toBeCloseTo(1, 9);
  });
  it("ranking update picks the matching order", () => {
    const orders = permutations(["V", "L", "E", "F"]).map(o => o.join(""));
    const worthFor = (cls: string) => Object.fromEntries([...cls].map((ch, i) => [ch, 2 ** (3 - i)]));
    let p = uniform(orders);
    for (let i = 0; i < 3; i++) p = updateRanking(p, ["V", "L", "E", "F"], worthFor);
    expect(top(p)[0]!.cls).toBe("VLEF");
  });
});
