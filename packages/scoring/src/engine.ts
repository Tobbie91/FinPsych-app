/**
 * CWI Scoring Engine
 * Version: 1.1.0 (Added neurocognitive question scoring)
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
  LIKELIHOOD_MAP,
  QUESTION_CONSTRUCT_MAP,
  REVERSE_SCORED_QUESTIONS,
  LOCUS_INTERNAL_ANSWERS,
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
  character: number | null;
  capacity: number | null;
  capital: number | null;
  collateral: number | null;
  conditions: number | null;
}

export interface ScoringResult {
  // Raw scores
  constructScores: ConstructScores;
  constructZScores: ConstructScores;

  // 5Cs
  fiveCScores: FiveCScores;

  // Final CWI (null if insufficient data)
  cwiRaw: number | null;
  cwiNormalized: number | null;
  cwi0100: number | null;

  // Risk assessment
  riskBand: string;
  riskPercentile: number | null;

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
 * Score an emergency preparedness question (Q14a, Q14b, Q14c, Q15)
 */
function scoreEmergencyQuestion(questionId: string, value: string, isReverse: boolean): number {
  // Q15: Ordinal scale 0-4 → 1-5 (scaled = value + 1)
  if (questionId === 'q15') {
    return EMERGENCY_MONTHS_SCORES[value] ?? 3;
  }
  // Q14a, Q14b, Q14c: Likelihood scale
  if (questionId.startsWith('q14')) {
    const score = LIKELIHOOD_MAP[value] ?? 3;
    return isReverse ? 6 - score : score;
  }
  return 3;
}

/**
 * Score a social collateral question (Q59, Q16b, Q16e)
 * Q59 uses ordinal scale (0-4 → 1-5), Q16b/Q16e use likelihood scale
 */
function scoreSocialCollateralQuestion(questionId: string, value: string): number {
  // Q59: Social network size - ordinal scale
  if (questionId === 'q59') {
    return SOCIAL_SUPPORT_SCORES[value] ?? 3;
  }
  // Q16b, Q16e: Likelihood scale
  return LIKELIHOOD_MAP[value] ?? 3;
}

/**
 * Score a financial integrity question (Q16a, Q16c, Q16d, Q16f)
 * Uses likelihood scale
 */
function scoreFinancialIntegrityQuestion(value: string, isReverse: boolean): number {
  const score = LIKELIHOOD_MAP[value] ?? 3;
  return isReverse ? 6 - score : score;
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
 * Score the cognitive reflection test question (q62: Bat & Ball problem)
 * Correct answer = ₦50, Intuitive (incorrect) answer = ₦100
 */
function scoreCognitiveReflection(value: string): number {
  // Clean the input: remove currency symbols, commas, spaces
  const cleaned = value.trim().toLowerCase().replace(/[₦,\s]/g, '');
  const numericValue = parseFloat(cleaned);

  // Correct answer is 50 (ball costs ₦50, bat costs ₦1050, total ₦1100)
  if (numericValue === 50) {
    return 1; // Correct - shows cognitive reflection
  }
  return 0; // Incorrect (including common wrong answer of 100)
}

/**
 * Score the delay discounting question (q63)
 * Prefer delayed larger reward = better self-control
 */
function scoreDelayDiscounting(value: string): number {
  // Check if the answer includes ₦7,500 (the delayed option)
  if (value.includes('₦7,500') || value.includes('7500') || value.toLowerCase().includes('one month')) {
    return 1; // Prefers delayed larger reward
  }
  return 0; // Prefers immediate smaller reward
}

/**
 * Score financial numeracy questions (q64, q65, asfn1_1 through asfn2_5)
 */
function scoreFinancialNumeracy(questionId: string, value: string): number {
  // Original questions (existing logic)
  if (questionId === 'q64') {
    // Change calculation: ₦2000 - (₦500 + ₦800) = ₦700
    return value.includes('₦700') || value.includes('700') ? 1 : 0;
  }

  if (questionId === 'q65') {
    // Lender comparison: Lender A has less total interest (₦5,000 vs ₦10,000)
    return value.includes('Lender A') ? 1 : 0;
  }

  // ASFN questions - exact string matching
  const asfnCorrectAnswers: Record<string, string> = {
    // Level 1: Functional Numeracy
    'asfn1_1': 'B) Two $20 bills',
    'asfn1_2': 'A) $5',
    'asfn1_3': 'A) $15',
    'asfn1_4': 'C) $12',
    'asfn1_5': 'A) Shop B',
    // Level 2: Financial Comparison
    'asfn2_1': 'A) Lender A',
    'asfn2_2': 'A) Option A',
    'asfn2_3': 'B) $450',
    'asfn2_4': 'B) Plan B',
    'asfn2_5': 'B) Less groceries',
  };

  const correctAnswer = asfnCorrectAnswers[questionId];
  return correctAnswer && value === correctAnswer ? 1 : 0;
}

/**
 * Score loan consequence awareness questions (points-based system per PDF)
 * Each question has different point values based on the quality of the answer
 */
function scoreLoanConsequenceAwareness(questionId: string, value: string): number {
  const scoringMap: Record<string, Record<string, number>> = {
    'lca1': { 'A)': 3, 'B)': 0, 'C)': 1, 'D)': 1 },
    'lca2': { 'A)': 1, 'B)': 3, 'C)': 2, 'D)': 2 },
    'lca3': { 'A)': 2, 'B)': 3, 'C)': 0, 'D)': 0 },
    'lca4': { 'A)': 0, 'B)': 3, 'C)': 1, 'D)': 0 },
    'lca5': { 'A)': 0, 'B)': 2, 'C)': 3, 'D)': 1 },
  };

  // Extract option prefix (e.g., "A)" from "A) Contact the lender...")
  const optionPrefix = value.substring(0, 2);
  return scoringMap[questionId]?.[optionPrefix] ?? 0;
}

/**
 * Gaming detection questions - NOT scored, return 0
 * These are used for cross-validation only
 */
function scoreGamingDetection(): number {
  return 0; // Gaming detection questions are not scored
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
    return scoreEmergencyQuestion(questionId, value, isReverse);
  }

  if (construct === 'social_collateral') {
    return scoreSocialCollateralQuestion(questionId, value);
  }

  if (construct === 'financial_integrity') {
    return scoreFinancialIntegrityQuestion(value, isReverse);
  }

  if (questionId === 'q16') {
    return scoreCrisisRanking(value);
  }

  // Neurocognitive questions
  if (questionId === 'q62') {
    return scoreCognitiveReflection(value);
  }

  if (questionId === 'q63') {
    return scoreDelayDiscounting(value);
  }

  if (questionId === 'q64' || questionId === 'q65' || questionId.startsWith('asfn')) {
    return scoreFinancialNumeracy(questionId, value);
  }

  if (construct === 'loan_consequence_awareness') {
    return scoreLoanConsequenceAwareness(questionId, value);
  }

  if (construct === 'gaming_detection') {
    return scoreGamingDetection();
  }

  // Default: Likert scale
  return scoreLikertQuestion(value, isReverse);
}

