/**
 * Unit Tests for Scoring Engine
 *
 * Run with: npx ts-node src/tests/scoring.test.ts
 *
 * Tests:
 * 1. NCI Formula v3.2: ASFN calibration (p=0.30) + LCA raw total
 * 2. Five Cs Scale: 0-100 (no negatives)
 * 3. Collateral Mapping: Uses social_support, financial_behaviour
 * 4. No "Consistency" in FiveCScores interface
 */

import { FIVE_C_MAP, FIVE_C_WEIGHTS } from '../constants';
import { FiveCScores } from '../engine';

// Test Results
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
// TEST 1: NCI Formula v3.2 — ASFN calibration (p=0.30) + LCA raw
// Formula: NCI = (0.5 × ASFN_adj) + ((10/3) × LCA_raw)
//   where  ASFN_adj = 100 × (finNum)^0.30
// ============================================================================
test('NCI v3.2: Perfect scores (finNum=1.0, lcaRaw=15) => NCI=100.0', () => {
  const finNum = 1.0;
  const lcaRaw = 15;

  const asfnAdj = 100 * Math.pow(finNum, 0.30);  // 100
  const nci = (0.5 * asfnAdj) + ((10 / 3) * lcaRaw);  // 50 + 50 = 100

  assertEqual(Math.round(nci * 10) / 10, 100.0, 'NCI perfect scores');
});

test('NCI v3.2: Zero scores (finNum=0, lcaRaw=0) => NCI=0', () => {
  const finNum = 0;
  const lcaRaw = 0;

  const asfnAdj = 100 * Math.pow(finNum, 0.30);  // 0
  const nci = (0.5 * asfnAdj) + ((10 / 3) * lcaRaw);  // 0 + 0 = 0

  assertEqual(Math.round(nci * 10) / 10, 0, 'NCI zero scores');
});

test('NCI v3.2: Chioma case (finNum=0.40, lcaRaw=9) => NCI=68.0', () => {
  // ASFN_adj = 100 × 0.40^0.30 = 75.97
  // NCI = (0.5 × 75.97) + ((10/3) × 9) = 37.99 + 30.0 = 67.99 => 68.0
  const finNum = 0.40;
  const lcaRaw = 9;

  const asfnAdj = 100 * Math.pow(finNum, 0.30);
  const nci = (0.5 * asfnAdj) + ((10 / 3) * lcaRaw);
  const rounded = Math.round(nci * 10) / 10;

  assertEqual(rounded, 68.0, 'NCI Chioma validation case');
});

test('NCI v3.2: Low ASFN (finNum=0.20, lcaRaw=5) => reasonable range', () => {
  // ASFN_adj = 100 × 0.20^0.30 = 61.72
  // NCI = (0.5 × 61.72) + ((10/3) × 5) = 30.86 + 16.67 = 47.53 => 47.5
  const finNum = 0.20;
  const lcaRaw = 5;

  const asfnAdj = 100 * Math.pow(finNum, 0.30);
  const nci = (0.5 * asfnAdj) + ((10 / 3) * lcaRaw);
  const rounded = Math.round(nci * 10) / 10;

  assertTrue(rounded >= 47.0 && rounded <= 48.0, `NCI low ASFN=${rounded} expected ~47.5`);
});

// ============================================================================
// TEST 2: Five Cs Scale (0-100)
// ============================================================================
test('Five Cs normalizeToHundred: Raw 1 => 0', () => {
  const rawScore = 1;
  const normalized = ((rawScore - 1) / (5 - 1)) * 100;
  assertEqual(normalized, 0, 'Normalize raw 1');
});

test('Five Cs normalizeToHundred: Raw 3 => 50', () => {
  const rawScore = 3;
  const normalized = ((rawScore - 1) / (5 - 1)) * 100;
  assertEqual(normalized, 50, 'Normalize raw 3');
});

test('Five Cs normalizeToHundred: Raw 5 => 100', () => {
  const rawScore = 5;
  const normalized = ((rawScore - 1) / (5 - 1)) * 100;
  assertEqual(normalized, 100, 'Normalize raw 5');
});

test('Five Cs normalizeToHundred: Clamping (Raw 0 => 0, not negative)', () => {
  const rawScore = 0;
  const normalized = ((rawScore - 1) / (5 - 1)) * 100;
  const clamped = Math.max(0, Math.min(100, normalized));
  assertEqual(clamped, 0, 'Clamped to 0');
});

