/**
 * CWI Scoring Engine Constants
 * Version: 1.1.0 (Added neurocognitive constructs)
 *
 * IMPORTANT: These are calibrated constants from offline PCA analysis.
 * Do NOT modify without proper recalibration.
 */

// -----------------------------------------------------------------------------
// PCA WEIGHTS (Construct Level)
// Source: Offline PCA calibration - absolute PC1 loadings normalized
// Sum = 1.00 (Rebalanced to include neurocognitive constructs)
// -----------------------------------------------------------------------------
export const PCA_WEIGHTS: Record<string, number> = {
  financial_behaviour: 0.20,
  payment_history: 0.15,
  self_control: 0.12,
  conscientiousness: 0.11,
  cognitive_reflection: 0.08, // NEW: Bat & ball problem
  emotional_stability: 0.08,
  risk_preference: 0.07,
  financial_numeracy: 0.06, // NEW: Financial calculation questions
  locus_of_control: 0.05,
  delay_discounting: 0.04, // NEW: Delay preference
  social_support: 0.04,
};

// -----------------------------------------------------------------------------
// GLOBAL STATISTICS (from calibration dataset)
// Used for construct z-score standardization
// -----------------------------------------------------------------------------
export const GLOBAL_STATS: Record<string, { mean: number; std: number }> = {
  financial_behaviour: { mean: 3.45, std: 0.82 },
  payment_history: { mean: 2.10, std: 0.95 }, // Lower is better (reverse scored)
  self_control: { mean: 3.28, std: 0.78 },
  conscientiousness: { mean: 3.65, std: 0.71 },
  emotional_stability: { mean: 2.85, std: 0.88 }, // Lower raw = more stable (reverse scored)
  risk_preference: { mean: 2.95, std: 0.92 },
  locus_of_control: { mean: 0.72, std: 0.25 }, // Binary: internal=1, external=0
  social_support: { mean: 2.45, std: 1.12 },
  emergency_preparedness: { mean: 2.80, std: 1.05 },
  time_orientation: { mean: 3.40, std: 0.85 },
  agreeableness: { mean: 3.55, std: 0.68 },
  openness: { mean: 3.42, std: 0.75 },
  extraversion: { mean: 3.15, std: 0.89 },
  cognitive_reflection: { mean: 0.35, std: 0.48 }, // Binary: correct=1, incorrect=0
  delay_discounting: { mean: 0.45, std: 0.50 }, // Binary: delayed preference=1, immediate=0
  financial_numeracy: { mean: 0.70, std: 0.35 }, // Proportion correct (0-1) - Updated for 12 questions
};

// -----------------------------------------------------------------------------
// COUNTRY NORMALIZATION STATISTICS
// Used for cross-country fairness adjustment
// -----------------------------------------------------------------------------
export const COUNTRY_STATS: Record<string, { mean: number; std: number }> = {
  Nigeria: { mean: -0.11, std: 0.92 },
  Kenya: { mean: -0.04, std: 0.89 },
  Ghana: { mean: -0.08, std: 0.94 },
  'South Africa': { mean: 0.05, std: 0.96 },
  'United States': { mean: 0.12, std: 1.02 },
  'United Kingdom': { mean: 0.08, std: 0.98 },
  Canada: { mean: 0.10, std: 1.00 },
  Other: { mean: 0.00, std: 1.00 }, // Default/fallback
};

// -----------------------------------------------------------------------------
// 5Cs CONSTRUCT MAPPING
// Maps psychological constructs to the 5Cs of Credit
// -----------------------------------------------------------------------------
export const FIVE_C_MAP: Record<string, string[]> = {
  character: ['financial_behaviour', 'payment_history', 'self_control', 'conscientiousness', 'cognitive_reflection', 'delay_discounting'],
  capacity: ['emergency_preparedness', 'time_orientation', 'financial_numeracy'],
  capital: ['financial_behaviour', 'social_support'], // savings_habit approximated via financial_behaviour
  consistency: ['conscientiousness', 'emotional_stability'],
  conditions: ['risk_preference', 'locus_of_control'],
};

// 5Cs weights (equal weighting - policy-neutral default)
export const FIVE_C_WEIGHTS: Record<string, number> = {
  character: 0.20,
  capacity: 0.20,
  capital: 0.20,
  consistency: 0.20,
  conditions: 0.20,
};

// -----------------------------------------------------------------------------
// RISK BAND THRESHOLDS
// Percentile-based classification
// -----------------------------------------------------------------------------
export const RISK_BANDS = [
  { band: 'LOW', minPercentile: 0.75, minAbsolute: 1.0 },
  { band: 'MODERATE', minPercentile: 0.40, minAbsolute: 0.0 },
  { band: 'HIGH', minPercentile: 0.15, minAbsolute: -1.0 },
  { band: 'VERY_HIGH', minPercentile: 0.00, minAbsolute: -Infinity },
] as const;

// -----------------------------------------------------------------------------
// LIKERT SCALE MAPPING
// -----------------------------------------------------------------------------
export const LIKERT_MAP: Record<string, number> = {
  Never: 1,
  Rarely: 2,
  Sometimes: 3,
  Often: 4,
  Always: 5,
  'Very often': 5, // Alias for some questions
};

