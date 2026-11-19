import { describe, expect, it } from "vitest";
import { randomExamples } from "./examples.ts";

const OWNER = "IT(N) (TiNi) so/sx/sp 127 (1w2) phleg [dom] NVBP VLEF /R/LOA[I] A|O|XIVRg";
const CENTER = (n: number) => ([8, 9, 1].includes(n) ? 0 : [2, 3, 4].includes(n) ? 1 : 2);

describe("random examples", () => {
  it("are always legal and never reuse the owner's tokens", () => {
    for (let i = 0; i < 500; i++) {
      const ex = randomExamples();
      for (const v of Object.values(ex)) expect(OWNER.split(/ (?=\S)/)).not.toContain(v);
      for (const tok of ["IT(N) (TiNi)", "127 (1w2)", "phleg [dom]", "/R/LOA[I]", "A|O|XIVRg"]) expect(Object.values(ex)).not.toContain(tok);
      const m = ex.tritype.match(/^(\d)(\d)(\d) \((\d)w(\d)\)$/)!;
      const [a, b, c, core, wing] = m.slice(1).map(Number) as [number, number, number, number, number];
      expect(a).toBe(core);
      expect(new Set([CENTER(a), CENTER(b), CENTER(c)]).size).toBe(3);
      expect(Math.abs(core - wing) === 1 || Math.abs(core - wing) === 8).toBe(true);
      expect(ex.instincts.split("/").sort()).toEqual(["so", "sp", "sx"]);
      expect([...ex.ap].sort().join("")).toBe("EFLV");
      expect([...ex.temporistics].sort().join("")).toBe("BNPV");
      expect(ex.jung).toMatch(/^[IE][TFSN]\([TFSN]\) \([TFSN][ie][TFSN][ie]\)$/);
    }
  });
});