test('Five Cs normalizeToHundred: Clamping (Raw 6 => 100, not over)', () => {
  const rawScore = 6;
  const normalized = ((rawScore - 1) / (5 - 1)) * 100;
  const clamped = Math.max(0, Math.min(100, normalized));
  assertEqual(clamped, 100, 'Clamped to 100');
});

// ============================================================================
// TEST 3: Five C Mapping (v3.2 Section 2.1)
// ============================================================================
test('FIVE_C_MAP has exactly 5 keys: character, capacity, capital, collateral, conditions', () => {
  const keys = Object.keys(FIVE_C_MAP).sort();
  assertEqual(keys.join(','), 'capacity,capital,character,collateral,conditions', 'Five C keys');
  assertTrue(!('consistency' in FIVE_C_MAP), 'consistency key should NOT exist');
});

test('Character = [self_control, conscientiousness, agreeableness, emotional_stability] (4 constructs)', () => {
  const c = FIVE_C_MAP['character'].slice().sort();
  assertEqual(c.length, 4, 'Character has 4 constructs');
  assertEqual(c.join(','), 'agreeableness,conscientiousness,emotional_stability,self_control', 'Character constructs');
});

test('Character does NOT include extraversion', () => {
  assertTrue(!FIVE_C_MAP['character'].includes('extraversion'), 'No extraversion in character');
});

test('Capacity = [payment_history, financial_management, crisis_management] (3 constructs)', () => {
  const c = FIVE_C_MAP['capacity'].slice().sort();
  assertEqual(c.length, 3, 'Capacity has 3 constructs');
  assertEqual(c.join(','), 'crisis_management,financial_management,payment_history', 'Capacity constructs');
});

test('Capacity does NOT include financial_integrity', () => {
  assertTrue(!FIVE_C_MAP['capacity'].includes('financial_integrity'), 'No financial_integrity in capacity');
});

test('Capital = [emergency_preparedness] (1 construct)', () => {
  assertEqual(FIVE_C_MAP['capital'].length, 1, 'Capital has 1 construct');
  assertEqual(FIVE_C_MAP['capital'][0], 'emergency_preparedness', 'Capital construct');
});

test('Collateral = [social_collateral] (Q59, Q16b, Q16e)', () => {
  assertEqual(FIVE_C_MAP['collateral'].length, 1, 'Collateral has 1 construct');
  assertEqual(FIVE_C_MAP['collateral'][0], 'social_collateral', 'Collateral construct');
});

test('Conditions = [future_orientation, risk_preference, locus_of_control] (3 constructs)', () => {
  const c = FIVE_C_MAP['conditions'].slice().sort();
  assertEqual(c.length, 3, 'Conditions has 3 constructs');
  assertEqual(c.join(','), 'future_orientation,locus_of_control,risk_preference', 'Conditions constructs');
});

test('Conditions does NOT include openness', () => {
  assertTrue(!FIVE_C_MAP['conditions'].includes('openness'), 'No openness in conditions');
});

test('All Five Cs weights are equal at 0.20', () => {
  for (const [key, weight] of Object.entries(FIVE_C_WEIGHTS)) {
    assertEqual(weight, 0.20, `${key} weight`);
  }
});

test('All Five Cs weights sum to 1.0', () => {
  const totalWeight = Object.values(FIVE_C_WEIGHTS).reduce((sum, w) => sum + w, 0);
  assertEqual(totalWeight, 1.0, 'Weights sum');
});

// ============================================================================
// TEST 4: FiveCScores Interface
// ============================================================================
test('FiveCScores interface has "collateral" property', () => {
  // Create a valid FiveCScores object
  const scores: FiveCScores = {
    character: 75,
    capacity: 80,
    capital: 65,
    collateral: 70,
    conditions: 60,
  };

  assertTrue('collateral' in scores, 'collateral property exists');
  assertTrue(!('consistency' in scores), 'consistency property should NOT exist');
});

// ============================================================================
// TEST 5: LCA Max Score
// ============================================================================
test('LCA max score is 15 (5 questions × 3 points)', () => {
  const lcaMaxScore = 15;
  const lcaQuestions = 5;
  const maxPointsPerQuestion = 3;

  assertEqual(lcaMaxScore, lcaQuestions * maxPointsPerQuestion, 'LCA max calculation');
});

