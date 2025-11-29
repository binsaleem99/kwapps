-- Fix users.role column issue
-- Migration 007: Add role column to users table and fix RLS policies

-- Step 1: Add role column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Step 2: Set your admin email (replace with actual admin email)
-- Update this to set the first user or specific email as admin
-- For now, we'll just add the column and you can manually set admins later

-- Step 3: Drop the broken RLS policies from migration 004
DROP POLICY IF EXISTS "Admins manage blog analytics" ON blog_post_analytics;
DROP POLICY IF EXISTS "Admins manage template sections" ON blog_template_sections;
DROP POLICY IF EXISTS "Admins manage SEO metadata" ON blog_seo_metadata;

-- Step 4: Recreate the policies with the new role column
CREATE POLICY "Admins manage blog analytics"
  ON blog_post_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins manage template sections"
  ON blog_template_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins manage SEO metadata"
  ON blog_seo_metadata FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Step 5: Create index on role column for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Optional: Set first user as admin (uncomment and modify if needed)
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
