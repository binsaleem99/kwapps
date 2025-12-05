-- ==============================================
-- KW APPS - Orchestration Sessions Migration
-- ==============================================
-- Moves orchestration sessions from in-memory Map to Supabase
-- Prevents session loss on Vercel deployments
-- ==============================================

-- Create orchestration_sessions table
CREATE TABLE IF NOT EXISTS orchestration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Session state (stores the full OrchestrationState)
  stage TEXT NOT NULL DEFAULT 'detection' CHECK (stage IN ('detection', 'clarifying', 'constructing', 'generating', 'validating', 'completed', 'failed')),

  -- Store complex state as JSONB
  detected_params JSONB DEFAULT NULL,
  clarifying_questions JSONB DEFAULT '[]',
  answers JSONB DEFAULT '{}',
  deepseek_prompt JSONB DEFAULT NULL,
  validation_result JSONB DEFAULT NULL,
  error JSONB DEFAULT NULL,

  -- Original prompt for context recovery
  original_prompt TEXT,

  -- Conversation messages for full context
  messages JSONB DEFAULT '[]',

  -- Additional context
  context JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  -- Auto-expiry (24 hours default)
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_user_id ON orchestration_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_project_id ON orchestration_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_expires_at ON orchestration_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_stage ON orchestration_sessions(stage);
CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_last_activity ON orchestration_sessions(last_activity_at DESC);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_user_project
ON orchestration_sessions(user_id, project_id, expires_at DESC);

-- ==============================================
-- Row Level Security
-- ==============================================

ALTER TABLE orchestration_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions"
ON orchestration_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
ON orchestration_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON orchestration_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON orchestration_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Service role can manage all sessions (for cleanup)
CREATE POLICY "Service role full access"
ON orchestration_sessions FOR ALL
TO service_role
USING (true);

-- ==============================================
-- Auto-update timestamp trigger
-- ==============================================

CREATE OR REPLACE FUNCTION update_orchestration_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orchestration_sessions_update_timestamp ON orchestration_sessions;
CREATE TRIGGER orchestration_sessions_update_timestamp
  BEFORE UPDATE ON orchestration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_orchestration_session_timestamp();

-- ==============================================
-- Cleanup function for expired sessions
-- ==============================================

CREATE OR REPLACE FUNCTION cleanup_expired_orchestration_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM orchestration_sessions
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- Helper function to extend session expiry
-- ==============================================

CREATE OR REPLACE FUNCTION extend_orchestration_session(
  p_session_id UUID,
  p_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN AS $$
DECLARE
  session_user_id UUID;
BEGIN
  -- Get session owner
  SELECT user_id INTO session_user_id
  FROM orchestration_sessions
  WHERE id = p_session_id;

  -- Verify ownership
  IF session_user_id IS NULL OR session_user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;

  -- Extend expiry
  UPDATE orchestration_sessions
  SET expires_at = NOW() + (p_hours || ' hours')::INTERVAL,
      last_activity_at = NOW()
  WHERE id = p_session_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- Get active session for user/project
-- ==============================================

CREATE OR REPLACE FUNCTION get_active_orchestration_session(
  p_user_id UUID,
  p_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  stage TEXT,
  detected_params JSONB,
  clarifying_questions JSONB,
  answers JSONB,
  deepseek_prompt JSONB,
  original_prompt TEXT,
  messages JSONB,
  context JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    os.id,
    os.stage,
    os.detected_params,
    os.clarifying_questions,
    os.answers,
    os.deepseek_prompt,
    os.original_prompt,
    os.messages,
    os.context,
    os.created_at,
    os.updated_at,
    os.expires_at
  FROM orchestration_sessions os
  WHERE os.user_id = p_user_id
    AND (p_project_id IS NULL OR os.project_id = p_project_id)
    AND os.expires_at > NOW()
    AND os.stage NOT IN ('completed', 'failed')
  ORDER BY os.last_activity_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- Grant permissions
-- ==============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orchestration_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_orchestration_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION extend_orchestration_session(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_orchestration_session(UUID, UUID) TO authenticated;
