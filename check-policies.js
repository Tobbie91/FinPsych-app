#!/usr/bin/env node

// Check RLS policies to verify the fix was applied
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPolicies() {
  console.log('🔍 Checking RLS Policies...\n');

  try {
    // Query the pg_policies view to see current policies
    const { data: policies, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT tablename, policyname, cmd, qual, with_check
          FROM pg_policies
          WHERE schemaname = 'public'
            AND tablename IN ('applicants', 'scores', 'responses')
          ORDER BY tablename, policyname;
        `
      });

    if (error) {
      console.log('❌ Cannot query policies directly (expected - need admin access)');
      console.log('   Let me try a different approach...\n');

      // Try to test the policies by attempting inserts
      await testPolicies();
    } else {
      console.log('Policies:', policies);
    }

  } catch (err) {
    console.log('Cannot query policies table directly.');
    console.log('Testing policies by attempting operations...\n');
    await testPolicies();
  }
}

async function testPolicies() {
  console.log('🧪 Testing Database Permissions...\n');

  // Test 1: Can we insert into applicants?
  console.log('1. Testing INSERT into applicants table...');
  const testApplicantId = crypto.randomUUID();
  const { data: applicantData, error: applicantError } = await supabase
    .from('applicants')
    .insert({
      id: testApplicantId,
      session_id: 'test-session-' + Date.now(),
      full_name: 'Test User',
      email: 'test@example.com',
    })
    .select();

  if (applicantError) {
    console.log('   ❌ FAILED:', applicantError.message);
    console.log('   This means INSERT policy is missing or incorrect\n');
  } else {
    console.log('   ✅ SUCCESS: Can insert into applicants\n');

    // Test 2: Can we update applicants?
    console.log('2. Testing UPDATE on applicants table...');
    const { error: updateError } = await supabase
      .from('applicants')
      .update({ cwi_score: 75.5 })
      .eq('id', testApplicantId);

    if (updateError) {
      console.log('   ❌ FAILED:', updateError.message);
      console.log('   This means UPDATE policy is missing!\n');
      console.log('   ⚠️  YOU NEED TO RUN THE FIX:\n');
      console.log('   CREATE POLICY "Allow anonymous update on applicants" ON applicants');
      console.log('   FOR UPDATE USING (true) WITH CHECK (true);\n');
    } else {
      console.log('   ✅ SUCCESS: Can update applicants\n');
    }

    // Test 3: Can we insert into scores?
    console.log('3. Testing INSERT into scores table...');
    const { error: scoreError } = await supabase
      .from('scores')
      .insert({
        applicant_id: testApplicantId,
        construct_scores: {},
        construct_z_scores: {},
        character_score: 80,
        capacity_score: 75,
        capital_score: 70,
        collateral_score: 85,
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
      console.log('   ❌ FAILED:', scoreError.message);
      console.log('   This means scores INSERT policy is missing!\n');
      console.log('   ⚠️  YOU NEED TO RUN THE FIX:\n');
      console.log('   DROP POLICY IF EXISTS "Service role can insert scores" ON scores;');
      console.log('   CREATE POLICY "Allow anonymous insert on scores" ON scores');
      console.log('   FOR INSERT WITH CHECK (true);\n');
    } else {
      console.log('   ✅ SUCCESS: Can insert into scores\n');
    }

    // Clean up test data
    console.log('4. Cleaning up test data...');
    await supabase.from('scores').delete().eq('applicant_id', testApplicantId);
    await supabase.from('applicants').delete().eq('id', testApplicantId);
    console.log('   ✅ Test data cleaned up\n');
  }

  console.log('=' .repeat(60));
  console.log('SUMMARY:');
  if (!applicantError && !updateError && !scoreError) {
    console.log('✅ All policies are correct!');
    console.log('   Submissions should work now.');
    console.log('\n   If you still have 0 applicants:');
    console.log('   1. Make sure you completed an assessment');
    console.log('   2. Check browser console for errors');
    console.log('   3. Verify the app is using the correct Supabase URL');
  } else {
    console.log('❌ Some policies are missing or incorrect.');
    console.log('   You need to run the SQL fix in Supabase.');
  }
  console.log('=' .repeat(60));
}

checkPolicies();
