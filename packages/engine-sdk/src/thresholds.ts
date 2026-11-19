/**
 * ALL scoring/formatting thresholds live here (CLAUDE.md: one config file).
 * Values are PLACEHOLDERS from SPEC §2.6 / §4.5 — calibrate on pilot data.
 */
export const THRESHOLDS = {
  sloan: { middle: 0.05, borderline: 0.15, strong: 0.35 },      // distance |p - 0.5|
  motives: { strong: 0.8, medium: 0.6 },                         // p of high pole (mirrored for low)
  temperament: { blendCut: 0.2 },                                // runner-up prob below this = "[dom]"
  /** Prior strength when one engine reads another's published result (placeholder r, from pilot data later). */
  priors: { motivesFromBigFive: 0.5, jungEIFromBigFiveE: 0.6 },
  /** Expert likelihoods before calibration (SPEC §4.2 cold start). */
  likelihood: {
    pairMatch: 0.75, pairOther: 0.25, pairNeutral: 0.5, selfCheckMatch: 0.85, confirmMatch: 0.75,
    /** Temperament description ranking: weight for the temperament placed 1st..4th. */
    temperamentRank: [0.4, 0.3, 0.18, 0.12],
    /** Fixed-form Enneagram: P(answer 1..5 | statement is / is not from your type). */
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
    apOrderP: 0.7, apRankTasks: 4, apCap: 6,
    motivesSE: 0.40, motivesLetterP: 0.9, motivesCap: 3,          // dossier Modules 5–6
    jungFuncSE: 0.45, jungFuncCap: 3, jungFuncLetterP: 1.01, // dossier Module 2; 1.01 = no letter rule (continuous scores)
    tempFallbackSE: 0.40, tempFallbackLetterP: 0.9, tempFallbackCap: 4, // temperament without a Big Five result
    tempConfirmItems: 2,
    temporisticsOrderP: 0.7, temporisticsCap: 6,                  // same rule as AP
    globalCap: 70,
  },
} as const;
