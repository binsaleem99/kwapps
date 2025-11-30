-- =====================================================
-- ADD ADMIN FIELDS & CREATE ADMIN USER
-- =====================================================
-- This script:
-- 1. Adds admin fields to users table
-- 2. Creates the admin user in Supabase Auth
-- 3. Marks that user as admin in the users table
-- =====================================================

-- Step 1: Add admin columns to users table (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'admin_role') THEN
        ALTER TABLE users ADD COLUMN admin_role TEXT CHECK (admin_role IN ('super_admin', 'moderator', 'support'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Step 2: Update RLS policies to allow admins to read all data
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Step 3: Admin can read all projects
CREATE POLICY "Admins can read all projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- MANUAL STEP: Create Admin User in Supabase Dashboard
-- =====================================================
-- You need to manually create the user first through Supabase Auth:
--
-- Option 1: Via Supabase Dashboard
-- 1. Go to: https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/auth/users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter:
--    - Email: admin@kwq8.com (or your email)
--    - Password: [Choose a strong password]
--    - Auto Confirm Email: YES (check this box)
-- 4. Click "Create user"
-- 5. Copy the User UID that appears
--
-- Option 2: Via Sign-Up on Website
-- 1. Go to: https://kwq8.com/sign-up
-- 2. Sign up with your email
-- 3. Confirm your email
-- 4. Then run the SQL below to make yourself admin
--
-- =====================================================
-- Step 4: Make User Admin (REPLACE THE EMAIL)
-- =====================================================
-- After creating the user above, run this to make them admin:

-- REPLACE 'admin@kwq8.com' with the email you used:
UPDATE users
SET
  is_admin = true,
  admin_role = 'super_admin',
  plan = 'pro',
  onboarding_completed = true
WHERE email = 'admin@kwq8.com';  -- ⬅️ CHANGE THIS EMAIL

-- =====================================================
-- Step 5: Verify Admin User
-- =====================================================
SELECT
  id,
  email,
  display_name,
  is_admin,
  admin_role,
  plan,
  created_at
FROM users
WHERE is_admin = true;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- You should now be able to:
-- ✅ Sign in with the admin email at https://kwq8.com/sign-in
-- ✅ Access /admin routes
-- ✅ See all users and projects in admin dashboard
-- =====================================================
