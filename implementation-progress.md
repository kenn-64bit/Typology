# Implementation progress

Audit record: `incident-report.md` (unchanged). This file tracks engineering work against it.
Engineering completion is not psychometric validation: no respondent data, calibration, norms or reliability
estimates exist for any engine, and none were invented.

## Phase status

| Phase | Engine | Status |
|---|---|---|
| 1 | Big Five + shared result foundations | complete |
| 2 | MOTIVES + optional prior policy | complete |
| 3 | Four Temperaments | complete |
| 4 | Jungian Functions | complete |
| 5 | Enneagram | complete |
| 6 | Attitudinal Psyche + shared ranking | complete |
| 7 | Temporistics + final integration | complete |

## Phase 1 — Big Five and shared result foundations

**Engineering status:** complete (2026-11-19).

**Findings addressed by code changes:** BF-01, BF-02. Shared groundwork for X-03, X-06, X-07, X-08, X-11 (Big Five only; other engines adopt it in their phases).

**Findings that still need respondent data or a theory decision:** BF-03 (item validity), X-05 (calibration), the SLOAN and quality cutoffs (provisional, unpiloted).

### Decisions and provisional assumptions

- **Level metric for SLOAN strength:** the model percentile Φ(θ), which uses the test's built-in N(0,1) reference, not a population norm. `THRESHOLDS.sloan` keeps its old numbers (0.05 / 0.15 / 0.35), but their unit is now the distance of Φ(θ) from 0.5. So 45th–55th is middle, below 35th–65th is borderline, and at or beyond 15th/85th is strong. *Provisional expert cutoffs. They were not retuned, because there is no data to retune them with.*
- **No clear lean:** a trait in the middle band has `lean: null` and `letter: "X"`, and the token shows X. The token and the breakdown now use the same level rule, so floating-point residue can no longer pick a pole.
- **Sign certainty:** `pHigh` (P(θ > 0) under the model) is still reported, but only under the named event "score is above the model midpoint (θ > 0)". It no longer drives any label.
- **Header confidence:** Big Five no longer shows a single "% confidence". The averaged `confidence` field is kept for older consumers (orchestrator/bio tokens) and is marked `@deprecated` because it is not a probability for the whole code (X-06).
- **Response-quality notes (non-punitive):** a straight-line note appears when every answer is identical. A reverse-key conflict note appears when the mean raw answer on both the forward and reverse items of a trait is ≥ 3.75 (or both are ≤ 2.25), with at least 2 items per side. `THRESHOLDS.quality` has these values; they are provisional. Notes never reject or rescore answers. An all-Neutral note says explicitly that the answer may be sincere.
- **Order invariance:** each trait's answers are sorted by item id before the likelihood product. Before this, answer order changed θ in the 16th decimal place.
- **Scoring version:** `BIGFIVE_SCORING_VERSION = "bigfive-2"`, and the package version is 0.2.0. θ, SD and the published E/N values did not change meaning, so legacy saved Big Five results (no `meta`) stay valid as priors. `savedScoringVersion()` returns null for them, which later phases can use to decide compatibility.
- **BF-03 wording:** I changed no item text. Rewording without pilot data would swap one unvalidated item for another. The only copy corrections are page and glossary claims the source does not support (see below).

### Source changes

- `packages/engine-sdk/src/result.ts` (new): `ResultMeta` (completion, unresolved, quality, uncertainty, dependencies, scoringVersion), `UncertaintyMeasure` with a named `event`, a `kind`, and `calibrated: false`; `QualityNote`; `Dependency`; `validateLikertState`; `likertQualityNotes`; `savedScoringVersion`; `isFiniteNumber`.
- `packages/engine-sdk/src/index.ts`: exports the result module; adds optional `EngineMeta.scoringVersion` and `Explanation.confidenceEvent` (additive, so existing engines compile unchanged).
- `packages/engine-sdk/src/thresholds.ts`: the header no longer claims every constant lives here, and lists the other sources (X-11); documents `sloan` units; adds `quality`; notes that `stop.*` is adaptive-only.
- `packages/bio/src/index.ts`: `sloanToken` takes levels Φ(θ); new `sloanStrength(level)`.
- `packages/engine-bigfive/src/index.ts`: adds `level`, `strength` and `lean` to TraitResult; `letter` is X when there is no lean; adds `meta: ResultMeta` to the result; the explanation names its event and drops the sign-probability "runner-up"; deserialization is validated; answer order is deterministic.
- `apps/web/src/lib/results/BigFiveResult.svelte`: no averaged confidence; breakdown shows strength or "no clear lean" and "model chance of this side"; quality notes go into the notes block; "model percentile" wording.
- `apps/web/src/lib/content/BigFivePage.svelte`, `glossaryContent.ts`: removed unmeasured retake-stability claims and the "higher than about 80 of 100 people" population example; strong is defined by percentile.
- `apps/web/src/lib/app.svelte.ts`: on load, drops saved results that are not objects and engine states that are not strings.

### Checks performed

- Baseline before changes: `pnpm test` 29/29 tasks passed; `pnpm typecheck` 15/15 passed.
- After changes: `pnpm test` 29/29 tasks passed; `pnpm typecheck` 15/15 passed (svelte-check 0 errors, 0 warnings); `pnpm build` succeeded.
- New Big Five fixtures (all pass): raw all-Neutral, all-Agree, all-Disagree and all-Strongly-agree each give XXXXX with no lean, plus the expected straight-line and reverse-key notes. Keyed moderate answers give every trait a high lean with strength equal to `sloanStrength(Φ(θ))` and no notes. A conflicting keyed Openness block gives an Openness conflict note only. Token X matches lean null. Uncertainty measures are named and uncalibrated. An incomplete form is reported. Formatter invariance: strength is unchanged when only SD changes, and a precise θ = 0.5 is "clear", not "strong". Answer order and answer replacement give identical results. Deserialize rejects a wrong version, unknown id, duplicate, out-of-range or non-integer answer, and a missing or non-finite prior.
- New SDK helper tests: 5 pass.
- One existing expectation changed on purpose: the adaptive persona `/R/L/O/A/X` became `/R/LOAX`. The θ≈1 traits now read as clear rather than strong, which is the BF-01 correction itself.
- Browser check: **not performed**. No browser tool was available in this session. The result screen was checked only by type check and build.

