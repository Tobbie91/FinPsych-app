-- Delete old applicant data, keeping only the 3 most recent submissions
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Get IDs of the 3 most recent applicants to KEEP
WITH recent_applicants AS (
  SELECT id
  FROM applicants
  ORDER BY submitted_at DESC NULLS LAST
  LIMIT 3
)

-- Step 2: Delete responses for applicants NOT in the recent 3
, deleted_responses AS (
  DELETE FROM responses
  WHERE applicant_id NOT IN (SELECT id FROM recent_applicants)
  RETURNING applicant_id
)

-- Step 3: Delete scores for applicants NOT in the recent 3
, deleted_scores AS (
  DELETE FROM scores
  WHERE applicant_id NOT IN (SELECT id FROM recent_applicants)
  RETURNING applicant_id
)

-- Step 4: Delete applicants NOT in the recent 3
DELETE FROM applicants
WHERE id NOT IN (SELECT id FROM recent_applicants)
RETURNING id, full_name, email, submitted_at;
