import { describe, expect, it } from "vitest";
import { splitSloan, sloanPartMeaning } from "./glossary.ts";

describe("splitSloan", () => {
  it("splits the owner's code into five tappable parts", () => {
    expect(splitSloan("/R/LOA[I]").map(p => p.text)).toEqual(["/R/", "L", "O", "A", "[I]"]);
  });
  it("handles merged strong markers and X", () => {
    expect(splitSloan("/R/C/XXX").map(p => p.text)).toEqual(["/R/", "/C/", "X", "X", "X"]);
    expect(splitSloan("/S/L/O/A/I/").map(p => p.letter).join("")).toBe("SLOAI");
  });
  it("explains a part", () => {
    expect(sloanPartMeaning(splitSloan("/R/LOA[I]")[0]!)).toMatch(/^Reserved.*strong/);
  });
});
