#!/usr/bin/env node

// Test NCI (Neurocognitive Index) calculation with ASFN + LCA
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNCI() {
  console.log('🧪 Testing NCI (Neurocognitive Index) Calculation...\n');
  console.log('Formula: NCI = 50% ASFN + 50% LCA\n');

  const applicantId = crypto.randomUUID();
  const sessionId = `test-nci-${Date.now()}`;
  const startTime = Date.now() - (20 * 60 * 1000); // Started 20 mins ago

  // ASFN Expected: Level 1: 80% (4/5), Level 2: 60% (3/5)
  // ASFN Overall: 0.6*80 + 0.4*60 = 48 + 24 = 72%

  // LCA Expected: 12/15 points = 80%
  // lca1: A=3, lca2: C=3, lca3: A=3, lca4: B=3, lca5: A=0
  // Total: 3+3+3+3+0 = 12 points

  // NCI Expected: 0.6*72 + 0.4*80 = 43.2 + 32 = 75.2%

  try {
    // Step 1: Insert applicant with calculated NCI
    console.log('1. Creating applicant with NCI data...');
    const { error: applicantError } = await supabase
      .from('applicants')
      .insert({
        id: applicantId,
        session_id: sessionId,
        institution_id: 'test-bank-nci',
        assessment_id: 'nci-test',
        full_name: 'Michael Chen',
        email: 'michael.chen@example.com',
        country: 'Nigeria',
        age_range: '35-44',
        gender: 'Male',
        marital_status: 'Married',
        education: 'Master\'s Degree',
        employment_status: 'Self-employed',
        income_range: '₦200,000 - ₦500,000',
        dependents: '2',
        has_bank_account: 'Yes',
        loan_history: 'Yes, currently paying',
        residency_status: 'Own',
        device_info: { browser: 'Firefox', os: 'Linux' },
        started_at: new Date(startTime).toISOString(),
        submitted_at: new Date().toISOString(),
        total_time_ms: Date.now() - startTime,
        validation_result: { flags: [], consistencyScore: 88, passedValidation: true },
        quality_score: 88,
        response_metadata: {
          session: {
            totalQuestions: 75,
            asfn: {
              level1: { attempted: true, correct: 4, total: 5, accuracy: 80 },
              level2: { attempted: true, correct: 3, total: 5, accuracy: 60 },
              overallScore: 72,
              tier: 'MEDIUM',
            },
            lca: { attempted: true, rawScore: 12, maxScore: 15, percent: 80 },
            nci: 75.2,
          },
        },
        // ASFN scores
        asfn_level1_score: 80,
        asfn_level2_score: 60,
        asfn_overall_score: 72,
        asfn_tier: 'MEDIUM',
        // LCA scores
        lca_raw_score: 12,
        lca_percent: 80,
        // NCI score
        nci_score: 75.2,
      });

    if (applicantError) throw applicantError;
    console.log('   ✅ Applicant created\n');

    // Step 2: Insert responses including LCA
    console.log('2. Inserting responses (CWI + ASFN + LCA + Gaming)...');

    const allResponses = [
      // Sample CWI questions
      { applicant_id: applicantId, question_id: 'q1', answer: 'Rarely', metadata: { timeSpentMs: 4000 } },
      { applicant_id: applicantId, question_id: 'q2', answer: 'Never', metadata: { timeSpentMs: 3800 } },
      { applicant_id: applicantId, question_id: 'q7', answer: 'Often', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q10', answer: 'Always', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q47', answer: 'Agree', metadata: { timeSpentMs: 3800 } },

      // ASFN Level 1 (4 correct, 1 wrong = 80%)
      { applicant_id: applicantId, question_id: 'asfn1_1', answer: 'B) Two $20 bills', metadata: { timeSpentMs: 7000 } }, // ✓
      { applicant_id: applicantId, question_id: 'asfn1_2', answer: 'A) $5', metadata: { timeSpentMs: 8000 } }, // ✓
      { applicant_id: applicantId, question_id: 'asfn1_3', answer: 'A) $15', metadata: { timeSpentMs: 9000 } }, // ✓
      { applicant_id: applicantId, question_id: 'asfn1_4', answer: 'B) $18', metadata: { timeSpentMs: 10000 } }, // ✗ (correct: C) $12)
      { applicant_id: applicantId, question_id: 'asfn1_5', answer: 'A) Shop B', metadata: { timeSpentMs: 11000 } }, // ✓

      // ASFN Level 2 (3 correct, 2 wrong = 60%)
      { applicant_id: applicantId, question_id: 'asfn2_1', answer: 'A) Lender A', metadata: { timeSpentMs: 13000 } }, // ✓
      { applicant_id: applicantId, question_id: 'asfn2_2', answer: 'B) Option B', metadata: { timeSpentMs: 14000 } }, // ✗ (correct: A)
      { applicant_id: applicantId, question_id: 'asfn2_3', answer: 'B) $450', metadata: { timeSpentMs: 15000 } }, // ✓
      { applicant_id: applicantId, question_id: 'asfn2_4', answer: 'B) Plan B', metadata: { timeSpentMs: 16000 } }, // ✓
      { applicant_id: applicantId, question_id: 'asfn2_5', answer: 'A) More groceries', metadata: { timeSpentMs: 17000 } }, // ✗ (correct: B)

      // LCA Questions (12/15 points = 80%)
      { applicant_id: applicantId, question_id: 'lca1', answer: 'A) Contact the lender and explain your situation before the due date.', metadata: { timeSpentMs: 9000 } }, // 3 points
      { applicant_id: applicantId, question_id: 'lca2', answer: "C) He still owes money because the phone didn't fully cover the debt.", metadata: { timeSpentMs: 10000 } }, // 3 points
      { applicant_id: applicantId, question_id: 'lca3', answer: 'A) Ego - needs medicine for her sick child; has irregular income.', metadata: { timeSpentMs: 11000 } }, // 3 points
      { applicant_id: applicantId, question_id: 'lca4', answer: 'B) Cannot get another loan because of the late payments.', metadata: { timeSpentMs: 9500 } }, // 3 points
      { applicant_id: applicantId, question_id: 'lca5', answer: "A) $110 (the debt doesn't grow if he doesn't borrow more)", metadata: { timeSpentMs: 10500 } }, // 0 points (wrong)

      // Gaming Detection
      { applicant_id: applicantId, question_id: 'gd1', answer: 'A) Add it to savings for a specific goal.', metadata: { timeSpentMs: 5500 } },
      { applicant_id: applicantId, question_id: 'gd4', answer: 'B) Option B ($25 in 1 week)', metadata: { timeSpentMs: 6000 } },
    ];

    const { error: responsesError } = await supabase
      .from('responses')
      .insert(allResponses);

    if (responsesError) throw responsesError;
    console.log(`   ✅ Inserted ${allResponses.length} responses\n`);

    // Step 3: Insert score record
    console.log('3. Inserting CWI scores...');
    const { error: scoreError } = await supabase
      .from('scores')
      .insert({
        applicant_id: applicantId,
        construct_scores: {
          conscientiousness: 4.0,
          neuroticism: 2.5,
          agreeableness: 3.8,
          financial_numeracy: 3.6,
        },
        construct_z_scores: {
          conscientiousness: 0.5,
          neuroticism: -0.4,
          agreeableness: 0.3,
          financial_numeracy: 0.4,
        },
        character_score: 78,
        capacity_score: 72,
        capital_score: 68,
        collateral_score: 82,
        conditions_score: 76,
        cwi_raw: 1.6,
        cwi_normalized: 0.76,
        cwi_0_100: 76,
        risk_band: 'MODERATE',
        risk_percentile: 70,
        country: 'Nigeria',
        model_version: 'v1.0',
        scored_at: new Date().toISOString(),
      });

    if (scoreError) throw scoreError;
    console.log('   ✅ Scores inserted\n');

    // Step 4: Update applicant with CWI score
    console.log('4. Updating applicant with CWI score...');
    const { error: updateError } = await supabase
      .from('applicants')
      .update({
        cwi_score: 76,
        risk_category: 'MODERATE',
        scored_at: new Date().toISOString(),
      })
      .eq('id', applicantId);

    if (updateError) throw updateError;
    console.log('   ✅ Applicant updated\n');

    console.log('═'.repeat(70));
    console.log('✅ NCI TEST SUBMISSION SUCCESSFUL!\n');
    console.log('Applicant: Michael Chen (michael.chen@example.com)\n');
    console.log('📊 ASFN Breakdown:');
    console.log('  Level 1: 4/5 correct = 80%');
    console.log('  Level 2: 3/5 correct = 60%');
    console.log('  Overall: (0.6 × 80) + (0.4 × 60) = 72%\n');
    console.log('📊 LCA Breakdown:');
    console.log('  lca1: A = 3 points ✓');
    console.log('  lca2: C = 3 points ✓');
    console.log('  lca3: A = 3 points ✓');
    console.log('  lca4: B = 3 points ✓');
    console.log('  lca5: A = 0 points ✗ (correct: C = 3 points)');
    console.log('  Total: 12/15 points = 80%\n');
    console.log('🧠 NCI Calculation:');
    console.log('  Formula: NCI = (0.5 × ASFN) + (0.5 × LCA)');
    console.log('  NCI = (0.5 × 72) + (0.5 × 80)');
    console.log('  NCI = 36 + 40');
    console.log('  NCI = 76%\n');
    console.log('🎯 Gaming Detection:');
    console.log('  CWI Score: 76');
    console.log('  NCI Score: 75.2');
    console.log('  Difference: 76 - 75.2 = 0.8 (LOW RISK - scores align)\n');
    console.log('✅ Check admin dashboard for Michael Chen!');
    console.log('   You should see:');
    console.log('   - ASFN card with 72% (MEDIUM tier)');
    console.log('   - LCA card with 12/15 (80%)');
    console.log('   - NCI card with 75.2%');
    console.log('   - Gaming detection showing LOW RISK');
    console.log('═'.repeat(70));

  } catch (err) {
    console.error('\n❌ SUBMISSION FAILED');
    console.error('Error:', err.message);
    if (err.details) console.error('Details:', err.details);
  }
}

testNCI();
