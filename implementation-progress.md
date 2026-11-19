# Implementation progress

Audit record: `incident-report.md` (unchanged). This file tracks engineering work against it.
Engineering completion is not psychometric validation: no respondent data, calibration, norms or reliability
estimates exist for any engine, and none were invented.

## Phase status

| Phase | Engine | Status |
|---|---|---|
| 1 | Big Five + shared result foundations | complete |
| 2 | MOTIVES + optional prior policy | pending (next) |
| 3 | Four Temperaments | pending |
| 4 | Jungian Functions | pending |
| 5 | Enneagram | pending |
| 6 | Attitudinal Psyche + shared ranking | pending |
| 7 | Temporistics + final integration | pending |

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

## Finding ledger

| ID | Disposition | Notes |
|---|---|---|
| BF-01 | Implemented and checked | Strength and lean from Φ(θ); certainty reported separately. Cutoffs provisional. |
| BF-02 | Mitigated, with limitations stated | Token and breakdown agree; straight-line and reverse-key notes. Cannot separate sincere neutrality from disengagement; no person-fit model. |
| BF-03 | Awaiting empirical data | Open questions: do e5/e8 (recharge, noisy-place fatigue) measure sensory sensitivity rather than E? Do a5–a7 draw socially desirable responding? Does C mix organisation, memory and impulse control into one score? Needs cognitive interviews and a pilot. Items unchanged. |
| JG-01 | Pending (Phase 4) | |
| JG-02 | Pending (Phase 4) | |
| JG-03 | Pending (Phase 4) | |
| JG-04 | Pending (Phase 4) | |
| JG-05 | Rejected allegation preserved | The differing-code explanation is untouched. |
| EN-01 – EN-06 | Pending (Phase 5) | |
| TM-01, TM-02 | Pending (Phase 3) | |
| TM-03 | Rejected allegation preserved | Quadrant arithmetic untouched. |
| MO-01 – MO-04 | Pending (Phase 2) | |
| AP-01 – AP-03 | Pending (Phase 6) | |
| TP-01, TP-02 | Pending (Phase 7) | |
| X-01 | Pending (Phase 6) | |
| X-02 | Pending (Phase 6) | |
| X-03 | Mitigated (Big Five only) | Scoring version and dependency fields exist; Big Five has no dependencies. Invalidation of dependants is pending (Phases 2–4, 7). |
| X-04 | Pending (Phase 2) | |
| X-05 | Awaiting empirical data | Everything is labelled `calibrated: false`; no calibration exists. |
| X-06 | Mitigated (Big Five only) | Per-trait events named; the averaged header confidence is removed from the UI. Other engines pending. |
| X-07 | Mitigated (Big Five + app load) | Big Five deserialize validated through the shared helper; other engines pending. |
| X-08 | Mitigated (Big Five only) | Deterministic fixed-form fixtures added. Other engines pending. |
| X-09 | Rejected allegation preserved | Fresh `init(profileSnapshot())` at submit is unchanged. |
| X-10 | Pending (Phases 2–4, 6–7) | |
| X-11 | Mitigated | The thresholds header lists the other constant sources. Removing stale adaptive constants is pending (Phase 7). |
