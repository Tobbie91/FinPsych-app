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
  // CHARACTER constructs
  self_control: { mean: 3.28, std: 0.78 },
  conscientiousness: { mean: 3.65, std: 0.71 },
  agreeableness: { mean: 3.55, std: 0.68 },
  emotional_stability: { mean: 2.85, std: 0.88 }, // Lower raw = more stable (reverse scored)
  extraversion: { mean: 3.15, std: 0.89 },

  // CAPACITY constructs
  payment_history: { mean: 2.10, std: 0.95 }, // Lower is better (reverse scored)
  financial_management: { mean: 3.45, std: 0.82 }, // Renamed from financial_behaviour
  crisis_management: { mean: 3.20, std: 0.90 }, // NEW: Q6, Q50
  financial_integrity: { mean: 3.50, std: 0.85 }, // NEW: Q16a, Q16c, Q16d, Q16f

  // CAPITAL constructs
  emergency_preparedness: { mean: 2.80, std: 1.05 },

  // COLLATERAL constructs
  social_collateral: { mean: 2.45, std: 1.12 }, // Renamed from social_support

  // CONDITIONS constructs
  openness: { mean: 3.42, std: 0.75 },
  future_orientation: { mean: 3.40, std: 0.85 }, // Renamed from time_orientation
  risk_preference: { mean: 2.95, std: 0.92 },
  locus_of_control: { mean: 0.72, std: 0.25 }, // Binary: internal=1, external=0

  // NCI constructs (not part of CWI 5Cs)
  cognitive_reflection: { mean: 0.35, std: 0.48 }, // Binary: correct=1, incorrect=0
  delay_discounting: { mean: 0.45, std: 0.50 }, // Binary: delayed preference=1, immediate=0
  financial_numeracy: { mean: 0.70, std: 0.35 }, // Proportion correct (0-1)
  loan_consequence_awareness: { mean: 2.0, std: 0.8 }, // Points-based scoring (0-3 per question)
  gaming_detection: { mean: 0, std: 0 }, // NOT scored - placeholder for cross-validation
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
  USA: { mean: 0.12, std: 1.02 }, // Alias for United States
  'United Kingdom': { mean: 0.08, std: 0.98 },
  UK: { mean: 0.08, std: 0.98 }, // Alias for United Kingdom
  Canada: { mean: 0.10, std: 1.00 },
  Other: { mean: 0.00, std: 1.00 }, // Default/fallback
};

// -----------------------------------------------------------------------------
// 5Cs CONSTRUCT MAPPING
// Maps psychological constructs to the 5Cs of Credit
// NOTE: NCI constructs (cognitive_reflection, delay_discounting, financial_numeracy,
//       loan_consequence_awareness, gaming_detection) are NOT included in CWI
// -----------------------------------------------------------------------------
export const FIVE_C_MAP: Record<string, string[]> = {
  character: [
    'self_control',         // Q47-Q53 excluding Q50 (Financial Discipline)
    'conscientiousness',    // Q17-Q21
    'agreeableness',        // Q27-Q31
    'emotional_stability',  // Q22-Q26
    'extraversion',         // Q37-Q41
  ],
  capacity: [
    'payment_history',      // Q1-Q5, Q10
    'financial_management', // Q7-Q9, Q11-Q13
    'crisis_management',    // Q6, Q50
    'financial_integrity',  // Q16a, Q16c, Q16d, Q16f
  ],
  capital: [
    'emergency_preparedness', // Q14a, Q14b, Q14c, Q15
  ],
  collateral: [
    'social_collateral',    // Q59, Q16b, Q16e
  ],
  conditions: [
    'future_orientation',   // Q60-Q61
    'risk_preference',      // Q42-Q46
    'locus_of_control',     // Q54-Q58 (binary 0-1 scale)
    'openness',             // Q32-Q36 (moved from character)
  ],
};

