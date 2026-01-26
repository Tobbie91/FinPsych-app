# Database Fix - Add Missing Columns

## What This Does
Adds missing columns to the `applicants` table so submissions can be saved properly:
- `validation_result` - Stores validation check results
- `quality_score` - Overall quality/consistency score
- `response_metadata` - Session and question timing data
- `asfn_level1_score` - ASFN Level 1 score
- `asfn_level2_score` - ASFN Level 2 score
- `asfn_overall_score` - ASFN overall score
- `asfn_tier` - Tier classification (LOW/MEDIUM/HIGH)

## How to Apply

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the ENTIRE contents of `supabase/migrations/003_add_validation_and_asfn_columns.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

## After Running

Test that submissions now work:
1. Fill out an assessment on your Netlify site
2. Submit it
3. Run `node test-db-connection.js` to verify it's in the database
4. Check admin dashboard - it should appear there

## If You Get Errors

If you see "column already exists" errors, that's OK! It means some columns were already added. The migration uses `IF NOT EXISTS` so it's safe to run multiple times.
