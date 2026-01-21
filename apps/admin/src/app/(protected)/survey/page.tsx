'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  GripVertical,
  Copy,
  Trash2,
  ChevronDown,
  X,
} from 'lucide-react';

// Import the actual questions from the questionnaire
import { sections as questionnaireSections } from '../../../../../applicant/src/data/questions';

type CreditCategory = 'Character' | 'Capacity' | 'Capital' | 'Conditions' | 'Collateral' | 'Demographics';

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

// Convert questionnaire sections to survey format
const convertToSurveyFormat = (): Section[] => {
  return questionnaireSections.map((section) => {
    // Map section IDs to categories
    let category: CreditCategory;
    if (section.id === 'section-a') category = 'Demographics';
    else if (section.id === 'section-b') category = 'Character';
    else if (section.id === 'section-c') category = 'Capacity';
    else if (section.id === 'section-d') category = 'Capital';
    else if (section.id === 'section-e') category = 'Collateral';
    else if (section.id === 'section-f') category = 'Conditions';
    else category = 'Character';

    return {
      id: section.id,
      name: section.title,
      category,
      questions: section.questions.map((q) => ({
        id: q.id,
        number: q.number,
        text: q.text,
        type: q.type as Question['type'],
        options: q.options || [],
        required: true,
        category,
        construct: q.construct,
        reverseScored: q.reverseScored,
      })),
    };
  });
};

const initialSections: Section[] = convertToSurveyFormat();

// Standard frequency scale used for new questions
const frequencyScale = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

export default function SurveyPage() {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [activeSection, setActiveSection] = useState('section-a');
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
