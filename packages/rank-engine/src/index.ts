// Ranking engine (SPEC §4.2 Plackett–Luce): posterior over every full order of N aspects.
// Shared by Attitudinal Psyche and Temporistics; the Enneagram reuses rankPosterior for instincts.
import { THRESHOLDS, type BioToken, type EngineMeta, type ExamEngine, type Explanation, type ItemView, type Response, type Slot } from "@typo/engine-sdk";
import { permutations, top, uniform, updateRanking, type Posterior } from "@typo/bayes";

export interface RankTask { id: string; text: string; options: { id: string; text: string }[] }
export interface RankState { v: 1; answers: { itemId: string; ranking: string[] }[] }
export interface RankResult {
  order: string; p: number; runnerUp: { order: string; p: number };
  /** Average rank position (1 = first) of each aspect, from the posterior. */
  positions: Record<string, number>;
  tasks: number;
}

/** Worth for each aspect given a class order: first place weighs most (ratio from thresholds). */
export function worthFor(order: string, ratio: number = THRESHOLDS.rankWorthRatio): Record<string, number> {
  const parts = order.includes("/") ? order.split("/") : [...order];
  return Object.fromEntries(parts.map((a, i) => [a, ratio ** (parts.length - 1 - i)]));
}

/** Posterior over orders after a list of observed rankings. */
export function rankPosterior(classes: string[], rankings: string[][]): Posterior {
  let p = uniform(classes);
  for (const r of rankings) p = updateRanking(p, r, c => worthFor(c));
  return p;
}

export function createRankEngine(cfg: {
  meta: EngineMeta; slot: Slot; aspects: string[]; tasks: RankTask[]; stopP: number; cap: number;
  aspectNames: Record<string, string>;
}): ExamEngine<RankState, RankResult> {
  const classes = permutations(cfg.aspects).map(o => o.join(""));
  const byId = new Map(cfg.tasks.map(t => [t.id, t]));
  const post = (s: RankState, skip?: string) => rankPosterior(classes, s.answers.filter(a => a.itemId !== skip).map(a => a.ranking));

  const finished = (s: RankState) => {
    if (s.answers.length === 0) return false;
    const t = top(post(s))[0]!;
    return t.p >= cfg.stopP || s.answers.length >= Math.min(cfg.cap, cfg.tasks.length);
  };

  const result = (s: RankState): RankResult => {
    const p = post(s); const [a, b] = top(p);
    const positions: Record<string, number> = Object.fromEntries(cfg.aspects.map(x => [x, 0]));
    for (const [cls, pr] of Object.entries(p)) [...cls].forEach((x, i) => (positions[x]! += pr * (i + 1)));
    return { order: a!.cls, p: a!.p, runnerUp: { order: b!.cls, p: b!.p }, positions, tasks: s.answers.length };
  };

  const engine: ExamEngine<RankState, RankResult> = {
    meta: cfg.meta,
    init: () => ({ v: 1, answers: [] }),
    next(s) {
      if (finished(s)) return null;
      const asked = new Set(s.answers.map(a => a.itemId));
      const t = cfg.tasks.find(x => !asked.has(x.id));
      return t ? ({ id: t.id, format: "rank", text: t.text, options: t.options } satisfies ItemView) : null;
    },
    form: () => cfg.tasks.map(t => ({ id: t.id, format: "rank", text: t.text, options: t.options }) satisfies ItemView),
    answer(s, itemId, r: Response) {
      const t = byId.get(itemId);
      if (!t) throw new Error(`Unknown task ${itemId}`);
      const ids = t.options.map(o => o.id).sort().join();
      if (!Array.isArray(r) || [...r].sort().join() !== ids) throw new Error("A ranking must order every option exactly once");
      return { ...s, answers: [...s.answers.filter(a => a.itemId !== itemId), { itemId, ranking: [...r] }] };
    },
    progress(s) {
      const r = s.answers.length ? result(s) : null;
      return [{ output: "order", confidence: r?.p ?? 0, done: finished(s) }];
    },
    result,
    explain(s): Explanation[] {
      const r = result(s);
      const ev = s.answers.map(a => {
        const without = post(s, a.itemId)[r.order] ?? 1e-12;
        const t = byId.get(a.itemId)!;
        const names = a.ranking.map(id => t.options.find(o => o.id === id)!.text);
        return { itemId: a.itemId, answer: `${t.text} You ranked first: “${names[0]}”`, delta: Math.round(Math.log(r.p / without) * 100) / 100 };
      }).sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta)).slice(0, 3);
      return [{ output: cfg.meta.name, result: r.order, confidence: r.p, topEvidence: ev, runnerUp: { result: r.runnerUp.order, confidence: r.runnerUp.p } }];
    },
    serialize: s => JSON.stringify(s),
    deserialize(raw) {
      const s = JSON.parse(raw) as RankState;
      if (s.v !== 1 || !Array.isArray(s.answers)) throw new Error("Unrecognised ranking state");
      return s;
    },
    bioTokens(s): BioToken[] {
      if (!finished(s)) return [];
      const r = result(s);
      return [{ slot: cfg.slot, text: r.order, confidence: r.p, source: "test" }];
    },
  };
  return engine;
}
