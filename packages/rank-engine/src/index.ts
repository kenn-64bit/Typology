// Ranking engine (SPEC §4.2 Plackett–Luce): posterior over every full order of N aspects.
// Shared by Attitudinal Psyche and Temporistics; the Enneagram reuses rankPosterior for instincts.
import { THRESHOLDS, type BioToken, type EngineMeta, type ExamEngine, type Explanation, type ItemView, type QualityNote, type Response, type ResultMeta, type Slot } from "@typo/engine-sdk";
import { permutations, top, uniform, updateRanking, type Posterior } from "@typo/bayes";

export interface RankTask { id: string; text: string; options: { id: string; text: string }[] }
export interface RankState { v: 1; answers: { itemId: string; ranking: string[] }[] }
export interface RankResult {
  /** Most probable complete order under the model, always present. Not a published result: see `resolved`. */
  order: string; p: number; runnerUp: { order: string; p: number };
  /** Order published only at ≥ THRESHOLDS.ranking.resolveP; null when the rankings do not support one order. */
  resolved: string | null;
  /** Aspect with P(first position) ≥ THRESHOLDS.ranking.firstP, when no full order is resolved (partial result). */
  first: { aspect: string; p: number } | null;
  candidates: { order: string; p: number }[];
  /** Average rank position (1 = first) of each aspect, from the posterior. */
  positions: Record<string, number>;
  /** marginals[a][k] = P(aspect a in position k + 1). */
  marginals: Record<string, number[]>;
  tasks: number;
  meta: ResultMeta;
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

/**
 * Shared uncertainty summary for a posterior over complete orders (EN-05, AP-03, TP-01).
 * `order` is published only at ≥ THRESHOLDS.ranking.resolveP; otherwise null with `candidates`.
 * `first` is the aspect whose P(first position) ≥ firstP, if any (a partial result).
 * `positions` = expected position; `marginals[a][k]` = P(aspect a in position k+1). All under the expert model.
 */
export interface RankSummary {
  order: string | null; p: number;
  best: { order: string; p: number };
  candidates: { order: string; p: number }[];
  first: { aspect: string; p: number } | null;
  positions: Record<string, number>;
  marginals: Record<string, number[]>;
}
export function summarizeRanking(post: Posterior, aspects: string[], split: (cls: string) => string[] = c => [...c]): RankSummary {
  const T = THRESHOLDS.ranking;
  const ranked = top(post);
  const marginals = Object.fromEntries(aspects.map(a => [a, aspects.map(() => 0)]));
  for (const [cls, pr] of Object.entries(post)) split(cls).forEach((a, i) => (marginals[a]![i]! += pr));
  const positions = Object.fromEntries(aspects.map(a => [a, marginals[a]!.reduce((m, p, i) => m + p * (i + 1), 0)]));
  const lead = ranked[0]!;
  const firstLead = aspects.map(a => ({ aspect: a, p: marginals[a]![0]! })).sort((x, y) => y.p - x.p)[0]!;
  return {
    order: lead.p >= T.resolveP ? lead.cls : null, p: lead.p, best: { order: lead.cls, p: lead.p },
    candidates: ranked.filter(r => r.p >= T.candidateP).map(r => ({ order: r.cls, p: r.p })),
    first: firstLead.p >= T.firstP ? firstLead : null, positions, marginals,
  };
}

export function createRankEngine(cfg: {
  meta: EngineMeta; slot: Slot; aspects: string[]; tasks: RankTask[]; stopP: number; cap: number;
  aspectNames: Record<string, string>;
}): ExamEngine<RankState, RankResult> {
  const classes = permutations(cfg.aspects).map(o => o.join(""));
  const byId = new Map(cfg.tasks.map(t => [t.id, t]));
  const post = (s: RankState, skip?: string) => rankPosterior(classes,
    s.answers.filter(a => a.itemId !== skip).sort((x, y) => x.itemId.localeCompare(y.itemId)).map(a => a.ranking));

  /** ADAPTIVE stopping only (X-01): never limits which fixed-form answers are scored; every answer enters `post`. */
  const finished = (s: RankState) => {
    if (s.answers.length === 0) return false;
    const t = top(post(s))[0]!;
    return t.p >= cfg.stopP || s.answers.length >= Math.min(cfg.cap, cfg.tasks.length);
  };

  const ORDER_EVENT = "this complete order (Plackett–Luce expert model, uncalibrated)";
  const result = (s: RankState): RankResult => {
    const p = post(s); const [a, b] = top(p);
    const sum = summarizeRanking(p, cfg.aspects);
    const answered = s.answers.length, total = cfg.tasks.length;
    // A partial "X first" needs X to have actually been ranked first at least once: the model's position penalties
    // alone can push an always-second aspect over firstP, which no answer supports.
    const first = !sum.order && sum.first && s.answers.some(x => x.ranking[0] === sum.first!.aspect) ? sum.first : null;
    const quality: QualityNote[] = [];
    // Response-fit note: rankings that point to different orders. Context can legitimately cause this.
    if (answered >= 2 && !sum.order) {
      const firsts = new Set(s.answers.map(x => x.ranking[0]));
      quality.push({ code: "ranking-conflict", message: `Your rankings point in different directions${firsts.size > 1 ? ` (${firsts.size} different first choices)` : ""}, so no single order fits them well. That can reflect real differences between situations, not careless answers.` });
    }
    if (answered < total) quality.push({ code: "incomplete", message: `${total - answered} of ${total} rankings were not answered.` });
    const meta: ResultMeta = {
      engine: cfg.meta.id, scoringVersion: cfg.meta.scoringVersion ?? cfg.meta.version,
      completion: { answered, total, complete: answered === total },
      unresolved: sum.order ? [] : [first ? "positions after first" : "order"],
      quality,
      uncertainty: [
        ...sum.candidates.map(c => ({ output: c.order, event: ORDER_EVENT, kind: "model-probability" as const, value: c.p, calibrated: false as const })),
        ...cfg.aspects.map(x => ({ output: x, event: "aspect is in first position (expert model)", kind: "model-probability" as const, value: sum.marginals[x]![0]!, calibrated: false as const })),
      ],
      dependencies: [],
    };
    return {
      order: a!.cls, p: a!.p, runnerUp: { order: b!.cls, p: b!.p },
      resolved: sum.order, first, candidates: sum.candidates,
      positions: sum.positions, marginals: sum.marginals, tasks: answered, meta,
    };
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
      const full = post(s);
      // Statistic the explanation is about: the published order, P(first aspect leads) for a partial result,
      // or the most probable order otherwise.
      const pFirst = (p: Posterior, x: string) => Object.entries(p).reduce((m, [c, v]) => m + (c[0] === x ? v : 0), 0);
      const partial = !r.resolved && r.first ? r.first.aspect : null;
      const stat = (p: Posterior) => (partial ? pFirst(p, partial) : p[r.order] ?? 0);
      const fullStat = stat(full);
      const ev = s.answers.map(a => {
        const without = stat(post(s, a.itemId)) || 1e-12;
        const t = byId.get(a.itemId)!;
        const names = a.ranking.map(id => t.options.find(o => o.id === id)!.text);
        return { itemId: a.itemId, answer: `${t.text} You ranked first: “${names[0]}”`, delta: Math.round(Math.log(fullStat / without) * 100) / 100 };
      }).sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
      const supporting = r.resolved || partial ? ev.filter(x => x.delta > 0) : [];
      const topEv = (supporting.length ? supporting : ev).slice(0, 3);
      const ranked = top(full);
      const tiedOrders = ranked.filter(x => x.p >= r.p - 1e-9).map(x => x.cls);
      const below = ranked.find(x => x.p < r.p - 1e-9);
      const unresolvedText = tiedOrders.length === 1 ? `unresolved (most likely ${r.order})`
        : tiedOrders.length <= 4 ? `unresolved (tied: ${tiedOrders.join(", ")})` : "unresolved (tied)";
      if (partial) return [{ output: cfg.meta.name, result: `${partial} first, rest unresolved`, confidence: r.first!.p,
        confidenceEvent: "aspect is in first position (expert model)", topEvidence: topEv }];
      return [{ output: cfg.meta.name, result: r.resolved ?? unresolvedText,
        confidence: r.p, confidenceEvent: ORDER_EVENT, topEvidence: topEv,
        ...(below ? { runnerUp: { result: below.cls, confidence: below.p } } : {}) }];
    },
    serialize: s => JSON.stringify(s),
    deserialize(raw) {
      const s = JSON.parse(raw) as RankState;
      if (!s || s.v !== 1 || !Array.isArray(s.answers)) throw new Error("Unrecognised ranking state");
      const seen = new Set<string>();
      for (const x of s.answers) {
        const t = byId.get(x?.itemId);
        if (!t || seen.has(x.itemId) || !Array.isArray(x.ranking) || [...x.ranking].sort().join() !== t.options.map(o => o.id).sort().join())
          throw new Error(`Invalid ranking answer ${String(x?.itemId)}`);
        seen.add(x.itemId);
      }
      return s;
    },
    /** Not used by the web result path (X-02). Emits a token only for a resolved order. */
    bioTokens(s): BioToken[] {
      const all = s.answers.length === cfg.tasks.length;
      if (!finished(s) && !all) return [];
      const r = result(s);
      return r.resolved ? [{ slot: cfg.slot, text: r.resolved, confidence: r.p, source: "test" }] : [];
    },
  };
  return engine;
}
