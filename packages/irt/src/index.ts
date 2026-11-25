// Graded response model + EAP + Fisher information (SPEC §4.1). Framework-free utility.
export const GRID: number[] = Array.from({ length: 81 }, (_, i) => (i - 40) / 10);
const normPdf = (x: number) => Math.exp(-0.5 * x * x);

/** P(x = k | θ) for categories 1..5 (returned as indices 0..4). */
export function catProbs(theta: number, a: number, b: number[]): number[] {
  const star = [1, ...b.map(bk => 1 / (1 + Math.exp(-a * (theta - bk)))), 0];
  return star.slice(0, -1).map((p, k) => Math.max(p - star[k + 1]!, 1e-9));
}

export interface GrmAnswer { a: number; b: number[]; x: number; reverse?: boolean }

/** Reverse-keyed items: x' = 6 - x (equivalent to negating the loading). */
export const reverseScore = (x: number) => 6 - x;

/** EAP estimate and posterior SD for one trait, given answered items. */
export function eap(answers: GrmAnswer[], priorMean = 0): { theta: number; se: number } {
  const post = GRID.map(t => {
    let l = normPdf(t - priorMean);
    for (const r of answers) {
      const x = r.reverse ? reverseScore(r.x) : r.x;
      l *= catProbs(t, r.a, r.b)[x - 1]!;
    }
    return l;
  });
  // The grid is symmetric around 0; summing mirrored pairs keeps a symmetric posterior's mean exactly 0.
  const n = GRID.length;
  let z = 0, m = 0;
  for (let i = 0; i < n >> 1; i++) {
    z += post[i]! + post[n - 1 - i]!;
    m += GRID[i]! * post[i]! + GRID[n - 1 - i]! * post[n - 1 - i]!;
  }
  if (n % 2) z += post[n >> 1]!; // GRID[mid] = 0 adds nothing to the mean
  const mean = m / z;
  const sd = Math.sqrt(GRID.reduce((s, t, i) => s + (t - mean) ** 2 * post[i]!, 0) / z);
  return { theta: mean, se: sd };
}

/** Fisher information of a GRM item at θ. */
export function info(theta: number, a: number, b: number[]): number {
  const star = [1, ...b.map(bk => 1 / (1 + Math.exp(-a * (theta - bk)))), 0];
  const dstar = star.map(p => a * p * (1 - p));
  const P = catProbs(theta, a, b);
  return P.reduce((s, pk, k) => s + (dstar[k]! - dstar[k + 1]!) ** 2 / pk, 0);
}

/** P(θ > 0) from an EAP estimate (normal approx.) — feeds SLOAN/MOTIVES formatters. */
export function pAboveMedian(theta: number, se: number): number {
  return 0.5 * (1 + erf(theta / (se * Math.SQRT2)));
}
function erf(x: number): number { // Abramowitz–Stegun 7.1.26
  const s = Math.sign(x), t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
