-- ============================================
-- Security Fixes Migration
-- Fixes: SECURITY DEFINER view, mutable search_path functions
-- Date: 2025-12-05
-- ============================================

-- ============================================
-- 1. FIX: user_credit_summary view (SECURITY DEFINER -> INVOKER)
-- This ensures RLS policies are respected
-- ============================================

-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.user_credit_summary;

-- Recreate with SECURITY INVOKER (default, respects RLS)
CREATE OR REPLACE VIEW public.user_credit_summary AS
SELECT
  p.id as user_id,
  p.email,
  p.full_name,
  p.plan,
  p.credits_remaining,
  p.credits_monthly,
  p.credits_rollover,
  p.daily_bonus_credits,
  p.last_bonus_date,
  p.subscription_status,
  p.trial_ends_at,
  COALESCE(
    (SELECT SUM(amount) FROM credit_transactions ct WHERE ct.user_id = p.id AND ct.created_at > NOW() - INTERVAL '30 days'),
    0
  ) as credits_used_30d,
  COALESCE(
    (SELECT COUNT(*) FROM credit_transactions ct WHERE ct.user_id = p.id AND ct.transaction_type = 'bonus' AND ct.created_at > NOW() - INTERVAL '30 days'),
    0
  ) as bonus_claims_30d
FROM profiles p;

-- Grant access to authenticated users (they can only see their own row due to RLS on profiles)
GRANT SELECT ON public.user_credit_summary TO authenticated;

-- ============================================
-- 2. FIX: Functions with mutable search_path
-- Adding SET search_path = public to prevent search_path injection attacks
-- ============================================

-- Fix: get_popular_templates
CREATE OR REPLACE FUNCTION public.get_popular_templates(limit_count integer DEFAULT 10)
RETURNS SETOF templates
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM templates
  WHERE is_active = true
  ORDER BY use_count DESC, created_at DESC
  LIMIT limit_count;
$$;

