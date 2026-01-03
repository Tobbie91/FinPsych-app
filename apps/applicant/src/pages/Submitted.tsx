import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubmittedPage() {
  const navigate = useNavigate();

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
              Assessment Submitted!
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-8">
              Thank you for completing the Credit Worthiness Assessment. Your responses have been recorded and will be reviewed by the institution.
            </p>

            {/* Info Box */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
              <h3 className="font-medium text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">1.</span>
                  <span>Your responses are being analyzed by our scoring engine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">2.</span>
                  <span>The institution will receive your credit worthiness score</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">3.</span>
                  <span>You may be contacted for additional information if needed</span>
                </li>
              </ul>
            </div>

            {/* Back to Home Button */}
            <button
              onClick={() => navigate('/')}
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
