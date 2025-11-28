-- =====================================================
-- Migration 002: Fix RLS Errors and Function Issues
-- =====================================================

-- 1. Enable RLS on admin tables that are missing it
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- 2. Fix analytics_events RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics_events (anyone can insert, users can read own)
CREATE POLICY "Users can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- 3. Fix function search_path issues by setting it explicitly
ALTER FUNCTION is_admin(UUID) SET search_path = public, pg_temp;
ALTER FUNCTION has_admin_permission(UUID, admin_role) SET search_path = public, pg_temp;
ALTER FUNCTION log_admin_action(UUID, TEXT, TEXT, UUID, JSONB, INET) SET search_path = public, pg_temp;

-- 4. Fix check_usage_limit function with proper search_path
DROP FUNCTION IF EXISTS check_usage_limit(UUID);

CREATE OR REPLACE FUNCTION check_usage_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get user's plan
  SELECT plan INTO v_plan
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- If no subscription, check users table
  IF v_plan IS NULL THEN
    SELECT plan INTO v_plan
    FROM users
    WHERE id = p_user_id;
  END IF;

  -- Get today's usage count
  SELECT COALESCE(prompt_count, 0) INTO v_count
  FROM usage_limits
  WHERE user_id = p_user_id AND date = CURRENT_DATE;

  -- Set limits based on plan
  v_limit := CASE COALESCE(v_plan, 'free')
    WHEN 'free' THEN 3
    WHEN 'builder' THEN 30
    WHEN 'pro' THEN 100
    ELSE 3
  END;

  RETURN COALESCE(v_count, 0) < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. Fix save_project_version function with search_path
DROP FUNCTION IF EXISTS save_project_version() CASCADE;

CREATE OR REPLACE FUNCTION save_project_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_versions (project_id, version, code_snapshot, prompt_snapshot)
  VALUES (
    NEW.id,
    COALESCE((SELECT MAX(version) FROM project_versions WHERE project_id = NEW.id), 0) + 1,
    NEW.generated_code,
    NEW.arabic_prompt
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Recreate trigger
DROP TRIGGER IF EXISTS save_project_version_trigger ON projects;
CREATE TRIGGER save_project_version_trigger
  AFTER UPDATE OF generated_code ON projects
  FOR EACH ROW
  EXECUTE FUNCTION save_project_version();

-- 6. Fix handle_new_user function with search_path
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 7. Add missing RLS policies with proper permissions

-- User activity: users can insert their own, admins can read all
CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all activity" ON user_activity
  FOR SELECT USING (is_admin(auth.uid()));

-- 8. Create missing tables if they don't exist

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  influencer_name TEXT NOT NULL,
  influencer_email TEXT,
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  commission_percentage INTEGER DEFAULT 30 CHECK (commission_percentage >= 0 AND commission_percentage <= 100),
  total_uses INTEGER DEFAULT 0,
  total_revenue_kwd DECIMAL(10,3) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_active ON referral_codes(is_active);

-- Referral uses table
CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  discount_applied DECIMAL(10,3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referral_code_id, user_id)
);

CREATE INDEX idx_referral_uses_code_id ON referral_uses(referral_code_id);
CREATE INDEX idx_referral_uses_user_id ON referral_uses(user_id);

-- Referral commissions table
CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount_kwd DECIMAL(10,3) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_commissions_code_id ON referral_commissions(referral_code_id);
CREATE INDEX idx_referral_commissions_status ON referral_commissions(status);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt_ar TEXT,
  excerpt_en TEXT,
  content_ar TEXT NOT NULL,
  content_en TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  featured_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  seo_title_ar TEXT,
  seo_title_en TEXT,
  seo_description_ar TEXT,
  seo_description_en TEXT,
  seo_keywords TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- 9. RLS policies for new tables

-- Referral codes: Admins only
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage referral codes" ON referral_codes
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can read active codes" ON referral_codes
  FOR SELECT USING (is_active = true);

-- Referral uses: Users can read own, admins can see all
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral uses" ON referral_uses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage referral uses" ON referral_uses
  FOR ALL USING (is_admin(auth.uid()));

-- Referral commissions: Admins only
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage commissions" ON referral_commissions
  FOR ALL USING (is_admin(auth.uid()));

-- Blog posts: Public can read published, admins can manage
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage all posts" ON blog_posts
  FOR ALL USING (is_admin(auth.uid()));

-- 10. Helper functions for referrals

CREATE OR REPLACE FUNCTION apply_referral_code(
  p_user_id UUID,
  p_code TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_code_id UUID;
  v_discount INTEGER;
  v_result JSONB;
BEGIN
  -- Check if code exists and is active
  SELECT id, discount_percentage INTO v_code_id, v_discount
  FROM referral_codes
  WHERE code = p_code AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());

  IF v_code_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired code');
  END IF;

  -- Check if user already used this code
  IF EXISTS (SELECT 1 FROM referral_uses WHERE referral_code_id = v_code_id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code already used');
  END IF;

  -- Record the use
  INSERT INTO referral_uses (referral_code_id, user_id, discount_applied)
  VALUES (v_code_id, p_user_id, v_discount);

  -- Increment usage count
  UPDATE referral_codes
  SET total_uses = total_uses + 1
  WHERE id = v_code_id;

  RETURN jsonb_build_object(
    'success', true,
    'discount_percentage', v_discount,
    'code_id', v_code_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 11. Comments
COMMENT ON TABLE referral_codes IS 'Influencer referral codes with lifetime commissions';
COMMENT ON TABLE referral_uses IS 'Tracks which users used which referral codes';
COMMENT ON TABLE referral_commissions IS 'Monthly recurring commissions for referrals';
COMMENT ON TABLE blog_posts IS 'Blog posts with SEO optimization and bilingual support';
COMMENT ON FUNCTION apply_referral_code IS 'Apply a referral code to a user and track the referral';
