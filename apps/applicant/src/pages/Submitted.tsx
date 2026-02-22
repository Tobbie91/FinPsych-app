import { CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const RISK_BAND_CONFIG: Record<string, { label: string; color: string; bg: string; ring: string; description: string }> = {
  LOW: {
    label: 'Low Risk',
    color: 'text-green-700',
    bg: 'bg-green-100',
    ring: 'ring-green-500',
    description: 'Strong financial profile with excellent creditworthiness indicators.',
  },
  MODERATE: {
    label: 'Moderate Risk',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    ring: 'ring-yellow-500',
    description: 'Good financial profile with some areas for improvement.',
  },
  MODERATE_HIGH: {
    label: 'Moderate-High Risk',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    ring: 'ring-amber-500',
    description: 'Developing financial profile with areas for strengthening.',
  },
  HIGH: {
    label: 'High Risk',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    ring: 'ring-orange-500',
    description: 'Financial profile requires attention and improvement.',
  },
  VERY_HIGH: {
    label: 'Very High Risk',
    color: 'text-red-700',
    bg: 'bg-red-100',
    ring: 'ring-red-500',
    description: 'Financial profile requires significant improvement.',
  },
};

export default function SubmittedPage() {
  const location = useLocation();
  const { finpsychScore, riskBand } = (location.state as { finpsychScore?: number | null; riskBand?: string | null }) || {};

  const riskConfig = riskBand ? RISK_BAND_CONFIG[riskBand] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">FP</span>
          </div>
          <span className="text-lg font-bold text-gray-900">FINPSYCH</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-teal-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Assessment Submitted! ✅
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Thank you for completing the FinPsych Assessment.<br />
              Your responses have been recorded and will be reviewed by our team.
            </p>

            {/* FinPsych Score Card */}
            {finpsychScore != null && riskConfig && (
              <div className={`rounded-xl p-6 mb-6 ring-2 ${riskConfig.ring} ${riskConfig.bg}`}>
                <p className="text-sm font-medium text-gray-500 mb-1">Your FinPsych Score</p>
                <p className="text-5xl font-bold text-gray-900 mb-3">
                  {Math.round(finpsychScore)}
                  <span className="text-lg text-gray-400 font-normal">/100</span>
                </p>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Risk Band: <span className={riskConfig.color}>{riskConfig.label}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2">{riskConfig.description}</p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">1.</span>
                  <span>Your FinPsych Score has been calculated and saved securely.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">2.</span>
                  <span>We will review your assessment results along with your application.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">3.</span>
                  <span>You'll hear back within 3-5 business days regarding your application status.</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <p className="text-sm text-gray-500 mb-8">
              If you have questions, please contact{' '}
              <a href="mailto:support@finpsych.app" className="text-teal-600 hover:text-teal-700 font-medium">
                support@finpsych.app
              </a>
            </p>

            {/* Back to Home Button */}
            <button
              onClick={() => {
                const adminUrl = import.meta.env.VITE_ADMIN_URL || 'https://finpsych-admin.netlify.app';
                window.location.href = adminUrl;
              }}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-gray-100 bg-white">
        <div className="text-center text-gray-500 text-sm">
          Powered by FINPSYCH - Financial Psychology Assessment
        </div>
      </footer>
    </div>
  );
}
