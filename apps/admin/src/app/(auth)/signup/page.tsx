'use client';

import { useAuth } from '@fintech/hooks';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

/**
 * Signup page for admins.
 * Placeholder - implement form UI based on your design system.
 */
export default function SignupPage() {
  const router = useRouter();
  const { register, isRegistering, registerError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const user = await register({ email, password, role: 'admin' });
    if (user) {
      router.push('/dashboard');
    }
  }

  return (
    <div>
      <h1>Admin Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {registerError && <p>{registerError.message}</p>}
        <button type="submit" disabled={isRegistering}>
          {isRegistering ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
}
