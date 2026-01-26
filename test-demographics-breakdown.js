#!/usr/bin/env node

// Test demographics breakdown with specific values
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDemographicsBreakdown() {
  console.log('🧪 Testing Demographics Breakdown Display...\n');
  console.log('Creating applicant with:');
  console.log('  Country: Glasgow (UK)');
  console.log('  Age: 45');
  console.log('  Gender: Prefer not to say\n');

  const applicantId = crypto.randomUUID();
  const sessionId = `test-demo-${Date.now()}`;
  const startTime = Date.now() - (18 * 60 * 1000);

  // ASFN: Level 1: 100% (5/5), Level 2: 100% (5/5)
  // ASFN Overall: 100%
  // LCA: 15/15 points = 100%
  // NCI: 0.6*100 + 0.4*100 = 100%

  try {
    console.log('1. Creating applicant...');
    const { error: applicantError } = await supabase
      .from('applicants')
      .insert({
        id: applicantId,
        session_id: sessionId,
        institution_id: 'test-bank-uk',
        assessment_id: 'demo-test',
        full_name: 'Alex Smith',
        email: 'alex.smith@glasgow.uk',
        country: 'Glasgow',
        age_range: '45-54',
        gender: 'Prefer not to say',
        marital_status: 'Divorced',
        education: 'High School',
        employment_status: 'Part-time',
        income_range: '£20,000 - £40,000',
        dependents: '1',
        has_bank_account: 'Yes',
        loan_history: 'No',
        residency_status: 'Renting',
        device_info: { browser: 'Safari', os: 'macOS' },
        started_at: new Date(startTime).toISOString(),
        submitted_at: new Date().toISOString(),
        total_time_ms: Date.now() - startTime,
        validation_result: { flags: [], consistencyScore: 95, passedValidation: true },
        quality_score: 95,
        response_metadata: {
          session: {
            totalQuestions: 70,
            asfn: {
              level1: { attempted: true, correct: 5, total: 5, accuracy: 100 },
              level2: { attempted: true, correct: 5, total: 5, accuracy: 100 },
              overallScore: 100,
              tier: 'HIGH',
            },
            lca: { attempted: true, rawScore: 15, maxScore: 15, percent: 100 },
            nci: 100,
          },
        },
        asfn_level1_score: 100,
        asfn_level2_score: 100,
        asfn_overall_score: 100,
        asfn_tier: 'HIGH',
        lca_raw_score: 15,
        lca_percent: 100,
        nci_score: 100,
      });

    if (applicantError) throw applicantError;
    console.log('   ✅ Applicant created\n');

    console.log('2. Inserting responses...');
    const allResponses = [
      // CWI questions
      { applicant_id: applicantId, question_id: 'q1', answer: 'Never', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q2', answer: 'Never', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q7', answer: 'Always', metadata: { timeSpentMs: 3000 } },
      { applicant_id: applicantId, question_id: 'q10', answer: 'Always', metadata: { timeSpentMs: 2800 } },
      { applicant_id: applicantId, question_id: 'q47', answer: 'Strongly Agree', metadata: { timeSpentMs: 3500 } },

      // ASFN Level 1 - ALL CORRECT
      { applicant_id: applicantId, question_id: 'asfn1_1', answer: 'B) Two $20 bills', metadata: { timeSpentMs: 6000 } },
      { applicant_id: applicantId, question_id: 'asfn1_2', answer: 'A) $5', metadata: { timeSpentMs: 7000 } },
      { applicant_id: applicantId, question_id: 'asfn1_3', answer: 'A) $15', metadata: { timeSpentMs: 7500 } },
      { applicant_id: applicantId, question_id: 'asfn1_4', answer: 'C) $12', metadata: { timeSpentMs: 8000 } },
      { applicant_id: applicantId, question_id: 'asfn1_5', answer: 'A) Shop B', metadata: { timeSpentMs: 9000 } },

      // ASFN Level 2 - ALL CORRECT
      { applicant_id: applicantId, question_id: 'asfn2_1', answer: 'A) Lender A', metadata: { timeSpentMs: 11000 } },
      { applicant_id: applicantId, question_id: 'asfn2_2', answer: 'A) Option A', metadata: { timeSpentMs: 12000 } },
      { applicant_id: applicantId, question_id: 'asfn2_3', answer: 'B) $450', metadata: { timeSpentMs: 13000 } },
      { applicant_id: applicantId, question_id: 'asfn2_4', answer: 'B) Plan B', metadata: { timeSpentMs: 14000 } },
      { applicant_id: applicantId, question_id: 'asfn2_5', answer: 'B) Less groceries', metadata: { timeSpentMs: 15000 } },

      // LCA Questions - ALL BEST ANSWERS (15/15 points)
      { applicant_id: applicantId, question_id: 'lca1', answer: 'A) Contact the lender and explain your situation before the due date.', metadata: { timeSpentMs: 8000 } }, // 3 pts
      { applicant_id: applicantId, question_id: 'lca2', answer: "C) He still owes money because the phone didn't fully cover the debt.", metadata: { timeSpentMs: 9000 } }, // 3 pts
      { applicant_id: applicantId, question_id: 'lca3', answer: 'A) Ego - needs medicine for her sick child; has irregular income.', metadata: { timeSpentMs: 10000 } }, // 3 pts
      { applicant_id: applicantId, question_id: 'lca4', answer: 'B) Cannot get another loan because of the late payments.', metadata: { timeSpentMs: 8500 } }, // 3 pts
      { applicant_id: applicantId, question_id: 'lca5', answer: 'C) $121 (interest compounds - grows on top of previous interest)', metadata: { timeSpentMs: 9500 } }, // 3 pts

      // Gaming Detection
      { applicant_id: applicantId, question_id: 'gd1', answer: 'A) Add it to savings for a specific goal.', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'gd4', answer: 'B) Option B ($25 in 1 week)', metadata: { timeSpentMs: 5500 } },
    ];

    const { error: responsesError } = await supabase
      .from('responses')
      .insert(allResponses);

    if (responsesError) throw responsesError;
    console.log(`   ✅ Inserted ${allResponses.length} responses\n`);

    console.log('3. Inserting CWI scores...');
    const { error: scoreError } = await supabase
      .from('scores')
      .insert({
        applicant_id: applicantId,
        construct_scores: {
          conscientiousness: 4.8,
          neuroticism: 1.5,
          agreeableness: 4.5,
          financial_numeracy: 5.0,
        },
        construct_z_scores: {
          conscientiousness: 1.2,
          neuroticism: -1.5,
          agreeableness: 1.0,
          financial_numeracy: 1.5,
        },
        character_score: 92,
        capacity_score: 88,
        capital_score: 95,
        consistency_score: 90,
        conditions_score: 85,
        cwi_raw: 2.1,
        cwi_normalized: 0.92,
        cwi_0_100: 92,
        risk_band: 'LOW',
        risk_percentile: 90,
        country: 'Glasgow',
        model_version: 'v1.0',
        scored_at: new Date().toISOString(),
      });

    if (scoreError) throw scoreError;
    console.log('   ✅ Scores inserted\n');

    console.log('4. Updating applicant with CWI...');
    const { error: updateError } = await supabase
      .from('applicants')
      .update({
        cwi_score: 92,
        risk_category: 'LOW',
        scored_at: new Date().toISOString(),
      })
      .eq('id', applicantId);

    if (updateError) throw updateError;
    console.log('   ✅ Updated\n');

    console.log('═'.repeat(70));
    console.log('✅ DEMOGRAPHICS TEST SUCCESSFUL!\n');
    console.log('Applicant: Alex Smith (alex.smith@glasgow.uk)');
    console.log('  Country: Glasgow');
    console.log('  Age Range: 45-54');
    console.log('  Gender: Prefer not to say\n');
    console.log('Perfect Scores:');
    console.log('  ASFN: 100% (HIGH)');
    console.log('  LCA: 15/15 (100%)');
    console.log('  NCI: 100%');
    console.log('  CWI: 92 (LOW RISK)\n');
    console.log('✅ Check admin dashboard Summary tab!');
    console.log('   Demographics breakdown should now show:');
    console.log('   - Country: Glasgow in the country chart');
    console.log('   - Age: 45-54 in the age distribution');
    console.log('   - Gender: "Prefer not to say" in gender breakdown\n');
    console.log('   Total applicants count should increase by 1');
    console.log('═'.repeat(70));

  } catch (err) {
    console.error('\n❌ SUBMISSION FAILED');
    console.error('Error:', err.message);
    if (err.details) console.error('Details:', err.details);
  }
}

testDemographicsBreakdown();
