/**
 * useUser hook for accessing current user data.
 * Uses TanStack Query for caching and auto-refresh.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { createBrowserClient, getCurrentUser } from '@fintech/lib/client';
import type { User } from '@fintech/types';

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUser(): UseUserReturn {
  const supabase = createBrowserClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { user, error } = await getCurrentUser(supabase);
      if (error) throw error;
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  return {
    user: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
