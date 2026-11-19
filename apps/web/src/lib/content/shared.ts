// Shared page text: evidence labels and the quiz instructions.
export const BADGES = {
  strong: { label: "STRONG EVIDENCE", tip: "Many independent studies support this model and its short tests." },
  some: { label: "SOME EVIDENCE", tip: "Studies support parts of this model. Other parts have little support." },
  mixed: { label: "MIXED EVIDENCE", tip: "Studies disagree. Few of them are independent." },
  little: { label: "LITTLE EVIDENCE", tip: "No independent study has tested this model. Read the result as a description you can check against yourself." },
} as const;
export type BadgeKey = keyof typeof BADGES;

export const TEST_BOX = {
  instructions: [
    "Answer for how you usually are, not how you want to be.",
    "There are no right or wrong answers.",
    "Nothing is saved until the end.",
  ],
} as const;
