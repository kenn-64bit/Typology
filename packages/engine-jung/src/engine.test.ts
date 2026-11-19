import { describe, expect, it } from "vitest";
import { ITEMS, jungEngine as E, mbtiStack } from "./index.ts";

/** lean per scale/function: +1 agree-keyed, -1 disagree-keyed, 0 neutral */
function run(lean: Record<string, number>, profile: Record<string, unknown> = {}) {
  let s = E.init(profile);
  for (let v = E.next(s); v; v = E.next(s)) {
    const it = ITEMS.find(i => i.id === v.id)!;
    const l = lean[it.scale] ?? 0; const keyed = Math.max(1, Math.min(5, 3 + l));
    s = E.answer(s, v.id, it.reverse ? 6 - keyed : keyed);
  }
  return s;
}
/** first listed function = clearly dominant (+2), the rest listed = +1, others −2 */
const fn = (high: string[]) => Object.fromEntries(["Ti", "Te", "Fi", "Fe", "Si", "Se", "Ni", "Ne"].map(f => [f, f === high[0] ? 2 : high.includes(f) ? 1 : -2]));

describe("Jung engine", () => {
  it("44 original items: 5 per scale, 3 per function", () => {
    expect(ITEMS).toHaveLength(44);
  });
  it("letters follow the scale answers", () => {
    const r = E.result(run({ EI: -2, SN: 2, TF: 2, JP: -2, ...fn(["Ti", "Ne"]) }));
    expect(r.mbti).toBe("INTP");
    expect(r.mbtiStack).toEqual(["Ti", "Ne"]);
  });
  it("Jungian code comes from function scores and may be non-MBTI (Fi + Si)", () => {
    const r = E.result(run({ EI: -2, SN: -2, TF: -2, JP: 2, ...fn(["Fi", "Si"]) }));
    expect(r.code).toBe("IF(S) (FiSi)");
    expect(r.dom).toBe("Fi");
  });
  it("auxiliary always comes from the opposite axis", () => {
    const r = E.result(run({ ...fn(["Te", "Ti"]) }));
    expect(["Te", "Ti"]).toContain(r.dom);
    expect(["S", "N"]).toContain(r.aux[0]);
  });
  it("mbtiStack conventions", () => {
    expect(mbtiStack("ENFJ")).toEqual(["Fe", "Ni"]);
    expect(mbtiStack("ISTJ")).toEqual(["Si", "Te"]);
    expect(mbtiStack("ESTP")).toEqual(["Se", "Ti"]);
  });
  it("respects caps; Big Five E prior is optional", () => {
    const s = run({ EI: 2, SN: 2, TF: 2, JP: 2, ...fn(["Ne", "Fe"]) });
    expect(s.answers.length).toBeLessThanOrEqual(44);
    expect(E.result(run({}, { bigfive: { traits: { E: { theta: 2 } } } })).usedBigFive).toBe(true);
    expect(E.result(run({})).usedBigFive).toBe(false);
  });
  it("token only when finished; serialize round-trips; explain ≤ 3", () => {
    expect(E.bioTokens(E.init({}))).toEqual([]);
    const s = run({ EI: -2, SN: 2, TF: 2, JP: -2, ...fn(["Ti", "Ne"]) });
    expect(E.bioTokens(s)[0]!.text).toBe("IT(N) (TiNe)");
    expect(E.deserialize(E.serialize(s))).toEqual(s);
    for (const x of E.explain(s)) expect(x.topEvidence.length).toBeLessThanOrEqual(3);
  });
});

describe("fixed form (engine-jung)", async () => {
  const { jungEngine: F } = await import("./index.ts");
  it("prints the whole bank once and finishes when answered in any order", () => {
    let s = F.init({});
    const form = F.form(s);
    expect(form).toHaveLength(44);
    expect(new Set(form.map(v => v.id)).size).toBe(44);
    for (const v of [...form].reverse()) s = F.answer(s, v.id, v.format === "rank" ? v.options!.map(o => o.id) : 4);
    expect(F.next(s)).toBeNull();
    expect(F.bioTokens(s)).toHaveLength(1);
  });
});
