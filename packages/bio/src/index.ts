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
type Fn = "T" | "F" | "S" | "N";
type Att = "i" | "e";

/** Jung (PDB classic code): attitude + dominant function, auxiliary in parentheses. */
export function jungToken(att: "I" | "E", dom: { f: Fn; a: Att }, aux: { f: Fn; a: Att }): string {
  return `${att}${dom.f}(${aux.f}) (${dom.f}${dom.a}${aux.f}${aux.a})`;
}

type Instinct = "so" | "sx" | "sp";
export const instinctToken = (order: [Instinct, Instinct, Instinct]) => order.join("/");

/** Tritype with wing. While the tritype is pending (`tri` = null) show core + wing only: `··· (1w2)`. */
export const tritypeToken = (tri: string | null, core: number, wing: number, pending = PENDING) =>
  `${tri ?? pending} (${core}w${wing})`;

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

// SLOAN: p = probability of the high pole, traits in order S L O A N
const SLOAN_POLES: [string, string][] = [["S", "R"], ["L", "C"], ["O", "U"], ["A", "E"], ["I", "N"]];
export function sloanToken(p: number[]): string {
  const T = THRESHOLDS.sloan;
  return p.map((x, i) => {
    const [hi, lo] = SLOAN_POLES[i]!;
    const s = Math.abs(x - 0.5), letter = x >= 0.5 ? hi : lo;
    if (s < T.middle) return "X";
    if (s >= T.strong) return `/${letter}/`;   // strong
    if (s < T.borderline) return `[${letter}]`; // borderline
    return letter;
  }).join("").replace(/\/\//g, "/");          // merge adjacent markers: /R//L/ -> /R/L/
}

// MOTIVES: fixed order M-O-T-I-V-E-S, [high, low]
export const MOTIVES: [string, string][] = [["M", "A"], ["O", "C"], ["T", "H"], ["I", "W"], ["V", "D"], ["E", "R"], ["S", "G"]];
export function motivesLetter(p: number, [hi, lo]: readonly [string, string]): string {
  const T = THRESHOLDS.motives;
  if (p >= T.strong) return hi;
  if (p <= 1 - T.strong) return lo;
  if (p >= T.medium) return hi.toLowerCase();
  if (p <= 1 - T.medium) return lo.toLowerCase();
  return "X";
}
export function motivesToken(p: number[]): string {
  const dom = p.map(x => Math.abs(x - 0.5)).reduce((b, v, i, a) => (v > a[b]! ? i : b), 0);
  return p.map((x, i) => {
    const l = motivesLetter(x, MOTIVES[i]!);
    return i === dom ? `|${l}|` : l;
  }).join("");
}
