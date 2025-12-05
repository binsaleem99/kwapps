-- ============================================
-- KW APPS Credit-Based Billing System Migration (SAFE VERSION)
-- ============================================
-- Created: 2025-12-04
-- Purpose: Implement credit system with tiers, transactions, and daily bonuses
-- NO FREE TIER - All users must subscribe
-- Trial: 1 KWD/week for Basic tier only

-- ============================================
-- BACKUP EXISTING TABLE
-- ============================================
-- Rename existing user_subscriptions table to preserve data
ALTER TABLE IF EXISTS user_subscriptions RENAME TO user_subscriptions_old_backup;

-- ============================================
-- 1. SUBSCRIPTION TIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'basic', 'pro', 'premium', 'enterprise'
  display_name_ar TEXT NOT NULL, -- Arabic display name
  display_name_en TEXT NOT NULL, -- English display name
  price_kwd DECIMAL(10, 2) NOT NULL, -- Monthly price in Kuwaiti Dinar
  credits_per_month INTEGER NOT NULL, -- Base credits allocated per month
  daily_bonus_credits INTEGER NOT NULL, -- Bonus credits given daily
  features JSONB NOT NULL DEFAULT '[]', -- Array of feature slugs
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined tiers
INSERT INTO subscription_tiers (name, display_name_ar, display_name_en, price_kwd, credits_per_month, daily_bonus_credits, sort_order) VALUES
('basic', 'أساسي', 'Basic', 23.00, 100, 5, 1),
('pro', 'احترافي', 'Pro', 38.00, 200, 8, 2),
('premium', 'مميز', 'Premium', 59.00, 350, 12, 3),
('enterprise', 'مؤسسي', 'Enterprise', 75.00, 500, 15, 4)
ON CONFLICT (name) DO NOTHING;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_name ON subscription_tiers(name);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active ON subscription_tiers(is_active);