### Remaining work

- Other engines do not yet emit `ResultMeta`; Phases 2–7 adopt it.
- No dependent engine checks `savedScoringVersion` yet. That happens in Phase 2 (MOTIVES prior policy) and Phases 3, 4 and 7.
- Overview page still says MOTIVES, Temperaments and Jung "ask fewer questions" with Big Five (X-10). Owned by Phases 2–4.
- Orchestrator and bio-token paths still read the deprecated averaged `confidence` (X-02; Phase 6).

**Next phase:** Phase 2 — MOTIVES and optional prior policy.

## Phase 2 — MOTIVES and optional prior policy

**Engineering status:** complete (2026-11-19).

**Findings addressed by code changes:** MO-01, MO-02, MO-03, MO-04 (label/content alignment), X-04 (policy), X-10 (MOTIVES counts and the "fewer questions" claims). Applied X-03, X-06, X-07, X-08 and X-11 to MOTIVES.

**Findings that still need respondent data or a theory decision:** MO-02 and MO-04 item validity (the new items are unpiloted), acquiescence as a separate response style, and the X-04 cross-construct mapping (needs data before any prior can be justified).

### Decisions and provisional assumptions

- **Level metric:** case comes from Φ(θ) (model percentile). `THRESHOLDS.motives.strong/medium` keep their values (0.8/0.6) but their unit is now level. Uppercase is ≥80th or ≤20th, lowercase ≥60th or ≤40th, X otherwise. Provisional.
- **Dominance:** bars go on a trait only when it is not X and its distance from the middle exceeds every other trait's by ≥ `dominanceGap` = 0.05 (level units, provisional). Otherwise there are no bars, `dominant.trait` is null, and `dominant.candidates` lists the tied leaders. "strongest trait" goes into `meta.unresolved` when there is a tie.
- **Keying balance:** one original reverse-keyed item was added per trait. The bank is now 28 items, 2 forward and 2 reverse per trait. Under the symmetric expert parameters, raw uniform answering now gives θ = 0 exactly on every trait.
- **Construct choice (MO-04):** the documented page and glossary definitions win. I = putting others' needs first (helping), and its items were rewritten to match. Before, they measured sociability, which was closer to Big Five E. V = optimism and energy: v2 was rewritten (the old version asked about feeling drained after rest, a health and sleep confound) and v4 added. m3 was rewritten (brand and price attention mixes thrift with status). Engine pole names now match the page: W = Withholding, D = Depressed. The page's warning that "Depressed" is a trait name, not a diagnosis, is kept. All item wording is original.
- **Prior policy (X-04):** `THRESHOLDS.priorPolicy = "independent"`. MOTIVES scores do not use any Big Five prior. `init(profile)` still reads the latest profile on every call, so the latest-result behaviour is preserved, but under this policy it applies a zero prior. `priorFromBigFive` stays as the documented, unapplied mapping, now guarded against non-finite θ. It ignores Big Five SD, so it cannot carry upstream uncertainty, and no measurement model with prior variance exists yet. With no prior applied there is no dependency, so `meta.dependencies` is empty. `usedBigFive` is kept (always false) for compatibility.
- **Confidence:** the averaged header confidence was removed from the UI and the field marked `@deprecated`. Per-trait sign probability is reported under a named event.
- **Order invariance:** `likert-cat` estimation sorts answers by item id. This is a shared change; it also applies to Jung and the temperament fallback.

### Source changes

- `packages/engine-sdk/src/thresholds.ts`: `motives` units documented, `dominanceGap` added, `priorPolicy` added, priors documented as unapplied.
- `packages/bio/src/index.ts`: `motivesLetter` takes a level; new `motivesDominance`; `motivesToken` puts no bars on X or on ties.
- `packages/likert-cat/src/index.ts`: deterministic answer order; `level` returned by `estimate`.
- `packages/engine-motives/src/index.ts`: 28-item balanced bank, aligned names and items, level/lean/strength/θ/SD per trait, `dominant`, `ResultMeta` (scoring version `motives-2`), named events, validated deserialization, independent prior policy.
- `apps/web/src/lib/results/MotivesResult.svelte`: no averaged confidence; "no clear lean"; "strongest" only when resolved; tie note; quality notes; note that Big Five is not used.
- `MotivesPage.svelte`, `typologies.ts`, `glossary.ts`, `OverviewPage.svelte`, `orchestrator/src/index.ts`: 28 statements; removed the "fewer questions with Big Five" claims; pole names synchronised; removed the unsupported "other people probably notice it first" and "the other pole can show" claims.

### Checks performed

- `pnpm test`: 29/29 tasks pass. `pnpm typecheck`: 15/15 pass (svelte-check 0 errors). `pnpm build`: succeeds.
- MOTIVES tests (19 pass) cover:
  - the bank is 28 items, balanced 2:2 per trait;
  - all-Neutral gives `XXXXXXX` with no bars and no dominant trait;
  - raw all-Agree, all-Disagree, all-Strongly-agree and all-Strongly-disagree each give θ = 0 on every trait, `XXXXXXX`, and 7 conflict notes;
  - equal keyed-moderate levels give no bars plus a tie recorded as unresolved;
  - a single further trait gives `m|O|tives`;
  - a conflicting block gives X plus a conflict note;
  - formatter checks for level-only case and ties;
  - answer order and replacement give identical results;
  - no prior, a zero Big Five prior and a nonzero Big Five prior give identical results;
  - the unapplied mapping is guarded;
  - deserialization rejects malformed states;
  - scoring version, completion and named events are present.
