-- ============================================
-- Fix: user_credit_summary SECURITY DEFINER Issue
-- Date: 2025-12-05
-- ============================================
-- This migration fixes the SECURITY DEFINER property on the view
-- by recreating it with explicit SECURITY INVOKER
-- ============================================

-- Step 1: Drop the existing view completely
DROP VIEW IF EXISTS public.user_credit_summary CASCADE;

-- Step 2: Recreate view with SECURITY INVOKER (explicit)
-- Using the correct schema from user_subscriptions + subscription_tiers
CREATE VIEW public.user_credit_summary
WITH (security_invoker = true)
AS
SELECT
  us.user_id,
  us.id AS subscription_id,
  st.name AS tier_name,
  st.display_name_ar AS tier_display_name_ar,
  us.status,
  us.is_trial,
  us.credits_balance,
  us.credits_allocated_this_period,
  us.credits_bonus_earned,
  us.credits_rollover,
  st.daily_bonus_credits,
  us.current_period_start,
  us.current_period_end,
  CASE
    WHEN us.status = 'active' AND us.current_period_end > NOW() THEN true
    ELSE false
  END AS is_active_subscription
FROM user_subscriptions us
JOIN subscription_tiers st ON us.tier_id = st.id;

-- Step 3: Add comment documenting the security model
COMMENT ON VIEW public.user_credit_summary IS
  'User credit summary view. Uses SECURITY INVOKER to respect RLS policies on underlying tables.';

-- Step 4: Grant access to authenticated users
-- RLS on user_subscriptions will ensure users only see their own data
GRANT SELECT ON public.user_credit_summary TO authenticated;

-- Step 5: Ensure RLS is enabled on underlying table
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policy if not exists (users can only see their own subscriptions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_subscriptions'
    AND policyname = 'Users can view own subscription'
  ) THEN
    CREATE POLICY "Users can view own subscription"
      ON user_subscriptions
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================
-- Verification Query (run manually to confirm fix)
-- ============================================
-- SELECT
--   c.relname as view_name,
--   c.relrowsecurity as rls_enabled,
--   pg_get_viewdef(c.oid, true) as view_definition
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE c.relname = 'user_credit_summary'
-- AND n.nspname = 'public';
-- ============================================
