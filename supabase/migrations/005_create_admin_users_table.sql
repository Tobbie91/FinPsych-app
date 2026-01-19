-- Migration: Create admin_users table for managing admin team members
-- This table stores users who have been given access to the admin panel

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    roles TEXT[] DEFAULT '{}', -- Array of roles: 'Responses', 'Survey', 'Companies', 'Users'
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all admin users
CREATE POLICY "Admins can read all admin users" ON public.admin_users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND (
                user_metadata->>'role' = 'admin'
                OR user_metadata->>'role' = 'institution'
            )
        )
    );

-- Policy: Admins can insert admin users
CREATE POLICY "Admins can insert admin users" ON public.admin_users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND (
                user_metadata->>'role' = 'admin'
                OR user_metadata->>'role' = 'institution'
            )
        )
    );

-- Policy: Admins can update admin users
CREATE POLICY "Admins can update admin users" ON public.admin_users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND (
                user_metadata->>'role' = 'admin'
                OR user_metadata->>'role' = 'institution'
            )
        )
    );

-- Policy: Admins can delete admin users
CREATE POLICY "Admins can delete admin users" ON public.admin_users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND (
                user_metadata->>'role' = 'admin'
                OR user_metadata->>'role' = 'institution'
            )
        )
    );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_institution_id ON public.admin_users(institution_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON public.admin_users(status);

-- Trigger: Update updated_at on row update
CREATE TRIGGER admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
