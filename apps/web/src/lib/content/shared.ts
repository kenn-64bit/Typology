// Shared page text: evidence labels and the quiz instructions.
export const BADGES = {
  strong: { label: "strong evidence", tip: "Many independent studies support this model and its short tests." },
  some: { label: "some evidence", tip: "Studies support parts of this model. Other parts have little support." },
  mixed: { label: "mixed evidence", tip: "Studies disagree. Few of them are independent." },
  little: { label: "little evidence", tip: "No independent study has tested this model. Read the result as a description you can check against yourself." },
} as const;
export type BadgeKey = keyof typeof BADGES;

export const TEST_BOX = {
  instructions: [
    "Answer for how you usually are, not how you want to be.",
    "There are no right or wrong answers.",
    "Nothing is saved until the end.",
  ],
} as const;
