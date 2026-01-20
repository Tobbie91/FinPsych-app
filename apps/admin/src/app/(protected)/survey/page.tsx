'use client';

import React, { useState } from 'react';
import {
  Plus,
  GripVertical,
  Copy,
  Trash2,
  ChevronDown,
  X,
} from 'lucide-react';

type CreditCategory = 'Character' | 'Capacity' | 'Capital' | 'Conditions' | 'Collateral';

interface Question {
  id: string;
  number: number;
  text: string;
  type: 'scale' | 'select' | 'ranking' | 'text' | 'email' | 'multiple_choice';
  options: string[];
  required: boolean;
  category?: CreditCategory;
  construct?: string;
  reverseScored?: boolean;
}

interface Section {
  id: string;
  name: string;
  category: CreditCategory;
  questions: Question[];
}

// Standard frequency scale used across most questions
const frequencyScale = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

// Initialize sections based on the 5Cs of Credit
const initialSections: Section[] = [
  {
    id: 'character',
    name: 'Character',
    category: 'Character',
    questions: [
      // Payment History Questions
      { id: 'q1', number: 1, text: 'In the past 12 months, how often did you miss RENT payments?', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'payment_history', reverseScored: true },
      { id: 'q2', number: 2, text: 'In the past 12 months, how often did you miss UTILITY payments?', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'payment_history', reverseScored: true },
      { id: 'q3', number: 3, text: 'In the past 12 months, how often did you miss MOBILE/BROADBAND payments?', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'payment_history', reverseScored: true },
      { id: 'q4', number: 4, text: 'In the past 12 months, how often did you miss INSURANCE payments?', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'payment_history', reverseScored: true },
      { id: 'q5', number: 5, text: 'In the past 12 months, how often did you miss SUBSCRIPTION payments?', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'payment_history', reverseScored: true },
      { id: 'q6', number: 6, text: 'How often have you had to renegotiate payment terms with lenders or service providers?', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'payment_history', reverseScored: true },
      // Financial Behaviour Questions
      { id: 'q7', number: 7, text: 'I check my account balance regularly.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'financial_behaviour', reverseScored: false },
      { id: 'q8', number: 8, text: 'I track my expenses consistently.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'financial_behaviour', reverseScored: false },
      { id: 'q10', number: 10, text: 'I pay my bills on time.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'financial_behaviour', reverseScored: false },
      { id: 'q11', number: 11, text: 'I follow a monthly budget.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'financial_behaviour', reverseScored: false },
      { id: 'q12', number: 12, text: 'I compare prices before making purchases.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'financial_behaviour', reverseScored: false },
      { id: 'q13', number: 13, text: 'I am able to achieve my financial goals.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'financial_behaviour', reverseScored: false },
      // Crisis Decision Making
      { id: 'q16', number: 16, text: 'In a financial crisis, rank the following from 1 (first priority) to 6 (last priority):', type: 'ranking', options: ['Contact lender', 'Borrow from family/friends', 'Skip payments', 'Prioritise other expenses', 'Sell assets', 'Work extra hours'], required: false, category: 'Character', construct: 'crisis_decision_making', reverseScored: false },
      // Conscientiousness
      { id: 'q17', number: 17, text: 'I pay attention to details.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'conscientiousness', reverseScored: false },
      { id: 'q18', number: 18, text: 'I follow schedules.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'conscientiousness', reverseScored: false },
      { id: 'q19', number: 19, text: 'I complete tasks efficiently.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'conscientiousness', reverseScored: false },
      { id: 'q20', number: 20, text: 'I am always prepared.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'conscientiousness', reverseScored: false },
      { id: 'q21', number: 21, text: 'I get chores done right away.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'conscientiousness', reverseScored: false },
      // Emotional Stability
      { id: 'q22', number: 22, text: 'I often feel stressed.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'emotional_stability', reverseScored: true },
      { id: 'q23', number: 23, text: 'I worry about many things.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'emotional_stability', reverseScored: true },
      { id: 'q24', number: 24, text: 'I get upset easily.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'emotional_stability', reverseScored: true },
      { id: 'q25', number: 25, text: 'I feel anxious frequently.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'emotional_stability', reverseScored: true },
      { id: 'q26', number: 26, text: 'I have frequent mood swings.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'emotional_stability', reverseScored: true },
      // Agreeableness
      { id: 'q27', number: 27, text: "I sympathise with others' feelings.", type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'agreeableness', reverseScored: false },
      { id: 'q28', number: 28, text: 'I take time out for others.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'agreeableness', reverseScored: false },
      { id: 'q29', number: 29, text: "I feel others' emotions.", type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'agreeableness', reverseScored: false },
      { id: 'q30', number: 30, text: 'I make people feel at ease.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'agreeableness', reverseScored: false },
      { id: 'q31', number: 31, text: 'I am interested in others.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'agreeableness', reverseScored: false },
      // Openness
      { id: 'q32', number: 32, text: 'I have a vivid imagination.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'openness', reverseScored: false },
      { id: 'q33', number: 33, text: 'I enjoy reflecting on ideas.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'openness', reverseScored: false },
      { id: 'q34', number: 34, text: 'I value artistic experiences.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'openness', reverseScored: false },
      { id: 'q35', number: 35, text: 'I am curious about new things.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'openness', reverseScored: false },
      { id: 'q36', number: 36, text: 'I enjoy exploring new concepts.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'openness', reverseScored: false },
      // Extraversion
      { id: 'q37', number: 37, text: 'I am the life of the party.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'extraversion', reverseScored: false },
      { id: 'q38', number: 38, text: 'I feel comfortable around people.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'extraversion', reverseScored: false },
      { id: 'q39', number: 39, text: 'I start conversations easily.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'extraversion', reverseScored: false },
      { id: 'q40', number: 40, text: 'I talk to many people at social gatherings.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'extraversion', reverseScored: false },
      { id: 'q41', number: 41, text: "I don't mind being the centre of attention.", type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'extraversion', reverseScored: false },
      // Self Control
      { id: 'q47', number: 47, text: 'I resist temptations well.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'self_control', reverseScored: false },
      { id: 'q48', number: 48, text: 'I act impulsively.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'self_control', reverseScored: true },
      { id: 'q49', number: 49, text: 'I buy things without thinking.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'self_control', reverseScored: true },
      { id: 'q50', number: 50, text: 'I can stay focused on long-term goals.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'self_control', reverseScored: false },
      { id: 'q51', number: 51, text: 'I avoid unnecessary spending.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'self_control', reverseScored: false },
      { id: 'q52', number: 52, text: 'I control my urges to spend impulsively.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'self_control', reverseScored: false },
      { id: 'q53', number: 53, text: 'I think carefully before making purchases.', type: 'scale', options: frequencyScale, required: true, category: 'Character', construct: 'self_control', reverseScored: false },
      // Locus of Control
      { id: 'q54', number: 54, text: 'Choose the statement that best reflects your belief:', type: 'select', options: ['My financial security depends mainly on my own actions.', 'External factors determine my financial situation.'], required: true, category: 'Character', construct: 'locus_of_control', reverseScored: false },
      { id: 'q55', number: 55, text: 'Choose the statement that best reflects your belief:', type: 'select', options: ['Financial planning helps me achieve goals.', 'Luck determines financial outcomes.'], required: true, category: 'Character', construct: 'locus_of_control', reverseScored: false },
      { id: 'q56', number: 56, text: 'Choose the statement that best reflects your belief:', type: 'select', options: ['Financial success comes from hard work.', 'Financial success comes from being in the right place at the right time.'], required: true, category: 'Character', construct: 'locus_of_control', reverseScored: false },
      { id: 'q57', number: 57, text: 'Choose the statement that best reflects your belief:', type: 'select', options: ['I can achieve the financial goals I set.', "Financial goals often don't work out regardless."], required: true, category: 'Character', construct: 'locus_of_control', reverseScored: false },
      { id: 'q58', number: 58, text: 'Choose the statement that best reflects your belief:', type: 'select', options: ['I am responsible for my financial well-being.', 'External forces determine my situation.'], required: true, category: 'Character', construct: 'locus_of_control', reverseScored: false },
      // Cognitive Reflection
      { id: 'q62', number: 62, text: 'A bat and a ball cost ₦1,100 in total. The bat costs ₦1,000 more than the ball. How much does the ball cost?', type: 'select', options: ['₦50', '₦100', '₦550'], required: true, category: 'Character', construct: 'cognitive_reflection' },
      // Delay Discounting
      { id: 'q63', number: 63, text: 'Would you prefer:', type: 'select', options: ['A: ₦5,000 today', 'B: ₦7,500 in one month'], required: true, category: 'Character', construct: 'delay_discounting' },
    ],
  },
  {
    id: 'capacity',
    name: 'Capacity',
    category: 'Capacity',
    questions: [
      // Emergency Preparedness
      { id: 'q14', number: 14, text: 'If an unexpected expense occurred today, which option would you rely on first?', type: 'select', options: ['Personal savings', 'Borrow from family/friends', 'Sell an asset', 'Take a loan', 'Other'], required: true, category: 'Capacity', construct: 'emergency_preparedness', reverseScored: false },
      // Time Orientation
      { id: 'q60', number: 60, text: 'How often do you think about your financial situation 5 years from now?', type: 'scale', options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'], required: true, category: 'Capacity', construct: 'time_orientation', reverseScored: false },
      { id: 'q61', number: 61, text: 'I believe small financial decisions today significantly affect my future.', type: 'scale', options: frequencyScale, required: true, category: 'Capacity', construct: 'time_orientation', reverseScored: false },
      // Financial Numeracy
      { id: 'q64', number: 64, text: 'You buy bread for ₦500 and fish for ₦800. You pay with ₦2,000. How much change should you get?', type: 'select', options: ['₦700', '₦1,200', '₦1,500'], required: true, category: 'Capacity', construct: 'financial_numeracy' },
      { id: 'q65', number: 65, text: 'You need to borrow ₦50,000. Lender A: Pay back ₦55,000 after 1 month. Lender B: Pay back ₦60,000 after 3 months. Which costs you LESS in total interest?', type: 'select', options: ['Lender A (₦5,000 interest)', 'Lender B (₦10,000 interest)', 'Same total interest'], required: true, category: 'Capacity', construct: 'financial_numeracy' },
    ],
  },
  {
    id: 'capital',
    name: 'Capital',
    category: 'Capital',
    questions: [
      // Savings & Financial Behaviour
      { id: 'q9', number: 9, text: 'I save money regularly.', type: 'scale', options: frequencyScale, required: true, category: 'Capital', construct: 'financial_behaviour', reverseScored: false },
      // Emergency Savings
      { id: 'q15', number: 15, text: 'How many months of emergency savings do you currently have?', type: 'select', options: ['None', '1 month', '2–3 months', '4–6 months', 'More than 6 months'], required: true, category: 'Capital', construct: 'emergency_preparedness', reverseScored: false },
    ],
  },
  {
    id: 'conditions',
    name: 'Conditions',
    category: 'Conditions',
    questions: [
      // Risk Preference
      { id: 'q42', number: 42, text: 'I see myself as a risk-taker.', type: 'scale', options: frequencyScale, required: true, category: 'Conditions', construct: 'risk_preference', reverseScored: false },
      { id: 'q43', number: 43, text: 'In a game show, I would choose the riskier option.', type: 'scale', options: frequencyScale, required: true, category: 'Conditions', construct: 'risk_preference', reverseScored: false },
      { id: 'q44', number: 44, text: "I associate the word 'risk' with opportunity.", type: 'scale', options: frequencyScale, required: true, category: 'Conditions', construct: 'risk_preference', reverseScored: false },
      { id: 'q45', number: 45, text: 'I would shift my assets to pursue higher returns.', type: 'scale', options: frequencyScale, required: true, category: 'Conditions', construct: 'risk_preference', reverseScored: false },
      { id: 'q46', number: 46, text: 'I am comfortable with potential losses over several years.', type: 'scale', options: frequencyScale, required: true, category: 'Conditions', construct: 'risk_preference', reverseScored: false },
    ],
  },
  {
    id: 'collateral',
    name: 'Collateral',
    category: 'Collateral',
    questions: [
      // Social Support
      { id: 'q59', number: 59, text: 'How many people could you ask to borrow money in an emergency?', type: 'select', options: ['None', '1–2 people', '3–5 people', '6–10 people', 'More than 10'], required: true, category: 'Collateral', construct: 'social_support', reverseScored: false },
    ],
  },
];

export default function SurveyPage() {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [activeSection, setActiveSection] = useState('character');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const currentSection = sections.find((s) => s.id === activeSection);

  const handleAddQuestion = () => {
    const currentSectionData = sections.find((s) => s.id === activeSection);
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      number: currentSectionData ? currentSectionData.questions.length + 1 : 1,
      text: 'New Question',
      type: 'scale',
      options: frequencyScale,
      required: false,
      category: currentSectionData?.category,
      construct: 'financial_behaviour',
    };

    setSections(
      sections.map((section) =>
        section.id === activeSection
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    );
    setEditingQuestion(newQuestion);
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: `Custom Section ${sections.length + 1}`,
      category: 'Character',
      questions: [],
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDuplicateQuestion = (question: Question) => {
    const duplicated: Question = {
      ...question,
      id: `q-${Date.now()}`,
      text: `${question.text} (Copy)`,
    };

    setSections(
      sections.map((section) =>
        section.id === activeSection
          ? { ...section, questions: [...section.questions, duplicated] }
          : section
      )
    );
  };

  const handleDeleteQuestion = (questionId: string) => {
    setSections(
      sections.map((section) =>
        section.id === activeSection
          ? {
              ...section,
              questions: section.questions.filter((q) => q.id !== questionId),
            }
          : section
      )
    );
    if (editingQuestion?.id === questionId) {
      setEditingQuestion(null);
    }
  };

  const handleUpdateQuestion = (updated: Question) => {
    setSections(
      sections.map((section) =>
        section.id === activeSection
          ? {
              ...section,
              questions: section.questions.map((q) =>
                q.id === updated.id ? updated : q
              ),
            }
          : section
      )
    );
    setEditingQuestion(updated);
  };

  const handleSaveQuestions = () => {
    // Convert sections to JSON and download
    const dataStr = JSON.stringify(sections, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'assessment-questions.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTotalQuestions = () => {
    return sections.reduce((acc, section) => acc + section.questions.length, 0);
  };

  return (
    <div className="p-8 flex gap-6 h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Survey Questions</h1>
            <p className="text-gray-500 mt-1">
              Manage assessment questions organized by the 5Cs of Credit ({getTotalQuestions()} questions total)
            </p>
          </div>
          <button
            onClick={handleSaveQuestions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Export Questions
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.name}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeSection === section.id
                  ? 'bg-blue-700'
                  : 'bg-gray-200'
              }`}>
                {section.questions.length}
              </span>
            </button>
          ))}
          <button
            onClick={handleAddSection}
            className="px-4 py-2 rounded-lg font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {currentSection?.questions.map((question, index) => (
            <div
              key={question.id}
              onClick={() => setEditingQuestion(question)}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition-all ${
                editingQuestion?.id === question.id
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-gray-400 cursor-grab mt-1">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Q{question.number || index + 1}
                    </span>
                    {question.category && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {question.category}
                      </span>
                    )}
                    {question.construct && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full capitalize">
                        {question.construct.replace(/_/g, ' ')}
                      </span>
                    )}
                    {question.required && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                    {question.reverseScored && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        Reverse Scored
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                      {question.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{question.text}</p>
                  {question.options.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {question.options.slice(0, 4).map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          {option}
                        </div>
                      ))}
                      {question.options.length > 4 && (
                        <p className="text-sm text-gray-400">
                          +{question.options.length - 4} more options
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateQuestion(question);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestion(question.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </button>
        </div>
      </div>

      {/* Edit Panel */}
      {editingQuestion && (
        <div className="w-96 bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Edit Question</h3>
            <button
              onClick={() => setEditingQuestion(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Question Text
            </label>
            <textarea
              value={editingQuestion.text}
              onChange={(e) =>
                handleUpdateQuestion({ ...editingQuestion, text: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Question Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Question Type
            </label>
            <div className="relative">
              <select
                value={editingQuestion.type}
                onChange={(e) =>
                  handleUpdateQuestion({
                    ...editingQuestion,
                    type: e.target.value as Question['type'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="scale">Scale</option>
                <option value="select">Select/Dropdown</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="ranking">Ranking</option>
                <option value="text">Text Response</option>
                <option value="email">Email</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              5C Category
            </label>
            <div className="relative">
              <select
                value={editingQuestion.category || ''}
                onChange={(e) =>
                  handleUpdateQuestion({
                    ...editingQuestion,
                    category: e.target.value as CreditCategory,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">None</option>
                <option value="Character">Character</option>
                <option value="Capacity">Capacity</option>
                <option value="Capital">Capital</option>
                <option value="Conditions">Conditions</option>
                <option value="Collateral">Collateral</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Construct */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Construct (for scoring)
            </label>
            <input
              type="text"
              value={editingQuestion.construct || ''}
              onChange={(e) =>
                handleUpdateQuestion({
                  ...editingQuestion,
                  construct: e.target.value,
                })
              }
              placeholder="e.g., financial_behaviour"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Required Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  editingQuestion.required ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() =>
                  handleUpdateQuestion({
                    ...editingQuestion,
                    required: !editingQuestion.required,
                  })
                }
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                    editingQuestion.required ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Mark as Required
              </span>
            </label>
          </div>

          {/* Reverse Scored Toggle */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  editingQuestion.reverseScored ? 'bg-orange-600' : 'bg-gray-300'
                }`}
                onClick={() =>
                  handleUpdateQuestion({
                    ...editingQuestion,
                    reverseScored: !editingQuestion.reverseScored,
                  })
                }
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
                    editingQuestion.reverseScored ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Reverse Scored
              </span>
            </label>
          </div>

          {/* Options */}
          {(editingQuestion.type === 'multiple_choice' ||
            editingQuestion.type === 'select' ||
            editingQuestion.type === 'scale' ||
            editingQuestion.type === 'ranking') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Options
              </label>
              <div className="space-y-2">
                {editingQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editingQuestion.options];
                        newOptions[index] = e.target.value;
                        handleUpdateQuestion({
                          ...editingQuestion,
                          options: newOptions,
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={() => {
                        const newOptions = editingQuestion.options.filter(
                          (_, i) => i !== index
                        );
                        handleUpdateQuestion({
                          ...editingQuestion,
                          options: newOptions,
                        });
                      }}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    handleUpdateQuestion({
                      ...editingQuestion,
                      options: [
                        ...editingQuestion.options,
                        `Option ${editingQuestion.options.length + 1}`,
                      ],
                    })
                  }
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
