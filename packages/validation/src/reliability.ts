/**
 * Data Reliability and FinPsych Score Calculation
 *
 * This module provides UI-agnostic types and calculation logic for:
 * - Data reliability levels (derived from gaming risk)
 * - FinPsych score calculation with adaptive weights
 *
 * UI styling (colors, icons) should be handled by the consuming application.
 */

import type { GamingRiskLevel } from './quality-badge';

// ============================================================================
// Types
// ============================================================================

export type DataReliabilityLevel = 'HIGH' | 'MODERATE_HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';

export interface ReliabilityInfo {
  level: DataReliabilityLevel;
  label: string;
}

export interface FinPsychWeights {
  cwi: number;
  nci: number;
}

export interface FinPsychResult {
  score: number;
  reliability: DataReliabilityLevel;
  weights: FinPsychWeights;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Reliability info for each level.
 * Labels use a risk-concern scale: Minimal = most reliable, Severe = least reliable.
 */
export const RELIABILITY_INFO: Record<DataReliabilityLevel, ReliabilityInfo> = {
  HIGH: { level: 'HIGH', label: 'Minimal' },
  MODERATE_HIGH: { level: 'MODERATE_HIGH', label: 'Low' },
  MODERATE: { level: 'MODERATE', label: 'Moderate' },
  LOW: { level: 'LOW', label: 'High' },
  VERY_LOW: { level: 'VERY_LOW', label: 'Severe' },
};

/**
 * @deprecated Superseded by inverse-variance adaptive weighting (v3.2).
 * Kept for backward compatibility of exports only.
 */
export const FINPSYCH_WEIGHTS: Record<DataReliabilityLevel, FinPsychWeights> = {
  HIGH: { cwi: 0.50, nci: 0.50 },
  MODERATE_HIGH: { cwi: 0.45, nci: 0.55 },
  MODERATE: { cwi: 0.35, nci: 0.65 },
  LOW: { cwi: 0.25, nci: 0.75 },
  VERY_LOW: { cwi: 0.15, nci: 0.85 },
};

// ============================================================================
// Adaptive Weighting via Inverse-Variance (v3.2, Eq. 5–14)
// ============================================================================

/**
 * Gaming severity multipliers (Eq. 6)
 */
const GAMING_MULTIPLIERS: Record<GamingRiskLevel, number> = {
  MINIMAL: 1.0,
  LOW: 1.2,
  MODERATE: 1.6,
  HIGH: 2.2,
  SEVERE: 3.0,
};

/**
 * Consistency multiplier (Eq. 8)
 */
function getConsistencyMultiplier(consistency: number): number {
  if (consistency >= 85) return 1.0;
  if (consistency >= 65) return 1.1;
  if (consistency >= 45) return 1.3;
  return 1.7;
}

/**
 * Compute adaptive CWI/NCI weights via inverse-variance evidence integration.
 * FinPsych Developer Guide v3.2 — Adaptive Weighting (Eq. 5–14)
 *
 * @param gamingRiskLevel - Validated gaming risk level
 * @param consistencyScore - Consistency score (0-100), or null
 * @returns { cwi, nci } weights that sum to 1.0
 */
function computeAdaptiveWeights(
  gamingRiskLevel: GamingRiskLevel,
  consistencyScore: number | null | undefined
): FinPsychWeights {
  const mGaming = GAMING_MULTIPLIERS[gamingRiskLevel];
  const mConsistency = consistencyScore != null
    ? getConsistencyMultiplier(consistencyScore)
    : 1.0;

  // Eq. 9: Inflate CWI variance based on gaming + consistency
  let sigmaCwiSq = 1.0 * mGaming * mConsistency;

  // Eq. 14: Variance ceiling — prevents w_cwi from dropping below ~0.25
  sigmaCwiSq = Math.min(sigmaCwiSq, 3.0);

  // Eq. 10: NCI variance is fixed (objective test, not susceptible to gaming)
  const sigmaNciSq = 1.0;

  // Eq. 11: Inverse-variance weights
  const precisionCwi = 1.0 / sigmaCwiSq;
  const precisionNci = 1.0 / sigmaNciSq;
  const wCwi = precisionCwi / (precisionCwi + precisionNci);
  const wNci = 1.0 - wCwi;

  return { cwi: wCwi, nci: wNci };
}

/**
 * Gaming risk to base reliability mapping
 */
const GAMING_RISK_TO_RELIABILITY: Record<GamingRiskLevel, DataReliabilityLevel> = {
  MINIMAL: 'HIGH',
  LOW: 'MODERATE_HIGH',
  MODERATE: 'MODERATE',
  HIGH: 'LOW',
  SEVERE: 'VERY_LOW',
};

/**
 * Legacy label normalization
 */
const LEGACY_LABEL_MAP: Record<string, GamingRiskLevel> = {
  'GOOD': 'MINIMAL',      // Legacy "GOOD" maps to MINIMAL (HIGH reliability)
  'EXCELLENT': 'MINIMAL',
  'FLAGGED': 'HIGH',
  'POOR': 'SEVERE',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Round a number to 1 decimal place
 * Use this for consistent rounding across FinPsych score display
 */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

// ============================================================================
// Reliability Functions
// ============================================================================

/**
 * Normalize a gaming risk level string to a valid GamingRiskLevel
 * Handles legacy labels like "GOOD" -> "MINIMAL"
 */
function normalizeGamingRiskLevel(level: string): GamingRiskLevel | null {
  const upper = level.toUpperCase();

  // Check if it's a valid gaming risk level
  if (upper in GAMING_RISK_TO_RELIABILITY) {
    return upper as GamingRiskLevel;
  }

  // Check legacy mappings
  if (upper in LEGACY_LABEL_MAP) {
    return LEGACY_LABEL_MAP[upper];
  }

  return null;
}

/**
 * Get reliability info from gaming risk level
 * Returns base reliability without consistency adjustments
 */
export function getReliabilityFromGamingRisk(
  gamingRiskLevel: string | null | undefined
): ReliabilityInfo | null {
  if (!gamingRiskLevel) return null;

  const normalizedLevel = normalizeGamingRiskLevel(gamingRiskLevel);
  if (!normalizedLevel) return null;

  const reliabilityLevel = GAMING_RISK_TO_RELIABILITY[normalizedLevel];
  return RELIABILITY_INFO[reliabilityLevel];
}

/**
 * Get FinPsych weights for a given reliability level
 */
export function getFinPsychWeights(reliability: DataReliabilityLevel): FinPsychWeights {
  return FINPSYCH_WEIGHTS[reliability];
}

// ============================================================================
// FinPsych Score Calculation
// ============================================================================

/**
 * Calculate FinPsych score with adaptive weights via inverse-variance integration.
 * FinPsych Developer Guide v3.2 — Adaptive Weighting (Eq. 5–14)
 *
 * Logic:
 * 1. Reliability label derived from gaming risk mapping (for display/storage only)
 * 2. Adaptive weights computed from gaming + consistency multipliers
 *    via inverse-variance formula (NOT from lookup table)
 * 3. FinPsych = round1(cwi * w_cwi + nci * w_nci)
 *
 * @param cwiScore - CWI score (0-100)
 * @param nciScore - NCI score (0-100)
 * @param gamingRiskLevel - Gaming risk level string
 * @param consistencyScore - Consistency score (0-100), or null if not available
 * @returns FinPsychResult or null if required inputs are missing
 */
export function calculateFinPsychScore(
  cwiScore: number | null | undefined,
  nciScore: number | null | undefined,
  gamingRiskLevel: string | null | undefined,
  consistencyScore: number | null | undefined
): FinPsychResult | null {
  // Require CWI and NCI scores
  if (cwiScore == null || nciScore == null) {
    return null;
  }

  // Resolve gaming risk level (for both reliability label and weight computation)
  let normalizedGaming: GamingRiskLevel;

  if (gamingRiskLevel) {
    const parsed = normalizeGamingRiskLevel(gamingRiskLevel);
    normalizedGaming = parsed ?? 'MODERATE';
  } else {
    normalizedGaming = 'MODERATE';
  }

  // Reliability label for display/storage (derived from gaming risk only)
  const reliability: DataReliabilityLevel = GAMING_RISK_TO_RELIABILITY[normalizedGaming];

  // Compute adaptive weights via inverse-variance (Eq. 5–14)
  // Consistency is factored into weights directly, NOT used to override reliability
  const weights = computeAdaptiveWeights(normalizedGaming, consistencyScore);

  // Calculate FinPsych score
  const score = round1(cwiScore * weights.cwi + nciScore * weights.nci);

  return {
    score,
    reliability,
    weights,
  };
}
