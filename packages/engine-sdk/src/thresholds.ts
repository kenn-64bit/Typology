/**
 * Scoring, formatting, quality and adaptive-stop settings. Values are PROVISIONAL expert placeholders from
 * SPEC §2.6 / §4.5; none has been piloted or calibrated against respondent data.
 *
 * Not every scoring constant lives here (incident-report X-11). Also see:
 * - item parameters: packages/engine-bigfive/src/params.json and EXPERT in packages/likert-cat/src/index.ts;
 * - numerical settings: the θ grid and unit-variance prior in packages/irt/src/index.ts;
 * - each engine's `scoringVersion` (bump it when a change here alters the meaning of saved results).
 * `stop.*` values drive the adaptive `next()` path only; the deployed fixed form scores every answer regardless.
 */
export const THRESHOLDS = {
  /**
   * SLOAN strength (BF-01). Units: distance of the MODEL percentile Φ(θ) from 0.5, i.e. score level, not certainty.
   * 0.05 → 45th–55th is "middle", <0.15 → borderline, ≥0.35 → strong (≤15th or ≥85th). Provisional, unpiloted;
   * the model percentile is relative to the test's built-in N(0,1) norm, not to a measured population.
   */
  sloan: { middle: 0.05, borderline: 0.15, strong: 0.35 },
  /**
   * Response-pattern notes (BF-02). Units: mean RAW Likert answer (1..5) on forward- and on reverse-keyed items of one
   * scale. Both sides ≥ agreeMean (or both ≤ disagreeMean) is noted as a reverse-key conflict. Informational only:
   * never used to reject or rescore answers. Provisional expert cutoffs.
   */
  quality: { agreeMean: 3.75, disagreeMean: 2.25, minPerSide: 2 },
  /**
   * Jung publication (JG-01, JG-04). Units: model probability that a function is the highest (of all eight for the
   * dominant; of the four on the other axis for the auxiliary), from independent normal approximations of each
   * function posterior. A role is named only at ≥ resolveP; candidates are functions with ≥ candidateP.
   * letterMiddle: MBTI letter is X when its model percentile is within this distance of 0.5. All provisional.
   */
  jung: { resolveP: 0.6, candidateP: 0.1, letterMiddle: 0.05 },
  /**
   * Enneagram publication (EN-01, EN-03, EN-04). All provisional.
   * coreResolveP / candidateP: STATEMENT-ONLY model probability of a core type (the paragraph pick is reported
   *   separately and does not enter it).
   * wingP: share of statement-based core probability held by one neighbour versus the other (core-alternative
   *   evidence, not a measured wing trait); below it the wing is "w?".
   * centerResolveP: within-center share of statement-based core probability needed to name a tritype digit.
   * orderRatio: the first secondary digit must have at least this many times the second's statement-based core
   *   probability, otherwise their order is shown as uncertain. A heuristic, not an ordered-tritype probability.
   */
  ennea: { coreResolveP: 0.5, candidateP: 0.1, wingP: 0.75, centerResolveP: 0.6, orderRatio: 2 },
  /**
   * Shared ranking publication (EN-05, AP-03, TP-01). Units: model probability of a complete order (resolveP) or of
   * an aspect being first (firstP). Candidates: orders with ≥ candidateP. Provisional.
   */
  ranking: { resolveP: 0.6, firstP: 0.6, candidateP: 0.1 },
  /**
   * MOTIVES case and bars (MO-01, MO-03). Units: MODEL percentile Φ(θ) as a fraction (score level, not certainty).
   * Uppercase at ≥ strong (or ≤ 1 − strong), lowercase at ≥ medium (or ≤ 1 − medium), else X.
   * Bars mark one trait only when its distance from 0.5 exceeds every other trait's by ≥ dominanceGap; otherwise no
   * bars and the leading traits are reported as tied candidates. All provisional, unpiloted.
   */
  motives: { strong: 0.8, medium: 0.6, dominanceGap: 0.05 },
  /**
   * Temperament (TM-01). Units: model probability of the runner-up QUADRANT (quadrant certainty, not spatial distance).
   * Runner-up below blendCut → "[dom]" = one quadrant strongly favoured. nearLine: a point whose E or N model
   * percentile is within this distance of 0.5 is reported as close to a boundary, whatever the certainty. Provisional.
   */
  temperament: { blendCut: 0.2, nearLine: 0.1 },
  /** Prior strength when one engine reads another's published result (placeholder r, from pilot data later). */
  /**
   * Prior policy (X-04): "independent" = cross-engine Big Five priors are NOT applied to scoring. The coefficients
   * below describe an unvalidated expert mapping kept for documentation only; they omit Big Five SD and any measured
   * cross-construct correlation, so no engine may use them until a measurement model with prior variance is justified.
   */
  priorPolicy: "independent" as "independent" | "mapped-mean",
  priors: { motivesFromBigFive: 0.5, jungEIFromBigFiveE: 0.6 },
  /** Expert likelihoods before calibration (SPEC §4.2 cold start). */
  likelihood: {
    pairMatch: 0.75, pairOther: 0.25, pairNeutral: 0.5, selfCheckMatch: 0.85, confirmMatch: 0.75,
    /** Temperament description ranking: weight for the temperament placed 1st..4th. */
    temperamentRank: [0.4, 0.3, 0.18, 0.12],
    /** Fixed-form Enneagram: P(answer 1..5 | statement is / is not from your type). */
    // EN-02: own/other likelihood ratios are ≈ 0.18, 0.32, 0.82, 1.83, 2.85 for answers 1..5, so "Strongly disagree"
    // is 5.5× evidence against a type while "Strongly agree" is 2.85× for it. Asymmetry is deliberate in the expert
    // table and is NOT corrected here: changing it needs per-item, per-category estimates from respondent data.
    enneaOwn: [0.04, 0.08, 0.18, 0.33, 0.37],
    enneaOther: [0.22, 0.25, 0.22, 0.18, 0.13],
  },
  /** Plackett–Luce worth ratio between adjacent ranks (first choice weighs most). */
  rankWorthRatio: 2.2,
  stop: {
    bigfiveSE: 0.35, bigfiveCap: 8, bigfiveLetterP: 0.9, // letter rule from dossier Module 1 (ends extreme scorers, §4.5)
    mbtiSE: 0.35, mbtiLetterP: 0.9, mbtiCap: 6,
    enneaCoreP: 0.85, enneaCoreCap: 15,
    wingP: 0.75, wingCap: 3,
    stackingP: 0.8, stackingCap: 4,
    tritypeP: 0.8, tritypeCapPerCenter: 3,
    // X-01: adaptive-only. `next()` may stop AP/Temporistics after apCap/temporisticsCap tasks or at apOrderP; the
    // deployed fixed form always shows and scores all 7 tasks. Publication uses `ranking.*`, not these values.
    apOrderP: 0.7, apCap: 6,
    motivesSE: 0.40, motivesLetterP: 0.9, motivesCap: 3,          // dossier Modules 5–6
    jungFuncSE: 0.45, jungFuncCap: 3, jungFuncLetterP: 1.01, // dossier Module 2; 1.01 = no letter rule (continuous scores)
    tempFallbackSE: 0.40, // temperament without a Big Five result; the fixed form asks all 8 fallback items regardless
    temporisticsOrderP: 0.7, temporisticsCap: 6,                  // same rule as AP
    globalCap: 70,
  },
} as const;
