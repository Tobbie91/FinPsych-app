-- Migration: Create institutions table
-- Stores data for financial institutions
--
-- Note: This is a placeholder migration.
-- Add fields based on your business requirements.

CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    -- Add institution-specific fields here:
    -- legal_name TEXT,
    -- ein TEXT,
    -- address TEXT,
    -- phone TEXT,
    -- website TEXT,
    -- license_number TEXT,
    -- status TEXT CHECK (status IN ('pending', 'active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table for institution users
CREATE TABLE IF NOT EXISTS public.institution_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(institution_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_users ENABLE ROW LEVEL SECURITY;

-- Policy: Institution members can read their institution
CREATE POLICY "Institution members can read their institution" ON public.institutions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.institution_users
            WHERE institution_id = id AND user_id = auth.uid()
        )
    );

-- Policy: Institution admins can update their institution
CREATE POLICY "Institution admins can update their institution" ON public.institutions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.institution_users
            WHERE institution_id = id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Admins can read all institutions
CREATE POLICY "Admins can read all institutions" ON public.institutions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Users can read their institution memberships
CREATE POLICY "Users can read their institution memberships" ON public.institution_users
    FOR SELECT
    USING (user_id = auth.uid());

-- Trigger: Update updated_at on row update
CREATE TRIGGER institutions_updated_at
    BEFORE UPDATE ON public.institutions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
