import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function DiagnosticTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const log = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  const runDiagnostics = async () => {
    setTesting(true);
    setLogs([]);

    try {
      log('🔍 Starting diagnostics...\n');

      // Test 1: Check Supabase initialization
      log('1️⃣ Testing Supabase client initialization...');
      if (!supabase) {
        log('❌ Supabase client not initialized');
        log(`   VITE_SUPABASE_URL: ${supabaseUrl || 'MISSING'}`);
        log(`   VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'Present' : 'MISSING'}\n`);
        return;
      }
      log('✅ Supabase client initialized\n');

      // Test 2: Check database connection
      log('2️⃣ Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('applicants')
        .select('count')
        .limit(1);

      if (testError) {
        log(`❌ Database connection failed: ${testError.message}`);
        log(`   Code: ${testError.code}`);
        log(`   Details: ${JSON.stringify(testError.details, null, 2)}\n`);
        return;
      }
      log('✅ Database connection successful\n');

      // Test 3: Check if columns exist by trying a minimal insert
      log('3️⃣ Testing if LCA/NCI columns exist...');
      const testId = `diagnostic-${Date.now()}`;
      const minimalData = {
        id: testId,
        session_id: `diag-${Date.now()}`,
        full_name: 'Diagnostic Test',
        email: 'diagnostic@test.com',
        country: 'Test',
        age_range: '25-34',
        gender: 'Test',
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        // Test LCA/NCI columns
        lca_raw_score: 10,
        lca_percent: 66.67,
        nci_score: 75.5,
        asfn_level1_score: 80,
        asfn_level2_score: 60,
        asfn_overall_score: 72,
        asfn_tier: 'MEDIUM',
      };

      log('   Attempting minimal insert with LCA/NCI columns...');
      const { data: insertData, error: insertError } = await supabase
        .from('applicants')
        .insert(minimalData)
        .select();

      if (insertError) {
        log(`❌ Insert failed: ${insertError.message}`);
        log(`   Code: ${insertError.code}`);
        log(`   Hint: ${insertError.hint || 'N/A'}`);
        log(`   Details: ${JSON.stringify(insertError.details, null, 2)}`);

        if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
          log('\n🚨 DIAGNOSIS: Database columns are missing!');
          log('   You need to run the migration in Supabase SQL Editor:');
          log('\n   ALTER TABLE applicants');
          log('   ADD COLUMN IF NOT EXISTS lca_raw_score NUMERIC,');
          log('   ADD COLUMN IF NOT EXISTS lca_percent NUMERIC,');
          log('   ADD COLUMN IF NOT EXISTS nci_score NUMERIC;\n');
        }

        if (insertError.message.includes('permission') || insertError.message.includes('policy')) {
          log('\n🚨 DIAGNOSIS: Row Level Security (RLS) policy issue!');
          log('   The anonymous user cannot insert into the applicants table.');
          log('   Check your RLS policies in Supabase.\n');
        }

        return;
      }

      log('✅ Insert successful with LCA/NCI columns!');
      log(`   Inserted record ID: ${testId}\n`);

      // Test 4: Verify the data was stored correctly
      log('4️⃣ Verifying data was stored correctly...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('applicants')
        .select('id, lca_raw_score, lca_percent, nci_score')
        .eq('id', testId)
        .single();

      if (verifyError) {
        log(`❌ Verification failed: ${verifyError.message}\n`);
        return;
      }

      log('✅ Data retrieved successfully:');
      log(`   LCA Raw Score: ${verifyData.lca_raw_score}`);
      log(`   LCA Percent: ${verifyData.lca_percent}`);
      log(`   NCI Score: ${verifyData.nci_score}\n`);

      // Test 5: Clean up test data
      log('5️⃣ Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('applicants')
        .delete()
        .eq('id', testId);

      if (deleteError) {
        log(`⚠️ Cleanup failed (non-critical): ${deleteError.message}\n`);
      } else {
        log('✅ Test data cleaned up\n');
      }

      log('═'.repeat(70));
      log('🎉 ALL DIAGNOSTICS PASSED!');
      log('Your database is ready for submissions.\n');

    } catch (err: any) {
      log(`\n💥 Unexpected error: ${err.message}`);
      log(`   Stack: ${err.stack}\n`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Database Diagnostic Tool
            </h1>
            <p className="text-gray-600">
              This will test your database connection, check if columns exist, and verify RLS policies.
            </p>
          </div>

          <div className="mb-6">
            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {testing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Diagnostics...</span>
                </>
              ) : (
                <span>Run Diagnostics</span>
              )}
            </button>
          </div>

          {logs.length > 0 && (
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-auto max-h-[600px]">
              {logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          )}

          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>Click the button above to start diagnostics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