- Changed expectations: the old "21 items" and "works with a Big Five prior (O pHigh > 0.5)" tests were replaced, because both behaviours were deliberately removed.
- Browser check: **not performed**; no browser tool is available in this session.

### Remaining work

- Jung still applies its EI prior from Big Five θ. Phase 4 applies `priorPolicy` to it, and the Jung page's "starting point" sentence changes with it.
- The temperament import of Big Five E/N is a separate wholesale-import design (Phase 3), not this prior policy.
- No pilot data exists for the new MOTIVES items or for MOTIVES as a whole.

**Next phase:** Phase 3 — Four Temperaments.

## Phase 3 — Four Temperaments

**Engineering status:** complete (2026-11-19).

**Findings addressed by code changes:** TM-01, TM-02. TM-03 is preserved. Applied X-03, X-06, X-07, X-08, X-10 and X-11 to temperament.

**Findings that still need respondent data or a theory decision:** whether the description ranking is independent evidence (it decides how much `likelihood.temperamentRank` should weigh), validity of the bundled descriptions ("driven and intense", "deep and serious"), and the `blendCut` and `nearLine` cutoffs.

### Decisions and provisional assumptions

- **Meaning chosen for "purity" (TM-01): quadrant certainty.** `probs` is the model probability of each quadrant. `[dom]` means "runner-up quadrant < 20%": one area strongly favoured. All spatial "well inside the area" wording was replaced across the page, glossaries and engine glossary. Location is reported separately, as the E and N model percentiles and posterior SDs. `nearLine` flags a point whose E or N model percentile is within 10 points of the 50th (`THRESHOLDS.temperament.nearLine` = 0.1, provisional). The result shows a note when `[dom]` coincides with a near-boundary point, so low uncertainty is never presented as an extreme location.
- **Ranking (TM-02).** The ranking is still scored with the existing bounded weights, so every fixed-form answer contributes. It was not amplified. The result now also reports `traitProbs` (E/N only), `traitTop`, and `agreement`: where the trait-only top was ranked, plus agrees / partly / conflicts. The UI explains a conflict and says the ranking counts only a little. Exactly tied trait quadrants give `traitTop: null`, no agreement claim, and "trait-derived quadrant" in `meta.unresolved`.
- **Big Five import (X-03).** `importableBigFive` takes the import only through the shared `compatibleResult`. Accepted scoring versions are legacy (none recorded) and `bigfive-2`; E/N θ must be finite and SD positive. Anything else falls back to the 8 own items. The same helper sets the page's question count. The import is recorded in `meta.dependencies`, with its version and the values used. The latest saved result is read on every `init`, as before.
- **Ranking prompt** now names its endpoints: "from most like you to least like you".
- **X-11:** removed the unused `tempFallbackLetterP`, `tempFallbackCap` and `tempConfirmItems`. The fallback cap is now `FALLBACK.length` rather than a hardcoded 99.

### Source changes

- `packages/engine-sdk/src/result.ts`: added `compatibleResult`.
- `packages/engine-sdk/src/thresholds.ts`: documented `temperament.blendCut` units, added `nearLine`, removed stale temperament stop constants.
- `packages/engine-temperament/src/index.ts`: state v3 (with a v2 migration); versioned and validated import; `traitProbs`, `traitTop`, `agreement`, `nearLine`, E/N θ and SD; `ResultMeta` (scoring version `temperament-3`); a normaliser guard; validated deserialisation; answers refused on the Big Five form.
- `apps/web/src/lib/results/TemperamentResult.svelte`: no header confidence; certainty-vs-location sentence; agreement/conflict explanation; near-boundary note; quality notes.
- `TemperamentPage.svelte`, `typologies.ts`, `glossary.ts`, `glossaryContent.ts`, `orchestrator`: counts are 1 or 9; `[dom]` and blend redefined as certainty; the compatible-import check drives the count.

### Checks performed

- `pnpm test` 29/29 tasks, `pnpm typecheck` 15/15 (svelte-check 0 errors), `pnpm build` succeeds.
- The 17 temperament tests pass. They cover:
  - form lengths and quadrants on both paths;
  - TM-03 preserved: the `chol [dom]` profile and the reachable boundary blend;
  - same θ with a smaller SD: certainty goes up, the reported location is unchanged, `nearLine` is flagged, and a far point is not flagged;
  - inherited top ranked last: `conflicts`, top unchanged;
  - agrees and partly;
  - tied quadrants: unresolved, no agreement claim, token from the ranking;
  - every fallback item changes the trait quadrant when its answer changes;
  - dependency and version recorded, for both legacy and `bigfive-2`;
  - incompatible, NaN, zero-SD, non-object and partial imports rejected;
  - completion counts;
  - v2 migration and malformed-state rejection.
- Browser check: **not performed**. No browser tool is available in this session.

### Remaining work

- Saved temperament results do not yet show as "outdated" when Big Five is retaken. Phase 7 handles invalidation of dependants and the retake check.
- Jung still uses its EI prior (Phase 4).

**Next phase:** Phase 4 — Jungian Functions.

## Phase 4 — Jungian Functions

**Engineering status:** complete (2026-11-19).

**Findings addressed by code changes:** JG-01, JG-02, JG-04. JG-03 is mitigated (abstention and absolute display) but remains open. JG-05 is preserved. Applied X-03, X-04, X-06, X-08, X-10 and X-11 to Jung.

**Findings that still need respondent data or a theory decision:**
- JG-03: whether three forward items can separate eight functions, and the design of counter-keyed function items.
- Validity of the new preference items.
- The independence and normality assumptions in the role probabilities.
- The `resolveP`, `candidateP` and `letterMiddle` cutoffs.

### Decisions and provisional assumptions

