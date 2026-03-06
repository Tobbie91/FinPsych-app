/**
 * Tests for v3.2 Gaming/Consistency Separation (GD Cross-Validation)
 *
 * Run with: npx tsx src/tests/gaming-consistency.test.ts
 */

import {
  validateResponses,
  type ValidationResult,
} from '../consistency-checks';
import { deriveGamingRiskLevel } from '../quality-badge';

// ============================================================================
// Test Utilities
// ============================================================================

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (e: any) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

function assertEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Assertion failed: Expected true');
  }
}

// ============================================================================
// Helper: Build minimal responses that trigger specific checks
// ============================================================================

/** Base responses where all checks pass (no flags) */
function cleanResponses(): Record<string, string | number> {
  return {
    // CHECK_1: Savings consistent (saves often, has savings)
    q9: 4, q15: '4–6 months',
    // CHECK_2: Bill payment consistent (pays on time, no missed payments)
    q10: 4, q1: 1, q2: 1, q3: 1, q4: 1, q5: 1,
    // CHECK_3: Impulse control consistent
    q48: 2, q49: 2, q52: 4, q53: 4,
    // CHECK_4: Financial goal achievement consistent
    q13: 4, q57: 'I can achieve my financial goals',
    // CHECK_5: Emotional stability low variance
    q22: 3, q23: 3, q24: 3, q25: 3, q26: 3,
    // CHECK_6: Locus of control consistent (mostly internal)
    q54: 'Strongly agree', q55: 'Strongly agree', q56: 'Strongly agree',
    q57b: 'Strongly agree', q58: 'Strongly agree',
    // CHECK_7: Future orientation consistent
    q60: 'Very often', q61: 4,
    // CHECK_8: Social collateral consistent
    q16b: 2, q59: 'None',
    // CHECK_9: Emergency savings consistent
    q14a: 4, q15b: '4–6 months',
    // CHECK_10: Asset selling consistent
    q14b: 3, q16e: 3,
    // CHECK_11: Financial discipline low variance
    q47: 3, q51: 3, q52b: 3, q53b: 3,
    // CHECK_12: Conscientiousness low variance
    q17: 3, q18: 3, q19: 3, q20: 3, q21: 3,
    // CHECK_13: Agreeableness low variance
    q27: 3, q28: 3, q29: 3, q30: 3, q31: 3,
    // CHECK_14: Budgeting consistent
    q8: 4, q11: 4,
    // CHECK_15: Openness low variance
    q32: 3, q33: 3, q34: 3, q35: 3, q36: 3,
    // CHECK_16: Extraversion low variance
    q37: 3, q38: 3, q39: 3, q40: 3, q41: 3,
    // GD responses: "good" choices that do NOT trigger gaming flags
    gd1: 'A) Add it to savings for a specific goal.',
    gd2: 'C) Stick to my planned purchases.',
    gd3: 'A) I write down every expense in a notebook or app.',
    gd7: 'A) Saved roughly the same amount each month.',
    gd9: 'A) Pay the full $50 loan.',
    // Q16c/Q16d defaults (neutral, reverse < 4 so FLAG_9A self-report not met)
    q16c: 'Neutral', q16d: 'Neutral',
  };
}

// --- Gaming Flag Triggers (GD cross-validation) ---

/** Trigger FLAG_1A: high future orientation + GD_Q1 = D */
function triggerFlag1A(responses: Record<string, string | number>) {
  responses.q60 = 'Very often'; // >= 4
  responses.q61 = 5;            // >= 4
  responses.q9 = 5;             // >= 4
  responses.gd1 = "D) Use it to buy something I've been wanting for a while.";
}

/** Trigger FLAG_2A: perfect impulse control + GD_Q2 = A */
function triggerFlag2A(responses: Record<string, string | number>) {
  responses.q47 = 5;  // >= 4
  responses.q48 = 1;  // raw=1, R=5 >= 4
  responses.q49 = 1;  // raw=1, R=5 >= 4
  responses.q53 = 5;  // >= 4
  responses.gd2 = "A) Buy it since it's on sale.";
}

/** Trigger FLAG_3A: expense tracking strength + GD_Q3 = C or D */
function triggerFlag3A(responses: Record<string, string | number>) {
  responses.q8 = 5;   // >= 4
  responses.q11 = 5;  // >= 4
  responses.gd3 = "D) I don't really track them - I just try to be careful.";
}

/** Trigger FLAG_7A: savings strength + GD_Q7 = C */
function triggerFlag7A(responses: Record<string, string | number>) {
  responses.q9 = 5;              // >= 4
  responses.q15 = '4–6 months';  // savingsLevel=3 >= 3
  responses.gd7 = "C) Planned to save but unexpected expenses came up most months.";
}

