-- Migration: Add validation and quality tracking fields to applicants table
-- Description: Adds support for consistency checks and response quality scoring

-- Add validation columns to applicants table
ALTER TABLE applicants
ADD COLUMN IF NOT EXISTS validation_result JSONB,
ADD COLUMN IF NOT EXISTS quality_score INTEGER,
ADD COLUMN IF NOT EXISTS response_metadata JSONB;

-- Add comments to document the fields
COMMENT ON COLUMN applicants.validation_result IS 'Full consistency check results from @fintech/validation package';
COMMENT ON COLUMN applicants.quality_score IS 'Consistency score (0-100) calculated as 100 - (inconsistencies × 7)';
COMMENT ON COLUMN applicants.response_metadata IS 'Question timing data and session metadata';

-- Create index for quality score filtering
CREATE INDEX IF NOT EXISTS idx_applicants_quality
ON applicants(quality_score);

-- Create index for validation result queries (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_applicants_validation
ON applicants USING GIN (validation_result);

-- Create index for response metadata queries
CREATE INDEX IF NOT EXISTS idx_applicants_metadata
ON applicants USING GIN (response_metadata);

-- Add check constraint to ensure quality_score is between 0 and 100
ALTER TABLE applicants
ADD CONSTRAINT quality_score_range CHECK (quality_score >= 0 AND quality_score <= 100);

-- Migration complete
-- Next steps:
-- 1. Run this migration: psql -d your_database < add_validation_fields.sql
-- 2. Update applicant app to save validation results
-- 3. Update admin dashboard to display quality scores