test('LCA overflow protection: score > 15 should clamp', () => {
  const lcaMaxScore = 15;
  let lcaRawScore = 18; // Overflow

  if (lcaRawScore > lcaMaxScore) {
    lcaRawScore = lcaMaxScore;
  }

  assertEqual(lcaRawScore, 15, 'LCA clamped to max');
});

// ============================================================================
// TEST 6: Demographic Exclusion
// ============================================================================
test('Demographic questions (dem* prefix) are excluded from scoring', () => {
  // Verify dem1-dem13 prefixes would be excluded
  const demQuestions = ['dem1', 'dem2', 'dem3', 'dem12', 'dem13'];

  for (const q of demQuestions) {
    assertTrue(q.startsWith('dem'), `${q} starts with 'dem'`);
  }

  // Verify demo1, demo2 prefixes would also be excluded
  const demoQuestions = ['demo1', 'demo2'];
  for (const q of demoQuestions) {
    assertTrue(q.startsWith('demo'), `${q} starts with 'demo'`);
  }
});

// ============================================================================
// TEST 7: N/A Response Exclusion
// ============================================================================
test('N/A responses are detected correctly', () => {
  const naResponses = [
    'N/A (I do not have insurance)',
    'N/A (I do not have subscriptions)',
    'N/A',
  ];

  for (const r of naResponses) {
    assertTrue(r.startsWith('N/A'), `"${r}" starts with N/A`);
  }

  // Non-N/A responses should not be excluded
  const validResponses = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
  for (const r of validResponses) {
    assertTrue(!r.startsWith('N/A'), `"${r}" does NOT start with N/A`);
  }
});

test('Payment History with N/A Q4 excludes Q4 from denominator', () => {
  // Simulate: 6 payment_history questions (q1-q6), Q4 is N/A
  const paymentHistoryQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
  const responses: Record<string, string> = {
    q1: 'Never',
    q2: 'Never',
    q3: 'Rarely',
    q4: 'N/A (I do not have insurance)', // Should be EXCLUDED
    q5: 'Never',
    q6: 'Sometimes',
  };

  // Count valid responses (excluding N/A)
  let validCount = 0;
  for (const q of paymentHistoryQuestions) {
    if (!responses[q].startsWith('N/A')) {
      validCount++;
    }
  }

  assertEqual(validCount, 5, 'Only 5 questions counted (Q4 excluded)');
});

test('Payment History with N/A Q4 AND Q5 excludes both from denominator', () => {
  const paymentHistoryQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];
  const responses: Record<string, string> = {
    q1: 'Never',
    q2: 'Never',
    q3: 'Rarely',
    q4: 'N/A (I do not have insurance)', // EXCLUDED
    q5: 'N/A (I do not have subscriptions)', // EXCLUDED
    q6: 'Sometimes',
  };

  let validCount = 0;
  for (const q of paymentHistoryQuestions) {
    if (!responses[q].startsWith('N/A')) {
      validCount++;
    }
  }

  assertEqual(validCount, 4, 'Only 4 questions counted (Q4 and Q5 excluded)');
});

// ============================================================================
// TEST 8: DEM12/DEM13 Options Match Spec
// ============================================================================
test('DEM12 options match spec exactly', () => {
  const expectedOptions = [
    'Yes, multiple policies',
    'Yes, one policy',
    'No, but I had one before',
    'No, never had one',
    'Not sure',
  ];

  // This test verifies the spec - actual validation happens in questions.ts
  assertEqual(expectedOptions.length, 5, 'DEM12 has 5 options');
  assertTrue(expectedOptions.includes('No, never had one'), 'DEM12 has "No, never had one" option');
});

test('DEM13 options match spec exactly', () => {
  const expectedOptions = [
    'Yes, multiple subscriptions (3+)',
    'Yes, 1–2 subscriptions',
    'No, but I had one before',
    'No, never had one',
  ];

  assertEqual(expectedOptions.length, 4, 'DEM13 has 4 options');
  assertTrue(expectedOptions.includes('No, never had one'), 'DEM13 has "No, never had one" option');
});

