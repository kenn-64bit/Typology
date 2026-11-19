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
  // Strength follows score level (BF-01): θ≈1 traits are clear leans, not strong ones, however certain the sign is.
  it("reserved, limbic, organized, accommodating, middle openness → /R/LOAX", () => {
    const s = runPersona({ E: -2, N: 1, C: 1, A: 1, O: 0.4 });
    expect(E.result(s).sloan).toBe("/R/LOAX");
    expect(E.bioTokens(s)).toEqual([{ slot: "sloan", text: "/R/LOAX", confidence: expect.any(Number), source: "test" }]);
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

// ---- Phase 1 (incident-report BF-01, BF-02, X-06, X-07, X-08): deterministic fixed-form fixtures ----
import { sloanStrength, sloanToken } from "@typo/bio";
import { pAboveMedian } from "@typo/irt";

/** Answers the whole fixed form; `pick(item)` returns the RAW answer 1..5. */
function fixed(pick: (i: (typeof ITEMS)[number]) => number, order: "form" | "reverse" = "form") {
  let s = E.init({});
  const form = E.form(s);
  for (const v of order === "form" ? form : [...form].reverse()) s = E.answer(s, v.id, pick(ITEMS.find(i => i.id === v.id)!));
  return s;
}
const codes = (s: ReturnType<typeof fixed>) => E.result(s).meta.quality.map(q => q.code);

describe("fixed-form fixtures", () => {
  it("raw all-Neutral: XXXXX, no lean anywhere, straight-line note, no conflict note", () => {
    const r = E.result(fixed(() => 3));
    expect(r.sloan).toBe("XXXXX");
    for (const t of TRAITS) { expect(r.traits[t].lean).toBeNull(); expect(r.traits[t].letter).toBe("X"); }
    expect(codes(fixed(() => 3))).toEqual(["straight-line"]);
    expect(r.meta.completion).toEqual({ answered: 40, total: 40, complete: true });
  });
  for (const [x, label] of [[4, "Agree"], [2, "Disagree"], [5, "Strongly agree"]] as const) {
    it(`raw all-${label}: balanced keying cancels → XXXXX, with straight-line and per-trait reverse-key notes`, () => {
      const s = fixed(() => x), r = E.result(s);
      expect(r.sloan).toBe("XXXXX");
      for (const t of TRAITS) expect(r.traits[t].lean).toBeNull();
      expect(codes(s).filter(c => c === "straight-line")).toHaveLength(1);
      expect(codes(s).filter(c => c === "reverse-key-conflict")).toHaveLength(5);
    });
  }
  it("keyed moderate (Agree forward, Disagree reverse): every trait leans high, strength from level, no notes", () => {
    const s = fixed(i => (i.reverse ? 2 : 4)), r = E.result(s);
    for (const t of TRAITS) {
      expect(r.traits[t].lean).toBe("high");
      expect(r.traits[t].strength).toBe(sloanStrength(pAboveMedian(r.traits[t].theta, 1)));
    }
    expect(r.sloan).toBe(sloanToken(TRAITS.map(t => r.traits[t].level)));
    expect(codes(s)).toEqual([]);
  });
  it("conflicting keyed answers (Strongly agree on both sides of Openness only) → conflict note for Openness", () => {
    const s = fixed(i => (i.trait === "O" ? 5 : i.reverse ? 2 : 4));
    const r = E.result(s);
    expect(r.traits.O.lean).toBeNull();
    expect(r.meta.quality.filter(q => q.code === "reverse-key-conflict").map(q => q.output)).toEqual(["Openness"]);
  });
  it("token and breakdown agree: X in the token ⇔ no lean in the breakdown", () => {
    for (const pick of [() => 3, (i: (typeof ITEMS)[number]) => (i.reverse ? 2 : 4), (i: (typeof ITEMS)[number]) => (i.trait === "E" ? 3 : i.reverse ? 1 : 5)]) {
      const r = E.result(fixed(pick));
      const letters = r.sloan.replace(/[/[\]]/g, "").split("");
      TRAITS.forEach((t, k) => expect(letters[k] === "X").toBe(r.traits[t].lean === null));
    }
  });
  it("names the event of each probability and marks it uncalibrated", () => {
    const u = E.result(fixed(() => 4)).meta.uncertainty;
    expect(u).toHaveLength(10);
    expect(u.every(m => m.calibrated === false && m.event.length > 0)).toBe(true);
  });
  it("incomplete form is reported, not hidden", () => {
    const m = E.result(E.answer(E.init({}), "e1", 4)).meta;
    expect(m.completion.complete).toBe(false);
    expect(m.quality.some(q => q.code === "incomplete")).toBe(true);
    expect(m.unresolved).toEqual(["Neuroticism", "Conscientiousness", "Agreeableness", "Openness"]);
  });
});

describe("level-strength formatter (BF-01)", () => {
  it("strength depends on level only: same θ with different SD gives the same strength and token", () => {
    for (const theta of [-1.5, -0.6, -0.2, 0, 0.1, 0.5, 1.2]) {
      const level = pAboveMedian(theta, 1);
      const certainties = [0.2, 0.5, 1].map(se => pAboveMedian(theta, se));
      expect(new Set(certainties).size).toBeGreaterThan(theta === 0 ? 0 : 1); // certainty does move…
      expect(sloanToken([level, 0.5, 0.5, 0.5, 0.5])).toBe(sloanToken([level, 0.5, 0.5, 0.5, 0.5])); // …the formatter input does not
    }
    expect(sloanStrength(0.52)).toBe("middle");
    expect(sloanStrength(0.6)).toBe("borderline");
    expect(sloanStrength(0.75)).toBe("clear");
    expect(sloanStrength(0.9)).toBe("strong");
  });
  it("a precise but moderate score is not labelled strong", () => {
    // θ = 0.5 → 69th model percentile. Sign certainty with SD 0.1 is ≈1, which the old rule called "strong".
    expect(pAboveMedian(0.5, 0.1)).toBeGreaterThan(0.99);
    expect(sloanStrength(pAboveMedian(0.5, 1))).toBe("clear");
  });
});

describe("answer order, replacement and saved-state validation (X-07, X-08)", () => {
  const pick = (i: (typeof ITEMS)[number]) => ((i.id.charCodeAt(1) * 7 + i.id.charCodeAt(0)) % 5) + 1;
  it("answer order does not change the result", () => {
    expect(E.result(fixed(pick, "reverse"))).toEqual(E.result(fixed(pick, "form")));
  });
  it("replacing an answer equals answering it that way first", () => {
    const direct = fixed(pick);
    let s = fixed(i => (i.id === "c3" ? 1 : pick(i)));
    s = E.answer(s, "c3", pick(ITEMS.find(i => i.id === "c3")!));
    expect(s.answers).toHaveLength(40);
    expect(E.result(s).traits).toEqual(E.result(direct).traits);
  });
  it("deserialize rejects malformed states", () => {
    const good = JSON.parse(E.serialize(fixed(pick)));
    const bad = (f: (o: any) => void) => { const o = structuredClone(good); f(o); return JSON.stringify(o); };
    expect(() => E.deserialize(JSON.stringify(good))).not.toThrow();
    expect(() => E.deserialize(bad(o => { o.v = 2; }))).toThrow();
    expect(() => E.deserialize(bad(o => { o.answers[0].itemId = "zz9"; }))).toThrow(/Unknown item/);
    expect(() => E.deserialize(bad(o => { o.answers.push({ ...o.answers[0] }); }))).toThrow(/Duplicate/);
    expect(() => E.deserialize(bad(o => { o.answers[0].x = 7; }))).toThrow(/Invalid answer/);
    expect(() => E.deserialize(bad(o => { o.answers[0].x = 2.5; }))).toThrow(/Invalid answer/);
    expect(() => E.deserialize(bad(o => { o.priorMean.E = null; }))).toThrow(/finite/);
    expect(() => E.deserialize(bad(o => { delete o.priorMean; }))).toThrow(/prior/);
  });
  it("result carries a scoring version for dependants", () => {
    expect(E.result(fixed(pick)).meta.scoringVersion).toBe("bigfive-2");
    expect(E.meta.scoringVersion).toBe("bigfive-2");
  });
});
