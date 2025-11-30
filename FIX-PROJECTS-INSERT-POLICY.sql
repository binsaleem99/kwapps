-- =====================================================
-- FIX: Projects Table INSERT Policy
-- =====================================================
-- Issue: Users can't create projects in /builder
-- Solution: Add proper INSERT policy with WITH CHECK clause
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can CRUD own projects" ON projects;

-- Create separate policies for better control

-- 1. Users can INSERT their own projects
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Users can SELECT their own projects
CREATE POLICY "Users can read own projects" ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Users can UPDATE their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Users can DELETE their own projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;
