import { ClipboardList, Clock, Shield, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from '@fintech/ui';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FINPSYCH</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[420px] w-full overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            CREDITWORTHINESS
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-white/90 tracking-tight">
            QUESTIONNAIRE
          </h2>
          <p className="mt-6 text-teal-100 text-lg max-w-xl">
            A comprehensive assessment powered by financial psychology
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Your Assessment.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4 leading-relaxed">
            To help us understand your financial habits, decision-making style, and overall reliability,
            we have prepared a comprehensive questionnaire to calculate your Financial Psychology Score (FinPsych Score).
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            Your responses will allow us to understand your financial capabilities and create a personalised creditworthiness evaluation.
          </p>

          {/* Three Parts */}
          <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
            <p className="text-gray-900 dark:text-white font-semibold mb-3">This assessment has three parts:</p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                <span><span className="font-medium text-gray-800 dark:text-gray-200">Financial Behaviours</span> — Your habits, personality, and attitudes toward money.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                <span><span className="font-medium text-gray-800 dark:text-gray-200">Financial Numeracy</span> — Your ability to understand financial scenarios and calculations.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                <span><span className="font-medium text-gray-800 dark:text-gray-200">Response Validation</span> — Quick checks to ensure accurate scoring.</span>
              </li>
            </ul>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Please answer honestly. Our system detects inconsistencies and adjusts your score accordingly.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Assessment Scope Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-600 transition-all">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What We Assess
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Financial discipline, payment reliability, emergency preparedness, risk understanding, decision-making ability, and more.
            </p>
          </div>

          {/* Estimated Time Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-600 transition-all">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Time Required
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Approximately <span className="text-teal-600 dark:text-teal-400 font-semibold">8-12 minutes</span> (varies by individual).
            </p>
          </div>

          {/* Confidentiality Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-600 transition-all">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Your Privacy
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              All responses are confidential and protected under strict data privacy standards. Your data will only be used for creditworthiness assessment.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const institutionId = searchParams.get('institution');
              const queryString = institutionId ? `?institution=${institutionId}` : '';
              navigate(`/questionnaire${queryString}`);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-10 py-4 rounded-xl flex items-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            Start Assessment
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          Powered by FINPSYCH - Financial Psychology Assessment
        </div>
      </footer>
    </div>
  );
}
