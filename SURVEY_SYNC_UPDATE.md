# Survey Questions Synchronization Update

## Summary

The admin survey page has been updated to display the same questions as the applicant questionnaire, ensuring consistency across the application.

## Changes Made

### 1. Admin Survey Page Updated

**File:** [apps/admin/src/app/(protected)/survey/page.tsx](apps/admin/src/app/(protected)/survey/page.tsx)

**Changes:**
- Now imports questions directly from the applicant questionnaire data source
- Automatically syncs with any changes made to questionnaire questions
- Converts questionnaire format to survey management format on-the-fly
- Added 'Demographics' as a new category to support Section A

**Technical Implementation:**
```typescript
import { sections as questionnaireSections } from '../../../../../applicant/src/data/questions';

const convertToSurveyFormat = (): Section[] => {
  return questionnaireSections.map((section) => {
    // Maps section IDs to categories (Demographics, Character, Capacity, etc.)
    // Converts question format for survey UI
  });
};
```

**Benefits:**
- Single source of truth for all questions
- No manual syncing required between questionnaire and survey page
- Reduces maintenance burden
- Eliminates inconsistencies

### 2. Database Clearing Tools Created

Created tools to clear applicant data while preserving admin accounts.

#### SQL Migration File

**File:** [supabase/migrations/clear_database_keep_admin.sql](supabase/migrations/clear_database_keep_admin.sql)

**What it does:**
- Deletes all records from `applicants` table
- Resets the auto-increment sequence
- Preserves all admin user accounts in `auth.users` table
- Safe for development and testing

#### Bash Script for Easy Execution

**File:** [scripts/clear-database.sh](scripts/clear-database.sh)

**Usage:**
```bash
./scripts/clear-database.sh
```

**Features:**
- Interactive confirmation prompt (requires typing 'yes')
- Automatic detection of Supabase CLI
- Clear warning messages
- Provides alternative instructions if CLI not available

## Current Question Count

The survey page now displays **81 total questions** organized into **6 sections**:

1. **Section A: Demographic Information** (13 questions)
   - Name, email, age, gender, education, location, employment, income, marital status, dependents, housing, bank account, loan history

2. **Section B: CHARACTER** (20 questions)
   - Financial Discipline & Self-Control (6)
   - Conscientiousness (5)
   - Agreeableness (5)
   - Financial Integrity (4)

3. **Section C: CAPACITY** (29 questions)
   - Payment History (6)
   - Financial Management (6)
   - Crisis Management (2)
   - Emotional Stability (5)
   - Openness to Experience (5)
   - Extraversion (5)

4. **Section D: CAPITAL** (4 questions)
   - Emergency Savings and Financial Resources

5. **Section E: COLLATERAL** (3 questions)
   - Social Support & Alternative Resources

6. **Section F: CONDITIONS** (12 questions)
   - Future Orientation & Planning (2)
   - Risk Preference (5)
   - Planning Beliefs/Locus of Control (5)

## How to Clear the Database

### Option 1: Using the Bash Script (Recommended)
```bash
cd /Users/decagon/Documents/fintech-credit-app
./scripts/clear-database.sh
```

### Option 2: Using Supabase CLI Directly
```bash
supabase db push
```
This will apply all pending migrations, including the clear database migration.

### Option 3: Manual SQL Execution
If you prefer to run the SQL directly:
```bash
psql -d your_database < supabase/migrations/clear_database_keep_admin.sql
```

## What Gets Deleted

✅ **Deleted:**
- All applicant responses
- All questionnaire submissions
- Quality scores and validation results
- Response metadata

❌ **Preserved:**
- Admin user accounts
- System tables
- Authentication data
- Application configuration

## Verification

After clearing the database:

1. **Check Admin Dashboard:**
   - Navigate to admin dashboard at `http://localhost:3002/dashboard`
   - Should show "No responses yet" message
   - Admin login should still work

2. **Check Survey Page:**
   - Navigate to `http://localhost:3002/survey`
   - Should display all 81 questions organized by sections
   - Questions should match the applicant questionnaire exactly

3. **Submit New Response:**
   - Go to applicant app at `http://localhost:3000`
   - Complete and submit questionnaire
   - Verify it appears in admin dashboard

## Notes

- The survey page now has a **single source of truth**: [apps/applicant/src/data/questions.ts](apps/applicant/src/data/questions.ts)
- Any changes to questions should be made in `questions.ts` only
- The survey page will automatically reflect those changes
- The database clearing script is safe for development but should be used cautiously in production

## Future Considerations

If you need to make the survey page editable (allowing admins to modify questions through the UI), you would need to:
1. Store questions in the database instead of code
2. Create an admin interface for CRUD operations on questions
3. Have the applicant questionnaire read from the database

Currently, questions are defined in code for simplicity and version control.
