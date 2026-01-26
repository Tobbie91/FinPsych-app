-- ============================================================================
-- FIX: Allow Applicant Submissions to Work
-- ============================================================================
-- Problem 1: The scores table only allows "service role" to insert,
--            but the applicant app uses the "anon" key.
-- Problem 2: The applicants table doesn't allow anonymous updates,
--            but the app updates it with cwi_score after scoring.
-- Solution: Add policies to allow anonymous inserts/updates.
-- ============================================================================

-- Fix 1: Allow anonymous inserts into scores table
DROP POLICY IF EXISTS "Service role can insert scores" ON scores;

CREATE POLICY "Allow anonymous insert on scores" ON scores
    FOR INSERT
    WITH CHECK (true);

-- Fix 2: Allow anonymous updates to applicants table (for adding cwi_score)
CREATE POLICY "Allow anonymous update on applicants" ON applicants
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- VERIFICATION QUERY
-- Run this after applying the fix to verify policies are correct:
-- ============================================================================
/*
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('applicants', 'responses', 'scores')
ORDER BY tablename, policyname;
*/
