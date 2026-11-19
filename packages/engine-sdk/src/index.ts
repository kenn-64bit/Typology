// ExamEngine contract (SPEC §2.2) + bioTokens addition (SPEC §2.6.1).
export * from "./bio-types.ts";
export * from "./thresholds.ts";
export * from "./result.ts";
import type { BioToken } from "./bio-types.ts";

export type EvidenceLevel = "strong" | "moderate" | "mixed" | "exploratory";

/** v1 has six engines (SPEC §2.6); §2.2 lists the original four. */
export type EngineId = "jung" | "enneagram" | "bigfive" | "temperament" | "ap" | "motives" | "temporistics";

export interface EngineMeta {
  id: EngineId;
  name: string;
  version: string;                         // semver; bump on recalibration
  /** Meaning of saved numbers/labels; see ResultMeta.scoringVersion. */
  scoringVersion?: string;
  evidence: Record<string, EvidenceLevel>; // per output, e.g. { core: "mixed", tritype: "exploratory" }
  glossary: Record<string, string>;        // notation → meaning
  optionalInputs?: string[];               // e.g. ["bigfive.E", "bigfive.N"]
}

export interface ItemView {                // what the shell renders; no scoring data leaks to the UI
  id: string;
  format: "likert5" | "forced_pair" | "rank" | "scenario";
  text: string;
  options?: { id: string; text: string }[];
}

export type Response = number | string[];  // Likert value or ranked option ids

export interface Explanation {
  output: string;
  result: string;
  confidence: number;
  /** The event `confidence` is the probability of, e.g. "score above the model midpoint". */
  confidenceEvent?: string;
  topEvidence: { itemId: string; answer: string; delta: number }[];
  runnerUp?: { result: string; confidence: number };
}

export interface ExamEngine<S = unknown, R = unknown> {
  meta: EngineMeta;
  init(profile: Readonly<Record<string, unknown>>): S;   // reads optional priors
  next(state: S): ItemView | null;                       // null = finished
  /** The full fixed question form, printed all at once by the UI (answers may come in any order). */
  form(state: S): ItemView[];
  answer(state: S, itemId: string, r: Response): S;      // pure: returns new state
  progress(state: S): { output: string; confidence: number; done: boolean }[];
  result(state: S): R;                                   // legal types only
  explain(state: S): Explanation[];
  serialize(state: S): string;                           // resume later
  deserialize(raw: string): S;
  /** Tokens this engine contributes to the bio (SPEC §2.6.1). Partial results allowed. */
  bioTokens(state: S): BioToken[];
}
