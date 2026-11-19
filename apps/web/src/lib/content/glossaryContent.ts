// Glossary page text. Section ids match the old /glossary anchors.
export interface GlossaryPage { id: string; system: string; href: string; rows: [token: string, name: string, meaning: string][] }

export const GLOSSARY_PAGES: GlossaryPage[] = [
  { id: "sloan", system: "Big Five / SLOAN", href: "/bigfive", rows: [
    ["S", "Social", "High Extraversion. You get energy from people."],
    ["R", "Reserved", "Low Extraversion. You get energy from quiet time."],
    ["L", "Limbic", "High Neuroticism. You feel stress and changes of mood strongly."],
    ["C", "Calm", "Low Neuroticism. You stay steady under stress."],
    ["O", "Organized", "High Conscientiousness. You plan and finish tasks."],
    ["U", "Unstructured", "Low Conscientiousness. You prefer to stay flexible."],
    ["A", "Accommodating", "High Agreeableness. You cooperate and avoid conflict."],
    ["E", "Egocentric", "Low Agreeableness. You are direct and competitive."],
    ["I", "Inquisitive", "High Openness. You like new ideas and experiences."],
    ["N", "Non-curious", "Low Openness. You prefer the practical and familiar."],
    ["X", "Middle", "Your score is near 50%. You do not lean to either side."],
    ["/X/", "Strong", "Your score is far from the middle."],
    ["[X]", "Borderline", "Your score is near the middle. The other letter fits almost as well."],
  ] },
  { id: "motives", system: "MOTIVES", href: "/motives", rows: [
    ["M / A", "Materialistic / Ascetic", "Appearance, status and money matter to you, or they matter less."],
    ["O / C", "Offbeat / Conventional", "You want the new and unusual, or the known."],
    ["T / H", "Thinking / Haphazard", "A planned, orderly life, or a less organized one."],
    ["I / W", "Interpersonal / Withholding", "Helping others comes first, or it comes second."],
    ["V / D", "Vital / Depressed", "Positive energy, or a low, pessimistic mood. D is a trait name, not a diagnosis."],
    ["E / R", "Easygoing / Rigid", "Calm and relaxed, or tense."],
    ["S / G", "Sectarian / Globalistic", "Your own group first, or the whole world first."],
    ["Uppercase", "Strong", "A strong lean to that pole."],
    ["lowercase", "Medium", "A medium lean to that pole."],
    ["X", "Middle", "No lean to either pole."],
    ["|X|", "Dominant", "The strongest of your seven traits."],
  ] },
  { id: "temperament", system: "Four Temperaments", href: "/temperament", rows: [
    ["sang", "Sanguine", "Social and calm. Cheerful and active."],
    ["chol", "Choleric", "Social and limbic. Driven and quick to anger."],
    ["mel", "Melancholic", "Reserved and limbic. Thoughtful and sensitive."],
    ["phleg", "Phlegmatic", "Reserved and calm. Steady and patient."],
    ["[dom]", "Dominant", "The model strongly favours one area. It does not mean you are far inside it."],
    ["a-b", "Blend", "Temperament a is stronger. Temperament b is second."],
  ] },
  { id: "jung", system: "Jungian Functions", href: "/jung", rows: [
    ["I / E", "Introverted / Extraverted", "The function works on the inner world, or on the outer world."],
    ["T", "Thinking", "Decides by logic and consistency."],
    ["F", "Feeling", "Decides by values and the effect on people."],
    ["S", "Sensation", "Takes in concrete facts through the senses."],
    ["N", "Intuition", "Takes in patterns and possibilities."],
    ["Ti / Te", "Introverted / Extraverted Thinking", "Inner logic, or organizing facts and systems."],
    ["Fi / Fe", "Introverted / Extraverted Feeling", "Personal values, or group harmony."],
    ["Si / Se", "Introverted / Extraverted Sensation", "Past experience, or the present moment."],
    ["Ni / Ne", "Introverted / Extraverted Intuition", "One inner pattern, or many outer possibilities."],
    ["(X)", "Helper", "The helper (auxiliary) function in a Jungian code."],
  ] },
  { id: "enneagram", system: "Enneagram", href: "/enneagram", rows: [
    ["1–9", "Core types", "Reformer, Helper, Achiever, Individualist, Investigator, Loyalist, Enthusiast, Challenger, Peacemaker."],
    ["w", "Wing", "A type next to the core on the circle. It adds some of its traits. Example: 1w2."],
    ["sp", "Self-preservation", "The instinct for safety, health and resources."],
    ["so", "Social", "The instinct for your place in groups."],
    ["sx", "Sexual (one-to-one)", "The instinct for an intense connection with one person."],
    ["a/b/c", "Stacking", "The instincts in order, strongest first. The last one is the blind spot."],
    ["Tritype", "Tritype", "Three numbers, one per center, strongest first. Example: 127."],
    ["Gut / Heart / Head", "Centers", "The three groups of types: 8-9-1, 2-3-4, 5-6-7."],
  ] },
  { id: "ap", system: "Attitudinal Psyche", href: "/ap", rows: [
    ["V", "Volition", "Will, decisions and power."],
    ["L", "Logic", "Reason, facts and ideas."],
    ["E", "Emotion", "Feelings and emotional expression."],
    ["F", "Physics", "The body, comfort and the material world."],
    ["1st", "Confident", "In AP theory: strong, you trust your own view. The test measures only the order."],
    ["2nd", "Flexible", "Strong. You adapt it to other people."],
    ["3rd", "Insecure", "Weak and sensitive. You want to improve."],
    ["4th", "Indifferent", "Weak and low priority. It does not worry you."],
  ] },
  { id: "temporistics", system: "Temporistics", href: "/temporistics", rows: [
    ["P", "Past", "\"Who am I?\" Experience, history and tradition."],
    ["N", "Present", "\"Where is my place?\" Your part in what happens now."],
    ["B", "Future", "\"Where am I going?\" Goals and plans."],
    ["V", "Eternity", "\"Why am I?\" Meaning, and your life seen from a distance."],
    ["1st–4th", "Positions", "Your priority order, highest to lowest. The theory reads it as energy; the test does not measure energy."],
  ] },
];

/** Anchor id for one token entry, e.g. "enneagram-sx". */
export const tokenId = (page: string, token: string) =>
  `${page}-${token.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x"}`;