// -----------------------------------------------------------------------------
// STEP 2: CONSTRUCT AGGREGATION
// -----------------------------------------------------------------------------

/**
 * Check if a value is an N/A response (should be excluded from scoring)
 */
function isNAResponse(value: string): boolean {
  return value.startsWith('N/A');
}

/**
 * Aggregate question scores into construct scores
 */
function aggregateConstructs(responses: RawResponses): ConstructScores {
  const constructSums: Record<string, number> = {};
  const constructCounts: Record<string, number> = {};

  for (const [questionId, value] of Object.entries(responses)) {
    // Skip demographic questions (both 'demo' prefix for name/email and 'dem' prefix for DEM1-DEM13)
    if (questionId.startsWith('demo') || questionId.startsWith('dem')) continue;

    // Skip N/A responses - these should not count toward the construct
    // This ensures Payment History denominator excludes Q4/Q5 when user selects N/A
    if (isNAResponse(value)) continue;

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

  // LCA guard: max raw score is 15 (5 questions × 3 points max)
  const lcaRaw = constructSums['loan_consequence_awareness'];
  if (lcaRaw !== undefined && lcaRaw > 15) {
    throw new Error(`LCA raw score ${lcaRaw} exceeds maximum of 15`);
  }

  // Calculate means
  const constructScores: ConstructScores = {};
  for (const construct of Object.keys(constructSums)) {
    constructScores[construct] = constructSums[construct] / constructCounts[construct];
  }

  return constructScores;
}

// -----------------------------------------------------------------------------
// NCI CALCULATION
// -----------------------------------------------------------------------------

/**
 * Calculate NCI (Neurocognitive Index) from construct scores
 * NCI = 50% ASFN + 50% LCA
 *
 * ASFN = average of cognitive_reflection, delay_discounting, financial_numeracy (scaled 0-100)
 * LCA = loan_consequence_awareness (normalized to 0-100)
 *
 * For legacy records without q62/q63, ASFN is calculated from financial_numeracy only.
 *
 * @param constructScores - Raw construct scores from aggregateConstructs()
 * @returns NCI score (0-100), or null if minimum required constructs missing
 */
export function calculateNCI(constructScores: ConstructScores): number | null {
  const cogReflection = constructScores['cognitive_reflection'];
  const delayDisc = constructScores['delay_discounting'];
  const finNum = constructScores['financial_numeracy'];
  const lca = constructScores['loan_consequence_awareness'];

  // Minimum required: financial_numeracy AND loan_consequence_awareness
  if (finNum === undefined || lca === undefined) {
    return null;
  }

  // ASFN: Calculate based on available constructs
  let asfnPercent: number;
  if (cogReflection !== undefined && delayDisc !== undefined) {
    // Full NCI: all 3 neurocognitive constructs (new questionnaires)
    asfnPercent = ((cogReflection + delayDisc + finNum) / 3) * 100;
  } else {
    // Legacy NCI: only financial_numeracy available (old questionnaires)
    // Use financial_numeracy directly as ASFN proxy
    asfnPercent = finNum * 100;
  }

  // LCA: normalize from 0-3 scale to 0-100
  const lcaPercent = (lca / 3) * 100;

  // NCI = 50% ASFN + 50% LCA
  return Math.round((asfnPercent * 0.5 + lcaPercent * 0.5) * 10) / 10;
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
 * Normalize a raw score (1-5 scale) to 0-100 scale
 * Formula: ((rawScore - 1) / (5 - 1)) * 100, clamped to [0, 100]
 */
function normalizeToHundred(rawScore: number): number {
  const normalized = ((rawScore - 1) / (5 - 1)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Aggregate constructs into 5Cs scores (0-100 scale)
 * Uses raw construct scores, NOT z-scores
 * Uses EQUAL weighting within each C category
 * Returns null for empty categories (not 2.5/50) to avoid distorting CWI
 */
function aggregate5Cs(constructScores: ConstructScores): FiveCScores {
  const fiveCScores: FiveCScores = {
    character: null,
    capacity: null,
    capital: null,
    collateral: null,
    conditions: null,
  };

  for (const [cCategory, constructs] of Object.entries(FIVE_C_MAP)) {
    let sum = 0;
    let count = 0;

    for (const construct of constructs) {
      const rawScore = constructScores[construct];
      if (rawScore !== undefined) {
        // Equal weighting - all constructs weighted equally within their C
        sum += rawScore;
        count++;
      }
    }

    // Return null for empty categories - do NOT default to neutral
    if (count === 0) {
      continue; // fiveCScores[cCategory] is already null
    }

    // Calculate simple mean, then normalize to 0-100
    const avgRawScore = sum / count;
    fiveCScores[cCategory as keyof FiveCScores] = normalizeToHundred(avgRawScore);
  }

  return fiveCScores;
}

// -----------------------------------------------------------------------------
// STEP 6: CWI RAW CALCULATION
// -----------------------------------------------------------------------------

/**
 * Calculate raw CWI from 5Cs scores
 * Renormalizes by total weight of present categories (skips null)
 */
function calculateCWIRaw(fiveCScores: FiveCScores): number | null {
  let weightedSum = 0;
  let weightSum = 0;

  for (const [category, weight] of Object.entries(FIVE_C_WEIGHTS)) {
    const score = fiveCScores[category as keyof FiveCScores];
    if (typeof score === 'number' && !Number.isNaN(score)) {
      weightedSum += score * weight;
      weightSum += weight;
    }
  }

  if (weightSum === 0) return null;
  return weightedSum / weightSum; // stays 0-100
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
  // Note: Equal weighting is now used during 5Cs aggregation

  // Step 5: Aggregate into 5Cs (using raw scores, normalized to 0-100)
  const fiveCScores = aggregate5Cs(constructScores);

  // Step 6: Calculate raw CWI (may be null if insufficient data)
  const cwiRaw = calculateCWIRaw(fiveCScores);

  // Step 7-8: Country normalization and risk assignment (only if CWI exists)
  let cwiNormalized: number | null = null;
  let cwi0100: number | null = null;
  let riskPercentile: number | null = null;
  let riskBand = 'UNKNOWN';

  if (cwiRaw !== null) {
    cwiNormalized = normalizeByCountry(cwiRaw, country);
    cwi0100 = convertTo0100(cwiNormalized);
    riskPercentile = zScoreToPercentile(cwiNormalized);
    riskBand = assignRiskBand(riskPercentile);
    riskPercentile = Math.round(riskPercentile * 100) / 100;
  }

  return {
    constructScores,
    constructZScores,
    fiveCScores,
    cwiRaw,
    cwiNormalized,
    cwi0100,
    riskBand,
    riskPercentile,
    modelVersion: MODEL_VERSION,
    scoredAt: new Date().toISOString(),
    country,
  };
}

// -----------------------------------------------------------------------------
// EXPORT
// -----------------------------------------------------------------------------

export { MODEL_VERSION };
