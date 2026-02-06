/**
 * Unit Tests for Reliability and FinPsych Score Calculation
 *
 * Run with: npx ts-node src/tests/reliability.test.ts
 *
 * Tests:
 * 1. round1 utility function
 * 2. Reliability mapping from gaming risk
 * 3. Legacy label normalization ("GOOD" -> HIGH)
 * 4. FinPsych calculation with consistency adjustments
 * 5. QA scenarios (Perfect Scorer, Gaming Suspected, Moderate)
 */

import {
  round1,
  getReliabilityFromGamingRisk,
  getFinPsychWeights,
  calculateFinPsychScore,
} from '../reliability';

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
// Tests: round1 utility
// ============================================================================

console.log('\n=== round1 utility ===\n');

test('round1 rounds to 1 decimal place (up)', () => {
  assertEqual(round1(87.567), 87.6, 'rounds up');
});

test('round1 rounds to 1 decimal place (down)', () => {
  assertEqual(round1(87.543), 87.5, 'rounds down');
});

test('round1 handles whole numbers', () => {
  assertEqual(round1(100), 100, 'whole numbers');
});

test('round1 handles edge case 0.5 rounding', () => {
  assertEqual(round1(67.75), 67.8, 'rounds 0.75 up');
  assertEqual(round1(67.74), 67.7, 'rounds 0.74 down');
});

// ============================================================================
// Tests: Reliability mapping
// ============================================================================

console.log('\n=== Reliability Mapping ===\n');

test('MINIMAL gaming risk => HIGH reliability', () => {
  const result = getReliabilityFromGamingRisk('MINIMAL');
  assertEqual(result?.level, 'HIGH');
  assertEqual(result?.label, 'HIGH');
});

test('LOW gaming risk => MODERATE_HIGH reliability', () => {
  const result = getReliabilityFromGamingRisk('LOW');
  assertEqual(result?.level, 'MODERATE_HIGH');
  assertEqual(result?.label, 'MODERATE-HIGH');
});

test('MODERATE gaming risk => MODERATE reliability', () => {
  const result = getReliabilityFromGamingRisk('MODERATE');
  assertEqual(result?.level, 'MODERATE');
  assertEqual(result?.label, 'MODERATE');
});

test('HIGH gaming risk => LOW reliability', () => {
  const result = getReliabilityFromGamingRisk('HIGH');
  assertEqual(result?.level, 'LOW');
  assertEqual(result?.label, 'LOW');
});

test('SEVERE gaming risk => VERY_LOW reliability', () => {
  const result = getReliabilityFromGamingRisk('SEVERE');
  assertEqual(result?.level, 'VERY_LOW');
  assertEqual(result?.label, 'VERY LOW');
});

// ============================================================================
// Tests: Legacy label normalization
// ============================================================================

console.log('\n=== Legacy Label Normalization ===\n');

test('Normalizes "GOOD" to HIGH reliability', () => {
  const result = getReliabilityFromGamingRisk('GOOD');
  assertEqual(result?.level, 'HIGH');
});

test('Normalizes "EXCELLENT" to HIGH reliability', () => {
  const result = getReliabilityFromGamingRisk('EXCELLENT');
  assertEqual(result?.level, 'HIGH');
});

test('Normalizes "FLAGGED" to LOW reliability', () => {
  const result = getReliabilityFromGamingRisk('FLAGGED');
  assertEqual(result?.level, 'LOW');
});

test('Normalizes "POOR" to VERY_LOW reliability', () => {
  const result = getReliabilityFromGamingRisk('POOR');
  assertEqual(result?.level, 'VERY_LOW');
});

test('Handles lowercase input', () => {
  const result = getReliabilityFromGamingRisk('minimal');
  assertEqual(result?.level, 'HIGH');
});

// ============================================================================
// Tests: FinPsych Weights
// ============================================================================

console.log('\n=== FinPsych Weights ===\n');

test('HIGH reliability weights: 50/50', () => {
  const weights = getFinPsychWeights('HIGH');
  assertEqual(weights.cwi, 0.50);
  assertEqual(weights.nci, 0.50);
});

test('MODERATE_HIGH reliability weights: 45/55', () => {
  const weights = getFinPsychWeights('MODERATE_HIGH');
  assertEqual(weights.cwi, 0.45);
  assertEqual(weights.nci, 0.55);
});

test('MODERATE reliability weights: 35/65', () => {
  const weights = getFinPsychWeights('MODERATE');
  assertEqual(weights.cwi, 0.35);
  assertEqual(weights.nci, 0.65);
});

test('LOW reliability weights: 25/75', () => {
  const weights = getFinPsychWeights('LOW');
  assertEqual(weights.cwi, 0.25);
  assertEqual(weights.nci, 0.75);
});

test('VERY_LOW reliability weights: 15/85', () => {
  const weights = getFinPsychWeights('VERY_LOW');
  assertEqual(weights.cwi, 0.15);
  assertEqual(weights.nci, 0.85);
});

// ============================================================================
// Tests: FinPsych Calculation
// ============================================================================

console.log('\n=== FinPsych Calculation ===\n');

test('FinPsych calculation with HIGH reliability (MINIMAL gaming)', () => {
  // CWI=80, NCI=90, MINIMAL gaming, consistency=100
  const result = calculateFinPsychScore(80, 90, 'MINIMAL', 100);
  // Weights: cwi=0.50, nci=0.50
  // FinPsych = (80 * 0.50) + (90 * 0.50) = 40 + 45 = 85
  assertEqual(result?.score, 85);
  assertEqual(result?.reliability, 'HIGH');
});

