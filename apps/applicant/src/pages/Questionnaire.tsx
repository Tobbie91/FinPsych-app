import { CreditCard, CloudUpload, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  sections,
  getTotalQuestions,
  getSectionLetter,
  categoryColors,
  type Question,
  type CreditCategory,
} from '../data/questions';

// Category Badge Component - Compact inline version
function CategoryBadge({ category }: { category: CreditCategory }) {
  const colors = categoryColors[category];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
      {category}
    </span>
  );
}

// Text Input Question Component
function TextQuestion({
  question,
  value,
  onChange,
  inputType = 'text',
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  inputType?: 'text' | 'email';
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-500">
            Question {question.number}
          </span>
          <CategoryBadge category={question.category} />
          <span className="text-red-500">*</span>
        </div>
        <div className="text-base text-gray-900">{question.text}</div>
      </div>
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={inputType === 'email' ? 'Enter your email' : 'Enter your answer'}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-500">
            Question {question.number}
          </span>
          <CategoryBadge category={question.category} />
          <span className="text-red-500">*</span>
        </div>
        <div className="text-base text-gray-900">{question.text}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              value === option
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-500">
            Question {question.number}
          </span>
          <CategoryBadge category={question.category} />
          <span className="text-red-500">*</span>
        </div>
        <div className="text-base text-gray-900">{question.text}</div>
      </div>
      <div className="space-y-2">
        {question.options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              value === option
                ? 'bg-blue-50 border-blue-500'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="w-4 h-4 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Ranking Question Component
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onChange(JSON.stringify(items));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-500">
            Question {question.number}
          </span>
          <CategoryBadge category={question.category} />
          <span className="text-red-500">*</span>
        </div>
        <div className="text-base text-gray-900">{question.text}</div>
        <div className="text-sm text-gray-500 mt-1">Drag to reorder (1 = first priority)</div>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all ${
              draggedIndex === index
                ? 'bg-blue-100 border-blue-500 shadow-lg'
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
            <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-medium">
              {index + 1}
            </span>
            <span className="text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Question Renderer
function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  switch (question.type) {
    case 'text':
      return <TextQuestion question={question} value={value} onChange={onChange} inputType="text" />;
    case 'email':
      return <TextQuestion question={question} value={value} onChange={onChange} inputType="email" />;
    case 'scale':
      return <ScaleQuestion question={question} value={value} onChange={onChange} />;
    case 'select':
      return <SelectQuestion question={question} value={value} onChange={onChange} />;
    case 'ranking':
      return <RankingQuestion question={question} value={value} onChange={onChange} />;
    default:
      return null;
  }
}

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const currentSection = sections[currentSectionIndex];
  const totalQuestions = getTotalQuestions();
  const totalSections = sections.length;

  // Calculate progress
  const answeredQuestions = Object.keys(formData).length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  // Auto-save simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        setLastSaved(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const handleInputChange = (questionId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [questionId]: value }));
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    navigate('/dashboard');
  };

  const getTimeSinceLastSave = () => {
    const diff = Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header with Progress */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Header */}
        <header className="px-6 py-3 border-b border-gray-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-semibold text-gray-900">CREDIT</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CloudUpload className="w-4 h-4" />
              <span>Auto saved {getTimeSinceLastSave()}</span>
            </div>
          </div>
        </header>

        {/* Progress Bar Section */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-semibold text-blue-500">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>
                Section {getSectionLetter(currentSectionIndex)} of {getSectionLetter(totalSections - 1)}
              </span>
              <span>
                {currentSection.questions.filter((q) => formData[q.id]).length}/{currentSection.questions.length} answered
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="px-6 py-3 overflow-x-auto border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2">
              {sections.map((section, index) => {
                const sectionAnswered = section.questions.filter((q) => formData[q.id]).length;
                const sectionTotal = section.questions.length;
                const isComplete = sectionAnswered === sectionTotal;
                const isCurrent = index === currentSectionIndex;

                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      isCurrent
                        ? 'bg-blue-500 text-white'
                        : isComplete
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{getSectionLetter(index)}</span>
                    {isComplete && !isCurrent && (
                      <span className="w-4 h-4 flex items-center justify-center bg-green-500 text-white rounded-full text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[200px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center px-4 tracking-wide">
            CREDIT WORTHINESS QUESTIONNAIRE
          </h1>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {currentSection.title}: {currentSection.subtitle}
          </h2>
        </div>

        {/* Questions Container */}
        <div className="space-y-4">
          {currentSection.questions.map((question) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 border rounded-lg font-medium transition-colors ${
              currentSectionIndex === 0
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            {currentSectionIndex === totalSections - 1 ? 'Submit' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
