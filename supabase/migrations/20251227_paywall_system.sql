-- ============================================
-- PAYWALL OPTIMIZATION SYSTEM
-- Multi-step conversion funnel, gamification, abandonment recovery
-- Created: 2025-12-27
-- ============================================

-- ============================================
-- PAYWALL EVENTS TABLE
-- Tracks all paywall interactions for conversion funnel analysis
-- ============================================

CREATE TABLE IF NOT EXISTS paywall_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  -- Event tracking
  event_type TEXT NOT NULL CHECK (event_type IN (
    'paywall_impression',
    'step_1_view',
    'step_1_continue',
    'step_2_view',
    'step_2_continue',
    'step_3_view',
    'cta_click',
    'payment_started',
    'payment_completed',
    'payment_abandoned',
    'abandonment_offer_shown',
    'abandonment_offer_accepted',
    'spin_wheel_shown',
    'spin_wheel_completed',
    'trial_toggle_clicked'
  )),

  -- Placement tracking
  placement_id TEXT, -- 'post_onboarding', 'first_generation', 'publish_attempt', etc.
  page_url TEXT,

  -- Plan selection
  plan_selected TEXT, -- 'basic', 'pro', 'premium', 'enterprise'
  billing_interval TEXT, -- 'monthly', 'annual'
  trial_selected BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_paywall_events_user ON paywall_events(user_id);
CREATE INDEX idx_paywall_events_session ON paywall_events(session_id);
CREATE INDEX idx_paywall_events_type ON paywall_events(event_type);
CREATE INDEX idx_paywall_events_placement ON paywall_events(placement_id);
CREATE INDEX idx_paywall_events_created ON paywall_events(created_at DESC);

-- RLS
ALTER TABLE paywall_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own paywall events"
  ON paywall_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage paywall events"
  ON paywall_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- TRIAL TRACKING TABLE
-- Detailed trial lifecycle tracking
-- ============================================

CREATE TABLE IF NOT EXISTS trial_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID, -- Links to subscriptions table

  -- Trial period
  trial_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_end TIMESTAMPTZ NOT NULL,
  trial_duration_days INTEGER NOT NULL DEFAULT 7,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',
    'converted',
    'cancelled',
    'expired'
  )),

  -- Reminder tracking
  reminder_3days_sent BOOLEAN DEFAULT FALSE,
  reminder_5days_sent BOOLEAN DEFAULT FALSE,
  reminder_7days_sent BOOLEAN DEFAULT FALSE,

  -- Conversion
  converted_at TIMESTAMPTZ,
  converted_to_plan TEXT,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Metadata
  original_plan TEXT, -- 'basic', 'pro', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trial_tracking_user ON trial_tracking(user_id);
CREATE INDEX idx_trial_tracking_status ON trial_tracking(status);
CREATE INDEX idx_trial_tracking_end ON trial_tracking(trial_end);

-- RLS
ALTER TABLE trial_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trials"
  ON trial_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage trials"
  ON trial_tracking FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- DISCOUNT CODES TABLE
-- Spin wheel prizes, abandonment offers, promotional codes
-- ============================================

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,

  -- Discount details
  type TEXT NOT NULL CHECK (type IN (
    'spin_wheel',
    'abandonment',
    'promotional',
    'referral',
    'special'
  )),
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),

  -- Constraints
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER, -- NULL = unlimited
  max_uses_per_user INTEGER DEFAULT 1,

  -- Restrictions
  applicable_plans TEXT[], -- ['basic', 'pro'] or NULL for all
  minimum_amount_kwd DECIMAL(10, 3),

  -- Metadata
  description TEXT,
  description_ar TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_type ON discount_codes(type);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active, valid_until);

-- RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Service role can manage discount codes"
  ON discount_codes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- DISCOUNT USAGE TABLE
-- Track redemptions
-- ============================================

CREATE TABLE IF NOT EXISTS discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Usage details
  order_id TEXT,
  amount_before DECIMAL(10, 3) NOT NULL,
  discount_amount DECIMAL(10, 3) NOT NULL,
  amount_after DECIMAL(10, 3) NOT NULL,

  -- Plan details
  plan_selected TEXT NOT NULL,
  billing_interval TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'applied',
    'refunded',
    'expired'
  )),

  -- Timestamps
  used_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate usage
  UNIQUE(discount_code_id, user_id, order_id)
);

-- Indexes
CREATE INDEX idx_discount_usage_code ON discount_usage(discount_code_id);
CREATE INDEX idx_discount_usage_user ON discount_usage(user_id);
CREATE INDEX idx_discount_usage_status ON discount_usage(status);

-- RLS
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own discount usage"
  ON discount_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage discount usage"
  ON discount_usage FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- SPIN WHEEL ENTRIES TABLE
-- Track spin wheel participations (1 per email/session)
-- ============================================

