// Temporistics engine: ranking tasks over Present (N), Eternity (V), Future (B), Past (P) → one of 24 orders.
// Reuses the AP ranking engine (SPEC §10.1). Research status: theory only; results are exploratory.
// The output is a RELATIVE PRIORITY order of the four time aspects (TP-01, TP-02). It does not measure energy,
// insecurity, spirituality or any absolute amount, and it is published only when the rankings support one order.
import { THRESHOLDS } from "@typo/engine-sdk";
import { createRankEngine, type RankTask } from "@typo/rank-engine";

export const TEMPO_ASPECTS = { N: "Present", V: "Eternity", B: "Future", P: "Past" } as const;

const t = (id: string, text: string, N: string, V: string, B: string, P: string): RankTask => ({
  id, text, options: [{ id: "N", text: N }, { id: "V", text: V }, { id: "B", text: B }, { id: "P", text: P }],
});

/**
 * Original wording. Every task is ranked from "most like me" to "least like me" (first = highest priority).
 * tp3, tp4 and tp6 were rewritten to reduce dependence on religion, distress, current deadlines or owning keepsakes (TP-02).
 */
export const TEMPO_TASKS: RankTask[] = [
  t("tp1", "When you face a big decision, what do you look at most?",
    "What is happening right now", "What it means in the bigger picture", "Where it will lead", "What has worked before"),
  t("tp2", "Which kinds of conversation do you enjoy most?",
    "What's going on today", "Timeless questions with no final answer", "Plans and what could be", "Stories and memories"),
  t("tp3", "When you step back to get your bearings, what helps you most?",
    "Noticing what is in front of me now", "Thinking about what stays the same over time", "Picturing where things are going", "Recalling how things got to this point"),
  t("tp4", "In general, which kind of question do you find hardest to put down?",
    "What needs doing right now", "What really matters in the long run", "Where things are heading next", "How things came to be the way they are"),
  t("tp5", "Which saying sounds most like you?",
    "“Deal with what's in front of you.”", "“Some things are bigger than any moment.”", "“Build for tomorrow.”", "“Learn from history.”"),
  t("tp6", "When your mind wanders, where does it usually go?",
    "To what is going on around me", "To big questions about meaning", "To plans and what could happen", "To things that happened before"),
  t("tp7", "When a team argues, what do you bring up most?",
    "What we can do today", "The values that should guide us", "The goal we're aiming for", "What happened the last time"),
];

export const temporisticsEngine = createRankEngine({
  meta: {
    id: "temporistics", name: "Temporistics", version: "0.2.0", scoringVersion: "temporistics-2",
    evidence: { order: "exploratory" },
    glossary: { N: "Present", V: "Eternity", B: "Future", P: "Past", "1st…4th": "Highest to lowest priority in your rankings (not a measured amount of energy)" },
  },
  slot: "temporistics", aspects: ["N", "V", "B", "P"], tasks: TEMPO_TASKS, aspectNames: TEMPO_ASPECTS,
  stopP: THRESHOLDS.stop.temporisticsOrderP, cap: THRESHOLDS.stop.temporisticsCap,
});
export default temporisticsEngine;
