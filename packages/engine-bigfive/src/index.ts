// Big Five / SLOAN engine (SPEC §2.2 contract, §4.1 scoring, §4.5 stopping, §5 explanations).
import { THRESHOLDS, type BioToken, type ExamEngine, type Explanation, type ItemView, type Response } from "@typo/engine-sdk";
import { eap, info, pAboveMedian, reverseScore } from "@typo/irt";
import { sloanToken } from "@typo/bio";
import itemsRaw from "./items.json" with { type: "json" };
import paramsRaw from "./params.json" with { type: "json" };

export type Trait = "E" | "N" | "C" | "A" | "O";
/** Rotation order = SLOAN letter order (S L O A N → E N C A O). */
export const TRAITS: Trait[] = ["E", "N", "C", "A", "O"];
export const TRAIT_NAMES: Record<Trait, string> = {
  E: "Extraversion", N: "Neuroticism", C: "Conscientiousness", A: "Agreeableness", O: "Openness",
};
/** SLOAN letters per trait: [high pole, low pole]. */
export const SLOAN_LETTERS: Record<Trait, [string, string]> = {
  E: ["S", "R"], N: ["L", "C"], C: ["O", "U"], A: ["A", "E"], O: ["I", "N"],
};

export interface BigFiveItem {
  id: string; trait: Trait; reverse: boolean; text: string;
  a: number; b: number[]; params_source: "expert" | "empirical";
}
const PARAMS = paramsRaw.items as Record<string, { a: number; b: number[]; params_source: "expert" | "empirical" }>;
export const ITEMS: BigFiveItem[] = (itemsRaw as { id: string; trait: Trait; reverse: boolean; text: string }[])
  .map(i => ({ ...i, ...PARAMS[i.id]! }));
const BY_ID = new Map(ITEMS.map(i => [i.id, i]));

export const LIKERT_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] as const;

export interface BigFiveState {
  v: 1;
  answers: { itemId: string; x: number }[];   // raw 1..5 as the user chose it
  priorMean: Record<Trait, number>;
}

export interface TraitResult {
  trait: Trait; name: string;
  theta: number; se: number;
  /** Percentile against the model's standard-normal norm (not real population norms). */
  percentile: number;
  /** Posterior probability that the trait is above the median. */
  pHigh: number;
  letter: string; items: number; done: boolean;
}

export interface BigFiveResult {
  traits: Record<Trait, TraitResult>;
  sloan: string;
  confidence: number;
  /** Published to the profile store for other engines (temperament, Jung E/I prior). */
  published: { E: { theta: number; se: number }; N: { theta: number; se: number } };
}

const answersFor = (s: BigFiveState, t: Trait) =>
  s.answers.map(a => ({ a, item: BY_ID.get(a.itemId)! })).filter(r => r.item.trait === t);

function estimate(s: BigFiveState, t: Trait, skip?: string) {
  const rows = answersFor(s, t).filter(r => r.a.itemId !== skip)
    .map(r => ({ a: r.item.a, b: r.item.b, x: r.a.x, reverse: r.item.reverse }));
  return { ...eap(rows, s.priorMean[t]), n: rows.length };
}

function traitDone(s: BigFiveState, t: Trait): boolean {
  const T = THRESHOLDS.stop;
  const e = estimate(s, t);
  if (e.n === 0) return false;
  const p = pAboveMedian(e.theta, e.se);
  return e.se <= T.bigfiveSE || Math.max(p, 1 - p) >= T.bigfiveLetterP
    || e.n >= T.bigfiveCap || e.n >= ITEMS.filter(i => i.trait === t).length;
}

function traitResult(s: BigFiveState, t: Trait): TraitResult {
  const e = estimate(s, t);
  const pHigh = pAboveMedian(e.theta, e.se);
  const [hi, lo] = SLOAN_LETTERS[t];
  return {
    trait: t, name: TRAIT_NAMES[t], theta: e.theta, se: e.se,
    percentile: Math.round(100 * pAboveMedian(e.theta, 1)), // Φ(θ)
    pHigh, letter: pHigh >= 0.5 ? hi : lo, items: e.n, done: traitDone(s, t),
  };
}

const toItemView = (i: BigFiveItem): ItemView => ({
  id: i.id, format: "likert5", text: i.text,
  options: LIKERT_LABELS.map((text, k) => ({ id: String(k + 1), text })),
});

