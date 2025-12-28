-- Migration: Create applicant_profiles table
-- Stores profile data for applicant users
--
-- Note: This is a placeholder migration.
-- Add fields based on your business requirements.

CREATE TABLE IF NOT EXISTS public.applicant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Add applicant-specific fields here:
    -- first_name TEXT,
    -- last_name TEXT,
    -- date_of_birth DATE,
    -- address TEXT,
    -- phone TEXT,
    -- ssn_last_four TEXT,
    -- employment_status TEXT,
    -- annual_income DECIMAL(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Applicants can read their own profile
CREATE POLICY "Applicants can read own profile" ON public.applicant_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Applicants can update their own profile
CREATE POLICY "Applicants can update own profile" ON public.applicant_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Applicants can insert their own profile
CREATE POLICY "Applicants can insert own profile" ON public.applicant_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Institutions can read applicant profiles
CREATE POLICY "Institutions can read applicant profiles" ON public.applicant_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'institution'
        )
    );

-- Policy: Admins can read all applicant profiles
CREATE POLICY "Admins can read all applicant profiles" ON public.applicant_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger: Update updated_at on row update
CREATE TRIGGER applicant_profiles_updated_at
    BEFORE UPDATE ON public.applicant_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
