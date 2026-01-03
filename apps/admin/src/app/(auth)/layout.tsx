import type { ReactNode } from 'react';

/**
 * Auth layout wrapper for admin login page.
 * FINPSYCH branded centered card layout with blue theme.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <span className="text-xl font-bold text-gray-900">FINPSYCH</span>
          <span className="text-sm text-gray-500 ml-2">Admin Portal</span>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
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
