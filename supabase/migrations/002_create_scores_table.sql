-- Migration: Create scores table for CWI scoring results
-- Run this in Supabase SQL Editor

-- -----------------------------------------------------------------------------
-- SCORES TABLE
-- Stores CWI scoring results for each applicant
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,

    -- Construct-level scores (raw means)
    construct_scores JSONB NOT NULL,
    -- Construct-level z-scores (standardized)
    construct_z_scores JSONB NOT NULL,

    -- 5Cs scores
    character_score NUMERIC,
    capacity_score NUMERIC,
    capital_score NUMERIC,
    consistency_score NUMERIC,
    conditions_score NUMERIC,

    -- Final CWI scores
    cwi_raw NUMERIC NOT NULL,
    cwi_normalized NUMERIC NOT NULL,
    cwi_0_100 NUMERIC NOT NULL,

    -- Risk assessment
    risk_band TEXT NOT NULL,
    risk_percentile NUMERIC NOT NULL,

    -- Country used for normalization
    country TEXT NOT NULL,

    -- Model metadata
    model_version TEXT NOT NULL,
    scored_at TIMESTAMPTZ NOT NULL,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_scores_applicant_id ON scores(applicant_id);
CREATE INDEX IF NOT EXISTS idx_scores_cwi_0_100 ON scores(cwi_0_100);
CREATE INDEX IF NOT EXISTS idx_scores_risk_band ON scores(risk_band);
CREATE INDEX IF NOT EXISTS idx_scores_scored_at ON scores(scored_at);
CREATE INDEX IF NOT EXISTS idx_scores_model_version ON scores(model_version);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Allow viewing scores for owned applicants (institution users)
CREATE POLICY "Institution users can view their applicant scores" ON scores
    FOR SELECT
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

-- Allow admins full access
CREATE POLICY "Admins have full access to scores" ON scores
    FOR ALL
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Allow anonymous inserts (applicant app uses anon key for client-side scoring)
CREATE POLICY "Allow anonymous insert on scores" ON scores
    FOR INSERT
    WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- UPDATE APPLICANTS TABLE
-- Add scoring fields if they don't exist
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    -- Add cwi_score column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applicants' AND column_name = 'cwi_score'
    ) THEN
        ALTER TABLE applicants ADD COLUMN cwi_score NUMERIC;
    END IF;

    -- Add risk_category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applicants' AND column_name = 'risk_category'
    ) THEN
        ALTER TABLE applicants ADD COLUMN risk_category TEXT;
    END IF;

    -- Add scored_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applicants' AND column_name = 'scored_at'
    ) THEN
        ALTER TABLE applicants ADD COLUMN scored_at TIMESTAMPTZ;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- VIEWS (for dashboard analytics)
-- -----------------------------------------------------------------------------

-- Risk distribution view
CREATE OR REPLACE VIEW risk_distribution AS
SELECT
    s.risk_band,
    a.institution_id,
    a.country,
    COUNT(*) as count,
    AVG(s.cwi_0_100) as avg_cwi,
    MIN(s.cwi_0_100) as min_cwi,
    MAX(s.cwi_0_100) as max_cwi
FROM scores s
JOIN applicants a ON a.id = s.applicant_id
GROUP BY s.risk_band, a.institution_id, a.country;

-- 5Cs breakdown view
CREATE OR REPLACE VIEW five_cs_breakdown AS
SELECT
    a.institution_id,
    a.country,
    AVG(s.character_score) as avg_character,
    AVG(s.capacity_score) as avg_capacity,
    AVG(s.capital_score) as avg_capital,
    AVG(s.consistency_score) as avg_consistency,
    AVG(s.conditions_score) as avg_conditions,
    COUNT(*) as sample_size
FROM scores s
JOIN applicants a ON a.id = s.applicant_id
GROUP BY a.institution_id, a.country;

-- Construct scores view (for detailed analysis)
CREATE OR REPLACE VIEW construct_analysis AS
SELECT
    s.applicant_id,
    a.session_id,
    a.institution_id,
    s.construct_scores,
    s.construct_z_scores,
    s.cwi_0_100,
    s.risk_band,
    s.model_version,
    s.scored_at
FROM scores s
JOIN applicants a ON a.id = s.applicant_id;
