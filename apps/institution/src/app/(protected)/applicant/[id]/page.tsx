'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  Loader2,
  Lock,
} from 'lucide-react';

// Question mapping for display
const questionTexts: Record<string, string> = {
  // Demographics
  demo1: 'What is your full name?',
  demo2: 'Kindly enter your email address',
  demo3: 'Country of residence',
  demo4: 'How old are you?',
  demo5: 'Gender',
  demo6: 'Marital Status',
  demo7: 'Highest Level of Education',
  demo8: 'Employment Status',
  demo9: 'Monthly Income Range',
  demo10: 'Number of People Who Depend on Your Income',
  demo11: 'Do you have an active bank account?',
  demo12: 'Have you taken a loan before?',
  demo13: 'Residency Status',
  // Section B - Financial Behaviour (Q1-Q15)
  q1: 'In the past 12 months, how often did you miss RENT payments?',
  q2: 'In the past 12 months, how often did you miss UTILITY payments?',
  q3: 'In the past 12 months, how often did you miss MOBILE/BROADBAND payments?',
  q4: 'In the past 12 months, how often did you miss INSURANCE payments?',
  q5: 'In the past 12 months, how often did you miss SUBSCRIPTION payments?',
  q6: 'How often have you had to renegotiate payment terms with lenders or service providers?',
  q7: 'I check my account balance regularly.',
  q8: 'I track my expenses consistently.',
  q9: 'I save money regularly.',
  q10: 'I pay my bills on time.',
  q11: 'I follow a monthly budget.',
  q12: 'I compare prices before making purchases.',
  q13: 'I am able to achieve my financial goals.',
  q14: 'If an unexpected expense occurred today, which option would you rely on first?',
  q15: 'How many months of emergency savings do you currently have?',
  // Section C - Crisis Decision-Making (Q16)
  q16: 'In a financial crisis, rank the following from 1 (first priority) to 6 (last priority)',
  // Section D - Personality Big Five (Q17-Q41)
  q17: 'I pay attention to details.',
  q18: 'I follow schedules.',
  q19: 'I complete tasks efficiently.',
  q20: 'I am always prepared.',
  q21: 'I get chores done right away.',
  q22: 'I often feel stressed.',
  q23: 'I worry about many things.',
  q24: 'I get upset easily.',
  q25: 'I feel anxious frequently.',
  q26: 'I have frequent mood swings.',
  q27: "I sympathise with others' feelings.",
  q28: 'I take time out for others.',
  q29: "I feel others' emotions.",
  q30: 'I make people feel at ease.',
  q31: 'I am interested in others.',
  q32: 'I have a vivid imagination.',
  q33: 'I enjoy reflecting on ideas.',
  q34: 'I value artistic experiences.',
  q35: 'I am curious about new things.',
  q36: 'I enjoy exploring new concepts.',
  q37: 'I am the life of the party.',
  q38: 'I feel comfortable around people.',
  q39: 'I start conversations easily.',
  q40: 'I talk to many people at social gatherings.',
  q41: "I don't mind being the centre of attention.",
  // Section E - Risk Preference (Q42-Q46)
  q42: 'I see myself as a risk-taker.',
  q43: 'In a game show, I would choose the riskier option.',
  q44: "I associate the word 'risk' with opportunity.",
  q45: 'I would shift my assets to pursue higher returns.',
  q46: 'I am comfortable with potential losses over several years.',
  // Section F - Self-Control & Impulse Management (Q47-Q53)
  q47: 'I resist temptations well.',
  q48: 'I act impulsively.',
  q49: 'I buy things without thinking.',
  q50: 'I can stay focused on long-term goals.',
  q51: 'I avoid unnecessary spending.',
  q52: 'I control my urges to spend impulsively.',
  q53: 'I think carefully before making purchases.',
  // Section G - Locus of Control (Q54-Q58)
  q54: 'Choose the statement that best reflects your belief (financial security)',
  q55: 'Choose the statement that best reflects your belief (financial planning)',
  q56: 'Choose the statement that best reflects your belief (financial success)',
  q57: 'Choose the statement that best reflects your belief (financial goals)',
  q58: 'Choose the statement that best reflects your belief (financial well-being)',
  // Section H - Social Support & Time Orientation (Q59-Q61)
  q59: 'How many people could you ask to borrow money in an emergency?',
  q60: 'How often do you think about your financial situation 5 years from now?',
  q61: 'I believe small financial decisions today significantly affect my future.',
};

interface Applicant {
  id: string;
  full_name: string;
  email: string;
  country: string;
  age_range: string;
  gender: string;
  marital_status: string;
  education: string;
  employment_status: string;
  income_range: string;
  dependents: string;
  has_bank_account: string;
  loan_history: string;
  residency_status: string;
  cwi_score: number | null;
  risk_category: string | null;
  submitted_at: string;
}

interface Score {
  cwi_0_100: number;
  cwi_raw: number;
  cwi_normalized: number;
  risk_band: string;
  risk_percentile: number;
  character_score: number;
  capacity_score: number;
  capital_score: number;
  collateral_score: number;
  conditions_score: number;
  construct_scores: Record<string, number>;
  construct_z_scores: Record<string, number>;
  model_version: string;
  scored_at: string;
}

