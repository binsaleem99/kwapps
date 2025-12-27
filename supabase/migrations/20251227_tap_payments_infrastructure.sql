-- ============================================
-- TAP PAYMENTS INFRASTRUCTURE
-- Parallel payment system for GCC multi-currency expansion
-- Runs alongside UPayments during migration
-- Created: 2025-12-27
-- ============================================

-- ============================================
-- TAP SUBSCRIPTIONS TABLE
-- Parallel to existing user_subscriptions (UPayments)
-- ============================================

CREATE TABLE IF NOT EXISTS tap_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tap IDs
  tap_subscription_id TEXT UNIQUE,
  tap_customer_id TEXT,
  tap_charge_id TEXT,

  -- Plan info
  plan_id TEXT NOT NULL, -- 'basic_monthly_kwd', 'pro_monthly_sar', etc.
  plan_name TEXT NOT NULL,
  plan_name_ar TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'active',
    'trialing',
    'past_due',
    'paused',
    'cancelling',
    'cancelled',
    'expired'
  )),

  -- Billing (multi-currency)
  amount DECIMAL(10, 3) NOT NULL,
  currency TEXT NOT NULL, -- KWD, SAR, AED, QAR, BHD, OMR
  amount_kwd DECIMAL(10, 3) NOT NULL, -- Normalized to KWD for reporting
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN (
    'week',
    'month',
    'year'
  )),

  -- Periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancellation_reason TEXT,

  -- Migration tracking
  migrated_from_upayments BOOLEAN DEFAULT FALSE,
  original_upayments_subscription_id UUID,
  migration_date TIMESTAMPTZ,

  -- Metadata
  renewal_count INTEGER DEFAULT 0,
  failed_payment_count INTEGER DEFAULT 0,
  last_payment_attempt TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tap_subscriptions_user ON tap_subscriptions(user_id);
CREATE INDEX idx_tap_subscriptions_status ON tap_subscriptions(status);
CREATE INDEX idx_tap_subscriptions_tap_id ON tap_subscriptions(tap_subscription_id);
CREATE INDEX idx_tap_subscriptions_period_end ON tap_subscriptions(current_period_end);
CREATE INDEX idx_tap_subscriptions_currency ON tap_subscriptions(currency);
CREATE INDEX idx_tap_subscriptions_plan ON tap_subscriptions(plan_id);

-- RLS Policies
ALTER TABLE tap_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tap subscriptions"
  ON tap_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all tap subscriptions"
  ON tap_subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- EXCHANGE RATES TABLE
-- Daily updated rates for currency conversion
-- ============================================

CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY DEFAULT 1,
  base_currency TEXT DEFAULT 'KWD',

  -- Current rates (updated daily)
  rates JSONB NOT NULL DEFAULT '{
    "KWD": 1.00,
    "SAR": 12.20,
    "AED": 11.95,
    "QAR": 11.85,
    "BHD": 1.23,
    "OMR": 1.25
  }'::jsonb,

  -- Tracking
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'exchangerate-api.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one row
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row
INSERT INTO exchange_rates (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exchange rates"
  ON exchange_rates FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role can update exchange rates"
  ON exchange_rates FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- TAP BILLING EVENTS TABLE
-- All financial events for audit trail
-- ============================================

CREATE TABLE IF NOT EXISTS tap_billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tap_subscription_id UUID REFERENCES tap_subscriptions(id) ON DELETE CASCADE,

  -- Tap references
  tap_invoice_id TEXT,
  tap_charge_id TEXT,
  tap_refund_id TEXT,

  -- Event details
  type TEXT NOT NULL CHECK (type IN (
    'subscription_created',
    'subscription_activated',
    'subscription_renewed',
    'subscription_cancelled',
    'subscription_paused',
    'subscription_resumed',
    'payment_success',
    'payment_failed',
    'payment_retry',
    'refund',
    'trial_started',
    'trial_ended',
    'plan_changed',
    'plan_upgraded',
    'plan_downgraded'
  )),

  -- Financial
  amount DECIMAL(10, 3),
  currency TEXT,
  amount_kwd DECIMAL(10, 3), -- Normalized for reporting

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'completed',
    'failed',
    'refunded'
  )),
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tap_billing_events_user ON tap_billing_events(user_id);
CREATE INDEX idx_tap_billing_events_subscription ON tap_billing_events(tap_subscription_id);
CREATE INDEX idx_tap_billing_events_type ON tap_billing_events(type);
CREATE INDEX idx_tap_billing_events_status ON tap_billing_events(status);
CREATE INDEX idx_tap_billing_events_created ON tap_billing_events(created_at DESC);

