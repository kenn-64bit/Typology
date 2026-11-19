// The six typologies, each explained on its own page. Text adapted from research/dossier.md and notation.md.
import type { EvidenceLevel, Slot } from "@typo/engine-sdk";

export interface Typology {
  slug: string; name: string; short: string; /** Full name for the header nav. */ navName: string; slots: Slot[];
  evidence: EvidenceLevel; summary: string; measures: string; notation: string[]; caveat: string; hasTest: boolean;
  /** Rough question count shown before starting. */ questions: string;
}

export const TYPOLOGIES: Typology[] = [
  { slug: "bigfive", questions: "40 questions", navName: "Big Five / SLOAN", name: "Big Five / SLOAN", short: "Big Five", slots: ["sloan"], evidence: "strong", hasTest: true,
    summary: "Five continuous traits from decades of lexical studies, written as a five-letter SLOAN code.",
    measures: "Extraversion, Neuroticism, Conscientiousness, Agreeableness and Openness. SLOAN is a notation, not a separate theory: it turns each trait into one letter.",
    notation: ["S / R: Social or Reserved (Extraversion)", "L / C: Limbic or Calm (Neuroticism)", "O / U: Organized or Unstructured (Conscientiousness)", "A / E: Accommodating or Egocentric (Agreeableness)", "I / N: Inquisitive or Non-curious (Openness)", "/x/ strong · [x] borderline · X about 50%"],
    caveat: "The best-validated system here. Letters near 50% can flip on retest, so the percentile is shown next to each letter." },
  { slug: "motives", questions: "21 questions", navName: "Motives", name: "MOTIVES (SimilarMinds)", short: "MOTIVES", slots: ["motives"], evidence: "exploratory", hasTest: true,
    summary: "Seven bipolar traits in the fixed order M-O-T-I-V-E-S.",
    measures: "Materialistic/Ascetic, Offbeat/Conventional, Thinking/Haphazard, Interpersonal/Withdrawn, Vital/Dependent, Easygoing/Rigid, Sectarian/Globalistic.",
    notation: ["Uppercase = strong lean", "lowercase = medium lean", "X = middle", "|bars| = your dominant trait"],
    caveat: "Self-published by its author and not independently replicated." },
  { slug: "temperament", questions: "1 ranking, plus 8 questions if you haven't done Big Five", navName: "Four Temperaments", name: "Four Temperaments", short: "Temperament", slots: ["temperament"], evidence: "exploratory", hasTest: true,
    summary: "The classic four temperaments, read through Eysenck's Extraversion × Neuroticism grid.",
    measures: "Choleric (high N, high E), melancholic (high N, low E), sanguine (low N, high E), phlegmatic (low N, low E).",
    notation: ["phleg · mel · sang · chol", "[dom] = pure, no second temperament", "phleg-mel = a blend"],
    caveat: "Humoral theory is rejected; only the modern E × N version has support." },
  { slug: "jung", questions: "44 questions", navName: "Jungian Functions", name: "Jungian Functions", short: "Jung", slots: ["jung"], evidence: "moderate", hasTest: true,
    summary: "Jung's eight function-attitudes, written as a classic type code.",
    measures: "Introversion or extraversion combined with Thinking, Feeling, Sensation and iNtuition.",
    notation: ["1st letter = attitude of the dominant function (I or E)", "2nd letter = dominant function; the letter in brackets = auxiliary", "(XxYy) = the same in function shorthand", "MBTI letters are shown separately"],
    caveat: "The four scales are fairly stable; four-letter types and function stacks often change on retest." },
  { slug: "enneagram", questions: "32 questions", navName: "Enneagram", name: "Enneagram", short: "Enneagram", slots: ["tritype", "instincts"], evidence: "mixed", hasTest: true,
    summary: "Core type with wing, instinct stacking and tritype.",
    measures: "Nine core types in three centers (gut 8-9-1, heart 2-3-4, head 5-6-7), the neighbouring wing, the order of three instincts, and one type per center.",
    notation: ["XwY = core type X with wing Y (always a neighbouring number)", "a/b/c = instinct order (so, sx, sp), strongest first", "XYZ = tritype: one type per center, core first"],
    caveat: "Mixed evidence for core type; little support for wings, instincts or tritype." },
  { slug: "ap", questions: "7 rankings", navName: "Attitudinal Psyche", name: "Attitudinal Psyche", short: "AP", slots: ["ap"], evidence: "exploratory", hasTest: true,
    summary: "The order of four aspects: Volition, Logic, Emotion and Physics.",
    measures: "How confident and how open to others you are in will, reasoning, feeling and the material world. 24 possible orders.",
    notation: ["V = Volition (will)", "L = Logic", "E = Emotion", "F = Physics (body, material world)", "Written from 1st to 4th"],
    caveat: "No peer-reviewed psychometric studies were found. Treat as self-reflection." },
  { slug: "temporistics", questions: "7 rankings", navName: "Temporistics", name: "Temporistics", short: "Temporistics", slots: ["temporistics"], evidence: "exploratory", hasTest: true,
    summary: "The order of four categories of time.",
    measures: "Your relationship to the present, eternity, the future and the past. 24 possible orders.",
    notation: ["N = present", "V = eternity", "B = future", "P = past", "Letters come from the Russian words"],
    caveat: "Theory only; no validated instrument exists." },
];

export const bySlug = (slug: string) => TYPOLOGIES.find(t => t.slug === slug);
