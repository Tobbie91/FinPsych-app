#!/usr/bin/env node

// Add CWI question responses to test submission
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addCWIResponses() {
  console.log('Adding CWI question responses...\n');

  // Get the test applicant
  const { data: applicant } = await supabase
    .from('applicants')
    .select('id')
    .eq('email', 'testcomplete@example.com')
    .single();

  if (!applicant) {
    console.log('❌ Test applicant not found');
    return;
  }

  // Add more diverse responses including CWI questions
  const newResponses = [
    // Section B - Financial Behaviour (CWI)
    { applicant_id: applicant.id, question_id: 'q3', answer: 'Never', metadata: { timeSpentMs: 3500 } },
    { applicant_id: applicant.id, question_id: 'q4', answer: 'Rarely', metadata: { timeSpentMs: 4200 } },
    { applicant_id: applicant.id, question_id: 'q5', answer: 'Never', metadata: { timeSpentMs: 3800 } },
    { applicant_id: applicant.id, question_id: 'q7', answer: 'Always', metadata: { timeSpentMs: 5000 } },
    { applicant_id: applicant.id, question_id: 'q8', answer: 'Often', metadata: { timeSpentMs: 4500 } },
    { applicant_id: applicant.id, question_id: 'q9', answer: 'Sometimes', metadata: { timeSpentMs: 6000 } },
    { applicant_id: applicant.id, question_id: 'q10', answer: 'Always', metadata: { timeSpentMs: 4000 } },
    // Section D - Personality (CWI)
    { applicant_id: applicant.id, question_id: 'q17', answer: 'Agree', metadata: { timeSpentMs: 3000 } },
    { applicant_id: applicant.id, question_id: 'q18', answer: 'Strongly Agree', metadata: { timeSpentMs: 2500 } },
    { applicant_id: applicant.id, question_id: 'q22', answer: 'Disagree', metadata: { timeSpentMs: 3200 } },
    // Section E - Risk Preference (CWI)
    { applicant_id: applicant.id, question_id: 'q42', answer: 'Somewhat Disagree', metadata: { timeSpentMs: 5500 } },
    { applicant_id: applicant.id, question_id: 'q43', answer: 'Disagree', metadata: { timeSpentMs: 6000 } },
    // Section F - Self-Control (CWI)
    { applicant_id: applicant.id, question_id: 'q47', answer: 'Agree', metadata: { timeSpentMs: 4000 } },
    { applicant_id: applicant.id, question_id: 'q48', answer: 'Disagree', metadata: { timeSpentMs: 3500 } },
    { applicant_id: applicant.id, question_id: 'q51', answer: 'Strongly Agree', metadata: { timeSpentMs: 4200 } },
  ];

  const { error } = await supabase
    .from('responses')
    .insert(newResponses);

  if (error) {
    console.log('❌ Failed:', error.message);
  } else {
    console.log('✅ Added 15 CWI question responses!');
    console.log('\nThese cover:');
    console.log('  - Financial Behaviour (Character)');
    console.log('  - Personality traits (Character)');
    console.log('  - Risk Preference (Capital)');
    console.log('  - Self-Control (Character)');
    console.log('\nRefresh admin dashboard to see them!');
  }
}

addCWIResponses();
