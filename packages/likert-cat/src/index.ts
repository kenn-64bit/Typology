// Adaptive Likert battery (SPEC §4.1, §4.4, §4.5): GRM + EAP per scale, max-information selection
// rotating through unfinished scales, and SE / letter-probability / cap stopping. Framework-free utility.
import type { ItemView } from "@typo/engine-sdk";
import { eap, info, pAboveMedian, reverseScore } from "@typo/irt";

export const LIKERT_LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] as const;

export interface LikertItem {
  id: string; scale: string; reverse: boolean; text: string;
  a: number; b: number[]; params_source: "expert" | "empirical";
}
export interface StopRule { se: number; letterP: number; cap: number }
export interface LikertAnswer { itemId: string; x: number }

/** Expert placeholder parameters (a ≈ 1.5, evenly spaced thresholds). */
export const EXPERT = { a: 1.5, b: [-1.5, -0.5, 0.5, 1.5], params_source: "expert" as const };

export function createLikertCat(cfg: { items: LikertItem[]; scales: readonly string[]; stop: (scale: string) => StopRule }) {
  const byId = new Map(cfg.items.map(i => [i.id, i]));
  const scaleOf = (id: string) => byId.get(id)?.scale;

  function estimate(answers: LikertAnswer[], scale: string, priorMean = 0, skip?: string) {
    const rows = answers.filter(a => a.itemId !== skip && scaleOf(a.itemId) === scale).map(a => {
      const it = byId.get(a.itemId)!;
      return { a: it.a, b: it.b, x: a.x, reverse: it.reverse };
    });
    const e = eap(rows, priorMean);
    return { ...e, n: rows.length, pHigh: pAboveMedian(e.theta, e.se), percentile: Math.round(100 * pAboveMedian(e.theta, 1)) };
  }

  function done(answers: LikertAnswer[], scale: string, priorMean = 0): boolean {
    const e = estimate(answers, scale, priorMean);
    const rule = cfg.stop(scale);
    const bank = cfg.items.filter(i => i.scale === scale).length;
    if (e.n === 0) return bank === 0;
    return e.se <= rule.se || Math.max(e.pHigh, 1 - e.pHigh) >= rule.letterP || e.n >= rule.cap || e.n >= bank;
  }

  /** Next item: max information at θ̂ for the next unfinished scale after the last one asked. */
  function next(answers: LikertAnswer[], priors: Record<string, number> = {}, onlyScales: readonly string[] = cfg.scales): LikertItem | null {
    const open = onlyScales.filter(sc => !done(answers, sc, priors[sc] ?? 0));
    if (open.length === 0) return null;
    const last = answers.at(-1);
    const lastIdx = last ? onlyScales.indexOf(scaleOf(last.itemId) ?? "") : -1;
    const order = onlyScales.map((_, k) => onlyScales[(lastIdx + 1 + k + onlyScales.length) % onlyScales.length]!);
    const sc = order.find(x => open.includes(x))!;
    const asked = new Set(answers.map(a => a.itemId));
    const theta = estimate(answers, sc, priors[sc] ?? 0).theta;
    return cfg.items.filter(i => i.scale === sc && !asked.has(i.id))
      .sort((p, q) => info(theta, q.a, q.b) - info(theta, p.a, p.b) || p.id.localeCompare(q.id))[0] ?? null;
  }

  function answer(answers: LikertAnswer[], itemId: string, x: unknown): LikertAnswer[] {
    if (typeof x !== "number" || !Number.isInteger(x) || x < 1 || x > 5) throw new Error(`Likert answer 1..5 expected, got ${String(x)}`);
    if (!byId.has(itemId)) throw new Error(`Unknown item ${itemId}`);
    return [...answers.filter(a => a.itemId !== itemId), { itemId, x }];
  }

  /** §5: the answers that moved a scale most (leave-one-out shift in θ). */
  function evidence(answers: LikertAnswer[], scale: string, priorMean = 0, k = 3) {
    const full = estimate(answers, scale, priorMean).theta;
    return answers.filter(a => scaleOf(a.itemId) === scale).map(a => {
      const it = byId.get(a.itemId)!;
      return {
        itemId: it.id,
        answer: `“${it.text}” — ${LIKERT_LABELS[a.x - 1]}${it.reverse ? " (reverse-keyed)" : ""}`,
        delta: Math.round((full - estimate(answers, scale, priorMean, a.itemId).theta) * 100) / 100,
      };
    }).sort((p, q) => Math.abs(q.delta) - Math.abs(p.delta)).slice(0, k);
  }

  const view = (it: LikertItem): ItemView => ({
    id: it.id, format: "likert5", text: it.text,
    options: LIKERT_LABELS.map((text, k) => ({ id: String(k + 1), text })),
  });

  /** Every item, interleaved across scales (A1, B1, C1, A2, …) so one trait never runs in a block. */
  function form(onlyScales: readonly string[] = cfg.scales): ItemView[] {
    const per = onlyScales.map(sc => cfg.items.filter(i => i.scale === sc));
    const out: ItemView[] = [];
    for (let k = 0; k < Math.max(...per.map(p => p.length)); k++) for (const p of per) if (p[k]) out.push(view(p[k]!));
    return out;
  }

  return { items: cfg.items, byId, estimate, done, next, answer, evidence, view, scaleOf, reverseScore, form };
}

/** Build items from compact rows: [id, scale, reverse, text]. */
export const likertItems = (rows: [string, string, boolean, string][]): LikertItem[] =>
  rows.map(([id, scale, reverse, text]) => ({ id, scale, reverse, text, ...EXPERT, b: [...EXPERT.b] }));
