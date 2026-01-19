-- Migration: Add institution_id support for admin users
-- This allows admin users to be linked to institutions

-- Add email and status columns to institutions table if they don't exist
ALTER TABLE public.institutions
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'active';

-- Create or replace function to sync admin user to institution
CREATE OR REPLACE FUNCTION sync_admin_to_institution()
RETURNS TRIGGER AS $$
DECLARE
    new_institution_id UUID;
BEGIN
    -- Only process if role is 'admin' and company_name exists
    IF (NEW.raw_user_meta_data->>'role' = 'admin') AND (NEW.raw_user_meta_data->>'company_name' IS NOT NULL) THEN
        -- Check if institution already exists for this user
        SELECT id INTO new_institution_id
        FROM public.institutions
        WHERE id = NEW.id;

        -- If not exists, create it
        IF new_institution_id IS NULL THEN
            INSERT INTO public.institutions (id, name, email, status, created_at, updated_at)
            VALUES (
                NEW.id,
                NEW.raw_user_meta_data->>'company_name',
                NEW.email,
                'active',
                NOW(),
                NOW()
            )
            RETURNING id INTO new_institution_id;

            -- Also add to institution_users junction table
            INSERT INTO public.institution_users (institution_id, user_id, role)
            VALUES (new_institution_id, NEW.id, 'owner');
        END IF;

        -- Update user metadata to include institution_id
        NEW.raw_user_meta_data = jsonb_set(
            COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
            '{institution_id}',
            to_jsonb(new_institution_id::text)
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created_sync_institution ON auth.users;
CREATE TRIGGER on_auth_user_created_sync_institution
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_admin_to_institution();

-- Create trigger for user updates (in case metadata changes)
DROP TRIGGER IF EXISTS on_auth_user_updated_sync_institution ON auth.users;
CREATE TRIGGER on_auth_user_updated_sync_institution
    BEFORE UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION sync_admin_to_institution();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.institutions TO authenticated;
GRANT SELECT, INSERT ON public.institution_users TO authenticated;
