-- Migration: Create applicants and responses tables for CWI questionnaire
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- APPLICANTS TABLE
-- Stores applicant demographic info and session metadata
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    institution_id TEXT,
    assessment_id TEXT,

    -- Demographics (Section A)
    full_name TEXT,
    email TEXT,
    country TEXT,
    age_range TEXT,
    gender TEXT,
    marital_status TEXT,
    education TEXT,
    employment_status TEXT,
    income_range TEXT,
    dependents TEXT,
    has_bank_account TEXT,
    loan_history TEXT,
    residency_status TEXT,

    -- Session metadata
    device_info JSONB,
    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    total_time_ms INTEGER,

    -- Scoring (populated by scoring engine)
    cwi_score NUMERIC,
    risk_category TEXT,
    scored_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- RESPONSES TABLE
-- Stores individual question responses with metadata
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answer TEXT NOT NULL,

    -- Question metadata (timing, answer changes)
    metadata JSONB,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------

-- Applicants indexes
CREATE INDEX IF NOT EXISTS idx_applicants_session_id ON applicants(session_id);
CREATE INDEX IF NOT EXISTS idx_applicants_institution_id ON applicants(institution_id);
CREATE INDEX IF NOT EXISTS idx_applicants_assessment_id ON applicants(assessment_id);
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);
CREATE INDEX IF NOT EXISTS idx_applicants_submitted_at ON applicants(submitted_at);
CREATE INDEX IF NOT EXISTS idx_applicants_cwi_score ON applicants(cwi_score);

-- Responses indexes
CREATE INDEX IF NOT EXISTS idx_responses_applicant_id ON responses(applicant_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Applicants policies
-- Allow anonymous inserts (applicants can submit without auth)
CREATE POLICY "Allow anonymous insert on applicants" ON applicants
    FOR INSERT
    WITH CHECK (true);

-- Allow anonymous updates (for adding cwi_score after submission)
CREATE POLICY "Allow anonymous update on applicants" ON applicants
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Allow institution users to view their applicants
CREATE POLICY "Institution users can view their applicants" ON applicants
    FOR SELECT
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
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Responses policies
-- Allow anonymous inserts
CREATE POLICY "Allow anonymous insert on responses" ON responses
    FOR INSERT
    WITH CHECK (true);

-- Allow viewing responses for owned applicants
CREATE POLICY "View responses for owned applicants" ON responses
    FOR SELECT
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

-- -----------------------------------------------------------------------------
-- FUNCTIONS
-- -----------------------------------------------------------------------------

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for applicants
DROP TRIGGER IF EXISTS applicants_updated_at ON applicants;
CREATE TRIGGER applicants_updated_at
    BEFORE UPDATE ON applicants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- VIEWS (for dashboard analytics)
-- -----------------------------------------------------------------------------

-- Submission statistics view
CREATE OR REPLACE VIEW submission_stats AS
SELECT
    DATE(submitted_at) as submission_date,
    institution_id,
    COUNT(*) as total_submissions,
    AVG(total_time_ms) / 1000.0 / 60.0 as avg_completion_minutes,
    AVG(cwi_score) as avg_cwi_score,
    COUNT(CASE WHEN risk_category = 'low' THEN 1 END) as low_risk_count,
    COUNT(CASE WHEN risk_category = 'medium' THEN 1 END) as medium_risk_count,
    COUNT(CASE WHEN risk_category = 'high' THEN 1 END) as high_risk_count
FROM applicants
WHERE submitted_at IS NOT NULL
GROUP BY DATE(submitted_at), institution_id;

-- Response time analytics view (for footprint analysis)
CREATE OR REPLACE VIEW response_time_analytics AS
SELECT
    r.applicant_id,
    a.session_id,
    r.question_id,
    (r.metadata ->> 'timeSpentMs')::INTEGER as time_spent_ms,
    jsonb_array_length(COALESCE(r.metadata -> 'answerChanges', '[]'::jsonb)) as answer_change_count,
    r.answer as final_answer
FROM responses r
JOIN applicants a ON a.id = r.applicant_id;