-- RLS
ALTER TABLE tap_billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tap billing events"
  ON tap_billing_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all tap billing events"
  ON tap_billing_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- WEBHOOK EVENTS TABLE
-- All webhook payloads for debugging
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider
  provider TEXT NOT NULL CHECK (provider IN ('upayments', 'tap', 'namecheap')),

  -- Event data
  event_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_events_provider ON webhook_events(provider, event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);

-- RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhook events"
  ON webhook_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- PAYMENT RETRY SCHEDULE TABLE
-- Dunning management (3 retries over 7 days)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_retry_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tap_subscription_id UUID REFERENCES tap_subscriptions(id) ON DELETE CASCADE,

  -- Retry details
  attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1 AND attempt_number <= 3),
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Execution
  executed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'success',
    'failed',
    'skipped'
  )),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_retry_schedule_scheduled ON payment_retry_schedule(scheduled_for, status);
CREATE INDEX idx_payment_retry_schedule_subscription ON payment_retry_schedule(tap_subscription_id);

-- RLS
ALTER TABLE payment_retry_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage retry schedule"
  ON payment_retry_schedule FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- UPDATE USERS TABLE
-- Track payment provider per user
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'upayments'
  CHECK (payment_provider IN ('upayments', 'tap'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'KWD';
ALTER TABLE users ADD COLUMN IF NOT EXISTS detected_country TEXT DEFAULT 'KW';

-- ============================================
-- TAP CUSTOMERS TABLE
-- Store Tap customer IDs for reuse
-- ============================================

CREATE TABLE IF NOT EXISTS tap_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tap_customer_id TEXT UNIQUE NOT NULL,

  -- Customer details
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,

  -- Default payment method
  has_saved_card BOOLEAN DEFAULT FALSE,
  card_last_4 TEXT,
  card_brand TEXT, -- 'visa', 'mastercard', 'mada', etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_tap_customers_user ON tap_customers(user_id);
CREATE INDEX idx_tap_customers_tap_id ON tap_customers(tap_customer_id);

-- RLS
ALTER TABLE tap_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tap customer info"
  ON tap_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage tap customers"
  ON tap_customers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- CURRENCY CONVERSION HELPER FUNCTIONS
-- ============================================

-- Convert from KWD to target currency
CREATE OR REPLACE FUNCTION convert_from_kwd(
  p_amount_kwd DECIMAL(10, 3),
  p_target_currency TEXT
)
RETURNS DECIMAL(10, 3) AS $$
DECLARE
  v_rate DECIMAL(10, 6);
  v_decimals INTEGER;
BEGIN
  -- Get exchange rate
  SELECT (rates->>p_target_currency)::DECIMAL
  INTO v_rate
  FROM exchange_rates
  WHERE id = 1;

  IF v_rate IS NULL THEN
    RAISE EXCEPTION 'Currency % not found', p_target_currency;
  END IF;

  -- Get decimals for currency
  v_decimals := CASE p_target_currency
    WHEN 'KWD' THEN 3
    WHEN 'BHD' THEN 3
    WHEN 'OMR' THEN 3
    WHEN 'SAR' THEN 2
    WHEN 'AED' THEN 2
    WHEN 'QAR' THEN 2
    ELSE 2
  END;

  -- Convert and round
  RETURN ROUND(p_amount_kwd * v_rate, v_decimals);
END;
$$ LANGUAGE plpgsql STABLE;

-- Convert to KWD for normalization
CREATE OR REPLACE FUNCTION convert_to_kwd(
  p_amount DECIMAL(10, 3),
  p_currency TEXT
)
RETURNS DECIMAL(10, 3) AS $$
DECLARE
  v_rate DECIMAL(10, 6);
BEGIN
  IF p_currency = 'KWD' THEN
    RETURN p_amount;
  END IF;

  -- Get exchange rate
  SELECT (rates->>p_currency)::DECIMAL
  INTO v_rate
  FROM exchange_rates
  WHERE id = 1;

  IF v_rate IS NULL THEN
    RAISE EXCEPTION 'Currency % not found', p_currency;
  END IF;

  -- Convert to KWD
  RETURN ROUND(p_amount / v_rate, 3);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- MIGRATION HELPER FUNCTIONS
-- ============================================

-- Check if user has active UPayments subscription
CREATE OR REPLACE FUNCTION has_active_upayments_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1
    FROM user_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if user has active Tap subscription
CREATE OR REPLACE FUNCTION has_active_tap_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1
    FROM tap_subscriptions
    WHERE user_id = p_user_id
      AND status IN ('active', 'trialing')
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Get user's current payment provider
CREATE OR REPLACE FUNCTION get_user_payment_provider(p_user_id UUID)
RETURNS TEXT AS $$
BEGIN
  -- If has Tap subscription, use Tap
  IF has_active_tap_subscription(p_user_id) THEN
    RETURN 'tap';
  END IF;

  -- If has UPayments subscription, use UPayments
  IF has_active_upayments_subscription(p_user_id) THEN
    RETURN 'upayments';
  END IF;

  -- Default to user's preference or Tap for new users
  RETURN COALESCE(
    (SELECT payment_provider FROM users WHERE id = p_user_id),
    'tap'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update tap_subscriptions.updated_at on changes
CREATE OR REPLACE FUNCTION update_tap_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tap_subscriptions_updated_at
  BEFORE UPDATE ON tap_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_tap_subscription_timestamp();

-- Update tap_customers.updated_at on changes
CREATE OR REPLACE FUNCTION update_tap_customer_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tap_customers_updated_at
  BEFORE UPDATE ON tap_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_tap_customer_timestamp();

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- Subscription overview (both providers)
CREATE OR REPLACE VIEW subscription_overview AS
SELECT
  'upayments' AS provider,
  COUNT(*) AS total_subscriptions,
  COUNT(*) FILTER (WHERE status = 'active') AS active_subscriptions,
  SUM(amount_paid) FILTER (WHERE status = 'active') AS monthly_revenue
FROM user_subscriptions
UNION ALL
SELECT
  'tap' AS provider,
  COUNT(*) AS total_subscriptions,
  COUNT(*) FILTER (WHERE status IN ('active', 'trialing')) AS active_subscriptions,
  SUM(amount_kwd) FILTER (WHERE status IN ('active', 'trialing')) AS monthly_revenue
FROM tap_subscriptions;

-- Currency distribution (Tap only)
CREATE OR REPLACE VIEW tap_currency_distribution AS
SELECT
  currency,
  COUNT(*) AS subscription_count,
  SUM(amount_kwd) AS total_mrr_kwd,
  ROUND(AVG(amount_kwd), 3) AS avg_subscription_value,
  COUNT(*) FILTER (WHERE status = 'active') AS active_count
FROM tap_subscriptions
WHERE status IN ('active', 'trialing')
GROUP BY currency
ORDER BY subscription_count DESC;

-- Migration progress
CREATE OR REPLACE VIEW migration_progress AS
SELECT
  COUNT(*) FILTER (WHERE payment_provider = 'upayments') AS upayments_users,
  COUNT(*) FILTER (WHERE payment_provider = 'tap') AS tap_users,
  COUNT(*) AS total_users,
  ROUND(
    COUNT(*) FILTER (WHERE payment_provider = 'tap')::DECIMAL /
    NULLIF(COUNT(*)::DECIMAL, 0) * 100,
    2
  ) AS migration_percentage
FROM users
WHERE id IN (
  SELECT user_id FROM user_subscriptions WHERE status = 'active'
  UNION
  SELECT user_id FROM tap_subscriptions WHERE status IN ('active', 'trialing')
);

-- ============================================
-- SAMPLE TAP PLANS
-- Loaded from Tap Payments dashboard
-- ============================================

CREATE TABLE IF NOT EXISTS tap_plans (
  id TEXT PRIMARY KEY,
  tap_plan_id TEXT UNIQUE,

  -- Plan details
  tier TEXT NOT NULL CHECK (tier IN ('basic', 'pro', 'premium', 'enterprise')),
  interval TEXT NOT NULL CHECK (interval IN ('week', 'month', 'year')),
  currency TEXT NOT NULL,

  -- Pricing
  amount DECIMAL(10, 3) NOT NULL,
  amount_kwd DECIMAL(10, 3) NOT NULL,

  -- Trial
  trial_days INTEGER DEFAULT 0,

  -- Features
  credits_per_day INTEGER NOT NULL,
  max_rollover_credits INTEGER,

  -- Names
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans (KWD)
INSERT INTO tap_plans (id, tier, interval, currency, amount, amount_kwd, trial_days, credits_per_day, max_rollover_credits, name, name_ar) VALUES
  ('basic_monthly_kwd', 'basic', 'month', 'KWD', 22.990, 22.990, 7, 100, 300, 'Basic Monthly', 'الباقة الأساسية - شهري'),
  ('basic_annual_kwd', 'basic', 'year', 'KWD', 229.900, 229.900, 7, 100, 3650, 'Basic Annual', 'الباقة الأساسية - سنوي'),
  ('pro_monthly_kwd', 'pro', 'month', 'KWD', 37.500, 37.500, 0, 200, 600, 'Pro Monthly', 'الباقة الاحترافية - شهري'),
  ('pro_annual_kwd', 'pro', 'year', 'KWD', 375.000, 375.000, 0, 200, 7300, 'Pro Annual', 'الباقة الاحترافية - سنوي'),
  ('premium_monthly_kwd', 'premium', 'month', 'KWD', 58.750, 58.750, 0, 400, 1200, 'Premium Monthly', 'الباقة المميزة - شهري'),
  ('premium_annual_kwd', 'premium', 'year', 'KWD', 587.500, 587.500, 0, 400, 14600, 'Premium Annual', 'الباقة المميزة - سنوي'),
  ('enterprise_monthly_kwd', 'enterprise', 'month', 'KWD', 74.500, 74.500, 0, 800, 2400, 'Enterprise Monthly', 'باقة المؤسسات - شهري'),
  ('enterprise_annual_kwd', 'enterprise', 'year', 'KWD', 745.000, 745.000, 0, 800, 29200, 'Enterprise Annual', 'باقة المؤسسات - سنوي'),
  ('trial_weekly_kwd', 'basic', 'week', 'KWD', 1.000, 1.000, 0, 100, 100, 'Trial Weekly', 'الفترة التجريبية')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE tap_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tap plans"
  ON tap_plans FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Service role can manage tap plans"
  ON tap_plans FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE tap_subscriptions IS 'Tap Payments subscriptions - parallel to UPayments during migration';
COMMENT ON TABLE exchange_rates IS 'Daily updated exchange rates for GCC currency conversion';
COMMENT ON TABLE tap_billing_events IS 'Complete audit trail of all Tap payment events';
COMMENT ON TABLE webhook_events IS 'All webhook payloads from payment providers for debugging';
COMMENT ON TABLE payment_retry_schedule IS 'Dunning schedule for failed payment retries (3 attempts over 7 days)';
COMMENT ON TABLE tap_customers IS 'Tap customer IDs and saved payment methods';
COMMENT ON TABLE tap_plans IS 'Available Tap subscription plans with multi-currency pricing';
COMMENT ON VIEW subscription_overview IS 'Combined view of UPayments and Tap subscriptions';
COMMENT ON VIEW tap_currency_distribution IS 'Currency usage statistics for Tap subscriptions';
COMMENT ON VIEW migration_progress IS 'Real-time migration status from UPayments to Tap';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