-- ============================================
-- 2. USER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'trial'
  is_trial BOOLEAN NOT NULL DEFAULT false,
  trial_ends_at TIMESTAMP WITH TIME ZONE, -- Only for trial subscriptions

  -- Billing cycle
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Credits
  credits_balance INTEGER NOT NULL DEFAULT 0, -- Current available credits
  credits_allocated_this_period INTEGER NOT NULL DEFAULT 0, -- Base credits for current period
  credits_bonus_earned INTEGER NOT NULL DEFAULT 0, -- Total bonus credits earned this period
  credits_rollover INTEGER NOT NULL DEFAULT 0, -- Credits carried over from previous period

  -- Payment
  last_payment_amount DECIMAL(10, 2),
  last_payment_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- 'upayments', 'stripe', etc.
  payment_provider_subscription_id TEXT, -- External subscription ID

  -- Metadata
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  CONSTRAINT trial_requires_end_date CHECK (
    (is_trial = false) OR (is_trial = true AND trial_ends_at IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier_id ON user_subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- Partial unique index to ensure one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_subscription_per_user ON user_subscriptions(user_id) WHERE status = 'active';

-- ============================================
-- 3. CREDIT OPERATIONS TABLE (Operation Costs)
-- ============================================
CREATE TABLE IF NOT EXISTS credit_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL UNIQUE, -- 'chat', 'simple_edit', 'component', 'page', etc.
  display_name_ar TEXT NOT NULL,
  display_name_en TEXT NOT NULL,
  credit_cost DECIMAL(10, 2) NOT NULL, -- Can be fractional (e.g., 0.5)
  description_ar TEXT,
  description_en TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined operation costs
INSERT INTO credit_operations (operation_type, display_name_ar, display_name_en, credit_cost) VALUES
('chat', 'محادثة', 'Chat Message', 1.0),
('simple_edit', 'تعديل بسيط', 'Simple Edit', 0.5),
('component', 'مكون', 'Component Generation', 2.0),
('page', 'صفحة', 'Page Generation', 3.0),
('complex', 'معقد', 'Complex Operation', 4.0),
('banana_image', 'صورة AI', 'AI Image Generation', 2.5),
('deploy', 'نشر', 'Deployment', 1.0)
ON CONFLICT (operation_type) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_credit_operations_type ON credit_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_credit_operations_active ON credit_operations(is_active);

-- ============================================
-- 4. CREDIT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,

  -- Transaction details
  transaction_type TEXT NOT NULL, -- 'debit', 'credit', 'bonus', 'rollover', 'refund'
  amount DECIMAL(10, 2) NOT NULL, -- Positive for credit, negative for debit
  balance_after DECIMAL(10, 2) NOT NULL, -- Balance after transaction

  -- Operation tracking (for debits)
  operation_type TEXT REFERENCES credit_operations(operation_type),
  operation_metadata JSONB, -- Additional context (project_id, request details, etc.)

  -- Bonus tracking (for bonus credits)
  bonus_date DATE, -- Date bonus was awarded (for daily bonuses)

  -- Description
  description_ar TEXT,
  description_en TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('debit', 'credit', 'bonus', 'rollover', 'refund', 'allocation')),
  CONSTRAINT debit_requires_operation CHECK (
    (transaction_type != 'debit') OR (operation_type IS NOT NULL)
  )
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_subscription_id ON credit_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_bonus_date ON credit_transactions(bonus_date) WHERE transaction_type = 'bonus';

-- ============================================
-- 5. DAILY BONUS TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_bonus_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  bonus_date DATE NOT NULL,
  bonus_amount INTEGER NOT NULL,
  transaction_id UUID REFERENCES credit_transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One bonus per user per day
  CONSTRAINT one_bonus_per_day_per_user UNIQUE (user_id, bonus_date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_daily_bonus_log_user_date ON daily_bonus_log(user_id, bonus_date);
CREATE INDEX IF NOT EXISTS idx_daily_bonus_log_subscription ON daily_bonus_log(subscription_id);

-- ============================================
-- 6. TRIAL SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trial_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,

  -- Trial details (1 KWD/week for Basic tier only)
  trial_price_kwd DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  trial_duration_days INTEGER NOT NULL DEFAULT 7,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  payment_transaction_id TEXT, -- UPayments/Stripe transaction ID
  payment_date TIMESTAMP WITH TIME ZONE,

  -- Conversion tracking
  converted_to_paid BOOLEAN NOT NULL DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One trial per user (enforce in application logic or trigger)
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trial_subscriptions_user_id ON trial_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_subscriptions_ends_at ON trial_subscriptions(ends_at);
CREATE INDEX IF NOT EXISTS idx_trial_subscriptions_payment_status ON trial_subscriptions(payment_status);

-- ============================================
-- 7. UPDATE TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_tiers_updated_at ON subscription_tiers;
CREATE TRIGGER update_subscription_tiers_updated_at
  BEFORE UPDATE ON subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_operations_updated_at ON credit_operations;
CREATE TRIGGER update_credit_operations_updated_at
  BEFORE UPDATE ON credit_operations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bonus_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view subscription tiers" ON subscription_tiers;
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Anyone can view credit operations" ON credit_operations;
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can view own bonus log" ON daily_bonus_log;
DROP POLICY IF EXISTS "Users can view own trial" ON trial_subscriptions;

-- Policies for subscription_tiers (read-only for all authenticated users)
CREATE POLICY "Anyone can view subscription tiers"
  ON subscription_tiers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for user_subscriptions (users can only see their own)
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for credit_operations (read-only for all authenticated users)
CREATE POLICY "Anyone can view credit operations"
  ON credit_operations FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for credit_transactions (users can only see their own)
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for daily_bonus_log (users can only see their own)
CREATE POLICY "Users can view own bonus log"
  ON daily_bonus_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for trial_subscriptions (users can only see their own)
CREATE POLICY "Users can view own trial"
  ON trial_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 9. HELPER VIEWS
-- ============================================

-- Drop view if exists
DROP VIEW IF EXISTS user_credit_summary;

-- View for user credit summary
CREATE VIEW user_credit_summary AS
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

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

COMMENT ON TABLE subscription_tiers IS 'Subscription tier definitions (Basic, Pro, Premium, Enterprise)';
COMMENT ON TABLE user_subscriptions IS 'User subscription records with credit tracking';
COMMENT ON TABLE credit_operations IS 'Operation types and their credit costs';
COMMENT ON TABLE credit_transactions IS 'All credit transactions (debits, credits, bonuses, rollovers)';
COMMENT ON TABLE daily_bonus_log IS 'Daily bonus credit tracking to prevent duplicates';
COMMENT ON TABLE trial_subscriptions IS 'Trial subscription tracking (1 KWD/week for Basic only)';
