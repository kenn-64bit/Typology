// Glossary text: CONTENT.md §10. Do not reword. Section ids match the old /glossary anchors.
export interface GlossaryPage { id: string; system: string; href: string; rows: [token: string, name: string, meaning: string][] }

export const GLOSSARY_PAGES: GlossaryPage[] = [
  { id: "sloan", system: "Big Five / SLOAN", href: "/bigfive", rows: [
    ["S", "Social", "High Extraversion. You get energy from people."],
    ["R", "Reserved", "Low Extraversion. You get energy from quiet time."],
    ["L", "Limbic", "High Neuroticism. You feel stress and mood changes strongly."],
    ["C", "Calm", "Low Neuroticism. You stay steady under stress."],
    ["O", "Organized", "High Conscientiousness. You plan and finish tasks."],
    ["U", "Unstructured", "Low Conscientiousness. You prefer to stay flexible."],
    ["A", "Accommodating", "High Agreeableness. You cooperate and avoid conflict."],
    ["E", "Egocentric", "Low Agreeableness. You are direct and competitive."],
    ["I", "Inquisitive", "High Openness. You like new ideas and experiences."],
    ["N", "Non-curious", "Low Openness. You prefer the practical and familiar."],
    ["X", "Middle", "Your score is near 50%. You lean to neither side."],
    ["/X/", "Strong", "Your score is far from the middle."],
    ["[X]", "Borderline", "Your score is close to the middle. The letter can change on a retake."],
  ] },
  { id: "motives", system: "MOTIVES", href: "/motives", rows: [
    ["M / A", "Materialistic / Ascetic", "Interest in looks, status and money, or less interest."],
    ["O / C", "Offbeat / Conventional", "Attraction to the new and unusual, or to the known."],
    ["T / H", "Thinking / Haphazard", "A planned, orderly life, or a less organized one."],
    ["I / W", "Interpersonal / Withholding", "Helping others comes first, or comes later."],
    ["V / D", "Vital / Depressed", "Positive energy, or a low, pessimistic mood."],
    ["E / R", "Easygoing / Rigid", "Calm and relaxed, or tense."],
    ["S / G", "Sectarian / Globalistic", "Own group first, or the whole world first."],
    ["Uppercase", "Strong", "A strong result for that pole."],
    ["lowercase", "Medium", "A medium result for that pole."],
    ["X", "Middle", "No lean to either pole."],
    ["|X|", "Dominant", "Your strongest trait of the seven."],
  ] },
  { id: "temperament", system: "Four Temperaments", href: "/temperament", rows: [
    ["sang", "Sanguine", "Social and calm. Cheerful and active."],
    ["chol", "Choleric", "Social and limbic. Driven and quick to anger."],
    ["mel", "Melancholic", "Reserved and limbic. Thoughtful and sensitive."],
    ["phleg", "Phlegmatic", "Reserved and calm. Steady and patient."],
    ["[dom]", "Dominant (pure)", "No second temperament in the blend."],
    ["a-b", "Blend", "Temperament a is first. Temperament b is second."],
  ] },
  { id: "jung", system: "Jungian Functions", href: "/jung", rows: [
    ["I / E", "Introverted / Extraverted", "The function works on the inner world, or the outer world."],
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
    ["w", "Wing", "A neighbor type that adds traits to the core. Example: 1w2."],
    ["sp", "Self-preservation", "Instinct for safety, health and resources."],
    ["so", "Social", "Instinct for your place in groups."],
    ["sx", "Sexual (one-to-one)", "Instinct for intense one-to-one connection."],
    ["a/b/c", "Stacking", "Instinct order, strongest first. The last one is the blind spot."],
    ["Tritype", "Tritype", "Three numbers, one per center, strongest first. Example: 127."],
    ["Gut / Heart / Head", "Centers", "The three groups of types: 8-9-1, 2-3-4, 5-6-7."],
  ] },
  { id: "ap", system: "Attitudinal Psyche", href: "/ap", rows: [
    ["V", "Volition", "Will, decisions and power."],
    ["L", "Logic", "Reason, facts and ideas."],
    ["E", "Emotion", "Feelings and emotional expression."],
    ["F", "Physics", "The body, comfort and the material world."],
    ["1st", "Confident", "Strong. You trust your own view."],
    ["2nd", "Flexible", "Strong. You adapt it to others."],
    ["3rd", "Insecure", "Weak and sensitive. You want to improve."],
    ["4th", "Indifferent", "Weak and low priority. It does not worry you."],
  ] },
  { id: "temporistics", system: "Temporistics", href: "/temporistics", rows: [
    ["P", "Past", "\"Who am I?\" Experience, history and tradition."],
    ["N", "Present", "\"Where is my place?\" Involvement in what happens now."],
    ["B", "Future", "\"Where am I going?\" Goals and plans."],
    ["V", "Eternity", "\"Why am I?\" Meaning and the view from a distance."],
    ["1st–4th", "Positions", "Order of energy, from most to least."],
  ] },
];

/** Anchor id for one token entry, e.g. "enneagram-sx". */
export const tokenId = (page: string, token: string) =>
  `${page}-${token.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x"}`;
