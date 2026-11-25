// MOTIVES engine: seven bipolar traits in the fixed order M-O-T-I-V-E-S, scored like the Big Five
// (one IRT scale per trait). Research status: low. Case and bars follow score level, not certainty (MO-01).
// Prior policy (X-04): scored independently of Big Five; see THRESHOLDS.priorPolicy.
import {
  likertQualityNotes, THRESHOLDS, validateLikertState,
  type BioToken, type ExamEngine, type Explanation, type ResultMeta, type Response, type UncertaintyMeasure,
} from "@typo/engine-sdk";
import { createLikertCat, likertItems, type LikertAnswer } from "@typo/likert-cat";
import { motivesDominance, motivesLetter, motivesToken, MOTIVES } from "@typo/bio";

/** "motives-2": level-based case/bars, balanced 2:2 keying, aligned I/V/M items, independent of Big Five. */
export const MOTIVES_SCORING_VERSION = "motives-2";

export const TRAITS = ["M", "O", "T", "I", "V", "E", "S"] as const;
export type Trait = (typeof TRAITS)[number];
/** Pole names match the MOTIVES page and glossary definitions (MO-04). */
export const TRAIT_NAMES: Record<Trait, [string, string]> = {
  M: ["Materialistic", "Ascetic"], O: ["Offbeat", "Conventional"], T: ["Thinking", "Haphazard"],
  I: ["Interpersonal", "Withholding"], V: ["Vital", "Depressed"], E: ["Easygoing", "Rigid"], S: ["Sectarian", "Globalistic"],
};

/**
 * Original wording, 4 per trait, 2 forward and 2 reverse (MO-02); `true` = reverse-keyed (agreeing points to the
 * low pole). I measures putting others' needs first, V optimism and energy, as the page defines them (MO-04).
 * New or reworded items (m3, m4, o4, t4, i1–i4, v2, v4, e4, s4) have no pilot data.
 */
export const ITEMS = likertItems([
  ["m1", "M", false, "Owning nice things is an important part of a good life."],
  ["m2", "M", true, "I could be happy with very few possessions."],
  ["m3", "M", false, "I want other people to see that I have done well for myself."],
  ["m4", "M", true, "Status and money are not what drive my choices."],
  ["o1", "O", false, "People often find my tastes unusual."],
  ["o2", "O", true, "I prefer to do things the way they are normally done."],
  ["o3", "O", false, "I enjoy ideas and styles that most people find strange."],
  ["o4", "O", true, "When a familiar option works, I see no reason to try a new one."],
  ["t1", "T", false, "I think a decision through carefully before acting on it."],
  ["t2", "T", true, "I often act first and figure things out later."],
  ["t3", "T", false, "I like to keep my plans, files and thoughts in order."],
  ["t4", "T", true, "I usually decide what to do on the day rather than plan ahead."],
  ["i1", "I", false, "I often put other people's needs ahead of my own."],
  ["i2", "I", true, "I keep my time and energy mostly for my own goals."],
  ["i3", "I", false, "I offer help before anyone has to ask for it."],
  ["i4", "I", true, "Other people's problems rarely become my business."],
  ["v1", "V", false, "I wake up with energy for the day ahead."],
  ["v2", "V", true, "I tend to expect that my plans will not work out."],
  ["v3", "V", false, "I bounce back quickly when things go wrong."],
  ["v4", "V", true, "I often give up on a goal before I really start it."],
  ["e1", "E", false, "I let small annoyances go without much thought."],
  ["e2", "E", true, "I get irritated when things are not done my way."],
  ["e3", "E", false, "I adapt easily when plans change."],
  ["e4", "E", true, "I find it hard to switch off and relax."],
  ["s1", "S", false, "I feel strongest loyalty to my own group, culture or community."],
  ["s2", "S", true, "I see myself as a citizen of the whole world first."],
  ["s3", "S", false, "Our own traditions should come before outside influences."],
  ["s4", "S", true, "People far away matter to me as much as people nearby."],
]);

