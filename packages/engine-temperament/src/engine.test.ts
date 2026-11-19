import { describe, expect, it } from "vitest";
import { FALLBACK, RANK_ID, temperamentEngine as E, TEMPS } from "./index.ts";
import type { Temp } from "@typo/bio";

/** Answer the whole form at once (any order), as the UI does. */
function run(profile: Record<string, unknown>, lean: { E: number; N: number }, ranking: Temp[]) {
  let s = E.init(profile);
  for (const v of [...E.form(s)].reverse()) {
    if (v.id === RANK_ID) { s = E.answer(s, v.id, ranking); continue; }
    const it = FALLBACK.find(i => i.id === v.id)!;
    const keyed = (lean as Record<string, number>)[it.scale]! > 0 ? 5 : 1;
    s = E.answer(s, v.id, it.reverse ? 6 - keyed : keyed);
  }
  return s;
}
const bf = (E: number, N: number) => ({ bigfive: { published: { E: { theta: E, se: 0.4 }, N: { theta: N, se: 0.4 } } } });

describe("temperament engine (fixed form)", () => {
  it("form: 8 items + 1 ranking alone; only the ranking with a Big Five result", () => {
    expect(E.form(E.init({}))).toHaveLength(9);
    expect(E.form(E.init(bf(0, 0))).map(v => v.id)).toEqual([RANK_ID]);
  });
  it("quadrants follow E × N", () => {
    expect(E.result(run(bf(-1.5, -1.5), { E: 0, N: 0 }, ["phlegmatic", "melancholic", "sanguine", "choleric"])).top).toBe("phlegmatic");
    expect(E.result(run(bf(-1.5, 1.5), { E: 0, N: 0 }, ["melancholic", "phlegmatic", "sanguine", "choleric"])).top).toBe("melancholic");
    expect(E.result(run({}, { E: 1, N: -1 }, ["sanguine", "choleric", "phlegmatic", "melancholic"])).top).toBe("sanguine");
  });
  it("clear profile ranked consistently → pure token; borderline E → blend", () => {
    expect(E.result(run(bf(2, 2), { E: 0, N: 0 }, ["choleric", "sanguine", "melancholic", "phlegmatic"])).token).toBe("chol [dom]");
    expect(E.result(run(bf(0.05, 1.5), { E: 0, N: 0 }, ["melancholic", "choleric", "sanguine", "phlegmatic"])).token).toMatch(/^(mel|chol)-(mel|chol)$/);
  });
  it("finished only when the whole form is answered; next() walks the form", () => {
    let s = E.init({});
    expect(E.bioTokens(s)).toEqual([]);
    for (let v = E.next(s); v; v = E.next(s)) s = v.id === RANK_ID ? E.answer(s, v.id, TEMPS) : E.answer(s, v.id, 3);
    expect(E.bioTokens(s)[0]!.slot).toBe("temperament");
    expect(E.deserialize(E.serialize(s))).toEqual(s);
    expect(E.explain(s)[0]!.topEvidence.length).toBeLessThanOrEqual(3);
  });
  it("rejects an incomplete ranking", () => {
    expect(() => E.answer(E.init({}), RANK_ID, ["choleric"])).toThrow();
  });
});