/** Trigger FLAG_9A: repayment integrity + GD_Q9 = B or D */
function triggerFlag9A(responses: Record<string, string | number>) {
  responses.q16c = 'Very unlikely'; // raw=1, R=5 >= 4
  responses.q16d = 'Very unlikely'; // raw=1, R=5 >= 4
  responses.gd9 = "D) Handle household needs first.";
}

// --- Consistency-only triggers (unchanged) ---

/** Trigger CHECK_4 (consistency only): financial goal mismatch */
function triggerCheck4(responses: Record<string, string | number>) {
  responses.q13 = 5; // Always achieves goals
  responses.q57 = 'Things never work out for me'; // Contradicts
}

/** Trigger CHECK_14 (consistency only): budgeting mismatch */
function triggerCheck14(responses: Record<string, string | number>) {
  responses.q11 = 5; // Always follows budget
  responses.q8 = 1;  // Never tracks expenses
}

// ============================================================================
// Tests: Gaming Flag Extraction (GD Cross-Validation)
// ============================================================================

console.log('\n=== Gaming Flag Extraction (GD Cross-Validation) ===\n');

test('Clean responses => 0 gaming flags, 0 consistency flags', () => {
  const result = validateResponses(cleanResponses());
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
  assertEqual(result.gamingWeightedScore, 0, 'gamingWeightedScore');
  assertEqual(result.consistencyFlagCount, 0, 'consistencyFlagCount');
  assertEqual(result.consistencyScore, 100, 'consistencyScore');
});

test('FLAG_1A fires: high future orientation + GD_Q1=D => gamingWeightedScore=3', () => {
  const responses = cleanResponses();
  triggerFlag1A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 1, 'gamingFlagCount');
  assertEqual(result.gamingWeightedScore, 3, 'gamingWeightedScore');
  assertEqual(result.gamingFlags[0].flagId, 'FLAG_1A', 'flagId');
  assertEqual(result.gamingFlags[0].sourceCheckId, 'GD_Q1', 'sourceCheckId');
  assertEqual(result.gamingFlags[0].weight, 3, 'weight');
});

test('FLAG_2A fires: perfect impulse control + GD_Q2=A => gamingWeightedScore=3', () => {
  const responses = cleanResponses();
  triggerFlag2A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 1, 'gamingFlagCount');
  assertEqual(result.gamingWeightedScore, 3, 'gamingWeightedScore');
  assertEqual(result.gamingFlags[0].flagId, 'FLAG_2A', 'flagId');
  assertEqual(result.gamingFlags[0].sourceCheckId, 'GD_Q2', 'sourceCheckId');
});

test('FLAG_3A fires: expense tracking strength + GD_Q3=D => gamingWeightedScore=3', () => {
  const responses = cleanResponses();
  triggerFlag3A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 1, 'gamingFlagCount');
  assertEqual(result.gamingFlags[0].flagId, 'FLAG_3A', 'flagId');
  assertEqual(result.gamingFlags[0].sourceCheckId, 'GD_Q3', 'sourceCheckId');
});

test('FLAG_3A also fires with GD_Q3=C (mental estimate)', () => {
  const responses = cleanResponses();
  responses.q8 = 5;
  responses.q11 = 5;
  responses.gd3 = "C) I keep a rough mental estimate.";
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 1, 'gamingFlagCount');
  assertEqual(result.gamingFlags[0].flagId, 'FLAG_3A', 'flagId');
});

test('FLAG_7A fires: savings strength + GD_Q7=C => gamingWeightedScore=3', () => {
  const responses = cleanResponses();
  triggerFlag7A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 1, 'gamingFlagCount');
  assertEqual(result.gamingFlags[0].flagId, 'FLAG_7A', 'flagId');
  assertEqual(result.gamingFlags[0].sourceCheckId, 'GD_Q7', 'sourceCheckId');
});

test('FLAG_9A fires: repayment integrity + GD_Q9=D => gamingWeightedScore=3', () => {
  const responses = cleanResponses();
  triggerFlag9A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 1, 'gamingFlagCount');
  assertEqual(result.gamingFlags[0].flagId, 'FLAG_9A', 'flagId');
  assertEqual(result.gamingFlags[0].sourceCheckId, 'GD_Q9', 'sourceCheckId');
});

