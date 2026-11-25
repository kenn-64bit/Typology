// Jung engine (dossier Module 2): four preference scales (MBTI letters) and eight separately scored
// function-attitudes. The Jungian code (e.g. "IF(S) (FiSe)") comes from the function scores, so non-MBTI pairs are
// allowed; MBTI letters are measured separately by other items and can differ (JG-05). Research: moderate (scales).
//
// Publication (JG-01, JG-04): dominant and auxiliary are named only when their own model probabilities pass
// THRESHOLDS.jung.resolveP; otherwise the result lists candidates. Prior policy (X-04): no Big Five prior.
import {
  isFiniteNumber, likertQualityNotes, THRESHOLDS,
  type BioToken, type ExamEngine, type Explanation, type QualityNote, type ResultMeta, type Response, type UncertaintyMeasure,
} from "@typo/engine-sdk";
import { createLikertCat, likertItems, type LikertAnswer } from "@typo/likert-cat";
import { pAboveMedian } from "@typo/irt";
import { jungToken } from "@typo/bio";

/** "jung-2": balanced preference keying, candidate/unresolved roles, separate dom/aux probabilities, no prior. */
export const JUNG_SCORING_VERSION = "jung-2";

/** Preference scales; high pole first. */
export const SCALES = { EI: ["E", "I"], SN: ["N", "S"], TF: ["T", "F"], JP: ["J", "P"] } as const;
export type Scale = keyof typeof SCALES;
export const FUNCS = ["Ti", "Te", "Fi", "Fe", "Si", "Se", "Ni", "Ne"] as const;
export type Func = (typeof FUNCS)[number];
export const FUNC_NAMES: Record<Func, string> = {
  Ti: "Introverted Thinking", Te: "Extraverted Thinking", Fi: "Introverted Feeling", Fe: "Extraverted Feeling",
  Si: "Introverted Sensation", Se: "Extraverted Sensation", Ni: "Introverted iNtuition", Ne: "Extraverted iNtuition",
};
/** Interleaved rotation: one scale, one function, … */
const ROTATION = ["EI", "Ti", "SN", "Fe", "TF", "Ni", "JP", "Se", "Te", "Fi", "Si", "Ne"] as const;

/**
 * Original wording; `true` = reverse-keyed (agreeing points to the second pole). Preference scales are balanced 3:3
 * (JG-02). Function scales are 3 forward items each: uniform agreement lifts all eight together, so it produces
 * ties rather than a type, but three items cannot establish reliable eight-way discrimination (JG-03, open).
 * New or reworded, unpiloted: ei5, ei6, sn6, tf6, jp6, fi2.
 */
