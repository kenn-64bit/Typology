// Enneagram engine (dossier Module 3) as one fixed form, printed all at once:
//   27 agree/disagree statements (3 per type) · 1 "which description fits best" pick · 4 instinct rankings.
// Hard rules: the wing is a neighbouring type, stacking is a full order, tritype has one type per center
// with the core first. Research status: mixed for core type, little research for the rest.
import { THRESHOLDS, type BioToken, type ExamEngine, type Explanation, type ItemView, type QualityNote, type Response, type ResultMeta } from "@typo/engine-sdk";
import { normalize, permutations, top, type Posterior } from "@typo/bayes";
import { rankPosterior, summarizeRanking, type RankSummary } from "@typo/rank-engine";
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
const L = THRESHOLDS.likelihood;
/** "enneagram-3": statement-only core, separate paragraph pick, unresolved wing/tritype/stacking, tritype heuristic. */
export const ENNEAGRAM_SCORING_VERSION = "enneagram-3";
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

/**
 * Core posterior from the 27 STATEMENTS only (EN-01). The paragraph pick is a separate self-identification: no
 * validated incremental likelihood exists for it, so it never enters this posterior.
 */
export function corePosterior(s: EnneaState, skip?: string): Posterior {
  // Log-likelihoods summed per type and normalized once, so identically answered types get identical probabilities.
  const logL: Record<string, number> = Object.fromEntries(TYPES.map(t => [String(t), 0]));
  // Sorted by item id so the sum, and the result, is identical for any answer order.
  for (const a of [...s.answers].sort((x, y) => x.itemId.localeCompare(y.itemId))) {
    if (a.itemId === skip || !a.itemId.startsWith("s:")) continue;
    const own = stmtType(a.itemId), x = (a.r as number) - 1;
    for (const c in logL) logL[c]! += Math.log(Number(c) === own ? L.enneaOwn[x]! : L.enneaOther[x]!);
  }
  const m = Math.max(...Object.values(logL));
  const p: Posterior = {};
  for (const c in logL) p[c] = Math.exp(logL[c]! - m);
  return normalize(p);
}
const instinctPost = (s: EnneaState, skip?: string) =>
  rankPosterior(STACKINGS, s.answers.filter(a => a.itemId.startsWith("inst:") && a.itemId !== skip)
    .sort((x, y) => x.itemId.localeCompare(y.itemId)).map(a => a.r as string[]));
const otherCenters = (core: number) => (Object.keys(CENTERS) as Center[]).filter(c => c !== centerOf(core));

const isDone = (s: EnneaState) => FORM.every(v => s.answers.some(a => a.itemId === v.id));
const EVENTS = {
  core: "core type, from the 27 statements only (expert likelihoods)",
  wing: "share of statement-based core probability on this neighbour vs the other (core-alternative evidence, not a measured wing trait)",
  center: "within-center share of statement-based core probability (heuristic, not a probability of a tritype)",
  stacking: "complete instinct order (Plackett–Luce expert model)",
  first: "instinct is in first position (Plackett–Luce expert model)",
} as const;

export interface CenterPick { center: Center; type: number | null; share: number; candidates: { type: number; share: number }[] }
export interface EnneaResult {
  /** Statement-based core, or null when no type reaches THRESHOLDS.ennea.coreResolveP. */
  core: number | null; coreP: number; coreName: string | null;
  coreCandidates: { type: number; p: number }[];
  runnerUp: { type: number; p: number };
  /** Paragraph self-identification, reported separately from the statement evidence. */
  selfPick: { type: number; statementP: number; agrees: boolean | null } | null;
  /** Neighbour with more statement support, or null when below THRESHOLDS.ennea.wingP (balanced) or no core. */
  wing: number | null; wingP: number; balancedWing: boolean;
  /** Instinct order; null when unresolved. `stackingFirst` is a partial result when only first place is clear. */
  stacking: string | null; stackingP: number; stackingFirst: string | null;
  stackingCandidates: { order: string; p: number }[];
  instinctPositions: Record<string, number>;
  /**
   * Tritype heuristic code: core + one digit per other center, "?" for an unresolved center, "(ab)" when the order
   * of the two secondaries is uncertain. null without a core. No probability is claimed for it (EN-04).
   */
  tritype: string | null;
  tritypeCenters: CenterPick[];
  tritypeOrderResolved: boolean;
  meta: ResultMeta;
}

