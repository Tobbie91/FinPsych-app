/**
 * Unit Tests for Reliability and FinPsych Score Calculation
 *
 * Run with: npx ts-node src/tests/reliability.test.ts
 *
 * Tests:
 * 1. round1 utility function
 * 2. Reliability mapping from gaming risk
 * 3. Legacy label normalization ("GOOD" -> HIGH)
 * 4. FinPsych v3.2 adaptive weighting via inverse-variance (Eq. 5-14)
 * 5. QA scenarios (Perfect Scorer, Gaming Suspected, Moderate)
 * 6. Guide validation scenarios (5 reference cases)
 */

import {
  round1,
  getReliabilityFromGamingRisk,
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

function assertApprox(actual: number, expected: number, tolerance: number, message?: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message || 'Approx assertion failed'}: Expected ~${expected}, got ${actual} (tolerance ${tolerance})`);
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
// Tests: Reliability mapping (unchanged — derived from gaming risk only)
// ============================================================================

console.log('\n=== Reliability Mapping ===\n');

test('MINIMAL gaming risk => HIGH reliability (Minimal label)', () => {
  const result = getReliabilityFromGamingRisk('MINIMAL');
  assertEqual(result?.level, 'HIGH');
  assertEqual(result?.label, 'Minimal');
});

test('LOW gaming risk => MODERATE_HIGH reliability (Low label)', () => {
  const result = getReliabilityFromGamingRisk('LOW');
  assertEqual(result?.level, 'MODERATE_HIGH');
  assertEqual(result?.label, 'Low');
});

test('MODERATE gaming risk => MODERATE reliability (Moderate label)', () => {
  const result = getReliabilityFromGamingRisk('MODERATE');
  assertEqual(result?.level, 'MODERATE');
  assertEqual(result?.label, 'Moderate');
});

test('HIGH gaming risk => LOW reliability (High label)', () => {
  const result = getReliabilityFromGamingRisk('HIGH');
  assertEqual(result?.level, 'LOW');
  assertEqual(result?.label, 'High');
});

test('SEVERE gaming risk => VERY_LOW reliability (Severe label)', () => {
  const result = getReliabilityFromGamingRisk('SEVERE');
  assertEqual(result?.level, 'VERY_LOW');
  assertEqual(result?.label, 'Severe');
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
// Tests: FinPsych v3.2 Adaptive Weighting (Inverse-Variance, Eq. 5–14)
// ============================================================================

console.log('\n=== FinPsych v3.2 Adaptive Weighting ===\n');

test('MINIMAL gaming, high consistency => w_cwi=0.50 (equal weighting)', () => {
  // M_gaming=1.0, M_consistency=1.0 (100>=85) => sigma=1.0 => w_cwi=0.50
  const result = calculateFinPsychScore(80, 90, 'MINIMAL', 100);
  assertApprox(result!.weights.cwi, 0.50, 0.01, 'w_cwi');
  assertEqual(result?.score, 85);
  assertEqual(result?.reliability, 'HIGH');
});

test('LOW gaming, moderate consistency => w_cwi≈0.43', () => {
  // M_gaming=1.2, M_consistency=1.1 (80>=65) => sigma=1.32
  // w_cwi = (1/1.32) / (1/1.32 + 1) = 0.431
  const result = calculateFinPsychScore(70, 80, 'LOW', 80);
  assertApprox(result!.weights.cwi, 0.43, 0.02, 'w_cwi');
  assertEqual(result?.reliability, 'MODERATE_HIGH');
});

// ============================================================================
// Tests: Consistency affects WEIGHTS (not reliability label) in v3.2
// ============================================================================

console.log('\n=== Consistency Affects Weights (v3.2) ===\n');

test('Low consistency inflates CWI variance but reliability label stays based on gaming', () => {
  // MINIMAL gaming + consistency=60 => M_gaming=1.0, M_consistency=1.3 (60>=45)
  // sigma=1.3, w_cwi=1/1.3/(1/1.3+1)=0.769/1.769=0.435
  // Reliability label: HIGH (from MINIMAL gaming — NOT overridden by consistency)
  const result = calculateFinPsychScore(90, 90, 'MINIMAL', 60);
  assertEqual(result?.reliability, 'HIGH');
  // With equal CWI/NCI, score is always 90 regardless of weights
  assertEqual(result?.score, 90);
  assertTrue(result!.weights.cwi < 0.50, 'Low consistency should reduce w_cwi below 0.50');
});

test('Very low consistency (<45) uses highest multiplier', () => {
  // MINIMAL gaming + consistency=30 => M_gaming=1.0, M_consistency=1.7
  // sigma=1.7, w_cwi=1/1.7/(1/1.7+1)=0.588/1.588=0.370
  const result = calculateFinPsychScore(80, 60, 'MINIMAL', 30);
  assertEqual(result?.reliability, 'HIGH');
  assertApprox(result!.weights.cwi, 0.37, 0.02, 'w_cwi with very low consistency');
});

test('High consistency (>=85) does not inflate variance', () => {
  // MINIMAL gaming + consistency=90 => M_gaming=1.0, M_consistency=1.0
  // sigma=1.0 => w_cwi=0.50
  const result = calculateFinPsychScore(90, 90, 'MINIMAL', 90);
  assertEqual(result?.reliability, 'HIGH');
  assertApprox(result!.weights.cwi, 0.50, 0.01, 'w_cwi with high consistency');
});

test('Null consistency uses default multiplier (1.0)', () => {
  const result = calculateFinPsychScore(90, 90, 'MINIMAL', null);
  assertEqual(result?.reliability, 'HIGH');
  assertApprox(result!.weights.cwi, 0.50, 0.01, 'w_cwi with null consistency');
  assertEqual(result?.score, 90);
});

// ============================================================================
// Tests: Guide Validation Scenarios (v3.2, approx values)
// ============================================================================

console.log('\n=== Guide Validation Scenarios ===\n');

test('Guide Scenario 1: MINIMAL gaming, cons=90 => w_cwi≈0.50', () => {
  // M_gaming=1.0, M_consistency=1.0 => sigma=1.0 => w_cwi=0.50
  const result = calculateFinPsychScore(70, 80, 'MINIMAL', 90);
  assertApprox(result!.weights.cwi, 0.50, 0.01, 'w_cwi');
});

test('Guide Scenario 2: LOW gaming, cons=75 => w_cwi≈0.43', () => {
  // M_gaming=1.2, M_consistency=1.1 => sigma=1.32 => w_cwi=0.431
  const result = calculateFinPsychScore(70, 80, 'LOW', 75);
  assertApprox(result!.weights.cwi, 0.43, 0.02, 'w_cwi');
});

test('Guide Scenario 3: MODERATE gaming, cons=65 => w_cwi≈0.36', () => {
  // M_gaming=1.6, M_consistency=1.1 => sigma=1.76 => w_cwi=0.362
  const result = calculateFinPsychScore(70, 80, 'MODERATE', 65);
  assertApprox(result!.weights.cwi, 0.36, 0.03, 'w_cwi');
});

test('Guide Scenario 4: HIGH gaming, cons=55 => w_cwi≈0.26', () => {
  // M_gaming=2.2, M_consistency=1.3 => sigma=2.86 => w_cwi=0.259
  const result = calculateFinPsychScore(70, 80, 'HIGH', 55);
  assertApprox(result!.weights.cwi, 0.26, 0.02, 'w_cwi');
});

test('Guide Scenario 5: SEVERE gaming, cons=40 => w_cwi=0.25 (variance ceiling fix)', () => {
  // M_gaming=3.0, M_consistency=1.7 => sigma=5.1 => CAPPED to 3.0
  // w_cwi = (1/3) / (1/3 + 1) = 0.25
  // This is the key bug fix: old table gave w_cwi=0.15, formula gives 0.25
  const result = calculateFinPsychScore(100, 30, 'SEVERE', 40);
  assertApprox(result!.weights.cwi, 0.25, 0.01, 'w_cwi (variance ceiling)');
  assertApprox(result!.weights.nci, 0.75, 0.01, 'w_nci (variance ceiling)');
  assertEqual(result?.reliability, 'VERY_LOW');
});

// ============================================================================
// Tests: QA Scenarios (updated for v3.2 weights)
// ============================================================================

console.log('\n=== QA Scenarios ===\n');

test('QA Scenario 1: Perfect Scorer - CWI=100, NCI=100 => FinPsych=100, HIGH', () => {
  // M_gaming=1.0, M_consistency=1.0 => w_cwi=0.50
  const result = calculateFinPsychScore(100, 100, 'MINIMAL', 100);
  assertEqual(result?.score, 100);
  assertEqual(result?.reliability, 'HIGH');
});

test('QA Scenario 2: Gaming Suspected - CWI=100, NCI=30, SEVERE, cons=30', () => {
  // M_gaming=3.0, M_consistency=1.7 => sigma=5.1 => CAPPED 3.0 => w_cwi=0.25
  // FinPsych = (100*0.25) + (30*0.75) = 25 + 22.5 = 47.5
  // OLD was 40.5 (w_cwi=0.15) — this is the key fix
  const result = calculateFinPsychScore(100, 30, 'SEVERE', 30);
  assertEqual(result?.score, 47.5);
  assertEqual(result?.reliability, 'VERY_LOW');
});

test('QA Scenario 3: Moderate Performer - CWI=65, NCI=70, LOW gaming, cons=80', () => {
  // M_gaming=1.2, M_consistency=1.1 (80>=65) => sigma=1.32 => w_cwi=0.431
  // FinPsych = (65*0.431) + (70*0.569) = 28.015 + 39.83 = 67.845 => 67.8
  const result = calculateFinPsychScore(65, 70, 'LOW', 80);
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

test('Weights always sum to 1.0', () => {
  const scenarios = [
    { gaming: 'MINIMAL', cons: 100 },
    { gaming: 'LOW', cons: 75 },
    { gaming: 'MODERATE', cons: 65 },
    { gaming: 'HIGH', cons: 55 },
    { gaming: 'SEVERE', cons: 40 },
  ];

  for (const s of scenarios) {
    const result = calculateFinPsychScore(70, 80, s.gaming, s.cons);
    const sum = result!.weights.cwi + result!.weights.nci;
    assertApprox(sum, 1.0, 0.0001, `Weights sum for ${s.gaming}/cons=${s.cons}`);
  }
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
