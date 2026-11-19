// Token glossary, taken from research/notation.md.
import type { Slot } from "@typo/engine-sdk";

export const SLOT_INFO: Record<Slot, { system: string; meaning: string }> = {
  jung: { system: "Classic Jungian type code (PDB style)",
    meaning: "Attitude + dominant function, with the auxiliary (helper) function in parentheses. For example, IF(S) would be an Introverted Feeling type with Sensation as auxiliary, written (FiSi) or (FiSe) in function shorthand. MBTI letters are shown separately." },
  instincts: { system: "Enneagram instincts",
    meaning: "Stacking order. so = social (belonging, group role); sx = sexual / one-to-one (intensity, chemistry); sp = self-preservation (safety, resources). The last one is the “blind spot”." },
  tritype: { system: "Enneagram tritype + core/wing",
    meaning: "One type from each center, in order of use: gut (8-9-1), heart (2-3-4), head (5-6-7). In brackets: core type with its wing, which is always a neighbouring number." },
  temperament: { system: "Four temperaments",
    meaning: "Temperament from Eysenck's Extraversion × Neuroticism grid. [dom] = pure, with no second temperament mixed in; phleg-mel = a blend." },
  temporistics: { system: "Temporistics",
    meaning: "Ranks four categories of time (letters from Russian): N = present, V = eternity, B = future, P = past." },
  ap: { system: "Attitudinal Psyche",
    meaning: "Aspect order from 1st to 4th: V = Volition (will), L = Logic, E = Emotion, F = Physics (body, material world)." },
  sloan: { system: "Big Five / SLOAN",
    meaning: "One letter per Big Five trait in the order S L O A N. /x/ = strong lean, [x] = borderline, X = about 50%." },
  motives: { system: "MOTIVES (SimilarMinds)",
    meaning: "Seven traits in the fixed order M-O-T-I-V-E-S. Uppercase = strong, lowercase = medium, X = middle, |bars| = dominant trait." },
};

/** SLOAN letter meanings, in S L O A N position order. */
export const SLOAN_POSITIONS: { trait: string; hi: [string, string]; lo: [string, string] }[] = [
  { trait: "Extraversion", hi: ["S", "Social: high Extraversion"], lo: ["R", "Reserved: low Extraversion"] },
  { trait: "Neuroticism", hi: ["L", "Limbic: high Neuroticism"], lo: ["C", "Calm: low Neuroticism"] },
  { trait: "Conscientiousness", hi: ["O", "Organized: high Conscientiousness"], lo: ["U", "Unstructured: low Conscientiousness"] },
  { trait: "Agreeableness", hi: ["A", "Accommodating: high Agreeableness"], lo: ["E", "Egocentric: low Agreeableness"] },
  { trait: "Openness", hi: ["I", "Inquisitive: high Openness"], lo: ["N", "Non-curious: low Openness"] },
];

export const SLOAN_MODIFIERS = {
  strong: "Slashes /x/ = a strong lean, e.g. /S/ = strongly Social.",
  plain: "A plain letter = a clear lean.",
  borderline: "Brackets [x] = a borderline lean, e.g. [N] = borderline Non-curious.",
  middle: "X = about 50%, no lean either way.",
} as const;

export interface SloanPart { text: string; letter: string; strength: keyof typeof SLOAN_MODIFIERS; pos: number }

/** Split a SLOAN code (with merged slashes, e.g. /S/L/XXX) into five tappable parts. */
export function splitSloan(code: string): SloanPart[] {
  const out: SloanPart[] = [];
  for (let i = 0; i < code.length && out.length < 5;) {
    const c = code[i]!;
    if (c === "[") { out.push({ text: code.slice(i, i + 3), letter: code[i + 1]!, strength: "borderline", pos: out.length }); i += 3; }
    else if (c === "/") {
      if (code[i + 2] === "/") { out.push({ text: `/${code[i + 1]}/`, letter: code[i + 1]!, strength: "strong", pos: out.length }); i += 2; }
      else i += 1; // closing slash shared with the previous strong letter
    } else { out.push({ text: c, letter: c, strength: c === "X" ? "middle" : "plain", pos: out.length }); i += 1; }
  }
  return out;
}

export function sloanPartMeaning(p: SloanPart): string {
  const pos = SLOAN_POSITIONS[p.pos]!;
  const letter = p.letter === "X" ? `X: middle on ${pos.trait}` : (p.letter === pos.hi[0] ? pos.hi[1] : pos.lo[1]);
  return `${letter}. ${SLOAN_MODIFIERS[p.strength]}`;
}

export const EVIDENCE_LABEL = { strong: "Strong evidence", moderate: "Some evidence", mixed: "Mixed evidence", exploratory: "Little evidence" } as const;

/** General reference: every token a reader may meet, per system (not tied to one person's bio). */
export interface GlossarySection { id: string; title: string; intro: string; groups: { label: string; rows: [string, string][] }[] }