export const ITEMS = likertItems([
  ["ei1", "EI", false, "Talking things over with others helps me think."],
  ["ei2", "EI", true, "I recharge best on my own."],
  ["ei3", "EI", false, "I'd rather join in than watch from the side."],
  ["ei4", "EI", true, "I think before I speak, often for quite a while."],
  ["ei5", "EI", false, "A day spent mostly with other people usually suits me."],
  ["ei6", "EI", true, "I prefer to work through a problem alone before discussing it."],
  ["sn1", "SN", false, "I'm drawn to possibilities more than to what is already here."],
  ["sn2", "SN", true, "I trust facts I can see and check."],
  ["sn3", "SN", false, "I often read between the lines."],
  ["sn4", "SN", true, "I prefer clear, practical instructions to big-picture ideas."],
  ["sn5", "SN", false, "I get bored once I understand the pattern behind something."],
  ["sn6", "SN", true, "I pay more attention to what is happening than to what it might mean."],
  ["tf1", "TF", false, "When deciding, I weigh pros and cons more than people's feelings."],
  ["tf2", "TF", true, "I'd rather be kind than be right."],
  ["tf3", "TF", false, "I can criticise an idea without taking it personally."],
  ["tf4", "TF", true, "How a choice affects people matters most to me."],
  ["tf5", "TF", false, "Consistency matters more to me than making an exception."],
  ["tf6", "TF", true, "I will bend a rule when following it would hurt someone."],
  ["jp1", "JP", false, "I like to plan a trip in detail."],
  ["jp2", "JP", true, "I'd rather decide on the day."],
  ["jp3", "JP", false, "Unfinished tasks bother me until they're done."],
  ["jp4", "JP", true, "I keep my options open as long as I can."],
  ["jp5", "JP", false, "I feel calmer with a schedule."],
  ["jp6", "JP", true, "I enjoy changing my plans at short notice."],
  ["ti1", "Ti", false, "I trust a conclusion only once I've rebuilt the reasoning myself."],
  ["ti2", "Ti", false, "I enjoy finding the exact word or definition for something."],
  ["ti3", "Ti", false, "I notice when an explanation doesn't quite add up."],
  ["te1", "Te", false, "I like to organise people and resources to get results."],
  ["te2", "Te", false, "I judge an idea by whether it works in practice."],
  ["te3", "Te", false, "I set measurable goals and track them."],
  ["fi1", "Fi", false, "I know clearly what I value, even if others don't share it."],
  ["fi2", "Fi", false, "I find it hard to go along with something that clashes with my own values."],
  ["fi3", "Fi", false, "I judge situations by how they sit with me inside."],
  ["fe1", "Fe", false, "I sense the mood of a room as soon as I enter."],
  ["fe2", "Fe", false, "I adjust what I say to keep the group in harmony."],
  ["fe3", "Fe", false, "I feel responsible for how others are feeling."],
  ["si1", "Si", false, "I remember details of past experiences vividly."],
  ["si2", "Si", false, "Familiar routines make me feel secure."],
  ["si3", "Si", false, "I compare new things with what I've known before."],
  ["se1", "Se", false, "I notice small details in my surroundings that others miss."],
  ["se2", "Se", false, "I enjoy intense physical experiences: speed, taste, sound."],
  ["se3", "Se", false, "I react quickly to what is happening right in front of me."],
  ["ni1", "Ni", false, "I often know how something will turn out before I can explain why."],
  ["ni2", "Ni", false, "I'm drawn to the single deeper meaning behind events."],
  ["ni3", "Ni", false, "Insights come to me suddenly, fully formed."],
  ["ne1", "Ne", false, "One idea quickly sparks ten more in my mind."],
  ["ne2", "Ne", false, "I love brainstorming wild possibilities."],
  ["ne3", "Ne", false, "I see connections between things that seem unrelated."],
]);

const S = THRESHOLDS.stop;
const isScale = (x: string): x is Scale => x in SCALES;
const cat = createLikertCat({
  items: ITEMS, scales: ROTATION,
  stop: sc => isScale(sc) ? { se: S.mbtiSE, letterP: S.mbtiLetterP, cap: S.mbtiCap } : { se: S.jungFuncSE, letterP: S.jungFuncLetterP, cap: S.jungFuncCap },
});

export interface JungState { v: 1; answers: LikertAnswer[]; prior: Record<string, number> }
export interface Letter {
  /** Measured pole, or "X" when the score is in the middle band. */
  letter: string;
  /** Model probability of the side shown (or of the first pole when X). Uncalibrated. */
  p: number;
  percentile: number; theta: number; se: number;
}
export interface FunctionScore {
  f: Func; name: string; theta: number; se: number;
  /** Absolute model percentile Φ(θ) (built-in norm). Not rescaled to the highest function. */
  percentile: number;
  /** P(this function is the highest of all eight), independent-normal approximation. */
  pTop: number;
}
export interface Role { f: Func | null; p: number; candidates: { f: Func; p: number }[] }
export interface JungResult {
  letters: Record<Scale, Letter>;
  /** Four measured letters; contains X where a preference is in the middle band. */
  mbti: string;
  functions: FunctionScore[]; // ranked high → low by θ (ties keep the FUNCS order; no role is inferred from it)
  /** Full code, partial code `IT(?) (Ti)` when only the dominant resolves, or "unresolved". */
  code: string;
  dominant: Role;
  /** Auxiliary among the four on the other axis of the resolved dominant; f null when unresolved or no dominant. */
  auxiliary: Role;
  /** @deprecated Use dominant / auxiliary. dom/aux are null when unresolved. */
  dom: Func | null; aux: Func | null;
  /** @deprecated = dominant.p; it is not a probability for the whole code. */
  confidence: number;
  /** Conventional MBTI stack for the measured letters (interpretation only); null when any letter is X. */
  mbtiStack: [Func, Func] | null;
  /** Always false under the independent prior policy. */
  usedBigFive: boolean;
  meta: ResultMeta;
}

