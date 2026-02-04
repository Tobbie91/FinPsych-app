#!/usr/bin/env node

// Simulate a COMPLETE real-world assessment submission
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCompleteSubmission() {
  console.log('🧪 Testing COMPLETE Assessment Submission...\n');
  console.log('This simulates a real user filling out all 100+ questions\n');

  const applicantId = crypto.randomUUID();
  const sessionId = `test-session-${Date.now()}`;
  const startTime = Date.now() - (25 * 60 * 1000); // Started 25 mins ago

  try {
    // Step 1: Insert applicant with FULL data
    console.log('1. Creating applicant...');
    const { error: applicantError } = await supabase
      .from('applicants')
      .insert({
        id: applicantId,
        session_id: sessionId,
        institution_id: 'test-bank-001',
        assessment_id: 'cwi-assessment-v1',
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        country: 'Nigeria',
        age_range: '25-34',
        gender: 'Female',
        marital_status: 'Single',
        education: 'Bachelor\'s Degree',
        employment_status: 'Employed Full-time',
        income_range: '₦100,000 - ₦200,000',
        dependents: '1',
        has_bank_account: 'Yes',
        loan_history: 'Yes, paid on time',
        residency_status: 'Renting',
        device_info: {
          browser: 'Chrome',
          os: 'Windows',
          screenWidth: 1920,
          screenHeight: 1080,
        },
        started_at: new Date(startTime).toISOString(),
        submitted_at: new Date().toISOString(),
        total_time_ms: Date.now() - startTime,
        validation_result: {
          flags: [],
          consistencyScore: 92,
          passedValidation: true,
        },
        quality_score: 92,
        response_metadata: {
          session: {
            totalQuestions: 108,
            startTime: startTime,
            endTime: Date.now(),
            totalTimeMs: Date.now() - startTime,
            asfn: {
              level1: {
                attempted: true,
                correct: 5,
                total: 5,
                accuracy: 100,
              },
              level2: {
                attempted: true,
                correct: 4,
                total: 5,
                accuracy: 80,
              },
              overallScore: 92,
              tier: 'HIGH',
            },
          },
        },
        asfn_level1_score: 100,
        asfn_level2_score: 80,
        asfn_overall_score: 92,
        asfn_tier: 'HIGH',
      });

    if (applicantError) throw applicantError;
    console.log('   ✅ Applicant created\n');

    // Step 2: Insert ALL responses (demographics + CWI + ASFN + LCA + Gaming)
    console.log('2. Inserting 100+ question responses...');

    const allResponses = [
      // Section B - Financial Behaviour (15 questions)
      { applicant_id: applicantId, question_id: 'q1', answer: 'Never', metadata: { timeSpentMs: 4200 } },
      { applicant_id: applicantId, question_id: 'q2', answer: 'Never', metadata: { timeSpentMs: 3800 } },
      { applicant_id: applicantId, question_id: 'q3', answer: 'Never', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q4', answer: 'Rarely', metadata: { timeSpentMs: 4100 } },
      { applicant_id: applicantId, question_id: 'q5', answer: 'Never', metadata: { timeSpentMs: 3900 } },
      { applicant_id: applicantId, question_id: 'q6', answer: 'Never', metadata: { timeSpentMs: 5200 } },
      { applicant_id: applicantId, question_id: 'q7', answer: 'Always', metadata: { timeSpentMs: 3600 } },
      { applicant_id: applicantId, question_id: 'q8', answer: 'Often', metadata: { timeSpentMs: 4000 } },
      { applicant_id: applicantId, question_id: 'q9', answer: 'Sometimes', metadata: { timeSpentMs: 4500 } },
      { applicant_id: applicantId, question_id: 'q10', answer: 'Always', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q11', answer: 'Often', metadata: { timeSpentMs: 4300 } },
      { applicant_id: applicantId, question_id: 'q12', answer: 'Always', metadata: { timeSpentMs: 3800 } },
      { applicant_id: applicantId, question_id: 'q13', answer: 'Often', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'q14', answer: 'Emergency fund', metadata: { timeSpentMs: 6200 } },
      { applicant_id: applicantId, question_id: 'q15', answer: '3-6 months', metadata: { timeSpentMs: 4800 } },

      // Section D - Personality Big Five (25 questions)
      { applicant_id: applicantId, question_id: 'q17', answer: 'Agree', metadata: { timeSpentMs: 3000 } },
      { applicant_id: applicantId, question_id: 'q18', answer: 'Strongly Agree', metadata: { timeSpentMs: 2800 } },
      { applicant_id: applicantId, question_id: 'q19', answer: 'Agree', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q20', answer: 'Agree', metadata: { timeSpentMs: 3100 } },
      { applicant_id: applicantId, question_id: 'q21', answer: 'Often', metadata: { timeSpentMs: 3400 } },
      { applicant_id: applicantId, question_id: 'q22', answer: 'Disagree', metadata: { timeSpentMs: 3600 } },
      { applicant_id: applicantId, question_id: 'q23', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 3300 } },
      { applicant_id: applicantId, question_id: 'q24', answer: 'Disagree', metadata: { timeSpentMs: 3000 } },
      { applicant_id: applicantId, question_id: 'q25', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q26', answer: 'Disagree', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q27', answer: 'Agree', metadata: { timeSpentMs: 2900 } },
      { applicant_id: applicantId, question_id: 'q28', answer: 'Agree', metadata: { timeSpentMs: 3100 } },
      { applicant_id: applicantId, question_id: 'q29', answer: 'Somewhat Agree', metadata: { timeSpentMs: 3400 } },
      { applicant_id: applicantId, question_id: 'q30', answer: 'Agree', metadata: { timeSpentMs: 2800 } },
      { applicant_id: applicantId, question_id: 'q31', answer: 'Agree', metadata: { timeSpentMs: 3000 } },

      // Section E - Risk Preference (5 questions)
      { applicant_id: applicantId, question_id: 'q42', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 4500 } },
      { applicant_id: applicantId, question_id: 'q43', answer: 'Disagree', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'q44', answer: 'Somewhat Agree', metadata: { timeSpentMs: 4800 } },
      { applicant_id: applicantId, question_id: 'q45', answer: 'Disagree', metadata: { timeSpentMs: 5200 } },
      { applicant_id: applicantId, question_id: 'q46', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 4600 } },

      // Section F - Self-Control (7 questions)
      { applicant_id: applicantId, question_id: 'q47', answer: 'Agree', metadata: { timeSpentMs: 3800 } },
      { applicant_id: applicantId, question_id: 'q48', answer: 'Disagree', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q49', answer: 'Disagree', metadata: { timeSpentMs: 4000 } },
      { applicant_id: applicantId, question_id: 'q50', answer: 'Strongly Agree', metadata: { timeSpentMs: 3600 } },
      { applicant_id: applicantId, question_id: 'q51', answer: 'Agree', metadata: { timeSpentMs: 3900 } },
      { applicant_id: applicantId, question_id: 'q52', answer: 'Agree', metadata: { timeSpentMs: 4100 } },
      { applicant_id: applicantId, question_id: 'q53', answer: 'Strongly Agree', metadata: { timeSpentMs: 3700 } },

      // Section G - ASFN Level 1 (5 questions)
      { applicant_id: applicantId, question_id: 'asfn1_1', answer: 'B) Two $20 bills', metadata: { timeSpentMs: 6000 } },
      { applicant_id: applicantId, question_id: 'asfn1_2', answer: 'A) $5', metadata: { timeSpentMs: 7200 } },
      { applicant_id: applicantId, question_id: 'asfn1_3', answer: 'A) $15', metadata: { timeSpentMs: 8000 } },
      { applicant_id: applicantId, question_id: 'asfn1_4', answer: 'C) $12', metadata: { timeSpentMs: 9500 } },
      { applicant_id: applicantId, question_id: 'asfn1_5', answer: 'A) Shop B', metadata: { timeSpentMs: 10200 } },

      // Section G - ASFN Level 2 (5 questions - unlocked with 100% Level 1)
      { applicant_id: applicantId, question_id: 'asfn2_1', answer: 'A) Lender A', metadata: { timeSpentMs: 12000 } },
      { applicant_id: applicantId, question_id: 'asfn2_2', answer: 'A) Option A', metadata: { timeSpentMs: 11500 } },
      { applicant_id: applicantId, question_id: 'asfn2_3', answer: 'B) $450', metadata: { timeSpentMs: 13000 } },
      { applicant_id: applicantId, question_id: 'asfn2_4', answer: 'B) Plan B', metadata: { timeSpentMs: 14200 } },
      { applicant_id: applicantId, question_id: 'asfn2_5', answer: 'C) Same purchasing power', metadata: { timeSpentMs: 15000 } }, // Wrong answer

      // LCA - Loan Consequence Awareness (4 questions)
      { applicant_id: applicantId, question_id: 'lca1', answer: 'Pay rent first', metadata: { timeSpentMs: 8500 } },
      { applicant_id: applicantId, question_id: 'lca2', answer: 'Understand consequences', metadata: { timeSpentMs: 9000 } },
      { applicant_id: applicantId, question_id: 'lca3', answer: 'Necessity only', metadata: { timeSpentMs: 7800 } },
      { applicant_id: applicantId, question_id: 'lca4', answer: 'Long-term impact', metadata: { timeSpentMs: 8200 } },

      // Gaming Detection (6 questions)
      { applicant_id: applicantId, question_id: 'gd1', answer: 'Track regularly', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'gd2', answer: 'Review monthly', metadata: { timeSpentMs: 4800 } },
      { applicant_id: applicantId, question_id: 'gd3', answer: 'Yes, weekly', metadata: { timeSpentMs: 5200 } },
      { applicant_id: applicantId, question_id: 'gd4', answer: 'B) Option B ($25 in 1 week)', metadata: { timeSpentMs: 6000 } },
      { applicant_id: applicantId, question_id: 'gd5', answer: 'B) Option B ($70 in 1 month)', metadata: { timeSpentMs: 6500 } },
      { applicant_id: applicantId, question_id: 'gd6', answer: 'B) Option B ($150 in 6 months)', metadata: { timeSpentMs: 7000 } },
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
          conscientiousness: 4.5,
          neuroticism: 2.2,
          agreeableness: 4.1,
          openness: 3.8,
          extraversion: 3.5,
        },
        construct_z_scores: {
          conscientiousness: 0.8,
          neuroticism: -0.6,
          agreeableness: 0.5,
          openness: 0.2,
          extraversion: 0.0,
        },
        character_score: 82,
        capacity_score: 78,
        capital_score: 85,
        collateral_score: 88,
        conditions_score: 75,
        cwi_raw: 1.8,
        cwi_normalized: 0.81,
        cwi_0_100: 81,
        risk_band: 'LOW',
        risk_percentile: 78,
        country: 'Nigeria',
        model_version: 'v1.0',
        scored_at: new Date().toISOString(),
      });

    if (scoreError) throw scoreError;
    console.log('   ✅ Scores inserted\n');

    // Step 4: Update applicant with CWI score
    console.log('4. Updating applicant with final CWI score...');
    const { error: updateError } = await supabase
      .from('applicants')
      .update({
        cwi_score: 81,
        risk_category: 'LOW',
        scored_at: new Date().toISOString(),
      })
      .eq('id', applicantId);

    if (updateError) throw updateError;
    console.log('   ✅ Applicant updated\n');

    console.log('═'.repeat(70));
    console.log('✅ COMPLETE SUBMISSION TEST SUCCESSFUL!\n');
    console.log('Applicant Profile:');
    console.log('  Name: Sarah Johnson');
    console.log('  Email: sarah.johnson@example.com');
    console.log('  Country: Nigeria');
    console.log('  Total Questions: 68');
    console.log('  Time Taken: 25 minutes\n');
    console.log('Scores:');
    console.log('  CWI: 81/100 (LOW RISK)');
    console.log('  ASFN: 92% (HIGH NUMERACY)');
    console.log('  - Level 1: 100% (5/5 correct)');
    console.log('  - Level 2: 80% (4/5 correct)');
    console.log('  Quality: 92/100\n');
    console.log('Five Cs Breakdown:');
    console.log('  Character: 82/100');
    console.log('  Capacity: 78/100');
    console.log('  Capital: 85/100');
    console.log('  Consistency: 88/100');
    console.log('  Conditions: 75/100\n');
    console.log('✅ Check your admin dashboard - Sarah Johnson should appear!');
    console.log('   All sections should display correctly with full data.');
    console.log('═'.repeat(70));

  } catch (err) {
    console.error('\n❌ SUBMISSION FAILED');
    console.error('Error:', err.message);
  }
}

testCompleteSubmission();
