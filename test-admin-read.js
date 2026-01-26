#!/usr/bin/env node

// Test if admin dashboard can SELECT applicants
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uxbznksmtdlfqbltjbmo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Ynpua3NtdGRsZnFibHRqYm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzE1MDMsImV4cCI6MjA4MjkwNzUwM30.HKCm4NCdPDvauVkO5N5_osxGEce0auh_SH-iacX24jE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminRead() {
  console.log('🔍 Testing Admin Dashboard SELECT...\n');

  // This is exactly what admin dashboard does
  const { data, error } = await supabase
    .from('applicants')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.log('❌ SELECT FAILED');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    console.log('\n🔴 Admin dashboard CANNOT read applicants!');
    console.log('   You need to add SELECT policy for anon role.');
  } else {
    console.log('✅ SELECT SUCCEEDED');
    console.log(`   Found ${data?.length || 0} applicants\n`);
    
    if (data && data.length > 0) {
      console.log('Recent submissions:');
      data.slice(0, 5).forEach((a, i) => {
        console.log(`${i + 1}. ${a.full_name || 'No name'} - ${a.email || 'No email'}`);
        console.log(`   Submitted: ${a.submitted_at}`);
        console.log(`   CWI Score: ${a.cwi_score || 'Not scored'}`);
        console.log(`   ASFN Tier: ${a.asfn_tier || 'Not available'}\n`);
      });
    }
  }
}

testAdminRead();