export const GLOSSARY: GlossarySection[] = [
  { id: "sloan", title: "Big Five / SLOAN", intro: "One letter per Big Five trait, always in the order S L O A N.", groups: [
    { label: "Letters", rows: [
      ["S", "Social: high Extraversion"], ["R", "Reserved: low Extraversion"],
      ["L", "Limbic: high Neuroticism"], ["C", "Calm: low Neuroticism"],
      ["O", "Organized: high Conscientiousness"], ["U", "Unstructured: low Conscientiousness"],
      ["A", "Accommodating: high Agreeableness"], ["E", "Egocentric: low Agreeableness"],
      ["I", "Inquisitive: high Openness"], ["N", "Non-curious: low Openness"]] },
    { label: "Markers", rows: [
      ["/x/", "Strong lean, e.g. /S/ = strongly Social"], ["x", "A plain letter: a clear lean"],
      ["[x]", "Borderline lean, e.g. [N] = borderline Non-curious"], ["X", "About 50%, no lean"]] }] },
  { id: "motives", title: "MOTIVES", intro: "Seven traits in the fixed order M-O-T-I-V-E-S. Each position has a high and a low pole.", groups: [
    { label: "Letters", rows: [
      ["M / A", "Materialistic / Ascetic"], ["O / C", "Offbeat / Conventional"], ["T / H", "Thinking / Haphazard"],
      ["I / W", "Interpersonal / Withdrawn"], ["V / D", "Vital / Dependent"], ["E / R", "Easygoing / Rigid"], ["S / G", "Sectarian / Globalistic"]] },
    { label: "Markers", rows: [
      ["UPPERCASE", "Strong lean"], ["lowercase", "Medium lean"], ["X", "Middle"], ["|x|", "Bars mark the dominant trait"]] }] },
  { id: "temperament", title: "Four temperaments", intro: "Read through Eysenck's Extraversion × Neuroticism grid.", groups: [
    { label: "Temperaments", rows: [
      ["chol", "Choleric: high Neuroticism, high Extraversion"], ["mel", "Melancholic: high Neuroticism, low Extraversion"],
      ["sang", "Sanguine: low Neuroticism, high Extraversion"], ["phleg", "Phlegmatic: low Neuroticism, low Extraversion"]] },
    { label: "Markers", rows: [["x [dom]", "Pure: no second temperament mixed in"], ["x-y", "A blend, strongest first, e.g. mel-phleg"]] }] },
  { id: "jung", title: "Jungian functions", intro: "Two attitudes combined with four functions give eight function-attitudes.", groups: [
    { label: "Attitudes and functions", rows: [
      ["I / E", "Introverted / Extraverted (attitude)"], ["T", "Thinking"], ["F", "Feeling"], ["S", "Sensation"], ["N", "iNtuition"]] },
    { label: "Function-attitudes", rows: [
      ["Ti / Te", "Introverted / extraverted Thinking"], ["Fi / Fe", "Introverted / extraverted Feeling"],
      ["Si / Se", "Introverted / extraverted Sensation"], ["Ni / Ne", "Introverted / extraverted iNtuition"]] },
    { label: "Code format", rows: [
      ["AF(G)", "Attitude + dominant function, auxiliary in parentheses"],
      ["(XxYy)", "The top two function-attitudes in shorthand"],
      ["MBTI letters", "Shown separately; MBTI requires the top two to alternate attitudes"]] }] },
  { id: "enneagram", title: "Enneagram", intro: "Nine core types in three centers, plus wing, instincts and tritype.", groups: [
    { label: "Types", rows: [
      ["1", "Reformer"], ["2", "Helper"], ["3", "Achiever"], ["4", "Individualist"], ["5", "Investigator"],
      ["6", "Loyalist"], ["7", "Enthusiast"], ["8", "Challenger"], ["9", "Peacemaker"]] },
    { label: "Centers", rows: [["Gut", "8, 9, 1"], ["Heart", "2, 3, 4"], ["Head", "5, 6, 7"]] },
    { label: "Notation", rows: [
      ["XwY", "Core type X with wing Y; the wing is always a neighbouring number"],
      ["XYZ", "Tritype: one type per center, in order of use; the first digit is the core"]] },
    { label: "Instincts", rows: [
      ["sp", "Self-preservation: safety, health, resources"], ["so", "Social: belonging, group role"],
      ["sx", "Sexual / one-to-one: intensity, chemistry"],
      ["a/b/c", "Stacking: dominant first, the last one is the blind spot"]] }] },
  { id: "ap", title: "Attitudinal Psyche", intro: "Four aspects ranked from 1st to 4th; 24 possible orders.", groups: [
    { label: "Aspects", rows: [["V", "Volition: will"], ["L", "Logic"], ["E", "Emotion"], ["F", "Physics: body, material world"]] },
    { label: "Positions", rows: [
      ["1st", "Confident, results-focused"], ["2nd", "Confident, process-focused and flexible"],
      ["3rd", "Insecure, sensitive to others' judgement"], ["4th", "Indifferent, easily yields"]] }] },
  { id: "temporistics", title: "Temporistics", intro: "Four categories of time ranked from 1st to 4th; letters come from Russian; 24 possible orders.", groups: [
    { label: "Times", rows: [["N", "Present"], ["V", "Eternity"], ["B", "Future"], ["P", "Past"]] }] },
];
