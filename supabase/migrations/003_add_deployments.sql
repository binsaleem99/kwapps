-- Migration: Add Deployments Table for User Website Deployment
-- Purpose: Track user deployments to Vercel with subdomain management
-- Created: 2025-11-28

-- ============================================================================
-- DEPLOYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Deployment Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Initial state
    'building',     -- Generating HTML
    'deploying',    -- Deploying to Vercel
    'ready',        -- Live and accessible
    'failed'        -- Deployment failed
  )),

  -- Domain Configuration
  subdomain TEXT NOT NULL UNIQUE,
  deployed_url TEXT,

  -- Vercel Integration
  vercel_deployment_id TEXT,
  vercel_project_id TEXT,

  -- Logs and Debugging
  build_logs TEXT,
  error_message TEXT,

  -- Timestamps
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_deployments_user ON deployments(user_id);
CREATE INDEX idx_deployments_project ON deployments(project_id);
CREATE INDEX idx_deployments_subdomain ON deployments(subdomain);
CREATE INDEX idx_deployments_status ON deployments(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- Users can view their own deployments
CREATE POLICY "Users can view own deployments"
  ON deployments FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own deployments
CREATE POLICY "Users can create own deployments"
  ON deployments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own deployments
CREATE POLICY "Users can update own deployments"
  ON deployments FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own deployments
CREATE POLICY "Users can delete own deployments"
  ON deployments FOR DELETE
  USING (user_id = auth.uid());

-- Admins can view all deployments
CREATE POLICY "Admins can view all deployments"
  ON deployments FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_deployments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deployments_timestamp
  BEFORE UPDATE ON deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_deployments_updated_at();

-- ============================================================================
-- HELPER FUNCTION: Get deployment stats for user
-- ============================================================================

CREATE OR REPLACE FUNCTION get_deployment_stats(p_user_id UUID)
RETURNS TABLE (
  total_deployments BIGINT,
  active_deployments BIGINT,
  failed_deployments BIGINT,
  total_bandwidth_estimate BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_deployments,
    COUNT(*) FILTER (WHERE status = 'ready')::BIGINT as active_deployments,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_deployments,
    0::BIGINT as total_bandwidth_estimate  -- Placeholder for future analytics
  FROM deployments
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE deployments IS 'Tracks user website deployments to Vercel';
COMMENT ON COLUMN deployments.subdomain IS 'Unique subdomain under kwapps.com (e.g., my-restaurant)';
COMMENT ON COLUMN deployments.deployed_url IS 'Full production URL (e.g., https://my-restaurant.kwapps.com)';
COMMENT ON COLUMN deployments.vercel_deployment_id IS 'Vercel deployment ID for status tracking';
COMMENT ON COLUMN deployments.status IS 'Current deployment status: pending, building, deploying, ready, failed';
