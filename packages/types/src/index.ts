/**
 * Shared TypeScript types for the fintech credit application.
 * These types are used across all apps and packages.
 */

// -----------------------------------------------------------------------------
// User & Auth Types
// -----------------------------------------------------------------------------

/**
 * User roles in the system.
 * - applicant: Borrowers applying for credit
 * - institution: Banks and financial institutions
 * - admin: System administrators
 */
export type Role = 'applicant' | 'institution' | 'admin';

/**
 * Base user type representing authenticated users.
 * Role is stored in Supabase user_metadata.
 */
export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/**
 * User metadata stored in Supabase auth.
 */
export interface UserMetadata {
  role: Role;
}

// -----------------------------------------------------------------------------
// Applicant Types
// -----------------------------------------------------------------------------

/**
 * Profile for applicants (borrowers).
 * Placeholder - implement fields based on business requirements.
 */
export interface ApplicantProfile {
  id: string;
  userId: string;
  // Add applicant-specific fields here
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Institution Types
// -----------------------------------------------------------------------------

/**
 * Financial institution entity.
 * Placeholder - implement fields based on business requirements.
 */
export interface Institution {
  id: string;
  name: string;
  // Add institution-specific fields here
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Credit Types
// -----------------------------------------------------------------------------

/**
 * Credit score record.
 * Placeholder - implement fields based on business requirements.
 */
export interface CreditScore {
  id: string;
  applicantId: string;
  // Add credit score fields here
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Auth Types
// -----------------------------------------------------------------------------

/**
 * Auth state for the application.
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Sign up request payload.
 */
export interface SignUpRequest {
  email: string;
  password: string;
  role: Role;
}

/**
 * Sign in request payload.
 */
export interface SignInRequest {
  email: string;
  password: string;
}