- **Role events (JG-04).**
  - Dominant: P(function is the highest of all eight).
  - Auxiliary: P(function is the highest of the four on the other axis from the resolved dominant).
  - Both are computed by deterministic quadrature (`pMaximum`) over independent normal approximations N(θ, SD²) of each function posterior. *This is an explicit approximation, not a joint model, and the docs and UI name it as one.*
  - The UI reports the two probabilities separately and says they are not a probability for the whole code. No joint "code probability" is claimed.
- **Publication (JG-01).**
  - A role is named only when its probability is ≥ `THRESHOLDS.jung.resolveP` = 0.6. Candidates are functions with ≥ `candidateP` = 0.1. Both cutoffs are provisional.
  - The code is either the full code, a partial code `IT(?) (Ti)` when the auxiliary is unresolved, or "unresolved", which the hero shows as "no clear main function".
  - `bioTokens` emits nothing when the dominant is unresolved.
  - Exact ties give exactly equal probabilities, so there is no alphabetical tie-breaking. The ranking order of tied functions is display-only.
- **Bars.** Absolute model percentile Φ(θ). The old rescaling to the highest function is gone, so all-Neutral shows every function at 50%, not at full bars. Each row also shows "chance highest".
- **Preferences (JG-02).** One original reverse item was added per scale (ei6, sn6, tf6, jp6), giving 3:3 keying. Raw uniform answering now gives θ = 0 on every scale. MBTI letters are X when the model percentile is within 5 points of the 50th. `mbtiStack` is null when any letter is X.
- **Function items (JG-03).** These are still 3 forward items per function, by deliberate choice. Uniform agreement lifts all eight together and now yields "unresolved" rather than a type. Adding counter-keyed function items without discrimination data would be guesswork, so that stays open.
- **Wording.** ei5 ("a day without seeing anyone feels wasted") and fi2 ("can't act against my conscience, whatever the pressure") were reworded in original, less absolute language.
- **JG-05.** The separately measured MBTI letters and the "can differ" explanation are kept. The page's "nearest MBTI type" claim was replaced: the letters come from separate questions and are not inferred from the function code.
- **Prior (X-04).** The Phase 2 independent policy now applies to EI too. `init` still reads the profile each time, but applies an EI prior only under the `mapped-mean` policy, so no dependency is recorded. A non-finite E is ignored.

### Source changes

- `packages/engine-sdk/src/thresholds.ts`: added `jung` publication thresholds (units documented).
- `packages/engine-jung/src/index.ts`:
  - bank of 48 items, with the balanced preference scales and reworded items above;
  - `pMaximum`, dominant and auxiliary `Role`s, and the partial or unresolved code;
  - absolute percentiles and `pTop`;
  - X letters;
  - `ResultMeta` (scoring version `jung-2`);
  - named explanation events;
  - validated deserialisation;
  - the independent prior policy.
- `apps/web/src/lib/results/JungResult.svelte`:
  - no header confidence;
  - absolute bars with "chance highest";
  - an unresolved, partial or resolved explanation;
  - separate MBTI letters with X;
  - quality notes;
  - a note that Big Five is not used.
- `JungPage.svelte`, `typologies.ts`, `orchestrator`: count is 48; "nearest MBTI" corrected; "starting point" claim removed; unresolved and `(?)` explained.

### Checks performed

- `pnpm test` 29/29, `pnpm typecheck` 15/15 (svelte-check 0 errors), `pnpm build` succeeds.
- The 18 Jung tests pass. They cover:
  - bank structure, with 3:3 preference keying;
  - letters and stack;
  - a non-MBTI function code alongside differing MBTI letters (JG-05);
  - all-Neutral gives "unresolved", 8 candidates, 50% bars, pTop = 1/8, XXXX, and no token;
  - a clear dominant with tied auxiliaries gives `IT(?) (Ti)`;
  - dominant and auxiliary report separate probabilities and named events;
  - `pMaximum` matches the closed form Φ(Δ/√(s₁²+s₂²)) for two normals;
  - raw all-Agree, all-Disagree, all-Strongly-agree and all-Strongly-disagree give XXXX, θ = 0, no role, and a straight-line note;
  - no, zero and nonzero Big Five priors give identical results;
  - answer order and replacement give identical results;
  - malformed-state rejection;
  - version and completion.
- One fixture was corrected during the work: a test that gave Ti and Ne equal top scores expected a code, and now correctly returns unresolved.
- Browser check: **not performed**. No browser tool is available in this session.

### Remaining work

- Saved Jung results are not yet marked outdated after a Big Five retake. Jung has no dependency now, so only general version migration applies (Phase 7).

**Next phase:** Phase 5 — Enneagram.

## Phase 5 — Enneagram

**Engineering status:** complete (2026-11-19).

**Findings addressed by code changes:** EN-01, EN-03, EN-04, EN-05. EN-02 is documented. EN-06 is reviewed and recorded. Applied X-05, X-06, X-07, X-08, X-10 and X-11 to the Enneagram.

**Findings that still need respondent data or a theory decision:**
- EN-02: per-item, per-category likelihoods.
- An incremental likelihood for the paragraph pick, if it is ever to count as evidence.
- EN-03: separate wing evidence conditional on the core.
- EN-04: a justified joint model of ordered tritypes.
- EN-06: construct fit of the statements, paragraphs and instinct contexts.
- All new cutoffs.

### Decisions and provisional assumptions

- **Core from statements only (EN-01).**
  - `corePosterior` now uses only the 27 statements.
  - The paragraph pick is reported separately as `selfPick`. That covers the picked type, its statement-based probability, and whether it agrees with the statement core.
  - No validated incremental likelihood exists for the pick, so it no longer carries the old 0.85 weight. `likelihood.selfCheckMatch` is now unused and stays in the thresholds file until Phase 7 cleans up stale constants.
  - A core is named only when its statement probability is ≥ `ennea.coreResolveP` = 0.5. Otherwise the result shows `core: null` with candidates (≥ 0.1).
  - Uniform statements plus a pick give "no clear core type", with every type at 1/9 and the pick shown separately.