/** MBTI's conventional top-two functions for a 4-letter type (interpretation). */
export function mbtiStack(type: string): [Func, Func] {
  if (!/^[EI][SN][TF][JP]$/.test(type)) throw new Error(`mbtiStack needs a resolved 4-letter type, got ${type}`);
  const [ei, sn, tf, jp] = [...type] as [string, string, string, string];
  const judge = `${tf}${jp === "J" ? "e" : "i"}` as Func;        // J/P says which function is extraverted
  const perceive = `${sn}${jp === "J" ? "i" : "e"}` as Func;
  const extravertedFirst = ei === "E";
  const ext = jp === "J" ? judge : perceive, int = jp === "J" ? perceive : judge;
  return extravertedFirst ? [ext, int] : [int, ext];
}

/**
 * P(each X_i is the maximum) for independent normals N(mu_i, sd_i²), by deterministic quadrature. Exactly equal
 * inputs give exactly equal outputs. This is an approximation: the real function posteriors are not normal and the
 * functions are not known to be independent.
 */
export function pMaximum(xs: { mu: number; sd: number }[]): number[] {
  const lo = Math.min(...xs.map(x => x.mu - 6 * x.sd)), hi = Math.max(...xs.map(x => x.mu + 6 * x.sd));
  const n = 1200, h = (hi - lo) / n;
  const out = xs.map((x, i) => {
    let acc = 0;
    for (let k = 0; k <= n; k++) {
      const t = lo + k * h;
      const z = (t - x.mu) / x.sd;
      let v = Math.exp(-0.5 * z * z) / (x.sd * Math.sqrt(2 * Math.PI));
      for (let j = 0; j < xs.length; j++) if (j !== i) v *= pAboveMedian(t - xs[j]!.mu, xs[j]!.sd);
      acc += (k === 0 || k === n ? 0.5 : 1) * v;
    }
    return acc * h;
  });
  const z = out.reduce((a, b) => a + b, 0);
  return out.map(p => p / z);
}

const judging = (f: Func) => f[0] === "T" || f[0] === "F";

function role(fs: FunctionScore[], pool: Func[]): Role {
  const T = THRESHOLDS.jung;
  const sub = pool.map(f => fs.find(x => x.f === f)!);
  const ps = pMaximum(sub.map(x => ({ mu: x.theta, sd: x.se })));
  const ranked = sub.map((x, i) => ({ f: x.f, p: ps[i]! }))
    .sort((a, b) => (Math.abs(b.p - a.p) < 1e-9 ? FUNCS.indexOf(a.f) - FUNCS.indexOf(b.f) : b.p - a.p));
  const lead = ranked[0]!;
  return { f: lead.p >= T.resolveP ? lead.f : null, p: lead.p, candidates: ranked.filter(c => c.p >= T.candidateP) };
}

function compute(s: JungState): JungResult {
  const mid = THRESHOLDS.jung.letterMiddle;
  const letters = Object.fromEntries((Object.keys(SCALES) as Scale[]).map(sc => {
    const e = cat.estimate(s.answers, sc, s.prior[sc] ?? 0);
    const [hi, lo] = SCALES[sc];
    const letter = Math.round(Math.abs(e.level - 0.5) * 1e12) / 1e12 < mid ? "X" : e.level >= 0.5 ? hi : lo;
    return [sc, { letter, p: letter === lo ? 1 - e.pHigh : e.pHigh, percentile: e.percentile, theta: e.theta, se: e.se }];
  })) as JungResult["letters"];
  const mbti = `${letters.EI.letter}${letters.SN.letter}${letters.TF.letter}${letters.JP.letter}`;
  const raw = FUNCS.map(f => { const e = cat.estimate(s.answers, f); return { f, name: FUNC_NAMES[f], theta: e.theta, se: e.se, percentile: e.percentile }; });
  const pTop = pMaximum(raw.map(x => ({ mu: x.theta, sd: x.se })));
  const functions: FunctionScore[] = raw.map((x, i) => ({ ...x, pTop: pTop[i]! }))
    .sort((a, b) => b.theta - a.theta || FUNCS.indexOf(a.f) - FUNCS.indexOf(b.f));
  const dominant = role(functions, [...FUNCS]);
  const auxiliary: Role = dominant.f
    ? role(functions, FUNCS.filter(f => judging(f) !== judging(dominant.f!)))
    : { f: null, p: 0, candidates: [] };
  const att = (f: Func) => (f[1] === "i" ? "I" : "E");
  const code = !dominant.f ? "unresolved"
    : auxiliary.f
      ? jungToken(att(dominant.f), { f: dominant.f[0] as "T", a: dominant.f[1] as "i" }, { f: auxiliary.f[0] as "T", a: auxiliary.f[1] as "i" })
      : `${att(dominant.f)}${dominant.f[0]}(?) (${dominant.f})`;
  return {
    letters, mbti, functions, code, dominant, auxiliary, dom: dominant.f, aux: auxiliary.f, confidence: dominant.p,
    mbtiStack: mbti.includes("X") ? null : mbtiStack(mbti), usedBigFive: Object.values(s.prior).some(v => v !== 0),
    meta: metaOf(s, letters, functions, dominant, auxiliary),
  };
}