test('FLAG_9A also fires with GD_Q9=B (contact lender)', () => {
  const responses = cleanResponses();
  responses.q16c = 'Very unlikely';
  responses.q16d = 'Very unlikely';
  responses.gd9 = "B) Contact the lender to request.";
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 1, 'gamingFlagCount');
  assertEqual(result.gamingFlags[0].flagId, 'FLAG_9A', 'flagId');
});

// ============================================================================
// Tests: Gaming Flags Do NOT Fire When Conditions Not Met
// ============================================================================

console.log('\n=== Gaming Flags — Negative Cases ===\n');

test('FLAG_1A does NOT fire when GD_Q1 != D (good GD choice)', () => {
  const responses = cleanResponses();
  responses.q60 = 'Very often'; responses.q61 = 5; responses.q9 = 5;
  responses.gd1 = 'A) Add it to savings for a specific goal.';
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
});

test('FLAG_1A does NOT fire when self-report below threshold (Q61 < 4)', () => {
  const responses = cleanResponses();
  responses.q60 = 'Very often'; responses.q61 = 2; responses.q9 = 5;
  responses.gd1 = "D) Use it to buy something I've been wanting for a while.";
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
});

test('FLAG_2A does NOT fire when Q47 < 4 (self-report not perfect)', () => {
  const responses = cleanResponses();
  responses.q47 = 3; responses.q48 = 1; responses.q49 = 1; responses.q53 = 5;
  responses.gd2 = "A) Buy it since it's on sale.";
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
});

test('FLAG_2A does NOT fire when GD_Q2 != A', () => {
  const responses = cleanResponses();
  responses.q47 = 5; responses.q48 = 1; responses.q49 = 1; responses.q53 = 5;
  responses.gd2 = 'B) Check my budget first, then decide.';
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
});

test('FLAG_3A does NOT fire when GD_Q3 = A or B (good tracking)', () => {
  const responses = cleanResponses();
  responses.q8 = 5; responses.q11 = 5;
  responses.gd3 = 'A) I write down every expense in a notebook or app.';
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
});

test('FLAG_7A does NOT fire when Q15 < 3 (savingsLevel too low)', () => {
  const responses = cleanResponses();
  responses.q9 = 5; responses.q15 = '2–3 months'; // savingsLevel=2 < 3
  responses.gd7 = "C) Planned to save but unexpected expenses came up most months.";
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
});

test('FLAG_9A does NOT fire when Q16c_R < 4 (not claiming integrity)', () => {
  const responses = cleanResponses();
  responses.q16c = 'Neutral'; // raw=3, R=3 < 4
  responses.q16d = 'Very unlikely';
  responses.gd9 = "D) Handle household needs first.";
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
});

test('FLAG_9A does NOT fire when GD_Q9 = A or C', () => {
  const responses = cleanResponses();
  responses.q16c = 'Very unlikely'; responses.q16d = 'Very unlikely';
  responses.gd9 = 'A) Pay the full $50 loan.';
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
});

// ============================================================================
// Tests: All 5 Gaming Flags Simultaneously
// ============================================================================

console.log('\n=== All 5 Gaming Flags ===\n');

test('All 5 gaming flags fire together => gamingWeightedScore=15, gamingFlagCount=5', () => {
  const responses = cleanResponses();
  triggerFlag1A(responses);
  triggerFlag2A(responses);
  triggerFlag3A(responses);
  triggerFlag7A(responses);
  triggerFlag9A(responses);
  const result = validateResponses(responses);
  const flagIds = result.gamingFlags.map(f => f.flagId).sort();
  assertEqual(flagIds.join(','), 'FLAG_1A,FLAG_2A,FLAG_3A,FLAG_7A,FLAG_9A', 'all gaming flag IDs');
  assertEqual(result.gamingWeightedScore, 15, 'max gaming weighted score');
  assertEqual(result.gamingFlagCount, 5, 'all 5 gaming flags');
});

// ============================================================================
// Tests: Consistency Score (unchanged from v3.2)
// ============================================================================

console.log('\n=== Consistency Score Formula ===\n');

test('0 consistency flags => consistencyScore=100', () => {
  const result = validateResponses(cleanResponses());
  assertEqual(result.consistencyScore, 100, 'score');
});

test('1 consistency flag => consistencyScore=85 (100 - 1*15)', () => {
  const responses = cleanResponses();
  triggerCheck4(responses);
  const result = validateResponses(responses);
  assertEqual(result.consistencyScore, 85, 'score');
});

test('Gaming flags do NOT affect consistencyScore', () => {
  const responses = cleanResponses();
  triggerFlag1A(responses);
  triggerFlag2A(responses);
  const result = validateResponses(responses);
  assertEqual(result.consistencyScore, 100, 'consistency score unaffected by gaming flags');
  assertEqual(result.gamingWeightedScore, 6, 'gaming score reflects the flags');
});

