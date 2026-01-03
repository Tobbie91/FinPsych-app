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

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'text' | 'ranking';
  options: string[];
  required: boolean;
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
}

const initialSections: Section[] = [
  {
    id: 'section-a',
    name: 'Section A',
    questions: [
      {
        id: 'q1',
        text: 'How would you describe your current financial situation?',
        type: 'multiple_choice',
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
        required: true,
      },
      {
        id: 'q2',
        text: 'How often do you review your monthly budget?',
        type: 'multiple_choice',
        options: ['Weekly', 'Monthly', 'Quarterly', 'Rarely'],
        required: true,
      },
      {
        id: 'q3',
        text: 'Rate your confidence in managing debt from 1-10',
        type: 'scale',
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        required: true,
      },
    ],
  },
  {
    id: 'section-b',
    name: 'Section B',
    questions: [
      {
        id: 'q4',
        text: 'What is your primary source of income?',
        type: 'multiple_choice',
        options: ['Employment', 'Self-employment', 'Investments', 'Other'],
        required: true,
      },
      {
        id: 'q5',
        text: 'How would you prioritize these financial goals?',
        type: 'ranking',
        options: ['Emergency fund', 'Debt repayment', 'Retirement savings', 'Major purchase'],
        required: false,
      },
    ],
  },
  {
    id: 'section-c',
    name: 'Section C',
    questions: [
      {
        id: 'q6',
        text: 'Describe any significant financial challenges you have faced',
        type: 'text',
        options: [],
        required: false,
      },
    ],
  },
];

export default function SurveyPage() {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [activeSection, setActiveSection] = useState('section-a');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const currentSection = sections.find((s) => s.id === activeSection);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: 'New Question',
      type: 'multiple_choice',
      options: ['Option 1', 'Option 2'],
      required: false,
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
      name: `Section ${String.fromCharCode(65 + sections.length)}`,
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

  return (
    <div className="p-8 flex gap-6 h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Survey</h1>
          <p className="text-gray-500 mt-1">
            Manage assessment questions and sections
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {section.name}
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
                      Question {index + 1}
                    </span>
                    {question.required && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Required
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
                <option value="multiple_choice">Multiple Choice</option>
                <option value="scale">Scale (1-10)</option>
                <option value="text">Text Response</option>
                <option value="ranking">Ranking</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Required Toggle */}
          <div className="mb-6">
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

          {/* Options */}
          {(editingQuestion.type === 'multiple_choice' ||
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
