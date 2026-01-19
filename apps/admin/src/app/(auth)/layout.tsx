import type { ReactNode } from 'react';

/**
 * Auth layout wrapper for admin login page.
 * FINPSYCH branded centered card layout with dark theme.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] via-[#1e2a3d] to-[#0f1419] flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 bg-[#1e2a3d]/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <span className="text-xl font-bold text-white">FINPSYCH</span>
          <span className="text-sm text-gray-400 ml-2">Admin Portal</span>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-700/50 bg-[#1e2a3d]/50 backdrop-blur-sm">
        <div className="text-center text-gray-400 text-sm">
          Powered by FINPSYCH - Financial Psychology Assessment
        </div>
      </footer>
    </div>
  );
}