function centerPick(p: Posterior, c: Center): CenterPick {
  const T = THRESHOLDS.ennea;
  const z = CENTERS[c].reduce((m, t) => m + p[String(t)]!, 0);
  const ranked = [...CENTERS[c]].map(t => ({ type: t, share: p[String(t)]! / z })).sort((a, b) => b.share - a.share);
  return { center: c, type: ranked[0]!.share >= T.centerResolveP ? ranked[0]!.type : null, share: ranked[0]!.share, candidates: ranked.filter(r => r.share >= T.candidateP) };
}

function compute(s: EnneaState): EnneaResult {
  const T = THRESHOLDS.ennea;
  const p = corePosterior(s);
  const ranked = top(p).map(r => ({ type: Number(r.cls), p: r.p }));
  const lead = ranked[0]!;
  const core = lead.p >= T.coreResolveP ? lead.type : null;
  const pick = s.answers.find(a => a.itemId === PICK_ID)?.r as number | undefined;
  let wing: number | null = null, wingP = 0.5, balancedWing = true;
  let tritype: string | null = null, tritypeCenters: CenterPick[] = [], tritypeOrderResolved = false;
  if (core !== null) {
    const [w1, w2] = wingsOf(core);
    const a = p[String(w1)]!, b = p[String(w2)]!;
    const best = a >= b ? w1 : w2;
    wingP = (a >= b ? a : b) / (a + b);
    balancedWing = wingP < T.wingP;
    wing = balancedWing ? null : best;
    tritypeCenters = otherCenters(core).map(c => centerPick(p, c));
    const [x, y] = tritypeCenters as [CenterPick, CenterPick];
    const px = x.type ? p[String(x.type)]! : 0, py = y.type ? p[String(y.type)]! : 0;
    if (x.type && y.type) {
      const [hi, lo] = px >= py ? [x.type, y.type] : [y.type, x.type];
      const ratio = Math.max(px, py) / Math.min(px, py);
      tritypeOrderResolved = ratio >= T.orderRatio;
      tritype = tritypeOrderResolved ? `${core}${hi}${lo}` : `${core}(${Math.min(hi, lo)}${Math.max(hi, lo)})`; // unordered pair: ascending
    } else {
      // At least one center unresolved: the resolved digit first, then "?"; order is unknown by construction.
      const known = [x, y].filter(c => c.type).map(c => c.type);
      tritype = `${core}${known.join("")}${"?".repeat(2 - known.length)}`;
    }
  }
  const sum = summarizeRanking(instinctPost(s), ["so", "sx", "sp"], c => c.split("/"));
  const base = {
    core, coreP: lead.p, coreName: core === null ? null : TYPE_NAMES[core]!,
    coreCandidates: ranked.filter(r => r.p >= T.candidateP),
    runnerUp: ranked[1]!,
    selfPick: pick === undefined ? null : { type: pick, statementP: p[String(pick)]!, agrees: core === null ? null : core === pick },
    wing, wingP, balancedWing,
    stacking: sum.order, stackingP: sum.best.p, stackingFirst: sum.order ? null : sum.first?.aspect ?? null,
    stackingCandidates: sum.candidates, instinctPositions: sum.positions,
    tritype, tritypeCenters, tritypeOrderResolved,
  };
  return { ...base, meta: metaOf(s, base, sum) };
}

