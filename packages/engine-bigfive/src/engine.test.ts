import { describe, expect, it } from "vitest";
import { THRESHOLDS } from "@typo/engine-sdk";
import { bigFiveEngine as E, ITEMS, TRAITS } from "./index.ts";
import { runPersona } from "./script.ts";

describe("item bank", () => {
  it("40 items, 8 per trait, half reverse-keyed, expert params", () => {
    expect(ITEMS).toHaveLength(40);
    for (const t of TRAITS) expect(ITEMS.filter(i => i.trait === t)).toHaveLength(8);
    expect(ITEMS.filter(i => i.reverse)).toHaveLength(20);
    expect(ITEMS.every(i => i.params_source === "expert" && i.a === 1.5)).toBe(true);
  });
});

describe("scripted answers → SLOAN", () => {
  it("reserved, limbic, organized, accommodating, middle openness → /R/L/O/A/X", () => {
    const s = runPersona({ E: -2, N: 1, C: 1, A: 1, O: 0.4 });
    expect(E.result(s).sloan).toBe("/R/L/O/A/X");
    expect(E.bioTokens(s)).toEqual([{ slot: "sloan", text: "/R/L/O/A/X", confidence: expect.any(Number), source: "test" }]);
  });
  it("all-neutral respondent → XXXXX", () => {
    expect(E.result(runPersona({ E: 0, N: 0, C: 0, A: 0, O: 0 })).sloan).toBe("XXXXX");
  });
  it("publishes E and N estimates", () => {
    const r = E.result(runPersona({ E: -2, N: 1, C: 1, A: 1, O: 0.4 }));
    expect(r.published.E.theta).toBeLessThan(-0.5);
    expect(r.published.N.theta).toBeGreaterThan(0.5);
  });
});

describe("stop rules (thresholds.ts)", () => {
  it("extreme answers end the test early", () => {
    const s = runPersona({ E: 3, N: 3, C: 3, A: 3, O: 3 });
    expect(s.answers.length).toBeLessThanOrEqual(15);
    expect(E.next(s)).toBeNull();
    expect(E.progress(s).every(p => p.done && p.confidence >= THRESHOLDS.stop.bigfiveLetterP)).toBe(true);
  });
  it("middle answers never exceed the per-trait cap", () => {
    const s = runPersona({ E: 0, N: 0, C: 0, A: 0, O: 0 });
    for (const t of TRAITS) expect(s.answers.filter(a => a.itemId.startsWith(t.toLowerCase())).length).toBeLessThanOrEqual(THRESHOLDS.stop.bigfiveCap);
  });
  it("rotates traits: first five items cover all five traits", () => {
    const s = runPersona({ E: 0, N: 0, C: 0, A: 0, O: 0 });
    expect(new Set(s.answers.slice(0, 5).map(a => a.itemId[0]))).toEqual(new Set(["e", "n", "c", "a", "o"]));
  });
});

describe("contract", () => {
  it("answer is pure and serialize round-trips", () => {
    const s0 = E.init({}); const v = E.next(s0)!;
    const s1 = E.answer(s0, v.id, 4);
    expect(s0.answers).toHaveLength(0);
    expect(E.deserialize(E.serialize(s1))).toEqual(s1);
  });
  it("rejects invalid answers", () => {
    expect(() => E.answer(E.init({}), "e1", 7)).toThrow();
  });
  it("explain gives ≤3 evidence answers per trait, strongest first", () => {
    const ex = E.explain(runPersona({ E: -2, N: 1, C: 1, A: 1, O: 0.4 }));
    expect(ex).toHaveLength(5);
    for (const x of ex) {
      expect(x.topEvidence.length).toBeLessThanOrEqual(3);
      const d = x.topEvidence.map(t => Math.abs(t.delta));
      expect(d).toEqual([...d].sort((a, b) => b - a));
    }
  });
  it("no bio token until finished", () => {
    expect(E.bioTokens(E.init({}))).toEqual([]);
  });
});

describe("fixed form (engine-bigfive)", async () => {
  const { bigFiveEngine: F } = await import("./index.ts");
  it("prints the whole bank once and finishes when answered in any order", () => {
    let s = F.init({});
    const form = F.form(s);
    expect(form).toHaveLength(40);
    expect(new Set(form.map(v => v.id)).size).toBe(40);
    for (const v of [...form].reverse()) s = F.answer(s, v.id, v.format === "rank" ? v.options!.map(o => o.id) : 4);
    expect(F.next(s)).toBeNull();
    expect(F.bioTokens(s)).toHaveLength(1);
  });
});
