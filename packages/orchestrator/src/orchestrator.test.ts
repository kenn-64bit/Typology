import { describe, expect, it } from "vitest";
import { Orchestrator, ProfileStore, STEPS } from "./index.ts";

describe("orchestrator", () => {
  it("steps follow the §2.6 table order", () => {
    expect(STEPS.map(s => s.num)).toEqual(["1", "2", "3", "4", "5a", "5b", "5c", "6", "7"]);
    expect(STEPS.map(s => s.id).slice(4, 7)).toEqual(["ennea-core", "ennea-instincts", "ennea-tritype"]);
  });
  it("nextStep walks available steps in order", async () => {
    const fake = async () => ({}) as never;
    const o = new Orchestrator({ bigfive: fake, "ennea-core": fake, "ennea-instincts": fake, "ennea-tritype": fake });
    const ids: string[] = []; const done: Record<string, true> = {};
    for (let s = o.nextStep({ done, tokens: [] }); s; s = o.nextStep({ done, tokens: [] })) { ids.push(s.id); done[s.id] = true; }
    expect(ids).toEqual(["bigfive", "ennea-core", "ennea-instincts", "ennea-tritype"]);
  });
  it("profile store snapshot is read-only", () => {
    const p = new ProfileStore(); p.publish("bigfive", "0.1.0", { E: 1 });
    expect(Object.isFrozen(p.snapshot())).toBe(true);
    expect(p.get("bigfive")).toEqual({ E: 1 });
  });
  it("bio shows pending slots", () => {
    const o = new Orchestrator({});
    expect(o.bio({ done: {}, tokens: [{ slot: "sloan", text: "/R/", confidence: 1, source: "test" }] })).toBe("··· ··· ··· ··· ··· ··· /R/ ···");
  });
  it("test_orchestrator_step_blurbs_match_independent_prior_and_single_ranking_rules", () => {
    // Under THRESHOLDS.priorPolicy = "independent" (X-04/X-10), MOTIVES does not use Big Five,
    // and Temperament asks 1 description ranking (not "two confirm items").
    const motives = STEPS.find(s => s.id === "motives")!;
    const temp = STEPS.find(s => s.id === "temperament")!;
    expect(motives.blurb).not.toMatch(/Big Five/i);
    expect(temp.blurb).not.toMatch(/two confirm items/i);
  });
});
