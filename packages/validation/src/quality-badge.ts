/**
 * Quality Badge Mapping for Gaming Risk Level
 *
 * Maps the gamingRiskLevel directly to user-friendly badge labels and colors.
 *
 * Gaming Risk Level -> Badge Label Mapping (from spec):
 * - MINIMAL  -> EXCELLENT (Green)
 * - LOW      -> GOOD (Light Green)
 * - MODERATE -> MODERATE (Yellow)
 * - HIGH     -> FLAGGED (Orange)
 * - SEVERE   -> POOR (Red)
 */

import { ValidationResult } from './consistency-checks';

export type GamingRiskLevel = 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export interface QualityBadge {
  level: GamingRiskLevel;
  label: string;
  bgColor: string;      // Tailwind bg class
  textColor: string;    // Tailwind text class
  bgColorHex: string;   // Hex color for non-Tailwind use
  textColorHex: string; // Hex color for non-Tailwind use
}

/**
 * Quality badge configuration for each gaming risk level
 * Mapping: MINIMAL->EXCELLENT, LOW->GOOD, MODERATE->MODERATE, HIGH->FLAGGED, SEVERE->POOR
 */
export const QUALITY_BADGES: Record<GamingRiskLevel, QualityBadge> = {
  MINIMAL: {
    level: 'MINIMAL',
    label: 'EXCELLENT',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    bgColorHex: '#dcfce7',
    textColorHex: '#15803d',
  },
  LOW: {
    level: 'LOW',
    label: 'GOOD',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    bgColorHex: '#d1fae5',
    textColorHex: '#047857',
  },
  MODERATE: {
    level: 'MODERATE',
    label: 'MODERATE',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    bgColorHex: '#fef9c3',
    textColorHex: '#a16207',
  },
  HIGH: {
    level: 'HIGH',
    label: 'FLAGGED',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    bgColorHex: '#ffedd5',
    textColorHex: '#c2410c',
  },
  SEVERE: {
    level: 'SEVERE',
    label: 'POOR',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    bgColorHex: '#fee2e2',
    textColorHex: '#b91c1c',
  },
};

/**
 * Derive gaming risk level from validation result
 *
 * Thresholds based on inconsistency count:
 * - 0 inconsistencies: MINIMAL
 * - 1-2 inconsistencies: LOW
 * - 3-5 inconsistencies: MODERATE
 * - 6-8 inconsistencies: HIGH
 * - 9+ inconsistencies: SEVERE
 */
export function deriveGamingRiskLevel(validationResult: ValidationResult): GamingRiskLevel {
  const count = validationResult.inconsistenciesDetected;

  if (count === 0) return 'MINIMAL';
  if (count <= 2) return 'LOW';
  if (count <= 5) return 'MODERATE';
  if (count <= 8) return 'HIGH';
  return 'SEVERE';
}

/**
 * Get quality badge from gaming risk level string (primary function)
 * This maps directly from the stored gamingRiskLevel field.
 */
export function getQualityBadgeFromRiskLevel(level: GamingRiskLevel | string | null | undefined): QualityBadge | null {
  if (!level) return null;
  const normalizedLevel = level.toUpperCase() as GamingRiskLevel;
  return QUALITY_BADGES[normalizedLevel] || null;
}

/**
 * Get quality badge from validation result
 * Derives the gaming risk level and returns the badge.
 */
export function getQualityBadgeFromValidation(validationResult: ValidationResult | null | undefined): QualityBadge | null {
  if (!validationResult) return null;
  const level = deriveGamingRiskLevel(validationResult);
  return QUALITY_BADGES[level];
}

/**
 * @deprecated Use getQualityBadgeFromRiskLevel instead.
 * Legacy function for backward compatibility - derives from quality score.
 */
export function getQualityBadge(qualityScore: number | null | undefined): QualityBadge | null {
  if (qualityScore === null || qualityScore === undefined) {
    return null;
  }
  // Approximate mapping from score to level (for legacy support only)
  // Score = 100 - (inconsistencies * 7), so:
  // 100 = 0 flags (MINIMAL), 93 = 1 flag, 86 = 2 flags (LOW)
  // 79 = 3 flags, 72 = 4 flags, 65 = 5 flags (MODERATE)
  // 58 = 6 flags, 51 = 7 flags, 44 = 8 flags (HIGH)
  // 37 = 9 flags, etc. (SEVERE)
  let level: GamingRiskLevel;
  if (qualityScore >= 93) level = 'MINIMAL';      // 0-1 flags
  else if (qualityScore >= 79) level = 'LOW';     // 2-3 flags
  else if (qualityScore >= 58) level = 'MODERATE'; // 4-6 flags
  else if (qualityScore >= 37) level = 'HIGH';    // 7-9 flags
  else level = 'SEVERE';                          // 10+ flags

  return QUALITY_BADGES[level];
}
