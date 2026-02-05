-- Migration: Add DEM12 (insurance) and DEM13 (subscriptions) columns
-- These support the Q4/Q5 N/A auto-fill logic from Batch 3

ALTER TABLE applicants ADD COLUMN IF NOT EXISTS has_insurance TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS has_subscriptions TEXT;

COMMENT ON COLUMN applicants.has_insurance IS 'DEM12: Insurance ownership status (for Q4 N/A logic)';
COMMENT ON COLUMN applicants.has_subscriptions IS 'DEM13: Subscription ownership status (for Q5 N/A logic)';
