// Enneagram engine (dossier Module 3) as one fixed form, printed all at once:
//   27 agree/disagree statements (3 per type) · 1 "which description fits best" pick · 4 instinct rankings.
// Hard rules: the wing is a neighbouring type, stacking is a full order, tritype has one type per center
// with the core first. Research status: mixed for core type, little research for the rest.
import { THRESHOLDS, type BioToken, type ExamEngine, type Explanation, type ItemView, type Response } from "@typo/engine-sdk";
import { normalize, permutations, top, uniform, type Posterior } from "@typo/bayes";
import { rankPosterior } from "@typo/rank-engine";
import { instinctToken, tritypeToken } from "@typo/bio";
import { INSTINCT_TASKS, PARAGRAPHS, STATEMENTS, TYPE_NAMES } from "./content.ts";
export { INSTINCT_TASKS, PARAGRAPHS, STATEMENTS, TYPE_NAMES };

export const TYPES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const CENTERS = { gut: [8, 9, 1], heart: [2, 3, 4], head: [5, 6, 7] } as const;
export type Center = keyof typeof CENTERS;
export const centerOf = (t: number): Center => (Object.keys(CENTERS) as Center[]).find(c => (CENTERS[c] as readonly number[]).includes(t))!;
export const wingsOf = (t: number): [number, number] => [((t + 7) % 9) + 1, (t % 9) + 1];

/** The 18 legal tritypes for a core: core first, then one type from each other center, in either order. */
export function legalTritypes(core: number): string[] {
  const [c1, c2] = (Object.keys(CENTERS) as Center[]).filter(c => c !== centerOf(core));
  const out: string[] = [];
  for (const a of CENTERS[c1!]) for (const b of CENTERS[c2!]) out.push(`${core}${a}${b}`, `${core}${b}${a}`);
  return out;
}

const LIKERT = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] as const;
const STACKINGS = permutations(["so", "sx", "sp"]).map(p => p.join("/"));
const L = THRESHOLDS.likelihood, S = THRESHOLDS.stop;
export const PICK_ID = "pick";

/** Statement ids: s:<type><a|b|c>, interleaved so each type appears once per round. */
const STATEMENT_IDS = ["a", "b", "c"].flatMap(k => TYPES.map(t => `s:${t}${k}`));
const stmtText = (id: string) => STATEMENTS[Number(id[2])]!["abc".indexOf(id[3]!)]!;
const stmtType = (id: string) => Number(id[2]);

const FORM: ItemView[] = [
  ...STATEMENT_IDS.slice(0, 18).map(id => ({ id, format: "likert5" as const, text: stmtText(id), options: LIKERT.map((text, k) => ({ id: String(k + 1), text })) })),
  { id: PICK_ID, format: "scenario", text: "Which description fits you best overall?", options: TYPES.map(t => ({ id: String(t), text: PARAGRAPHS[t]! })) },
  ...STATEMENT_IDS.slice(18).map(id => ({ id, format: "likert5" as const, text: stmtText(id), options: LIKERT.map((text, k) => ({ id: String(k + 1), text })) })),
  ...INSTINCT_TASKS.map(t => ({ id: `inst:${t.id}`, format: "rank" as const, text: t.text, options: t.options })),
];

export interface Answer { itemId: string; r: Response }
export interface EnneaState { v: 2; answers: Answer[] }

export function corePosterior(s: EnneaState, skip?: string): Posterior {
  let p = uniform(TYPES.map(String));
  for (const a of s.answers) {
    if (a.itemId === skip) continue;
    if (a.itemId.startsWith("s:")) {
      const own = stmtType(a.itemId), x = (a.r as number) - 1;
      const next: Posterior = {};
      for (const c in p) next[c] = p[c]! * (Number(c) === own ? L.enneaOwn[x]! : L.enneaOther[x]!);
      p = normalize(next);
    } else if (a.itemId === PICK_ID) {
      const next: Posterior = {};
      for (const c in p) next[c] = p[c]! * (Number(c) === a.r ? L.selfCheckMatch : (1 - L.selfCheckMatch) / 8);
      p = normalize(next);
    }
  }
  return p;
}
const instinctPost = (s: EnneaState, skip?: string) =>
  rankPosterior(STACKINGS, s.answers.filter(a => a.itemId.startsWith("inst:") && a.itemId !== skip).map(a => a.r as string[]));
const otherCenters = (core: number) => (Object.keys(CENTERS) as Center[]).filter(c => c !== centerOf(core));

/** Within-center probabilities from the core posterior (one type per center). */
function centerPick(p: Posterior, c: Center) {
  const z = CENTERS[c].reduce((m, t) => m + p[String(t)]!, 0);
  const ranked = [...CENTERS[c]].sort((a, b) => p[String(b)]! - p[String(a)]!);
  return { type: ranked[0]!, p: p[String(ranked[0])]! / z };
}

const isDone = (s: EnneaState) => FORM.every(v => s.answers.some(a => a.itemId === v.id));

export interface EnneaResult {
  core: number; coreP: number; coreName: string; runnerUp: { type: number; p: number };
  wing: number; wingP: number; balancedWing: boolean;
  stacking: string; stackingP: number;
  tritype: string; tritypeP: number;
}