const S = THRESHOLDS.stop;
const cat = createLikertCat({ items: ITEMS, scales: TRAITS, stop: () => ({ se: S.motivesSE, letterP: S.motivesLetterP, cap: S.motivesCap }) });
const ZERO: Record<Trait, number> = { M: 0, O: 0, T: 0, I: 0, V: 0, E: 0, S: 0 };

export interface MotivesState { v: 1; answers: LikertAnswer[]; prior: Record<Trait, number> }
export interface MotivesTrait {
  name: string;
  theta: number; se: number;
  /** Model percentile (built-in N(0,1) norm, not population norms). */
  percentile: number;
  /** Φ(θ): score level, the only input to case and bars. */
  level: number;
  lean: "high" | "low" | null;
  strength: "strong" | "medium" | "middle";
  /** Model probability that θ > 0 (sign certainty, uncalibrated). */
  pHigh: number;
  letter: string; items: number;
}
export interface MotivesResult {
  traits: Record<Trait, MotivesTrait>;
  code: string;
  /** Strongest trait, or null with tied `candidates` when no trait leads by the dominance gap. */
  dominant: { trait: Trait | null; candidates: Trait[] };
  /** @deprecated Mean sign certainty, not a probability that the code is right (X-06). Use `meta.uncertainty`. */
  confidence: number;
  /** Always false under the independent prior policy: Big Five results do not change MOTIVES scores. */
  usedBigFive: boolean;
  meta: ResultMeta;
}

/**
 * Unvalidated expert mapping from Big Five θ to MOTIVES prior means (author's reported overlaps, coefficient
 * THRESHOLDS.priors.motivesFromBigFive). Ignores Big Five SD. Not applied while THRESHOLDS.priorPolicy is
 * "independent"; kept so the mapping under discussion is documented in code.
 */
export function priorFromBigFive(profile: Readonly<Record<string, unknown>>): Record<Trait, number> | null {
  const bf = profile.bigfive as { traits?: Record<string, { theta: unknown }> } | undefined;
  const th = bf?.traits; if (!th) return null;
  const r = THRESHOLDS.priors.motivesFromBigFive;
  const g = (k: string) => { const v = th[k]?.theta; return typeof v === "number" && Number.isFinite(v) ? v : 0; };
  return { M: 0, O: r * g("O"), T: r * g("C"), I: r * g("A"), V: r * (g("E") - g("N")) / Math.SQRT2, E: 0, S: 0 };
}

const traitOf = (s: MotivesState, t: Trait): MotivesTrait => {
  const e = cat.estimate(s.answers, t, s.prior[t]);
  // Case follows the displayed percentile so a shown "80th" is always uppercase (MO-01).
  const letter = motivesLetter(e.percentile / 100, MOTIVES[TRAITS.indexOf(t)]!);
  const lean = letter === "X" ? null : e.percentile >= 50 ? "high" : "low";
  return {
    name: TRAIT_NAMES[t].join(" / "), theta: e.theta, se: e.se, percentile: e.percentile, level: e.level,
    lean, strength: letter === "X" ? "middle" : letter === letter.toUpperCase() ? "strong" : "medium",
    pHigh: e.pHigh, letter, items: e.n,
  };
};
const finished = (s: MotivesState) => s.answers.length > 0 && cat.next(s.answers, s.prior) === null;
const SIGN_EVENT = "score is above the model midpoint (θ > 0)";
const LOW_EVENT = "score is below the model midpoint (θ < 0)";

