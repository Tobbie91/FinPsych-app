/**
 * Client-only exports for @fintech/lib package.
 * Use this for browser-side code to avoid bundling server dependencies.
 */

// Browser-safe Supabase client
export { createClient as createBrowserClient } from './supabase/client';

// Auth helpers (these are all isomorphic)
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
