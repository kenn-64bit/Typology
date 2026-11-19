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
  it("inconsistent rankings stop the ADAPTIVE path at the cap, and the result is unresolved (AP-03)", () => {
    const orders = [["A", "B", "C", "D"], ["D", "C", "B", "A"], ["B", "D", "A", "C"], ["C", "A", "D", "B"]];
    const s = run(i => orders[i % 4]!);
    expect(s.answers.length).toBe(6);
    const r = E.result(s);
    expect([...r.order].sort().join("")).toBe("ABCD");
    expect(r.resolved).toBeNull();
    expect(r.meta.quality.map(q => q.code)).toContain("ranking-conflict");
    expect(E.bioTokens(s)).toEqual([]);
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

import { summarizeRanking } from "./index.ts";
import { THRESHOLDS } from "@typo/engine-sdk";
import { permutations, uniform } from "@typo/bayes";

describe("fixed form vs adaptive cap (X-01)", () => {
  const fixed = (rank: (i: number) => string[]) => { let s = E.init({}); E.form(s).forEach((v, i) => { s = E.answer(s, v.id, rank(i)); }); return s; };
  it("all 7 fixed-form answers are scored even though the adaptive cap is 6", () => {
    expect(THRESHOLDS.stop.apCap).toBe(6);
    const s = fixed(() => ["A", "B", "C", "D"]);
    expect(E.result(s).tasks).toBe(7);
    expect(E.result(s).meta.completion).toEqual({ answered: 7, total: 7, complete: true });
  });
  it("a different seventh answer changes the posterior", () => {
    const a = fixed(() => ["A", "B", "C", "D"]);
    const b = fixed(i => (i === 6 ? ["D", "C", "B", "A"] : ["A", "B", "C", "D"]));
    expect(E.result(b).p).not.toBe(E.result(a).p);
    expect(E.result(b).positions.D).toBeLessThan(E.result(a).positions.D!); // ranking D first moves it earlier
  });
  it("answer order and replacement do not change the result", () => {
    const orders = permutations(["A", "B", "C", "D"]);
    const pick = (i: number) => orders[(i * 5) % 24]!;
    const s = fixed(pick);
    let rev = E.init({});
    for (const x of [...s.answers].reverse()) rev = E.answer(rev, x.itemId, x.ranking);
    expect(E.result(rev)).toEqual(E.result(s));
    expect(E.result(E.answer(E.answer(s, "t3", ["D", "C", "B", "A"]), "t3", pick(3)))).toEqual(E.result(s));
  });
  it("deserialize rejects malformed rankings", () => {
    const good = JSON.parse(E.serialize(fixed(() => ["A", "B", "C", "D"])));
    const bad = (f: (o: any) => void) => { const o = structuredClone(good); f(o); return JSON.stringify(o); };
    expect(() => E.deserialize(JSON.stringify(good))).not.toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[0].ranking = ["A", "A", "C", "D"]; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[0].itemId = "zz"; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers.push({ ...o.answers[0] }); }))).toThrow();
  });
});

describe("summarizeRanking", () => {
  it("uniform posterior → unresolved, no first, all marginals equal", () => {
    const sum = summarizeRanking(uniform(permutations(["A", "B", "C"]).map(p => p.join(""))), ["A", "B", "C"]);
    expect(sum.order).toBeNull(); expect(sum.first).toBeNull();
    for (const a of ["A", "B", "C"]) for (const m of sum.marginals[a]!) expect(m).toBeCloseTo(1 / 3, 9);
  });
  it("concentrated posterior resolves; marginals sum to 1 per position", () => {
    const sum = summarizeRanking(rankPosterior(permutations(["A", "B", "C"]).map(p => p.join("")), Array(8).fill(["B", "A", "C"])), ["A", "B", "C"]);
    expect(sum.order).toBe("BAC");
    for (let k = 0; k < 3; k++) expect(["A", "B", "C"].reduce((m, a) => m + sum.marginals[a]![k]!, 0)).toBeCloseTo(1, 9);
  });
});
