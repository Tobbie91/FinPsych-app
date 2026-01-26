-- ============================================================================
-- RE-ENABLE RLS WITH CORRECT POLICIES
-- ============================================================================
-- This allows anonymous submissions AND admin dashboard to view data

-- First, drop any existing anonymous policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous insert on applicants" ON applicants;
DROP POLICY IF EXISTS "Allow anonymous update on applicants" ON applicants;
DROP POLICY IF EXISTS "Allow anonymous select on applicants" ON applicants;
DROP POLICY IF EXISTS "Allow anonymous insert on scores" ON scores;
DROP POLICY IF EXISTS "Allow anonymous select on scores" ON scores;
DROP POLICY IF EXISTS "Allow anonymous insert on responses" ON responses;
DROP POLICY IF EXISTS "Allow anonymous select on responses" ON responses;

-- APPLICANTS TABLE POLICIES
-- Allow anonymous inserts (for submissions)
CREATE POLICY "Allow anonymous insert on applicants" ON applicants
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous updates (for updating cwi_score after scoring)
CREATE POLICY "Allow anonymous update on applicants" ON applicants
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Allow anonymous SELECT (for admin dashboard)
CREATE POLICY "Allow anonymous select on applicants" ON applicants
    FOR SELECT
    TO anon
    USING (true);

-- SCORES TABLE POLICIES
-- Allow anonymous inserts (for scoring)
CREATE POLICY "Allow anonymous insert on scores" ON scores
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous SELECT (for admin dashboard)
CREATE POLICY "Allow anonymous select on scores" ON scores
    FOR SELECT
    TO anon
    USING (true);

-- RESPONSES TABLE POLICIES
-- Allow anonymous inserts (for question responses)
CREATE POLICY "Allow anonymous insert on responses" ON responses
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous SELECT (for admin dashboard)
CREATE POLICY "Allow anonymous select on responses" ON responses
    FOR SELECT
    TO anon
    USING (true);

-- ============================================================================
-- VERIFY RLS IS ENABLED
-- ============================================================================
-- Make sure RLS is enabled on all tables
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
