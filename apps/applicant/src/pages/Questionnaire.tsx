import { CloudUpload, ChevronLeft, ChevronRight, GripVertical, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  sections,
  type Question,
  type CreditCategory,
  categoryColors,
} from '../data/questions';
import { calculateCWI, calculateNCI, type RawResponses } from '@fintech/scoring';
import {
  validateResponses,
  deriveGamingRiskLevel,
  calculateFinPsychScore,
  type ValidationResult,
} from '@fintech/validation';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Types for metadata tracking
interface QuestionMetadata {
  questionId: string;
  startTime: number; // timestamp when question was shown
  endTime?: number; // timestamp when answer was submitted
  timeSpentMs: number; // time spent on question in milliseconds
  answerChanges: AnswerChange[]; // history of answer changes
  finalAnswer: string;
}

interface AnswerChange {
  timestamp: number;
  previousValue: string;
  newValue: string;
}

interface SessionMetadata {
  sessionId: string;
  institutionId?: string;
  assessmentId?: string;
  startTime: number;
  endTime?: number;
  totalTimeMs?: number;
  deviceInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    timezone: string;
    language: string;
  };
  asfn?: {
    level1: {
      attempted: boolean;
      correct: number;
      total: number;
      accuracy: number;
    };
    level2: {
      attempted: boolean;
      correct: number;
      total: number;
      accuracy: number | null;
    };
    overallScore: number;
    tier: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  lca?: {
    attempted: boolean;
    rawScore: number;
    maxScore: number;
    percent: number;
  };
  nci?: number;
}

// Get all questions flattened
function getAllQuestions() {
  return sections.flatMap((section) =>
    section.questions.map((q) => ({
      ...q,
      sectionId: section.id,
      sectionTitle: section.subtitle || section.title,
    }))
  );
}

// Generate unique session ID
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Category Badge Component for 5C questions
function CategoryBadge({ category, description, isNeurocognitive }: { category: CreditCategory; description?: string; isNeurocognitive?: boolean }) {
  const colors = categoryColors[category];

  // Neurocognitive questions - simple badge
  if (isNeurocognitive) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
        Neurocognitive
      </span>
    );
  }

  // Regular CWI questions
  const displayText = description ? `CWI - ${category} - ${description}` : `CWI - ${category}`;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {displayText}
    </span>
  );
}

// Section Badge Component
function SectionBadge({ isDemographic, category, description, isNeurocognitive }: { isDemographic: boolean; category?: CreditCategory; description?: string; isNeurocognitive?: boolean }) {
  if (isDemographic) {
    return (
      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-pink-500 text-white">
        Demographics Questions
      </span>
    );
  }

  if (category) {
    return <CategoryBadge category={category} description={description} isNeurocognitive={isNeurocognitive} />;
  }

  return null;
}

// Text Input Question Component
function TextQuestion({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
    />
  );
}

// Email Input Question Component
function EmailQuestion({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your email"
      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-700"
    />
  );
}

