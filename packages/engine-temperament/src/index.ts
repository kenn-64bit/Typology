// Temperament engine: Eysenck's Extraversion × Neuroticism quadrants (SPEC §4.3), as one fixed form:
// 8 own E/N items (skipped when a Big Five result exists) + 1 ranking of the four temperament descriptions.
import { THRESHOLDS, type BioToken, type ExamEngine, type Explanation, type ItemView, type Response } from "@typo/engine-sdk";
import { createLikertCat, likertItems, type LikertAnswer } from "@typo/likert-cat";
import { pAboveMedian } from "@typo/irt";
import { temperamentToken, type Temp } from "@typo/bio";

export const TEMPS: Temp[] = ["choleric", "melancholic", "sanguine", "phlegmatic"];

/** Original E/N items (used only without a Big Five result). */
export const FALLBACK = likertItems([
  ["te1", "E", false, "I feel at home in lively, busy company."],
  ["tn1", "N", false, "My mood is easily shaken by small things."],
  ["te2", "E", true, "I prefer a quiet evening to a night out."],
  ["tn2", "N", true, "I rarely feel anxious or on edge."],
  ["te3", "E", false, "I'm quick to speak up in a group."],
  ["tn3", "N", false, "Worries tend to circle in my head."],
  ["te4", "E", true, "Long social gatherings leave me worn out."],
  ["tn4", "N", true, "I stay even-tempered under stress."],
]);
const S = THRESHOLDS.stop;
const cat = createLikertCat({ items: FALLBACK, scales: ["E", "N"], stop: () => ({ se: S.tempFallbackSE, letterP: 1.01, cap: 99 }) });

/** Original descriptions, ranked once by the user. */
export const DESCRIPTIONS: Record<Temp, string> = {
  choleric: "Driven and intense: I push hard, react strongly and like to be in charge.",
  melancholic: "Deep and serious: I feel things strongly but mostly keep them inside.",
  sanguine: "Bright and sociable: I'm upbeat, talkative and bounce back fast.",
  phlegmatic: "Calm and steady: I'm easygoing, quiet and hard to rattle.",
};
export const RANK_ID = "trank";

export interface TemperamentState {
  v: 2;
  fromBigFive: { E: { theta: number; se: number }; N: { theta: number; se: number } } | null;
  answers: LikertAnswer[];
  ranking: Temp[] | null;
}
export interface TemperamentResult {
  probs: Record<Temp, number>; token: string; top: Temp; pTop: number;
  E: { pHigh: number; percentile: number }; N: { pHigh: number; percentile: number };
  source: "bigfive" | "own-items"; ranking: Temp[] | null;
}

function traits(s: TemperamentState) {
  const f = (sc: "E" | "N") => {
    const e = s.fromBigFive ? s.fromBigFive[sc] : cat.estimate(s.answers, sc);
    return { pHigh: pAboveMedian(e.theta, e.se), percentile: Math.round(100 * pAboveMedian(e.theta, 1)) };
  };
  return { E: f("E"), N: f("N") };
}

/** P(quadrant) from independent E and N posteriors, reweighted by the description ranking. */
export function quadrant(s: TemperamentState, useRanking = true): Record<Temp, number> {
  const { E, N } = traits(s);
  const p: Record<Temp, number> = {
    choleric: E.pHigh * N.pHigh, melancholic: (1 - E.pHigh) * N.pHigh,
    sanguine: E.pHigh * (1 - N.pHigh), phlegmatic: (1 - E.pHigh) * (1 - N.pHigh),
  };
  if (useRanking && s.ranking) s.ranking.forEach((t, i) => (p[t] *= THRESHOLDS.likelihood.temperamentRank[i]!));
  const z = TEMPS.reduce((x, t) => x + p[t], 0);
  return Object.fromEntries(TEMPS.map(t => [t, p[t] / z])) as Record<Temp, number>;
}

const rankView: ItemView = {
  id: RANK_ID, format: "rank", text: "How well does each description fit you?",
  options: TEMPS.map(t => ({ id: t, text: DESCRIPTIONS[t] })),
};
const formOf = (s: TemperamentState): ItemView[] => [...(s.fromBigFive ? [] : cat.form()), rankView];
const isDone = (s: TemperamentState) => !!s.ranking && (s.fromBigFive !== null || FALLBACK.every(i => s.answers.some(a => a.itemId === i.id)));
const topOf = (p: Record<Temp, number>) => [...TEMPS].sort((a, b) => p[b] - p[a]) as Temp[];

export const temperamentEngine: ExamEngine<TemperamentState, TemperamentResult> = {
  meta: {
    id: "temperament", name: "Four Temperaments", version: "0.2.0",
    evidence: { temperament: "exploratory" },
    glossary: { chol: "Choleric", mel: "Melancholic", sang: "Sanguine", phleg: "Phlegmatic", "[dom]": "Pure, no second temperament", "x-y": "Blend" },
    optionalInputs: ["bigfive.published.E", "bigfive.published.N"],
  },
  init(profile) {
    const bf = profile.bigfive as { published?: TemperamentState["fromBigFive"] } | undefined;
    return { v: 2, fromBigFive: bf?.published ?? null, answers: [], ranking: null };
  },
  form: formOf,
  next(s) {
    const done = new Set([...s.answers.map(a => a.itemId), ...(s.ranking ? [RANK_ID] : [])]);
    return formOf(s).find(v => !done.has(v.id)) ?? null;
  },
  answer(s, itemId, r: Response) {
    if (itemId === RANK_ID) {
      if (!Array.isArray(r) || [...r].sort().join() !== [...TEMPS].sort().join()) throw new Error("Rank all four descriptions");
      return { ...s, ranking: [...r] as Temp[] };
    }
    return { ...s, answers: cat.answer(s.answers, itemId, r) };
  },
  progress(s) { const p = quadrant(s); return [{ output: "temperament", confidence: p[topOf(p)[0]!], done: isDone(s) }]; },
  result(s) {
    const probs = quadrant(s); const [top] = topOf(probs); const tr = traits(s);
    return { probs, token: temperamentToken(probs), top: top!, pTop: probs[top!], E: tr.E, N: tr.N, source: s.fromBigFive ? "bigfive" : "own-items", ranking: s.ranking };
  },
  explain(s): Explanation[] {
    const r = temperamentEngine.result(s); const second = topOf(r.probs)[1]!;
    const ev = s.fromBigFive
      ? [{ itemId: "bigfive", answer: `Your Big Five result: Extraversion ${r.E.percentile}th, Neuroticism ${r.N.percentile}th percentile`, delta: 0 }]
      : [...cat.evidence(s.answers, "E", 0, 1), ...cat.evidence(s.answers, "N", 0, 1)];
    const rk = s.ranking ? [{ itemId: RANK_ID, answer: `You ranked the ${s.ranking[0]} description first`,
      delta: Math.round(Math.log(r.probs[r.top] / quadrant(s, false)[r.top]) * 100) / 100 }] : [];
    return [{ output: "Temperament", result: r.token, confidence: r.pTop, topEvidence: [...rk, ...ev].slice(0, 3), runnerUp: { result: second, confidence: r.probs[second] } }];
  },
  serialize: s => JSON.stringify(s),
  deserialize(raw) { const s = JSON.parse(raw) as TemperamentState; if (s.v !== 2) throw new Error("Unrecognised temperament state"); return s; },
  bioTokens(s): BioToken[] {
    if (!isDone(s)) return [];
    const r = temperamentEngine.result(s);
    return [{ slot: "temperament", text: r.token, confidence: r.pTop, source: "test" }];
  },
};
export default temperamentEngine;
