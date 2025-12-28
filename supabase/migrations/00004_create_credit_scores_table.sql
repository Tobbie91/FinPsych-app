-- Migration: Create credit_scores table
-- Stores credit score records for applicants
--
-- Note: This is a placeholder migration.
-- Add fields based on your business requirements.

CREATE TABLE IF NOT EXISTS public.credit_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.applicant_profiles(id) ON DELETE CASCADE,
    -- Add credit score fields here:
    -- score INTEGER CHECK (score >= 300 AND score <= 850),
    -- score_type TEXT CHECK (score_type IN ('fico', 'vantage', 'internal')),
    -- source TEXT,
    -- factors JSONB,
    -- report_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Applicants can read their own credit scores
CREATE POLICY "Applicants can read own credit scores" ON public.credit_scores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applicant_profiles
            WHERE id = applicant_id AND user_id = auth.uid()
        )
    );

-- Policy: Institutions can read credit scores
CREATE POLICY "Institutions can read credit scores" ON public.credit_scores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'institution'
        )
    );

-- Policy: Admins can read all credit scores
CREATE POLICY "Admins can read all credit scores" ON public.credit_scores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can insert credit scores
CREATE POLICY "Admins can insert credit scores" ON public.credit_scores
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger: Update updated_at on row update
CREATE TRIGGER credit_scores_updated_at
    BEFORE UPDATE ON public.credit_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index for faster lookups by applicant
CREATE INDEX idx_credit_scores_applicant_id ON public.credit_scores(applicant_id);