function resultMeta(s: MotivesState, traits: Record<Trait, MotivesTrait>, dominantTied: boolean): ResultMeta {
  const byId = new Map(ITEMS.map(i => [i.id, i]));
  const raw = (t: Trait, rev: boolean) => s.answers.filter(a => byId.get(a.itemId)!.scale === t && byId.get(a.itemId)!.reverse === rev).map(a => a.x);
  const order = new Map(ITEMS.map((i, k) => [i.id, k]));
  const all = [...s.answers].sort((a, b) => order.get(a.itemId)! - order.get(b.itemId)!).map(a => a.x);
  const quality = likertQualityNotes(all, TRAITS.map(t => ({ output: traits[t].name, forward: raw(t, false), reverse: raw(t, true) })), THRESHOLDS.quality);
  const answered = s.answers.length, total = ITEMS.length;
  if (answered < total) quality.push({ code: "incomplete", message: `${total - answered} of ${total} statements were not answered.` });
  const uncertainty: UncertaintyMeasure[] = TRAITS.flatMap(t => [
    { output: traits[t].name, event: SIGN_EVENT, kind: "model-probability" as const, value: traits[t].pHigh, calibrated: false as const },
    { output: traits[t].name, event: "posterior SD of θ (score units)", kind: "posterior-sd" as const, value: traits[t].se, calibrated: false as const },
  ]);
  return {
    engine: "motives", scoringVersion: MOTIVES_SCORING_VERSION,
    completion: { answered, total, complete: answered === total },
    unresolved: [...TRAITS.filter(t => traits[t].items === 0).map(t => traits[t].name), ...(dominantTied ? ["strongest trait"] : [])],
    quality, uncertainty, dependencies: [],
  };
}

export const motivesEngine: ExamEngine<MotivesState, MotivesResult> = {
  meta: {
    id: "motives", name: "MOTIVES", version: "0.2.0", scoringVersion: MOTIVES_SCORING_VERSION,
    evidence: { traits: "exploratory" },
    glossary: Object.fromEntries(TRAITS.map((t, i) => [`${MOTIVES[i]![0]} / ${MOTIVES[i]![1]}`, TRAIT_NAMES[t].join(" / ")])),
    optionalInputs: [],
  },
  /** Reads the profile on every call (latest saved result), but the independent policy applies no prior. */
  init(profile) {
    const mapped = THRESHOLDS.priorPolicy === "mapped-mean" ? priorFromBigFive(profile) : null;
    return { v: 1, answers: [], prior: mapped ?? { ...ZERO } };
  },
  next(s) { const it = cat.next(s.answers, s.prior); return it ? cat.view(it) : null; },
  form: () => cat.form(),
  answer(s, itemId, r: Response) { return { ...s, answers: cat.answer(s.answers, itemId, r) }; },
  progress(s) {
    return TRAITS.map(t => { const r = traitOf(s, t); return { output: r.name, confidence: Math.max(r.pHigh, 1 - r.pHigh), done: cat.done(s.answers, t, s.prior[t]) }; });
  },
  result(s) {
    const traits = Object.fromEntries(TRAITS.map(t => [t, traitOf(s, t)])) as MotivesResult["traits"];
    const levels = TRAITS.map(t => traits[t].percentile / 100);
    const dom = motivesDominance(levels);
    const ps = TRAITS.map(t => traits[t].pHigh);
    return {
      traits, code: motivesToken(levels),
      dominant: { trait: dom.index === null ? null : TRAITS[dom.index]!, candidates: dom.candidates.map(i => TRAITS[i]!) },
      confidence: ps.reduce((m, p) => m + Math.max(p, 1 - p), 0) / ps.length,
      usedBigFive: TRAITS.some(t => s.prior[t] !== 0),
      meta: resultMeta(s, traits, dom.index === null && dom.candidates.length > 1),
    };
  },
  explain(s): Explanation[] {
    return TRAITS.map(t => {
      const r = traitOf(s, t);
      return {
        output: r.name,
        result: r.lean ? `${r.letter} (${r.percentile}th model percentile)` : `X, no clear lean (${r.percentile}th model percentile)`,
        confidence: r.lean === "low" ? 1 - r.pHigh : r.pHigh,
        confidenceEvent: r.lean === "low" ? LOW_EVENT : SIGN_EVENT, topEvidence: cat.evidence(s.answers, t, s.prior[t]),
      };
    });
  },
  serialize: s => JSON.stringify(s),
  deserialize(raw) {
    const s = JSON.parse(raw) as MotivesState;
    validateLikertState(s, { version: 1, knownIds: new Set(ITEMS.map(i => i.id)), priorKeys: TRAITS, priorField: "prior" });
    return s;
  },
  bioTokens(s): BioToken[] {
    if (!finished(s)) return [];
    const r = motivesEngine.result(s);
    return [{ slot: "motives", text: r.code, confidence: r.confidence, source: "test" }];
  },
};
export default motivesEngine;
