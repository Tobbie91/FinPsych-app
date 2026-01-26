#!/usr/bin/env node

// Advanced diagnostics - try to figure out what's wrong
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  console.log('🔍 ADVANCED DIAGNOSTICS\n');
  console.log('=' .repeat(60));

  // Test 1: Check if RLS is even enabled
  console.log('\n1️⃣  Checking RLS Status...');
  console.log('   Testing with a simple insert to see the exact error...\n');

  const testId = crypto.randomUUID();

  const { data, error } = await supabase
    .from('applicants')
    .insert({
      id: testId,
      session_id: 'diagnostic-' + Date.now(),
      full_name: 'Diagnostic Test',
      email: 'test@diagnostic.com',
    })
    .select();

  if (error) {
    console.log('   ❌ INSERT FAILED');
    console.log('   Error code:', error.code);
    console.log('   Error message:', error.message);
    console.log('   Error details:', error.details);
    console.log('   Error hint:', error.hint);

    if (error.message.includes('row-level security')) {
      console.log('\n   🔴 RLS IS BLOCKING THE INSERT');
      console.log('   This means either:');
      console.log('   a) The policy was not created');
      console.log('   b) The policy was created but without TO anon');
      console.log('   c) There are conflicting policies');
      console.log('\n   ⚠️  SOLUTION: Try disabling RLS completely:');
      console.log('   1. Go to Supabase Dashboard');
      console.log('   2. Table Editor → applicants');
      console.log('   3. Click "RLS" toggle to DISABLE');
      console.log('   4. Run this script again');
      console.log('   5. If it works, re-enable RLS and add policies via UI');
    } else {
      console.log('\n   The error is NOT related to RLS.');
      console.log('   It might be a different issue:', error.message);
    }
  } else {
    console.log('   ✅ INSERT SUCCEEDED!');
    console.log('   Data:', data);
    console.log('\n   🎉 RLS policies are working correctly!');

    // Clean up
    await supabase.from('applicants').delete().eq('id', testId);
    console.log('   Test data cleaned up.\n');

    console.log('   ✅ Everything is working!');
    console.log('   You can now submit assessments.');
  }

  console.log('\n' + '=' .repeat(60));

  // Test 2: Show what we're using
  console.log('\n2️⃣  Connection Info:');
  console.log('   URL:', supabaseUrl);
  console.log('   Using: anon key (public, read-only by default)');
  console.log('   Auth header:', supabaseAnonKey.substring(0, 50) + '...');

  console.log('\n' + '=' .repeat(60));
  console.log('\nDIAGNOSTICS COMPLETE\n');
}

diagnose();
