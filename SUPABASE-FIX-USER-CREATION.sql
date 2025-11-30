-- =====================================================
-- FIX USER CREATION - Add Missing INSERT Policy
-- =====================================================
-- PROBLEM: Users table has RLS enabled but NO INSERT policy
-- SOLUTION: Add policy to allow user creation after Supabase Auth signup
-- =====================================================

-- Step 1: Add INSERT policy for users table
-- This allows authenticated users to create their own user record
DROP POLICY IF EXISTS "Users can create own record" ON users;

CREATE POLICY "Users can create own record"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 2: ALTERNATIVE - Allow service role to bypass (if using service key)
-- If you're using service role key for user creation, you can skip the policy above
-- and just use the service role key which bypasses RLS automatically.

-- Step 3: Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- List all policies on users table
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- =====================================================
-- SUCCESS!
-- =====================================================
-- After running this:
-- ✅ Users can create accounts via sign-up
-- ✅ OAuth sign-in will work
-- ✅ Auth callback can insert user records
-- =====================================================
