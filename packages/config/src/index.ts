/**
 * Environment configuration with validation.
 * Uses Zod for runtime validation of environment variables.
 */

import { z } from 'zod';

// -----------------------------------------------------------------------------
// Environment Schema
// -----------------------------------------------------------------------------

/**
 * Schema for validating environment variables.
 * All required env vars must be defined here.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // App URLs for role-based redirects
  NEXT_PUBLIC_APPLICANT_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_INSTITUTION_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_ADMIN_URL: z.string().url().default('http://localhost:3002'),
});

export type Env = z.infer<typeof envSchema>;

// -----------------------------------------------------------------------------
// Environment Validation
// -----------------------------------------------------------------------------

/**
 * Validates and returns environment configuration.
 * Throws descriptive error if validation fails.
 */
export function getEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APPLICANT_URL: process.env.NEXT_PUBLIC_APPLICANT_URL,
    NEXT_PUBLIC_INSTITUTION_URL: process.env.NEXT_PUBLIC_INSTITUTION_URL,
    NEXT_PUBLIC_ADMIN_URL: process.env.NEXT_PUBLIC_ADMIN_URL,
  });

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check your .env file.');
  }

  return parsed.data;
}

// -----------------------------------------------------------------------------
// App Configuration
// -----------------------------------------------------------------------------

/**
 * Get the redirect URL for a given role.
 */
export function getAppUrlForRole(role: 'applicant' | 'institution' | 'admin'): string {
  const env = getEnv();

  const urls: Record<typeof role, string> = {
    applicant: env.NEXT_PUBLIC_APPLICANT_URL,
    institution: env.NEXT_PUBLIC_INSTITUTION_URL,
    admin: env.NEXT_PUBLIC_ADMIN_URL,
  };

  return urls[role];
}

/**
 * Application-wide constants.
 */
export const APP_CONFIG = {
  // Auth
  AUTH_COOKIE_NAME: 'fintech-auth',
  SESSION_EXPIRY_DAYS: 7,

  // Routes
  LOGIN_PATH: '/login',
  SIGNUP_PATH: '/signup',
  DASHBOARD_PATH: '/dashboard',
} as const;
