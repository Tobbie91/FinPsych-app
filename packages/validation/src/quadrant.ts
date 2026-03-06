/**
 * Quadrant Classification and Discordance Analysis (v3.2, Section 2.6)
 *
 * Pure display-only functions for classifying the CWI vs NCI relationship.
 * These do NOT affect scoring or weights.
 */

// ============================================================================
// Types
// ============================================================================

export type Quadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type DiscordanceSeverity = 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export interface QuadrantResult {
  quadrant: Quadrant;
  label: string;
  cwi: number;
  nci: number;
  discordance: number;
  discordanceSeverity: DiscordanceSeverity;
}

// ============================================================================
// Constants
// ============================================================================

const QUADRANT_THRESHOLD = 60;

const QUADRANT_LABELS: Record<Quadrant, string> = {
  Q1: 'Authentic Performer',
  Q2: 'Gaming Suspected',
  Q3: 'Honest/Humble',
  Q4: 'Genuine Struggle',
};

// ============================================================================
// Functions
// ============================================================================

/**
 * Classify CWI/NCI into a quadrant (threshold = 60)
 */
export function classifyQuadrant(cwi: number, nci: number): Quadrant {
  if (cwi >= QUADRANT_THRESHOLD && nci >= QUADRANT_THRESHOLD) return 'Q1';
  if (cwi >= QUADRANT_THRESHOLD && nci < QUADRANT_THRESHOLD) return 'Q2';
  if (cwi < QUADRANT_THRESHOLD && nci >= QUADRANT_THRESHOLD) return 'Q3';
  return 'Q4';
}

/**
 * Calculate discordance and severity band
 */
export function calculateDiscordance(cwi: number, nci: number): {
  discordance: number;
  severity: DiscordanceSeverity;
} {
  const discordance = Math.abs(cwi - nci);

  let severity: DiscordanceSeverity;
  if (discordance <= 10) severity = 'MINIMAL';
  else if (discordance <= 20) severity = 'LOW';
  else if (discordance <= 35) severity = 'MODERATE';
  else if (discordance <= 50) severity = 'HIGH';
  else severity = 'SEVERE';

  return { discordance, severity };
}

/**
 * Get the display label for a quadrant
 */
export function getQuadrantLabel(quadrant: Quadrant): string {
  return QUADRANT_LABELS[quadrant];
}

/**
 * Full quadrant analysis (convenience function)
 */
export function analyzeQuadrant(cwi: number, nci: number): QuadrantResult {
  const quadrant = classifyQuadrant(cwi, nci);
  const { discordance, severity } = calculateDiscordance(cwi, nci);

  return {
    quadrant,
    label: QUADRANT_LABELS[quadrant],
    cwi,
    nci,
    discordance,
    discordanceSeverity: severity,
  };
}

/**
 * Check if Q2 + HIGH/SEVERE gaming alert should fire
 */
export function isGamingAlert(
  quadrant: Quadrant,
  gamingRiskLevel: string
): boolean {
  return quadrant === 'Q2' &&
    (gamingRiskLevel === 'HIGH' || gamingRiskLevel === 'SEVERE');
}
