-- Delete the latest test submission from the database
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Get the ID of the most recent applicant
WITH latest_applicant AS (
  SELECT id, full_name, email, submitted_at
  FROM applicants
  ORDER BY submitted_at DESC NULLS LAST
  LIMIT 1
)

-- Step 2: Delete responses for the latest applicant
, deleted_responses AS (
  DELETE FROM responses
  WHERE applicant_id IN (SELECT id FROM latest_applicant)
  RETURNING applicant_id
)

-- Step 3: Delete scores for the latest applicant
, deleted_scores AS (
  DELETE FROM scores
  WHERE applicant_id IN (SELECT id FROM latest_applicant)
  RETURNING applicant_id
)

-- Step 4: Delete the latest applicant and show what was deleted
DELETE FROM applicants
WHERE id IN (SELECT id FROM latest_applicant)
RETURNING id, full_name, email, submitted_at;
