-- Migration: Fix RLS policies for institution filtering
-- Run this in Supabase SQL Editor
--
-- The issue: When institutions sign up, their user ID becomes the institution_id.
-- The questionnaire link includes ?institution={user_id}, so applicants are linked
-- to institutions via that ID. The RLS policy needs to check if the current user's
-- ID matches the applicant's institution_id.

-- -----------------------------------------------------------------------------
-- DROP EXISTING POLICIES
-- -----------------------------------------------------------------------------

-- Drop old applicants policies
DROP POLICY IF EXISTS "Institution users can view their applicants" ON applicants;
DROP POLICY IF EXISTS "Admins have full access to applicants" ON applicants;
DROP POLICY IF EXISTS "Allow anonymous insert on applicants" ON applicants;
DROP POLICY IF EXISTS "Anyone can insert applicants" ON applicants;

-- Drop old scores policies
DROP POLICY IF EXISTS "Institution users can view their applicant scores" ON scores;
DROP POLICY IF EXISTS "Admins have full access to scores" ON scores;
DROP POLICY IF EXISTS "Service role can insert scores" ON scores;

-- Drop old responses policies
DROP POLICY IF EXISTS "View responses for owned applicants" ON responses;
DROP POLICY IF EXISTS "Allow anonymous insert on responses" ON responses;

-- -----------------------------------------------------------------------------
-- CREATE NEW POLICIES - APPLICANTS
-- -----------------------------------------------------------------------------

-- Allow anyone (anonymous) to insert applicants
CREATE POLICY "Anyone can insert applicants" ON applicants
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Institution users can view applicants where their user ID = institution_id
CREATE POLICY "Institution users view their applicants" ON applicants
    FOR SELECT
    TO authenticated
    USING (
        -- Match on institution_id = current user's ID
        institution_id = auth.uid()::text
        OR
        -- Or if user is admin
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Admins have full access
CREATE POLICY "Admins full access to applicants" ON applicants
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- -----------------------------------------------------------------------------
-- CREATE NEW POLICIES - SCORES
-- -----------------------------------------------------------------------------

-- Allow anyone (anonymous) to insert scores
CREATE POLICY "Anyone can insert scores" ON scores
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Institution users can view scores for their applicants
CREATE POLICY "Institution users view their applicant scores" ON scores
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM applicants
            WHERE applicants.id = scores.applicant_id
            AND (
                applicants.institution_id = auth.uid()::text
                OR
                (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
            )
        )
    );

-- Admins have full access
CREATE POLICY "Admins full access to scores" ON scores
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- -----------------------------------------------------------------------------
-- CREATE NEW POLICIES - RESPONSES
-- -----------------------------------------------------------------------------

-- Allow anyone (anonymous) to insert responses
CREATE POLICY "Anyone can insert responses" ON responses
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Institution users can view responses for their applicants
CREATE POLICY "Institution users view their applicant responses" ON responses
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM applicants
            WHERE applicants.id = responses.applicant_id
            AND (
                applicants.institution_id = auth.uid()::text
                OR
                (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
            )
        )
    );

-- -----------------------------------------------------------------------------
-- VERIFICATION QUERIES
-- After running this migration, you can test with:
--
-- 1. Sign in as an institution user
-- 2. Check your user ID: SELECT auth.uid();
-- 3. Query applicants: SELECT * FROM applicants;
-- 4. You should only see applicants where institution_id matches your user ID
-- -----------------------------------------------------------------------------
