-- Migration: Add validation, quality, and ASFN columns to applicants table
-- This allows storing validation results and ASFN scores directly

-- Add validation and quality columns
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS validation_result JSONB;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS quality_score NUMERIC;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS response_metadata JSONB;

-- Add ASFN-specific columns for easier querying
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS asfn_level1_score NUMERIC;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS asfn_level2_score NUMERIC;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS asfn_overall_score NUMERIC;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS asfn_tier TEXT;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_applicants_quality_score ON applicants(quality_score);
CREATE INDEX IF NOT EXISTS idx_applicants_asfn_overall_score ON applicants(asfn_overall_score);
CREATE INDEX IF NOT EXISTS idx_applicants_asfn_tier ON applicants(asfn_tier);

-- Add comment for documentation
COMMENT ON COLUMN applicants.validation_result IS 'Validation result object containing flags and consistency score';
COMMENT ON COLUMN applicants.quality_score IS 'Overall quality/consistency score from validation';
COMMENT ON COLUMN applicants.response_metadata IS 'Session and question-level metadata including timing and answer changes';
COMMENT ON COLUMN applicants.asfn_level1_score IS 'ASFN Level 1 (Functional Numeracy) accuracy percentage';
COMMENT ON COLUMN applicants.asfn_level2_score IS 'ASFN Level 2 (Financial Comparison) accuracy percentage';
COMMENT ON COLUMN applicants.asfn_overall_score IS 'ASFN overall score (60% Level 1, 40% Level 2)';
COMMENT ON COLUMN applicants.asfn_tier IS 'ASFN tier classification: LOW (<50%), MEDIUM (50-74%), HIGH (>=75%)';