function metaOf(s: EnneaState, r: Omit<EnneaResult, "meta">, sum: RankSummary): ResultMeta {
  const answered = s.answers.length, total = FORM.length;
  const stmts = STATEMENT_IDS.map(id => s.answers.find(a => a.itemId === id)?.r as number | undefined).filter((x): x is number => x !== undefined);
  const quality: QualityNote[] = [];
  if (stmts.length > 1 && stmts.every(x => x === stmts[0])) quality.push({ code: "straight-line",
    message: `Every statement got the same answer, so the statements give no evidence for one type over another. Your description pick is shown separately and does not decide the core type.` });
  const inst = s.answers.filter(a => a.itemId.startsWith("inst:"));
  if (inst.length >= 2 && !r.stacking) {
    const firsts = new Set(inst.map(a => (a.r as string[])[0]));
    quality.push({ code: "ranking-conflict", message: `Your instinct rankings point in different directions${firsts.size > 1 ? ` (${firsts.size} different first choices)` : ""}, so no single order fits them well. That can reflect real differences between situations, not careless answers.` });
  }
  if (answered < total) quality.push({ code: "incomplete", message: `${total - answered} of ${total} questions were not answered.` });
  const unresolved = [
    ...(r.core === null ? ["core type"] : []),
    ...(r.core !== null && r.wing === null ? ["wing"] : []),
    ...r.tritypeCenters.filter(c => c.type === null).map(c => `tritype ${c.center} center`),
    ...(r.core !== null && r.tritypeCenters.every(c => c.type) && !r.tritypeOrderResolved ? ["tritype order"] : []),
    ...(r.stacking === null ? ["instinct order"] : []),
  ];
  return {
    engine: "enneagram", scoringVersion: ENNEAGRAM_SCORING_VERSION,
    completion: { answered, total, complete: answered === total },
    unresolved, quality,
    uncertainty: [
      ...r.coreCandidates.map(c => ({ output: `type ${c.type}`, event: EVENTS.core, kind: "model-probability" as const, value: c.p, calibrated: false as const })),
      ...(r.core !== null ? [{ output: "wing", event: EVENTS.wing, kind: "heuristic" as const, value: r.wingP, calibrated: false as const }] : []),
      ...r.tritypeCenters.map(c => ({ output: `${c.center} center`, event: EVENTS.center, kind: "heuristic" as const, value: c.share, calibrated: false as const })),
      ...sum.candidates.map(c => ({ output: c.order, event: EVENTS.stacking, kind: "model-probability" as const, value: c.p, calibrated: false as const })),
      ...(["so", "sx", "sp"]).map(a => ({ output: a, event: EVENTS.first, kind: "model-probability" as const, value: sum.marginals[a]![0]!, calibrated: false as const })),
    ],
    dependencies: [],
  };
}

const shift = (full: number, without: number) => Math.round(Math.log((full + 1e-12) / (without + 1e-12)) * 100) / 100;
function describe(a: Answer): string {
  if (a.itemId.startsWith("s:")) return `“${stmtText(a.itemId)}” — ${LIKERT[(a.r as number) - 1]}`;
  if (a.itemId === PICK_ID) return `You picked the type ${a.r} description as the best fit`;
  const t = INSTINCT_TASKS.find(x => `inst:${x.id}` === a.itemId)!;
  return `${t.text} You ranked first: “${t.options.find(o => o.id === (a.r as string[])[0])!.text}”`;
}

/**
 * Top 3 evidence rows by |delta|, dropping zero shifts. With a concluded result (`preferSupporting`), answers that
 * moved toward it lead; opposing answers appear only when nothing supports it.
 */
function rank<E extends { delta: number }>(rows: E[], preferSupporting: boolean, k = 3): E[] {
  const moved = rows.filter(x => x.delta !== 0).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const supporting = preferSupporting ? moved.filter(x => x.delta > 0) : [];
  return (supporting.length ? supporting : moved).slice(0, k);
}

