// Temporistics engine: ranking tasks over Present (N), Eternity (V), Future (B), Past (P) → one of 24 orders.
// Reuses the AP ranking engine (SPEC §10.1). Research status: theory only; results are exploratory.
import { THRESHOLDS } from "@typo/engine-sdk";
import { createRankEngine, type RankTask } from "@typo/rank-engine";

export const TEMPO_ASPECTS = { N: "Present", V: "Eternity", B: "Future", P: "Past" } as const;

const t = (id: string, text: string, N: string, V: string, B: string, P: string): RankTask => ({
  id, text, options: [{ id: "N", text: N }, { id: "V", text: V }, { id: "B", text: B }, { id: "P", text: P }],
});

/** Original wording. Rank each from "most like me" to "least like me". */
export const TEMPO_TASKS: RankTask[] = [
  t("tp1", "You face a big decision. What do you look at first?",
    "What is happening right now", "What it means in the bigger picture", "Where it will lead", "What has worked before"),
  t("tp2", "Which kind of conversation do you enjoy most?",
    "What's going on today", "Timeless questions with no final answer", "Plans and what could be", "Stories and memories"),
  t("tp3", "When you feel lost, what steadies you most?",
    "Focusing on the next small step", "Remembering what never changes", "Picturing where I'm heading", "Looking back at how far I've come"),
  t("tp4", "Which of these do you find hardest to ignore?",
    "A problem in front of me right now", "A sense that something matters beyond this life", "A deadline or opportunity coming up", "Something unresolved from before"),
  t("tp5", "Which saying sounds most like you?",
    "“Deal with what's in front of you.”", "“Some things are bigger than any moment.”", "“Build for tomorrow.”", "“Learn from history.”"),
  t("tp6", "On a free afternoon, what are you most likely to do?",
    "Whatever feels good right now", "Read or think about something deep", "Work on a plan or project", "Look through old photos, notes or music"),
  t("tp7", "When a team argues, what do you bring up first?",
    "What we can do today", "The values that should guide us", "The goal we're aiming for", "What happened the last time"),
];

export const temporisticsEngine = createRankEngine({
  meta: {
    id: "temporistics", name: "Temporistics", version: "0.1.0",
    evidence: { order: "exploratory" },
    glossary: { N: "Present", V: "Eternity", B: "Future", P: "Past" },
  },
  slot: "temporistics", aspects: ["N", "V", "B", "P"], tasks: TEMPO_TASKS, aspectNames: TEMPO_ASPECTS,
  stopP: THRESHOLDS.stop.temporisticsOrderP, cap: THRESHOLDS.stop.temporisticsCap,
});
export default temporisticsEngine;
