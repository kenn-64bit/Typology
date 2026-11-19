// Temperament engine: Eysenck's Extraversion × Neuroticism quadrants (SPEC §4.3), as one fixed form:
// 8 own E/N items (skipped when a compatible Big Five result exists) + 1 ranking of the four temperament descriptions.
//
// Meaning of the outputs (TM-01): `probs` are QUADRANT CERTAINTIES (model probability of each quadrant given the E/N
// posteriors and the ranking), not spatial distance. "[dom]" = one quadrant strongly favoured. Where the point sits
// on the grid is reported separately (`E`/`N` percentiles, `nearLine`). The description ranking is also shown as an
// agreement check against the trait-only quadrant (TM-02).
import {
  compatibleResult, isFiniteNumber, likertQualityNotes, THRESHOLDS,
  type BioToken, type Dependency, type ExamEngine, type Explanation, type ItemView, type QualityNote, type ResultMeta, type Response,
} from "@typo/engine-sdk";
import { createLikertCat, likertItems, type LikertAnswer } from "@typo/likert-cat";
import { pAboveMedian } from "@typo/irt";
import { temperamentToken, type Temp } from "@typo/bio";

/** "temperament-3": probs named as quadrant certainty; agreement and boundary reporting; versioned Big Five import. */
export const TEMPERAMENT_SCORING_VERSION = "temperament-3";
/** Big Five scoring versions whose published E/N θ and SD mean what this engine expects. null = saved before versions. */
export const COMPATIBLE_BIGFIVE: readonly (string | null)[] = [null, "bigfive-2"];

export const TEMPS: Temp[] = ["choleric", "melancholic", "sanguine", "phlegmatic"];

/** Original E/N items (used only without a compatible Big Five result). */
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
// The fixed form asks every fallback item; this stop rule only affects the adaptive `next()` order.
const cat = createLikertCat({ items: FALLBACK, scales: ["E", "N"], stop: () => ({ se: THRESHOLDS.stop.tempFallbackSE, letterP: 1.01, cap: FALLBACK.length }) });

/** Original descriptions, ranked once by the user. */
export const DESCRIPTIONS: Record<Temp, string> = {
  choleric: "Driven and intense: I push hard, react strongly and like to be in charge.",
  melancholic: "Deep and serious: I feel things strongly but mostly keep them inside.",
  sanguine: "Bright and sociable: I'm upbeat, talkative and bounce back fast.",
  phlegmatic: "Calm and steady: I'm easygoing, quiet and hard to rattle.",
};
export const RANK_ID = "trank";

type Est = { theta: number; se: number };
export interface TemperamentState {
  v: 3;
  fromBigFive: { E: Est; N: Est } | null;
  /** Scoring version of the imported Big Five result ("legacy" when saved before versions existed). */
  bigFiveVersion: string | null;
  answers: LikertAnswer[];
  ranking: Temp[] | null;
}
export interface Axis { theta: number; se: number; pHigh: number; percentile: number }
export type Agreement = "agrees" | "partly" | "conflicts";
export interface TemperamentResult {
  /** Quadrant certainty from E/N and the ranking (sums to 1). Not a distance. */
  probs: Record<Temp, number>;
  /** Quadrant certainty from E/N alone, before the ranking. */
  traitProbs: Record<Temp, number>;
  token: string; top: Temp; pTop: number;
  /** Trait-only leading quadrant, or null when quadrants tie (e.g. E and N both exactly at the midpoint). */
  traitTop: Temp | null;
  /** Where the trait-only top was placed in the ranking and what that means; null without a ranking or a traitTop. */
  agreement: { rankOfTraitTop: number; status: Agreement; firstChoice: Temp } | null;
  /** True when E or N sits within THRESHOLDS.temperament.nearLine of the midpoint: the point is near a boundary. */
  nearLine: boolean;
  E: Axis; N: Axis;
  source: "bigfive" | "own-items"; ranking: Temp[] | null;
  meta: ResultMeta;
}

/** A compatible, finite Big Five E/N import, or null. Used by init() and by the page to show the right form length. */
export function importableBigFive(profile: Readonly<Record<string, unknown>>): { E: Est; N: Est; version: string | null } | null {
  const c = compatibleResult(profile, "bigfive", COMPATIBLE_BIGFIVE);
  const pub = (c?.result as { published?: Record<string, { theta?: unknown; se?: unknown }> } | undefined)?.published;
  const ok = (e: { theta?: unknown; se?: unknown } | undefined): e is Est => !!e && isFiniteNumber(e.theta) && isFiniteNumber(e.se) && e.se > 0;
  if (!c || !pub || !ok(pub.E) || !ok(pub.N)) return null;
  return { E: { theta: pub.E.theta, se: pub.E.se }, N: { theta: pub.N.theta, se: pub.N.se }, version: c.scoringVersion };
}