const DOM_EVENT = "function is the highest of all eight (independent normal approximation)";
const AUX_EVENT = "function is the highest of the four on the other axis from the dominant (independent normal approximation)";

function metaOf(s: JungState, letters: JungResult["letters"], fs: FunctionScore[], dom: Role, aux: Role): ResultMeta {
  const byId = cat.byId;
  const raw = (sc: string, rev: boolean) => s.answers.filter(a => byId.get(a.itemId)!.scale === sc && byId.get(a.itemId)!.reverse === rev).map(a => a.x);
  const order = new Map(ITEMS.map((i, k) => [i.id, k]));
  const all = [...s.answers].sort((a, b) => order.get(a.itemId)! - order.get(b.itemId)!).map(a => a.x);
  const quality: QualityNote[] = likertQualityNotes(all,
    (Object.keys(SCALES) as Scale[]).map(sc => ({ output: `${SCALES[sc][0]}/${SCALES[sc][1]}`, forward: raw(sc, false), reverse: raw(sc, true) })), THRESHOLDS.quality);
  const answered = s.answers.length, total = ITEMS.length;
  if (answered < total) quality.push({ code: "incomplete", message: `${total - answered} of ${total} statements were not answered.` });
  const uncertainty: UncertaintyMeasure[] = [
    ...(Object.keys(SCALES) as Scale[]).map(sc => ({ output: `${SCALES[sc][0]}/${SCALES[sc][1]}`, event: `preference is ${letters[sc].letter === "X" ? SCALES[sc][0] : letters[sc].letter} (θ sign, model)`, kind: "model-probability" as const, value: letters[sc].p, calibrated: false as const })),
    ...fs.map(f => ({ output: f.f, event: DOM_EVENT, kind: "model-probability" as const, value: f.pTop, calibrated: false as const })),
    ...aux.candidates.map(c => ({ output: c.f, event: AUX_EVENT, kind: "model-probability" as const, value: c.p, calibrated: false as const })),
    ...fs.map(f => ({ output: f.f, event: "posterior SD of θ (score units)", kind: "posterior-sd" as const, value: f.se, calibrated: false as const })),
  ];
  return {
    engine: "jung", scoringVersion: JUNG_SCORING_VERSION,
    completion: { answered, total, complete: answered === total },
    unresolved: [
      ...(dom.f ? [] : ["dominant function"]), ...(dom.f && !aux.f ? ["auxiliary function"] : []),
      ...(Object.keys(SCALES) as Scale[]).filter(sc => letters[sc].letter === "X").map(sc => `${SCALES[sc][0]}/${SCALES[sc][1]} preference`),
    ],
    quality, uncertainty, dependencies: [],
  };
}

