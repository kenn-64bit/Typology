// Shared page text from CONTENT.md §1. Do not reword.
export const BADGES = {
  strong: { label: "STRONG EVIDENCE", tip: "Many independent studies support this model and its short tests." },
  some: { label: "SOME EVIDENCE", tip: "Studies support parts of this model. Other parts have little support." },
  mixed: { label: "MIXED EVIDENCE", tip: "Studies show mixed results. Independent evidence is thin." },
  little: { label: "LITTLE EVIDENCE", tip: "No independent study tests this model yet. Treat the result as self-reflection." },
} as const;
export type BadgeKey = keyof typeof BADGES;

export const TEST_BOX = {
  instructions: [
    "Answer for how you usually are, not how you want to be.",
    "There are no right or wrong answers.",
    "Answers are not saved until you reach your result.",
  ],
  start: "Start",
} as const;
