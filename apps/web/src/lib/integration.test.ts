// Phase 7 integration: the deployed fixed-form path for all seven tests, as QuizModal runs it
// (init(profile) → form → answer every item → init(profile) again → answer → result), plus saved-result provenance.
import { describe, expect, it } from "vitest";
import type { ItemView, Response, ResultMeta } from "@typo/engine-sdk";
import { LOADERS, type AnyEngine } from "./engines.ts";
import { cleanOutdated, CURRENT_SCORING, dependantsOf, resultStatus } from "./saved.ts";

const IDS = ["bigfive", "motives", "temperament", "jung", "enneagram", "ap", "temporistics"] as const;
const load = (id: string) => LOADERS[id]!() as Promise<AnyEngine>;

/** Deterministic varied answer for any item kind. */
function answerFor(v: ItemView, k: number): Response {
  if (v.format === "likert5") return ((k * 7 + v.id.length) % 5) + 1;
  if (v.format === "scenario") return Number(v.options![k % v.options!.length]!.id);
  const ids = v.options!.map(o => o.id);
  const r = k % ids.length;
  return [...ids.slice(r), ...ids.slice(0, r)];
}
function changed(v: ItemView, r: Response): Response {
  if (v.format === "likert5") return (r as number) === 5 ? 1 : 5;
  if (v.format === "scenario") return Number(v.options!.find(o => Number(o.id) !== r)!.id);
  return [...(r as string[])].reverse();
}
/** QuizModal.submit: rebuild state from a fresh init and apply every form answer. */
function submit(e: AnyEngine, profile: Record<string, unknown>, answers: Map<string, Response>) {
  let s = e.init(profile);
  for (const v of e.form(e.init(profile))) s = e.answer(s, v.id, answers.get(v.id)!);
  return e.result(s) as { meta: ResultMeta } & Record<string, unknown>;
}
function fill(e: AnyEngine, profile: Record<string, unknown>) {
  const form = e.form(e.init(profile));
  return { form, answers: new Map(form.map((v, k) => [v.id, answerFor(v, k)])) };
}

describe("all seven tests through the fixed-form path", () => {
  for (const id of IDS) {
    it(`${id}: completes, scores every answer, and reports a current scoring version`, async () => {
      const e = await load(id);
      const { form, answers } = fill(e, {});
      const r = submit(e, {}, answers);
      expect(r.meta.completion).toEqual({ answered: form.length, total: form.length, complete: true });
      expect(r.meta.scoringVersion).toBe(CURRENT_SCORING[id]);
      expect(e.meta.scoringVersion).toBe(CURRENT_SCORING[id]);
      expect(r.meta.uncertainty.every(u => u.calibrated === false)).toBe(true);
      for (const v of form) {
        const alt = new Map(answers); alt.set(v.id, changed(v, answers.get(v.id)!));
        expect(submit(e, {}, alt), `${id}/${v.id} did not affect the result`).not.toEqual(r);
      }
    }, 60_000);
  }
});

describe("Big Five retake → fresh dependent submissions (X-03, X-04, X-09)", () => {
  it("temperament reads the latest Big Five; MOTIVES and Jung are unaffected by design; dependants are flagged", async () => {
    const [bf, te, mo, ju] = await Promise.all(["bigfive", "temperament", "motives", "jung"].map(load));
    const all = (x: number) => new Map(bf!.form(bf!.init({})).map(v => [v.id, x as Response]));
    const results: Record<string, unknown> = {};
    let outdated: Record<string, true> = {};
    const save = (id: string, r: unknown) => {
      for (const d of dependantsOf(results, id)) outdated[d] = true;
      delete outdated[id]; results[id] = r;
    };

    // First Big Five: all Neutral. Then temperament, MOTIVES, Jung.
    save("bigfive", submit(bf!, {}, all(3)));
    const tForm = fill(te!, results);
    expect(tForm.form).toHaveLength(1); // ranking only: the Big Five import is compatible
    save("temperament", submit(te!, results, tForm.answers));
    const moA = fill(mo!, results), juA = fill(ju!, results);
    const mo1 = submit(mo!, results, moA.answers), ju1 = submit(ju!, results, juA.answers);
    save("motives", mo1); save("jung", ju1);
    const t1 = results.temperament as { E: { theta: number } };

    // Retake Big Five with different answers: the saved temperament result is now outdated.
    const retake = new Map(all(3)); for (const k of [...retake.keys()].filter(k => k.startsWith("e"))) retake.set(k, k <= "e4" ? 5 : 1);
    save("bigfive", submit(bf!, {}, retake));
    expect(resultStatus(results, outdated, "temperament")).toBe("outdated-dependency");
    expect(resultStatus(results, outdated, "motives")).toBe("current"); // no dependency under the independent policy
    expect(resultStatus(results, outdated, "bigfive")).toBe("current");

    // Fresh submissions read the new Big Five result.
    save("temperament", submit(te!, results, tForm.answers));
    const t2 = results.temperament as { E: { theta: number }; meta: ResultMeta };
    expect(t2.E.theta).toBeGreaterThan(t1.E.theta + 0.5);
    expect(t2.meta.dependencies[0]).toMatchObject({ engine: "bigfive", scoringVersion: "bigfive-2" });
    expect(resultStatus(results, outdated, "temperament")).toBe("current");
    expect(submit(mo!, results, moA.answers)).toEqual(mo1);
    expect(submit(ju!, results, juA.answers)).toEqual(ju1);
    outdated = cleanOutdated(outdated, results);
  });

  it("an outdated or unknown Big Five scoring version is never used as a prior", async () => {
    const [bf, te] = await Promise.all(["bigfive", "temperament"].map(load));
    const bfResult = submit(bf!, {}, new Map(bf!.form(bf!.init({})).map(v => [v.id, 4 as Response])));
    const stale = { ...bfResult, meta: { ...bfResult.meta, scoringVersion: "bigfive-1" } };
    expect(te!.form(te!.init({ bigfive: bfResult }))).toHaveLength(1);
    expect(te!.form(te!.init({ bigfive: stale }))).toHaveLength(9);
    expect(resultStatus({ bigfive: stale }, {}, "bigfive")).toBe("outdated-scoring");
    expect(resultStatus({ bigfive: { traits: {} } }, {}, "bigfive")).toBe("legacy");
  });
});

describe("saved-state helpers", () => {
  it("cleanOutdated keeps only true flags for existing results", () => {
    expect(cleanOutdated({ temperament: true, jung: "yes", gone: true }, { temperament: {}, jung: {} })).toEqual({ temperament: true });
    expect(cleanOutdated(null, {})).toEqual({});
  });
});
