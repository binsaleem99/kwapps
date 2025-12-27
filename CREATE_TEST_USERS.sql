-- ============================================
-- CREATE TEST USERS FOR KWQ8
-- Run AFTER applying all migrations
-- ============================================

-- ============================================
-- IMPORTANT: Create Auth Users First!
-- ============================================

/*
You MUST create these users via Supabase Dashboard first:

1. Go to: https://supabase.com/dashboard/project/iqwfyrijmsoddpoacinw/auth/users
2. Click "Add User"
3. Create:
   - Email: test@test.com
   - Password: 12345678
   - Auto Confirm: YES
4. Click "Add User" again
5. Create:
   - Email: test1@test.com
   - Password: 12345678
   - Auto Confirm: YES

6. COPY both UUIDs and replace below!
*/

-- ============================================
-- AFTER CREATING AUTH USERS, RUN THIS:
-- ============================================

-- Replace these with actual UUIDs from Supabase Dashboard
DO $$
DECLARE
  test_user_id UUID;
  test_admin_id UUID;
BEGIN
  -- Get user IDs from auth.users
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@test.com';
  SELECT id INTO test_admin_id FROM auth.users WHERE email = 'test1@test.com';

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'test@test.com not found! Create user in Auth dashboard first.';
  END IF;

  IF test_admin_id IS NULL THEN
    RAISE EXCEPTION 'test1@test.com not found! Create user in Auth dashboard first.';
  END IF;

  -- ============================================
  -- 1. UPDATE/INSERT USERS TABLE
  -- ============================================

  INSERT INTO users (id, email, name, plan, payment_provider, preferred_currency, detected_country, created_at)
  VALUES
    (test_user_id, 'test@test.com', 'Test User', 'pro', 'tap', 'KWD', 'KW', NOW()),
    (test_admin_id, 'test1@test.com', 'Test Admin', 'premium', 'tap', 'KWD', 'KW', NOW())
  ON CONFLICT (id) DO UPDATE
    SET plan = EXCLUDED.plan,
        payment_provider = EXCLUDED.payment_provider,
        preferred_currency = EXCLUDED.preferred_currency;

  -- ============================================
  -- 2. GRANT CREDITS (10,000 each)
  -- ============================================

  INSERT INTO user_credits (user_id, total_credits, used_credits, updated_at)
  VALUES
    (test_user_id, 10000, 0, NOW()),
    (test_admin_id, 10000, 0, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET total_credits = 10000,
        used_credits = 0,
        updated_at = NOW();

  -- ============================================
  -- 3. CREATE TEST SUBSCRIPTIONS
  -- ============================================

  -- Pro subscription for test@test.com
  INSERT INTO user_subscriptions (
    user_id,
    tier,
    status,
    amount_paid,
    currency,
    billing_interval,
    current_period_start,
    current_period_end,
    created_at
  )
  VALUES
    (
      test_user_id,
      'pro',
      'active',
      37.50,
      'KWD',
      'monthly',
      NOW(),
      NOW() + INTERVAL '30 days',
      NOW()
    )
  ON CONFLICT (user_id) DO UPDATE
    SET status = 'active',
        current_period_end = NOW() + INTERVAL '30 days';

  -- Premium subscription for test1@test.com (admin)
  INSERT INTO user_subscriptions (
    user_id,
    tier,
    status,
    amount_paid,
    currency,
    billing_interval,
    current_period_start,
    current_period_end,
    created_at
  )
  VALUES
    (
      test_admin_id,
      'premium',
      'active',
      58.75,
      'KWD',
      'monthly',
      NOW(),
      NOW() + INTERVAL '30 days',
      NOW()
    )
  ON CONFLICT (user_id) DO UPDATE
    SET status = 'active',
        current_period_end = NOW() + INTERVAL '30 days';

  -- ============================================
  -- 4. CREATE SAMPLE PROJECT FOR TESTING
  -- ============================================

  INSERT INTO projects (
    user_id,
    name,
    arabic_prompt,
    status,
    created_at
  )
  VALUES
    (
      test_user_id,
      'موقع تجريبي',
      'موقع لاختبار المنصة',
      'draft',
      NOW()
    );

  -- ============================================
  -- SUCCESS MESSAGE
  -- ============================================

  RAISE NOTICE '✅ Test users created successfully!';
  RAISE NOTICE '👤 User 1: test@test.com (Pro tier, 10,000 credits)';
  RAISE NOTICE '👤 User 2: test1@test.com (Premium tier, 10,000 credits)';
  RAISE NOTICE '🔑 Password for both: 12345678';
  RAISE NOTICE '🎉 Ready to test!';

END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check everything
SELECT
  u.email,
  u.plan as tier,
  us.status as subscription_status,
  uc.total_credits,
  uc.used_credits,
  (uc.total_credits - uc.used_credits) as available_credits,
  COUNT(p.id) as project_count
FROM auth.users u
LEFT JOIN users u2 ON u.id = u2.id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LEFT JOIN user_credits uc ON u.id = uc.user_id
LEFT JOIN projects p ON u.id = p.user_id
WHERE u.email IN ('test@test.com', 'test1@test.com')
GROUP BY u.email, u2.plan, us.status, uc.total_credits, uc.used_credits;

-- ============================================
-- EXPECTED OUTPUT
-- ============================================

/*
email            | tier    | subscription_status | total_credits | used_credits | available_credits | project_count
-----------------|---------|---------------------|---------------|--------------|-------------------|---------------
test@test.com    | pro     | active              | 10000         | 0            | 10000             | 1
test1@test.com   | premium | active              | 10000         | 0            | 10000             | 0
*/
