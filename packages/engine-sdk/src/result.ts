// Shared result fields (incident-report X-03, X-06, X-07). Each engine attaches a ResultMeta to its result so the
// web path can show completion, unresolved outputs, response-quality notes and uncertainty without guessing.
import type { EngineId } from "./index.ts";

/** How a probability-like number was produced. None of these is calibrated against respondent data yet. */
export type UncertaintyKind =
  | "model-probability"   // posterior probability of a named event under the engine's expert (uncalibrated) model
  | "posterior-sd"        // posterior standard deviation of a latent score, in that score's units
  | "heuristic";          // a score that is NOT a probability of any event; named so it is never read as one

export interface UncertaintyMeasure {
  /** Which output this describes, e.g. "Extraversion". */
  output: string;
  /** Plain statement of the event or quantity, e.g. "Extraversion score is above the model midpoint (θ > 0)". */
  event: string;
  kind: UncertaintyKind;
  value: number;
  /** Always false until held-out calibration exists (X-05). */
  calibrated: false;
}

/**
 * A response-pattern observation. Notes are informational and never reject the answers: a sincere respondent can
 * produce any of these patterns. Codes are stable so UI and tests can match on them.
 */
export interface QualityNote {
  code: "straight-line" | "reverse-key-conflict" | "incomplete" | "ranking-conflict";
  output?: string;
  message: string;
}

export interface Dependency {
  engine: EngineId;
  scoringVersion: string;
  /** The value actually read from that result, so a stale input can be recognised later. */
  used: string;
}

export interface ResultMeta {
  engine: EngineId;
  /** Bumped whenever the meaning of saved numbers or labels changes. Consumers compare this, not the package semver. */
  scoringVersion: string;
  completion: { answered: number; total: number; complete: boolean };
  /** Outputs the engine could not report from these answers (no evidence, tie, unresolved order…). */
  unresolved: string[];
  quality: QualityNote[];
  uncertainty: UncertaintyMeasure[];
  dependencies: Dependency[];
}

export const isFiniteNumber = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

/** Reads `meta.scoringVersion` from a saved result. Results saved before scoring versions existed return null. */
export function savedScoringVersion(result: unknown): string | null {
  const m = (result as { meta?: { scoringVersion?: unknown } } | null)?.meta;
  return typeof m?.scoringVersion === "string" ? m.scoringVersion : null;
}

/**
 * Validates the Likert part of a serialized engine state (X-07): known item ids, one answer per item, integer
 * categories 1..5, finite prior means. Throws with a specific message; never repairs silently.
 */
export function validateLikertState(
  s: unknown, opts: { version: number; knownIds: ReadonlySet<string>; priorKeys?: readonly string[]; priorField?: string },
): void {
  const o = s as { v?: unknown; answers?: unknown } & Record<string, unknown>;
  if (!o || typeof o !== "object" || o.v !== opts.version) throw new Error("Unrecognised state version");
  if (!Array.isArray(o.answers)) throw new Error("State has no answers array");
  const seen = new Set<string>();
  for (const a of o.answers as { itemId?: unknown; x?: unknown }[]) {
    if (!a || typeof a.itemId !== "string" || !opts.knownIds.has(a.itemId)) throw new Error(`Unknown item ${String(a?.itemId)}`);
    if (seen.has(a.itemId)) throw new Error(`Duplicate answer for ${a.itemId}`);
    seen.add(a.itemId);
    if (!Number.isInteger(a.x) || (a.x as number) < 1 || (a.x as number) > 5) throw new Error(`Invalid answer for ${a.itemId}`);
  }
  if (opts.priorKeys) {
    const p = o[opts.priorField ?? "priorMean"] as Record<string, unknown> | undefined;
    if (!p || typeof p !== "object") throw new Error("State has no prior");
    for (const k of opts.priorKeys) if (!isFiniteNumber(p[k])) throw new Error(`Prior for ${k} is not a finite number`);
  }
}

/**
 * Straight-line and reverse-key observations for a Likert form (BF-02). `forward`/`reverse` are RAW answers 1..5.
 * Rules are provisional expert choices (see THRESHOLDS.quality); they describe a pattern, not invalidity.
 */
export function likertQualityNotes(
  all: readonly number[],
  scales: { output: string; forward: readonly number[]; reverse: readonly number[] }[],
  rule: { agreeMean: number; disagreeMean: number; minPerSide: number },
): QualityNote[] {
  const notes: QualityNote[] = [];
  if (all.length > 1 && all.every(x => x === all[0])) {
    const label = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][all[0]! - 1];
    notes.push({
      code: "straight-line",
      message: all[0] === 3
        ? "Every answer was Neutral. That can be a sincere answer, but it gives the test nothing to tell the sides apart, so every trait shows no clear lean."
        : `Every answer was "${label}", including statements that point in opposite directions. The result cannot separate this answering style from your traits.`,
    });
  }
  const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  for (const sc of scales) {
    if (sc.forward.length < rule.minPerSide || sc.reverse.length < rule.minPerSide) continue;
    const f = mean(sc.forward), r = mean(sc.reverse);
    const both = f >= rule.agreeMean && r >= rule.agreeMean ? "agreed" : f <= rule.disagreeMean && r <= rule.disagreeMean ? "disagreed" : null;
    if (both) notes.push({
      code: "reverse-key-conflict", output: sc.output,
      message: `${sc.output}: you mostly ${both} with statements on both sides of this trait. The score sits near the middle partly because those answers cancel out.`,
    });
  }
  return notes;
}

/**
 * A saved result from another engine, accepted only when its scoring version is in `accepted` (use null to accept
 * results saved before scoring versions existed). Returns null for missing, non-object or incompatible results so an
 * outdated result never silently serves as an input (X-03).
 */
export function compatibleResult(
  profile: Readonly<Record<string, unknown>>, id: EngineId, accepted: readonly (string | null)[],
): { result: Record<string, unknown>; scoringVersion: string | null } | null {
  const r = profile[id];
  if (!r || typeof r !== "object" || Array.isArray(r)) return null;
  const v = savedScoringVersion(r);
  return accepted.includes(v) ? { result: r as Record<string, unknown>, scoringVersion: v } : null;
}
