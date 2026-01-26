#!/usr/bin/env node

// Update the test submission to include full ASFN metadata
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateTestSubmission() {
  console.log('Updating test submission with full ASFN metadata...\n');

  const { error } = await supabase
    .from('applicants')
    .update({
      response_metadata: {
        session: {
          totalQuestions: 100,
          asfn: {
            level1: {
              attempted: true,
              correct: 4,
              total: 5,
              accuracy: 80,
            },
            level2: {
              attempted: true,
              correct: 3.5,
              total: 5,
              accuracy: 70,
            },
            overallScore: 76,
            tier: 'HIGH',
          },
        },
      },
    })
    .eq('email', 'testcomplete@example.com');

  if (error) {
    console.log('❌ Failed:', error.message);
  } else {
    console.log('✅ Updated successfully!');
    console.log('\nRefresh your admin dashboard to see the ASFN Summary card.');
  }
}

updateTestSubmission();
