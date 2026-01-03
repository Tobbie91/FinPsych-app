import { CloudUpload, ChevronLeft, ChevronRight, GripVertical, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import {
  sections,
  getTotalQuestions,
  type Question,
  type CreditCategory,
  categoryColors,
} from '../data/questions';
import { calculateCWI, type RawResponses } from '@fintech/scoring';

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
function CategoryBadge({ category }: { category: CreditCategory }) {
  const colors = categoryColors[category];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      {category}
    </span>
  );
}

// Section Badge Component
function SectionBadge({ isDemographic, category }: { isDemographic: boolean; category?: CreditCategory }) {
  if (isDemographic) {
    return (
      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-pink-500 text-white">
        Demographics Questions
      </span>
    );
  }

  if (category) {
    return <CategoryBadge category={category} />;
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
  const totalQuestions = getTotalQuestions();
  const currentQuestion = allQuestions[currentQuestionIndex];
  const isDemographic = currentQuestion?.sectionId === 'section-a';

  // Calculate progress
  const answeredQuestions = Object.keys(formData).length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

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
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    // Finalize session metadata
    const finalSessionMetadata: SessionMetadata = {
      ...sessionMetadata,
      endTime: Date.now(),
      totalTimeMs: Date.now() - sessionMetadata.startTime,
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
        // Extract demographics
        const demographics = {
          full_name: formData['demo1'],
          email: formData['demo2'],
          country: formData['demo3'],
          age_range: formData['demo4'],
          gender: formData['demo5'],
          marital_status: formData['demo6'],
          education: formData['demo7'],
          employment_status: formData['demo8'],
          income_range: formData['demo9'],
          dependents: formData['demo10'],
          has_bank_account: formData['demo11'],
          loan_history: formData['demo12'],
          residency_status: formData['demo13'],
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
          });

        if (applicantError) throw applicantError;

        const applicantData = { id: applicantId };

        // Insert responses
        const responsesArray = Object.entries(formData)
          .filter(([key]) => !key.startsWith('demo')) // Exclude demographics
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

        // Run CWI scoring engine
        const country = formData['demo3'] || 'Other';
        const scoringResult = calculateCWI(formData as RawResponses, country);

        // Insert score record
        const { error: scoreError } = await supabase
          .from('scores')
          .insert({
            applicant_id: applicantData.id,
            construct_scores: scoringResult.constructScores,
            construct_z_scores: scoringResult.constructZScores,
            character_score: scoringResult.fiveCScores.character,
            capacity_score: scoringResult.fiveCScores.capacity,
            capital_score: scoringResult.fiveCScores.capital,
            consistency_score: scoringResult.fiveCScores.consistency,
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

        // Update applicant with CWI score summary
        await supabase
          .from('applicants')
          .update({
            cwi_score: scoringResult.cwi0100,
            risk_category: scoringResult.riskBand,
            scored_at: scoringResult.scoredAt,
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">FP</span>
            </div>
            <span className="text-lg font-bold text-gray-900">FINPSYCH</span>
          </div>
        </div>
      </header>

      {/* Teal Banner */}
      <div className="bg-teal-500 text-white">
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
                <span className="text-sm font-semibold text-teal-500">{progress}% Complete</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
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
                <SectionBadge isDemographic={isDemographic} category={currentQuestion.category} />
              </div>

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
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-medium rounded-lg transition-colors"
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