export const bigFiveEngine: ExamEngine<BigFiveState, BigFiveResult> & {
  allDone(s: BigFiveState): boolean;
} = {
  meta: {
    id: "bigfive",
    name: "Big Five / SLOAN",
    version: "0.1.0",
    evidence: { traits: "strong", sloan: "moderate" },
    glossary: {
      S: "Social: high Extraversion", R: "Reserved: low Extraversion",
      L: "Limbic: high Neuroticism", C: "Calm: low Neuroticism",
      O: "Organized: high Conscientiousness", U: "Unstructured: low Conscientiousness",
      A: "Accommodating: high Agreeableness", E: "Egocentric: low Agreeableness",
      I: "Inquisitive: high Openness", N: "Non-curious: low Openness",
      X: "Middle: about 50%, no clear lean",
      "/x/": "Strong lean (slashes)", "[x]": "Borderline lean (brackets)",
    },
    optionalInputs: [],
  },

  init(_profile) {
    return { v: 1, answers: [], priorMean: { E: 0, N: 0, C: 0, A: 0, O: 0 } };
  },

  /** Max information at the current θ̂, rotating through unfinished traits. */
  next(s) {
    const open = TRAITS.filter(t => !traitDone(s, t));
    if (open.length === 0 || s.answers.length >= THRESHOLDS.stop.globalCap) return null;
    const last = s.answers.at(-1);
    const lastT = last ? BY_ID.get(last.itemId)!.trait : TRAITS.at(-1)!;
    const start = TRAITS.indexOf(lastT);
    const t = [1, 2, 3, 4, 5].map(k => TRAITS[(start + k) % 5]!).find(x => open.includes(x))!;
    const asked = new Set(s.answers.map(a => a.itemId));
    const theta = estimate(s, t).theta;
    const best = ITEMS.filter(i => i.trait === t && !asked.has(i.id))
      .sort((a, b) => info(theta, b.a, b.b) - info(theta, a.a, a.b) || a.id.localeCompare(b.id))[0];
    return best ? toItemView(best) : null;
  },

  /** All 40 items, interleaved by trait (E1, N1, C1, A1, O1, E2, …). */
  form() {
    const per = TRAITS.map(t => ITEMS.filter(i => i.trait === t));
    return per[0]!.flatMap((_, k) => per.map(p => toItemView(p[k]!)));
  },

  answer(s, itemId, r: Response) {
    if (typeof r !== "number" || !Number.isInteger(r) || r < 1 || r > 5) throw new Error(`Likert answer 1..5 expected, got ${String(r)}`);
    if (!BY_ID.has(itemId)) throw new Error(`Unknown item ${itemId}`);
    return { ...s, answers: [...s.answers.filter(a => a.itemId !== itemId), { itemId, x: r }] };
  },

  progress(s) {
    return TRAITS.map(t => {
      const r = traitResult(s, t);
      return { output: r.name, confidence: Math.max(r.pHigh, 1 - r.pHigh), done: r.done };
    });
  },

  allDone(s) { return bigFiveEngine.next(s) === null; },

  result(s) {
    const traits = Object.fromEntries(TRAITS.map(t => [t, traitResult(s, t)])) as Record<Trait, TraitResult>;
    const confidence = TRAITS.reduce((m, t) => m + Math.max(traits[t].pHigh, 1 - traits[t].pHigh), 0) / 5;
    return {
      traits,
      sloan: sloanToken(TRAITS.map(t => traits[t].pHigh)),
      confidence,
      published: {
        E: { theta: traits.E.theta, se: traits.E.se },
        N: { theta: traits.N.theta, se: traits.N.se },
      },
    };
  },

  /** §5: the 3 answers that moved each trait most (leave-one-out shift in θ). */
  explain(s) {
    return TRAITS.map((t): Explanation => {
      const r = traitResult(s, t);
      const top = answersFor(s, t).map(({ a, item }) => {
        const delta = r.theta - estimate(s, t, a.itemId).theta;
        const keyed = item.reverse ? reverseScore(a.x) : a.x;
        return {
          itemId: item.id,
          answer: `“${item.text}” — ${LIKERT_LABELS[a.x - 1]}${item.reverse ? " (reverse-keyed)" : ""}`,
          delta: Math.round(delta * 100) / 100, keyed,
        };
      }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3)
        .map(({ itemId, answer, delta }) => ({ itemId, answer, delta }));
      const conf = Math.max(r.pHigh, 1 - r.pHigh);
      const [hi, lo] = SLOAN_LETTERS[t];
      return {
        output: r.name, result: `${r.letter} (${r.percentile}th percentile)`, confidence: conf,
        topEvidence: top, runnerUp: { result: r.letter === hi ? lo : hi, confidence: 1 - conf },
      };
    });
  },

  serialize(s) { return JSON.stringify(s); },
  deserialize(raw) {
    const s = JSON.parse(raw) as BigFiveState;
    if (s.v !== 1 || !Array.isArray(s.answers)) throw new Error("Unrecognised Big Five state");
    return s;
  },

  bioTokens(s): BioToken[] {
    if (s.answers.length === 0 || !bigFiveEngine.allDone(s)) return [];
    const r = bigFiveEngine.result(s);
    return [{ slot: "sloan", text: r.sloan, confidence: r.confidence, source: "test" }];
  },
};

export default bigFiveEngine;
