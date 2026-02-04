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

-- Verify the rename
SELECT column_name FROM information_schema.columns
WHERE table_name='scores' AND column_name='collateral_score';
