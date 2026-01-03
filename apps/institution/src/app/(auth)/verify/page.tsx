'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Mail, CheckCircle2, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Email Verification content component.
 */
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check if user came from email confirmation link
  useEffect(() => {
    const checkSession = async () => {
      // Check for tokens in URL (from email confirmation)
      const type = searchParams.get('type');

      if (type === 'signup' || type === 'email_change') {
        setIsVerified(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);

        // Check if email is confirmed
        if (session.user.email_confirmed_at) {
          setIsVerified(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      }
    };

    checkSession();

    // Listen for auth state changes (when user clicks email link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
          setIsVerified(true);
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams, supabase.auth]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setResendCooldown(60); // 60 second cooldown
      }
    } catch {
      setError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isVerified) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
        <p className="text-gray-500 mb-6">
          Your email has been successfully verified. Redirecting to dashboard...
        </p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
        <p className="text-gray-500">
          We&apos;ve sent a verification link to
          {email && (
            <span className="block font-medium text-gray-700 mt-1">{email}</span>
          )}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Next steps:</h3>
        <ol className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-teal-500 font-medium">1.</span>
            <span>Open the email from FINPSYCH</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500 font-medium">2.</span>
            <span>Click the &quot;Confirm Email&quot; button</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500 font-medium">3.</span>
            <span>You&apos;ll be redirected to your dashboard</span>
          </li>
        </ol>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center mb-4">
          {error}
        </div>
      )}

      {/* Resend Email */}
      <div className="text-center mb-6">
        <p className="text-gray-500 mb-3">Didn&apos;t receive the email?</p>
        <button
          onClick={handleResend}
          disabled={isLoading || resendCooldown > 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : isLoading
              ? 'Sending...'
              : 'Resend verification email'
          }
        </button>
      </div>

      {/* Check spam note */}
      <p className="text-center text-sm text-gray-400 mb-6">
        Check your spam folder if you don&apos;t see the email
      </p>

      {/* Back to Signup */}
      <Link
        href="/signup"
        className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to signup
      </Link>
    </div>
  );
}

/**
 * Loading fallback for Suspense
 */
function VerifyLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
      <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-7 h-7 text-teal-600 animate-spin" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
      <p className="text-gray-500">Please wait...</p>
    </div>
  );
}

/**
 * Email Verification page for institutions.
 * Shows confirmation message after signup, handles email link verification.
 */
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}
