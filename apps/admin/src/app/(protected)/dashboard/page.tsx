'use client';

import { useUser, useAuth } from '@fintech/hooks';

/**
 * Admin dashboard page.
 * Placeholder - implement dashboard UI based on your requirements.
 */
export default function DashboardPage() {
  const { user } = useUser();
  const { logout, isLoggingOut } = useAuth();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={() => logout()} disabled={isLoggingOut}>
        {isLoggingOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
}