- **Statement asymmetry (EN-02).** The 5.5× vs 2.85× ratios are documented in `thresholds.ts`. Nothing was changed: correcting the asymmetry needs respondent data, and forcing symmetry would only change how it looks.
- **Wing (EN-03).**
  - The quantity is renamed in the metadata as "share of statement-based core probability on this neighbour vs the other (core-alternative evidence, not a measured wing trait)", with kind `heuristic`.
  - A wing is named only at ≥ `ennea.wingP` = 0.75. Otherwise it is `w?`, in the hero, the breakdown and the bio token.
  - This publication cutoff replaces the old adaptive `stop.wingP`.
- **Tritype (EN-04).**
  - Each other center's digit is named only when its within-center share is ≥ `centerResolveP` = 0.6; otherwise it shows `?`.
  - The order of the two secondary digits is shown only when one has ≥ `orderRatio` = 2× the other's statement-based core probability. Otherwise the pair is printed in ascending order in parentheses, e.g. `1(37)`.
  - The old `tritypeP = first.p × second.p` was removed. No probability is claimed for the tritype; center shares are labelled `heuristic`.
  - Neighbouring-wing and one-type-per-center legality hold for all candidate structures.
- **Instincts (EN-05).** New shared `summarizeRanking` in `rank-engine`: a complete order only at ≥ `ranking.resolveP` = 0.6, otherwise a partial result (first instinct, when P(first) ≥ `ranking.firstP` = 0.6) or unresolved. It also returns candidates, marginal positions and expected positions. Phase 6 will reuse it for AP and Temporistics.
- **Tokens.**
  - `bioTokens` emits an instincts token only when the order is resolved, and a tritype token only when a core is resolved.
  - `tritypeToken` accepts a null wing and prints `w?`.
  - The token confidence is the core probability, not a tritype product.
- **Order invariance.** Statements and instinct rankings are sorted by item id before the products are taken.
- **EN-06 content review.** I made no item rewrites.
  - The paragraphs bundle several claims each, but they no longer drive the core, which limits the damage.
  - The broad-behaviour statements (fixing errors, helping, productivity, solitude, calm) and the instinct contexts (free day, party, practical worries) may reflect circumstance, resources and opportunity.
  - Replacing them responsibly needs cognitive interviews and a pilot, which are recorded as open. The page now says the description is a check, not the score.

### Source changes

- `packages/engine-sdk/src/thresholds.ts`: added `ennea` and `ranking` publication thresholds with units; documented the EN-02 asymmetry.
- `packages/rank-engine/src/index.ts`: added `summarizeRanking` and `RankSummary`. This is additive; AP and Temporistics behaviour is unchanged until Phase 6.
- `packages/bio/src/index.ts`: `tritypeToken` takes a nullable wing.
- `packages/engine-enneagram/src/index.ts`:
  - statement-only core and `selfPick`;
  - nullable core, wing, stacking and tritype;
  - the tritype heuristic and uncertain order;
  - instinct summary;
  - `ResultMeta` (scoring version `enneagram-3`) with named events and kinds;
  - a straight-line note;
  - validated `answer` and `deserialize`.
- `apps/web/src/lib/results/EnneagramResult.svelte`:
  - the hero shows "no clear core type" or a code with `?` and `w?`;
  - the pick is shown separately with agree or differ;
  - unresolved wing, tritype and instinct states are explained;
  - notes say what is heuristic.
- `EnneagramPage.svelte`: counts (27 statements, 1 choice, 4 rankings); the description choice described as a check; tritype heuristic and notation explained.

### Checks performed

- `pnpm test` 29/29, `pnpm typecheck` 15/15 (svelte-check 0 errors), `pnpm build` succeeds.
- The 19 Enneagram tests pass. They cover:
  - form structure and legality rules;
  - the 6w5 sp/so/sx 638 persona with an agreeing pick;
  - all nine cores reachable, with legal full or partial tritypes;
  - 60 deterministic varied answer sets, each with a legal (possibly partial) structure. This replaces the old non-reproducible `Math.random` sort comparator.
  - EN-01: uniform statements at 3, 4 and 2 plus a pick give no core, p = 1/9, the pick separate, no wing or tritype, and no tritype token;
  - the pick has no effect on the statement core and is flagged as disagreeing;
  - EN-03: tied neighbours give `w?` in the token, and the wing is labelled heuristic;
  - EN-04: a split center gives `?`, and equal secondaries give `1(37)` with "tritype order" unresolved;
  - EN-05: conflicting instinct rankings give no stacking, candidates and no token; consistent rankings resolve; a shared first gives the partial `sp`;
  - answer order and replacement give identical results;
  - malformed-state rejection;
  - version and completion.
- Changed expectations: the old "always a core, wing and tritype" and "random legal output" tests were replaced, because unresolved outputs are now intended.
- Browser check: **not performed**. No browser tool is available in this session.

### Remaining work

- Phase 6 must reuse `summarizeRanking` for AP and keep the Enneagram instinct tests green.
- Phase 7 removes now-stale constants: `selfCheckMatch` and the adaptive Enneagram `stop.*` values.

**Next phase:** Phase 6 — Attitudinal Psyche and shared ranking behaviour.

## Phase 6 — Attitudinal Psyche and shared ranking behaviour

**Engineering status:** complete (2026-11-19).

**Findings addressed by code changes:** AP-02 and AP-03. AP-01 is narrowed by copy. X-01 and X-02 are addressed. Applied X-05 to X-08 and X-10 to X-11 to AP and the shared rank engine.