// -----------------------------------------------------------------------------
// QUESTION TO CONSTRUCT MAPPING
// Maps question IDs to their constructs
// -----------------------------------------------------------------------------
export const QUESTION_CONSTRUCT_MAP: Record<string, string> = {
  // Payment History (q1-q6)
  q1: 'payment_history',
  q2: 'payment_history',
  q3: 'payment_history',
  q4: 'payment_history',
  q5: 'payment_history',
  q6: 'payment_history',
  // Financial Behaviour (q7-q13)
  q7: 'financial_behaviour',
  q8: 'financial_behaviour',
  q9: 'financial_behaviour',
  q10: 'financial_behaviour',
  q11: 'financial_behaviour',
  q12: 'financial_behaviour',
  q13: 'financial_behaviour',
  // Emergency Preparedness (q14-q15)
  q14: 'emergency_preparedness',
  q15: 'emergency_preparedness',
  // Crisis Decision Making (q16)
  q16: 'crisis_decision_making',
  // Conscientiousness (q17-q21)
  q17: 'conscientiousness',
  q18: 'conscientiousness',
  q19: 'conscientiousness',
  q20: 'conscientiousness',
  q21: 'conscientiousness',
  // Emotional Stability (q22-q26)
  q22: 'emotional_stability',
  q23: 'emotional_stability',
  q24: 'emotional_stability',
  q25: 'emotional_stability',
  q26: 'emotional_stability',
  // Agreeableness (q27-q31)
  q27: 'agreeableness',
  q28: 'agreeableness',
  q29: 'agreeableness',
  q30: 'agreeableness',
  q31: 'agreeableness',
  // Openness (q32-q36)
  q32: 'openness',
  q33: 'openness',
  q34: 'openness',
  q35: 'openness',
  q36: 'openness',
  // Extraversion (q37-q41)
  q37: 'extraversion',
  q38: 'extraversion',
  q39: 'extraversion',
  q40: 'extraversion',
  q41: 'extraversion',
  // Risk Preference (q42-q46)
  q42: 'risk_preference',
  q43: 'risk_preference',
  q44: 'risk_preference',
  q45: 'risk_preference',
  q46: 'risk_preference',
  // Self Control (q47-q53)
  q47: 'self_control',
  q48: 'self_control',
  q49: 'self_control',
  q50: 'self_control',
  q51: 'self_control',
  q52: 'self_control',
  q53: 'self_control',
  // Locus of Control (q54-q58)
  q54: 'locus_of_control',
  q55: 'locus_of_control',
  q56: 'locus_of_control',
  q57: 'locus_of_control',
  q58: 'locus_of_control',
  // Social Support (q59)
  q59: 'social_support',
  // Time Orientation (q60-q61)
  q60: 'time_orientation',
  q61: 'time_orientation',
  // Neurocognitive Questions (q62-q65)
  q62: 'cognitive_reflection', // Bat & ball problem
  q63: 'delay_discounting', // Delay preference
  q64: 'financial_numeracy', // Change calculation
  q65: 'financial_numeracy', // Lender comparison
  // ASFN Level 1: Functional Numeracy (asfn1_1 - asfn1_5)
  asfn1_1: 'financial_numeracy',
  asfn1_2: 'financial_numeracy',
  asfn1_3: 'financial_numeracy',
  asfn1_4: 'financial_numeracy',
  asfn1_5: 'financial_numeracy',
  // ASFN Level 2: Financial Comparison (asfn2_1 - asfn2_5)
  asfn2_1: 'financial_numeracy',
  asfn2_2: 'financial_numeracy',
  asfn2_3: 'financial_numeracy',
  asfn2_4: 'financial_numeracy',
  asfn2_5: 'financial_numeracy',
};

// -----------------------------------------------------------------------------
// REVERSE SCORED QUESTIONS
// These questions are negatively framed (higher raw = worse outcome)
// -----------------------------------------------------------------------------
export const REVERSE_SCORED_QUESTIONS = new Set([
  // Payment history - missed payments (higher = worse)
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6',
  // Emotional stability - stress/anxiety (higher = worse)
  'q22', 'q23', 'q24', 'q25', 'q26',
  // Self control - impulsivity (higher = worse)
  'q48', 'q49',
]);

// -----------------------------------------------------------------------------
// LOCUS OF CONTROL INTERNAL ANSWERS
// First option = internal (score 1), second = external (score 0)
// -----------------------------------------------------------------------------
export const LOCUS_INTERNAL_ANSWERS = [
  'My financial security depends mainly on my own actions.',
  'Financial planning helps me achieve goals.',
  'Financial success comes from hard work.',
  'I can achieve the financial goals I set.',
  'I am responsible for my financial well-being.',
];

// -----------------------------------------------------------------------------
// EMERGENCY PREPAREDNESS SCORING
// -----------------------------------------------------------------------------
export const EMERGENCY_SOURCE_SCORES: Record<string, number> = {
  'Personal savings': 5,
  'Borrow from family/friends': 3,
  'Sell an asset': 2,
  'Take a loan': 1,
  'Other': 2,
};

export const EMERGENCY_MONTHS_SCORES: Record<string, number> = {
  'None': 1,
  '1 month': 2,
  '2–3 months': 3,
  '4–6 months': 4,
  'More than 6 months': 5,
};

// -----------------------------------------------------------------------------
// SOCIAL SUPPORT SCORING
// -----------------------------------------------------------------------------
export const SOCIAL_SUPPORT_SCORES: Record<string, number> = {
  'None': 1,
  '1–2 people': 2,
  '3–5 people': 3,
  '6–10 people': 4,
  'More than 10': 5,
};

// -----------------------------------------------------------------------------
// MODEL VERSION
// -----------------------------------------------------------------------------
export const MODEL_VERSION = '1.1.0';
