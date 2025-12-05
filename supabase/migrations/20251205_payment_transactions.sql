-- ============================================
-- KW APPS Payment Transactions Table
-- ============================================
-- Created: 2025-12-05
-- Purpose: Track UPayments transactions for the credit-based billing system
-- Integrates with subscription_tiers, user_subscriptions, trial_subscriptions

-- ============================================
-- 1. PAYMENT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link to subscription (once created)
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  trial_id UUID REFERENCES trial_subscriptions(id) ON DELETE SET NULL,

  -- UPayments IDs
  upayments_order_id TEXT NOT NULL UNIQUE, -- Our generated order ID
  upayments_track_id TEXT,                  -- UPayments tracking ID
  upayments_payment_id TEXT,                -- UPayments payment ID
  upayments_transaction_id TEXT,            -- UPayments transaction ID (from webhook)

  -- Transaction details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KWD',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'canceled', 'refunded'
  payment_method TEXT,                     -- 'knet', 'cc', 'apple-pay', etc.

  -- Transaction type
  transaction_type TEXT NOT NULL, -- 'subscription', 'trial', 'renewal', 'upgrade'

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}', -- tier_id, tier_name, save_card, etc.

  -- Card info (for recurring)
  card_token TEXT,
  card_last_four TEXT,
  card_type TEXT,

  -- Webhook data
  webhook_received_at TIMESTAMP WITH TIME ZONE,
  webhook_data JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'success', 'failed', 'canceled', 'refunded')),
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('subscription', 'trial', 'renewal', 'upgrade'))
);

-- Indexes
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(upayments_order_id);
CREATE INDEX idx_payment_transactions_track_id ON payment_transactions(upayments_track_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert/update (for webhook processing)
CREATE POLICY "Service role can manage payment transactions"
  ON payment_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update trigger
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. ADD FAILED PAYMENT TRACKING TO USER_SUBSCRIPTIONS
-- ============================================
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS failed_payment_attempts INTEGER DEFAULT 0;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
COMMENT ON TABLE payment_transactions IS 'UPayments transaction records for subscriptions and trials';
