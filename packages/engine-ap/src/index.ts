// Attitudinal Psyche engine: ranking tasks over Volition, Logic, Emotion, Physics → one of 24 orders.
// Research status: no validated instrument exists. The model measures RELATIVE ASPECT PRIORITY only (AP-01): it has
// no position-specific likelihoods, so it cannot identify confident / flexible / insecure / indifferent attitudes.
import { THRESHOLDS } from "@typo/engine-sdk";
import { createRankEngine, type RankTask } from "@typo/rank-engine";

export const AP_ASPECTS = { V: "Volition (will)", L: "Logic", E: "Emotion", F: "Physics (body, material world)" } as const;

const t = (id: string, text: string, V: string, L: string, E: string, F: string): RankTask => ({
  id, text, options: [{ id: "V", text: V }, { id: "L", text: L }, { id: "E", text: E }, { id: "F", text: F }],
});

/**
 * Original wording. Every task is ranked from "most like me" to "least like me", and its first option is scored as
 * the highest priority. ap2 was rewritten (AP-02): the old "which criticism bothers you least" reversed that
 * direction, and low concern does not identify one position anyway.
 */
export const AP_TASKS: RankTask[] = [
  t("ap1", "A group has to make a tough call quickly. What do you protect most?",
    "That a clear decision actually gets made", "That the reasoning behind it holds up", "That nobody leaves the room upset", "That the plan is practical and doable"),
  t("ap2", "Which do you put the most effort into getting right?",
    "Making decisions I can stand behind", "Reasoning that holds together", "Handling feelings well, mine and others'", "Keeping my body, home and money in order"),
  t("ap3", "You're advising a friend. What are you most likely to offer?",
    "A firm push to choose and commit", "An honest analysis of the options", "Comfort and understanding", "Practical help, like food or a lift"),
  t("ap4", "Which of these are you most sure you can do well?",
    "Set a direction and stick to it", "Think a problem through", "Read and express feelings", "Handle physical and money matters"),
  t("ap5", "In a disagreement, what do you push on most?",
    "What we will do", "What is true", "How people feel about it", "What it costs and what is comfortable"),
  t("ap6", "Which compliment would mean the most to you?",
    "“You know what you want”", "“You think so clearly”", "“You make people feel seen”", "“You have great taste and good sense with things”"),
  t("ap7", "Planning a weekend away with friends, what do you care about most?",
    "Having a say in what we do", "That the plan makes sense", "That everyone is in a good mood", "Good food, a comfortable bed, a sensible budget"),
];

export const apEngine = createRankEngine({
  meta: {
    id: "ap", name: "Attitudinal Psyche", version: "0.2.0", scoringVersion: "ap-2",
    evidence: { order: "exploratory" },
    glossary: { V: AP_ASPECTS.V, L: AP_ASPECTS.L, E: AP_ASPECTS.E, F: AP_ASPECTS.F, "1st…4th": "Highest to lowest priority in your rankings (not a measured attitude)" },
  },
  slot: "ap", aspects: ["V", "L", "E", "F"], tasks: AP_TASKS, aspectNames: AP_ASPECTS,
  stopP: THRESHOLDS.stop.apOrderP, cap: THRESHOLDS.stop.apCap,
});
export default apEngine;
