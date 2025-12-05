-- Fix User Registration - Add missing columns and RLS INSERT policy
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO USERS TABLE
-- ============================================================================

-- Add onboarding_completed column (referenced in auth callback)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add is_admin column (referenced in auth callback for redirect)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add admin_role column (for admin system)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE admin_role AS ENUM ('owner', 'support', 'content', 'readonly');
  END IF;
END $$;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS admin_role admin_role;

-- Add other useful columns from migration 001
ALTER TABLE users
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- ============================================================================
-- 2. ADD INSERT POLICY FOR USERS TABLE (CRITICAL FIX)
-- ============================================================================

-- Drop existing insert policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- Allow authenticated users to insert their own record
-- This is needed for the auth callback to work
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 3. UPDATE THE TRIGGER FUNCTION TO HANDLE ALL FIELDS
-- ============================================================================

-- Create or replace the trigger function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    avatar_url,
    plan,
    onboarding_completed,
    is_admin,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    false,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, users.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on users table
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- ============================================================================
-- 5. VERIFY RLS IS ENABLED
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION QUERY (Run after migration to verify)
-- ============================================================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;