**Findings that still need respondent data or a theory decision:**
- AP-01: a position-sensitive measurement model and tasks that could identify attitudes.
- AP-02: whether any "concern" task can be validated for a specific position.
- Task-specific fit and context effects.
- `rankWorthRatio`.
- The `ranking.*` cutoffs.

### Decisions and provisional assumptions

- **What AP measures (AP-01).** The output is presented as an *exploratory order of aspect priorities*. The engine header, the glossary and the result caveat say it does not measure confident, flexible, insecure or indifferent attitudes. The AP page keeps the theory description, but labels every attitude claim as theory that the test does not check. The unsupported advice was removed, namely "your 3rd aspect explains where you are sensitive" and "your 1st can hurt their 3rd".
- **ap2 (AP-02).**
  - The old task, "Which criticism bothers you least?", was replaced by an original priority task, "Which do you put the most effort into getting right?". Its direction now matches the most-first scoring used by every task.
  - It was not mechanically reversed: low concern does not identify the 4th position.
  - All seven tasks use the most-to-least endpoint, which matches the modal instruction.
- **Shared ranking result (AP-03).**
  - `RankResult` gains `resolved`, `first`, `candidates`, `marginals` and `meta`, using `summarizeRanking` from Phase 5.
  - The order is published only at ≥ `ranking.resolveP` = 0.6.
  - A partial result names the first aspect at ≥ `firstP` = 0.6.
  - `order` stays as the "most probable" field for compatibility but is not shown as the result.
  - A non-punitive `ranking-conflict` note appears when no order resolves; it says that context differences can cause this.
- **Separated concepts.** Completion is `meta.completion` (all 7 fixed-form tasks). Adaptive stopping is `finished()`/`next()` only, documented as never limiting which answers are scored. Output uncertainty is in `meta.uncertainty`, and response fit in `meta.quality`.
- **Cap (X-01).** `stop.apCap` and `temporisticsCap` are documented as adaptive-only. The unused `apRankTasks` was removed. Every valid fixed-form answer enters the posterior, including the seventh. Ranking answers are sorted by task id so the result does not depend on answer order.
- **Publication path (X-02).** Publication rules live in `result()` and the result components that the web app actually renders. The orchestrator and `bioTokens` are documented as outside that path; `bioTokens` now emits only resolved orders.
- **Validation (X-07).** Rank-state deserialization checks known task ids, uniqueness and full permutations.
- **Enneagram compatibility.** `summarizeRanking` is unchanged, and the 19 Enneagram tests still pass.

### Source changes

- `packages/engine-sdk/src/result.ts`: new `ranking-conflict` quality code.
- `packages/engine-sdk/src/thresholds.ts`: adaptive cap documented; `apRankTasks` removed.
- `packages/rank-engine/src/index.ts`: resolved, partial and candidate result fields; `ResultMeta`; conflict note; named event; order-invariant posterior; validated deserialization; resolved-only bio tokens; adaptive stop documented.
- `packages/engine-ap/src/index.ts`: ap2 rewritten; header and glossary narrowed to priorities; scoring version `ap-2`.
- `apps/web/src/lib/results/OrderResult.svelte` (shared by AP and Temporistics):
  - the hero shows the order, a partial `V???`, or "no clear order";
  - candidate orders;
  - each aspect's average place, chance of being first, and chance of being last;
  - quality notes;
  - an optional caveat.
- `apps/web/src/routes/[slug]/+page.svelte`: AP caveat passed in.
- `APPage.svelte`, `orchestrator`: count is 7 rankings (was "4 to 8"); attitude claims marked as theory.
- `orchestrator/src/index.ts`, `apps/web/src/lib/engines.ts`: X-02 isolation comments.

### Checks performed

- `pnpm test` 29/29, `pnpm typecheck` 15/15 (svelte-check 0 errors), `pnpm build` succeeds.
- Rank-engine tests (11) pass. They cover:
  - conflicting rankings on the adaptive path give an unresolved result, a conflict note and no token;
  - all 7 fixed-form answers are scored even though the adaptive cap is 6;
  - a different seventh answer changes the posterior and moves that aspect earlier;
  - answer order and replacement give identical results;
  - malformed rankings are rejected;
  - `summarizeRanking` gives the uniform → unresolved case, and resolves a concentrated posterior with marginals that sum to 1.
- AP tests (9) pass. They cover:
  - alternating 1st↔2nd / 3rd↔4th swaps give no order, with both candidates kept;
  - consistent rankings resolve;
  - a shared first choice gives the partial `V`;
  - no task asks for "least";
  - version and named events.
- The non-reproducible `Math.random` comparator test was replaced with deterministic permutations.
- Enneagram (19) and Temporistics (4) tests still pass.
- One assertion of mine had the wrong direction (expected position) and was corrected.
- Browser check: **not performed**. No browser tool is available in this session.

### Remaining work

- Temporistics now inherits the shared unresolved behaviour through `OrderResult`. Its scoring version, copy, item review and caveat are Phase 7.
- Phase 7 handles stale-constant cleanup, dependency invalidation on Big Five retakes, and the cross-test reconciliation.

**Next phase:** Phase 7 — Temporistics and final integration.

## Phase 7 — Temporistics and final integration

**Engineering status:** complete (2026-11-19). All seven phases are complete in engineering terms. None of the engines is psychometrically validated.

**Findings addressed by code changes:** TP-01; TP-02 (items and copy); final integration of X-01 to X-11.

**Findings that still need respondent data or a theory decision:** TP-02 (whether the rewritten items measure one orientation, and context effects), plus every empirical item listed in the ledger below.

### Decisions and provisional assumptions

