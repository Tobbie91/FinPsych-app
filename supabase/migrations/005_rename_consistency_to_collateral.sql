-- Migration: Rename consistency_score to collateral_score
-- This aligns the database with the correct Five Cs terminology

-- 1) Confirm the column exists before renaming (Postgres)
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name IN ('consistency_score','collateral_score')
ORDER BY table_name;

-- 2) Rename only if the old column exists and new doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='scores' AND column_name='consistency_score'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='scores' AND column_name='collateral_score'
  ) THEN
    EXECUTE 'ALTER TABLE scores RENAME COLUMN consistency_score TO collateral_score';
  END IF;
END $$;

-- 3) Update the five_cs_breakdown view to use collateral_score
CREATE OR REPLACE VIEW five_cs_breakdown AS
SELECT
    a.institution_id,
    a.country,
    AVG(s.character_score) as avg_character,
    AVG(s.capacity_score) as avg_capacity,
    AVG(s.capital_score) as avg_capital,
    AVG(s.collateral_score) as avg_collateral,
    AVG(s.conditions_score) as avg_conditions,
    COUNT(*) as sample_size
FROM scores s
JOIN applicants a ON a.id = s.applicant_id
GROUP BY a.institution_id, a.country;

-- Verify the rename
SELECT column_name FROM information_schema.columns
WHERE table_name='scores' AND column_name='collateral_score';
