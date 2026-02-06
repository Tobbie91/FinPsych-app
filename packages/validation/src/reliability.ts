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
 * Reliability info for each level (UI-agnostic)
 */
export const RELIABILITY_INFO: Record<DataReliabilityLevel, ReliabilityInfo> = {
  HIGH: { level: 'HIGH', label: 'HIGH' },
  MODERATE_HIGH: { level: 'MODERATE_HIGH', label: 'MODERATE-HIGH' },
  MODERATE: { level: 'MODERATE', label: 'MODERATE' },
  LOW: { level: 'LOW', label: 'LOW' },
  VERY_LOW: { level: 'VERY_LOW', label: 'VERY LOW' },
};

/**
 * FinPsych weights by reliability level
 * Higher reliability = more equal weighting
 * Lower reliability = heavier NCI weighting (more objective measure)
 */
export const FINPSYCH_WEIGHTS: Record<DataReliabilityLevel, FinPsychWeights> = {
  HIGH: { cwi: 0.50, nci: 0.50 },
  MODERATE_HIGH: { cwi: 0.45, nci: 0.55 },
  MODERATE: { cwi: 0.35, nci: 0.65 },
  LOW: { cwi: 0.25, nci: 0.75 },
  VERY_LOW: { cwi: 0.15, nci: 0.85 },
};

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
 * Calculate FinPsych score with adaptive weights based on reliability
 *
 * Logic:
 * 1. Base reliability comes from gaming risk mapping
 * 2. If consistencyScore is provided:
 *    - < 65: reliability = VERY_LOW
 *    - < 75: reliability = LOW
 *    - else: keep base reliability
 * 3. Weights are determined by final reliability level
 * 4. FinPsych = round1(cwi * cwiWeight + nci * nciWeight)
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

  // Get base reliability from gaming risk
  let reliability: DataReliabilityLevel;

  if (gamingRiskLevel) {
    const normalizedLevel = normalizeGamingRiskLevel(gamingRiskLevel);
    if (normalizedLevel) {
      reliability = GAMING_RISK_TO_RELIABILITY[normalizedLevel];
    } else {
      // Unknown gaming risk level - default to MODERATE
      reliability = 'MODERATE';
    }
  } else {
    // No gaming risk level - default to MODERATE
    reliability = 'MODERATE';
  }

  // Apply consistency score adjustments if provided
  if (consistencyScore != null) {
    if (consistencyScore < 65) {
      reliability = 'VERY_LOW';
    } else if (consistencyScore < 75) {
      reliability = 'LOW';
    }
    // else keep base reliability
  }

  // Get weights for final reliability level
  const weights = FINPSYCH_WEIGHTS[reliability];

  // Calculate FinPsych score
  const score = round1(cwiScore * weights.cwi + nciScore * weights.nci);

  return {
    score,
    reliability,
    weights,
  };
}
