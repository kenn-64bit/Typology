// Attitudinal Psyche engine: ranking tasks over Volition, Logic, Emotion, Physics → one of 24 orders.
// Research status: no validated instrument exists; results are exploratory self-description.
import { THRESHOLDS } from "@typo/engine-sdk";
import { createRankEngine, type RankTask } from "@typo/rank-engine";

export const AP_ASPECTS = { V: "Volition (will)", L: "Logic", E: "Emotion", F: "Physics (body, material world)" } as const;

const t = (id: string, text: string, V: string, L: string, E: string, F: string): RankTask => ({
  id, text, options: [{ id: "V", text: V }, { id: "L", text: L }, { id: "E", text: E }, { id: "F", text: F }],
});

/** Original wording. Rank each from "most like me" to "least like me". */
export const AP_TASKS: RankTask[] = [
  t("ap1", "A group has to make a tough call quickly. What do you protect first?",
    "That a clear decision actually gets made", "That the reasoning behind it holds up", "That nobody leaves the room upset", "That the plan is practical and doable"),
  t("ap2", "Someone criticises you in front of others. Which kind of criticism would you shrug off most easily?",
    "“You're too stubborn”", "“Your argument doesn't make sense”", "“You come across as cold”", "“You look a bit of a mess today”"),
  t("ap3", "You're advising a friend. What do you find yourself offering first?",
    "A firm push to choose and commit", "An honest analysis of the options", "Comfort and understanding", "Practical help, like food or a lift"),
  t("ap4", "Which of these do you feel most sure of in yourself?",
    "My ability to set a direction and stick to it", "My ability to think a problem through", "My ability to read and express feelings", "My ability to handle physical and money matters"),
  t("ap5", "In a disagreement, what are you most likely to keep pushing on?",
    "What we will do", "What is true", "How people feel about it", "What it costs and what is comfortable"),
  t("ap6", "Which compliment would mean the most to you?",
    "“You know what you want”", "“You think so clearly”", "“You make people feel seen”", "“You have great taste and good sense with things”"),
  t("ap7", "Planning a weekend away together, what do you care about first?",
    "Having a say in what we do", "That the plan makes sense", "That everyone is in a good mood", "Good food, a comfortable bed, a sensible budget"),
];

export const apEngine = createRankEngine({
  meta: {
    id: "ap", name: "Attitudinal Psyche", version: "0.1.0",
    evidence: { order: "exploratory" },
    glossary: { V: AP_ASPECTS.V, L: AP_ASPECTS.L, E: AP_ASPECTS.E, F: AP_ASPECTS.F },
  },
  slot: "ap", aspects: ["V", "L", "E", "F"], tasks: AP_TASKS, aspectNames: AP_ASPECTS,
  stopP: THRESHOLDS.stop.apOrderP, cap: THRESHOLDS.stop.apCap,
});
export default apEngine;
