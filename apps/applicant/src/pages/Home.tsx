import { CreditCard, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-semibold text-gray-900">CREDIT</span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        <div className="relative h-full flex items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white text-center px-4 tracking-wide">
            CREDIT WORTHINESS<br />QUESTIONNAIRE
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Welcome Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Welcome to Your Creditworthiness Assessment
          </h2>
          <p className="text-gray-600 text-lg mb-4 leading-relaxed">
            To help us understand your financial habits, decision-making style, and overall reliability,
            we've prepared a short questionnaire known as the Creditworthiness Index (CWI) assessment.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Your responses will allow us to create a more accurate and fair evaluation tailored to you.
            There are no right or wrong answers—simply choose the options that best reflect your real
            behaviour and personal experiences.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Assessment Scope Card */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Assessment Scope
            </h3>
            <p className="text-gray-600 leading-relaxed">
              The questionnaire contains multiple sections covering your financial behaviour,
              personality traits, risk preference, and more.
            </p>
          </div>

          {/* Estimated Time Card */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Estimated Time
            </h3>
            <p className="text-gray-600 leading-relaxed">
              The questionnaire typically takes <span className="text-blue-500 font-semibold">8-12 minutes</span> to complete.
            </p>
          </div>

          {/* Confidentiality Card */}
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Confidentiality
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Your information is kept confidential and securely protected.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/questionnaire')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
          >
            Start Questionnaire
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
