import { describe, expect, it } from "vitest";
import {
  composeBio, instinctToken, jungToken, motivesToken, orderToken, PENDING, sloanToken,
  temperamentToken, tokensBySlot, tritypeToken, type BioToken, type Slot,
} from "./index.ts";

const OWNER_BIO = "IT(N) (TiNi) so/sx/sp 127 (1w2) phleg [dom] NVBP VLEF /R/LOA[I] A|O|XIVRg";
const tok = (slot: Slot, text: string, confidence = 0.8): BioToken => ({ slot, text, confidence, source: "test" });

describe("SPEC §2.6.1 — rebuild the owner's bio", () => {
  // Sample engine outputs, fed in run order.
  const steps: BioToken[] = [
    tok("sloan", sloanToken([0.1, 0.75, 0.75, 0.75, 0.6])),                        // /R/LOA[I]
    tok("motives", motivesToken([0.1, 0.99, 0.5, 0.85, 0.85, 0.15, 0.35])),        // A|O|XIVRg
    tok("temperament", temperamentToken({ phlegmatic: 0.85, melancholic: 0.1, sanguine: 0.04, choleric: 0.01 })),
    tok("jung", jungToken("I", { f: "T", a: "i" }, { f: "N", a: "i" })),           // IT(N) (TiNi)
    tok("tritype", tritypeToken("127", 1, 2)),                                     // 127 (1w2)
    tok("instincts", instinctToken(["so", "sx", "sp"])),                           // so/sx/sp
    tok("ap", orderToken(["V", "L", "E", "F"])),
    tok("temporistics", orderToken(["N", "V", "B", "P"])),
  ];
  const expected = [
    "··· ··· ··· ··· ··· ··· /R/LOA[I] ···",
    "··· ··· ··· ··· ··· ··· /R/LOA[I] A|O|XIVRg",
    "··· ··· ··· phleg [dom] ··· ··· /R/LOA[I] A|O|XIVRg",
    "IT(N) (TiNi) ··· ··· phleg [dom] ··· ··· /R/LOA[I] A|O|XIVRg",
    "IT(N) (TiNi) ··· 127 (1w2) phleg [dom] ··· ··· /R/LOA[I] A|O|XIVRg",
    "IT(N) (TiNi) so/sx/sp 127 (1w2) phleg [dom] ··· ··· /R/LOA[I] A|O|XIVRg",
    "IT(N) (TiNi) so/sx/sp 127 (1w2) phleg [dom] ··· VLEF /R/LOA[I] A|O|XIVRg",
    OWNER_BIO,
  ];

  it("fills slots in display order, step by step", () => {
    const printed = steps.map((_, i) => composeBio(tokensBySlot(steps.slice(0, i + 1))));
    console.log("\n" + printed.join("\n") + "\n");
    expect(printed).toEqual(expected);
  });

  it("final bio matches the owner's bio exactly", () => {
    expect(composeBio(tokensBySlot(steps))).toBe(OWNER_BIO);
  });
});

describe("formatters", () => {
  it("pending tritype shows core + wing only", () => {
    expect(tritypeToken(null, 1, 2)).toBe(`${PENDING} (1w2)`);
  });
  it("temperament blend when runner-up ≥ cut", () => {
    expect(temperamentToken({ phlegmatic: 0.5, melancholic: 0.4, sanguine: 0.05, choleric: 0.05 })).toBe("phleg-mel");
  });
  it("SLOAN middle → X and adjacent strong markers merge", () => {
    expect(sloanToken([0.5, 0.5, 0.5, 0.5, 0.5])).toBe("XXXXX");
    expect(sloanToken([0.05, 0.05, 0.5, 0.5, 0.5])).toBe("/R/C/XXX");
  });
  it("self-typed token composes the same way", () => {
    expect(composeBio({ jung: { slot: "jung", text: "IT(N) (TiNi)", confidence: 1, source: "self-typed" } }))
      .toBe("IT(N) (TiNi) ··· ··· ··· ··· ··· ··· ···");
  });
});
