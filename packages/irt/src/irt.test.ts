import { describe, expect, it } from "vitest";
import { catProbs, eap, info, pAboveMedian } from "./index.ts";

const b = [-1.5, -0.5, 0.5, 1.5];
describe("GRM", () => {
  it("category probabilities sum to 1", () => {
    for (const t of [-3, 0, 2.5]) expect(catProbs(t, 1.5, b).reduce((s, p) => s + p, 0)).toBeCloseTo(1, 6);
  });
  it("SPEC §4.5 sanity check: six 'strongly agree' at a=1.5 → θ≈2.3, SE≈0.55", () => {
    const r = eap(Array.from({ length: 6 }, () => ({ a: 1.5, b, x: 5 })));
    expect(r.theta).toBeGreaterThan(2.0); expect(r.theta).toBeLessThan(2.6);
    expect(r.se).toBeGreaterThan(0.45); expect(r.se).toBeLessThan(0.65);
  });
  it("reverse-keyed answer mirrors the estimate", () => {
    const fwd = eap([{ a: 1.5, b, x: 5 }]).theta, rev = eap([{ a: 1.5, b, x: 5, reverse: true }]).theta;
    expect(rev).toBeCloseTo(-fwd, 6);
  });
  it("information peaks near the thresholds, not far away", () => {
    expect(info(0, 1.5, b)).toBeGreaterThan(info(3.5, 1.5, b));
  });
  it("pAboveMedian", () => { expect(pAboveMedian(0, 1)).toBeCloseTo(0.5, 6); expect(pAboveMedian(2, 1)).toBeCloseTo(0.977, 2); });
});
