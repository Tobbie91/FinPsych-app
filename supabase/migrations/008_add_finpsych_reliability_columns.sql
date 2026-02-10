-- Migration: Add FinPsych score and data reliability columns
-- Purpose: Store adaptive weighted FinPsych scores and reliability levels
-- Author: Claude Code
-- Date: 2026-02-10

-- Add finpsych_score column
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS finpsych_score NUMERIC;

-- Add data_reliability column
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS data_reliability TEXT;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_applicants_finpsych_score ON applicants(finpsych_score);
CREATE INDEX IF NOT EXISTS idx_applicants_data_reliability ON applicants(data_reliability);

-- Add comments for documentation
COMMENT ON COLUMN applicants.finpsych_score IS 'FinPsych composite score with adaptive weighting (0-100): CWI weighted by data reliability';
COMMENT ON COLUMN applicants.data_reliability IS 'Data reliability level based on consistency: HIGH, MODERATE_HIGH, MODERATE, LOW, VERY_LOW';

-- Verification query (commented out - for manual testing)
-- SELECT finpsych_score, data_reliability FROM applicants LIMIT 5;
