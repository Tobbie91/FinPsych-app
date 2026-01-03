/**
 * CWI Scoring Engine
 * Version: 1.0.0
 *
 * Execution Order (DO NOT CHANGE):
 * 1. Raw Responses → Question Scoring
 * 2. Construct Aggregation
 * 3. Construct Standardization (z-scores)
 * 4. PCA Weighting
 * 5. 5Cs Aggregation
 * 6. CWI Raw
 * 7. Country Normalization
 * 8. Risk Band Assignment
 */

import {
  PCA_WEIGHTS,
  GLOBAL_STATS,
  COUNTRY_STATS,
  FIVE_C_MAP,
  FIVE_C_WEIGHTS,
  RISK_BANDS,
  LIKERT_MAP,
  QUESTION_CONSTRUCT_MAP,
  REVERSE_SCORED_QUESTIONS,
  LOCUS_INTERNAL_ANSWERS,
  EMERGENCY_SOURCE_SCORES,
  EMERGENCY_MONTHS_SCORES,
  SOCIAL_SUPPORT_SCORES,
  MODEL_VERSION,
} from './constants';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface RawResponses {
  [questionId: string]: string;
}

export interface ConstructScores {
  [construct: string]: number;
}

export interface FiveCScores {
  character: number;
  capacity: number;
  capital: number;
  consistency: number;
  conditions: number;
}

export interface ScoringResult {
  // Raw scores
  constructScores: ConstructScores;
  constructZScores: ConstructScores;

  // 5Cs
  fiveCScores: FiveCScores;

  // Final CWI
  cwiRaw: number;
  cwiNormalized: number;
  cwi0100: number;

  // Risk assessment
  riskBand: string;
  riskPercentile: number;

  // Metadata
  modelVersion: string;
  scoredAt: string;
  country: string;
}

// -----------------------------------------------------------------------------
// STEP 1: QUESTION SCORING
// -----------------------------------------------------------------------------

/**
 * Score a single Likert scale question
 */
function scoreLikertQuestion(value: string, reverse: boolean): number {
  const score = LIKERT_MAP[value];
  if (score === undefined) {
    console.warn(`Unknown Likert value: ${value}, defaulting to 3`);
    return 3; // Default to middle
  }
  return reverse ? 6 - score : score;
}

/**
 * Score a locus of control question (binary: internal=1, external=0)
 */
function scoreLocusQuestion(value: string): number {
  return LOCUS_INTERNAL_ANSWERS.includes(value) ? 1 : 0;
}

/**
 * Score an emergency preparedness question
 */
function scoreEmergencyQuestion(questionId: string, value: string): number {
  if (questionId === 'q14') {
    return EMERGENCY_SOURCE_SCORES[value] ?? 2;
  }
  if (questionId === 'q15') {
    return EMERGENCY_MONTHS_SCORES[value] ?? 3;
  }
  return 3;
}

/**
 * Score a social support question
 */
function scoreSocialSupportQuestion(value: string): number {
  return SOCIAL_SUPPORT_SCORES[value] ?? 3;
}

/**
 * Score the crisis decision-making ranking question (q16)
 * Scoring: "Contact lender" at top = better decision-making
 */
function scoreCrisisRanking(value: string): number {
  try {
    const ranking = JSON.parse(value) as string[];
    // Score based on position of key items
    const contactLenderPos = ranking.indexOf('Contact lender');
    const skipPaymentsPos = ranking.indexOf('Skip payments');

    // Higher score if "Contact lender" is near top and "Skip payments" is near bottom
    let score = 3; // Base score

    if (contactLenderPos !== -1) {
      score += (6 - contactLenderPos) * 0.3; // Bonus for early position
    }
    if (skipPaymentsPos !== -1) {
      score += skipPaymentsPos * 0.2; // Bonus for late position
    }

    return Math.min(5, Math.max(1, score));
  } catch {
    return 3; // Default
  }
}

/**
 * Score a single question based on its type
 */
function scoreQuestion(questionId: string, value: string): number {
  const construct = QUESTION_CONSTRUCT_MAP[questionId];
  const isReverse = REVERSE_SCORED_QUESTIONS.has(questionId);

  // Handle special question types
  if (construct === 'locus_of_control') {
    return scoreLocusQuestion(value);
  }

  if (construct === 'emergency_preparedness') {
    return scoreEmergencyQuestion(questionId, value);
  }

  if (construct === 'social_support' && questionId === 'q59') {
    return scoreSocialSupportQuestion(value);
  }

  if (questionId === 'q16') {
    return scoreCrisisRanking(value);
  }

  // Default: Likert scale
  return scoreLikertQuestion(value, isReverse);
}

// -----------------------------------------------------------------------------
// STEP 2: CONSTRUCT AGGREGATION
// -----------------------------------------------------------------------------

/**
 * Aggregate question scores into construct scores
 */
function aggregateConstructs(responses: RawResponses): ConstructScores {
  const constructSums: Record<string, number> = {};
  const constructCounts: Record<string, number> = {};

  for (const [questionId, value] of Object.entries(responses)) {
    // Skip demographic questions
    if (questionId.startsWith('demo')) continue;

    const construct = QUESTION_CONSTRUCT_MAP[questionId];
    if (!construct) continue;

    const score = scoreQuestion(questionId, value);

    if (!constructSums[construct]) {
      constructSums[construct] = 0;
      constructCounts[construct] = 0;
    }

    constructSums[construct] += score;
    constructCounts[construct]++;
  }

  // Calculate means
  const constructScores: ConstructScores = {};
  for (const construct of Object.keys(constructSums)) {
    constructScores[construct] = constructSums[construct] / constructCounts[construct];
  }

  return constructScores;
}

