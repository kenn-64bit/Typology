import { describe, expect, it } from "vitest";
import { likertQualityNotes, savedScoringVersion, THRESHOLDS, validateLikertState } from "./index.ts";

describe("shared result helpers", () => {
  it("sincere mixed answers produce no notes", () => {
    expect(likertQualityNotes([4, 2, 5, 3], [{ output: "X", forward: [4, 5], reverse: [2, 1] }], THRESHOLDS.quality)).toEqual([]);
  });
  it("straight-line Neutral is described without calling it invalid", () => {
    const [n] = likertQualityNotes([3, 3, 3], [], THRESHOLDS.quality);
    expect(n!.code).toBe("straight-line");
    expect(n!.message).toMatch(/sincere/);
  });
  it("reverse-key conflict needs both sides on the same end", () => {
    const sc = (f: number[], r: number[]) => likertQualityNotes([1, 2], [{ output: "O", forward: f, reverse: r }], THRESHOLDS.quality);
    expect(sc([5, 4], [4, 4])[0]!.code).toBe("reverse-key-conflict");
    expect(sc([1, 2], [2, 1])[0]!.code).toBe("reverse-key-conflict");
    expect(sc([5, 4], [2, 1])).toEqual([]);
    expect(sc([5], [5])).toEqual([]); // fewer than minPerSide
  });
  it("legacy saved results have no scoring version", () => {
    expect(savedScoringVersion({ traits: {} })).toBeNull();
    expect(savedScoringVersion({ meta: { scoringVersion: "bigfive-2" } })).toBe("bigfive-2");
    expect(savedScoringVersion(null)).toBeNull();
  });
  it("validateLikertState rejects non-objects", () => {
    expect(() => validateLikertState(null, { version: 1, knownIds: new Set() })).toThrow();
  });
});
