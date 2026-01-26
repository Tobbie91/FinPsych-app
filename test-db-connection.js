#!/usr/bin/env node

// Quick database connection test
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Check applicants table
    console.log('1. Fetching applicants...');
    const { data: applicants, error: applicantsError } = await supabase
      .from('applicants')
      .select('id, full_name, email, submitted_at')
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (applicantsError) {
      console.error('❌ Error fetching applicants:', applicantsError.message);
      console.error('   Details:', JSON.stringify(applicantsError, null, 2));
    } else {
      console.log(`✅ Applicants table accessible`);
      console.log(`   Found ${applicants.length} applicants`);
      if (applicants.length > 0) {
        console.log('\n   Recent applicants:');
        applicants.forEach((a, i) => {
          console.log(`   ${i + 1}. ${a.full_name || 'No name'} (${a.email || 'No email'}) - ${new Date(a.submitted_at).toLocaleString()}`);
        });
      } else {
        console.log('   ⚠️  No applicants found in database');
      }
    }

    console.log('\n2. Fetching scores...');
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('applicant_id, cwi_0_100, risk_band')
      .limit(10);

    if (scoresError) {
      console.error('❌ Error fetching scores:', scoresError.message);
    } else {
      console.log(`✅ Scores table accessible`);
      console.log(`   Found ${scores.length} score records`);
    }

    console.log('\n3. Fetching responses...');
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('applicant_id, question_id')
      .limit(10);

    if (responsesError) {
      console.error('❌ Error fetching responses:', responsesError.message);
    } else {
      console.log(`✅ Responses table accessible`);
      console.log(`   Found ${responses.length} response records`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('DIAGNOSIS:');
    if (applicants && applicants.length === 0) {
      console.log('❌ NO DATA IN DATABASE');
      console.log('   Possible causes:');
      console.log('   1. No assessments have been submitted yet');
      console.log('   2. Submissions are failing (check browser console)');
      console.log('   3. Row Level Security (RLS) blocking inserts');
    } else {
      console.log('✅ Database has data');
      console.log('   Admin dashboard should be able to fetch this data');
    }
    console.log('='.repeat(50));

  } catch (err) {
    console.error('\n❌ Connection test failed:', err.message);
    console.error('   Full error:', err);
  }
}

testConnection();
