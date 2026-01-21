-- Migration: Clear database but preserve admin records
-- Description: Removes all applicant responses and test data while keeping admin user accounts

-- WARNING: This will delete all applicant data!
-- Run this script only in development or when explicitly requested

-- Clear applicant responses
DELETE FROM applicants;

-- Reset the sequence for applicants table (if using auto-increment ID)
-- This ensures new applicants start from ID 1
ALTER SEQUENCE IF EXISTS applicants_id_seq RESTART WITH 1;

-- Note: Admin users in the auth.users table are NOT affected by this migration
-- The following tables/data are preserved:
-- - auth.users (admin accounts)
-- - Any other system tables

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Database cleared successfully. Applicant data removed, admin accounts preserved.';
END $$;
