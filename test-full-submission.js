#!/usr/bin/env node

// Simulate a complete assessment submission
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullSubmission() {
  console.log('🧪 Testing Full Submission...\n');

  const applicantId = crypto.randomUUID();
  const sessionId = `test-session-${Date.now()}`;

  try {
    // Step 1: Insert applicant with ALL new fields
    console.log('1. Inserting applicant...');
    const { error: applicantError } = await supabase
      .from('applicants')
      .insert({
        id: applicantId,
        session_id: sessionId,
        institution_id: 'test-institution',
        assessment_id: 'test-assessment',
        full_name: 'Test User Complete',
        email: 'testcomplete@example.com',
        country: 'Nigeria',
        age_range: '25-34',
        gender: 'Male',
        marital_status: 'Single',
        education: 'Bachelor',
        employment_status: 'Employed',
        income_range: '50000-100000',
        dependents: '0',
        has_bank_account: 'Yes',
        loan_history: 'Yes',
        residency_status: 'Own',
        device_info: { browser: 'Chrome', os: 'MacOS' },
        started_at: new Date(Date.now() - 600000).toISOString(),
        submitted_at: new Date().toISOString(),
        total_time_ms: 600000,
        validation_result: { flags: [], consistencyScore: 95, passedValidation: true },
        quality_score: 95,
        response_metadata: { session: { totalQuestions: 100 } },
        asfn_level1_score: 80,
        asfn_level2_score: 70,
        asfn_overall_score: 76,
        asfn_tier: 'HIGH',
      });

    if (applicantError) {
      console.log('   ❌ Failed to insert applicant');
      console.log('   Error:', applicantError.message);
      console.log('   Code:', applicantError.code);
      console.log('   Details:', applicantError.details);
      throw applicantError;
    }
    console.log('   ✅ Applicant inserted\n');

    // Step 2: Insert some sample responses
    console.log('2. Inserting responses...');
    const responses = [
      { applicant_id: applicantId, question_id: 'q1', answer: 'Never', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'q2', answer: 'Never', metadata: { timeSpentMs: 4000 } },
      { applicant_id: applicantId, question_id: 'asfn1_1', answer: 'B) Two $20 bills', metadata: { timeSpentMs: 8000 } },
      { applicant_id: applicantId, question_id: 'asfn1_2', answer: 'A) $5', metadata: { timeSpentMs: 7000 } },
    ];

    const { error: responsesError } = await supabase
      .from('responses')
      .insert(responses);

    if (responsesError) {
      console.log('   ❌ Failed to insert responses');
      console.log('   Error:', responsesError.message);
      throw responsesError;
    }
    console.log('   ✅ Responses inserted\n');

    // Step 3: Insert score record
    console.log('3. Inserting scores...');
    const { error: scoreError } = await supabase
      .from('scores')
      .insert({
        applicant_id: applicantId,
        construct_scores: { conscientiousness: 4.2, neuroticism: 2.8 },
        construct_z_scores: { conscientiousness: 0.5, neuroticism: -0.3 },
        character_score: 75,
        capacity_score: 80,
        capital_score: 70,
        consistency_score: 85,
        conditions_score: 90,
        cwi_raw: 1.5,
        cwi_normalized: 0.75,
        cwi_0_100: 75,
        risk_band: 'MODERATE',
        risk_percentile: 65,
        country: 'Nigeria',
        model_version: 'v1.0',
        scored_at: new Date().toISOString(),
      });

    if (scoreError) {
      console.log('   ❌ Failed to insert scores');
      console.log('   Error:', scoreError.message);
      throw scoreError;
    }
    console.log('   ✅ Scores inserted\n');

    // Step 4: Update applicant with CWI score
    console.log('4. Updating applicant with CWI score...');
    const { error: updateError } = await supabase
      .from('applicants')
      .update({
        cwi_score: 75,
        risk_category: 'MODERATE',
        scored_at: new Date().toISOString(),
      })
      .eq('id', applicantId);

    if (updateError) {
      console.log('   ❌ Failed to update applicant');
      console.log('   Error:', updateError.message);
      throw updateError;
    }
    console.log('   ✅ Applicant updated\n');

    console.log('═'.repeat(60));
    console.log('✅ FULL SUBMISSION TEST SUCCESSFUL!\n');
    console.log('Test applicant created:');
    console.log('  Name: Test User Complete');
    console.log('  Email: testcomplete@example.com');
    console.log('  CWI Score: 75');
    console.log('  ASFN Overall: 76 (HIGH)');
    console.log('  ASFN Level 1: 80%');
    console.log('  ASFN Level 2: 70%');
    console.log('\nCheck admin dashboard - this submission should appear!');
    console.log('═'.repeat(60));

  } catch (err) {
    console.error('\n❌ SUBMISSION FAILED');
    console.error('Error:', err);
  }
}

testFullSubmission();
