-- Fix: Allow anonymous inserts into scores table
-- The applicant app uses anon key and needs to insert scores after submission

-- Drop the old policy that only allows service role
DROP POLICY IF EXISTS "Service role can insert scores" ON scores;

-- Create new policy that allows anonymous inserts
CREATE POLICY "Allow anonymous insert on scores" ON scores
    FOR INSERT
    WITH CHECK (true);