function axes(s: TemperamentState): { E: Axis; N: Axis } {
  const f = (sc: "E" | "N"): Axis => {
    const e = s.fromBigFive ? s.fromBigFive[sc] : cat.estimate(s.answers, sc);
    return { theta: e.theta, se: e.se, pHigh: pAboveMedian(e.theta, e.se), percentile: Math.round(100 * pAboveMedian(e.theta, 1)) };
  };
  return { E: f("E"), N: f("N") };
}

/** P(quadrant) from independent E and N posteriors, reweighted by the description ranking. */
export function quadrant(s: TemperamentState, useRanking = true): Record<Temp, number> {
  const { E, N } = axes(s);
  const p: Record<Temp, number> = {
    choleric: E.pHigh * N.pHigh, melancholic: (1 - E.pHigh) * N.pHigh,
    sanguine: E.pHigh * (1 - N.pHigh), phlegmatic: (1 - E.pHigh) * (1 - N.pHigh),
  };
  if (useRanking && s.ranking) s.ranking.forEach((t, i) => (p[t] *= THRESHOLDS.likelihood.temperamentRank[i]!));
  const z = TEMPS.reduce((x, t) => x + p[t], 0);
  if (!(z > 0) || !Number.isFinite(z)) throw new Error("Temperament posterior could not be normalised");
  return Object.fromEntries(TEMPS.map(t => [t, p[t] / z])) as Record<Temp, number>;
}

const rankView: ItemView = {
  id: RANK_ID, format: "rank", text: "Put the four descriptions in order, from most like you to least like you.",
  options: TEMPS.map(t => ({ id: t, text: DESCRIPTIONS[t] })),
};
const formOf = (s: TemperamentState): ItemView[] => [...(s.fromBigFive ? [] : cat.form()), rankView];
const isDone = (s: TemperamentState) => !!s.ranking && (s.fromBigFive !== null || FALLBACK.every(i => s.answers.some(a => a.itemId === i.id)));
const topOf = (p: Record<Temp, number>) => [...TEMPS].sort((a, b) => p[b] - p[a]) as Temp[];
const TIE = 1e-9;

function agreementOf(traitTop: Temp | null, ranking: Temp[] | null): TemperamentResult["agreement"] {
  if (!traitTop || !ranking) return null;
  const k = ranking.indexOf(traitTop) + 1;
  return { rankOfTraitTop: k, status: k === 1 ? "agrees" : k === 2 ? "partly" : "conflicts", firstChoice: ranking[0]! };
}

function metaOf(s: TemperamentState, r: Omit<TemperamentResult, "meta">): ResultMeta {
  const total = formOf(s).length;
  const answered = (s.fromBigFive ? 0 : s.answers.length) + (s.ranking ? 1 : 0);
  const quality: QualityNote[] = [];
  if (!s.fromBigFive) {
    const raw = (sc: string, rev: boolean) => s.answers.filter(a => { const i = cat.byId.get(a.itemId)!; return i.scale === sc && i.reverse === rev; }).map(a => a.x);
    const order = new Map(FALLBACK.map((i, k) => [i.id, k]));
    quality.push(...likertQualityNotes(
      [...s.answers].sort((a, b) => order.get(a.itemId)! - order.get(b.itemId)!).map(a => a.x),
      [{ output: "Extraversion", forward: raw("E", false), reverse: raw("E", true) },
       { output: "Neuroticism", forward: raw("N", false), reverse: raw("N", true) }], THRESHOLDS.quality));
  }
  if (answered < total) quality.push({ code: "incomplete", message: `${total - answered} of ${total} questions were not answered.` });
  const dependencies: Dependency[] = s.fromBigFive
    ? [{ engine: "bigfive", scoringVersion: s.bigFiveVersion ?? "legacy", used: `E θ ${s.fromBigFive.E.theta.toFixed(3)} SD ${s.fromBigFive.E.se.toFixed(3)}; N θ ${s.fromBigFive.N.theta.toFixed(3)} SD ${s.fromBigFive.N.se.toFixed(3)}` }]
    : [];
  return {
    engine: "temperament", scoringVersion: TEMPERAMENT_SCORING_VERSION,
    completion: { answered, total, complete: answered === total },
    unresolved: r.traitTop ? [] : ["trait-derived quadrant"],
    quality,
    uncertainty: [
      ...TEMPS.map(t => ({ output: t, event: `quadrant is ${t} (E/N sign posteriors × ranking weights)`, kind: "model-probability" as const, value: r.probs[t], calibrated: false as const })),
      ...TEMPS.map(t => ({ output: t, event: `quadrant is ${t} (E/N sign posteriors only)`, kind: "model-probability" as const, value: r.traitProbs[t], calibrated: false as const })),
      { output: "Extraversion", event: "posterior SD of θ (score units)", kind: "posterior-sd", value: r.E.se, calibrated: false },
      { output: "Neuroticism", event: "posterior SD of θ (score units)", kind: "posterior-sd", value: r.N.se, calibrated: false },
    ],
    dependencies,
  };
}

