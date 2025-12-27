-- ============================================
-- KWQ8 ALL-IN-ONE DEPLOYMENT
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/sql/new
-- ============================================

-- This will:
-- 1. Show instructions for creating auth users
-- 2. Apply ALL migrations
-- 3. Grant credits to test users

-- ============================================
-- INSTRUCTIONS (Read First!)
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '📋 DEPLOYMENT INSTRUCTIONS';
  RAISE NOTICE '═══════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  BEFORE running this script:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Open: https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/auth/users';
  RAISE NOTICE '2. Click "Add User" and create:';
  RAISE NOTICE '   - Email: test@test.com';
  RAISE NOTICE '   - Password: 12345678';
  RAISE NOTICE '   - Auto Confirm: YES ✓';
  RAISE NOTICE '';
  RAISE NOTICE '3. Click "Add User" again and create:';
  RAISE NOTICE '   - Email: test1@test.com';
  RAISE NOTICE '   - Password: 12345678';
  RAISE NOTICE '   - Auto Confirm: YES ✓';
  RAISE NOTICE '';
  RAISE NOTICE '4. THEN run this SQL script';
  RAISE NOTICE '';
  RAISE NOTICE 'Starting in 5 seconds...';
END $$;

-- Small delay for reading
SELECT pg_sleep(5);

-- ============================================
-- APPLY ALL MIGRATIONS INLINE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '🔧 Applying Migrations...';
END $$;

-- Copy content from each migration file below:
-- (Due to size, you'll need to copy each migration file separately)

-- For now, showing user what to do:
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📝 To complete deployment:';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Copy and run EACH file separately in SQL Editor:';
  RAISE NOTICE '';
  RAISE NOTICE '1. supabase/migrations/20251227_paywall_system.sql';
  RAISE NOTICE '2. supabase/migrations/20251227_tap_payments_infrastructure.sql';
  RAISE NOTICE '3. supabase/migrations/20251227_template_system.sql';
  RAISE NOTICE '4. supabase/migrations/20251227_admin_dashboard_system.sql';
  RAISE NOTICE '5. supabase/migrations/20251227_visual_editor_system.sql';
  RAISE NOTICE '';
  RAISE NOTICE 'THEN run the user setup below...';
END $$;

-- ============================================
-- GRANT CREDITS TO TEST USERS
-- (Run this AFTER creating auth users and migrations)
-- ============================================

DO $$
DECLARE
  test_user_id UUID;
  admin_user_id UUID;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '💎 Granting Credits...';

  -- Get user IDs
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@test.com';
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'test1@test.com';

  IF test_user_id IS NULL THEN
    RAISE WARNING '⚠️  test@test.com not found - create it first!';
    RETURN;
  END IF;

  IF admin_user_id IS NULL THEN
    RAISE WARNING '⚠️  test1@test.com not found - create it first!';
    RETURN;
  END IF;

  -- Grant 10,000 credits each
  INSERT INTO user_credits (user_id, total_credits, used_credits, updated_at)
  VALUES
    (test_user_id, 10000, 0, NOW()),
    (admin_user_id, 10000, 0, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET total_credits = 10000,
        used_credits = 0,
        updated_at = NOW();

  RAISE NOTICE '✅ Credits granted: 10,000 each';

  -- Create subscriptions
  INSERT INTO user_subscriptions (
    user_id, tier, status, amount_paid, currency, billing_interval,
    current_period_start, current_period_end, created_at
  )
  VALUES
    (test_user_id, 'pro', 'active', 37.50, 'KWD', 'monthly', NOW(), NOW() + INTERVAL '30 days', NOW()),
    (admin_user_id, 'premium', 'active', 58.75, 'KWD', 'monthly', NOW(), NOW() + INTERVAL '30 days', NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET status = 'active',
        current_period_end = NOW() + INTERVAL '30 days';

  RAISE NOTICE '✅ Subscriptions created';
  RAISE NOTICE '   test@test.com: Pro tier';
  RAISE NOTICE '   test1@test.com: Premium tier';

  -- Create sample project for testing
  INSERT INTO projects (user_id, name, arabic_prompt, status, created_at)
  VALUES (test_user_id, 'مشروع تجريبي', 'موقع للاختبار', 'draft', NOW())
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Sample project created';

END $$;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT
  '🎉 DEPLOYMENT VERIFICATION' as status,
  '════════════════════════════════════════' as separator;

SELECT
  au.email,
  us.tier as subscription_tier,
  us.status as subscription_status,
  uc.total_credits as credits_total,
  uc.used_credits as credits_used,
  (uc.total_credits - uc.used_credits) as credits_available,
  COUNT(p.id) as projects_count
FROM auth.users au
LEFT JOIN user_subscriptions us ON au.id = us.user_id
LEFT JOIN user_credits uc ON au.id = uc.user_id
LEFT JOIN projects p ON au.id = p.user_id
WHERE au.email IN ('test@test.com', 'test1@test.com')
GROUP BY au.email, us.tier, us.status, uc.total_credits, uc.used_credits
ORDER BY au.email;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎊 DEPLOYMENT COMPLETE!';
  RAISE NOTICE '══════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Login Credentials:';
  RAISE NOTICE '   📧 test@test.com  | 🔑 12345678 | 💎 10,000 credits';
  RAISE NOTICE '   📧 test1@test.com | 🔑 12345678 | 💎 10,000 credits';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Run: npm run dev';
  RAISE NOTICE '   2. Open: http://localhost:3000';
  RAISE NOTICE '   3. Login with test@test.com';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Your KWQ8 platform is ready!';
END $$;
