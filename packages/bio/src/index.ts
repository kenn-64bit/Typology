// Step-by-step bio builder (SPEC §2.6). Thresholds come from @typo/engine-sdk THRESHOLDS.
import { SLOT_ORDER, THRESHOLDS, type BioToken, type Slot } from "@typo/engine-sdk";
export { SLOT_ORDER, type BioToken, type Slot };

export const PENDING = "···";

export function composeBio(tokens: Partial<Record<Slot, BioToken>>, pending = PENDING): string {
  return SLOT_ORDER.map(s => tokens[s]?.text ?? pending).join(" ");
}

/** Collect tokens from engines' bioTokens() output; later tokens for the same slot win. */
export function tokensBySlot(list: readonly BioToken[]): Partial<Record<Slot, BioToken>> {
  const out: Partial<Record<Slot, BioToken>> = {};
  for (const t of list) out[t.slot] = t;
  return out;
}

// ---- per-engine token formatters ----
/** Round away IEEE-754 subtraction drift so symmetric boundaries (0.45 / 0.55) compare identically. */
const clean = (x: number) => Math.round(x * 1e12) / 1e12;
type Fn = "T" | "F" | "S" | "N";
type Att = "i" | "e";

/** Jung (PDB classic code): attitude + dominant function, auxiliary in parentheses. */
export function jungToken(att: "I" | "E", dom: { f: Fn; a: Att }, aux: { f: Fn; a: Att }): string {
  return `${att}${dom.f}(${aux.f}) (${dom.f}${dom.a}${aux.f}${aux.a})`;
}

type Instinct = "so" | "sx" | "sp";
export const instinctToken = (order: [Instinct, Instinct, Instinct]) => order.join("/");

/**
 * Tritype with wing. While the tritype is pending (`tri` = null) show core + wing only: `··· (1w2)`.
 * An unresolved wing (null) prints `w?`. Tritype strings may contain `?` (unresolved center) or `(ab)` (order uncertain).
 */
export const tritypeToken = (tri: string | null, core: number, wing: number | null, pending = PENDING) =>
  `${tri ?? pending} (${core}w${wing ?? "?"})`;

const TEMP_ABBR = { phlegmatic: "phleg", melancholic: "mel", sanguine: "sang", choleric: "chol" } as const;
export type Temp = keyof typeof TEMP_ABBR;
export function temperamentToken(probs: Record<Temp, number>): string {
  const [first, second] = (Object.entries(probs) as [Temp, number][]).sort((a, b) => b[1] - a[1]) as [[Temp, number], [Temp, number]];
  return second[1] < THRESHOLDS.temperament.blendCut
    ? `${TEMP_ABBR[first[0]]} [dom]`
    : `${TEMP_ABBR[first[0]]}-${TEMP_ABBR[second[0]]}`;
}

/** AP (VLEF) and Temporistics (NVBP). */
export const orderToken = (order: string[]) => order.join("");

// SLOAN, traits in order S L O A N. Input is the score LEVEL as a model-percentile fraction Φ(θ) in [0, 1]
// (BF-01). Never pass a sign probability Φ(θ/se) here: that is certainty, not distance from the middle.
const SLOAN_POLES: [string, string][] = [["S", "R"], ["L", "C"], ["O", "U"], ["A", "E"], ["I", "N"]];
export type SloanStrength = "middle" | "borderline" | "clear" | "strong";
export function sloanStrength(level: number): SloanStrength {
  const T = THRESHOLDS.sloan, d = clean(Math.abs(level - 0.5));
  return d < T.middle ? "middle" : d < T.borderline ? "borderline" : d >= T.strong ? "strong" : "clear";
}
export function sloanToken(levels: number[]): string {
  return levels.map((x, i) => {
    const [hi, lo] = SLOAN_POLES[i]!;
    const letter = x >= 0.5 ? hi : lo;
    switch (sloanStrength(x)) {
      case "middle": return "X";
      case "strong": return `/${letter}/`;
      case "borderline": return `[${letter}]`;
      default: return letter;
    }
  }).join("").replace(/\/\//g, "/");          // merge adjacent markers: /R//L/ -> /R/L/
}

// MOTIVES: fixed order M-O-T-I-V-E-S, [high, low]. Inputs are score LEVELS Φ(θ) in [0, 1], never sign certainty.
export const MOTIVES: [string, string][] = [["M", "A"], ["O", "C"], ["T", "H"], ["I", "W"], ["V", "D"], ["E", "R"], ["S", "G"]];
export function motivesLetter(level: number, [hi, lo]: readonly [string, string]): string {
  const T = THRESHOLDS.motives, d = clean(level - 0.5);
  if (d >= clean(T.strong - 0.5)) return hi;
  if (-d >= clean(T.strong - 0.5)) return lo;
  if (d >= clean(T.medium - 0.5)) return hi.toLowerCase();
  if (-d >= clean(T.medium - 0.5)) return lo.toLowerCase();
  return "X";
}
/**
 * Index of the strongest trait, or null when no non-X trait leads every other by THRESHOLDS.motives.dominanceGap.
 * `candidates` lists the traits within that gap of the leader (all tied leaders when unresolved).
 */
export function motivesDominance(levels: number[]): { index: number | null; candidates: number[] } {
  const d = levels.map(x => clean(Math.abs(x - 0.5)));
  const top = Math.max(...d);
  const candidates = d.map((v, i) => [v, i] as const).filter(([v]) => clean(top - v) < THRESHOLDS.motives.dominanceGap).map(([, i]) => i);
  const lead = candidates.length === 1 ? candidates[0]! : null;
  const index = lead !== null && motivesLetter(levels[lead]!, MOTIVES[lead]!) !== "X" ? lead : null;
  return { index, candidates: index === null && motivesLetter(levels[candidates[0]!]!, MOTIVES[candidates[0]!]!) === "X" ? [] : candidates };
}
export function motivesToken(levels: number[]): string {
  const { index } = motivesDominance(levels);
  return levels.map((x, i) => {
    const l = motivesLetter(x, MOTIVES[i]!);
    return i === index ? `|${l}|` : l;
  }).join("");
}
