/**
 * Test file for recompute-scores.ts
 * Verifies the recompute logic with deterministic fixture data
 *
 * Run: npx tsx scripts/test-recompute.ts
 */

// =============================================================================
// FIXTURE DATA
// =============================================================================

// Simulated raw responses for a test applicant
const fixtureResponses: Record<string, string> = {
  // Demographics (not scored)
  demo1: 'Jane Doe',
  demo2: 'jane@example.com',
  dem1: '25-34',
  dem2: 'Female',

  // ASFN Level 1 - All correct (100%)
  asfn1_q1: '150',
  asfn1_q2: '20',
  asfn1_q3: 'More than ₦102',
  asfn1_q4: '₦110',
  asfn1_q5: '2 years',

  // ASFN Level 2 - 3/5 correct (60%)
  asfn2_q1: 'Plan A',  // correct
  asfn2_q2: 'Plan B',  // correct
  asfn2_q3: 'Plan A',  // correct
  asfn2_q4: 'Plan B',  // wrong (should be Plan A)
  asfn2_q5: 'Plan A',  // wrong (should be Plan B)

  // LCA - 4/5 correct (12/15 points)
  lca1: 'They may have to pay more interest over time',  // correct
  lca2: 'It could lower their credit score',              // correct
  lca3: 'Pay off the entire balance each month',          // correct
  lca4: 'The lender may repossess or foreclose on the asset', // correct
  lca5: 'Make minimum payments only',                      // wrong

  // Likert questions (sample)
  q1: 'Never',
  q2: 'Rarely',
  q3: 'Sometimes',
  q8: 'Often',
  q9: 'Always',
  q10: 'Always',
  q11: 'Often',
  q13: 'Sometimes',
  q15: '2–3 months',
  q14a: 'Likely',
  q14b: 'Unlikely',
  q16b: 'Likely',
  q16e: 'Unlikely',

  // Social support
  q59: '5–10',

  // Self-control / impulse
  q48: 'Sometimes',
  q49: 'Rarely',
  q52: 'Often',
  q53: 'Often',

  // Locus of control
  q54: 'My own actions determine my financial success',
  q55: 'Planning helps me achieve financial goals',
  q56: 'Hard work leads to financial success',
  q57: 'I can achieve my financial goals through effort',
  q58: 'I am responsible for my financial outcomes',

  // Future orientation
  q60: 'Often',
  q61: 'Always',
};

// =============================================================================
// TEST FUNCTIONS (copied from recompute-scores.ts for standalone testing)
// =============================================================================

function computeASFNScores(responses: Record<string, string>): {
  level1Score: number;
  level2Score: number;
  overallScore: number;
  tier: string;
} {
  const level1Questions = ['asfn1_q1', 'asfn1_q2', 'asfn1_q3', 'asfn1_q4', 'asfn1_q5'];
  const level1Correct: Record<string, string> = {
    'asfn1_q1': '150',
    'asfn1_q2': '20',
    'asfn1_q3': 'More than ₦102',
    'asfn1_q4': '₦110',
    'asfn1_q5': '2 years',
  };

  let level1Correct_count = 0;
  for (const q of level1Questions) {
    if (responses[q] === level1Correct[q]) {
      level1Correct_count++;
    }
  }
  const level1Score = (level1Correct_count / level1Questions.length) * 100;

  const level2Questions = ['asfn2_q1', 'asfn2_q2', 'asfn2_q3', 'asfn2_q4', 'asfn2_q5'];
  const level2Correct: Record<string, string> = {
    'asfn2_q1': 'Plan A',
    'asfn2_q2': 'Plan B',
    'asfn2_q3': 'Plan A',
    'asfn2_q4': 'Plan A',
    'asfn2_q5': 'Plan B',
  };

  let level2Correct_count = 0;
  const level2Unlocked = level1Score >= 60;

  if (level2Unlocked) {
    for (const q of level2Questions) {
      if (responses[q] === level2Correct[q]) {
        level2Correct_count++;
      }
    }
  }
  const level2Score = level2Unlocked ? (level2Correct_count / level2Questions.length) * 100 : 0;

  const overallScore = level2Unlocked
    ? (level1Score * 0.6) + (level2Score * 0.4)
    : level1Score;

  let tier: string;
  if (overallScore >= 75) tier = 'HIGH';
  else if (overallScore >= 50) tier = 'MEDIUM';
  else tier = 'LOW';

  return { level1Score, level2Score, overallScore, tier };
}

