'use client';

import { useProtectedRoute } from '@fintech/hooks';
import type { ReactNode } from 'react';

/**
 * Protected layout for authenticated pages.
 * Redirects to login if not authenticated.
 * Redirects to correct app if user has wrong role.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isReady, isAuthorized } = useProtectedRoute({
    requiredRole: 'admin',
  });

  // Show nothing while checking auth
  if (!isReady) {
    return <div>Loading...</div>;
  }

  // User not authorized - redirect is happening
  if (!isAuthorized) {
    return <div>Redirecting...</div>;
  }

  return (
    <div>
      {/* Add navigation/sidebar here */}
      <main>{children}</main>
    </div>
  );
}
