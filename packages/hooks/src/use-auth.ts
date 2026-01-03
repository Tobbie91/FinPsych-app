/**
 * useAuth hook for managing authentication state.
 * Provides login, logout, and signup functionality.
 */

'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient, signIn, signUp, signOut } from '@fintech/lib/client';
import type { SignInRequest, SignUpRequest, User } from '@fintech/types';
import { useUser } from './use-user';

interface UseAuthReturn {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: SignInRequest) => Promise<User | null>;
  register: (credentials: SignUpRequest) => Promise<User | null>;
  logout: () => Promise<void>;

  // Mutation states
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  loginError: Error | null;
  registerError: Error | null;
}

export function useAuth(): UseAuthReturn {
  const queryClient = useQueryClient();
  const { user, isLoading } = useUser();
  const supabase = createBrowserClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: SignInRequest) => {
      const { user, error } = await signIn(supabase, credentials);
      if (error) throw error;
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: SignUpRequest) => {
      const { user, error } = await signUp(supabase, credentials);
      if (error) throw error;
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await signOut(supabase);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.clear();
    },
  });

  const login = useCallback(
    async (credentials: SignInRequest) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (credentials: SignUpRequest) => {
      return registerMutation.mutateAsync(credentials);
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,

    login,
    register,
    logout,

    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