// Scale Question Component
function ScaleQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {question.options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            value === option
              ? 'bg-teal-500 text-white border-teal-500'
              : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// Select Question Component
function SelectQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <label
          key={option}
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            value === option
              ? 'bg-teal-50 border-teal-500'
              : 'bg-white border-gray-200 hover:border-teal-300'
          }`}
        >
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="w-4 h-4 text-teal-500 focus:ring-teal-500"
          />
          <span className="text-gray-700">{option}</span>
        </label>
      ))}
    </div>
  );
}

// Ranking Question Component with up/down buttons
function RankingQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  const [items, setItems] = useState<string[]>(question.options);

  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch {
        // Keep default order
      }
    }
  }, []);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setItems(newItems);
    onChange(JSON.stringify(newItems));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-3">Use arrows to reorder (1 = first priority)</p>
      {items.map((item, index) => (
        <div
          key={item}
          className="flex items-center gap-2 p-3 rounded-lg border bg-white border-gray-200 hover:border-teal-300 transition-all"
        >
          {/* Up/Down buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => moveItem(index, index - 1)}
              disabled={index === 0}
              className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                index === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-teal-100 hover:text-teal-600'
              }`}
              aria-label="Move up"
            >
              <ChevronLeft className="w-4 h-4 rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => moveItem(index, index + 1)}
              disabled={index === items.length - 1}
              className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                index === items.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-teal-100 hover:text-teal-600'
              }`}
              aria-label="Move down"
            >
              <ChevronRight className="w-4 h-4 rotate-90" />
            </button>
          </div>
          <GripVertical className="w-5 h-5 text-gray-300" />
          <span className="w-6 h-6 flex items-center justify-center bg-teal-500 text-white rounded-full text-sm font-medium">
            {index + 1}
          </span>
          <span className="text-gray-700 flex-1">{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  // ASFN adaptive logic state
  const [asfnLevel1Complete, setAsfnLevel1Complete] = useState(false);
  const [asfnLevel2Unlocked, setAsfnLevel2Unlocked] = useState(false);

  // Metadata tracking
  const [sessionMetadata] = useState<SessionMetadata>(() => ({
    sessionId: generateSessionId(),
    institutionId: searchParams.get('institution') || undefined,
    assessmentId: searchParams.get('assessment') || undefined,
    startTime: Date.now(),
    deviceInfo: {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    },
  }));

  const [questionMetadata, setQuestionMetadata] = useState<Record<string, QuestionMetadata>>({});
  const questionStartTimeRef = useRef<number>(Date.now());

  const allQuestions = getAllQuestions();

  // TEST MODE: Auto-fill and jump to last question
  useEffect(() => {
    const testMode = searchParams.get('test') === 'true';
    if (testMode && Object.keys(formData).length === 0) {
      console.log('🧪 TEST MODE: Auto-filling all questions...');
      const autoFilledData: Record<string, string> = {};

      allQuestions.forEach(q => {
        if (q.type === 'select' && q.options && q.options.length > 0) {
          autoFilledData[q.id] = q.options[0];
        } else if (q.type === 'text') {
          autoFilledData[q.id] = 'Test';
        } else if (q.type === 'email') {
          autoFilledData[q.id] = 'test@example.com';
        } else if (q.type === 'scale') {
          autoFilledData[q.id] = '3';
        }
      });

      setFormData(autoFilledData);
      setAsfnLevel2Unlocked(true); // Unlock level 2

      // Jump to second-to-last question so user can click Submit
      setTimeout(() => {
        setCurrentQuestionIndex(allQuestions.length - 2);
        console.log('✅ Jumped to question', allQuestions.length - 1);
      }, 100);
    }
  }, [searchParams]);

  // ASFN adaptive logic: Filter questions based on Level 1 performance
  const questionsToShow = allQuestions.filter(q => {
    // Show Level 2 questions only if Level 1 passed
    if (q.id.startsWith('asfn2_')) {
      return asfnLevel2Unlocked;
    }
    return true;
  });

  const totalQuestions = questionsToShow.length;
  const displayTotalQuestions = allQuestions.length; // Always show full count (stable)
  const currentQuestion = questionsToShow[currentQuestionIndex];
  const isDemographic = currentQuestion?.sectionId === 'section-a';
  const isNeurocognitive = currentQuestion?.sectionId === 'section-g';

  // Calculate progress using full question count for stable display
  const displayQuestionNumber = currentQuestion
    ? allQuestions.findIndex(q => q.id === currentQuestion.id) + 1
    : currentQuestionIndex + 1;
  const answeredQuestions = Object.keys(formData).length;
  const progress = Math.round((answeredQuestions / displayTotalQuestions) * 100);

  // Check if current question is answered (required to proceed)
  const isCurrentQuestionAnswered = currentQuestion
    ? Boolean(formData[currentQuestion.id])
    : false;

  // Track when a new question is shown
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentQuestionIndex]);

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        localStorage.setItem(`finpsych_draft_${sessionMetadata.sessionId}`, JSON.stringify({
          formData,
          questionMetadata,
          currentQuestionIndex,
        }));
        setLastSaved(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, questionMetadata, currentQuestionIndex, sessionMetadata.sessionId]);

  // ASFN Level 1 scoring and Level 2 unlock logic
  useEffect(() => {
    const level1Questions = allQuestions.filter(q => q.id.startsWith('asfn1_'));
    const level1Answered = level1Questions.every(q => formData[q.id]);

    if (level1Answered && !asfnLevel1Complete) {
      // Calculate Level 1 score
      let correct = 0;
      level1Questions.forEach(q => {
        const userAnswer = formData[q.id];
        if (userAnswer === q.correctAnswer) {
          correct++;
        }
      });

      const score = (correct / level1Questions.length) * 100;
      setAsfnLevel1Complete(true);

      // Unlock Level 2 if score >= 60%
      if (score >= 60) {
        setAsfnLevel2Unlocked(true);
      }
    }
  }, [formData, allQuestions, asfnLevel1Complete]);

  // Default Q4/Q5 to N/A based on DEM12/DEM13 responses
  // Only default when user selects "No, never had one" AND Q4/Q5 hasn't been answered yet
  // User can still override - this is just a helpful default
  useEffect(() => {
    const insuranceStatus = formData['dem12'];
    const subscriptionStatus = formData['dem13'];
    const updates: Record<string, string> = {};

    // Default Q4 to N/A only if:
    // 1. User selected "No, never had one" for insurance
    // 2. Q4 hasn't been answered yet (empty/undefined)
    if (insuranceStatus === 'No, never had one' && !formData['q4']) {
      updates['q4'] = 'N/A (I do not have insurance)';
    }

    // Default Q5 to N/A only if:
    // 1. User selected "No, never had one" for subscriptions
    // 2. Q5 hasn't been answered yet (empty/undefined)
    if (subscriptionStatus === 'No, never had one' && !formData['q5']) {
      updates['q5'] = 'N/A (I do not have subscriptions)';
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [formData['dem12'], formData['dem13']]);

  // Record metadata when answer changes
  const handleInputChange = useCallback((value: string) => {
    const now = Date.now();
    const questionId = currentQuestion.id;
    const previousValue = formData[questionId] || '';

    // Update form data
    setFormData((prev) => ({ ...prev, [questionId]: value }));

    // Update metadata
    setQuestionMetadata((prev) => {
      const existing = prev[questionId];
      const timeSpentMs = now - questionStartTimeRef.current;

      if (existing) {
        // Record answer change if value is different
        const answerChanges = [...existing.answerChanges];
        if (previousValue !== value) {
          answerChanges.push({
            timestamp: now,
            previousValue,
            newValue: value,
          });
        }

        return {
          ...prev,
          [questionId]: {
            ...existing,
            timeSpentMs: existing.timeSpentMs + (now - (existing.endTime || existing.startTime)),
            endTime: now,
            answerChanges,
            finalAnswer: value,
          },
        };
      } else {
        // First time answering this question
        return {
          ...prev,
          [questionId]: {
            questionId,
            startTime: questionStartTimeRef.current,
            endTime: now,
            timeSpentMs,
            answerChanges: previousValue !== value && previousValue !== '' ? [{
              timestamp: now,
              previousValue,
              newValue: value,
            }] : [],
            finalAnswer: value,
          },
        };
      }
    });
  }, [currentQuestion?.id, formData]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    console.log('🔥 handleNext FIRED!', { currentQuestionIndex, totalQuestions });

    // Clear any error
    setError(null);

    if (currentQuestionIndex < totalQuestions - 1) {
      console.log('➡️ Moving to next question');
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question - run validation before submission
      console.log('🚀 LAST QUESTION - Running validation and submit...');
      showToast('Submitting your assessment...', 'info', 5000);
      runValidationAndSubmit();
    }
  };

  const runValidationAndSubmit = () => {
    try {
      // Run consistency checks
      const validation = validateResponses(formData);

      // Proceed with submission regardless of validation severity
      // Validation results will be stored in the database for analysis
      handleSubmit(validation);
    } catch (err) {
      console.error('Validation error:', err);
      // If validation fails, submit anyway with a default validation result
      const defaultValidation: ValidationResult = {
        totalChecks: 0,
        inconsistenciesDetected: 0,
        severityLevel: 'MINOR',
        consistencyScore: 100,
        flags: [],
        recommendation: 'PROCEED',
      };
      handleSubmit(defaultValidation);
    }
  };

  const handleSubmit = async (validation: ValidationResult) => {
    console.log('🚀 handleSubmit called');
    setIsSubmitting(true);
    setError(null);

    try {
      // Run CWI scoring engine first to get construct scores
      const country = formData['dem4'] || 'Other';
      const scoringResult = calculateCWI(formData as RawResponses, country);
      console.log('✅ CWI scoring completed');

      // Calculate ASFN scores
      console.log('📊 Calculating ASFN scores...');
      const asfnLevel1Questions = allQuestions.filter(q => q.id.startsWith('asfn1_'));
      const asfnLevel2Questions = allQuestions.filter(q => q.id.startsWith('asfn2_'));

    let asfnLevel1Correct = 0;
    let asfnLevel2Correct = 0;
    let asfnLevel2Attempted = false;

    asfnLevel1Questions.forEach(q => {
      if (formData[q.id] === q.correctAnswer) asfnLevel1Correct++;
    });

    if (asfnLevel2Unlocked) {
      asfnLevel2Attempted = true;
      asfnLevel2Questions.forEach(q => {
        if (formData[q.id] === q.correctAnswer) asfnLevel2Correct++;
      });
    }

    const asfnLevel1Accuracy = (asfnLevel1Correct / asfnLevel1Questions.length) * 100;
    const asfnLevel2Accuracy = asfnLevel2Attempted
      ? (asfnLevel2Correct / asfnLevel2Questions.length) * 100
      : null;

    // Overall score: (Total Correct / Total Attempted) × 100
    // Attempted = 5 if L2 not unlocked, 10 if both levels attempted
    const totalCorrect = asfnLevel1Correct + (asfnLevel2Attempted ? asfnLevel2Correct : 0);
    const totalAttempted = asfnLevel2Attempted ? 10 : 5;
    const asfnOverallScore = (totalCorrect / totalAttempted) * 100;

    // Determine tier: HIGH ≥80%, MEDIUM ≥60%, LOW <60%
    let asfnTier: 'LOW' | 'MEDIUM' | 'HIGH';
    if (asfnOverallScore >= 80) asfnTier = 'HIGH';
    else if (asfnOverallScore >= 60) asfnTier = 'MEDIUM';
    else asfnTier = 'LOW';

    const asfnMetadata = {
      level1: {
        attempted: true,
        correct: asfnLevel1Correct,
        total: asfnLevel1Questions.length,
        accuracy: asfnLevel1Accuracy,
      },
      level2: {
        attempted: asfnLevel2Attempted,
        correct: asfnLevel2Correct,
        total: asfnLevel2Questions.length,
        accuracy: asfnLevel2Accuracy,
      },
      overallScore: asfnOverallScore,
      tier: asfnTier,
    };

    // Calculate LCA (Loan Consequence Awareness) scores
    console.log('📊 Calculating LCA scores...');
    const lcaQuestions = allQuestions.filter(q => q.id.startsWith('lca'));
    console.log('LCA questions found:', lcaQuestions.length);
    let lcaRawScore = 0;
    const lcaMaxScore = 15; // 5 questions, max 3 points each

    lcaQuestions.forEach(q => {
      const userAnswer = formData[q.id];
      if (userAnswer && q.lcaPoints) {
        // Extract option letter (A, B, C, D) from answer like "A) Contact the lender..."
        const optionLetter = userAnswer.charAt(0);
        const points = q.lcaPoints[optionLetter] || 0;
        lcaRawScore += points;
        console.log(`LCA ${q.id}: ${optionLetter} = ${points} points`);
      } else if (userAnswer) {
        console.warn(`LCA ${q.id}: No lcaPoints defined`);
      }
    });

    // LCA overflow protection: cap at 15, log if exceeded
    if (lcaRawScore > lcaMaxScore) {
      console.error(`⚠️ LCA OVERFLOW: Raw score ${lcaRawScore} exceeds max ${lcaMaxScore}. Clamping to ${lcaMaxScore}.`);
      lcaRawScore = lcaMaxScore;
    }

    const lcaPercent = (lcaRawScore / lcaMaxScore) * 100;
    console.log(`LCA Total: ${lcaRawScore}/15 = ${lcaPercent.toFixed(1)}%`);

    const lcaMetadata = {
      attempted: true,
      rawScore: lcaRawScore,
      maxScore: lcaMaxScore,
      percent: lcaPercent,
    };

    // Calculate Neurocognitive Index (NCI) using centralized function
    const nciScore = calculateNCI(scoringResult.constructScores);
    console.log(`NCI: ${nciScore?.toFixed(1) ?? 'N/A'} (from construct scores)`);

    // Finalize session metadata
    const finalSessionMetadata: SessionMetadata = {
      ...sessionMetadata,
      endTime: Date.now(),
      totalTimeMs: Date.now() - sessionMetadata.startTime,
      asfn: asfnMetadata,
      lca: lcaMetadata,
      nci: nciScore ?? undefined,
    };

    // Prepare submission payload
    const submissionPayload = {
      session_id: finalSessionMetadata.sessionId,
      institution_id: finalSessionMetadata.institutionId,
      assessment_id: finalSessionMetadata.assessmentId,
      responses: formData,
      metadata: {
        session: finalSessionMetadata,
        questions: questionMetadata,
      },
      submitted_at: new Date().toISOString(),
    };

    console.log('Submitting assessment:', submissionPayload);

    if (supabase) {
      try {
        // Extract demographics - Updated to match new question IDs (dem1-dem13)
        const demographics = {
          full_name: formData['demo1'],
          email: formData['demo2'],
          age_range: formData['dem1'],        // DEM1: Age range
          gender: formData['dem2'],           // DEM2: Gender
          education: formData['dem3'],        // DEM3: Education
          country: formData['dem4'],          // DEM4: Location
          employment_status: formData['dem5'], // DEM5: Employment
          income_range: formData['dem6'],     // DEM6: Income
          marital_status: formData['dem7'],   // DEM7: Marital Status
          dependents: formData['dem8'],       // DEM8: Dependents
          residency_status: formData['dem9'], // DEM9: Housing status
          has_bank_account: formData['dem10'], // DEM10: Bank Account
          loan_history: formData['dem11'],    // DEM11: Loan History
          has_insurance: formData['dem12'],   // DEM12: Insurance ownership (for Q4 N/A)
          has_subscriptions: formData['dem13'], // DEM13: Subscription ownership (for Q5 N/A)
        };

        // Insert applicant record
        // Note: Using returning: 'representation' with RLS requires SELECT permission
        // Instead, we generate the ID client-side to avoid needing to read back
        const applicantId = crypto.randomUUID();

        const { error: applicantError } = await supabase
          .from('applicants')
          .insert({
            id: applicantId,
            session_id: finalSessionMetadata.sessionId,
            institution_id: finalSessionMetadata.institutionId,
            assessment_id: finalSessionMetadata.assessmentId,
            ...demographics,
            device_info: finalSessionMetadata.deviceInfo,
            started_at: new Date(finalSessionMetadata.startTime).toISOString(),
            submitted_at: new Date().toISOString(),
            total_time_ms: finalSessionMetadata.totalTimeMs,
            validation_result: validation,
            quality_score: validation.consistencyScore,
            gaming_risk_level: deriveGamingRiskLevel(validation),
            response_metadata: {
              session: finalSessionMetadata,
              questions: questionMetadata,
            },
            asfn_level1_score: asfnLevel1Accuracy,
            asfn_level2_score: asfnLevel2Accuracy,
            asfn_overall_score: asfnOverallScore,
            asfn_tier: asfnTier,
            lca_raw_score: lcaRawScore,
            lca_percent: lcaPercent,
            nci_score: nciScore,
          });

        if (applicantError) throw applicantError;

        const applicantData = { id: applicantId };

        // Insert responses
        const responsesArray = Object.entries(formData)
          .filter(([key]) => !key.startsWith('demo') && !key.startsWith('dem')) // Exclude demographics (demo1, demo2, dem1-dem13)
          .map(([questionId, answer]) => ({
            applicant_id: applicantData.id,
            question_id: questionId,
            answer,
            metadata: questionMetadata[questionId] || null,
          }));

        if (responsesArray.length > 0) {
          const { error: responsesError } = await supabase
            .from('responses')
            .insert(responsesArray);

          if (responsesError) throw responsesError;
        }

        // Insert score record (scoringResult already calculated at start of handleSubmit)
        const { error: scoreError } = await supabase
          .from('scores')
          .insert({
            applicant_id: applicantData.id,
            construct_scores: scoringResult.constructScores,
            construct_z_scores: scoringResult.constructZScores,
            character_score: scoringResult.fiveCScores.character,
            capacity_score: scoringResult.fiveCScores.capacity,
            capital_score: scoringResult.fiveCScores.capital,
            collateral_score: scoringResult.fiveCScores.collateral,
            conditions_score: scoringResult.fiveCScores.conditions,
            cwi_raw: scoringResult.cwiRaw,
            cwi_normalized: scoringResult.cwiNormalized,
            cwi_0_100: scoringResult.cwi0100,
            risk_band: scoringResult.riskBand,
            risk_percentile: scoringResult.riskPercentile,
            country: scoringResult.country,
            model_version: scoringResult.modelVersion,
            scored_at: scoringResult.scoredAt,
          });

        if (scoreError) {
          console.error('Scoring error:', scoreError);
          // Don't fail submission if scoring fails
        }

        // Calculate FinPsych score now that we have CWI
        const gamingRiskLevel = deriveGamingRiskLevel(validation);
        const finPsychResult = calculateFinPsychScore(
          scoringResult.cwi0100,
          nciScore,
          gamingRiskLevel,
          validation.consistencyScore
        );

        // Update applicant with CWI score summary and FinPsych score
        await supabase
          .from('applicants')
          .update({
            cwi_score: scoringResult.cwi0100,
            risk_category: scoringResult.riskBand,
            scored_at: scoringResult.scoredAt,
            finpsych_score: finPsychResult?.score ?? null,
            data_reliability: finPsychResult?.reliability ?? null,
          })
          .eq('id', applicantData.id);

        // Clear local storage draft
        localStorage.removeItem(`finpsych_draft_${sessionMetadata.sessionId}`);

        // Navigate to submitted page
        navigate('/submitted');
      } catch (err) {
        console.error('Submission error:', err);
        setError('Failed to submit assessment. Please try again.');
        setIsSubmitting(false);
      }
    } else {
      // No Supabase - just navigate (dev mode)
      console.log('No Supabase configured - skipping database insert');
      navigate('/submitted');
    }
    } catch (globalError) {
      console.error('❌ CRITICAL ERROR in handleSubmit:', globalError);
      const err = globalError as Error;
      console.error('Error stack:', err.stack);
      setError(`Submission failed: ${err.message || 'Unknown error'}. Please check the console and try again.`);
      setIsSubmitting(false);
    }
  };

  const handleExit = () => {
    navigate('/');
  };

  const getTimeSinceLastSave = () => {
    const diff = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  };

  // Get module-specific instructions for neurocognitive assessment
  const getModuleInstructions = (questionId: string): { title: string; text: string } | null => {
    if (questionId === 'asfn1_1') {
      return {
        title: 'ASFN Level 1: Functional Numeracy',
        text: 'These questions test basic everyday money skills. You may use a calculator if you need one. Take your time and answer as best you can.',
      };
    }
    if (questionId === 'asfn2_1') {
      return {
        title: 'ASFN Level 2: Financial Comparison',
        text: 'These questions are about comparing financial options. Take your time and choose the option that makes the most financial sense.',
      };
    }
    if (questionId === 'lca1') {
      return {
        title: 'Loan Consequence Awareness Test',
        text: 'These questions test your understanding of debt consequences, risk prioritization, and long-term financial impacts.',
      };
    }
    if (questionId === 'gd1') {
      return {
        title: 'Financial Decision-Making',
        text: 'These final questions help us understand real-world financial decision-making. There are no right or wrong answers - we simply want to understand how you handle everyday financial situations. Please answer honestly based on what you would do.',
      };
    }
    return null;
  };

  // Render question input based on type
  const renderQuestionInput = () => {
    const value = formData[currentQuestion.id] || '';

    switch (currentQuestion.type) {
      case 'text':
        return <TextQuestion value={value} onChange={handleInputChange} placeholder="Enter" />;
      case 'email':
        return <EmailQuestion value={value} onChange={handleInputChange} />;
      case 'scale':
        return <ScaleQuestion question={currentQuestion} value={value} onChange={handleInputChange} />;
      case 'select':
        return <SelectQuestion question={currentQuestion} value={value} onChange={handleInputChange} />;
      case 'ranking':
        return <RankingQuestion question={currentQuestion} value={value} onChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2a3d] to-[#0f1419] flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
          toast.type === 'success' ? 'bg-teal-600' :
          toast.type === 'error'   ? 'bg-red-600' :
                                     'bg-slate-700 border border-slate-500'
        }`}>
          {toast.type === 'success' && <span>✓</span>}
          {toast.type === 'error'   && <span>✕</span>}
          {toast.type === 'info'    && <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1e2a3d]/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">FP</span>
            </div>
            <span className="text-lg font-bold text-white">FINPSYCH</span>
          </div>
        </div>
      </header>

      {/* Progress Bar Banner with Gradient */}
      <div className="bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Credit Worthiness Assessment</h1>
          <button
            onClick={handleExit}
            className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          >
            Exit
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Progress Section */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-semibold text-teal-600">{progress}% Complete</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-500 via-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>Question {displayQuestionNumber} of {displayTotalQuestions}</span>
                <div className="flex items-center gap-1">
                  <CloudUpload className="w-4 h-4" />
                  <span>Auto saved {getTimeSinceLastSave()}</span>
                </div>
              </div>
            </div>

            {/* Question Section */}
            <div className="p-6">
              {/* Section Badge */}
              <div className="mb-6">
                <SectionBadge isDemographic={isDemographic} category={currentQuestion.category} description={currentQuestion.categoryDescription} isNeurocognitive={isNeurocognitive} />
              </div>

              {/* Module Instructions */}
              {getModuleInstructions(currentQuestion.id) && (
                <div className="mb-6 p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    {getModuleInstructions(currentQuestion.id)!.title}
                  </h3>
                  <p className="text-purple-800 text-sm">
                    {getModuleInstructions(currentQuestion.id)!.text}
                  </p>
                </div>
              )}

              {/* Question */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {currentQuestion.text}
                </h2>
                {renderQuestionInput()}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 || isSubmitting}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors border ${
                  currentQuestionIndex === 0 || isSubmitting
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={isSubmitting || !isCurrentQuestionAnswered}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
              >
                {isSubmitting ? 'Submitting...' : currentQuestionIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
