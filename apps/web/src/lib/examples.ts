// Random, rule-abiding example tokens, regenerated on every visit so no real person's bio is shown.
import type { Slot } from "@typo/engine-sdk";
import { instinctToken, jungToken, motivesToken, orderToken, sloanToken, tritypeToken } from "@typo/bio";

const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(xs: readonly T[]): T => xs[rnd(xs.length)]!;
const shuffle = <T>(xs: readonly T[]): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
};

/** Tokens that must never be used as examples (the site owner's own bio). */
const RESERVED = new Set(["IT(N) (TiNi)", "so/sx/sp", "127 (1w2)", "phleg [dom]", "NVBP", "VLEF", "/R/LOA[I]", "A|O|XIVRg"]);

const CENTERS = [[8, 9, 1], [2, 3, 4], [5, 6, 7]] as const;
const wingsOf = (t: number) => [((t + 7) % 9) + 1, (t % 9) + 1];

function gen(): Record<Slot, string> {
  const dom = pick(["T", "F", "S", "N"] as const);
  const aux = pick(dom === "T" || dom === "F" ? (["S", "N"] as const) : (["T", "F"] as const));
  const domA = pick(["i", "e"] as const);
  const core = 1 + rnd(9);
  const wing = pick(wingsOf(core));
  const coreCenter = CENTERS.findIndex(c => (c as readonly number[]).includes(core));
  const others = shuffle(CENTERS.filter((_, i) => i !== coreCenter)).map(c => pick(c));
  const temps = shuffle(["phleg", "mel", "sang", "chol"]);
  return {
    jung: jungToken(domA === "i" ? "I" : "E", { f: dom, a: domA }, { f: aux, a: pick(["i", "e"] as const) }),
    instincts: instinctToken(shuffle(["so", "sx", "sp"] as const) as ["so" | "sx" | "sp", "so" | "sx" | "sp", "so" | "sx" | "sp"]),
    tritype: tritypeToken(`${core}${others.join("")}`, core, wing),
    temperament: Math.random() < 0.5 ? `${temps[0]} [dom]` : `${temps[0]}-${temps[1]}`,
    temporistics: orderToken(shuffle(["N", "V", "B", "P"])),
    ap: orderToken(shuffle(["V", "L", "E", "F"])),
    sloan: sloanToken(Array.from({ length: 5 }, () => Math.random())),
    motives: motivesToken(Array.from({ length: 7 }, () => Math.random())),
  };
}

export function randomExamples(): Record<Slot, string> {
  const ex = gen();
  for (const k of Object.keys(ex) as Slot[]) {
    for (let tries = 0; RESERVED.has(ex[k]) && tries < 50; tries++) ex[k] = gen()[k];
  }
  return ex;
}

/** One set per page load. */
export const EX = randomExamples();

export function exampleFor(slug: string): string {
  switch (slug) {
    case "bigfive": return EX.sloan;
    case "motives": return EX.motives;
    case "temperament": return EX.temperament;
    case "jung": return EX.jung;
    case "enneagram": return `${EX.instincts} ${EX.tritype}`;
    case "ap": return EX.ap;
    case "temporistics": return EX.temporistics;
    default: return "";
  }
}
