// Step orchestrator (SPEC §2.3 sequential mode, §2.6 run order). Framework-free; engines are injected.
// NOT the web result path (X-02): the app's QuizModal calls form → answer → result → explain directly, and results
// carry their own publication rules (ResultMeta, resolved/unresolved fields). Sequencing and bio composition here,
// and engines' bioTokens(), are unused by the deployed fixed form and must not be relied on to gate results.
import type { BioToken, EngineId, EvidenceLevel, ExamEngine, Slot } from "@typo/engine-sdk";
import { composeBio, tokensBySlot } from "@typo/bio";

export type StepId = "bigfive" | "motives" | "temperament" | "jung" | "ennea-core" | "ennea-instincts" | "ennea-tritype" | "ap" | "temporistics";

export interface StepDef {
  id: StepId; num: string; title: string; engine: EngineId;
  slots: Slot[]; example: string; estItems: string; evidence: EvidenceLevel; blurb: string;
}

/** §2.6 table order: 1 → 2 → 3 → 4 → 5a → 5b → 5c → 6 → 7. */
export const STEPS: StepDef[] = [
  { id: "bigfive", num: "1", title: "Big Five", engine: "bigfive", slots: ["sloan"], example: "/R/LOA[I]", estItems: "15–25", evidence: "strong",
    blurb: "Five well-studied traits, written as a SLOAN code. Its Extraversion and Neuroticism feed later steps." },
  { id: "motives", num: "2", title: "MOTIVES", engine: "motives", slots: ["motives"], example: "A|O|XIVRg", estItems: "28", evidence: "exploratory",
    blurb: "Seven bipolar traits in the fixed order M-O-T-I-V-E-S. Uses your Big Five result as a head start." },
  { id: "temperament", num: "3", title: "Temperament", engine: "temperament", slots: ["temperament"], example: "phleg [dom]", estItems: "1 or 9", evidence: "exploratory",
    blurb: "Derived from Big Five Extraversion × Neuroticism, plus two confirm items (pure or blend)." },
  { id: "jung", num: "4", title: "Jung functions", engine: "jung", slots: ["jung"], example: "IT(N) (TiNi)", estItems: "48", evidence: "moderate",
    blurb: "Classic Jungian code from function-attitude scores, with MBTI letters shown separately." },
  { id: "ennea-core", num: "5a", title: "Enneagram core + wing", engine: "enneagram", slots: ["tritype"], example: "··· (1w2)", estItems: "12–18", evidence: "mixed",
    blurb: "Your core type first, then a neighbouring wing." },
  { id: "ennea-instincts", num: "5b", title: "Instincts", engine: "enneagram", slots: ["instincts"], example: "so/sx/sp", estItems: "3–4", evidence: "exploratory",
    blurb: "The order of the social, one-to-one and self-preservation instincts." },
  { id: "ennea-tritype", num: "5c", title: "Tritype", engine: "enneagram", slots: ["tritype"], example: "127 (1w2)", estItems: "4–6", evidence: "exploratory",
    blurb: "One type from each center; your core is the first digit." },
  { id: "ap", num: "6", title: "Attitudinal Psyche", engine: "ap", slots: ["ap"], example: "VLEF", estItems: "7", evidence: "exploratory",
    blurb: "Rank Volition, Logic, Emotion and Physics from 1st to 4th." },
  { id: "temporistics", num: "7", title: "Temporistics", engine: "temporistics", slots: ["temporistics"], example: "NVBP", estItems: "4–8", evidence: "exploratory",
    blurb: "Rank present, eternity, future and past, using the same ranking format as AP." },
];

/** Read-only results published by engines; other engines may read them as optional priors (§2.1). */
export class ProfileStore {
  private results: Record<string, { engineVersion: string; result: unknown }> = {};
  constructor(init?: Record<string, { engineVersion: string; result: unknown }>) { if (init) this.results = { ...init }; }
  publish(engineId: string, engineVersion: string, result: unknown) { this.results[engineId] = { engineVersion, result }; }
  get(engineId: string) { return this.results[engineId]?.result; }
  snapshot(): Readonly<Record<string, unknown>> {
    return Object.freeze(Object.fromEntries(Object.entries(this.results).map(([k, v]) => [k, v.result])));
  }
  toJSON() { return this.results; }
}

export type EngineLoader = () => Promise<ExamEngine<any, any>>;

export interface Progress {
  done: Partial<Record<StepId, true>>;
  tokens: BioToken[];
}

export class Orchestrator {
  constructor(private loaders: Partial<Record<StepId, EngineLoader>>) {}
  isAvailable(id: StepId) { return id in this.loaders; }
  load(id: StepId) {
    const l = this.loaders[id];
    if (!l) throw new Error(`Step ${id} is not available yet`);
    return l();
  }
  /** First step, in §2.6 run order, that is neither done nor unavailable. */
  nextStep(p: Progress): StepDef | null {
    return STEPS.find(s => !p.done[s.id] && this.isAvailable(s.id)) ?? null;
  }
  bio(p: Progress) { return composeBio(tokensBySlot(p.tokens)); }
}