// -----------------------------------------------------------------------------
// STEP 3: CONSTRUCT STANDARDIZATION (Z-SCORES)
// -----------------------------------------------------------------------------

/**
 * Standardize construct scores using global statistics
 */
function standardizeConstructs(constructScores: ConstructScores): ConstructScores {
  const zScores: ConstructScores = {};

  for (const [construct, rawScore] of Object.entries(constructScores)) {
    const stats = GLOBAL_STATS[construct];
    if (stats) {
      zScores[construct] = (rawScore - stats.mean) / stats.std;
    } else {
      // Fallback: assume mean=3, std=1 for unknown constructs
      zScores[construct] = (rawScore - 3) / 1;
    }
  }

  return zScores;
}

// -----------------------------------------------------------------------------
// STEP 4: PCA WEIGHTING
// -----------------------------------------------------------------------------

/**
 * Apply PCA weights to construct z-scores
 * Note: Reserved for future use in alternative scoring models
 */
export function applyPCAWeights(constructZScores: ConstructScores): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [construct, weight] of Object.entries(PCA_WEIGHTS)) {
    const zScore = constructZScores[construct];
    if (zScore !== undefined) {
      weightedSum += zScore * weight;
      totalWeight += weight;
    }
  }

  // Normalize by actual weight used (in case some constructs are missing)
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// -----------------------------------------------------------------------------
// STEP 5: 5Cs AGGREGATION
// -----------------------------------------------------------------------------

/**
 * Aggregate constructs into 5Cs scores
 */
function aggregate5Cs(constructZScores: ConstructScores): FiveCScores {
  const fiveCScores: FiveCScores = {
    character: 0,
    capacity: 0,
    capital: 0,
    consistency: 0,
    conditions: 0,
  };

  for (const [cCategory, constructs] of Object.entries(FIVE_C_MAP)) {
    let sum = 0;
    let count = 0;

    for (const construct of constructs) {
      const zScore = constructZScores[construct];
      if (zScore !== undefined) {
        // Weight by PCA weight if available
        const weight = PCA_WEIGHTS[construct] ?? 1;
        sum += zScore * weight;
        count += weight;
      }
    }

    fiveCScores[cCategory as keyof FiveCScores] = count > 0 ? sum / count : 0;
  }

  return fiveCScores;
}

// -----------------------------------------------------------------------------
// STEP 6: CWI RAW CALCULATION
// -----------------------------------------------------------------------------

/**
 * Calculate raw CWI from 5Cs scores
 */
function calculateCWIRaw(fiveCScores: FiveCScores): number {
  let cwi = 0;

  for (const [category, weight] of Object.entries(FIVE_C_WEIGHTS)) {
    const score = fiveCScores[category as keyof FiveCScores];
    cwi += score * weight;
  }

  return cwi;
}

// -----------------------------------------------------------------------------
// STEP 7: COUNTRY NORMALIZATION
// -----------------------------------------------------------------------------

/**
 * Apply country normalization to CWI
 */
function normalizeByCountry(cwiRaw: number, country: string): number {
  const stats = COUNTRY_STATS[country] ?? COUNTRY_STATS['Other'];
  return (cwiRaw - stats.mean) / stats.std;
}

/**
 * Convert z-score to 0-100 scale
 */
function convertTo0100(zScore: number): number {
  // Z-score typically ranges from -3 to +3
  // Map to 0-100 with 50 as center
  const scaled = (zScore + 3) / 6 * 100;
  return Math.max(0, Math.min(100, Math.round(scaled * 10) / 10));
}

// -----------------------------------------------------------------------------
// STEP 8: RISK BAND ASSIGNMENT
// -----------------------------------------------------------------------------

/**
 * Calculate percentile from z-score (using standard normal distribution approximation)
 */
function zScoreToPercentile(z: number): number {
  // Approximation of standard normal CDF
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Assign risk band based on percentile
 */
function assignRiskBand(percentile: number): string {
  for (const band of RISK_BANDS) {
    if (percentile >= band.minPercentile) {
      return band.band;
    }
  }
  return 'VERY_HIGH';
}

// -----------------------------------------------------------------------------
// MAIN SCORING FUNCTION
// -----------------------------------------------------------------------------

/**
 * Calculate CWI score from raw responses
 */
export function calculateCWI(responses: RawResponses, country: string): ScoringResult {
  // Step 1-2: Score questions and aggregate into constructs
  const constructScores = aggregateConstructs(responses);

  // Step 3: Standardize constructs (z-scores)
  const constructZScores = standardizeConstructs(constructScores);

  // Step 4: Apply PCA weights (used within 5Cs calculation)
  // Note: PCA weights are applied during 5Cs aggregation

  // Step 5: Aggregate into 5Cs
  const fiveCScores = aggregate5Cs(constructZScores);

  // Step 6: Calculate raw CWI
  const cwiRaw = calculateCWIRaw(fiveCScores);

  // Step 7: Country normalization
  const cwiNormalized = normalizeByCountry(cwiRaw, country);
  const cwi0100 = convertTo0100(cwiNormalized);

  // Step 8: Risk band assignment
  const riskPercentile = zScoreToPercentile(cwiNormalized);
  const riskBand = assignRiskBand(riskPercentile);

  return {
    constructScores,
    constructZScores,
    fiveCScores,
    cwiRaw,
    cwiNormalized,
    cwi0100,
    riskBand,
    riskPercentile: Math.round(riskPercentile * 100) / 100,
    modelVersion: MODEL_VERSION,
    scoredAt: new Date().toISOString(),
    country,
  };
}

// -----------------------------------------------------------------------------
// EXPORT
// -----------------------------------------------------------------------------

export { MODEL_VERSION };