- **TP-01.** Temporistics uses the Phase 6 shared ranking result. It shows a full order only at ≥ 0.6, otherwise a partial result (first aspect) or "no clear order" with candidates. Each aspect's average place, chance of being first and chance of being last are shown, along with a conflict note. Scoring version is `temporistics-2`.
- **TP-02.** Two items were rewritten in original wording:
  - tp4 drops "beyond this life" (religion), "a deadline coming up" (current workload) and "something unresolved" (distress);
  - tp6 drops "old photos, notes or music" (owning keepsakes) and "a free afternoon" (leisure opportunity).

  Both now use a general frame ("in general…", "when your mind wanders…"). The other five tasks are unchanged and recorded for cognitive interviews. tp3 ("when you feel lost") still has a distress context. All tasks rank most-first.
- **Interpretation limits.** The engine header, result caveat, page, glossary and metadata say the test measures a relative priority order. They also say it does not measure an amount of energy, insecurity or belief. The theory's position meanings are labelled as theory, and the unsupported "the 3rd letter shows where you want help" advice was removed. The AP metadata, which still claimed "how confident and how open", and the AP glossary rows were also qualified.
- **Stale constants (X-11).** Removed `likelihood.pairMatch`, `pairOther`, `pairNeutral`, `selfCheckMatch` and `confirmMatch`, and `stop.enneaCoreP`, `enneaCoreCap`, `wingP`, `wingCap`, `stackingP`, `stackingCap`, `tritypeP` and `tritypeCapPerCenter`. All were unreferenced (grep), and the `stop` block says why they were removed.
- **Saved-result provenance (X-03).** `apps/web/src/lib/saved.ts` holds:
  - `CURRENT_SCORING`, which an integration test checks against every engine's `meta.scoringVersion`;
  - `dependantsOf`;
  - `resultStatus` (current / legacy / outdated-scoring / outdated-dependency / missing);
  - `cleanOutdated`.

  `app.saveResult` flags every saved result that depended on the replaced one and clears the flag on the replaced result. The saved session gains an `outdated` map; older saves load with an empty map, so the stored format stays v2 and is compatible. `app.status(id)` exposes the status.
- **Compatible priors.** Only temperament imports another result, and it accepts only the compatible Big Five versions, through `compatibleResult`. MOTIVES and Jung apply no prior under the independent policy. An outdated or unknown Big Five scoring version is therefore never silently used.
- **Counts reconciled** across the pages, `typologies.ts`, the orchestrator step list and the actual forms: Big Five 40, MOTIVES 28, temperament 1 or 9, Jung 48, Enneagram 32 (27 + 1 + 4), AP 7, Temporistics 7.

### Source changes (Phase 7)

- `packages/engine-temporistics/src/index.ts`: tp4 and tp6 rewritten; scope header; glossary; scoring version.
- `packages/engine-sdk/src/thresholds.ts`: stale constants removed and documented.
- `apps/web/src/lib/saved.ts` (new) and `apps/web/src/lib/app.svelte.ts`: provenance, invalidation and status.
- `apps/web/src/routes/[slug]/+page.svelte`: Temporistics caveat.
- `TemporisticsPage.svelte`, `typologies.ts`, `glossary.ts`, `glossaryContent.ts`: scope wording and counts.
- `packages/orchestrator/src/index.ts`: step item counts match the fixed forms.
- Tests: `apps/web/src/lib/integration.test.ts` (new) and `packages/engine-temporistics/src/engine.test.ts`.

### Checks performed

- `pnpm test`: 29/29 tasks pass. The web package has 26 tests, including 10 new integration tests.
- `pnpm typecheck`: 15/15 pass (svelte-check 0 errors, 0 warnings). `pnpm build` succeeds.
- **Integration tests**, which mirror QuizModal's submit path:
  - for each of the seven tests: the fixed form completes, completion equals the form length, the scoring version is current, and all uncertainty is marked uncalibrated;
  - **changing any single fixed-form answer changes the result**, for every item of every test (184 items in total);
  - Big Five retake: a saved temperament result becomes `outdated-dependency`; a fresh temperament submission reads the new Big Five θ and records `bigfive-2`; MOTIVES and Jung give identical results before and after the retake (independent policy);
  - a Big Five result marked `bigfive-1` is not imported, so temperament falls back to its 9-item form; the result status reports `outdated-scoring` and `legacy`;
  - `cleanOutdated` validation.
- **Temporistics tests (9):** conflicting rankings give an unresolved result with candidates, a conflict note and no token; a shared first choice gives a partial result; consistent rankings resolve with all 7 answers counted; the removed contexts are absent; no "least" task; version and events. The `Math.random` comparator test was replaced with deterministic permutations.
- A stale-copy sweep found none of the following left: `confidence=` header props, "% sure", "fewer questions", "nearest MBTI", "well inside", the "N of 100 people" population claims, "probably stay", "Your Confident".
- Browser check: **not performed in any phase**. No browser tool was available in this session. The result states were checked only through unit and integration tests, svelte-check and the production build.

### Remaining work (not engineering-completable without data or decisions)

- Pilot and calibrate all banks: item parameters, likelihood tables, rank worth ratio, priors, and every provisional cutoff (X-05).
- Population norms, if population percentiles are ever wanted.
- Construct decisions and new measurement models for AP attitudes, wing traits and ordered tritypes.
- Cognitive interviews for the context-heavy items (BF-03, EN-06, TP-02) and the new unpiloted items (MOTIVES, Jung, AP ap2, Temporistics tp4/tp6).
- A browser pass over the changed result states: unresolved, partial and conflict notes, on mobile and desktop.

## Finding ledger