/** Validates one stored answer against its form item (X-07). */
function validAnswer(itemId: string, r: unknown): boolean {
  const v = FORM.find(x => x.id === itemId);
  if (!v) return false;
  if (v.format === "likert5") return typeof r === "number" && Number.isInteger(r) && r >= 1 && r <= 5;
  if (v.format === "scenario") return typeof r === "number" && TYPES.includes(r as never);
  return Array.isArray(r) && [...r].sort().join() === v.options!.map(o => o.id).sort().join();
}

export const enneagramEngine: ExamEngine<EnneaState, EnneaResult> = {
  meta: {
    id: "enneagram", name: "Enneagram", version: "0.3.0", scoringVersion: ENNEAGRAM_SCORING_VERSION,
    evidence: { core: "mixed", wing: "exploratory", instincts: "exploratory", tritype: "exploratory" },
    glossary: {
      sp: "Self-preservation", so: "Social", sx: "Sexual / one-to-one", "w?": "Wing unresolved: both neighbours have similar support",
      "?": "Tritype center unresolved", "(ab)": "Order of the two tritype digits uncertain",
      ...Object.fromEntries(TYPES.map(t => [String(t), TYPE_NAMES[t]!])),
    },
  },
  init: () => ({ v: 2, answers: [] }),
  form: () => FORM,
  next(s) { const done = new Set(s.answers.map(a => a.itemId)); return FORM.find(v => !done.has(v.id)) ?? null; },
  answer(s, itemId, r: Response) {
    const v = FORM.find(x => x.id === itemId);
    if (!v) throw new Error(`Unknown item ${itemId}`);
    if (!validAnswer(itemId, r)) throw new Error(v.format === "likert5" ? "Likert answer 1..5 expected" : v.format === "scenario" ? "Choose one of the nine descriptions" : "Rank all three options");
    return { ...s, answers: [...s.answers.filter(a => a.itemId !== itemId), { itemId, r: Array.isArray(r) ? [...r] : r }] };
  },
  progress(s) {
    const r = compute(s); const d = isDone(s);
    return [
      { output: "core", confidence: r.coreP, done: d }, { output: "wing", confidence: r.wingP, done: d },
      { output: "instincts", confidence: r.stackingP, done: d },
    ];
  },
  result: compute,
  explain(s): Explanation[] {
    const r = compute(s); const full = corePosterior(s);
    const ranked = top(full).map(x => ({ type: Number(x.cls), p: x.p }));
    const lead = ranked[0]!;
    const tied = ranked.filter(x => x.p >= lead.p - 1e-9).map(x => x.type).sort((a, b) => a - b);
    const focus = r.core ?? lead.type;
    const stmts = s.answers.filter(a => a.itemId.startsWith("s:"));
    // Leave-one-out log-shift of a statistic of the core posterior, over every statement answer.
    const looStmt = (stat: (p: Posterior) => number) => {
      const f = stat(full);
      return stmts.map(a => ({ itemId: a.itemId, answer: describe(a), delta: shift(f, stat(corePosterior(s, a.itemId))) }));
    };
    const coreEv = rank(looStmt(p => p[String(focus)]!), tied.length === 1);
    const coreResult = r.core !== null ? `${r.core} (${r.coreName})`
      : tied.length === TYPES.length ? "unresolved (all types equal)"
      : tied.length > 1 ? `unresolved (tied: ${tied.join(", ")})` : `unresolved (most likely ${focus})`;
    const below = ranked.find(x => x.p < lead.p - 1e-9);
    const out: Explanation[] = [
      { output: "Core type (statements)", result: coreResult, confidence: r.coreP, confidenceEvent: EVENTS.core, topEvidence: coreEv,
        ...(below ? { runnerUp: { result: String(below.type), confidence: below.p } } : {}) },
    ];
    if (r.selfPick) out.push({ output: "Description you picked", result: String(r.selfPick.type), confidence: r.selfPick.statementP,
      confidenceEvent: "statement-based probability of the picked type", topEvidence: s.answers.filter(a => a.itemId === PICK_ID).map(a => ({ itemId: a.itemId, answer: describe(a), delta: 0 })) });
    if (r.core !== null) {
      const core = r.core;
      const [w1, w2] = wingsOf(core);
      const lean = r.wing ?? (full[String(w1)]! >= full[String(w2)]! ? w1 : w2);
      const wingShare = (p: Posterior) => p[String(lean)]! / (p[String(w1)]! + p[String(w2)]!);
      const centerShare = (p: Posterior, c: Center, t: number) => p[String(t)]! / CENTERS[c].reduce((m, x) => m + p[String(x)]!, 0);
      const triEv = r.tritypeCenters.filter(c => c.type !== null).flatMap(c => looStmt(p => centerShare(p, c.center, c.type!)));
      out.push(
        { output: "Wing", result: r.wing === null ? `${core}w? (balanced)` : `${core}w${r.wing}`, confidence: r.wingP, confidenceEvent: EVENTS.wing,
          topEvidence: rank(looStmt(wingShare), r.wing !== null) },
        { output: "Tritype (heuristic)", result: r.tritype!, confidence: Math.min(...r.tritypeCenters.map(c => c.share)), confidenceEvent: `lowest ${EVENTS.center}`,
          topEvidence: rank(triEv, true) });
    }
    const ip = instinctPost(s);
    const instAnswers = s.answers.filter(a => a.itemId.startsWith("inst:"));
    let instConf = r.stackingP, instEvent: string = EVENTS.stacking, instEv;
    if (r.stacking === null && r.stackingFirst !== null) {
      const first = r.stackingFirst;
      const pFirst = (post: Posterior) => Object.entries(post).reduce((m, [c, v]) => m + (c.split("/")[0] === first ? v : 0), 0);
      instConf = pFirst(ip); instEvent = EVENTS.first;
      instEv = rank(instAnswers.map(a => ({ itemId: a.itemId, answer: describe(a), delta: shift(instConf, pFirst(instinctPost(s, a.itemId))) })), true);
    } else {
      const best = r.stackingCandidates[0]?.order ?? top(ip)[0]!.cls;
      instEv = rank(instAnswers.map(a => ({ itemId: a.itemId, answer: describe(a), delta: shift(ip[best]!, instinctPost(s, a.itemId)[best]!) })), r.stacking !== null);
    }
    out.push({ output: "Instincts", result: r.stacking ?? (r.stackingFirst ? `${r.stackingFirst} first, rest unresolved` : "unresolved"), confidence: instConf, confidenceEvent: instEvent,
      topEvidence: instEv });
    return out;
  },
  serialize: s => JSON.stringify(s),
  deserialize(raw) {
    const s = JSON.parse(raw) as EnneaState;
    if (!s || s.v !== 2 || !Array.isArray(s.answers)) throw new Error("Unrecognised Enneagram state");
    const seen = new Set<string>();
    for (const a of s.answers) {
      if (!a || typeof a.itemId !== "string" || seen.has(a.itemId) || !validAnswer(a.itemId, a.r)) throw new Error(`Invalid Enneagram answer ${String(a?.itemId)}`);
      seen.add(a.itemId);
    }
    return s;
  },
  bioTokens(s): BioToken[] {
    if (!isDone(s)) return [];
    const r = compute(s);
    const out: BioToken[] = [];
    if (r.stacking) out.push({ slot: "instincts", text: instinctToken(r.stacking.split("/") as ["so", "sx", "sp"]), confidence: r.stackingP, source: "test" });
    if (r.core !== null) out.push({ slot: "tritype", text: tritypeToken(r.tritype, r.core, r.wing), confidence: r.coreP, source: "test" });
    return out;
  },
};
export default enneagramEngine;
