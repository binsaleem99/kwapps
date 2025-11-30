-- =====================================================
-- MAKE admin@kwq8.com AN ADMIN - RUN THIS NOW
-- =====================================================

-- Step 1: Add admin columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Step 2: Make admin@kwq8.com an admin
UPDATE users
SET
  is_admin = true,
  admin_role = 'super_admin',
  plan = 'pro',
  onboarding_completed = true
WHERE email = 'admin@kwq8.com';

-- Step 3: Create subscription if needed
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'pro', 'active'
FROM users
WHERE email = 'admin@kwq8.com'
ON CONFLICT (user_id) DO UPDATE
SET plan = 'pro', status = 'active';

-- Step 4: Verify - should show is_admin = true
SELECT
  id,
  email,
  display_name,
  is_admin,
  admin_role,
  plan,
  created_at
FROM users
WHERE email = 'admin@kwq8.com';
