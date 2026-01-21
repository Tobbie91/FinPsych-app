/**
 * FinPsych Score - Consistency Check Implementation
 *
 * This module implements 16 consistency checks to identify gaming, random responding,
 * distraction, or comprehension issues in questionnaire responses.
 */

export interface ConsistencyFlag {
  checkId: string;
  checkName: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  questions: string[];
}

export interface ValidationResult {
  totalChecks: number;
  inconsistenciesDetected: number;
  severityLevel: 'MINOR' | 'MODERATE' | 'SEVERE';
  consistencyScore: number; // 0-100
  flags: ConsistencyFlag[];
  recommendation: 'PROCEED' | 'REVIEW' | 'RETAKE';
}

export type QuestionnaireResponses = Record<string, string | number>;

/**
 * Convert response to numerical scale (1-5)
 */
function convertToNumeric(response: string | number): number {
  if (typeof response === 'number') return response;

  const frequencyMap: Record<string, number> = {
    'Never': 1,
    'Rarely': 2,
    'Sometimes': 3,
    'Often': 4,
    'Always': 5,
    'Very unlikely': 1,
    'Unlikely': 2,
    'Neutral': 3,
    'Likely': 4,
    'Very likely': 5,
    'Very often': 5,
  };

  return frequencyMap[response] || 3; // Default to neutral if unknown
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Reverse code a value (1->5, 2->4, 3->3, 4->2, 5->1)
 */
function reverseCode(value: number): number {
  return 6 - value;
}

/**
 * CHECK #1: Savings Behavior vs. Emergency Savings
 */
function check1(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q9 = convertToNumeric(responses.q9 || 3);
  const q15 = responses.q15 as string;

  const savingsMap: Record<string, number> = {
    'None': 0,
    '1 month': 1,
    '2–3 months': 2,
    '4–6 months': 3,
    'More than 6 months': 4,
  };

  const savingsLevel = savingsMap[q15] || 0;

  // Red flags
  if (q9 >= 4 && savingsLevel === 0) {
    return {
      checkId: 'CHECK_1',
      checkName: 'Savings Behavior Mismatch',
      description: `Claims to save regularly (Q9=${q9 >= 5 ? 'Always' : 'Often'}) but has no emergency savings (Q15=None)`,
      severity: 'HIGH',
      questions: ['q9', 'q15'],
    };
  }

  if (q9 <= 2 && savingsLevel >= 4) {
    return {
      checkId: 'CHECK_1',
      checkName: 'Savings Behavior Mismatch',
      description: `Claims to rarely save (Q9=${q9 === 1 ? 'Never' : 'Rarely'}) but has significant emergency savings (Q15=More than 6 months)`,
      severity: 'HIGH',
      questions: ['q9', 'q15'],
    };
  }

  return null;
}

/**
 * CHECK #2: Bill Payment Behavior vs. Missed Payments
 */
function check2(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q10 = convertToNumeric(responses.q10 || 3);
  const missedPayments = ['q1', 'q2', 'q3', 'q4', 'q5'].map(q => convertToNumeric(responses[q] || 1));

  const highMissedCount = missedPayments.filter(val => val >= 4).length;
  const allNeverMissed = missedPayments.every(val => val === 1);

  // Red flag: Always pays on time but frequently misses 2+ types of payments
  if (q10 === 5 && highMissedCount >= 2) {
    return {
      checkId: 'CHECK_2',
      checkName: 'Bill Payment Behavior Mismatch',
      description: `Claims to always pay bills on time (Q10=Always) but frequently misses ${highMissedCount} types of payments`,
      severity: 'HIGH',
      questions: ['q10', 'q1', 'q2', 'q3', 'q4', 'q5'],
    };
  }

  // Red flag: Never pays on time but never misses payments
  if (q10 <= 2 && allNeverMissed) {
    return {
      checkId: 'CHECK_2',
      checkName: 'Bill Payment Behavior Mismatch',
      description: `Claims to rarely pay bills on time (Q10=${q10 === 1 ? 'Never' : 'Rarely'}) but reports never missing any payments`,
      severity: 'HIGH',
      questions: ['q10', 'q1', 'q2', 'q3', 'q4', 'q5'],
    };
  }

  return null;
}

/**
 * CHECK #3: Impulse Control - Multiple Measures
 */
function check3(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q48Raw = convertToNumeric(responses.q48 || 3);
  const q49Raw = convertToNumeric(responses.q49 || 3);
  const q52 = convertToNumeric(responses.q52 || 3);
  const q53 = convertToNumeric(responses.q53 || 3);

  // Reverse code Q48 and Q49
  const q48 = reverseCode(q48Raw);
  const q49 = reverseCode(q49Raw);

  // Direct contradictions
  if (q48Raw >= 4 && q52 >= 4) {
    return {
      checkId: 'CHECK_3',
      checkName: 'Impulse Control Contradiction',
      description: 'Claims to act impulsively (Q48) but also claims to control spending urges (Q52) - direct contradiction',
      severity: 'HIGH',
      questions: ['q48', 'q52'],
    };
  }

  if (q49Raw >= 4 && q53 >= 4) {
    return {
      checkId: 'CHECK_3',
      checkName: 'Impulse Control Contradiction',
      description: 'Claims to buy things without thinking (Q49) but also thinks carefully before purchases (Q53) - impossible combination',
      severity: 'HIGH',
      questions: ['q49', 'q53'],
    };
  }

  // Check variance after reverse coding
  const values = [q48, q49, q52, q53];
  const stdDev = calculateStdDev(values);

  if (stdDev > 1.5) {
    return {
      checkId: 'CHECK_3',
      checkName: 'Impulse Control Variance',
      description: `High variance in impulse control responses (SD=${stdDev.toFixed(2)})`,
      severity: 'MEDIUM',
      questions: ['q48', 'q49', 'q52', 'q53'],
    };
  }

  return null;
}

/**
 * CHECK #4: Financial Goal Achievement
 */
function check4(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q13 = convertToNumeric(responses.q13 || 3);
  const q57 = responses.q57 as string;

  const achieveGoals = q57?.includes('can achieve') || q57?.includes('I can achieve');

  // Red flags
  if (q13 >= 4 && !achieveGoals) {
    return {
      checkId: 'CHECK_4',
      checkName: 'Financial Goal Achievement Mismatch',
      description: 'Claims to achieve financial goals often/always (Q13) but believes goals don\'t work out (Q57)',
      severity: 'HIGH',
      questions: ['q13', 'q57'],
    };
  }

  if (q13 <= 2 && achieveGoals) {
    return {
      checkId: 'CHECK_4',
      checkName: 'Financial Goal Achievement Mismatch',
      description: 'Claims to rarely achieve financial goals (Q13) but believes they can achieve goals (Q57)',
      severity: 'MEDIUM',
      questions: ['q13', 'q57'],
    };
  }

  return null;
}

/**
 * CHECK #5: Emotional Stability - Internal Consistency
 */
function check5(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const values = ['q22', 'q23', 'q24', 'q25', 'q26'].map(q => convertToNumeric(responses[q] || 3));
  const stdDev = calculateStdDev(values);

  if (stdDev > 1.5) {
    return {
      checkId: 'CHECK_5',
      checkName: 'Emotional Stability Variance',
      description: `High variance in emotional stability responses (SD=${stdDev.toFixed(2)})`,
      severity: 'MEDIUM',
      questions: ['q22', 'q23', 'q24', 'q25', 'q26'],
    };
  }

  return null;
}

/**
 * CHECK #6: Personal Responsibility (Locus of Control)
 */
function check6(responses: QuestionnaireResponses): ConsistencyFlag | null {
  // Count internal locus responses (first option in each pair)
  const questions = ['q54', 'q55', 'q56', 'q57', 'q58'];
  let internalCount = 0;

  questions.forEach(q => {
    const response = responses[q] as string;
    // Check if response contains internal locus keywords
    if (response?.includes('own actions') ||
        response?.includes('planning helps') ||
        response?.includes('hard work') ||
        response?.includes('can achieve') ||
        response?.includes('responsible')) {
      internalCount++;
    }
  });

  // Red flag: Mixed pattern (2-3 out of 5)
  if (internalCount >= 2 && internalCount <= 3) {
    return {
      checkId: 'CHECK_6',
      checkName: 'Locus of Control Mixed Pattern',
      description: `Inconsistent locus of control pattern (${internalCount} internal out of 5) suggests confusion or random responding`,
      severity: 'MEDIUM',
      questions: ['q54', 'q55', 'q56', 'q57', 'q58'],
    };
  }

  return null;
}

/**
 * CHECK #7: Future Orientation
 */
function check7(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q60 = responses.q60 as string;
  const q61 = convertToNumeric(responses.q61 || 3);

  // Red flags
  if (q60 === 'Very often' && q61 <= 2) {
    return {
      checkId: 'CHECK_7',
      checkName: 'Future Orientation Mismatch',
      description: 'Thinks about future very often (Q60) but doesn\'t believe small decisions affect future (Q61=Never/Rarely)',
      severity: 'HIGH',
      questions: ['q60', 'q61'],
    };
  }

  if (q60 === 'Never' && q61 >= 4) {
    return {
      checkId: 'CHECK_7',
      checkName: 'Future Orientation Mismatch',
      description: 'Never thinks about future (Q60) but believes small decisions significantly affect future (Q61=Often/Always)',
      severity: 'HIGH',
      questions: ['q60', 'q61'],
    };
  }

  return null;
}

/**
 * CHECK #8: Social Collateral - Crisis Response
 */
function check8(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q16b = convertToNumeric(responses.q16b || 3);
  const q59 = responses.q59 as string;

  // Red flags
  if (q59 === 'None' && q16b >= 4) {
    return {
      checkId: 'CHECK_8',
      checkName: 'Social Collateral Mismatch',
      description: 'Has no one to borrow from (Q59=None) but likely to borrow from family/friends (Q16b=Likely/Very likely)',
      severity: 'HIGH',
      questions: ['q16b', 'q59'],
    };
  }

  if (q59 === 'More than 10' && q16b <= 2) {
    return {
      checkId: 'CHECK_8',
      checkName: 'Social Collateral Mismatch',
      description: 'Has many people to borrow from (Q59=More than 10) but unlikely to borrow from family/friends (Q16b=Very unlikely/Unlikely)',
      severity: 'MEDIUM',
      questions: ['q16b', 'q59'],
    };
  }

  return null;
}

/**
 * CHECK #9: Emergency Savings vs. Reliance on Savings
 */
function check9(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q14a = convertToNumeric(responses.q14a || 3);
  const q15 = responses.q15 as string;

  // Red flags
  if (q15 === 'None' && q14a >= 4) {
    return {
      checkId: 'CHECK_9',
      checkName: 'Emergency Savings vs Reliance Mismatch',
      description: 'Has no emergency savings (Q15=None) but likely to rely on personal savings (Q14a=Likely/Very likely)',
      severity: 'HIGH',
      questions: ['q14a', 'q15'],
    };
  }

  if (q15 === 'More than 6 months' && q14a <= 2) {
    return {
      checkId: 'CHECK_9',
      checkName: 'Emergency Savings vs Reliance Mismatch',
      description: 'Has significant emergency savings (Q15=More than 6 months) but unlikely to rely on savings (Q14a=Very unlikely/Unlikely)',
      severity: 'MEDIUM',
      questions: ['q14a', 'q15'],
    };
  }

  return null;
}

/**
 * CHECK #10: Asset Selling - Duplicate Measure
 */
function check10(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q14b = convertToNumeric(responses.q14b || 3);
  const q16e = convertToNumeric(responses.q16e || 3);

  const difference = Math.abs(q14b - q16e);

  if (difference >= 3) {
    return {
      checkId: 'CHECK_10',
      checkName: 'Asset Selling Duplicate Measure Mismatch',
      description: `Responses to nearly identical questions differ by ${difference} points (Q14b vs Q16e)`,
      severity: 'HIGH',
      questions: ['q14b', 'q16e'],
    };
  }

  return null;
}

/**
 * CHECK #11: Financial Discipline - Internal Consistency
 */
function check11(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const values = ['q47', 'q51', 'q52', 'q53'].map(q => convertToNumeric(responses[q] || 3));
  const stdDev = calculateStdDev(values);

  if (stdDev > 1.5) {
    return {
      checkId: 'CHECK_11',
      checkName: 'Financial Discipline Variance',
      description: `High variance in financial discipline responses (SD=${stdDev.toFixed(2)})`,
      severity: 'MEDIUM',
      questions: ['q47', 'q51', 'q52', 'q53'],
    };
  }

  return null;
}

/**
 * CHECK #12: Conscientiousness - Internal Consistency
 */
function check12(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const values = ['q17', 'q18', 'q19', 'q20', 'q21'].map(q => convertToNumeric(responses[q] || 3));
  const stdDev = calculateStdDev(values);

  if (stdDev > 1.5) {
    return {
      checkId: 'CHECK_12',
      checkName: 'Conscientiousness Variance',
      description: `High variance in conscientiousness responses (SD=${stdDev.toFixed(2)})`,
      severity: 'MEDIUM',
      questions: ['q17', 'q18', 'q19', 'q20', 'q21'],
    };
  }

  return null;
}

/**
 * CHECK #13: Agreeableness - Internal Consistency
 */
function check13(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const values = ['q27', 'q28', 'q29', 'q30', 'q31'].map(q => convertToNumeric(responses[q] || 3));
  const stdDev = calculateStdDev(values);

  if (stdDev > 1.5) {
    return {
      checkId: 'CHECK_13',
      checkName: 'Agreeableness Variance',
      description: `High variance in agreeableness responses (SD=${stdDev.toFixed(2)})`,
      severity: 'MEDIUM',
      questions: ['q27', 'q28', 'q29', 'q30', 'q31'],
    };
  }

  return null;
}

/**
 * CHECK #14: Budgeting and Expense Tracking
 */
function check14(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const q8 = convertToNumeric(responses.q8 || 3);
  const q11 = convertToNumeric(responses.q11 || 3);

  // Red flag: Always budgets but never tracks expenses
  if (q11 === 5 && q8 === 1) {
    return {
      checkId: 'CHECK_14',
      checkName: 'Budgeting and Tracking Mismatch',
      description: 'Always follows a budget (Q11) but never tracks expenses (Q8) - cannot budget without tracking',
      severity: 'HIGH',
      questions: ['q8', 'q11'],
    };
  }

  return null;
}

/**
 * CHECK #15: Openness to Experience - Internal Consistency
 */
function check15(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const values = ['q32', 'q33', 'q34', 'q35', 'q36'].map(q => convertToNumeric(responses[q] || 3));
  const stdDev = calculateStdDev(values);

  if (stdDev > 1.5) {
    return {
      checkId: 'CHECK_15',
      checkName: 'Openness to Experience Variance',
      description: `High variance in openness responses (SD=${stdDev.toFixed(2)})`,
      severity: 'MEDIUM',
      questions: ['q32', 'q33', 'q34', 'q35', 'q36'],
    };
  }

  return null;
}

/**
 * CHECK #16: Extraversion - Internal Consistency
 */
function check16(responses: QuestionnaireResponses): ConsistencyFlag | null {
  const values = ['q37', 'q38', 'q39', 'q40', 'q41'].map(q => convertToNumeric(responses[q] || 3));
  const stdDev = calculateStdDev(values);

  if (stdDev > 1.5) {
    return {
      checkId: 'CHECK_16',
      checkName: 'Extraversion Variance',
      description: `High variance in extraversion responses (SD=${stdDev.toFixed(2)})`,
      severity: 'MEDIUM',
      questions: ['q37', 'q38', 'q39', 'q40', 'q41'],
    };
  }

  return null;
}

/**
 * Main validation function - runs all 16 consistency checks
 */
export function validateResponses(responses: QuestionnaireResponses): ValidationResult {
  const checks = [
    check1, check2, check3, check4, check5, check6, check7, check8,
    check9, check10, check11, check12, check13, check14, check15, check16,
  ];

  const flags: ConsistencyFlag[] = [];

  // Run all checks
  checks.forEach(checkFn => {
    const result = checkFn(responses);
    if (result) {
      flags.push(result);
    }
  });

  const inconsistenciesDetected = flags.length;

  // Calculate consistency score: 100 - (Inconsistency Count × 7)
  const consistencyScore = Math.max(0, 100 - (inconsistenciesDetected * 7));

  // Determine severity level
  let severityLevel: 'MINOR' | 'MODERATE' | 'SEVERE';
  let recommendation: 'PROCEED' | 'REVIEW' | 'RETAKE';

  if (inconsistenciesDetected <= 2) {
    severityLevel = 'MINOR';
    recommendation = 'PROCEED';
  } else if (inconsistenciesDetected <= 5) {
    severityLevel = 'MODERATE';
    recommendation = 'REVIEW';
  } else {
    severityLevel = 'SEVERE';
    recommendation = 'RETAKE';
  }

  return {
    totalChecks: 16,
    inconsistenciesDetected,
    severityLevel,
    consistencyScore,
    flags,
    recommendation,
  };
}

/**
 * Format validation result as a readable report
 */
export function formatValidationReport(result: ValidationResult): string {
  let report = 'CONSISTENCY ANALYSIS REPORT\n';
  report += '---------------------------\n';
  report += `Total Checks Performed: ${result.totalChecks}\n`;
  report += `Inconsistencies Detected: ${result.inconsistenciesDetected}\n`;
  report += `Severity Level: ${result.severityLevel}\n`;
  report += `Consistency Score: ${result.consistencyScore}/100\n\n`;

  if (result.flags.length > 0) {
    report += 'FLAGS DETECTED:\n\n';
    result.flags.forEach((flag, index) => {
      report += `${index + 1}. ${flag.checkName}\n`;
      report += `   Description: ${flag.description}\n`;
      report += `   Severity: ${flag.severity}\n`;
      report += `   Questions: ${flag.questions.join(', ')}\n\n`;
    });
  }

  report += `RECOMMENDATION: ${result.recommendation}\n`;
  if (result.recommendation === 'REVIEW') {
    report += 'Moderate inconsistencies detected. Review flagged items before finalizing scores.\n';
  } else if (result.recommendation === 'RETAKE') {
    report += 'Severe inconsistencies detected. Strong evidence of gaming, random responding, or invalid data. Consider invalidating assessment and recommend retake.\n';
  }

  return report;
}
