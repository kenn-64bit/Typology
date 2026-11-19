// Saved-result provenance (incident-report X-03). Pure helpers so they can be tested without the browser store.
import { savedScoringVersion } from "@typo/engine-sdk";

/** Current scoring version of each engine. A test checks these against the engines' own meta.scoringVersion. */
export const CURRENT_SCORING: Record<string, string> = {
  bigfive: "bigfive-2", motives: "motives-2", temperament: "temperament-3", jung: "jung-2",
  enneagram: "enneagram-3", ap: "ap-2", temporistics: "temporistics-2",
};

export type ResultStatus = "current" | "outdated-scoring" | "outdated-dependency" | "legacy" | "missing";

interface Dep { engine: string; scoringVersion: string; used: string }
const depsOf = (r: unknown): Dep[] => {
  const d = (r as { meta?: { dependencies?: unknown } } | null)?.meta?.dependencies;
  return Array.isArray(d) ? (d as Dep[]) : [];
};

/** Ids of saved results that read `changedId` and therefore no longer match it after it is replaced. */
export function dependantsOf(results: Readonly<Record<string, unknown>>, changedId: string): string[] {
  return Object.keys(results).filter(id => id !== changedId && depsOf(results[id]).some(d => d.engine === changedId));
}

/**
 * Status of one saved result:
 * - legacy: saved before scoring versions existed (still readable; its meaning is the pre-fix one);
 * - outdated-scoring: saved by an older scoring version of its own engine;
 * - outdated-dependency: it read another result that has since been replaced (flagged in `outdated`);
 * - current otherwise.
 */
export function resultStatus(results: Readonly<Record<string, unknown>>, outdated: Readonly<Record<string, true>>, id: string): ResultStatus {
  const r = results[id];
  if (!r || typeof r !== "object") return "missing";
  const v = savedScoringVersion(r);
  if (v === null) return "legacy";
  if (CURRENT_SCORING[id] && v !== CURRENT_SCORING[id]) return "outdated-scoring";
  if (outdated[id]) return "outdated-dependency";
  return "current";
}

/** Keeps only `true` flags for results that still exist (validates a loaded `outdated` map). */
export function cleanOutdated(outdated: unknown, results: Readonly<Record<string, unknown>>): Record<string, true> {
  const o = outdated && typeof outdated === "object" ? outdated as Record<string, unknown> : {};
  return Object.fromEntries(Object.entries(o).filter(([k, v]) => v === true && k in results)) as Record<string, true>;
}
