export type Slot = "jung" | "instincts" | "tritype" | "temperament" | "temporistics" | "ap" | "sloan" | "motives";

export interface BioToken {
  slot: Slot;
  text: string;
  confidence: number;
  source: "test" | "self-typed";
}

/** Display order = the community bio order (same as the owner's bio). */
export const SLOT_ORDER: Slot[] = ["jung", "instincts", "tritype", "temperament", "temporistics", "ap", "sloan", "motives"];
