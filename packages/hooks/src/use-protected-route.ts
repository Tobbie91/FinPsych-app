/**
 * useProtectedRoute hook for route protection.
 * Redirects unauthenticated users or users with wrong role.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './use-user';
import { getRedirectUrlForUser, hasRequiredRole } from '@fintech/lib/client';
import { APP_CONFIG } from '@fintech/config';
import type { Role } from '@fintech/types';

interface UseProtectedRouteOptions {
  /**
   * Required role to access this route.
   * If not specified, only checks for authentication.
   */
  requiredRole?: Role;

  /**
   * Redirect path for unauthenticated users.
   * Defaults to /login.
   */
  redirectTo?: string;

  /**
   * Whether to redirect users to their correct app based on role.
   * Defaults to true.
   */
  redirectToCorrectApp?: boolean;
}

interface UseProtectedRouteReturn {
  /**
   * Whether the route protection check is complete.
   */
  isReady: boolean;

  /**
   * Whether the current user is authorized for this route.
   */
  isAuthorized: boolean;

  /**
   * Whether the check is still loading.
   */
  isLoading: boolean;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}): UseProtectedRouteReturn {
  const {
    requiredRole,
    redirectTo = APP_CONFIG.LOGIN_PATH,
    redirectToCorrectApp = true,
  } = options;

  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!user) {
      router.replace(redirectTo);
      return;
    }

    // Check if user has the required role
    if (requiredRole && !hasRequiredRole(user, requiredRole)) {
      // Redirect to correct app if enabled
      if (redirectToCorrectApp) {
        const correctUrl = getRedirectUrlForUser(user);
        window.location.href = correctUrl;
      } else {
        router.replace(redirectTo);
      }
      return;
    }
  }, [user, isLoading, requiredRole, redirectTo, redirectToCorrectApp, router]);

  const isAuthorized =
    !isLoading && !!user && (!requiredRole || hasRequiredRole(user, requiredRole));

  return {
    isReady: !isLoading,
    isAuthorized,
    isLoading,
  };
}