CREATE TABLE IF NOT EXISTS spin_wheel_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  session_id TEXT NOT NULL,

  -- Prize details
  prize_index INTEGER NOT NULL CHECK (prize_index >= 0 AND prize_index <= 5),
  discount_percent INTEGER NOT NULL,
  discount_code TEXT REFERENCES discount_codes(code),

  -- Redemption tracking
  redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMPTZ,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent multiple spins per session
  UNIQUE(session_id)
);

-- Indexes
CREATE INDEX idx_spin_wheel_email ON spin_wheel_entries(email);
CREATE INDEX idx_spin_wheel_redeemed ON spin_wheel_entries(redeemed);
CREATE INDEX idx_spin_wheel_created ON spin_wheel_entries(created_at DESC);

-- RLS
ALTER TABLE spin_wheel_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spin entries"
  ON spin_wheel_entries FOR SELECT
  USING (TRUE); -- Anyone can view (for email lookup)

CREATE POLICY "Anyone can create spin entry"
  ON spin_wheel_entries FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service role can manage spin entries"
  ON spin_wheel_entries FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- PAYWALL PLACEMENTS TABLE
-- Configuration for where paywalls appear
-- ============================================

CREATE TABLE IF NOT EXISTS paywall_placements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('P0', 'P1', 'P2')),
  expected_conversion DECIMAL(3, 2), -- 0.15 = 15%
  is_active BOOLEAN DEFAULT TRUE,
  trigger_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default placements
INSERT INTO paywall_placements (id, name, name_ar, description, priority, expected_conversion, trigger_config) VALUES
  ('post_onboarding', 'Post Onboarding', 'بعد التسجيل', 'Show after user completes onboarding', 'P0', 0.40, '{"delay_seconds": 2}'),
  ('first_generation', 'First AI Generation', 'أول توليد AI', 'Before first code generation attempt', 'P0', 0.25, '{"generation_count": 0}'),
  ('publish_attempt', 'Publish Attempt', 'محاولة النشر', 'When user tries to publish without subscription', 'P0', 0.15, '{}'),
  ('credit_exhaustion', 'Credit Exhaustion', 'نفاد الرصيد', 'When user has ≤5 credits remaining', 'P1', 0.10, '{"credit_threshold": 5}'),
  ('feature_gate', 'Feature Gate', 'بوابة الميزة', 'Premium feature access attempt', 'P1', 0.12, '{}'),
  ('dashboard_visit', 'Dashboard Visit', 'زيارة لوحة التحكم', 'After 3+ dashboard visits without subscription', 'P2', 0.05, '{"visit_threshold": 3}')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE paywall_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active placements"
  ON paywall_placements FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Service role can manage placements"
  ON paywall_placements FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- CONVERSION FUNNEL VIEW
-- For analytics dashboard
-- ============================================

CREATE OR REPLACE VIEW paywall_conversion_funnel AS
SELECT
  placement_id,
  date_trunc('day', created_at) AS date,
  COUNT(*) FILTER (WHERE event_type = 'paywall_impression') AS impressions,
  COUNT(*) FILTER (WHERE event_type = 'step_1_continue') AS step_1_continues,
  COUNT(*) FILTER (WHERE event_type = 'step_2_continue') AS step_2_continues,
  COUNT(*) FILTER (WHERE event_type = 'cta_click') AS cta_clicks,
  COUNT(*) FILTER (WHERE event_type = 'payment_started') AS payments_started,
  COUNT(*) FILTER (WHERE event_type = 'payment_completed') AS payments_completed,

  -- Conversion rates
  CASE
    WHEN COUNT(*) FILTER (WHERE event_type = 'paywall_impression') > 0
    THEN ROUND(
      COUNT(*) FILTER (WHERE event_type = 'payment_completed')::DECIMAL /
      COUNT(*) FILTER (WHERE event_type = 'paywall_impression')::DECIMAL * 100,
      2
    )
    ELSE 0
  END AS overall_conversion_rate,

  CASE
    WHEN COUNT(*) FILTER (WHERE event_type = 'payment_started') > 0
    THEN ROUND(
      COUNT(*) FILTER (WHERE event_type = 'payment_completed')::DECIMAL /
      COUNT(*) FILTER (WHERE event_type = 'payment_started')::DECIMAL * 100,
      2
    )
    ELSE 0
  END AS payment_completion_rate

FROM paywall_events
GROUP BY placement_id, date_trunc('day', created_at)
ORDER BY date DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate unique discount code
CREATE OR REPLACE FUNCTION generate_discount_code(
  p_prefix TEXT DEFAULT 'KWQ8'
)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code: PREFIX-XXXX (e.g., KWQ8-A5B9)
    v_code := p_prefix || '-' ||
              UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));

    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM discount_codes WHERE code = v_code) INTO v_exists;

    -- If unique, return
    IF NOT v_exists THEN
      RETURN v_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Check discount code validity
