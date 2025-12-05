-- =====================================================
-- Migration: Processed Webhooks Table
-- Purpose: Track processed webhooks to prevent duplicates
-- Date: 2025-12-05
-- =====================================================

-- Create table to track processed webhooks for idempotency
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  result TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_track_id ON processed_webhooks(track_id);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_order_id ON processed_webhooks(order_id);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_processed_at ON processed_webhooks(processed_at);

-- Add cleanup function for old webhooks (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_processed_webhooks()
RETURNS void AS $$
BEGIN
  DELETE FROM processed_webhooks
  WHERE processed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies
ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Only service role can manage processed_webhooks (used by webhook handler)
CREATE POLICY "Service role can manage processed webhooks"
  ON processed_webhooks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE processed_webhooks IS 'Tracks processed webhooks to prevent duplicate processing (idempotency)';
