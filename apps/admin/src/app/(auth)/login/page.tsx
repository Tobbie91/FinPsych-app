'use client';

import { useAuth } from '@fintech/hooks';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

/**
 * Login page for admins.
 * Placeholder - implement form UI based on your design system.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const user = await login({ email, password });
    if (user) {
      router.push('/dashboard');
    }
  }

  return (
    <div>
      <h1>Admin Login</h1>
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
        {loginError && <p>{loginError.message}</p>}
        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p>
        Don&apos;t have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}
