-- ============================================
-- APPLY ALL MIGRATIONS + CREATE TEST USERS
-- Run this in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/sql/new
-- ============================================

-- ============================================
-- STEP 1: FIX EXISTING POLICIES (If needed)
-- ============================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own generated code" ON generated_code;
DROP POLICY IF EXISTS "Users can insert their own generated code" ON generated_code;
DROP POLICY IF EXISTS "Users can update their own generated code" ON generated_code;
DROP POLICY IF EXISTS "Users can delete their own generated code" ON generated_code;

-- Recreate policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_code') THEN
    CREATE POLICY "Users can view their own generated code"
      ON generated_code FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own generated code"
      ON generated_code FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own generated code"
      ON generated_code FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own generated code"
      ON generated_code FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- STEP 2: CREATE TEST USERS
-- ============================================

-- Note: User creation via SQL is done through Supabase Auth API
-- For now, we'll prepare the users table entries
-- You'll need to create the auth users via Supabase Dashboard:
-- Auth → Users → Add User

-- Create test user metadata (after auth users exist)
-- Run this AFTER creating auth users in Supabase Dashboard:

-- INSERT INTO users (id, email, name, plan, payment_provider, preferred_currency, detected_country)
-- VALUES
--   ('<test-user-uuid>', 'test@test.com', 'Test User', 'pro', 'tap', 'KWD', 'KW'),
--   ('<test1-user-uuid>', 'test1@test.com', 'Test Admin', 'premium', 'tap', 'KWD', 'KW');

-- Grant test credits to users (run after users created)
-- INSERT INTO user_credits (user_id, total_credits, used_credits)
-- VALUES
--   ('<test-user-uuid>', 10000, 0),
--   ('<test1-user-uuid>', 10000, 0);

-- ============================================
-- INSTRUCTIONS FOR CREATING TEST USERS
-- ============================================

/*
Go to: https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/auth/users

1. Click "Add User" (top right)
2. Create User 1:
   - Email: test@test.com
   - Password: 12345678
   - Auto Confirm User: YES

3. Click "Add User" again
4. Create User 2:
   - Email: test1@test.com
   - Password: 12345678
   - Auto Confirm User: YES
   - (We'll make this admin via SQL)

5. Copy their UUIDs and run the metadata inserts above
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- After creating users, verify they exist:
SELECT id, email, created_at
FROM auth.users
WHERE email IN ('test@test.com', 'test1@test.com');

-- Check users table:
SELECT id, email, plan, payment_provider
FROM users
WHERE email IN ('test@test.com', 'test1@test.com');

-- ============================================
-- READY MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ SQL script ready to apply migrations';
  RAISE NOTICE '📋 Next: Copy migration files one by one from /supabase/migrations/';
  RAISE NOTICE '👤 Then: Create test users via Supabase Dashboard';
END $$;