// 5Cs weights (equal weighting - policy-neutral default)
export const FIVE_C_WEIGHTS: Record<string, number> = {
  character: 0.20,
  capacity: 0.20,
  capital: 0.20,
  collateral: 0.20,
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
// LIKELIHOOD SCALE MAPPING
// Used for Q14a-c, Q16a-f
// -----------------------------------------------------------------------------
export const LIKELIHOOD_MAP: Record<string, number> = {
  'Very unlikely': 1,
  'Unlikely': 2,
  'Neutral': 3,
  'Likely': 4,
  'Very likely': 5,
};

// -----------------------------------------------------------------------------
// QUESTION TO CONSTRUCT MAPPING
// Maps question IDs to their constructs
// -----------------------------------------------------------------------------
export const QUESTION_CONSTRUCT_MAP: Record<string, string> = {
  // ==========================================================================
  // CHARACTER CONSTRUCTS
  // ==========================================================================
  // Self Control / Financial Discipline (q47-q53, excluding q50)
  q47: 'self_control',
  q48: 'self_control',
  q49: 'self_control',
  q51: 'self_control',
  q52: 'self_control',
  q53: 'self_control',
  // Conscientiousness (q17-q21)
  q17: 'conscientiousness',
  q18: 'conscientiousness',
  q19: 'conscientiousness',
  q20: 'conscientiousness',
  q21: 'conscientiousness',
  // Agreeableness (q27-q31)
  q27: 'agreeableness',
  q28: 'agreeableness',
  q29: 'agreeableness',
  q30: 'agreeableness',
  q31: 'agreeableness',
  // Emotional Stability (q22-q26)
  q22: 'emotional_stability',
  q23: 'emotional_stability',
  q24: 'emotional_stability',
  q25: 'emotional_stability',
  q26: 'emotional_stability',
  // Extraversion (q37-q41)
  q37: 'extraversion',
  q38: 'extraversion',
  q39: 'extraversion',
  q40: 'extraversion',
  q41: 'extraversion',

  // ==========================================================================
  // CAPACITY CONSTRUCTS
  // ==========================================================================
  // Payment History (q1-q5, q10) - NOTE: q10 is NOT reverse scored
  q1: 'payment_history',
  q2: 'payment_history',
  q3: 'payment_history',
  q4: 'payment_history',
  q5: 'payment_history',
  q10: 'payment_history',
  // Financial Management (q7-q9, q11-q13) - renamed from financial_behaviour
  q7: 'financial_management',
  q8: 'financial_management',
  q9: 'financial_management',
  q11: 'financial_management',
  q12: 'financial_management',
  q13: 'financial_management',
  // Crisis Management (q6, q50)
  q6: 'crisis_management',
  q50: 'crisis_management',
  // Financial Integrity (q16a, q16c, q16d, q16f)
  q16a: 'financial_integrity',
  q16c: 'financial_integrity',
  q16d: 'financial_integrity',
  q16f: 'financial_integrity',

  // ==========================================================================
  // CAPITAL CONSTRUCTS
  // ==========================================================================
  // Emergency Preparedness (q14a, q14b, q14c, q15)
  q14a: 'emergency_preparedness',
  q14b: 'emergency_preparedness',
  q14c: 'emergency_preparedness',
  q15: 'emergency_preparedness',

  // ==========================================================================
  // COLLATERAL CONSTRUCTS
  // ==========================================================================
  // Social Collateral (q59, q16b, q16e) - renamed from social_support
  q59: 'social_collateral',
  q16b: 'social_collateral',
  q16e: 'social_collateral',

  // ==========================================================================
  // CONDITIONS CONSTRUCTS
  // ==========================================================================
  // Openness (q32-q36)
  q32: 'openness',
  q33: 'openness',
  q34: 'openness',
  q35: 'openness',
  q36: 'openness',
  // Future Orientation (q60-q61) - renamed from time_orientation
  q60: 'future_orientation',
  q61: 'future_orientation',
  // Risk Preference (q42-q46)
  q42: 'risk_preference',
  q43: 'risk_preference',
  q44: 'risk_preference',
  q45: 'risk_preference',
  q46: 'risk_preference',
  // Locus of Control (q54-q58)
  q54: 'locus_of_control',
  q55: 'locus_of_control',
  q56: 'locus_of_control',
  q57: 'locus_of_control',
  q58: 'locus_of_control',

  // ==========================================================================
  // NCI CONSTRUCTS (Not part of CWI 5Cs calculation)
  // ==========================================================================
  // Neurocognitive Questions (q62-q65) - NCI only
  q62: 'cognitive_reflection',
  q63: 'delay_discounting',
  q64: 'financial_numeracy',
  q65: 'financial_numeracy',
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
  // Loan Consequence Awareness (lca1 - lca5)
  lca1: 'loan_consequence_awareness',
  lca2: 'loan_consequence_awareness',
  lca3: 'loan_consequence_awareness',
  lca4: 'loan_consequence_awareness',
  lca5: 'loan_consequence_awareness',
  // Gaming Detection (gd1 - gd9) - NOT scored, for cross-validation only
  gd1: 'gaming_detection',
  gd2: 'gaming_detection',
  gd3: 'gaming_detection',
  gd4: 'gaming_detection',
  gd5: 'gaming_detection',
  gd6: 'gaming_detection',
  gd7: 'gaming_detection',
  gd8: 'gaming_detection',
  gd9: 'gaming_detection',
};

// -----------------------------------------------------------------------------
// REVERSE SCORED QUESTIONS
// These questions are negatively framed (higher raw = worse outcome)
// NOTE: Q10 "I pay my bills on time" is NOT reversed (only Q1-Q5 missed payments)
// -----------------------------------------------------------------------------
export const REVERSE_SCORED_QUESTIONS = new Set([
  // Payment History - missed payments only (higher = worse)
  'q1', 'q2', 'q3', 'q4', 'q5',
  // Crisis Management - renegotiating is a negative signal
  'q6',
  // Emotional Stability - stress/anxiety (higher = worse)
  'q22', 'q23', 'q24', 'q25', 'q26',
  // Self Control - impulsivity (higher = worse)
  'q48', 'q49',
  // Financial Integrity - skip payments & prioritize other expenses (higher = worse)
  'q16c', 'q16d',
  // Emergency Preparedness - taking a loan is worse
  'q14c',
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
