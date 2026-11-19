// Lazy loaders for every test engine (SPEC §2.2: taking one exam downloads only that exam).
import type { ExamEngine } from "@typo/engine-sdk";
import { Orchestrator } from "@typo/orchestrator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEngine = ExamEngine<any, any>;

export const LOADERS: Record<string, () => Promise<AnyEngine>> = {
  bigfive: () => import("@typo/engine-bigfive").then(m => m.bigFiveEngine),
  motives: () => import("@typo/engine-motives").then(m => m.motivesEngine),
  temperament: () => import("@typo/engine-temperament").then(m => m.temperamentEngine),
  jung: () => import("@typo/engine-jung").then(m => m.jungEngine),
  enneagram: () => import("@typo/engine-enneagram").then(m => m.enneagramEngine),
  ap: () => import("@typo/engine-ap").then(m => m.apEngine),
  temporistics: () => import("@typo/engine-temporistics").then(m => m.temporisticsEngine),
};

/** The orchestrator knows every step; the three Enneagram steps share one engine. */
export const orchestrator = new Orchestrator({
  bigfive: LOADERS.bigfive!, motives: LOADERS.motives!, temperament: LOADERS.temperament!, jung: LOADERS.jung!,
  "ennea-core": LOADERS.enneagram!, "ennea-instincts": LOADERS.enneagram!, "ennea-tritype": LOADERS.enneagram!,
  ap: LOADERS.ap!, temporistics: LOADERS.temporistics!,
});
