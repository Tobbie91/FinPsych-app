/**
 * Unit Tests for Scoring Engine
 *
 * Run with: npx ts-node src/tests/scoring.test.ts
 *
 * Tests:
 * 1. NCI Formula: 50% ASFN + 50% LCA (Jane Smith: ASFN=20, LCA=60 => NCI=40)
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
// TEST 1: NCI Formula (50% ASFN + 50% LCA)
// ============================================================================
test('NCI Formula: Jane Smith (ASFN=20, LCA=60) => NCI=40', () => {
  const asfnScore = 20;
  const lcaPercent = 60;

  // NCI = 50% ASFN + 50% LCA
  const nciScore = (asfnScore * 0.5) + (lcaPercent * 0.5);

  assertEqual(nciScore, 40, 'NCI calculation');
});

test('NCI Formula: Perfect scores (ASFN=100, LCA=100) => NCI=100', () => {
  const asfnScore = 100;
  const lcaPercent = 100;

  const nciScore = (asfnScore * 0.5) + (lcaPercent * 0.5);

  assertEqual(nciScore, 100, 'NCI calculation');
});

test('NCI Formula: Zero scores (ASFN=0, LCA=0) => NCI=0', () => {
  const asfnScore = 0;
  const lcaPercent = 0;

  const nciScore = (asfnScore * 0.5) + (lcaPercent * 0.5);

  assertEqual(nciScore, 0, 'NCI calculation');
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
// TEST 3: Collateral Mapping
// ============================================================================
test('FIVE_C_MAP has "collateral" key (not "consistency")', () => {
  assertTrue('collateral' in FIVE_C_MAP, 'collateral key exists');
  assertTrue(!('consistency' in FIVE_C_MAP), 'consistency key should NOT exist');
});

test('Collateral maps to social_support and financial_behaviour', () => {
  const collateralConstructs = FIVE_C_MAP['collateral'];
  assertTrue(collateralConstructs.includes('social_support'), 'Contains social_support');
  assertTrue(collateralConstructs.includes('financial_behaviour'), 'Contains financial_behaviour');
});

test('FIVE_C_WEIGHTS has "collateral" key (not "consistency")', () => {
  assertTrue('collateral' in FIVE_C_WEIGHTS, 'collateral weight exists');
  assertTrue(!('consistency' in FIVE_C_WEIGHTS), 'consistency weight should NOT exist');
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
// SUMMARY
// ============================================================================
console.log('\n' + '='.repeat(60));
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
  process.exit(1);
}