function compute(s: EnneaState): EnneaResult {
  const p = corePosterior(s);
  const ranked = top(p);
  const core = Number(ranked[0]!.cls);
  const [w1, w2] = wingsOf(core);
  const wz = p[String(w1)]! + p[String(w2)]!;
  const wing = p[String(w1)]! >= p[String(w2)]! - 1e-12 ? w1 : w2; // exact ties → the lower-clockwise neighbour, deterministically
  const wingP = p[String(wing)]! / wz;
  const [a, b] = otherCenters(core).map(c => centerPick(p, c));
  const [first, second] = p[String(a!.type)]! >= p[String(b!.type)]! ? [a!, b!] : [b!, a!];
  const ip = top(instinctPost(s))[0]!;
  return {
    core, coreP: ranked[0]!.p, coreName: TYPE_NAMES[core]!, runnerUp: { type: Number(ranked[1]!.cls), p: ranked[1]!.p },
    wing, wingP, balancedWing: wingP < S.wingP,
    stacking: ip.cls, stackingP: ip.p,
    tritype: `${core}${first.type}${second.type}`, tritypeP: first.p * second.p,
  };
}

const shift = (full: number, without: number) => Math.round(Math.log((full + 1e-12) / (without + 1e-12)) * 100) / 100;
function describe(a: Answer): string {
  if (a.itemId.startsWith("s:")) return `“${stmtText(a.itemId)}” — ${LIKERT[(a.r as number) - 1]}`;
  if (a.itemId === PICK_ID) return `You picked the type ${a.r} description as the best fit`;
  const t = INSTINCT_TASKS.find(x => `inst:${x.id}` === a.itemId)!;
  return `${t.text} You ranked first: “${t.options.find(o => o.id === (a.r as string[])[0])!.text}”`;
}

export const enneagramEngine: ExamEngine<EnneaState, EnneaResult> = {
  meta: {
    id: "enneagram", name: "Enneagram", version: "0.2.0",
    evidence: { core: "mixed", wing: "exploratory", instincts: "exploratory", tritype: "exploratory" },
    glossary: { sp: "Self-preservation", so: "Social", sx: "Sexual / one-to-one", ...Object.fromEntries(TYPES.map(t => [String(t), TYPE_NAMES[t]!])) },
  },
  init: () => ({ v: 2, answers: [] }),
  form: () => FORM,
  next(s) { const done = new Set(s.answers.map(a => a.itemId)); return FORM.find(v => !done.has(v.id)) ?? null; },
  answer(s, itemId, r: Response) {
    const v = FORM.find(x => x.id === itemId);
    if (!v) throw new Error(`Unknown item ${itemId}`);
    if (v.format === "likert5" && !(typeof r === "number" && Number.isInteger(r) && r >= 1 && r <= 5)) throw new Error("Likert answer 1..5 expected");
    if (v.format === "scenario" && !(typeof r === "number" && TYPES.includes(r as never))) throw new Error("Choose one of the nine descriptions");
    if (v.format === "rank" && !(Array.isArray(r) && [...r].sort().join() === v.options!.map(o => o.id).sort().join())) throw new Error("Rank all three options");
    return { ...s, answers: [...s.answers.filter(a => a.itemId !== itemId), { itemId, r: Array.isArray(r) ? [...r] : r }] };
  },
  progress(s) {
    const r = compute(s); const d = isDone(s);
    return [
      { output: "core", confidence: r.coreP, done: d }, { output: "wing", confidence: r.wingP, done: d },
      { output: "instincts", confidence: r.stackingP, done: d }, { output: "tritype", confidence: r.tritypeP, done: d },
    ];
  },
  result: compute,
  explain(s): Explanation[] {
    const r = compute(s); const full = corePosterior(s);
    const coreEv = s.answers.filter(a => a.itemId.startsWith("s:") || a.itemId === PICK_ID)
      .map(a => ({ itemId: a.itemId, answer: describe(a), delta: shift(full[String(r.core)]!, corePosterior(s, a.itemId)[String(r.core)]!) }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3);
    const about = (types: number[]) => s.answers.filter(a => a.itemId.startsWith("s:") && types.includes(stmtType(a.itemId)) && (a.r as number) >= 4)
      .map(a => ({ itemId: a.itemId, answer: describe(a), delta: 0 })).slice(0, 3);
    const ip = instinctPost(s);
    return [
      { output: "Core type", result: `${r.core} (${r.coreName})`, confidence: r.coreP, topEvidence: coreEv, runnerUp: { result: String(r.runnerUp.type), confidence: r.runnerUp.p } },
      { output: "Wing", result: `${r.core}w${r.wing}${r.balancedWing ? " (balanced)" : ""}`, confidence: r.wingP, topEvidence: about([r.wing]) },
      { output: "Instincts", result: r.stacking, confidence: r.stackingP,
        topEvidence: s.answers.filter(a => a.itemId.startsWith("inst:")).map(a => ({ itemId: a.itemId, answer: describe(a), delta: shift(ip[r.stacking]!, instinctPost(s, a.itemId)[r.stacking]!) }))
          .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 3) },
      { output: "Tritype", result: r.tritype, confidence: r.tritypeP, topEvidence: about([Number(r.tritype[1]), Number(r.tritype[2])]) },
    ];
  },
  serialize: s => JSON.stringify(s),
  deserialize(raw) { const s = JSON.parse(raw) as EnneaState; if (s.v !== 2 || !Array.isArray(s.answers)) throw new Error("Unrecognised Enneagram state"); return s; },
  bioTokens(s): BioToken[] {
    if (!isDone(s)) return [];
    const r = compute(s);
    return [
      { slot: "instincts", text: instinctToken(r.stacking.split("/") as ["so", "sx", "sp"]), confidence: r.stackingP, source: "test" },
      { slot: "tritype", text: tritypeToken(r.tritype, r.core, r.wing), confidence: r.tritypeP, source: "test" },
    ];
  },
};
export default enneagramEngine;