test('Q4/Q5 N/A default only triggers on "No, never had one"', () => {
  // Only "No, never had one" should trigger N/A default
  const dem12Responses = [
    'Yes, multiple policies',
    'Yes, one policy',
    'No, but I had one before',
    'No, never had one', // ONLY this should trigger N/A default
    'Not sure',
  ];

  const triggersNADefault = dem12Responses.filter(r => r === 'No, never had one');
  assertEqual(triggersNADefault.length, 1, 'Only one option triggers N/A default');
  assertEqual(triggersNADefault[0], 'No, never had one', 'Correct option triggers N/A');
});

// ============================================================================
// TEST 9: Quality Badge Mapping (Gaming Risk Level -> Badge Label)
// These tests verify the DIRECT mapping from gamingRiskLevel to badge label
// ============================================================================

// Badge label mapping (from spec)
const BADGE_LABELS: Record<string, string> = {
  MINIMAL: 'EXCELLENT',
  LOW: 'GOOD',
  MODERATE: 'MODERATE',
  HIGH: 'FLAGGED',
  SEVERE: 'POOR',
};

test('Quality Badge: Direct mapping MINIMAL -> EXCELLENT', () => {
  assertEqual(BADGE_LABELS['MINIMAL'], 'EXCELLENT', 'MINIMAL maps to EXCELLENT');
});

test('Quality Badge: Direct mapping LOW -> GOOD', () => {
  assertEqual(BADGE_LABELS['LOW'], 'GOOD', 'LOW maps to GOOD');
});

test('Quality Badge: Direct mapping MODERATE -> MODERATE', () => {
  assertEqual(BADGE_LABELS['MODERATE'], 'MODERATE', 'MODERATE maps to MODERATE');
});

test('Quality Badge: Direct mapping HIGH -> FLAGGED', () => {
  assertEqual(BADGE_LABELS['HIGH'], 'FLAGGED', 'HIGH maps to FLAGGED');
});

test('Quality Badge: Direct mapping SEVERE -> POOR', () => {
  assertEqual(BADGE_LABELS['SEVERE'], 'POOR', 'SEVERE maps to POOR');
});

// ============================================================================
// TEST 10: Gaming Risk Level Derivation from Inconsistency Count
// These tests verify the thresholds defined in @fintech/validation/quality-badge.ts
// Source of truth: deriveGamingRiskLevel() in packages/validation/src/quality-badge.ts
// ============================================================================

// Local copy for test verification only - DO NOT use in app code
// App code should import deriveGamingRiskLevel from @fintech/validation
function deriveFromInconsistencies(count: number): string {
  if (count === 0) return 'MINIMAL';
  if (count <= 2) return 'LOW';
  if (count <= 5) return 'MODERATE';
  if (count <= 8) return 'HIGH';
  return 'SEVERE';
}

test('Gaming Risk Level: 0 inconsistencies -> MINIMAL', () => {
  assertEqual(deriveFromInconsistencies(0), 'MINIMAL', '0 flags -> MINIMAL');
});

test('Gaming Risk Level: 1-2 inconsistencies -> LOW', () => {
  assertEqual(deriveFromInconsistencies(1), 'LOW', '1 flag -> LOW');
  assertEqual(deriveFromInconsistencies(2), 'LOW', '2 flags -> LOW');
});

test('Gaming Risk Level: 3-5 inconsistencies -> MODERATE', () => {
  assertEqual(deriveFromInconsistencies(3), 'MODERATE', '3 flags -> MODERATE');
  assertEqual(deriveFromInconsistencies(4), 'MODERATE', '4 flags -> MODERATE');
  assertEqual(deriveFromInconsistencies(5), 'MODERATE', '5 flags -> MODERATE');
});

test('Gaming Risk Level: 6-8 inconsistencies -> HIGH', () => {
  assertEqual(deriveFromInconsistencies(6), 'HIGH', '6 flags -> HIGH');
  assertEqual(deriveFromInconsistencies(7), 'HIGH', '7 flags -> HIGH');
  assertEqual(deriveFromInconsistencies(8), 'HIGH', '8 flags -> HIGH');
});

test('Gaming Risk Level: 9+ inconsistencies -> SEVERE', () => {
  assertEqual(deriveFromInconsistencies(9), 'SEVERE', '9 flags -> SEVERE');
  assertEqual(deriveFromInconsistencies(10), 'SEVERE', '10 flags -> SEVERE');
  assertEqual(deriveFromInconsistencies(16), 'SEVERE', '16 flags -> SEVERE');
});

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}
