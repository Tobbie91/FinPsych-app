#!/usr/bin/env node

// Create a COMPLETE submission with ALL questions answered
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createCompleteSubmission() {
  console.log('🧪 Creating COMPLETE Submission with ALL Questions...\n');

  const applicantId = crypto.randomUUID();
  const sessionId = `complete-${Date.now()}`;
  const startTime = Date.now() - (35 * 60 * 1000); // 35 minutes

  try {
    console.log('1. Creating applicant...');
    const { error: applicantError } = await supabase
      .from('applicants')
      .insert({
        id: applicantId,
        session_id: sessionId,
        institution_id: 'complete-test',
        assessment_id: 'full-assessment',
        full_name: 'Emma Williams',
        email: 'emma.williams@test.com',
        country: 'United Kingdom',
        age_range: '25-34',
        gender: 'Female',
        marital_status: 'Single',
        education: "Bachelor's Degree",
        employment_status: 'Employed Full-time',
        income_range: '£30,000 - £50,000',
        dependents: '0',
        has_bank_account: 'Yes',
        loan_history: 'Yes, paid on time',
        residency_status: 'Renting',
        device_info: { browser: 'Chrome', os: 'Windows' },
        started_at: new Date(startTime).toISOString(),
        submitted_at: new Date().toISOString(),
        total_time_ms: Date.now() - startTime,
        validation_result: { flags: [], consistencyScore: 90, passedValidation: true },
        quality_score: 90,
        response_metadata: {
          session: {
            totalQuestions: 108,
            asfn: {
              level1: { attempted: true, correct: 5, total: 5, accuracy: 100 },
              level2: { attempted: true, correct: 4, total: 5, accuracy: 80 },
              overallScore: 92,
              tier: 'HIGH',
            },
            lca: { attempted: true, rawScore: 13, maxScore: 15, percent: 86.7 },
            nci: 90,
          },
        },
        asfn_level1_score: 100,
        asfn_level2_score: 80,
        asfn_overall_score: 92,
        asfn_tier: 'HIGH',
        lca_raw_score: 13,
        lca_percent: 86.7,
        nci_score: 90,
      });

    if (applicantError) throw applicantError;
    console.log('   ✅ Applicant created\n');

    console.log('2. Inserting ALL responses (100+ questions)...');

    const allResponses = [
      // Section B - Financial Behaviour (15 questions)
      { applicant_id: applicantId, question_id: 'q1', answer: 'Never', metadata: { timeSpentMs: 4200 } },
      { applicant_id: applicantId, question_id: 'q2', answer: 'Never', metadata: { timeSpentMs: 3800 } },
      { applicant_id: applicantId, question_id: 'q3', answer: 'Rarely', metadata: { timeSpentMs: 4000 } },
      { applicant_id: applicantId, question_id: 'q4', answer: 'Never', metadata: { timeSpentMs: 3900 } },
      { applicant_id: applicantId, question_id: 'q5', answer: 'Never', metadata: { timeSpentMs: 3700 } },
      { applicant_id: applicantId, question_id: 'q6', answer: 'Never', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'q7', answer: 'Always', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q8', answer: 'Often', metadata: { timeSpentMs: 3800 } },
      { applicant_id: applicantId, question_id: 'q9', answer: 'Often', metadata: { timeSpentMs: 4200 } },
      { applicant_id: applicantId, question_id: 'q10', answer: 'Always', metadata: { timeSpentMs: 3400 } },
      { applicant_id: applicantId, question_id: 'q11', answer: 'Often', metadata: { timeSpentMs: 4000 } },
      { applicant_id: applicantId, question_id: 'q12', answer: 'Always', metadata: { timeSpentMs: 3600 } },
      { applicant_id: applicantId, question_id: 'q13', answer: 'Often', metadata: { timeSpentMs: 4500 } },
      { applicant_id: applicantId, question_id: 'q14', answer: 'Emergency fund', metadata: { timeSpentMs: 5500 } },
      { applicant_id: applicantId, question_id: 'q15', answer: '3-6 months', metadata: { timeSpentMs: 4800 } },

      // Section C - Crisis Decision-Making (1 question)
      { applicant_id: applicantId, question_id: 'q16', answer: 'Food, Rent, Medicine, Transport, Loan, Entertainment', metadata: { timeSpentMs: 15000 } },

      // Section D - Personality Big Five (25 questions)
      { applicant_id: applicantId, question_id: 'q17', answer: 'Agree', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q18', answer: 'Strongly Agree', metadata: { timeSpentMs: 3000 } },
      { applicant_id: applicantId, question_id: 'q19', answer: 'Agree', metadata: { timeSpentMs: 3100 } },
      { applicant_id: applicantId, question_id: 'q20', answer: 'Agree', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q21', answer: 'Often', metadata: { timeSpentMs: 3300 } },
      { applicant_id: applicantId, question_id: 'q22', answer: 'Disagree', metadata: { timeSpentMs: 3400 } },
      { applicant_id: applicantId, question_id: 'q23', answer: 'Disagree', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q24', answer: 'Disagree', metadata: { timeSpentMs: 3100 } },
      { applicant_id: applicantId, question_id: 'q25', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q26', answer: 'Disagree', metadata: { timeSpentMs: 3300 } },
      { applicant_id: applicantId, question_id: 'q27', answer: 'Strongly Agree', metadata: { timeSpentMs: 2900 } },
      { applicant_id: applicantId, question_id: 'q28', answer: 'Agree', metadata: { timeSpentMs: 3000 } },
      { applicant_id: applicantId, question_id: 'q29', answer: 'Agree', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q30', answer: 'Strongly Agree', metadata: { timeSpentMs: 2800 } },
      { applicant_id: applicantId, question_id: 'q31', answer: 'Agree', metadata: { timeSpentMs: 3100 } },
      { applicant_id: applicantId, question_id: 'q32', answer: 'Agree', metadata: { timeSpentMs: 3400 } },
      { applicant_id: applicantId, question_id: 'q33', answer: 'Strongly Agree', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q34', answer: 'Agree', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q35', answer: 'Strongly Agree', metadata: { timeSpentMs: 3300 } },
      { applicant_id: applicantId, question_id: 'q36', answer: 'Agree', metadata: { timeSpentMs: 3400 } },
      { applicant_id: applicantId, question_id: 'q37', answer: 'Somewhat Agree', metadata: { timeSpentMs: 3600 } },
      { applicant_id: applicantId, question_id: 'q38', answer: 'Agree', metadata: { timeSpentMs: 3200 } },
      { applicant_id: applicantId, question_id: 'q39', answer: 'Agree', metadata: { timeSpentMs: 3300 } },
      { applicant_id: applicantId, question_id: 'q40', answer: 'Somewhat Agree', metadata: { timeSpentMs: 3500 } },
      { applicant_id: applicantId, question_id: 'q41', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 3400 } },

      // Section E - Risk Preference (5 questions)
      { applicant_id: applicantId, question_id: 'q42', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 4500 } },
      { applicant_id: applicantId, question_id: 'q43', answer: 'Disagree', metadata: { timeSpentMs: 4800 } },
      { applicant_id: applicantId, question_id: 'q44', answer: 'Somewhat Agree', metadata: { timeSpentMs: 4600 } },
      { applicant_id: applicantId, question_id: 'q45', answer: 'Disagree', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'q46', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 4700 } },

      // Section F - Self-Control (7 questions)
      { applicant_id: applicantId, question_id: 'q47', answer: 'Agree', metadata: { timeSpentMs: 3800 } },
      { applicant_id: applicantId, question_id: 'q48', answer: 'Disagree', metadata: { timeSpentMs: 3600 } },
      { applicant_id: applicantId, question_id: 'q49', answer: 'Disagree', metadata: { timeSpentMs: 3900 } },
      { applicant_id: applicantId, question_id: 'q50', answer: 'Strongly Agree', metadata: { timeSpentMs: 3700 } },
      { applicant_id: applicantId, question_id: 'q51', answer: 'Agree', metadata: { timeSpentMs: 3800 } },
      { applicant_id: applicantId, question_id: 'q52', answer: 'Agree', metadata: { timeSpentMs: 4000 } },
      { applicant_id: applicantId, question_id: 'q53', answer: 'Strongly Agree', metadata: { timeSpentMs: 3600 } },

      // Section G - Locus of Control (5 questions)
      { applicant_id: applicantId, question_id: 'q54', answer: 'A) My financial security depends mostly on my own actions and decisions.', metadata: { timeSpentMs: 6000 } },
      { applicant_id: applicantId, question_id: 'q55', answer: 'A) I can achieve my financial goals through careful planning.', metadata: { timeSpentMs: 5800 } },
      { applicant_id: applicantId, question_id: 'q56', answer: 'A) Financial success is the result of hard work and smart choices.', metadata: { timeSpentMs: 6200 } },
      { applicant_id: applicantId, question_id: 'q57', answer: 'A) I have control over reaching my financial goals.', metadata: { timeSpentMs: 5600 } },
      { applicant_id: applicantId, question_id: 'q58', answer: 'A) My financial well-being is mostly determined by my own actions.', metadata: { timeSpentMs: 6100 } },

      // Section H - Social Support & Time Orientation (3 questions)
      { applicant_id: applicantId, question_id: 'q59', answer: '3-5 people', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'q60', answer: 'Very often', metadata: { timeSpentMs: 4500 } },
      { applicant_id: applicantId, question_id: 'q61', answer: 'Strongly Agree', metadata: { timeSpentMs: 4200 } },

      // Section G - ASFN Level 1 (5 questions)
      { applicant_id: applicantId, question_id: 'asfn1_1', answer: 'B) Two $20 bills', metadata: { timeSpentMs: 7000 } },
      { applicant_id: applicantId, question_id: 'asfn1_2', answer: 'A) $5', metadata: { timeSpentMs: 8000 } },
      { applicant_id: applicantId, question_id: 'asfn1_3', answer: 'A) $15', metadata: { timeSpentMs: 8500 } },
      { applicant_id: applicantId, question_id: 'asfn1_4', answer: 'C) $12', metadata: { timeSpentMs: 9000 } },
      { applicant_id: applicantId, question_id: 'asfn1_5', answer: 'A) Shop B', metadata: { timeSpentMs: 10000 } },

      // Section G - ASFN Level 2 (5 questions)
      { applicant_id: applicantId, question_id: 'asfn2_1', answer: 'A) Lender A', metadata: { timeSpentMs: 12000 } },
      { applicant_id: applicantId, question_id: 'asfn2_2', answer: 'A) Option A', metadata: { timeSpentMs: 13000 } },
      { applicant_id: applicantId, question_id: 'asfn2_3', answer: 'B) $450', metadata: { timeSpentMs: 14000 } },
      { applicant_id: applicantId, question_id: 'asfn2_4', answer: 'B) Plan B', metadata: { timeSpentMs: 15000 } },
      { applicant_id: applicantId, question_id: 'asfn2_5', answer: 'A) More groceries', metadata: { timeSpentMs: 16000 } }, // Wrong

      // LCA - Loan Consequence Awareness (5 questions)
      { applicant_id: applicantId, question_id: 'lca1', answer: 'A) Contact the lender and explain your situation before the due date.', metadata: { timeSpentMs: 9000 } }, // 3 pts
      { applicant_id: applicantId, question_id: 'lca2', answer: "C) He still owes money because the phone didn't fully cover the debt.", metadata: { timeSpentMs: 10000 } }, // 3 pts
      { applicant_id: applicantId, question_id: 'lca3', answer: 'A) Ego - needs medicine for her sick child; has irregular income.', metadata: { timeSpentMs: 11000 } }, // 3 pts
      { applicant_id: applicantId, question_id: 'lca4', answer: 'B) Cannot get another loan because of the late payments.', metadata: { timeSpentMs: 9500 } }, // 3 pts
      { applicant_id: applicantId, question_id: 'lca5', answer: 'B) $120 ($100 + 10% + 10%)', metadata: { timeSpentMs: 10500 } }, // 1 pt (not best)

      // Gaming Detection (9 questions)
      { applicant_id: applicantId, question_id: 'gd1', answer: 'A) Add it to savings for a specific goal.', metadata: { timeSpentMs: 5500 } },
      { applicant_id: applicantId, question_id: 'gd2', answer: 'B) Review monthly', metadata: { timeSpentMs: 5200 } },
      { applicant_id: applicantId, question_id: 'gd3', answer: 'Yes, weekly', metadata: { timeSpentMs: 5000 } },
      { applicant_id: applicantId, question_id: 'gd4', answer: 'B) Option B ($25 in 1 week)', metadata: { timeSpentMs: 6000 } },
      { applicant_id: applicantId, question_id: 'gd5', answer: 'B) Option B ($70 in 1 month)', metadata: { timeSpentMs: 6500 } },
      { applicant_id: applicantId, question_id: 'gd6', answer: 'B) Option B ($150 in 6 months)', metadata: { timeSpentMs: 7000 } },
      { applicant_id: applicantId, question_id: 'gd7', answer: 'Rarely', metadata: { timeSpentMs: 4500 } },
      { applicant_id: applicantId, question_id: 'gd8', answer: 'Sometimes', metadata: { timeSpentMs: 4800 } },
      { applicant_id: applicantId, question_id: 'gd9', answer: 'Often', metadata: { timeSpentMs: 5000 } },
    ];

    const { error: responsesError } = await supabase
      .from('responses')
      .insert(allResponses);

    if (responsesError) throw responsesError;
    console.log(`   ✅ Inserted ${allResponses.length} responses\n`);

    console.log('3. Inserting scores...');
    const { error: scoreError } = await supabase
      .from('scores')
      .insert({
        applicant_id: applicantId,
        construct_scores: {
          conscientiousness: 4.6,
          neuroticism: 2.0,
          agreeableness: 4.4,
          openness: 4.2,
          extraversion: 3.6,
          financial_numeracy: 4.6,
          loan_consequence_awareness: 4.3,
        },
        construct_z_scores: {
          conscientiousness: 1.0,
          neuroticism: -0.8,
          agreeableness: 0.9,
          openness: 0.7,
          extraversion: 0.2,
          financial_numeracy: 1.0,
          loan_consequence_awareness: 0.9,
        },
        character_score: 88,
        capacity_score: 85,
        capital_score: 90,
        consistency_score: 87,
        conditions_score: 82,
        cwi_raw: 1.9,
        cwi_normalized: 0.87,
        cwi_0_100: 87,
        risk_band: 'LOW',
        risk_percentile: 85,
        country: 'United Kingdom',
        model_version: 'v1.0',
        scored_at: new Date().toISOString(),
      });

    if (scoreError) throw scoreError;
    console.log('   ✅ Scores inserted\n');

    console.log('4. Updating applicant...');
    const { error: updateError } = await supabase
      .from('applicants')
      .update({
        cwi_score: 87,
        risk_category: 'LOW',
        scored_at: new Date().toISOString(),
      })
      .eq('id', applicantId);

    if (updateError) throw updateError;
    console.log('   ✅ Updated\n');

    console.log('═'.repeat(70));
    console.log('✅ COMPLETE SUBMISSION SUCCESSFUL!\n');
    console.log('Applicant: Emma Williams (emma.williams@test.com)\n');
    console.log(`Total Responses: ${allResponses.length} questions`);
    console.log('  - Section B (Financial Behaviour): 15 questions');
    console.log('  - Section C (Crisis): 1 question');
    console.log('  - Section D (Personality): 25 questions');
    console.log('  - Section E (Risk): 5 questions');
    console.log('  - Section F (Self-Control): 7 questions');
    console.log('  - Section G (Locus of Control): 5 questions');
    console.log('  - Section H (Social Support): 3 questions');
    console.log('  - ASFN Level 1: 5 questions');
    console.log('  - ASFN Level 2: 5 questions');
    console.log('  - LCA: 5 questions');
    console.log('  - Gaming Detection: 9 questions\n');
    console.log('Scores:');
    console.log('  CWI: 87/100 (LOW RISK)');
    console.log('  ASFN: 92% (HIGH)');
    console.log('  LCA: 13/15 (86.7%)');
    console.log('  NCI: 90%\n');
    console.log('✅ Check admin dashboard - Emma Williams!');
    console.log(`   Assessment Responses should show ALL ${allResponses.length} questions`);
    console.log('═'.repeat(70));

  } catch (err) {
    console.error('\n❌ FAILED');
    console.error('Error:', err.message);
    if (err.details) console.error('Details:', err.details);
  }
}

createCompleteSubmission();