test('FinPsych calculation with MODERATE_HIGH reliability (LOW gaming)', () => {
  // CWI=70, NCI=80, LOW gaming, consistency=80
  const result = calculateFinPsychScore(70, 80, 'LOW', 80);
  // Weights: cwi=0.45, nci=0.55
  // FinPsych = (70 * 0.45) + (80 * 0.55) = 31.5 + 44 = 75.5
  assertEqual(result?.score, 75.5);
  assertEqual(result?.reliability, 'MODERATE_HIGH');
});

// ============================================================================
// Tests: Consistency Score Adjustments
// ============================================================================

console.log('\n=== Consistency Score Adjustments ===\n');

test('Low consistency (<65) forces VERY_LOW reliability', () => {
  // CWI=90, NCI=90, MINIMAL gaming, but consistency=60
  const result = calculateFinPsychScore(90, 90, 'MINIMAL', 60);
  // Consistency < 65 => reliability = VERY_LOW
  // Weights: cwi=0.15, nci=0.85
  // FinPsych = (90 * 0.15) + (90 * 0.85) = 13.5 + 76.5 = 90
  assertEqual(result?.reliability, 'VERY_LOW');
  assertEqual(result?.score, 90);
});

test('Medium consistency (65-74) forces LOW reliability', () => {
  // CWI=90, NCI=90, MINIMAL gaming, but consistency=70
  const result = calculateFinPsychScore(90, 90, 'MINIMAL', 70);
  // Consistency 65-74 => reliability = LOW
  // Weights: cwi=0.25, nci=0.75
  // FinPsych = (90 * 0.25) + (90 * 0.75) = 22.5 + 67.5 = 90
  assertEqual(result?.reliability, 'LOW');
  assertEqual(result?.score, 90);
});

test('High consistency (>=75) keeps base reliability', () => {
  // CWI=90, NCI=90, MINIMAL gaming, consistency=80
  const result = calculateFinPsychScore(90, 90, 'MINIMAL', 80);
  // Consistency >= 75 => keep base reliability (HIGH)
  assertEqual(result?.reliability, 'HIGH');
});

test('Null consistency does not affect reliability', () => {
  // CWI=90, NCI=90, MINIMAL gaming, consistency=null
  const result = calculateFinPsychScore(90, 90, 'MINIMAL', null);
  // No consistency adjustment => keep base reliability (HIGH)
  assertEqual(result?.reliability, 'HIGH');
  assertEqual(result?.score, 90);
});

// ============================================================================
// Tests: QA Scenarios
// ============================================================================

console.log('\n=== QA Scenarios ===\n');

test('QA Scenario 1: Perfect Scorer - CWI=100, NCI=100 => FinPsych=100, HIGH', () => {
  const result = calculateFinPsychScore(100, 100, 'MINIMAL', 100);
  // Weights: cwi=0.50, nci=0.50
  // FinPsych = (100 * 0.50) + (100 * 0.50) = 50 + 50 = 100
  assertEqual(result?.score, 100);
  assertEqual(result?.reliability, 'HIGH');
});

test('QA Scenario 2: Gaming Suspected - CWI=100, NCI=30, SEVERE => FinPsych=40.5', () => {
  const result = calculateFinPsychScore(100, 30, 'SEVERE', 30);
  // Base reliability from SEVERE = VERY_LOW
  // Consistency 30 < 65 => reliability stays VERY_LOW
  // Weights: cwi=0.15, nci=0.85
  // FinPsych = (100 * 0.15) + (30 * 0.85) = 15 + 25.5 = 40.5
  assertEqual(result?.score, 40.5);
  assertEqual(result?.reliability, 'VERY_LOW');
});

test('QA Scenario 3: Moderate Performer - CWI=65, NCI=70, LOW gaming, 80 consistency', () => {
  const result = calculateFinPsychScore(65, 70, 'LOW', 80);
  // Base reliability from LOW = MODERATE_HIGH
  // Consistency 80 >= 75 => keep base reliability
  // Weights: cwi=0.45, nci=0.55
  // FinPsych = (65 * 0.45) + (70 * 0.55) = 29.25 + 38.5 = 67.75 => round1 = 67.8
  assertEqual(result?.score, 67.8);
  assertEqual(result?.reliability, 'MODERATE_HIGH');
});

// ============================================================================
// Tests: Edge Cases
// ============================================================================

console.log('\n=== Edge Cases ===\n');

test('Null CWI returns null', () => {
  assertEqual(calculateFinPsychScore(null, 100, 'MINIMAL', 100), null);
});

test('Null NCI returns null', () => {
  assertEqual(calculateFinPsychScore(100, null, 'MINIMAL', 100), null);
});

test('Null gaming risk level with null consistency uses MODERATE', () => {
  const result = calculateFinPsychScore(80, 80, null, null);
  // No gaming risk => default MODERATE
  // No consistency => no adjustment
  assertEqual(result?.reliability, 'MODERATE');
});

test('Unknown gaming risk level uses MODERATE', () => {
  const result = calculateFinPsychScore(80, 80, 'UNKNOWN', null);
  assertEqual(result?.reliability, 'MODERATE');
});

test('Null reliability from null input', () => {
  assertEqual(getReliabilityFromGamingRisk(null), null);
  assertEqual(getReliabilityFromGamingRisk(undefined), null);
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
