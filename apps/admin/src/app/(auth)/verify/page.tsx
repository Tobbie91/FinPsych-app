'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';

/**
 * Email verification page for admins
 */
export default function VerifyPage() {
  return (
    <div className="bg-[#1e2a3d] rounded-2xl shadow-2xl border border-slate-700 p-8 w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
        <p className="text-gray-300">
          We&apos;ve sent you a verification link. Please check your email to verify your account.
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-teal-900/20 border border-teal-600/30 rounded-xl">
        <p className="text-sm text-gray-300">
          <strong className="text-teal-400">Next Steps:</strong>
        </p>
        <ol className="mt-2 text-sm text-gray-300 list-decimal list-inside space-y-1">
          <li>Open the email we sent you</li>
          <li>Click the verification link</li>
          <li>Return here to sign in</li>
        </ol>
      </div>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-teal-400 hover:text-teal-300 font-medium text-sm"
        >
          Back to Sign In
        </Link>
      </div>

      {/* Help Text */}
      <p className="mt-6 text-center text-xs text-gray-400">
        Didn&apos;t receive the email? Check your spam folder or{' '}
        <Link href="/signup" className="text-teal-400 hover:text-teal-300">
          try signing up again
        </Link>
      </p>
    </div>
  );
}