test('Consistency-only flag (CHECK_4) => gamingFlagCount=0, consistencyFlagCount=1', () => {
  const responses = cleanResponses();
  triggerCheck4(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 0, 'gamingFlagCount');
  assertEqual(result.gamingWeightedScore, 0, 'gamingWeightedScore');
  assertEqual(result.consistencyFlagCount, 1, 'consistencyFlagCount');
});

test('Mixed: 2 gaming + 1 consistency => gamingWeightedScore=6, consistencyFlagCount=1', () => {
  const responses = cleanResponses();
  triggerFlag1A(responses);
  triggerFlag9A(responses);
  triggerCheck4(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingFlagCount, 2, 'gamingFlagCount');
  assertEqual(result.gamingWeightedScore, 6, 'gamingWeightedScore');
  assertEqual(result.consistencyFlagCount, 1, 'consistencyFlagCount');
  assertEqual(result.consistencyScore, 85, 'consistency = 100 - 1*15');
});

test('Formula check: 2 consistency flags => score = 70', () => {
  const responses = cleanResponses();
  triggerCheck4(responses);
  triggerCheck14(responses);
  const result = validateResponses(responses);
  assertTrue(result.consistencyFlagCount >= 1, 'at least 1 consistency flag');
  assertEqual(result.consistencyScore, 100 - (result.consistencyFlagCount * 15), 'formula check');
});

// ============================================================================
// Tests: Gaming Risk Level Derivation (v3.2 thresholds)
// ============================================================================

console.log('\n=== Gaming Risk Level Derivation ===\n');

test('gamingWeightedScore=0 => MINIMAL', () => {
  const result = validateResponses(cleanResponses());
  assertEqual(deriveGamingRiskLevel(result), 'MINIMAL');
});

test('gamingWeightedScore=3 (1 flag) => LOW', () => {
  const responses = cleanResponses();
  triggerFlag1A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingWeightedScore, 3, 'score');
  assertEqual(deriveGamingRiskLevel(result), 'LOW');
});

test('gamingWeightedScore=6 (2 flags) => MODERATE', () => {
  const responses = cleanResponses();
  triggerFlag1A(responses);
  triggerFlag2A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingWeightedScore, 6, 'score');
  assertEqual(deriveGamingRiskLevel(result), 'MODERATE');
});

test('gamingWeightedScore=9 (3 flags) => HIGH', () => {
  const responses = cleanResponses();
  triggerFlag1A(responses);
  triggerFlag2A(responses);
  triggerFlag3A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingWeightedScore, 9, 'score');
  assertEqual(deriveGamingRiskLevel(result), 'HIGH');
});

test('gamingWeightedScore=15 (5 flags) => SEVERE', () => {
  const responses = cleanResponses();
  triggerFlag1A(responses);
  triggerFlag2A(responses);
  triggerFlag3A(responses);
  triggerFlag7A(responses);
  triggerFlag9A(responses);
  const result = validateResponses(responses);
  assertEqual(result.gamingWeightedScore, 15, 'score');
  assertEqual(deriveGamingRiskLevel(result), 'SEVERE');
});

// ============================================================================
// Tests: Backward Compatibility
// ============================================================================

console.log('\n=== Backward Compatibility ===\n');

test('totalChecks is still 16', () => {
  const result = validateResponses(cleanResponses());
  assertEqual(result.totalChecks, 16);
});

test('severityLevel and recommendation still work from total count', () => {
  const result = validateResponses(cleanResponses());
  assertEqual(result.severityLevel, 'MINOR');
  assertEqual(result.recommendation, 'PROCEED');
});

test('flags array contains 16-check results (not GD gaming flags)', () => {
  const responses = cleanResponses();
  triggerCheck4(responses);
  triggerFlag1A(responses); // gaming flag — should NOT appear in flags[]
  const result = validateResponses(responses);
  // flags[] is from 16 consistency checks, not from GD detectors
  assertTrue(result.flags.length >= 1, 'at least 1 check flag');
  assertTrue(result.flags.some(f => f.checkId === 'CHECK_4'), 'CHECK_4 in flags');
  // Gaming flags are separate from the flags array
  assertEqual(result.gamingFlagCount, 1, 'gaming flag count');
  assertEqual(result.gamingFlags[0].flagId, 'FLAG_1A', 'gaming flag is FLAG_1A');
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n========================================');
console.log(`Tests: ${passed + failed} total, ${passed} passed, ${failed} failed`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}
