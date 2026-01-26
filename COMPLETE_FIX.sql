-- ============================================================================
-- COMPLETE FIX: Remove All Policies and Recreate From Scratch
-- ============================================================================
-- This will completely reset RLS policies on applicants, responses, and scores
-- to allow anonymous submissions to work properly.
-- ============================================================================

-- Step 1: DROP ALL EXISTING POLICIES (clean slate)
-- ============================================================================

-- Drop all policies on applicants table
DROP POLICY IF EXISTS "Allow anonymous insert on applicants" ON applicants;
DROP POLICY IF EXISTS "Allow anonymous update on applicants" ON applicants;
DROP POLICY IF EXISTS "Institution users can view their applicants" ON applicants;
DROP POLICY IF EXISTS "Admins have full access to applicants" ON applicants;

-- Drop all policies on responses table
DROP POLICY IF EXISTS "Allow anonymous insert on responses" ON responses;
DROP POLICY IF EXISTS "View responses for owned applicants" ON responses;

-- Drop all policies on scores table
DROP POLICY IF EXISTS "Service role can insert scores" ON scores;
DROP POLICY IF EXISTS "Allow anonymous insert on scores" ON scores;
DROP POLICY IF EXISTS "Institution users can view their applicant scores" ON scores;
DROP POLICY IF EXISTS "Admins have full access to scores" ON scores;

-- Step 2: RECREATE POLICIES (correct configuration)
-- ============================================================================

-- APPLICANTS TABLE POLICIES
-- -------------------------

-- Allow anonymous inserts (applicants can submit without auth)
CREATE POLICY "Allow anonymous insert on applicants" ON applicants
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous updates (for adding cwi_score after submission)
CREATE POLICY "Allow anonymous update on applicants" ON applicants
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow institution users to view their applicants
CREATE POLICY "Institution users can view their applicants" ON applicants
    FOR SELECT
    TO authenticated
    USING (
        institution_id = (
            SELECT auth.jwt() -> 'user_metadata' ->> 'institution_id'
        )
        OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Allow admins full access
CREATE POLICY "Admins have full access to applicants" ON applicants
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- RESPONSES TABLE POLICIES
-- -------------------------

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous insert on responses" ON responses
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow viewing responses for owned applicants
CREATE POLICY "View responses for owned applicants" ON responses
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM applicants
            WHERE applicants.id = responses.applicant_id
            AND (
                applicants.institution_id = (
                    SELECT auth.jwt() -> 'user_metadata' ->> 'institution_id'
                )
                OR
                (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
            )
        )
    );

-- SCORES TABLE POLICIES
-- ----------------------

-- Allow anonymous inserts (applicant app uses anon key for client-side scoring)
CREATE POLICY "Allow anonymous insert on scores" ON scores
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow viewing scores for owned applicants (institution users)
CREATE POLICY "Institution users can view their applicant scores" ON scores
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM applicants
            WHERE applicants.id = scores.applicant_id
            AND (
                applicants.institution_id = (
                    SELECT auth.jwt() -> 'user_metadata' ->> 'institution_id'
                )
                OR
                (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
            )
        )
    );

-- Allow admins full access to scores
CREATE POLICY "Admins have full access to scores" ON scores
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this, verify with:
-- node check-policies.js
--
-- You should see all green checkmarks (✅)
-- ============================================================================