| ID | Disposition | Notes |
|---|---|---|
| BF-01 | Implemented and checked | Strength and lean from Φ(θ); certainty reported separately. Cutoffs provisional. |
| BF-02 | Mitigated, with limitations stated | Token and breakdown agree; straight-line and reverse-key notes. Cannot separate sincere neutrality from disengagement; no person-fit model. |
| BF-03 | Awaiting empirical data | Open questions: do e5/e8 (recharge, noisy-place fatigue) measure sensory sensitivity rather than E? Do a5–a7 draw socially desirable responding? Does C mix organisation, memory and impulse control into one score? Needs cognitive interviews and a pilot. Items unchanged. |
| JG-01 | Implemented and checked | Tied or unresolved roles are not named; candidates shown; absolute bars. Cutoffs provisional. |
| JG-02 | Mitigated, with limitations stated | Preference keying balanced 3:3 with original items; uniform agreement gives XXXX. New items unpiloted; acquiescence is only flagged. |
| JG-03 | Awaiting empirical data (mitigated by abstention) | Forward-only, 3 items per function. Discrimination and counter-keyed items need respondent data. |
| JG-04 | Mitigated, with limitations stated | Separate named dominant and auxiliary events; no whole-code probability. Uses an independent-normal approximation, not a joint model. |
| JG-05 | Rejected allegation preserved | Independent MBTI letters and the differing-code explanation kept; only the "nearest MBTI" wording corrected. |
| EN-01 | Implemented and checked | Paragraph separated from the statement core; uniform statements cannot produce a core. Cutoff provisional. |
| EN-02 | Awaiting empirical data | Asymmetry documented, deliberately not changed. |
| EN-03 | Mitigated, with limitations stated | Ties print `w?`; quantity named as core-alternative evidence. No separate wing measurement exists. |
| EN-04 | Mitigated, with limitations stated | Product probability removed; named heuristic with unresolved centers and order. No joint model. |
| EN-05 | Implemented and checked | Shared ranking summary: full, partial or unresolved stackings with candidates. |
| EN-06 | Awaiting empirical data | Content reviewed; rewrites deferred to cognitive interviews and a pilot. The paragraph no longer drives scoring. |
| TM-01 | Implemented and checked | Output defined as quadrant certainty; location and near-boundary reported separately. Cutoffs provisional. |
| TM-02 | Mitigated, with limitations stated | Agreement and conflict shown; weights unchanged. Whether the ranking is independent evidence needs data. |
| TM-03 | Rejected allegation preserved | Quadrant arithmetic unchanged; blend test retained and passing. |
| MO-01 | Implemented and checked | Case and bars from Φ(θ); certainty reported separately. Cutoffs provisional. |
| MO-02 | Mitigated, with limitations stated | Keying balanced 2:2 with original items; raw uniform answers now give θ = 0. New items unpiloted; acquiescence is only flagged, not modelled. |
| MO-03 | Implemented and checked | No bars on X; ties give no bars and a candidate list. Gap value provisional. |
| MO-04 | Mitigated, with limitations stated | Names, page and items aligned on care for others (I) and optimism/energy (V). Whether the new items load on those constructs needs respondent data. |
| AP-01 | Mitigated, with limitations stated | Output narrowed to exploratory priorities everywhere it is shown. No position-sensitive model exists. |
| AP-02 | Implemented and checked | ap2 rewritten to match the most-first scoring; not reversed. Validity of any concern-based task would need data. |
| AP-03 | Implemented and checked | Unresolved, partial and candidate orders with a conflict note. Cutoffs provisional. |
| TP-01 | Implemented and checked | Shared unresolved, partial and candidate orders with a conflict note; tested. Cutoffs provisional. |
| TP-02 | Mitigated, with limitations stated | tp4 and tp6 rewritten to remove religion, keepsake, deadline and distress contexts; interpretation limited to relative priority. Five tasks unchanged pending interviews. Validity needs data. |
| X-01 | Implemented and checked | Caps are adaptive-only and documented; all 7 fixed-form answers are scored for AP and Temporistics (tested); `apRankTasks` removed. The rejected six-answer truncation was not "fixed". |
| X-02 | Mitigated, with limitations stated | Publication lives in `result()` and the rendered components. Orchestrator and bioTokens are documented as outside the web path, bioTokens emit only resolved outputs, and step counts are corrected. Not deleted, to keep their tests and API. |
| X-03 | Implemented and checked | Every result has a scoring version; temperament records its Big Five dependency. Saved dependants are flagged outdated on retake; status covers legacy and outdated scoring; incompatible versions are never imported (integration-tested). Raw answers are not stored, so outdated results cannot be recomputed and need a retake. |
| X-04 | Mitigated; mapping awaits data | Independent policy for MOTIVES and Jung: no unjustified prior is applied (tested with no, zero and nonzero priors). Temperament uses Big Five E/N wholesale with their SDs, by design. A justified cross-construct mapping with prior variance needs data. |
| X-05 | Awaiting empirical data | Every probability is labelled with its event, its kind and `calibrated: false`. Model percentiles are labelled as such. No reliability, calibration or norm data exists, and none was invented. |
| X-06 | Implemented and checked | All engines name each probability's event in `meta.uncertainty` and `confidenceEvent`. Averaged and product "confidences" are removed from the UI or marked deprecated. Heuristics are labelled `heuristic`. Publication rules sit in the active result path. |
| X-07 | Implemented and checked | All seven deserializers and the shared ranking deserializer validate ids, uniqueness, categories, permutations and finite priors; malformed-state tests exist in every engine. App load filters malformed results, engine states and outdated flags. Normalisers guard temperament and Jung; `bayes.normalize` itself is unchanged. |
| X-08 | Implemented and checked | Deterministic fixed-form fixtures in every engine (straight-lines, keying symmetry, ties, conflicts, answer order and replacement, priors, malformed state), plus an integration test proving every fixed-form answer affects its result. These are not validation studies. |
| X-09 | Rejected allegation preserved | Fresh `init(profileSnapshot())` at submit is unchanged; the retake integration test confirms the latest Big Five result is read. |
| X-10 | Implemented and checked | Counts are reconciled across pages, metadata, orchestrator and forms; the claims about adaptive shortening and Big Five shortening are removed. |
| X-11 | Implemented and checked | The thresholds header lists the other constant sources. Each setting group documents its units and provisional status; adaptive and publication settings are separated; stale constants are removed. |
