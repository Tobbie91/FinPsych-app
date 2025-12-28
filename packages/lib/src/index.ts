/**
 * Main entry point for @fintech/lib package.
 * Re-exports all library utilities.
 */

// Supabase clients
export { createClient as createBrowserClient } from './supabase/client';
export { createClient as createServerClient } from './supabase/server';
export { updateSession } from './supabase/middleware';

// Auth helpers
export {
  mapSupabaseUser,
  getUserRole,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  getRedirectUrlForUser,
  hasRequiredRole,
  isAdmin,
} from './auth';
