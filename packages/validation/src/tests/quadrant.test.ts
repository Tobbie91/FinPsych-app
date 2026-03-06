/**
 * Tests for Quadrant Classification and Discordance Analysis (v3.2, Section 2.6)
 *
 * Run with: npx tsx src/tests/quadrant.test.ts
 */

import {
  classifyQuadrant,
  calculateDiscordance,
  getQuadrantLabel,
  analyzeQuadrant,
  isGamingAlert,
} from '../quadrant';

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

function assertApprox(actual: number, expected: number, tolerance: number, message?: string) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message || 'Approx assertion failed'}: Expected ~${expected}, got ${actual}`);
  }
}

// ============================================================================
// Tests: Quadrant Classification
// ============================================================================

console.log('\n=== Quadrant Classification ===\n');

test('Q1: Authentic Performer (both >= 60)', () => {
  assertEqual(classifyQuadrant(70, 80), 'Q1');
});

test('Q2: Gaming Suspected (CWI >= 60, NCI < 60)', () => {
  assertEqual(classifyQuadrant(80, 40), 'Q2');
});

test('Q3: Honest/Humble (CWI < 60, NCI >= 60)', () => {
  assertEqual(classifyQuadrant(40, 70), 'Q3');
});

test('Q4: Genuine Struggle (both < 60)', () => {
  assertEqual(classifyQuadrant(30, 30), 'Q4');
});

test('Boundary: CWI=60, NCI=60 => Q1 (inclusive)', () => {
  assertEqual(classifyQuadrant(60, 60), 'Q1');
});

test('Boundary: CWI=59, NCI=60 => Q3', () => {
  assertEqual(classifyQuadrant(59, 60), 'Q3');
});

test('Boundary: CWI=60, NCI=59 => Q2', () => {
  assertEqual(classifyQuadrant(60, 59), 'Q2');
});

test('Boundary: CWI=59, NCI=59 => Q4', () => {
  assertEqual(classifyQuadrant(59, 59), 'Q4');
});

// ============================================================================
// Tests: Quadrant Labels
// ============================================================================

console.log('\n=== Quadrant Labels ===\n');

test('Q1 label = "Authentic Performer"', () => {
  assertEqual(getQuadrantLabel('Q1'), 'Authentic Performer');
});

test('Q2 label = "Gaming Suspected"', () => {
  assertEqual(getQuadrantLabel('Q2'), 'Gaming Suspected');
});

test('Q3 label = "Honest/Humble"', () => {
  assertEqual(getQuadrantLabel('Q3'), 'Honest/Humble');
});

test('Q4 label = "Genuine Struggle"', () => {
  assertEqual(getQuadrantLabel('Q4'), 'Genuine Struggle');
});

// ============================================================================
// Tests: Discordance Calculation
// ============================================================================

console.log('\n=== Discordance ===\n');

test('CWI=70, NCI=70 => discordance=0, MINIMAL', () => {
  const result = calculateDiscordance(70, 70);
  assertEqual(result.discordance, 0);
  assertEqual(result.severity, 'MINIMAL');
});

test('CWI=80, NCI=70 => discordance=10, MINIMAL', () => {
  const result = calculateDiscordance(80, 70);
  assertEqual(result.discordance, 10);
  assertEqual(result.severity, 'MINIMAL');
});

test('CWI=80, NCI=60 => discordance=20, LOW', () => {
  const result = calculateDiscordance(80, 60);
  assertEqual(result.discordance, 20);
  assertEqual(result.severity, 'LOW');
});

test('CWI=55, NCI=80 => discordance=25, MODERATE', () => {
  const result = calculateDiscordance(55, 80);
  assertEqual(result.discordance, 25);
  assertEqual(result.severity, 'MODERATE');
});

test('CWI=90, NCI=50 => discordance=40, HIGH', () => {
  const result = calculateDiscordance(90, 50);
  assertEqual(result.discordance, 40);
  assertEqual(result.severity, 'HIGH');
});

test('CWI=100, NCI=30 => discordance=70, SEVERE', () => {
  const result = calculateDiscordance(100, 30);
  assertEqual(result.discordance, 70);
  assertEqual(result.severity, 'SEVERE');
});

test('Boundary: discordance=10 => MINIMAL (not LOW)', () => {
  const result = calculateDiscordance(60, 50);
  assertEqual(result.severity, 'MINIMAL');
});

test('Boundary: discordance=11 => LOW', () => {
  const result = calculateDiscordance(61, 50);
  assertEqual(result.discordance, 11);
  assertEqual(result.severity, 'LOW');
});

test('Boundary: discordance=20 => LOW (not MODERATE)', () => {
  const result = calculateDiscordance(70, 50);
  assertEqual(result.severity, 'LOW');
});

test('Boundary: discordance=35 => MODERATE (not HIGH)', () => {
  const result = calculateDiscordance(85, 50);
  assertEqual(result.severity, 'MODERATE');
});

test('Boundary: discordance=50 => HIGH (not SEVERE)', () => {
  const result = calculateDiscordance(100, 50);
  assertEqual(result.severity, 'HIGH');
});

test('Boundary: discordance=51 => SEVERE', () => {
  const result = calculateDiscordance(100, 49);
  assertEqual(result.discordance, 51);
  assertEqual(result.severity, 'SEVERE');
});

// ============================================================================
// Tests: Gaming Alert
// ============================================================================

console.log('\n=== Gaming Alert ===\n');

test('Q2 + HIGH => alert fires', () => {
  assertEqual(isGamingAlert('Q2', 'HIGH'), true);
});

test('Q2 + SEVERE => alert fires', () => {
  assertEqual(isGamingAlert('Q2', 'SEVERE'), true);
});

test('Q2 + MODERATE => no alert', () => {
  assertEqual(isGamingAlert('Q2', 'MODERATE'), false);
});

test('Q2 + LOW => no alert', () => {
  assertEqual(isGamingAlert('Q2', 'LOW'), false);
});

test('Q2 + MINIMAL => no alert', () => {
  assertEqual(isGamingAlert('Q2', 'MINIMAL'), false);
});

test('Q1 + HIGH => no alert', () => {
  assertEqual(isGamingAlert('Q1', 'HIGH'), false);
});

test('Q3 + SEVERE => no alert', () => {
  assertEqual(isGamingAlert('Q3', 'SEVERE'), false);
});

test('Q4 + HIGH => no alert', () => {
  assertEqual(isGamingAlert('Q4', 'HIGH'), false);
});

// ============================================================================
// Tests: analyzeQuadrant (Integration)
// ============================================================================

console.log('\n=== analyzeQuadrant Integration ===\n');

test('analyzeQuadrant returns complete QuadrantResult', () => {
  const result = analyzeQuadrant(80, 40);
  assertEqual(result.quadrant, 'Q2');
  assertEqual(result.label, 'Gaming Suspected');
  assertEqual(result.cwi, 80);
  assertEqual(result.nci, 40);
  assertEqual(result.discordance, 40);
  assertEqual(result.discordanceSeverity, 'HIGH');
});

test('analyzeQuadrant: Q1 with low discordance', () => {
  const result = analyzeQuadrant(75, 70);
  assertEqual(result.quadrant, 'Q1');
  assertEqual(result.label, 'Authentic Performer');
  assertEqual(result.discordance, 5);
  assertEqual(result.discordanceSeverity, 'MINIMAL');
});

test('analyzeQuadrant: Q4 with moderate discordance', () => {
  const result = analyzeQuadrant(30, 55);
  assertEqual(result.quadrant, 'Q4');
  assertEqual(result.label, 'Genuine Struggle');
  assertEqual(result.discordance, 25);
  assertEqual(result.discordanceSeverity, 'MODERATE');
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
