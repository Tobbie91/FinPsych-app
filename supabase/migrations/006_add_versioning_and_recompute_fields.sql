-- Migration: Add versioning and recompute fields for scoring data integrity
-- Batch 5 - Data Integrity, Versioning, and Recompute Support
--
-- This migration adds fields to track:
-- 1. scoring_version - which version of the scoring algorithm was used
-- 2. recomputed_at - when scores were recomputed (if applicable)
-- 3. previous_scores - snapshot of old computed values before recompute
-- 4. gaming_risk_level - explicit gaming risk level from validation

-- =============================================================================
-- APPLICANTS TABLE - Add versioning fields
-- =============================================================================

-- Add scoring_version (no default yet, so existing rows get NULL)
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS scoring_version TEXT;

-- Add recomputed_at timestamp (null for original submissions)
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS recomputed_at TIMESTAMPTZ;

-- Add previous_scores snapshot (stores old computed values before recompute)
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS previous_scores JSONB;

-- Add gaming_risk_level (derived from validation, stored explicitly)
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS gaming_risk_level TEXT;

-- =============================================================================
-- SCORES TABLE - Add versioning fields
-- =============================================================================

-- Add scoring_version (no default yet, so existing rows get NULL)
ALTER TABLE scores ADD COLUMN IF NOT EXISTS scoring_version TEXT;

-- Add recomputed_at timestamp
ALTER TABLE scores ADD COLUMN IF NOT EXISTS recomputed_at TIMESTAMPTZ;

-- Add previous_scores snapshot
ALTER TABLE scores ADD COLUMN IF NOT EXISTS previous_scores JSONB;

-- =============================================================================
-- INDEXES for efficient querying of legacy records
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_applicants_scoring_version ON applicants(scoring_version);
CREATE INDEX IF NOT EXISTS idx_applicants_recomputed_at ON applicants(recomputed_at);
CREATE INDEX IF NOT EXISTS idx_applicants_gaming_risk_level ON applicants(gaming_risk_level);

CREATE INDEX IF NOT EXISTS idx_scores_scoring_version ON scores(scoring_version);
CREATE INDEX IF NOT EXISTS idx_scores_recomputed_at ON scores(recomputed_at);

-- =============================================================================
-- MARK EXISTING RECORDS AS LEGACY (pre-fix)
-- Records without scoring_version are legacy and need recompute
-- =============================================================================

-- Tag legacy applicants by submission date (before scoring fixes deployed)
UPDATE applicants
SET scoring_version = 'pre-fix-beta'
WHERE submitted_at < '2026-02-04T00:00:00Z'
  AND (scoring_version IS NULL OR scoring_version = '');

-- Tag legacy scores via their applicant's submission date
UPDATE scores s
SET scoring_version = 'pre-fix-beta'
FROM applicants a
WHERE s.applicant_id = a.id
  AND a.submitted_at < '2026-02-04T00:00:00Z'
  AND (s.scoring_version IS NULL OR s.scoring_version = '');

-- Now set DEFAULT for future inserts only
ALTER TABLE applicants ALTER COLUMN scoring_version SET DEFAULT 'v2.0';
ALTER TABLE scores ALTER COLUMN scoring_version SET DEFAULT 'v2.0';

-- =============================================================================
-- DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN applicants.scoring_version IS 'Version of scoring algorithm used. Values: pre-fix-beta (legacy), v2.0 (new), v2.0_recomputed (recomputed legacy)';
COMMENT ON COLUMN applicants.recomputed_at IS 'Timestamp when scores were recomputed (null for original submissions)';
COMMENT ON COLUMN applicants.previous_scores IS 'Snapshot of computed values before recompute, for audit trail';
COMMENT ON COLUMN applicants.gaming_risk_level IS 'Gaming risk level: MINIMAL, LOW, MODERATE, HIGH, SEVERE';

COMMENT ON COLUMN scores.scoring_version IS 'Version of scoring algorithm used. Values: pre-fix-beta (legacy), v2.0 (new), v2.0_recomputed (recomputed legacy)';
COMMENT ON COLUMN scores.recomputed_at IS 'Timestamp when scores were recomputed';
COMMENT ON COLUMN scores.previous_scores IS 'Snapshot of previous scores before recompute';

-- =============================================================================
-- VIEW: Legacy records that need recompute
-- =============================================================================

CREATE OR REPLACE VIEW legacy_records_to_recompute AS
SELECT
    a.id as applicant_id,
    a.session_id,
    a.full_name,
    a.email,
    a.scoring_version,
    a.submitted_at,
    a.cwi_score as current_cwi_score,
    a.nci_score as current_nci_score,
    a.quality_score as current_quality_score,
    (SELECT COUNT(*) FROM responses r WHERE r.applicant_id = a.id) as response_count
FROM applicants a
WHERE a.scoring_version = 'pre-fix-beta'
   OR a.scoring_version IS NULL
ORDER BY a.submitted_at DESC;

-- Summary count
SELECT
    scoring_version,
    COUNT(*) as record_count
FROM applicants
GROUP BY scoring_version
ORDER BY scoring_version;
