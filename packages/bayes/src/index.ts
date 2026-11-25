// Posterior update + Plackett–Luce ranking likelihood (SPEC §4.2). Framework-free utility.
export type Posterior = Record<string, number>;

/** Item likelihood table: P(answer index | class). Expert weights until calibrated (§4.2). */
export interface LikelihoodItem {
  likelihood: { module: string; table: Record<string, number[]> };
  params_source?: "expert" | "empirical";
}

export function normalize(p: Posterior): Posterior {
  const z = Object.values(p).reduce((s, v) => s + v, 0);
  const out: Posterior = {};
  for (const c in p) out[c] = z > 0 ? p[c]! / z : 0;
  return out;
}

export function uniform(classes: readonly string[]): Posterior {
  return Object.fromEntries(classes.map(c => [c, 1 / classes.length]));
}

/** Bayes update with one categorical answer. Classes absent from the prior stay pruned. */
export function update(prior: Posterior, item: LikelihoodItem, answerIdx: number): Posterior {
  const table = item.likelihood.table;
  const post: Posterior = {};
  for (const c in prior) post[c] = prior[c]! * (table[c]?.[answerIdx] ?? 1e-6);
  return normalize(post);
}

/** Hard constraints (§3.2): zero out illegal classes, renormalize. */
export function prune(p: Posterior, isLegal: (c: string) => boolean): Posterior {
  const out: Posterior = {};
  for (const c in p) out[c] = isLegal(c) ? p[c]! : 0;
  return normalize(out);
}

/** All orderings of the given symbols (24 for AP / Temporistics). */
export function permutations<T>(xs: readonly T[]): T[][] {
  if (xs.length <= 1) return [xs.slice()];
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map(rest => [x, ...rest]));
}

/** Plackett–Luce probability of observing `ranking` given positive worths per option. */
export function plackettLuce(ranking: readonly string[], worth: Readonly<Record<string, number>>): number {
  let p = 1, remaining = ranking.reduce((s, o) => s + (worth[o] ?? 0), 0);
  for (const o of ranking.slice(0, -1)) {
    const w = worth[o] ?? 0;
    if (!(remaining > 0) || !(w > 0)) return 0;
    p *= w / remaining;
    remaining -= w;
  }
  return p;
}

/**
 * Update a posterior over orders (class id = order string, e.g. "VLEF") from one observed ranking.
 * `worthFor(order)` gives the option worths implied by that class. First choice weighs most by construction.
 */
export function updateRanking(prior: Posterior, ranking: readonly string[], worthFor: (cls: string) => Record<string, number>): Posterior {
  const post: Posterior = {};
  for (const c in prior) {
    const l = plackettLuce(ranking, worthFor(c));
    post[c] = prior[c]! * (Number.isFinite(l) && l > 1e-12 ? l : 1e-12);
  }
  return normalize(post);
}

export function top(p: Posterior): { cls: string; p: number }[] {
  return Object.entries(p).sort((a, b) => b[1] - a[1]).map(([cls, v]) => ({ cls, p: v }));
}