export const jungEngine: ExamEngine<JungState, JungResult> = {
  meta: {
    id: "jung", name: "Jungian Functions", version: "0.2.0", scoringVersion: JUNG_SCORING_VERSION,
    evidence: { scales: "moderate", functions: "exploratory" },
    glossary: { ...FUNC_NAMES, I: "Introverted", E: "Extraverted", T: "Thinking", F: "Feeling", S: "Sensation", N: "iNtuition", "(?)": "Auxiliary unresolved", X: "Middle: no clear preference" },
    optionalInputs: [],
  },
  /** Reads the latest profile each time; under THRESHOLDS.priorPolicy "independent" no Big Five prior is applied. */
  init(profile) {
    const bf = profile.bigfive as { traits?: { E?: { theta?: unknown } } } | undefined;
    const e = bf?.traits?.E?.theta;
    const prior: Record<string, number> = THRESHOLDS.priorPolicy === "mapped-mean" && isFiniteNumber(e) ? { EI: THRESHOLDS.priors.jungEIFromBigFiveE * e } : {};
    return { v: 1, answers: [], prior };
  },
  next(s) { const it = cat.next(s.answers, s.prior); return it ? cat.view(it) : null; },
  form: () => cat.form(),
  answer(s, itemId, r: Response) { return { ...s, answers: cat.answer(s.answers, itemId, r) }; },
  progress(s) {
    return ROTATION.map(sc => { const e = cat.estimate(s.answers, sc, s.prior[sc] ?? 0); return { output: sc, confidence: Math.max(e.pHigh, 1 - e.pHigh), done: cat.done(s.answers, sc, s.prior[sc] ?? 0) }; });
  },
  result: compute,
  explain(s): Explanation[] {
    const r = compute(s);
    const scales = (Object.keys(SCALES) as Scale[]).map(sc => ({
      output: `${SCALES[sc][0]} / ${SCALES[sc][1]}`, result: r.letters[sc].letter === "X" ? "X, no clear preference" : r.letters[sc].letter,
      confidence: r.letters[sc].p, confidenceEvent: "preference side (θ sign, model)", topEvidence: cat.evidence(s.answers, sc, s.prior[sc] ?? 0),
    }));
    const fn: Explanation[] = [];
    if (r.dominant.f) fn.push({ output: `Dominant: ${FUNC_NAMES[r.dominant.f]}`, result: r.dominant.f, confidence: r.dominant.p, confidenceEvent: DOM_EVENT, topEvidence: cat.evidence(s.answers, r.dominant.f) });
    else {
      const lead = r.dominant.candidates.map(c => c.f);
      fn.push({
        output: "Dominant function", result: lead.length ? `unresolved (candidates: ${lead.join(", ")})` : "unresolved",
        confidence: r.dominant.p, confidenceEvent: DOM_EVENT, topEvidence: lead.length ? cat.evidence(s.answers, lead[0]!) : [],
      });
    }
    if (r.dominant.f && !r.auxiliary.f) {
      const lead = r.auxiliary.candidates.map(c => c.f);
      fn.push({
        output: "Auxiliary function", result: lead.length ? `unresolved (candidates: ${lead.join(", ")})` : "unresolved",
        confidence: r.auxiliary.p, confidenceEvent: AUX_EVENT, topEvidence: lead.length ? cat.evidence(s.answers, lead[0]!) : [],
      });
    }
    if (r.auxiliary.f) fn.push({ output: `Auxiliary: ${FUNC_NAMES[r.auxiliary.f]}`, result: r.auxiliary.f, confidence: r.auxiliary.p, confidenceEvent: AUX_EVENT, topEvidence: cat.evidence(s.answers, r.auxiliary.f) });
    return [...fn, ...scales];
  },
  serialize: s => JSON.stringify(s),
  deserialize(raw) {
    const s = JSON.parse(raw) as JungState;
    if (!s || s.v !== 1 || !Array.isArray(s.answers)) throw new Error("Unrecognised Jung state");
    const seen = new Set<string>();
    for (const a of s.answers) {
      if (!cat.byId.has(a?.itemId) || seen.has(a.itemId) || !Number.isInteger(a.x) || a.x < 1 || a.x > 5) throw new Error("Invalid Jung answer");
      seen.add(a.itemId);
    }
    if (!s.prior || typeof s.prior !== "object" || Object.entries(s.prior).some(([k, v]) => !isScale(k) || !isFiniteNumber(v))) throw new Error("Invalid Jung prior");
    return s;
  },
  bioTokens(s): BioToken[] {
    if (s.answers.length === 0 || cat.next(s.answers, s.prior) !== null) return [];
    const r = compute(s);
    return r.dominant.f ? [{ slot: "jung", text: r.code, confidence: r.dominant.p, source: "test" }] : [];
  },
};
export default jungEngine;
