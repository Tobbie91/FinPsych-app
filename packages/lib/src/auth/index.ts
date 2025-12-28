/**
 * Authentication helper functions.
 * Shared auth utilities for all apps.
 */

import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { Role, User, SignUpRequest, SignInRequest } from '@fintech/types';
import { getAppUrlForRole } from '@fintech/config';

// -----------------------------------------------------------------------------
// User Helpers
// -----------------------------------------------------------------------------

/**
 * Extracts our User type from Supabase user data.
 */
export function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  const role = (supabaseUser.user_metadata?.role as Role) || 'applicant';

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    role,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
  };
}

/**
 * Gets the user's role from Supabase user metadata.
 */
export function getUserRole(supabaseUser: SupabaseUser | null): Role | null {
  if (!supabaseUser) return null;
  return (supabaseUser.user_metadata?.role as Role) || null;
}

// -----------------------------------------------------------------------------
// Auth Operations
// -----------------------------------------------------------------------------

/**
 * Signs up a new user with email and password.
 * Role is stored in user_metadata.
 */
export async function signUp(
  client: SupabaseClient,
  { email, password, role }: SignUpRequest
): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  });

  if (error) {
    return { user: null, error };
  }

  if (!data.user) {
    return { user: null, error: new Error('No user returned from sign up') };
  }

  return { user: mapSupabaseUser(data.user), error: null };
}

/**
 * Signs in a user with email and password.
 */
export async function signIn(
  client: SupabaseClient,
  { email, password }: SignInRequest
): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  if (!data.user) {
    return { user: null, error: new Error('No user returned from sign in') };
  }

  return { user: mapSupabaseUser(data.user), error: null };
}

/**
 * Signs out the current user.
 */
export async function signOut(client: SupabaseClient): Promise<{ error: Error | null }> {
  const { error } = await client.auth.signOut();
  return { error };
}

/**
 * Gets the current authenticated user.
 */
export async function getCurrentUser(
  client: SupabaseClient
): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await client.auth.getUser();

  if (error) {
    return { user: null, error };
  }

  if (!data.user) {
    return { user: null, error: null };
  }

  return { user: mapSupabaseUser(data.user), error: null };
}

// -----------------------------------------------------------------------------
// Role-based Routing
// -----------------------------------------------------------------------------

/**
 * Gets the correct app URL for a user based on their role.
 * Used for redirecting users to the appropriate app after auth.
 */
export function getRedirectUrlForUser(user: User): string {
  return getAppUrlForRole(user.role);
}

/**
 * Checks if a user has the required role for an app.
 */
export function hasRequiredRole(user: User | null, requiredRole: Role): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

/**
 * Checks if a user is an admin (admins can access all apps).
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}
