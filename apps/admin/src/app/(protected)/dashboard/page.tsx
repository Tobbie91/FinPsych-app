'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  ChevronDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { getQualityBadgeFromRiskLevel, getQualityBadgeFromValidation } from '@fintech/validation';

// Question mapping for display
const questionTexts: Record<string, string> = {
  // Demographics - NEW question IDs (dem1-dem11)
  demo1: 'What is your full name?',
  demo2: 'Kindly enter your email address',
  dem1: 'What is your age?',
  dem2: 'What is your gender?',
  dem3: 'What is your highest level of education?',
  dem4: 'Location',
  dem5: 'What is your employment status?',
  dem6: 'What is your approximate monthly income?',
  dem7: 'What is your marital status?',
  dem8: 'How many people depend on your income?',
  dem9: 'What is your current housing situation?',
  dem10: 'Do you have an active bank account?',
  dem11: 'Have you taken a loan before?',
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
  // Section I - Neurocognitive (Q62-Q65)
  q62: 'Cognitive Reflection Test: Bat & Ball Problem',
  q63: 'Delay Discounting: ₦5,000 now vs ₦7,500 in one month',
  q64: 'Financial Numeracy: Change calculation (₦2,000 - ₦500 - ₦800)',
  q65: 'Financial Comparison: Lender A vs Lender B',
  // Section G - ASFN Financial Numeracy Assessment
  asfn1_1: 'ASFN L1 Q1: Which amount is MORE?',
  asfn1_2: 'ASFN L1 Q2: Making Change ($10 - $5)',
  asfn1_3: 'ASFN L1 Q3: Simple Budgeting ($50 - $35)',
  asfn1_4: 'ASFN L1 Q4: Proportional Reasoning (rice price)',
  asfn1_5: 'ASFN L1 Q5: Unit Price Comparison (apples)',
  asfn2_1: 'ASFN L2 Q1: Comparing Loan Costs',
  asfn2_2: 'ASFN L2 Q2: Savings Growth Comparison',
  asfn2_3: 'ASFN L2 Q3: Instalment Payment Total Cost',
  asfn2_4: 'ASFN L2 Q4: Investment Growth Comparison',
  asfn2_5: 'ASFN L2 Q5: Real Income Comparison (Inflation)',
  // Loan Consequence Awareness
  lca1: 'LCA Q1: Consequence Prioritization Under Stress',
  lca2: 'LCA Q2: Cascading Consequences Understanding',
  lca3: 'LCA Q3: Necessity vs Want Borrowing Judgment',
  lca4: 'LCA Q4: Long-Term Consequence Recognition',
  lca5: 'LCA Q5: Understanding Debt Accumulation',
  // Gaming Detection
  gd1: 'Gaming Detection: Unexpected Windfall',
  gd2: 'Gaming Detection: Sale Opportunity',
  gd3: 'Gaming Detection: Expense Tracking',
  gd4: 'Gaming Detection: Small Amount Choice',
  gd5: 'Gaming Detection: Medium Amount Choice',
  gd6: 'Gaming Detection: Large Amount Choice',
  gd7: 'Gaming Detection: Recent Savings Pattern',
  gd8: 'Gaming Detection: Interest-Free Loan Offer',
  gd9: 'Gaming Detection: Competing Obligations',
};

interface DeviceInfo {
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  language?: string;
}

interface Applicant {
  id: string;
  full_name: string;
  email: string;
  country: string;
  age_range: string;
  gender: string;
  marital_status?: string;
  education?: string;
  employment_status: string;
  income_range: string;
  dependents?: string;
  has_bank_account?: string;
  loan_history?: string;
  residency_status?: string;
  cwi_score: number | null;
  risk_category: string | null;
  submitted_at: string;
  institution_id: string;
  device_info?: DeviceInfo;
  quality_score?: number | null;
  gaming_risk_level?: string | null;
  validation_result?: {
    totalChecks: number;
    inconsistenciesDetected: number;
    severityLevel: 'MINOR' | 'MODERATE' | 'SEVERE';
    consistencyScore: number;
    flags: Array<{
      checkId: string;
      checkName: string;
      description: string;
      severity: string;
      questions: string[];
    }>;
    recommendation: 'PROCEED' | 'REVIEW' | 'RETAKE';
  } | null;
  response_metadata?: any;
  nci_score?: number | null;
  asfn_overall_score?: number | null;
  lca_raw_score?: number | null;
  lca_percent?: number | null;
}

interface Score {
  applicant_id: string;
  cwi_0_100: number;
  cwi_raw?: number;
  cwi_normalized?: number;
  risk_band: string;
  risk_percentile?: number;
  character_score: number;
  capacity_score: number;
  capital_score: number;
  collateral_score: number;
  conditions_score: number;
  construct_scores?: Record<string, number>;
  gaming_flags?: {
    straightLining?: boolean;
    speedFlag?: boolean;
    inconsistencyScore?: number;
  };
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

// Pie Chart Component (Full pie, not donut)
function PieChart({
  data,
  size = 180,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (total === 0) {
    return (
      <div
        className="rounded-full bg-gray-100 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-gray-400">No data</span>
      </div>
    );
  }

  const radius = size / 2 - 5;
  const centerX = size / 2;
  const centerY = size / 2;

  // Filter out zero values
  const filteredData = data.filter(item => item.value > 0);

  // If only one item, draw a full circle
  if (filteredData.length === 1) {
    const item = filteredData[0];
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill={item.color}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        </svg>
        {hoveredIndex === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg px-3 py-2 text-center pointer-events-none z-10">
            <p className="text-xs text-gray-600 font-medium">{item.value} Responses (100%)</p>
          </div>
        )}
      </div>
    );
  }

