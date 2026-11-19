// Test helper: answer like a respondent with fixed true θ per trait (modal GRM category).
import { catProbs } from "@typo/irt";
import { bigFiveEngine, ITEMS, type BigFiveState, type Trait } from "./index.ts";

export function runPersona(theta: Record<Trait, number>): BigFiveState {
  let s = bigFiveEngine.init({});
  for (let v = bigFiveEngine.next(s); v; v = bigFiveEngine.next(s)) {
    const item = ITEMS.find(i => i.id === v.id)!;
    const p = catProbs(theta[item.trait], item.a, item.b);
    const keyed = p.indexOf(Math.max(...p)) + 1;
    s = bigFiveEngine.answer(s, v.id, item.reverse ? 6 - keyed : keyed);
  }
  return s;
}
