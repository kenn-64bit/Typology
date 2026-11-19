// MOTIVES engine: seven bipolar traits in the fixed order M-O-T-I-V-E-S, scored like the Big Five
// (one IRT scale per trait). Optional prior from a published Big Five result. Research status: low.
import { THRESHOLDS, type BioToken, type ExamEngine, type Explanation, type Response } from "@typo/engine-sdk";
import { createLikertCat, likertItems, type LikertAnswer } from "@typo/likert-cat";
import { motivesToken, MOTIVES } from "@typo/bio";

export const TRAITS = ["M", "O", "T", "I", "V", "E", "S"] as const;
export type Trait = (typeof TRAITS)[number];
export const TRAIT_NAMES: Record<Trait, [string, string]> = {
  M: ["Materialistic", "Ascetic"], O: ["Offbeat", "Conventional"], T: ["Thinking", "Haphazard"],
  I: ["Interpersonal", "Withdrawn"], V: ["Vital", "Dependent"], E: ["Easygoing", "Rigid"], S: ["Sectarian", "Globalistic"],
};

/** Original wording, 3 per trait; `true` = reverse-keyed (agreeing points to the low pole). */
export const ITEMS = likertItems([
  ["m1", "M", false, "Owning nice things is an important part of a good life."],
  ["m2", "M", true, "I could be happy with very few possessions."],
  ["m3", "M", false, "I pay attention to brands, prices and what things are worth."],
  ["o1", "O", false, "People often find my tastes unusual."],
  ["o2", "O", true, "I prefer to do things the way they are normally done."],
  ["o3", "O", false, "I enjoy ideas and styles that most people find strange."],
  ["t1", "T", false, "I think a decision through carefully before acting on it."],
  ["t2", "T", true, "I often act first and figure things out later."],
  ["t3", "T", false, "I like to keep my plans, files and thoughts in order."],
  ["i1", "I", false, "I genuinely enjoy getting to know new people."],
  ["i2", "I", true, "I keep most people at a distance."],
  ["i3", "I", false, "Other people's company usually lifts my mood."],
  ["v1", "V", false, "I wake up with energy for the day ahead."],
  ["v2", "V", true, "I often feel drained, even after rest."],
  ["v3", "V", false, "I bounce back quickly when things go wrong."],
  ["e1", "E", false, "I let small annoyances go without much thought."],
  ["e2", "E", true, "I get irritated when things are not done my way."],
  ["e3", "E", false, "I adapt easily when plans change."],
  ["s1", "S", false, "I feel strongest loyalty to my own group, culture or community."],
  ["s2", "S", true, "I see myself as a citizen of the whole world first."],
  ["s3", "S", false, "Our own traditions should come before outside influences."],
]);

const S = THRESHOLDS.stop;
const cat = createLikertCat({ items: ITEMS, scales: TRAITS, stop: () => ({ se: S.motivesSE, letterP: S.motivesLetterP, cap: S.motivesCap }) });

export interface MotivesState { v: 1; answers: LikertAnswer[]; prior: Record<Trait, number> }
export interface MotivesResult {
  traits: Record<Trait, { name: string; pHigh: number; percentile: number; letter: string; items: number }>;
  code: string; confidence: number; usedBigFive: boolean;
}

/** Map a published Big Five result onto MOTIVES priors (author's reported overlaps; strength r from thresholds). */
export function priorFromBigFive(profile: Readonly<Record<string, unknown>>): Record<Trait, number> | null {
  const bf = profile.bigfive as { traits?: Record<string, { theta: number }> } | undefined;
  const th = bf?.traits; if (!th) return null;
  const r = THRESHOLDS.priors.motivesFromBigFive;
  const g = (k: string) => th[k]?.theta ?? 0;
  return { M: 0, O: r * g("O"), T: r * g("C"), I: r * g("A"), V: r * (g("E") - g("N")) / Math.SQRT2, E: 0, S: 0 };
}

const traitOf = (s: MotivesState, t: Trait) => {
  const e = cat.estimate(s.answers, t, s.prior[t]);
  const [hi, lo] = MOTIVES[TRAITS.indexOf(t)]!;
  return { name: TRAIT_NAMES[t].join(" / "), pHigh: e.pHigh, percentile: e.percentile, letter: e.pHigh >= 0.5 ? hi : lo, items: e.n };
};
const finished = (s: MotivesState) => s.answers.length > 0 && cat.next(s.answers, s.prior) === null;

export const motivesEngine: ExamEngine<MotivesState, MotivesResult> = {
  meta: {
    id: "motives", name: "MOTIVES", version: "0.1.0",
    evidence: { traits: "exploratory" },
    glossary: Object.fromEntries(TRAITS.map((t, i) => [`${MOTIVES[i]![0]} / ${MOTIVES[i]![1]}`, TRAIT_NAMES[t].join(" / ")])),
    optionalInputs: ["bigfive.traits"],
  },
  init(profile) {
    const p = priorFromBigFive(profile);
    return { v: 1, answers: [], prior: p ?? { M: 0, O: 0, T: 0, I: 0, V: 0, E: 0, S: 0 } };
  },
  next(s) { const it = cat.next(s.answers, s.prior); return it ? cat.view(it) : null; },
  form: () => cat.form(),
  answer(s, itemId, r: Response) { return { ...s, answers: cat.answer(s.answers, itemId, r) }; },
  progress(s) {
    return TRAITS.map(t => { const r = traitOf(s, t); return { output: r.name, confidence: Math.max(r.pHigh, 1 - r.pHigh), done: cat.done(s.answers, t, s.prior[t]) }; });
  },
  result(s) {
    const traits = Object.fromEntries(TRAITS.map(t => [t, traitOf(s, t)])) as MotivesResult["traits"];
    const ps = TRAITS.map(t => traits[t].pHigh);
    return {
      traits, code: motivesToken(ps),
      confidence: ps.reduce((m, p) => m + Math.max(p, 1 - p), 0) / ps.length,
      usedBigFive: TRAITS.some(t => s.prior[t] !== 0),
    };
  },
  explain(s): Explanation[] {
    return TRAITS.map(t => {
      const r = traitOf(s, t); const c = Math.max(r.pHigh, 1 - r.pHigh);
      return { output: r.name, result: `${r.letter} (${r.percentile}th percentile)`, confidence: c, topEvidence: cat.evidence(s.answers, t, s.prior[t]) };
    });
  },
  serialize: s => JSON.stringify(s),
  deserialize(raw) { const s = JSON.parse(raw) as MotivesState; if (s.v !== 1) throw new Error("Unrecognised MOTIVES state"); return s; },
  bioTokens(s): BioToken[] {
    if (!finished(s)) return [];
    const r = motivesEngine.result(s);
    return [{ slot: "motives", text: r.code, confidence: r.confidence, source: "test" }];
  },
};
export default motivesEngine;
