-- =====================================================
-- MAKE admin@kwq8.com AN ADMIN - FINAL CORRECT VERSION
-- =====================================================
-- IMPORTANT: Use 'owner' NOT 'super_admin'
-- The admin_role enum only allows: 'owner', 'support', 'content', 'readonly'
-- =====================================================

-- Update the user to be an admin with 'owner' role
UPDATE users
SET
  is_admin = true,
  admin_role = 'owner',  -- ← MUST BE 'owner' not 'super_admin'
  plan = 'pro',
  onboarding_completed = true
WHERE email = 'admin@kwq8.com';

-- Verify it worked (should show admin_role = owner)
SELECT
  email,
  is_admin,
  admin_role::text as admin_role,
  plan,
  onboarding_completed
FROM users
WHERE email = 'admin@kwq8.com';

-- Expected output:
-- email: admin@kwq8.com
-- is_admin: true
-- admin_role: owner
-- plan: pro
-- onboarding_completed: true