  let currentAngle = -90; // Start from top

  const slices = filteredData.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle) * (Math.PI / 180);
    const endRad = (endAngle) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    // Path from center to arc edge and back to center (pie slice)
    const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      d,
      color: item.color,
      label: item.label,
      value: item.value,
      percentage: ((item.value / total) * 100).toFixed(0),
      index,
    };
  });

  const hoveredSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice) => (
          <path
            key={slice.index}
            d={slice.d}
            fill={slice.color}
            className="transition-all cursor-pointer"
            opacity={hoveredIndex === null || hoveredIndex === slice.index ? 1 : 0.6}
            onMouseEnter={() => setHoveredIndex(slice.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      {hoveredSlice && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg px-3 py-2 text-center pointer-events-none z-10">
          <p className="text-xs text-gray-600 font-medium">{hoveredSlice.value} Responses ({hoveredSlice.percentage}%)</p>
        </div>
      )}
    </div>
  );
}

// Country flag emoji mapping - Only Nigeria, Glasgow (UK), and USA
const countryFlags: Record<string, string> = {
  'Nigeria': '🇳🇬',
  'Glasgow': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',  // Scotland flag
  'USA': '🇺🇸',
};

// Country Breakdown Component
function CountryBreakdown({
  countries,
  total
}: {
  countries: [string, number][];
  total: number;
}) {
  if (countries.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-50 rounded-lg flex items-center justify-center">
        <span className="text-sm text-gray-400">No location data</span>
      </div>
    );
  }

  // Filter to only show Nigeria, Glasgow, USA
  const allowedCountries = ['Nigeria', 'Glasgow', 'USA'];
  const filteredCountries = countries.filter(([country]) => allowedCountries.includes(country));
  const maxCount = filteredCountries[0]?.[1] || 1;

  return (
    <div className="w-full space-y-3">
      {filteredCountries.map(([country, count], index) => {
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        const barWidth = (count / maxCount) * 100;
        const flag = countryFlags[country] || '🌍';

        return (
          <div key={country} className="flex items-center gap-3">
            <span className="text-lg">{flag}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-300">{country}</span>
                <span className="text-sm text-gray-400">{count} ({percentage}%)</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#60a5fa' : '#93c5fd'
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [responses, setResponses] = useState<Record<string, Response[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary');
  const itemsPerPage = 10;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Admins can see ALL applicants from ALL institutions
        const { data: applicantsData, error: applicantsError } = await supabase
          .from('applicants')
          .select('*')
          .order('submitted_at', { ascending: false});

        if (applicantsError) {
          console.error('Error fetching applicants:', applicantsError);
        } else {
          console.log('Fetched applicants:', applicantsData?.length || 0);
          setApplicants(applicantsData || []);
          if (applicantsData && applicantsData.length > 0) {
            setSelectedApplicant(applicantsData[0]);
          }
        }

        // Fetch all scores
        if (applicantsData && applicantsData.length > 0) {
          const applicantIds = applicantsData.map(a => a.id);
          const { data: scoresData, error: scoresError } = await supabase
            .from('scores')
            .select('*')
            .in('applicant_id', applicantIds);

          if (scoresError) {
            console.error('Error fetching scores:', scoresError);
          } else if (scoresData) {
            const scoresMap: Record<string, Score> = {};
            scoresData.forEach(score => {
              scoresMap[score.applicant_id] = score;
            });
            setScores(scoresMap);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for new applicants
    const channel = supabase
      .channel('applicants-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'applicants' },
        (payload) => {
          console.log('New applicant detected:', payload.new);
          // Refresh the data when a new applicant is added
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch responses for selected applicant when switching to individual tab
  useEffect(() => {
    const fetchResponses = async () => {
      if (!selectedApplicant || activeTab !== 'individual') return;
      if (responses[selectedApplicant.id]) return; // Already fetched

      setIsLoadingResponses(true);
      try {
        const { data: responsesData, error: responsesError } = await supabase
          .from('responses')
          .select('question_id, answer, metadata')
          .eq('applicant_id', selectedApplicant.id)
          .order('question_id');

        if (responsesError) {
          console.error('Error fetching responses:', responsesError);
        } else {
          setResponses(prev => ({
            ...prev,
            [selectedApplicant.id]: responsesData || []
          }));
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoadingResponses(false);
      }
    };

    fetchResponses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApplicant?.id, activeTab]);

  // Calculate stats from real data
  const totalResponses = applicants.length;
  const todayResponses = applicants.filter(a => {
    const today = new Date();
    const submitted = new Date(a.submitted_at);
    return submitted.toDateString() === today.toDateString();
  }).length;

  // Calculate yesterday's responses for comparison
  const yesterdayResponses = applicants.filter(a => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const submitted = new Date(a.submitted_at);
    return submitted.toDateString() === yesterday.toDateString();
  }).length;

  const todayChange = yesterdayResponses > 0
    ? Math.round(((todayResponses - yesterdayResponses) / yesterdayResponses) * 100)
    : todayResponses > 0 ? 100 : 0;

  // Gaming alerts (high risk applicants)
  const gamingAlerts = applicants.filter(a => {
    const risk = a.risk_category || scores[a.id]?.risk_band;
    return risk === 'HIGH' || risk === 'VERY_HIGH';
  }).length;

  // Age distribution - Group text ages into bins
  const ageBins = applicants.reduce((acc, a) => {
    const age = parseInt(a.age_range);
    if (isNaN(age)) return acc;

    if (age >= 18 && age <= 25) acc['18-25']++;
    else if (age >= 26 && age <= 35) acc['26-35']++;
    else if (age >= 36 && age <= 45) acc['36-45']++;
    else if (age >= 46 && age <= 60) acc['46-60']++;
    else if (age > 60) acc['60+']++;

    return acc;
  }, {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-60': 0,
    '60+': 0,
  } as Record<string, number>);

  // Gender distribution
  const genderDistribution = applicants.reduce((acc, a) => {
    const gender = a.gender || 'Unknown';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Country distribution
  const countryDistribution = applicants.reduce((acc, a) => {
    const country = a.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort countries by count (descending)
  const sortedCountries = Object.entries(countryDistribution)
    .sort(([, a], [, b]) => b - a);

  // ============ FAIRNESS METRICS CALCULATIONS ============
  // These metrics measure bias in the credit scoring model across demographic groups

  // Helper: Check if applicant is "approved" (eligible = LOW or MODERATE risk)
  const isApproved = (applicant: Applicant) => {
    const risk = applicant.risk_category || scores[applicant.id]?.risk_band;
    return risk === 'LOW' || risk === 'MODERATE';
  };

  // Helper: Get CWI score for applicant
  const getScore = (applicant: Applicant) => {
    return applicant.cwi_score || scores[applicant.id]?.cwi_0_100 || null;
  };

  // Group applicants by gender for fairness analysis
  const maleApplicants = applicants.filter(a => a.gender === 'Male');
  const femaleApplicants = applicants.filter(a => a.gender === 'Female');

  // 1. Statistical Parity Difference (SPD)
  // Measures: P(approved | male) - P(approved | female)
  // Fair if: -0.10 <= SPD <= 0.10
  const maleApprovalRate = maleApplicants.length > 0
    ? maleApplicants.filter(isApproved).length / maleApplicants.length
    : 0;
  const femaleApprovalRate = femaleApplicants.length > 0
    ? femaleApplicants.filter(isApproved).length / femaleApplicants.length
    : 0;
  const statisticalParityDiff = maleApplicants.length > 0 && femaleApplicants.length > 0
    ? Math.abs(maleApprovalRate - femaleApprovalRate)
    : 0;
  const spdCompliant = statisticalParityDiff <= 0.10;

  // 2. Disparate Impact Ratio (DIR)
  // Measures: P(approved | female) / P(approved | male) (or vice versa, using min/max)
  // Fair if: 0.80 <= DIR <= 1.20 (the "80% rule")
  const disparateImpactRatio = maleApprovalRate > 0 && femaleApprovalRate > 0
    ? Math.min(maleApprovalRate, femaleApprovalRate) / Math.max(maleApprovalRate, femaleApprovalRate)
    : 1;
  const dirCompliant = disparateImpactRatio >= 0.80;
  const dirLevel = disparateImpactRatio >= 0.90 ? 'High' : disparateImpactRatio >= 0.80 ? 'Medium' : 'Low';

  // 3. Standardized Mean Difference (SMD)
  // Measures: (mean_male - mean_female) / pooled_std_dev
  // Monitor if: SMD > 0.25
  const maleScores = maleApplicants.map(getScore).filter((s): s is number => s !== null);
  const femaleScores = femaleApplicants.map(getScore).filter((s): s is number => s !== null);

  const mean = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const variance = (arr: number[], m: number) => arr.length > 0
    ? arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length
    : 0;

  const maleMean = mean(maleScores);
  const femaleMean = mean(femaleScores);
  const maleVar = variance(maleScores, maleMean);
  const femaleVar = variance(femaleScores, femaleMean);

  // Pooled standard deviation
  const pooledStdDev = Math.sqrt((maleVar + femaleVar) / 2);
  const standardizedMeanDiff = pooledStdDev > 0
    ? Math.abs(maleMean - femaleMean) / pooledStdDev
    : 0;
  const smdLevel = standardizedMeanDiff < 0.15 ? 'Normal' : standardizedMeanDiff < 0.25 ? 'Moderate' : 'High';
  const smdNeedsMonitoring = standardizedMeanDiff >= 0.20;

  // Filter applicants for the table
  const filteredApplicants = applicants.filter(
    (a) =>
      (a.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (a.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Country', 'Age', 'Gender', 'Employment', 'Income', 'CWI Score', 'Quality', 'Risk', 'Submitted'],
      ...applicants.map(a => {
        // Use gaming_risk_level directly if available, else derive from validation_result
        const badge = a.gaming_risk_level
          ? getQualityBadgeFromRiskLevel(a.gaming_risk_level)
          : getQualityBadgeFromValidation(a.validation_result as any);
        return [
          a.full_name || '',
          a.email || '',
          a.country || '',
          a.age_range || '',
          a.gender || '',
          a.employment_status || '',
          a.income_range || '',
          (a.cwi_score || scores[a.id]?.cwi_0_100 || '').toString(),
          badge ? badge.label : 'N/A',
          a.risk_category || scores[a.id]?.risk_band || '',
          new Date(a.submitted_at).toLocaleDateString(),
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all_applicants.csv';
    link.click();
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const { data: applicantsData, error: applicantsError } = await supabase
        .from('applicants')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (applicantsError) {
        console.error('Error fetching applicants:', applicantsError);
      } else {
        console.log('Refreshed - fetched applicants:', applicantsData?.length || 0);
        setApplicants(applicantsData || []);
        if (applicantsData && applicantsData.length > 0 && !selectedApplicant) {
          setSelectedApplicant(applicantsData[0]);
        }
      }

      if (applicantsData && applicantsData.length > 0) {
        const applicantIds = applicantsData.map(a => a.id);
        const { data: scoresData, error: scoresError } = await supabase
          .from('scores')
          .select('*')
          .in('applicant_id', applicantIds);

        if (scoresError) {
          console.error('Error fetching scores:', scoresError);
        } else if (scoresData) {
          const scoresMap: Record<string, Score> = {};
          scoresData.forEach(score => {
            scoresMap[score.applicant_id] = score;
          });
          setScores(scoresMap);
        }
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Age bin colors for histogram
  const ageBinColors: Record<string, string> = {
    '18-25': '#ec4899',  // Pink
    '26-35': '#8b5cf6',  // Purple
    '36-45': '#3b82f6',  // Blue
    '46-60': '#14b8a6',  // Teal
    '60+': '#f59e0b',    // Amber
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#1a2332] via-[#1e2a3d] to-[#0f1419] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Responses overview</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-[#2a3849] border border-slate-700 rounded-lg hover:bg-[#334155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-[#2a3849] border border-slate-700 rounded-lg hover:bg-[#334155] transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Detailed Assessment Breakdown Card */}
      <div className="bg-[#2a3849] rounded-xl border border-slate-700 p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">Detailed Assessment Breakdown</h2>
          <p className="text-sm text-gray-400">Analysis of all survey responses</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-600 mb-6">
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'summary'
                ? 'text-teal-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Summary
            {activeTab === 'summary' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'individual'
                ? 'text-teal-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Individual
            {activeTab === 'individual' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
            )}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Total Responses */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm opacity-90 mb-2">Total Responses</p>
            <p className="text-4xl font-bold">{totalResponses}</p>
            <p className="text-sm opacity-80 mt-1">All time</p>
          </div>

          {/* Assessments Today */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm opacity-90 mb-2">Assessments Today</p>
            <p className="text-4xl font-bold">{todayResponses}</p>
            <p className={`text-sm opacity-90 mt-1`}>
              {todayChange >= 0 ? '+' : ''}{todayChange}% vs yesterday
            </p>
          </div>

          {/* Gaming Alerts */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm opacity-90 mb-2">Gaming Alerts</p>
            <p className="text-4xl font-bold">{gamingAlerts}</p>
            <p className="text-sm opacity-90 mt-1">{gamingAlerts} flagged</p>
          </div>

          {/* System Status */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-sm opacity-90 mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">Operational</p>
              <div className="w-3 h-3 bg-white/90 rounded-full"></div>
            </div>
            <p className="text-sm opacity-90 mt-1">All systems running</p>
          </div>
        </div>
      </div>

      {activeTab === 'summary' ? (
        <>
          {/* Fairness Metrics */}
          <div className="bg-[#2a3849] rounded-xl border border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Fairness Metrics Dashboard</h3>
            <p className="text-sm text-gray-400 mb-4">Comparing approval rates and scores between Male and Female applicants</p>
            <div className="grid grid-cols-3 gap-4">
              {/* Statistical Parity Difference */}
              <div className="bg-[#334155] border border-slate-600 rounded-xl p-4">
                <p className="text-sm text-gray-300 mb-2">Statistical Parity Difference</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-white">
                    {totalResponses > 0 ? statisticalParityDiff.toFixed(2) : 'N/A'}
                  </p>
                  {totalResponses > 0 && (
                    <span className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full ${
                      spdCompliant
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {spdCompliant ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {spdCompliant ? 'Compliant' : 'Review'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">Threshold: ±0.10</p>
                <p className="text-xs text-gray-500 mt-1">
                  Male: {(maleApprovalRate * 100).toFixed(0)}% | Female: {(femaleApprovalRate * 100).toFixed(0)}% approved
                </p>
              </div>

              {/* Disparate Impact Ratio */}
              <div className="bg-[#334155] border border-slate-600 rounded-xl p-4">
                <p className="text-sm text-gray-300 mb-2">Disparate Impact Ratio</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-white">
                    {totalResponses > 0 ? dirLevel : 'N/A'}
                  </p>
                  {totalResponses > 0 && (
                    <span className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full ${
                      dirCompliant
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {dirCompliant ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {dirCompliant ? 'Compliant' : 'Review'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">Threshold: 0.80-1.20</p>
                <p className="text-xs text-gray-500 mt-1">
                  Ratio: {(disparateImpactRatio * 100).toFixed(0)}%
                </p>
              </div>

              {/* Standardized Mean Difference */}
              <div className="bg-[#334155] border border-slate-600 rounded-xl p-4">
                <p className="text-sm text-gray-300 mb-2">Standardized Mean Difference</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-white">
                    {totalResponses > 0 ? smdLevel : 'N/A'}
                  </p>
                  {totalResponses > 0 && (
                    <span className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full ${
                      !smdNeedsMonitoring
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {!smdNeedsMonitoring ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      {!smdNeedsMonitoring ? 'Good' : 'Monitor'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-2">Threshold: &lt;0.25</p>
                <p className="text-xs text-gray-500 mt-1">
                  SMD: {standardizedMeanDiff.toFixed(2)} | M avg: {maleMean.toFixed(1)} | F avg: {femaleMean.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Model Performance */}
          <div className="bg-[#2a3849] rounded-xl border border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Model Performance</h3>
            <p className="text-sm text-gray-400 mb-4">Assessment quality and scoring distribution metrics</p>
            <div className="space-y-4">
              {/* Scoring Coverage - % of applicants that received a score */}
              {(() => {
                const scoredApplicants = applicants.filter(a =>
                  a.cwi_score !== null || scores[a.id]?.cwi_0_100 !== undefined
                ).length;
                const scoringCoverage = totalResponses > 0
                  ? Math.round((scoredApplicants / totalResponses) * 100)
                  : 0;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Scoring Coverage</span>
                      <span className="text-sm text-gray-400">{scoredApplicants}/{totalResponses} scored</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${scoringCoverage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-12">{scoringCoverage}%</span>
                    </div>
                  </div>
                );
              })()}

              {/* Eligibility Rate - % of applicants deemed eligible */}
              {(() => {
                const eligibleCount = applicants.filter(a => {
                  const risk = a.risk_category || scores[a.id]?.risk_band;
                  return risk === 'LOW' || risk === 'MODERATE';
                }).length;
                const eligibilityRate = totalResponses > 0
                  ? Math.round((eligibleCount / totalResponses) * 100)
                  : 0;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-300">Loan Eligibility Rate</span>
                      <span className="text-sm text-gray-400">{eligibleCount}/{totalResponses} eligible</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all"
                          style={{ width: `${eligibilityRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white w-12">{eligibilityRate}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Demographic Distribution */}
          <div className="bg-[#2a3849] rounded-xl border border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-6">Demographic Distribution</h3>
            <div className="grid grid-cols-2 gap-8">
              {/* Age Distribution - Histogram */}
              <div>
                <p className="text-sm font-medium text-gray-300 mb-4">Age Distribution</p>
                {(() => {
                  const maxCount = Math.max(...Object.values(ageBins));
                  const ageBinOrder = ['18-25', '26-35', '36-45', '46-60', '60+'];

                  return (
                    <div className="space-y-3">
                      {ageBinOrder.map((bin) => {
                        const count = ageBins[bin];
                        const percent = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
                        const barHeight = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                          <div key={bin} className="flex items-center gap-3">
                            <div className="w-16 text-xs text-gray-400 text-right">{bin}</div>
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 bg-slate-700 rounded-full h-8 overflow-hidden">
                                <div
                                  className="h-full flex items-center justify-end px-3 transition-all"
                                  style={{
                                    width: `${barHeight}%`,
                                    backgroundColor: ageBinColors[bin],
                                    minWidth: count > 0 ? '30px' : '0'
                                  }}
                                >
                                  {count > 0 && (
                                    <span className="text-xs font-medium text-white">
                                      {count}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="w-12 text-xs text-gray-400">
                                {percent.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Users by Location */}
              <div>
                <p className="text-sm font-medium text-gray-300 mb-4">Users by Location</p>
                <CountryBreakdown countries={sortedCountries} total={totalResponses} />
              </div>
            </div>
          </div>

          {/* Gender Breakdown */}
          <div className="bg-[#2a3849] rounded-xl border border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Gender Breakdown</h3>
            {(() => {
              const maleCount = genderDistribution['Male'] || 0;
              const femaleCount = genderDistribution['Female'] || 0;
              const preferNotToSayCount = genderDistribution['Prefer not to say'] || 0;

              const malePercent = totalResponses > 0 ? (maleCount / totalResponses) * 100 : 0;
              const femalePercent = totalResponses > 0 ? (femaleCount / totalResponses) * 100 : 0;
              const preferNotToSayPercent = totalResponses > 0 ? (preferNotToSayCount / totalResponses) * 100 : 0;

              const genderData = [
                { label: 'Male', count: maleCount, percent: malePercent, color: '#60a5fa' },
                { label: 'Female', count: femaleCount, percent: femalePercent, color: '#ec4899' },
                { label: 'Prefer not to say', count: preferNotToSayCount, percent: preferNotToSayPercent, color: '#a78bfa' },
              ].filter(g => g.count > 0);

              if (genderData.length === 0) {
                return (
                  <div className="h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm text-gray-400">No gender data available</span>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="flex h-10 rounded-lg overflow-hidden">
                    {genderData.map((g) => (
                      <div
                        key={g.label}
                        className="flex items-center justify-center text-white text-sm font-medium transition-all"
                        style={{
                          width: `${g.percent}%`,
                          backgroundColor: g.color,
                          minWidth: g.percent > 0 ? '20px' : '0'
                        }}
                      >
                        {g.percent >= 15 && `${g.percent.toFixed(0)}%`}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6">
                    {genderData.map((g) => (
                      <div key={g.label} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: g.color }}
                        />
                        <span className="text-sm text-gray-600">
                          {g.label}: {g.count} ({g.percent.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* All Applicants Table */}
          <div className="bg-[#2a3849] rounded-xl border border-slate-700">
            <div className="p-4 border-b border-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">All Applicants</h3>
                <span className="px-2 py-1 bg-slate-700 text-gray-300 text-sm rounded-full">
                  {filteredApplicants.length} Total
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 bg-[#334155] border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
                />
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-[#334155] border-b border-slate-600">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Applicant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">CWI Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Quality</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Risk</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      {applicants.length === 0 ? 'No applicants yet' : 'No applicants match your search'}
                    </td>
                  </tr>
                ) : (
                  paginatedApplicants.map((applicant) => {
                    const score = scores[applicant.id];
                    const cwiScore = applicant.cwi_score || score?.cwi_0_100;
                    const risk = applicant.risk_category || score?.risk_band;

                    return (
                      <tr
                        key={applicant.id}
                        className="border-b border-slate-700 hover:bg-[#334155] transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          setActiveTab('individual');
                        }}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                              <span className="text-teal-400 font-semibold text-sm">
                                {getInitials(applicant.full_name)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{applicant.full_name || 'Unknown'}</p>
                              <p className="text-sm text-gray-400">{applicant.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-white">
                            {cwiScore !== null && cwiScore !== undefined ? cwiScore.toFixed(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {(() => {
                            // Use gaming_risk_level directly if available, else derive from validation_result
                            const gamingRiskLevel = applicant.gaming_risk_level;
                            const validationResult = applicant.validation_result;

                            // Primary: Use stored gaming_risk_level
                            // Fallback: Derive from validation_result
                            const badge = gamingRiskLevel
                              ? getQualityBadgeFromRiskLevel(gamingRiskLevel)
                              : getQualityBadgeFromValidation(validationResult as any);

                            if (!badge) {
                              return <span className="text-gray-400 text-sm">N/A</span>;
                            }

                            // Gaming Risk Level Badge Mapping:
                            // MINIMAL -> EXCELLENT (Green)
                            // LOW -> GOOD (Light Green)
                            // MODERATE -> MODERATE (Yellow)
                            // HIGH -> FLAGGED (Orange)
                            // SEVERE -> POOR (Red)
                            const scoreColor = badge.level === 'MINIMAL' || badge.level === 'LOW' ? 'text-green-400' :
                                              badge.level === 'MODERATE' ? 'text-yellow-400' :
                                              badge.level === 'HIGH' ? 'text-orange-400' :
                                              'text-red-400';

                            return (
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${scoreColor}`}>
                                  {badge.level}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.bgColor} ${badge.textColor}`}>
                                  {badge.label}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-4 px-4">
                          {risk ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              risk === 'LOW' ? 'bg-green-100 text-green-700' :
                              risk === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                              risk === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {risk.replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-400">
                          {new Date(applicant.submitted_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-600 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-gray-300 bg-[#334155] border border-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-gray-300 bg-[#334155] border border-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Individual Tab */
        <div className="space-y-6">
          {/* Applicant Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {selectedApplicant && (
                  <>
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-semibold text-lg">
                        {getInitials(selectedApplicant.full_name)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedApplicant.full_name || 'Unknown'}</h2>
                      <p className="text-sm text-gray-500">
                        Submitted {new Date(selectedApplicant.submitted_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <select
                  value={selectedApplicant?.id || ''}
                  onChange={(e) => {
                    const applicant = applicants.find(a => a.id === e.target.value);
                    if (applicant) setSelectedApplicant(applicant);
                  }}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {applicants.map((applicant) => (
                    <option key={applicant.id} value={applicant.id}>
                      {applicant.email || applicant.full_name || applicant.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Device Info Row - Only show if device_info exists */}
            {selectedApplicant?.device_info && (
              <div className="grid grid-cols-4 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Device</p>
                  <p className="font-medium text-gray-900">
                    {(() => {
                      const ua = selectedApplicant.device_info?.userAgent || '';
                      if (/iPhone/i.test(ua)) return 'iPhone';
                      if (/Android/i.test(ua)) return 'Android';
                      if (/iPad/i.test(ua)) return 'iPad';
                      if (/Mobile/i.test(ua)) return 'Mobile';
                      return 'Desktop';
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Browser</p>
                  <p className="font-medium text-gray-900">
                    {(() => {
                      const ua = selectedApplicant.device_info?.userAgent || '';
                      if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
                      if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
                      if (/Firefox/i.test(ua)) return 'Firefox';
                      if (/Edg/i.test(ua)) return 'Edge';
                      return 'Other';
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Screen Size</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplicant.device_info?.screenWidth && selectedApplicant.device_info?.screenHeight
                      ? `${selectedApplicant.device_info.screenWidth}x${selectedApplicant.device_info.screenHeight}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{selectedApplicant.country || 'Unknown'}</p>
                </div>
              </div>
            )}
          </div>

          {selectedApplicant && scores[selectedApplicant.id] && (
            <>
              {/* Overview Section with Gaming Detection */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>

                {/* Gaming Detection Alert */}
                {(() => {
                  const score = scores[selectedApplicant.id];
                  const riskBand = score.risk_band;
                  const cwiScore = score.cwi_0_100;
                  const applicantResponses = responses[selectedApplicant.id] || [];

                  // ===== GET NEUROCOGNITIVE INDEX (NCI) FROM DATABASE =====
                  // NCI = 60% ASFN + 40% LCA (as per PDF specification)
                  const nciScore = selectedApplicant.nci_score || 0;

                  // Determine if there's a significant discrepancy (gaming indicator)
                  const difference = cwiScore - nciScore;
                  const isHighRisk = difference > 30 || riskBand === 'HIGH' || riskBand === 'VERY_HIGH';

                  return (
                    <div className={`mb-6 p-4 border-l-4 rounded-r-lg ${
                      isHighRisk ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-600">
                          Gaming Detection
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          isHighRisk ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {riskBand} RISK
                        </span>
                      </div>
                      {isHighRisk && (
                        <p className="text-red-600 text-sm mb-4">
                          Significant discrepancy detected: CWI score substantially higher than neurocognitive performance
                        </p>
                      )}

                      {/* Score Comparison Grid */}
                      <div className="grid grid-cols-3 gap-6 mt-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">CWI Score</p>
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                              {cwiScore.toFixed(0)}
                              <span className="text-sm font-normal text-gray-400">/100</span>
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1 ${
                              isHighRisk ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                              <AlertTriangle className="w-3 h-3" />
                              {riskBand} Risk
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">NCI (Neurocognitive Index)</p>
                          <span className="text-3xl font-bold text-gray-900">{nciScore.toFixed(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Difference</p>
                          <span className={`text-3xl font-bold ${difference > 40 ? 'text-red-600' : 'text-gray-900'}`}>
                            +{difference.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Five Cs Analysis - Gray card style like screenshot */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Five Cs Analysis</h3>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { name: 'Character', score: scores[selectedApplicant.id].character_score, color: 'bg-blue-500' },
                    { name: 'Capacity', score: scores[selectedApplicant.id].capacity_score, color: 'bg-green-500' },
                    { name: 'Capital', score: scores[selectedApplicant.id].capital_score, color: 'bg-purple-500' },
                    { name: 'Collateral', score: scores[selectedApplicant.id].collateral_score, color: 'bg-orange-400' },
                    { name: 'Conditions', score: scores[selectedApplicant.id].conditions_score, color: 'bg-gray-800' },
                  ].map((item) => (
                    <div key={item.name} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2">{item.name}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-3">
                        {(item.score || 0).toFixed(0)}
                        <span className="text-sm text-gray-400 font-normal">/100</span>
                      </p>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${Math.min(item.score || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASFN Numeracy Summary Card */}
              {selectedApplicant.response_metadata?.session?.asfn && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Financial Numeracy (ASFN) Results
                  </h3>

                  {/* Overall Score */}
                  <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Overall Score:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {selectedApplicant.response_metadata.session.asfn.overallScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedApplicant.response_metadata.session.asfn.tier === 'HIGH'
                          ? 'bg-green-100 text-green-800'
                          : selectedApplicant.response_metadata.session.asfn.tier === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedApplicant.response_metadata.session.asfn.tier} NUMERACY
                      </span>
                    </div>
                  </div>

                  {/* Level 1 Results */}
                  <div className="mb-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-700">Level 1: Functional Numeracy</span>
                      <span className="font-bold text-gray-900">
                        {selectedApplicant.response_metadata.session.asfn.level1.correct}/{selectedApplicant.response_metadata.session.asfn.level1.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${selectedApplicant.response_metadata.session.asfn.level1.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {selectedApplicant.response_metadata.session.asfn.level1.accuracy.toFixed(0)}% correct
                    </span>
                  </div>

                  {/* Level 2 Results (if attempted) */}
                  {selectedApplicant.response_metadata.session.asfn.level2.attempted ? (
                    <div className="mb-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">Level 2: Financial Comparison</span>
                        <span className="font-bold text-gray-900">
                          {selectedApplicant.response_metadata.session.asfn.level2.correct}/{selectedApplicant.response_metadata.session.asfn.level2.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${selectedApplicant.response_metadata.session.asfn.level2.accuracy}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedApplicant.response_metadata.session.asfn.level2.accuracy!.toFixed(0)}% correct
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <span className="text-sm text-yellow-800">
                        ⚠️ Level 2 not attempted (requires 60% on Level 1)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Loan Consequence Awareness (LCA) Card */}
              {selectedApplicant.lca_raw_score !== null && selectedApplicant.lca_raw_score !== undefined && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Loan Consequence Awareness (LCA)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Raw Score:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {selectedApplicant.lca_raw_score.toFixed(0)}/15
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Percentage:</span>
                      <span className="text-xl font-bold text-indigo-600">
                        {selectedApplicant.lca_percent?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Measures understanding of debt consequences, risk prioritization, and compound interest (5 questions, max 3 points each).
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${Math.min(selectedApplicant.lca_percent ?? 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Neurocognitive Index (NCI) Summary Card */}
              {selectedApplicant.nci_score !== null && selectedApplicant.nci_score !== undefined && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Neurocognitive Index (NCI)
                  </h3>
                  <div className="mb-4 p-4 rounded-lg bg-white border border-indigo-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Overall NCI Score:</span>
                      <span className="text-3xl font-bold text-indigo-600">
                        {selectedApplicant.nci_score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>ASFN (60% weight):</span>
                      <span className="font-medium">{selectedApplicant.asfn_overall_score?.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LCA (40% weight):</span>
                      <span className="font-medium">{selectedApplicant.lca_percent?.toFixed(1)}%</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      Formula: NCI = (0.6 × ASFN) + (0.4 × LCA)
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Assessment Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Detailed Assessment Breakdown</h3>
                  {(() => {
                    // Calculate total time from responses
                    const applicantResponses = responses[selectedApplicant.id] || [];
                    const totalTimeMs = applicantResponses.reduce((sum, r) => sum + (r.metadata?.timeSpentMs || 0), 0);
                    const totalMins = Math.round(totalTimeMs / 60000);
                    return totalMins > 0 ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {totalMins} mins
                      </span>
                    ) : null;
                  })()}
                </div>

                {isLoadingResponses ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading responses...</span>
                  </div>
                ) : (
                  <>
                    {/* ASFN Questions Section */}
                    {responses[selectedApplicant.id]?.filter(r => r.question_id.startsWith('asfn')).length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">
                          Financial Numeracy (ASFN) Questions
                        </h4>
                        <div className="space-y-2">
                          {(() => {
                            // ASFN correct answers mapping
                            const asfnCorrectAnswers: Record<string, string> = {
                              'asfn1_1': 'B) Two $20 bills',
                              'asfn1_2': 'A) $5',
                              'asfn1_3': 'A) $15',
                              'asfn1_4': 'C) $12',
                              'asfn1_5': 'A) Shop B',
                              'asfn2_1': 'A) Lender A',
                              'asfn2_2': 'A) Option A',
                              'asfn2_3': 'B) $450',
                              'asfn2_4': 'B) Plan B',
                              'asfn2_5': 'B) Less groceries',
                            };

                            return responses[selectedApplicant.id]
                              .filter(r => r.question_id.startsWith('asfn'))
                              .sort((a, b) => a.question_id.localeCompare(b.question_id))
                              .map((response) => {
                                const correctAnswer = asfnCorrectAnswers[response.question_id];
                                const isCorrect = correctAnswer === response.answer;

                                return (
                                  <div
                                    key={response.question_id}
                                    className={`p-3 rounded-lg border-l-4 ${
                                      isCorrect
                                        ? 'bg-green-50 border-green-500'
                                        : 'bg-red-50 border-red-500'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                          {questionTexts[response.question_id] || response.question_id}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          <span className="font-semibold">User Answer:</span> {response.answer}
                                        </p>
                                        {!isCorrect && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-semibold">Correct Answer:</span> {correctAnswer}
                                          </p>
                                        )}
                                      </div>
                                      <div>
                                        {isCorrect ? (
                                          <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                          <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              });
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Assessment Responses */}
                    {responses[selectedApplicant.id] && responses[selectedApplicant.id].length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                          Assessment Responses ({responses[selectedApplicant.id].length} questions)
                        </h4>
                        <div className="space-y-3">
                          {responses[selectedApplicant.id].map((response, index) => {
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
                                    <div className="text-xs text-gray-400 text-right flex-shrink-0">
                                      {timeSpent && <p>Time: {timeSpent}</p>}
                                      {changeCount > 0 && (
                                        <p className="text-orange-500">Changes: {changeCount}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(!responses[selectedApplicant.id] || responses[selectedApplicant.id].length === 0) && !isLoadingResponses && (
                      <div className="text-center py-8 text-gray-500">
                        No assessment responses found for this applicant.
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {!selectedApplicant && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              No applicant selected. Choose an applicant from the dropdown above.
            </div>
          )}

          {selectedApplicant && !scores[selectedApplicant.id] && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              No score data available for this applicant.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
