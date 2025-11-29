-- =====================================================
-- URGENT SUPABASE FIXES V2 - Run this in Supabase SQL Editor
-- =====================================================
-- This file fixes TWO critical issues:
-- 1. Project creation trigger conflict
-- 2. Blog analytics users.role column missing
-- =====================================================

-- ========================================
-- FIX 1: Project Version Trigger Conflict
-- ========================================

-- Drop both possible trigger names to ensure clean slate
DROP TRIGGER IF EXISTS trigger_save_project_version ON projects;
DROP TRIGGER IF EXISTS save_project_version_trigger ON projects;

-- Create the corrected trigger
-- Only fires on UPDATE (not INSERT) to avoid NULL code issues
-- Only saves when code actually changes and is not NULL
CREATE TRIGGER save_project_version_trigger
  AFTER UPDATE OF generated_code ON projects
  FOR EACH ROW
  WHEN (NEW.generated_code IS NOT NULL AND NEW.generated_code IS DISTINCT FROM OLD.generated_code)
  EXECUTE FUNCTION save_project_version();


-- ========================================
-- FIX 2: Add users.role Column
-- ========================================

-- Step 1: Add role column to users table FIRST
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Step 2: Create index on role column for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);


-- ========================================
-- FIX 3: Fix RLS Policies (Only if tables exist)
-- ========================================

-- Check if blog tables exist before trying to fix their policies
DO $$
BEGIN
    -- Fix blog_post_analytics policies if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'blog_post_analytics') THEN
        DROP POLICY IF EXISTS "Admins manage blog analytics" ON blog_post_analytics;

        CREATE POLICY "Admins manage blog analytics"
          ON blog_post_analytics FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id = auth.uid()
              AND users.role = 'admin'
            )
          );
    END IF;

    -- Fix blog_template_sections policies if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'blog_template_sections') THEN
        DROP POLICY IF EXISTS "Admins manage template sections" ON blog_template_sections;

        CREATE POLICY "Admins manage template sections"
          ON blog_template_sections FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id = auth.uid()
              AND users.role = 'admin'
            )
          );
    END IF;

    -- Fix blog_seo_metadata policies if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'blog_seo_metadata') THEN
        DROP POLICY IF EXISTS "Admins manage SEO metadata" ON blog_seo_metadata;

        CREATE POLICY "Admins manage SEO metadata"
          ON blog_seo_metadata FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id = auth.uid()
              AND users.role = 'admin'
            )
          );
    END IF;
END
$$;


-- ========================================
-- OPTIONAL: Set Your Admin User
-- ========================================
-- Uncomment and replace with your actual admin email:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';


-- ========================================
-- Verification Queries
-- ========================================

-- Check users table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check triggers on projects table
SELECT tgname, tgenabled, tgtype
FROM pg_trigger
WHERE tgrelid = 'projects'::regclass;

-- Verify role column exists
SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'role'
    )
    THEN '✅ users.role column exists'
    ELSE '❌ users.role column NOT found'
  END as role_status;


-- ========================================
-- SUCCESS!
-- ========================================
-- After running this:
-- ✅ Project creation should work
-- ✅ Blog analytics policies should work (if tables exist)
-- ✅ Template gallery should work
-- ========================================
