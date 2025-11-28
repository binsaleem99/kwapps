-- Migration: Billing and Subscriptions System
-- Creates tables for UPayments integration, subscriptions, and usage tracking

-- ============================================================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'free', 'builder', 'pro', 'hosting'
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'KWD',

  -- Plan Limits
  max_projects INTEGER NOT NULL DEFAULT 1,
  max_storage_mb INTEGER NOT NULL DEFAULT 100,
  max_prompts_per_day INTEGER NOT NULL DEFAULT 3,

  -- Features
  features JSONB NOT NULL DEFAULT '[]',

  -- Status
  active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, name_ar, name_en, price_monthly, max_projects, max_storage_mb, max_prompts_per_day, features) VALUES
('free', 'مجاني', 'Free', 0, 1, 100, 3, '["1 مشروع", "100MB تخزين", "3 طلبات AI يومياً"]'),
('builder', 'بناء', 'Builder', 33, 10, 1024, 30, '["10 مشاريع", "1GB تخزين", "30 طلب AI يومياً", "دومين مخصص", "دعم أولوية"]'),
('pro', 'احترافي', 'Pro', 59, 100, 10240, 100, '["100 مشروع", "10GB تخزين", "100 طلب AI يومياً", "دومين مخصص", "دعم VIP", "تحليلات متقدمة"]'),
('hosting', 'استضافة فقط', 'Hosting Only', 5, 0, 0, 0, '["استضافة المشاريع الحالية", "بدون مشاريع جديدة", "مناسب للمشاريع المكتملة"]');

-- ============================================================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),

  -- Subscription Status
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'paused'

  -- Billing Cycle
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

  -- Payment Information
  card_token VARCHAR(500), -- UPayments card token for recurring billing
  card_last_four VARCHAR(4),
  card_type VARCHAR(20), -- 'knet', 'credit_card'

  -- Billing History
  last_payment_date TIMESTAMPTZ,
  last_payment_amount DECIMAL(10, 2),
  next_payment_date TIMESTAMPTZ,
  failed_payment_attempts INTEGER NOT NULL DEFAULT 0,

  -- Cancellation
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id) -- One subscription per user
);

-- Index for quick subscription lookups
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_next_payment ON user_subscriptions(next_payment_date) WHERE status = 'active';

-- ============================================================================
-- PAYMENT TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,

  -- UPayments Details
  upayments_order_id VARCHAR(255) NOT NULL UNIQUE,
  upayments_payment_id VARCHAR(255),
  upayments_transaction_id VARCHAR(255),

  -- Transaction Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KWD',
  status VARCHAR(20) NOT NULL, -- 'pending', 'success', 'failed', 'refunded'
  payment_method VARCHAR(20), -- 'knet', 'credit_card', 'debit_card'

  -- Type
  transaction_type VARCHAR(30) NOT NULL, -- 'initial_subscription', 'recurring_charge', 'upgrade', 'one_time'

  -- Additional Data
  metadata JSONB,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for payment lookups
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_upayments_order ON payment_transactions(upayments_order_id);

-- ============================================================================
-- USAGE TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Current Usage (resets monthly)
  prompts_used_today INTEGER NOT NULL DEFAULT 0,
  prompts_used_this_month INTEGER NOT NULL DEFAULT 0,
  storage_used_mb INTEGER NOT NULL DEFAULT 0,
  projects_count INTEGER NOT NULL DEFAULT 0,

  -- Reset Tracking
  last_daily_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_monthly_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Index for usage lookups
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function: Get user's current plan limits
CREATE OR REPLACE FUNCTION get_user_plan_limits(p_user_id UUID)
RETURNS TABLE(
  max_projects INTEGER,
  max_storage_mb INTEGER,
  max_prompts_per_day INTEGER,
  plan_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.max_projects,
    sp.max_storage_mb,
    sp.max_prompts_per_day,
    sp.name
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  LIMIT 1;

  -- If no active subscription, return free plan
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      sp.max_projects,
      sp.max_storage_mb,
      sp.max_prompts_per_day,
      sp.name
    FROM subscription_plans sp
    WHERE sp.name = 'free'
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Check if user can perform action (respects limits)
CREATE OR REPLACE FUNCTION check_user_limit(
  p_user_id UUID,
  p_limit_type VARCHAR, -- 'prompts', 'projects', 'storage'
  p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_limits RECORD;
  v_usage RECORD;
BEGIN
  -- Get plan limits
  SELECT * INTO v_limits FROM get_user_plan_limits(p_user_id) LIMIT 1;

  -- Get current usage
  SELECT * INTO v_usage FROM usage_tracking WHERE user_id = p_user_id;

  -- If no usage record, create one
  IF v_usage IS NULL THEN
    INSERT INTO usage_tracking (user_id) VALUES (p_user_id);
    SELECT * INTO v_usage FROM usage_tracking WHERE user_id = p_user_id;
  END IF;

  -- Check limits based on type
  CASE p_limit_type
    WHEN 'prompts' THEN
      RETURN (v_usage.prompts_used_today + p_amount) <= v_limits.max_prompts_per_day;
    WHEN 'projects' THEN
      RETURN (v_usage.projects_count + p_amount) <= v_limits.max_projects;
    WHEN 'storage' THEN
      RETURN (v_usage.storage_used_mb + p_amount) <= v_limits.max_storage_mb;
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function: Increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_usage_type VARCHAR, -- 'prompts', 'projects', 'storage'
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  v_usage RECORD;
BEGIN
  -- Get current usage
  SELECT * INTO v_usage FROM usage_tracking WHERE user_id = p_user_id;

  -- Create if doesn't exist
  IF v_usage IS NULL THEN
    INSERT INTO usage_tracking (user_id) VALUES (p_user_id);
  END IF;

  -- Reset daily counter if needed
  IF v_usage.last_daily_reset < NOW() - INTERVAL '1 day' THEN
    UPDATE usage_tracking
    SET prompts_used_today = 0,
        last_daily_reset = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Reset monthly counter if needed
  IF v_usage.last_monthly_reset < NOW() - INTERVAL '1 month' THEN
    UPDATE usage_tracking
    SET prompts_used_this_month = 0,
        last_monthly_reset = NOW()
    WHERE user_id = p_user_id;
  END IF;

  -- Increment appropriate counter
  CASE p_usage_type
    WHEN 'prompts' THEN
      UPDATE usage_tracking
      SET prompts_used_today = prompts_used_today + p_amount,
          prompts_used_this_month = prompts_used_this_month + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'projects' THEN
      UPDATE usage_tracking
      SET projects_count = projects_count + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    WHEN 'storage' THEN
      UPDATE usage_tracking
      SET storage_used_mb = storage_used_mb + p_amount,
          updated_at = NOW()
      WHERE user_id = p_user_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: Public read
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (active = true);

-- User Subscriptions: Users can only see their own
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment Transactions: Users can only see their own
CREATE POLICY "Users can view own transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage Tracking: Users can only see their own
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE subscription_plans IS 'Available subscription plans with pricing and limits';
COMMENT ON TABLE user_subscriptions IS 'User subscription records with billing cycle and card tokens';
COMMENT ON TABLE payment_transactions IS 'All payment transactions from UPayments';
COMMENT ON TABLE usage_tracking IS 'Real-time usage tracking for enforcing plan limits';
COMMENT ON FUNCTION get_user_plan_limits IS 'Returns the plan limits for a given user';
COMMENT ON FUNCTION check_user_limit IS 'Checks if user can perform action within their plan limits';
COMMENT ON FUNCTION increment_usage IS 'Increments usage counter for prompts, projects, or storage';