export const temperamentEngine: ExamEngine<TemperamentState, TemperamentResult> = {
  meta: {
    id: "temperament", name: "Four Temperaments", version: "0.3.0", scoringVersion: TEMPERAMENT_SCORING_VERSION,
    evidence: { temperament: "exploratory" },
    glossary: {
      chol: "Choleric", mel: "Melancholic", sang: "Sanguine", phleg: "Phlegmatic",
      "[dom]": "One quadrant strongly favoured: runner-up quadrant under 20% model probability", "x-y": "Two quadrants both plausible, more likely first",
    },
    optionalInputs: ["bigfive.published.E", "bigfive.published.N"],
  },
  /** Reads the latest saved Big Five result on every call; incompatible or malformed results fall back to own items. */
  init(profile) {
    const bf = importableBigFive(profile);
    return { v: 3, fromBigFive: bf ? { E: bf.E, N: bf.N } : null, bigFiveVersion: bf ? bf.version : null, answers: [], ranking: null };
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
    if (s.fromBigFive) throw new Error("This form uses the Big Five result; it has no own E/N items");
    return { ...s, answers: cat.answer(s.answers, itemId, r) };
  },
  progress(s) { const p = quadrant(s); return [{ output: "temperament", confidence: p[topOf(p)[0]!], done: isDone(s) }]; },
  result(s) {
    const probs = quadrant(s), traitProbs = quadrant(s, false);
    const [top] = topOf(probs); const [t1, t2] = topOf(traitProbs);
    const traitTop = traitProbs[t1!] - traitProbs[t2!] > TIE ? t1! : null;
    const { E, N } = axes(s);
    const near = THRESHOLDS.temperament.nearLine;
    const base = {
      probs, traitProbs, token: temperamentToken(probs), top: top!, pTop: probs[top!], traitTop,
      agreement: agreementOf(traitTop, s.ranking),
      nearLine: Math.abs(E.percentile / 100 - 0.5) < near || Math.abs(N.percentile / 100 - 0.5) < near,
      E, N, source: s.fromBigFive ? "bigfive" as const : "own-items" as const, ranking: s.ranking,
    };
    return { ...base, meta: metaOf(s, base) };
  },
  explain(s): Explanation[] {
    const r = temperamentEngine.result(s); const second = topOf(r.probs)[1]!;
    const ev = s.fromBigFive
      ? [{ itemId: "bigfive", answer: `Your Big Five result: Extraversion ${r.E.percentile}th, Neuroticism ${r.N.percentile}th model percentile`, delta: 0 }]
      : [...cat.evidence(s.answers, "E", 0, 1), ...cat.evidence(s.answers, "N", 0, 1)];
    const rk = s.ranking ? [{ itemId: RANK_ID, answer: `You ranked the ${s.ranking[0]} description first`,
      delta: Math.round(Math.log(r.probs[r.top] / r.traitProbs[r.top]) * 100) / 100 }] : [];
    return [{
      output: "Temperament", result: r.token, confidence: r.pTop, confidenceEvent: `quadrant is ${r.top} (model, uncalibrated)`,
      topEvidence: [...rk, ...ev].slice(0, 3), runnerUp: { result: second, confidence: r.probs[second] },
    }];
  },
  serialize: s => JSON.stringify(s),
  deserialize(raw) {
    const s = JSON.parse(raw) as Omit<TemperamentState, "v"> & { v: number };
    if (s.v === 2) Object.assign(s, { v: 3, bigFiveVersion: null }); // v2 → v3: import version unknown
    if (s.v !== 3 || !Array.isArray(s.answers)) throw new Error("Unrecognised temperament state");
    const ids = new Set(FALLBACK.map(i => i.id)), seen = new Set<string>();
    for (const a of s.answers) {
      if (!ids.has(a?.itemId) || seen.has(a.itemId) || !Number.isInteger(a.x) || a.x < 1 || a.x > 5) throw new Error("Invalid temperament answer");
      seen.add(a.itemId);
    }
    if (s.fromBigFive !== null) {
      for (const k of ["E", "N"] as const) {
        const e = s.fromBigFive?.[k];
        if (!e || !isFiniteNumber(e.theta) || !isFiniteNumber(e.se) || e.se <= 0) throw new Error("Invalid imported Big Five value");
      }
      if (s.answers.length) throw new Error("Own E/N answers cannot coexist with a Big Five import");
    }
    if (s.ranking !== null && (!Array.isArray(s.ranking) || [...s.ranking].sort().join() !== [...TEMPS].sort().join())) throw new Error("Invalid ranking");
    return s as TemperamentState;
  },
  bioTokens(s): BioToken[] {
    if (!isDone(s)) return [];
    const r = temperamentEngine.result(s);
    return [{ slot: "temperament", text: r.token, confidence: r.pTop, source: "test" }];
  },
};
export default temperamentEngine;
