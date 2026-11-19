// Jung engine (dossier Module 2): four preference scales (MBTI letters, with confidence) and eight
// separately scored function-attitudes. The classic Jungian code (e.g. "IF(S) (FiSe)") comes from the
// function scores, so non-MBTI pairs are allowed; MBTI letters are reported alongside. Research: moderate (scales).
import { THRESHOLDS, type BioToken, type ExamEngine, type Explanation, type Response } from "@typo/engine-sdk";
import { createLikertCat, likertItems, type LikertAnswer } from "@typo/likert-cat";
import { pAboveMedian } from "@typo/irt";
import { jungToken } from "@typo/bio";

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

/** Original wording; `true` = reverse-keyed (agreeing points to the second pole). */
export const ITEMS = likertItems([
  ["ei1", "EI", false, "Talking things over with others helps me think."],
  ["ei2", "EI", true, "I recharge best on my own."],
  ["ei3", "EI", false, "I'd rather join in than watch from the side."],
  ["ei4", "EI", true, "I think before I speak, often for quite a while."],
  ["ei5", "EI", false, "A day without seeing anyone feels wasted."],
  ["sn1", "SN", false, "I'm drawn to possibilities more than to what is already here."],
  ["sn2", "SN", true, "I trust facts I can see and check."],
  ["sn3", "SN", false, "I often read between the lines."],
  ["sn4", "SN", true, "I prefer clear, practical instructions to big-picture ideas."],
  ["sn5", "SN", false, "I get bored once I understand the pattern behind something."],
  ["tf1", "TF", false, "When deciding, I weigh pros and cons more than people's feelings."],
  ["tf2", "TF", true, "I'd rather be kind than be right."],
  ["tf3", "TF", false, "I can criticise an idea without taking it personally."],
  ["tf4", "TF", true, "How a choice affects people matters most to me."],
  ["tf5", "TF", false, "Consistency matters more to me than making an exception."],
  ["jp1", "JP", false, "I like to plan a trip in detail."],
  ["jp2", "JP", true, "I'd rather decide on the day."],
  ["jp3", "JP", false, "Unfinished tasks bother me until they're done."],
  ["jp4", "JP", true, "I keep my options open as long as I can."],
  ["jp5", "JP", false, "I feel calmer with a schedule."],
  ["ti1", "Ti", false, "I trust a conclusion only once I've rebuilt the reasoning myself."],
  ["ti2", "Ti", false, "I enjoy finding the exact word or definition for something."],
  ["ti3", "Ti", false, "I notice when an explanation doesn't quite add up."],
  ["te1", "Te", false, "I like to organise people and resources to get results."],
  ["te2", "Te", false, "I judge an idea by whether it works in practice."],
  ["te3", "Te", false, "I set measurable goals and track them."],
  ["fi1", "Fi", false, "I know clearly what I value, even if others don't share it."],
  ["fi2", "Fi", false, "I can't act against my conscience, whatever the pressure."],
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
export interface JungResult {
  letters: Record<Scale, { letter: string; p: number }>;
  mbti: string;
  functions: { f: Func; name: string; theta: number; se: number; percentile: number }[]; // ranked high → low
  code: string; dom: Func; aux: Func; confidence: number;
  /** Conventional MBTI stack for the measured letters (interpretation only). */
  mbtiStack: [Func, Func];
  usedBigFive: boolean;
}

/** MBTI's conventional top-two functions for a 4-letter type (interpretation). */
export function mbtiStack(type: string): [Func, Func] {
  const [ei, sn, tf, jp] = [...type] as [string, string, string, string];
  const judge = `${tf}${jp === "J" ? "e" : "i"}` as Func;        // J/P says which function is extraverted
  const perceive = `${sn}${jp === "J" ? "i" : "e"}` as Func;
  const extravertedFirst = ei === "E";
  const ext = jp === "J" ? judge : perceive, int = jp === "J" ? perceive : judge;
  return extravertedFirst ? [ext, int] : [int, ext];
}

const finished = (s: JungState) => s.answers.length > 0 && cat.next(s.answers, s.prior) === null;

function compute(s: JungState): JungResult {
  const letters = Object.fromEntries((Object.keys(SCALES) as Scale[]).map(sc => {
    const e = cat.estimate(s.answers, sc, s.prior[sc] ?? 0);
    const [hi, lo] = SCALES[sc];
    return [sc, e.pHigh >= 0.5 ? { letter: hi, p: e.pHigh } : { letter: lo, p: 1 - e.pHigh }];
  })) as JungResult["letters"];
  const mbti = `${letters.EI.letter}${letters.SN.letter}${letters.TF.letter}${letters.JP.letter}`;
  const functions = FUNCS.map(f => { const e = cat.estimate(s.answers, f); return { f, name: FUNC_NAMES[f], theta: e.theta, se: e.se, percentile: e.percentile }; })
    .sort((a, b) => b.theta - a.theta || a.f.localeCompare(b.f));
  const dom = functions[0]!;
  const judging = (f: Func) => f[0] === "T" || f[0] === "F";
  const aux = functions.find(x => judging(x.f) !== judging(dom.f))!;
  const code = jungToken(dom.f[1] === "i" ? "I" : "E", { f: dom.f[0] as "T", a: dom.f[1] as "i" }, { f: aux.f[0] as "T", a: aux.f[1] as "i" });
  const second = functions[1]!;
  const confidence = pAboveMedian(dom.theta - second.theta, Math.hypot(dom.se, second.se));
  return { letters, mbti, functions, code, dom: dom.f, aux: aux.f, confidence, mbtiStack: mbtiStack(mbti), usedBigFive: (s.prior.EI ?? 0) !== 0 };
}

export const jungEngine: ExamEngine<JungState, JungResult> = {
  meta: {
    id: "jung", name: "Jungian Functions", version: "0.1.0",
    evidence: { scales: "moderate", functions: "exploratory" },
    glossary: { ...FUNC_NAMES, I: "Introverted", E: "Extraverted", T: "Thinking", F: "Feeling", S: "Sensation", N: "iNtuition" },
    optionalInputs: ["bigfive.traits.E"],
  },
  init(profile) {
    const bf = profile.bigfive as { traits?: { E?: { theta: number } } } | undefined;
    const e = bf?.traits?.E?.theta;
    const prior: Record<string, number> = e === undefined ? {} : { EI: THRESHOLDS.priors.jungEIFromBigFiveE * e };
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
      output: `${SCALES[sc][0]} / ${SCALES[sc][1]}`, result: r.letters[sc].letter, confidence: r.letters[sc].p,
      topEvidence: cat.evidence(s.answers, sc, s.prior[sc] ?? 0),
    }));
    const fn = [r.dom, r.aux].map(f => ({ output: FUNC_NAMES[f], result: f, confidence: r.confidence, topEvidence: cat.evidence(s.answers, f) }));
    return [...fn, ...scales];
  },
  serialize: s => JSON.stringify(s),
  deserialize(raw) { const s = JSON.parse(raw) as JungState; if (s.v !== 1) throw new Error("Unrecognised Jung state"); return s; },
  bioTokens(s): BioToken[] {
    if (!finished(s)) return [];
    const r = compute(s);
    return [{ slot: "jung", text: r.code, confidence: r.confidence, source: "test" }];
  },
};
export default jungEngine;
