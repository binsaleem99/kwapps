-- =====================================================
-- Domain Purchases Migration
-- KWq8.com Domain Management System
-- =====================================================
-- Pricing Rules:
--   Domains ≤$15 = FREE (1 year + SSL) for Pro/Enterprise
--   Domains >$15 = Cost + 20% markup
-- =====================================================

-- Domain purchases table
CREATE TABLE IF NOT EXISTS domain_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Domain info
  domain TEXT NOT NULL,
  tld TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_payment', 'active', 'expired', 'cancelled', 'transferred')),

  -- Pricing
  purchase_price_kwd DECIMAL(10, 3) NOT NULL DEFAULT 0,
  namecheap_cost_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,

  -- Namecheap info
  namecheap_order_id TEXT,
  namecheap_domain_id TEXT,

  -- Dates
  registered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Settings
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  ssl_enabled BOOLEAN NOT NULL DEFAULT true,
  nameservers TEXT[] DEFAULT ARRAY['dns1.vercel-dns.com', 'dns2.vercel-dns.com'],

  -- WHOIS privacy
  whois_privacy BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique domain
  CONSTRAINT unique_domain UNIQUE (domain)
);

-- Domain renewals history
CREATE TABLE IF NOT EXISTS domain_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_purchase_id UUID NOT NULL REFERENCES domain_purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Renewal info
  years INTEGER NOT NULL DEFAULT 1,
  price_kwd DECIMAL(10, 3) NOT NULL,
  namecheap_cost_usd DECIMAL(10, 2) NOT NULL,

  -- Payment
  payment_id UUID REFERENCES payment_transactions(id),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Dates
  renewed_at TIMESTAMPTZ,
  previous_expiry TIMESTAMPTZ,
  new_expiry TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DNS records for custom configurations
CREATE TABLE IF NOT EXISTS domain_dns_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_purchase_id UUID NOT NULL REFERENCES domain_purchases(id) ON DELETE CASCADE,

  -- Record info
  record_type TEXT NOT NULL CHECK (record_type IN ('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV')),
  host TEXT NOT NULL DEFAULT '@',
  value TEXT NOT NULL,
  ttl INTEGER NOT NULL DEFAULT 3600,
  priority INTEGER, -- For MX records

  -- Sync status with Namecheap
  synced BOOLEAN NOT NULL DEFAULT false,
  synced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_domain_purchases_user ON domain_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_purchases_project ON domain_purchases(project_id);
CREATE INDEX IF NOT EXISTS idx_domain_purchases_domain ON domain_purchases(domain);
CREATE INDEX IF NOT EXISTS idx_domain_purchases_status ON domain_purchases(status);
CREATE INDEX IF NOT EXISTS idx_domain_purchases_expires ON domain_purchases(expires_at);
CREATE INDEX IF NOT EXISTS idx_domain_renewals_purchase ON domain_renewals(domain_purchase_id);
CREATE INDEX IF NOT EXISTS idx_domain_dns_purchase ON domain_dns_records(domain_purchase_id);

-- RLS Policies
ALTER TABLE domain_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_dns_records ENABLE ROW LEVEL SECURITY;

-- Users can only see their own domains
CREATE POLICY "Users view own domains" ON domain_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own domains" ON domain_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own domains" ON domain_purchases
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own renewals
CREATE POLICY "Users view own renewals" ON domain_renewals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own renewals" ON domain_renewals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can manage DNS for their domains
CREATE POLICY "Users view own DNS" ON domain_dns_records
  FOR SELECT USING (
    domain_purchase_id IN (
      SELECT id FROM domain_purchases WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own DNS" ON domain_dns_records
  FOR ALL USING (
    domain_purchase_id IN (
      SELECT id FROM domain_purchases WHERE user_id = auth.uid()
    )
  );

-- Admin policies
CREATE POLICY "Admins manage all domains" ON domain_purchases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins manage all renewals" ON domain_renewals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins manage all DNS" ON domain_dns_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_domain_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_domain_purchases_updated
  BEFORE UPDATE ON domain_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_domain_updated_at();

CREATE TRIGGER trigger_domain_dns_updated
  BEFORE UPDATE ON domain_dns_records
  FOR EACH ROW
  EXECUTE FUNCTION update_domain_updated_at();

-- Function to check free domain eligibility
CREATE OR REPLACE FUNCTION check_free_domain_eligibility(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_free_domain_used BOOLEAN;
BEGIN
  -- Get user plan
  SELECT plan INTO v_plan FROM users WHERE id = p_user_id;

  -- Only pro, premium, enterprise get free domains
  IF v_plan NOT IN ('pro', 'premium', 'enterprise') THEN
    RETURN false;
  END IF;

  -- Check if already used free domain this year
  SELECT EXISTS (
    SELECT 1 FROM domain_purchases
    WHERE user_id = p_user_id
      AND is_free = true
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
  ) INTO v_free_domain_used;

  RETURN NOT v_free_domain_used;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get domain expiry warnings
CREATE OR REPLACE FUNCTION get_expiring_domains(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  domain TEXT,
  user_id UUID,
  expires_at TIMESTAMPTZ,
  days_until_expiry INTEGER,
  auto_renew BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.domain,
    dp.user_id,
    dp.expires_at,
    EXTRACT(DAY FROM dp.expires_at - NOW())::INTEGER as days_until_expiry,
    dp.auto_renew
  FROM domain_purchases dp
  WHERE dp.status = 'active'
    AND dp.expires_at <= NOW() + (days_ahead || ' days')::INTERVAL
    AND dp.expires_at > NOW()
  ORDER BY dp.expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE domain_purchases IS 'Domain registrations via Namecheap API';
COMMENT ON TABLE domain_renewals IS 'Domain renewal history and payments';
COMMENT ON TABLE domain_dns_records IS 'Custom DNS records for domains';
COMMENT ON COLUMN domain_purchases.is_free IS 'True if domain was free (≤$15 for Pro+ users)';
COMMENT ON COLUMN domain_purchases.namecheap_cost_usd IS 'What we paid Namecheap in USD';
COMMENT ON COLUMN domain_purchases.purchase_price_kwd IS 'What user paid in KWD (0 if free)';