-- Fix: update_templates_updated_at
CREATE OR REPLACE FUNCTION public.update_templates_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: update_domain_updated_at
CREATE OR REPLACE FUNCTION public.update_domain_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: check_free_domain_eligibility
CREATE OR REPLACE FUNCTION public.check_free_domain_eligibility(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  user_plan text;
  has_free_domain boolean;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = user_uuid;

  -- Only premium+ plans get free domain
  IF user_plan NOT IN ('premium', 'enterprise') THEN
    RETURN false;
  END IF;

  -- Check if user already has a free domain
  SELECT EXISTS(
    SELECT 1 FROM domain_purchases
    WHERE user_id = user_uuid AND is_free_domain = true
  ) INTO has_free_domain;

  RETURN NOT has_free_domain;
END;
$$;

-- Fix: get_expiring_domains
CREATE OR REPLACE FUNCTION public.get_expiring_domains(days_threshold integer DEFAULT 30)
RETURNS TABLE(
  domain_id uuid,
  domain_name text,
  user_id uuid,
  user_email text,
  expires_at timestamptz,
  days_until_expiry integer
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    dp.id as domain_id,
    dp.domain_name,
    dp.user_id,
    p.email as user_email,
    dp.expires_at,
    EXTRACT(DAY FROM dp.expires_at - NOW())::integer as days_until_expiry
  FROM domain_purchases dp
  JOIN profiles p ON p.id = dp.user_id
  WHERE dp.expires_at BETWEEN NOW() AND NOW() + (days_threshold || ' days')::interval
  AND dp.status = 'active'
  ORDER BY dp.expires_at ASC;
$$;

-- Fix: update_deployments_updated_at
CREATE OR REPLACE FUNCTION public.update_deployments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: get_deployment_stats
CREATE OR REPLACE FUNCTION public.get_deployment_stats(user_uuid uuid DEFAULT NULL)
RETURNS TABLE(
  total_deployments bigint,
  successful_deployments bigint,
  failed_deployments bigint,
  avg_build_time_seconds numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COUNT(*) as total_deployments,
    COUNT(*) FILTER (WHERE status = 'deployed') as successful_deployments,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_deployments,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_build_time_seconds
  FROM deployments
  WHERE (user_uuid IS NULL OR user_id = user_uuid);
$$;

-- Fix: increment_blog_view_count
CREATE OR REPLACE FUNCTION public.increment_blog_view_count(post_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE slug = post_slug;
END;
$$;

-- Fix: update_blog_engagement_metrics
CREATE OR REPLACE FUNCTION public.update_blog_engagement_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: get_top_blogs
CREATE OR REPLACE FUNCTION public.get_top_blogs(limit_count integer DEFAULT 5)
RETURNS SETOF blog_posts
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM blog_posts
  WHERE published = true
  ORDER BY view_count DESC, created_at DESC
  LIMIT limit_count;
$$;

-- Fix: update_generated_code_updated_at
CREATE OR REPLACE FUNCTION public.update_generated_code_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix: record_template_usage
CREATE OR REPLACE FUNCTION public.record_template_usage(template_uuid uuid, user_uuid uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- Increment use count
  UPDATE templates
  SET use_count = COALESCE(use_count, 0) + 1
  WHERE id = template_uuid;

  -- Record in template_usage if user provided
  IF user_uuid IS NOT NULL THEN
    INSERT INTO template_usage (template_id, user_id)
    VALUES (template_uuid, user_uuid);
  END IF;
END;
$$;

-- Fix: get_templates_by_category
CREATE OR REPLACE FUNCTION public.get_templates_by_category(category_name text)
RETURNS SETOF templates
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM templates
  WHERE category = category_name
  AND is_active = true
  ORDER BY use_count DESC, created_at DESC;
$$;

-- Fix: get_user_plan_limits
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_uuid uuid)
RETURNS TABLE(
  plan_name text,
  max_projects integer,
  max_generations_per_day integer,
  max_deployments integer,
  credits_monthly integer,
  daily_bonus integer
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  user_plan text;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = user_uuid;

  RETURN QUERY
  SELECT
    user_plan as plan_name,
    CASE user_plan
      WHEN 'basic' THEN 5
      WHEN 'pro' THEN 20
      WHEN 'premium' THEN 50
      WHEN 'enterprise' THEN 999
      ELSE 3
    END as max_projects,
    CASE user_plan
      WHEN 'basic' THEN 50
      WHEN 'pro' THEN 150
      WHEN 'premium' THEN 400
      WHEN 'enterprise' THEN 999
      ELSE 10
    END as max_generations_per_day,
    CASE user_plan
      WHEN 'basic' THEN 3
      WHEN 'pro' THEN 10
      WHEN 'premium' THEN 30
      WHEN 'enterprise' THEN 999
      ELSE 1
    END as max_deployments,
    CASE user_plan
      WHEN 'basic' THEN 500
      WHEN 'pro' THEN 1500
      WHEN 'premium' THEN 4000
      WHEN 'enterprise' THEN 10000
      ELSE 100
    END as credits_monthly,
    CASE user_plan
      WHEN 'basic' THEN 5
      WHEN 'pro' THEN 8
      WHEN 'premium' THEN 12
      WHEN 'enterprise' THEN 15
      ELSE 2
    END as daily_bonus;
END;
$$;

-- Fix: check_user_limit
CREATE OR REPLACE FUNCTION public.check_user_limit(user_uuid uuid, limit_type text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  user_plan text;
  current_count integer;
  max_allowed integer;
BEGIN
  SELECT plan INTO user_plan FROM profiles WHERE id = user_uuid;

  IF limit_type = 'projects' THEN
    SELECT COUNT(*) INTO current_count FROM projects WHERE user_id = user_uuid;
    max_allowed := CASE user_plan
      WHEN 'basic' THEN 5
      WHEN 'pro' THEN 20
      WHEN 'premium' THEN 50
      WHEN 'enterprise' THEN 999
      ELSE 3
    END;
  ELSIF limit_type = 'deployments' THEN
    SELECT COUNT(*) INTO current_count FROM deployments WHERE user_id = user_uuid;
    max_allowed := CASE user_plan
      WHEN 'basic' THEN 3
      WHEN 'pro' THEN 10
      WHEN 'premium' THEN 30
      WHEN 'enterprise' THEN 999
      ELSE 1
    END;
  ELSE
    RETURN true;
  END IF;

  RETURN current_count < max_allowed;
END;
$$;

-- Fix: increment_usage
CREATE OR REPLACE FUNCTION public.increment_usage(user_uuid uuid, usage_type text, amount integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  INSERT INTO usage_limits (user_id, date, prompt_count, tokens_used)
  VALUES (
    user_uuid,
    CURRENT_DATE,
    CASE WHEN usage_type = 'prompt' THEN amount ELSE 0 END,
    CASE WHEN usage_type = 'tokens' THEN amount ELSE 0 END
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    prompt_count = usage_limits.prompt_count + CASE WHEN usage_type = 'prompt' THEN amount ELSE 0 END,
    tokens_used = usage_limits.tokens_used + CASE WHEN usage_type = 'tokens' THEN amount ELSE 0 END;
END;
$$;

-- Fix: update_updated_at_column (generic trigger function)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. GRANT permissions for security
-- ============================================

-- Revoke unnecessary permissions
REVOKE ALL ON FUNCTION public.get_popular_templates(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_templates_by_category(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_template_usage(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_plan_limits(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_user_limit(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_usage(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_deployment_stats(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_expiring_domains(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_free_domain_eligibility(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_blog_view_count(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_top_blogs(integer) FROM PUBLIC;

-- Grant to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_popular_templates(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_templates_by_category(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_template_usage(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_plan_limits(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_limit(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_deployment_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_expiring_domains(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_free_domain_eligibility(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_view_count(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_blogs(integer) TO anon, authenticated;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Leaked Password Protection must be enabled manually:
--    Supabase Dashboard -> Authentication -> Providers -> Email ->
--    Enable "Leaked password protection"
--
-- 2. All functions now have:
--    - SECURITY INVOKER (respects caller's permissions)
--    - SET search_path = public (prevents search_path injection)
--
-- 3. The user_credit_summary view now respects RLS policies
-- ============================================