CREATE OR REPLACE FUNCTION is_discount_code_valid(
  p_code TEXT,
  p_user_id UUID,
  p_plan TEXT
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_percent INTEGER,
  reason TEXT
) AS $$
DECLARE
  v_discount discount_codes%ROWTYPE;
  v_usage_count INTEGER;
  v_user_usage_count INTEGER;
BEGIN
  -- Get discount code
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE code = p_code;

  -- Code doesn't exist
  IF v_discount.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'كود الخصم غير موجود';
    RETURN;
  END IF;

  -- Code is inactive
  IF NOT v_discount.is_active THEN
    RETURN QUERY SELECT FALSE, 0, 'كود الخصم غير نشط';
    RETURN;
  END IF;

  -- Code expired
  IF v_discount.valid_until IS NOT NULL AND v_discount.valid_until < NOW() THEN
    RETURN QUERY SELECT FALSE, 0, 'كود الخصم منتهي الصلاحية';
    RETURN;
  END IF;

  -- Code not yet valid
  IF v_discount.valid_from > NOW() THEN
    RETURN QUERY SELECT FALSE, 0, 'كود الخصم ليس ساري المفعول بعد';
    RETURN;
  END IF;

  -- Check max uses
  IF v_discount.max_uses IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usage_count
    FROM discount_usage
    WHERE discount_code_id = v_discount.id
      AND status = 'applied';

    IF v_usage_count >= v_discount.max_uses THEN
      RETURN QUERY SELECT FALSE, 0, 'تم استخدام كود الخصم بالكامل';
      RETURN;
    END IF;
  END IF;

  -- Check per-user usage
  SELECT COUNT(*) INTO v_user_usage_count
  FROM discount_usage
  WHERE discount_code_id = v_discount.id
    AND user_id = p_user_id
    AND status = 'applied';

  IF v_user_usage_count >= v_discount.max_uses_per_user THEN
    RETURN QUERY SELECT FALSE, 0, 'لقد استخدمت هذا الكود من قبل';
    RETURN;
  END IF;

  -- Check plan restriction
  IF v_discount.applicable_plans IS NOT NULL AND
     NOT (p_plan = ANY(v_discount.applicable_plans)) THEN
    RETURN QUERY SELECT FALSE, 0, 'كود الخصم لا ينطبق على هذه الباقة';
    RETURN;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT TRUE, v_discount.discount_percent, 'صالح'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply discount to amount
CREATE OR REPLACE FUNCTION apply_discount(
  p_amount DECIMAL(10, 3),
  p_discount_percent INTEGER
)
RETURNS DECIMAL(10, 3) AS $$
BEGIN
  RETURN ROUND(p_amount * (1 - p_discount_percent / 100.0), 3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update trial_tracking.updated_at on changes
CREATE OR REPLACE FUNCTION update_trial_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trial_tracking_updated_at
  BEFORE UPDATE ON trial_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_trial_tracking_timestamp();

-- Update discount_codes.updated_at on changes
CREATE OR REPLACE FUNCTION update_discount_codes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discount_codes_updated_at
  BEFORE UPDATE ON discount_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_discount_codes_timestamp();

-- ============================================
-- SAMPLE DATA (for development/testing)
-- ============================================

-- Sample spin wheel discount codes
INSERT INTO discount_codes (code, type, discount_percent, description, description_ar, max_uses_per_user) VALUES
  (generate_discount_code('SPIN5'), 'spin_wheel', 5, '5% off spin wheel prize', 'خصم 5% من عجلة الحظ', 1),
  (generate_discount_code('SPIN10'), 'spin_wheel', 10, '10% off spin wheel prize', 'خصم 10% من عجلة الحظ', 1),
  (generate_discount_code('SPIN15'), 'spin_wheel', 15, '15% off spin wheel prize', 'خصم 15% من عجلة الحظ', 1),
  (generate_discount_code('SPIN20'), 'spin_wheel', 20, '20% off spin wheel prize', 'خصم 20% من عجلة الحظ', 1),
  (generate_discount_code('SPIN25'), 'spin_wheel', 25, '25% off spin wheel prize', 'خصم 25% من عجلة الحظ', 1),
  (generate_discount_code('SPIN30'), 'spin_wheel', 30, '30% off spin wheel prize', 'خصم 30% من عجلة الحظ', 1)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE paywall_events IS 'Tracks all paywall interactions for conversion funnel analysis';
COMMENT ON TABLE trial_tracking IS 'Detailed trial period lifecycle tracking with reminder status';
COMMENT ON TABLE discount_codes IS 'All discount codes including spin wheel prizes and promotional offers';
COMMENT ON TABLE discount_usage IS 'Redemption tracking for all discount codes';
COMMENT ON TABLE spin_wheel_entries IS 'Spin wheel participation tracking (1 per session)';
COMMENT ON VIEW paywall_conversion_funnel IS 'Analytics view for paywall performance metrics';

-- ============================================
-- END OF MIGRATION
-- ============================================