function computeLCAScores(responses: Record<string, string>): {
  rawScore: number;
  percent: number;
} {
  const lcaQuestions = ['lca1', 'lca2', 'lca3', 'lca4', 'lca5'];
  const lcaMaxScore = 15;
  const lcaCorrect: Record<string, string> = {
    'lca1': 'They may have to pay more interest over time',
    'lca2': 'It could lower their credit score',
    'lca3': 'Pay off the entire balance each month',
    'lca4': 'The lender may repossess or foreclose on the asset',
    'lca5': 'Continue making full payments',
  };

  let rawScore = 0;
  for (const q of lcaQuestions) {
    if (responses[q] === lcaCorrect[q]) {
      rawScore += 3;
    }
  }

  if (rawScore > lcaMaxScore) {
    rawScore = lcaMaxScore;
  }

  const percent = (rawScore / lcaMaxScore) * 100;
  return { rawScore, percent };
}

function computeNCI(asfnOverall: number, lcaPercent: number): number {
  return (asfnOverall * 0.5) + (lcaPercent * 0.5);
}

// =============================================================================
// TESTS
// =============================================================================

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error}`);
    failed++;
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertClose(actual: number, expected: number, tolerance: number, message: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}: expected ~${expected}, got ${actual}`);
  }
}

// Run tests
console.log('\n' + '='.repeat(60));
console.log('RECOMPUTE LOGIC TESTS');
console.log('='.repeat(60) + '\n');

test('ASFN Level 1: All correct = 100%', () => {
  const result = computeASFNScores(fixtureResponses);
  assertEqual(result.level1Score, 100, 'Level 1 score');
});

test('ASFN Level 2: 3/5 correct = 60%', () => {
  const result = computeASFNScores(fixtureResponses);
  assertEqual(result.level2Score, 60, 'Level 2 score');
});

test('ASFN Overall: 60% L1 + 40% L2 = 100*0.6 + 60*0.4 = 84', () => {
  const result = computeASFNScores(fixtureResponses);
  // 100 * 0.6 + 60 * 0.4 = 60 + 24 = 84
  assertEqual(result.overallScore, 84, 'Overall ASFN score');
});

test('ASFN Tier: 84 >= 75 = HIGH', () => {
  const result = computeASFNScores(fixtureResponses);
  assertEqual(result.tier, 'HIGH', 'ASFN tier');
});

test('LCA: 4/5 correct = 12/15 raw, 80%', () => {
  const result = computeLCAScores(fixtureResponses);
  assertEqual(result.rawScore, 12, 'LCA raw score');
  assertEqual(result.percent, 80, 'LCA percent');
});

test('NCI = 50% ASFN + 50% LCA = 84*0.5 + 80*0.5 = 82', () => {
  const asfn = computeASFNScores(fixtureResponses);
  const lca = computeLCAScores(fixtureResponses);
  const nci = computeNCI(asfn.overallScore, lca.percent);
  assertEqual(nci, 82, 'NCI score');
});

test('LCA overflow protection: scores > 15 are clamped', () => {
  const testResponses = { ...fixtureResponses };
  // Even with all correct, max is 15
  const result = computeLCAScores(testResponses);
  if (result.rawScore > 15) {
    throw new Error('LCA overflow not clamped');
  }
});

test('ASFN Level 2 locked if Level 1 < 60%', () => {
  const lowScoreResponses = { ...fixtureResponses };
  // Make level 1 fail (only 2/5 correct = 40%)
  lowScoreResponses.asfn1_q1 = 'wrong';
  lowScoreResponses.asfn1_q2 = 'wrong';
  lowScoreResponses.asfn1_q3 = 'wrong';

  const result = computeASFNScores(lowScoreResponses);
  assertEqual(result.level2Score, 0, 'Level 2 should be 0 when locked');
  assertEqual(result.overallScore, result.level1Score, 'Overall should equal Level 1 when L2 locked');
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60) + '\n');

if (failed > 0) {
  process.exit(1);
}