interface Response {
  question_id: string;
  answer: string;
  metadata: {
    timeSpentMs?: number;
    answerChanges?: Array<{
      timestamp: number;
      previousValue: string;
      newValue: string;
    }>;
  } | null;
}

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicantId = params.id as string;

  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch applicant
        const { data: applicantData, error: applicantError } = await supabase
          .from('applicants')
          .select('*')
          .eq('id', applicantId)
          .single();

        if (applicantError) {
          console.error('Error fetching applicant:', applicantError);
          setError('Failed to load applicant data');
          return;
        }

        setApplicant(applicantData);

        // Fetch score
        const { data: scoreData, error: scoreError } = await supabase
          .from('scores')
          .select('*')
          .eq('applicant_id', applicantId)
          .single();

        if (scoreError) {
          console.error('Error fetching score:', scoreError);
        } else {
          setScore(scoreData);
        }

        // Fetch ALL responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('question_id, answer, metadata')
          .eq('applicant_id', applicantId)
          .order('question_id');

        if (responsesError) {
          console.error('Error fetching responses:', responsesError);
        } else {
          setResponses(responsesData || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (applicantId) {
      fetchData();
    }
  }, [applicantId, supabase]);

  // Determine eligibility from actual score data
  const isEligible = score ? ['LOW', 'MODERATE'].includes(score.risk_band) : false;

  // Get initials from name
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Five Cs data from actual scores - filter out null/undefined values
  const fiveCsData = score ? [
    { name: 'Character', score: score.character_score, color: 'bg-blue-500' },
    { name: 'Capacity', score: score.capacity_score, color: 'bg-green-500' },
    { name: 'Capital', score: score.capital_score, color: 'bg-purple-500' },
    { name: 'Collateral', score: score.collateral_score, color: 'bg-orange-400' },
    { name: 'Conditions', score: score.conditions_score, color: 'bg-gray-800' },
  ].filter(item => item.score !== null && item.score !== undefined && !isNaN(item.score)) : [];

  // Get risk band color
  const getRiskBandColor = (band: string | null) => {
    switch (band) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'VERY_HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleExportCSV = () => {
    if (!applicant) return;

    // Build CSV with all data
    const rows: string[] = [];

    // Header
    rows.push('Field,Value');

    // Applicant info
    rows.push(`Name,${applicant.full_name || ''}`);
    rows.push(`Email,${applicant.email || ''}`);
    rows.push(`Country,${applicant.country || ''}`);
    rows.push(`Age Range,${applicant.age_range || ''}`);
    rows.push(`Gender,${applicant.gender || ''}`);
    rows.push(`Marital Status,${applicant.marital_status || ''}`);
    rows.push(`Education,${applicant.education || ''}`);
    rows.push(`Employment Status,${applicant.employment_status || ''}`);
    rows.push(`Income Range,${applicant.income_range || ''}`);
    rows.push(`Dependents,${applicant.dependents || ''}`);
    rows.push(`Has Bank Account,${applicant.has_bank_account || ''}`);
    rows.push(`Loan History,${applicant.loan_history || ''}`);
    rows.push(`Residency Status,${applicant.residency_status || ''}`);
    rows.push(`Submitted At,${applicant.submitted_at || ''}`);

    // Score data
    if (score) {
      rows.push('');
      rows.push('Score Data,');
      rows.push(`CWI Score (0-100),${score.cwi_0_100}`);
      rows.push(`CWI Raw,${score.cwi_raw}`);
      rows.push(`CWI Normalized,${score.cwi_normalized}`);
      rows.push(`Risk Band,${score.risk_band}`);
      rows.push(`Risk Percentile,${score.risk_percentile}`);
      rows.push(`Character Score,${score.character_score}`);
      rows.push(`Capacity Score,${score.capacity_score}`);
      rows.push(`Capital Score,${score.capital_score}`);
      rows.push(`Collateral Score,${score.collateral_score}`);
      rows.push(`Conditions Score,${score.conditions_score}`);
      rows.push(`Model Version,${score.model_version}`);
      rows.push(`Scored At,${score.scored_at}`);
    }

    // All responses
    rows.push('');
    rows.push('Responses,');
    responses.forEach(r => {
      const question = questionTexts[r.question_id] || r.question_id;
      const answer = r.answer.replace(/"/g, '""'); // Escape quotes
      rows.push(`"${question}","${answer}"`);
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(applicant.full_name || 'applicant').replace(/\s+/g, '_')}_assessment.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading applicant data...</span>
        </div>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Applicant not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-lg">🌐</span>
          </div>
          <span className="text-xl font-bold text-gray-900">FINPSYCH</span>
        </div>
      </header>

      {/* Title Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">Credit Worthiness Assessment</h1>
        </div>
        <Lock className="w-5 h-5 text-white/60" />
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-6xl mx-auto">
        {/* Applicant Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {getInitials(applicant.full_name)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{applicant.full_name || 'Unknown'}</h2>
                <p className="text-gray-500">
                  Submitted {applicant.submitted_at ? new Date(applicant.submitted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Pdf
              </button>
            </div>
          </div>
        </div>

        {/* Overview Section - Only show if score exists */}
        {score && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>

            {/* Risk Band Alert */}
            {score.risk_band && (
              <div className={`mb-6 p-4 border-l-4 rounded-r-lg ${
                score.risk_band === 'HIGH' || score.risk_band === 'VERY_HIGH'
                  ? 'bg-red-50 border-red-500'
                  : score.risk_band === 'MODERATE_HIGH'
                  ? 'bg-amber-50 border-amber-500'
                  : score.risk_band === 'MODERATE'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${getRiskBandColor(score.risk_band)}`}>
                    {score.risk_band} RISK
                  </span>
                  <span className="text-sm text-gray-600">
                    Percentile: {score.risk_percentile?.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">CWI Score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {score.cwi_0_100 !== null && score.cwi_0_100 !== undefined ? score.cwi_0_100.toFixed(1) : 'N/A'}
                  </span>
                  {score.cwi_0_100 !== null && score.cwi_0_100 !== undefined && (
                    <span className="text-gray-400">/100</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Eligibility</p>
                <span className={`text-2xl font-bold ${isEligible ? 'text-green-600' : 'text-red-600'}`}>
                  {isEligible ? 'Eligible' : 'Not Eligible'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Five Cs Analysis - Only show if score exists */}
        {score && fiveCsData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Five Cs Analysis</h3>

            <div className="grid grid-cols-5 gap-4">
              {fiveCsData.map((item) => (
                <div key={item.name} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">{item.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-3">
                    {(item.score * 100).toFixed(0)}<span className="text-sm text-gray-400 font-normal">/100</span>
                  </p>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${Math.min(item.score * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Construct Scores - Only show if available */}
        {score?.construct_scores && Object.keys(score.construct_scores).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Construct Scores</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Underlying psychological and behavioral measures used to calculate the Five Cs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(score.construct_scores).map(([construct, value]) => (
                <div key={construct} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1 capitalize">{construct.replace(/_/g, ' ')}</p>
                  <p className="text-xl font-bold text-gray-900">{(value as number).toFixed(2)}</p>
                  {score.construct_z_scores?.[construct] !== undefined && (
                    <p className="text-xs text-gray-400">Z-score: {(score.construct_z_scores[construct] as number).toFixed(2)}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Construct scores are raw measurements (typically 0-5 scale) that feed into the Five Cs.
                Z-scores show how this applicant compares to the population average (0 = average, positive = above average, negative = below average).
              </p>
            </div>
          </div>
        )}

        {/* Detailed Assessment Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Assessment Breakdown</h3>

          {/* Section A: Demographic Information */}
          <div className="mb-8">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Section A: Demographic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="text-gray-900">{applicant.full_name || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="text-gray-900">{applicant.email || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Country of Residence</p>
                <p className="text-gray-900">{applicant.country || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Age Range</p>
                <p className="text-gray-900">{applicant.age_range || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                <p className="text-gray-900">{applicant.gender || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Marital Status</p>
                <p className="text-gray-900">{applicant.marital_status || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Highest Level of Education</p>
                <p className="text-gray-900">{applicant.education || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Employment Status</p>
                <p className="text-gray-900">{applicant.employment_status || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Monthly Income Range</p>
                <p className="text-gray-900">{applicant.income_range || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Number of Dependents</p>
                <p className="text-gray-900">{applicant.dependents || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Has Bank Account</p>
                <p className="text-gray-900">{applicant.has_bank_account || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Loan History</p>
                <p className="text-gray-900">{applicant.loan_history || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Residency Status</p>
                <p className="text-gray-900">{applicant.residency_status || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Section B & C: All Assessment Responses */}
          {responses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Assessment Responses ({responses.length} questions)
              </h4>

              <div className="space-y-3">
                {responses.map((response, index) => {
                  const questionText = questionTexts[response.question_id] || `Question ${response.question_id}`;
                  const timeSpent = response.metadata?.timeSpentMs
                    ? `${(response.metadata.timeSpentMs / 1000).toFixed(1)}s`
                    : null;
                  const changeCount = response.metadata?.answerChanges?.length || 0;

                  return (
                    <div key={response.question_id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 mb-1">
                            {index + 1}. {questionText}
                          </p>
                          <p className="text-gray-900 font-medium">{response.answer}</p>
                        </div>
                        {(timeSpent || changeCount > 0) && (
                          <div className="text-xs text-gray-400 text-right">
                            {timeSpent && <p>Time: {timeSpent}</p>}
                            {changeCount > 0 && <p>Changes: {changeCount}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {responses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assessment responses found for this applicant.
            </div>
          )}
        </div>

        {/* Model Info */}
        {score && (
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Model Version: {score.model_version} | Scored: {score.scored_at ? new Date(score.scored_at).toLocaleString() : 'N/A'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
