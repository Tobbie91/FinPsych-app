import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function TestSubmission() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; applicantId?: string } | null>(null);

  const handleTestSubmit = async () => {
    if (!supabase) {
      setResult({ success: false, message: 'Supabase client not initialized' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const applicantId = crypto.randomUUID();
      const sessionId = `test-ui-${Date.now()}`;
      const startTime = Date.now() - (20 * 60 * 1000); // Started 20 mins ago

      console.log('🧪 Testing submission from UI...');
      console.log('Applicant ID:', applicantId);

      // Step 1: Insert applicant with ASFN, LCA, and NCI scores
      console.log('1. Creating applicant...');

      const applicantData = {
        id: applicantId,
        session_id: sessionId,
        institution_id: 'test-bank-ui',
        assessment_id: 'ui-test',
        full_name: 'Test User UI',
        email: 'testuser@ui-test.com',
        country: 'Nigeria',
        age_range: '25-34',
        gender: 'Male',
        marital_status: 'Single',
        education: 'Bachelor\'s Degree',
        employment_status: 'Employed Full-time',
        income_range: '₦100,000 - ₦200,000',
        dependents: '1',
        has_bank_account: 'Yes',
        loan_history: 'Yes, paid on time',
        residency_status: 'Renting',
        device_info: {
          browser: 'Chrome',
          os: 'Windows',
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        },
        started_at: new Date(startTime).toISOString(),
        submitted_at: new Date().toISOString(),
        total_time_ms: Date.now() - startTime,
        validation_result: {
          flags: [],
          consistencyScore: 90,
          passedValidation: true
        },
        quality_score: 90,
        response_metadata: {
          session: {
            totalQuestions: 70,
            asfn: {
              level1: { attempted: true, correct: 4, total: 5, accuracy: 80 },
              level2: { attempted: true, correct: 3, total: 5, accuracy: 60 },
              overallScore: 72,
              tier: 'MEDIUM',
            },
            lca: { attempted: true, rawScore: 12, maxScore: 15, percent: 80 },
            nci: 75.2,
          },
        },
        // ASFN scores
        asfn_level1_score: 80,
        asfn_level2_score: 60,
        asfn_overall_score: 72,
        asfn_tier: 'MEDIUM',
        // LCA scores
        lca_raw_score: 12,
        lca_percent: 80,
        // NCI score
        nci_score: 75.2,
      };

      console.log('Attempting to insert applicant:', applicantData);

      const { data: insertedData, error: applicantError } = await supabase
        .from('applicants')
        .insert(applicantData)
        .select();

      if (applicantError) {
        console.error('❌ Applicant insert error:', applicantError);
        throw applicantError;
      }

      console.log('✅ Applicant created:', insertedData);

      // Step 2: Insert sample responses
      console.log('2. Inserting responses...');
      const responses = [
        // CWI questions
        { applicant_id: applicantId, question_id: 'q1', answer: 'Never', metadata: { timeSpentMs: 4000 } },
        { applicant_id: applicantId, question_id: 'q2', answer: 'Rarely', metadata: { timeSpentMs: 3500 } },
        { applicant_id: applicantId, question_id: 'q7', answer: 'Often', metadata: { timeSpentMs: 3200 } },

        // ASFN Level 1
        { applicant_id: applicantId, question_id: 'asfn1_1', answer: 'B) Two $20 bills', metadata: { timeSpentMs: 7000 } },
        { applicant_id: applicantId, question_id: 'asfn1_2', answer: 'A) $5', metadata: { timeSpentMs: 8000 } },
        { applicant_id: applicantId, question_id: 'asfn1_3', answer: 'A) $15', metadata: { timeSpentMs: 9000 } },
        { applicant_id: applicantId, question_id: 'asfn1_4', answer: 'B) $18', metadata: { timeSpentMs: 10000 } }, // Wrong
        { applicant_id: applicantId, question_id: 'asfn1_5', answer: 'A) Shop B', metadata: { timeSpentMs: 11000 } },

        // ASFN Level 2
        { applicant_id: applicantId, question_id: 'asfn2_1', answer: 'A) Lender A', metadata: { timeSpentMs: 12000 } },
        { applicant_id: applicantId, question_id: 'asfn2_2', answer: 'B) Option B', metadata: { timeSpentMs: 13000 } }, // Wrong
        { applicant_id: applicantId, question_id: 'asfn2_3', answer: 'B) $450', metadata: { timeSpentMs: 14000 } },
        { applicant_id: applicantId, question_id: 'asfn2_4', answer: 'B) Plan B', metadata: { timeSpentMs: 15000 } },
        { applicant_id: applicantId, question_id: 'asfn2_5', answer: 'A) More groceries', metadata: { timeSpentMs: 16000 } }, // Wrong

        // LCA Questions
        { applicant_id: applicantId, question_id: 'lca1', answer: 'A) Contact the lender and explain your situation before the due date.', metadata: { timeSpentMs: 9000 } },
        { applicant_id: applicantId, question_id: 'lca2', answer: "C) He still owes money because the phone didn't fully cover the debt.", metadata: { timeSpentMs: 10000 } },
        { applicant_id: applicantId, question_id: 'lca3', answer: 'A) Ego - needs medicine for her sick child; has irregular income.', metadata: { timeSpentMs: 11000 } },
        { applicant_id: applicantId, question_id: 'lca4', answer: 'B) Cannot get another loan because of the late payments.', metadata: { timeSpentMs: 9500 } },
        { applicant_id: applicantId, question_id: 'lca5', answer: "A) $110 (the debt doesn't grow if he doesn't borrow more)", metadata: { timeSpentMs: 10500 } },
      ];

      const { error: responsesError } = await supabase
        .from('responses')
        .insert(responses);

      if (responsesError) {
        console.error('❌ Responses insert error:', responsesError);
        throw responsesError;
      }

      console.log(`✅ Inserted ${responses.length} responses`);

      // Step 3: Insert CWI scores
      console.log('3. Inserting CWI scores...');
      const { error: scoreError } = await supabase
        .from('scores')
        .insert({
          applicant_id: applicantId,
          construct_scores: {
            conscientiousness: 4.0,
            neuroticism: 2.5,
            agreeableness: 3.8,
            financial_numeracy: 3.6,
          },
          construct_z_scores: {
            conscientiousness: 0.5,
            neuroticism: -0.4,
            agreeableness: 0.3,
            financial_numeracy: 0.4,
          },
          character_score: 78,
          capacity_score: 72,
          capital_score: 68,
          consistency_score: 82,
          conditions_score: 76,
          cwi_raw: 1.6,
          cwi_normalized: 0.76,
          cwi_0_100: 76,
          risk_band: 'MODERATE',
          risk_percentile: 70,
          country: 'Nigeria',
          model_version: 'v1.0',
          scored_at: new Date().toISOString(),
        });

      if (scoreError) {
        console.error('❌ Scores insert error:', scoreError);
        throw scoreError;
      }

      console.log('✅ Scores inserted');

      // Step 4: Update applicant with CWI score
      console.log('4. Updating applicant with CWI score...');
      const { error: updateError } = await supabase
        .from('applicants')
        .update({
          cwi_score: 76,
          risk_category: 'MODERATE',
          scored_at: new Date().toISOString(),
        })
        .eq('id', applicantId);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      console.log('✅ Applicant updated');

      setResult({
        success: true,
        message: `✅ Test submission successful! Created applicant: ${applicantId}`,
        applicantId,
      });

      console.log('═'.repeat(70));
      console.log('✅ UI TEST SUBMISSION SUCCESSFUL!');
      console.log('Applicant: Test User UI (testuser@ui-test.com)');
      console.log('ASFN: Level 1: 80%, Level 2: 60%, Overall: 72% (MEDIUM)');
      console.log('LCA: 12/15 = 80%');
      console.log('NCI: 75.2%');
      console.log('CWI: 76 (MODERATE RISK)');
      console.log('═'.repeat(70));

    } catch (err: any) {
      console.error('❌ SUBMISSION FAILED:', err);
      setResult({
        success: false,
        message: `❌ Submission failed: ${err.message || 'Unknown error'}\n\nDetails: ${JSON.stringify(err, null, 2)}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Submission
            </h1>
            <p className="text-gray-600">
              Click the button below to submit test data directly to the database without filling out 100 questions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Test Data Preview:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Name: Test User UI</li>
                <li>• Email: testuser@ui-test.com</li>
                <li>• Country: Nigeria</li>
                <li>• ASFN: Level 1: 80%, Level 2: 60%, Overall: 72% (MEDIUM)</li>
                <li>• LCA: 12/15 = 80%</li>
                <li>• NCI: 75.2% (60% × 72 + 40% × 80)</li>
                <li>• CWI: 76 (MODERATE RISK)</li>
              </ul>
            </div>

            <button
              onClick={handleTestSubmit}
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Test Data</span>
              )}
            </button>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`whitespace-pre-wrap ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.message}
                </p>
                {result.success && result.applicantId && (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => navigate('/')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                    >
                      Go to Home
                    </button>
                    <p className="text-sm text-green-700 text-center">
                      Check your admin dashboard to see the new applicant!
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/questionnaire')}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                ← Back to Questionnaire
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important:</h4>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>Before testing, make sure you've run the database migration:</p>
              <pre className="bg-yellow-100 p-3 rounded mt-2 text-xs overflow-x-auto">
{`ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS lca_raw_score NUMERIC,
ADD COLUMN IF NOT EXISTS lca_percent NUMERIC,
ADD COLUMN IF NOT EXISTS nci_score NUMERIC;`}
              </pre>
              <p className="mt-2">
                If you haven't run this migration yet, the submission will fail.
                Go to your Supabase dashboard → SQL Editor → Paste and run the migration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
