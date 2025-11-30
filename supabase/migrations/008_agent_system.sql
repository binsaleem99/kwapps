-- =====================================================
-- KW APPS Multi-Agent System Database Schema
-- Migration: 008_agent_system.sql
-- Purpose: Create tables and indexes for the multi-agent orchestration system
-- =====================================================

-- Agent Sessions
-- Tracks active and completed agent collaboration sessions
CREATE TABLE agent_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('feature', 'deployment', 'qa', 'refactor', 'debug')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent Tasks
-- Individual tasks assigned to specific agents within a session
CREATE TABLE agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('chief', 'design', 'dev', 'ops', 'guard')),
  task_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'blocked', 'cancelled')),
  priority INTEGER DEFAULT 0,
  assigned_by UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  depends_on UUID[] DEFAULT '{}',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_details TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent Messages
-- Communication between agents within a session
CREATE TABLE agent_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE NOT NULL,
  from_agent TEXT NOT NULL CHECK (from_agent IN ('chief', 'design', 'dev', 'ops', 'guard', 'user', 'system')),
  to_agent TEXT CHECK (to_agent IN ('chief', 'design', 'dev', 'ops', 'guard', 'user', 'system')), -- NULL for broadcasts
  message_type TEXT NOT NULL CHECK (message_type IN ('TASK_DELEGATION', 'REQUEST_APPROVAL', 'BROADCAST_UPDATE', 'DIRECT_MESSAGE', 'STATUS_UPDATE', 'ERROR_REPORT', 'USER_MESSAGE')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent Decisions
-- Important decisions made by agents with reasoning
CREATE TABLE agent_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  decision_type TEXT NOT NULL,
  made_by TEXT NOT NULL CHECK (made_by IN ('chief', 'design', 'dev', 'ops', 'guard')),
  decision TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  alternatives_considered JSONB DEFAULT '[]',
  approved_by TEXT CHECK (approved_by IN ('chief', 'user')),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent State Snapshots
-- Periodic snapshots for rollback and debugging
CREATE TABLE agent_state_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE NOT NULL,
  state_data JSONB NOT NULL,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('checkpoint', 'rollback', 'debug', 'milestone')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent Metrics
-- Performance and usage metrics for monitoring
CREATE TABLE agent_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('chief', 'design', 'dev', 'ops', 'guard', 'system')),
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Agent Prompt Cache
-- Cache frequently used prompts for performance
CREATE TABLE agent_prompt_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT UNIQUE NOT NULL,
  prompt_content TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Agent Sessions Indexes
CREATE INDEX idx_agent_sessions_user ON agent_sessions(user_id);
CREATE INDEX idx_agent_sessions_project ON agent_sessions(project_id);
CREATE INDEX idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX idx_agent_sessions_created ON agent_sessions(created_at DESC);

-- Agent Tasks Indexes
CREATE INDEX idx_agent_tasks_session ON agent_tasks(session_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_agent_type ON agent_tasks(agent_type);
CREATE INDEX idx_agent_tasks_priority ON agent_tasks(priority DESC, created_at ASC);
CREATE INDEX idx_agent_tasks_pending ON agent_tasks(session_id, status, priority DESC) WHERE status = 'pending';

-- Agent Messages Indexes
CREATE INDEX idx_agent_messages_session ON agent_messages(session_id);
CREATE INDEX idx_agent_messages_to_agent ON agent_messages(to_agent, created_at DESC);
CREATE INDEX idx_agent_messages_unread ON agent_messages(to_agent, session_id, created_at ASC) WHERE read_at IS NULL;
CREATE INDEX idx_agent_messages_from_agent ON agent_messages(from_agent, created_at DESC);

-- Agent Decisions Indexes
CREATE INDEX idx_agent_decisions_session ON agent_decisions(session_id);
CREATE INDEX idx_agent_decisions_task ON agent_decisions(task_id);
CREATE INDEX idx_agent_decisions_made_by ON agent_decisions(made_by, created_at DESC);

-- Agent Metrics Indexes
CREATE INDEX idx_agent_metrics_session ON agent_metrics(session_id);
CREATE INDEX idx_agent_metrics_type ON agent_metrics(agent_type, metric_type, recorded_at DESC);
CREATE INDEX idx_agent_metrics_recent ON agent_metrics(recorded_at DESC);

-- Agent State Snapshots Indexes
CREATE INDEX idx_agent_snapshots_session ON agent_state_snapshots(session_id, created_at DESC);
CREATE INDEX idx_agent_snapshots_type ON agent_state_snapshots(snapshot_type, created_at DESC);

-- Agent Prompt Cache Indexes
CREATE INDEX idx_agent_cache_expires ON agent_prompt_cache(expires_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update agent_sessions.updated_at on any change
CREATE OR REPLACE FUNCTION update_agent_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_session_timestamp
  BEFORE UPDATE ON agent_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_session_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_state_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_prompt_cache ENABLE ROW LEVEL SECURITY;

-- Agent Sessions Policies
CREATE POLICY "Users can view their own agent sessions"
  ON agent_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent sessions"
  ON agent_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent sessions"
  ON agent_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Agent Tasks Policies (inherit from session)
CREATE POLICY "Users can view tasks in their sessions"
  ON agent_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_sessions
      WHERE agent_sessions.id = agent_tasks.session_id
      AND agent_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all agent tasks"
  ON agent_tasks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Agent Messages Policies (inherit from session)
CREATE POLICY "Users can view messages in their sessions"
  ON agent_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_sessions
      WHERE agent_sessions.id = agent_messages.session_id
      AND agent_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all agent messages"
  ON agent_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- Agent Decisions Policies (inherit from session)
CREATE POLICY "Users can view decisions in their sessions"
  ON agent_decisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_sessions
      WHERE agent_sessions.id = agent_decisions.session_id
      AND agent_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all agent decisions"
  ON agent_decisions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Agent State Snapshots Policies (inherit from session)
CREATE POLICY "Users can view snapshots in their sessions"
  ON agent_state_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_sessions
      WHERE agent_sessions.id = agent_state_snapshots.session_id
      AND agent_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all snapshots"
  ON agent_state_snapshots FOR ALL
  USING (true)
  WITH CHECK (true);

-- Agent Metrics Policies
CREATE POLICY "Users can view metrics for their sessions"
  ON agent_metrics FOR SELECT
  USING (
    session_id IS NULL OR
    EXISTS (
      SELECT 1 FROM agent_sessions
      WHERE agent_sessions.id = agent_metrics.session_id
      AND agent_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage all metrics"
  ON agent_metrics FOR ALL
  USING (true)
  WITH CHECK (true);

-- Agent Prompt Cache Policies (system-wide cache)
CREATE POLICY "System can manage prompt cache"
  ON agent_prompt_cache FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to clean expired prompt cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_prompt_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM agent_prompt_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get session progress
CREATE OR REPLACE FUNCTION get_session_progress(p_session_id UUID)
RETURNS TABLE (
  total_tasks INTEGER,
  completed_tasks INTEGER,
  failed_tasks INTEGER,
  in_progress_tasks INTEGER,
  pending_tasks INTEGER,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed_tasks,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER AS failed_tasks,
    COUNT(*) FILTER (WHERE status = 'in_progress')::INTEGER AS in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending_tasks,
    CASE
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
    END AS progress_percentage
  FROM agent_tasks
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE agent_sessions IS 'Tracks agent collaboration sessions for user requests';
COMMENT ON TABLE agent_tasks IS 'Individual tasks assigned to specialized agents';
COMMENT ON TABLE agent_messages IS 'Inter-agent communication messages';
COMMENT ON TABLE agent_decisions IS 'Important decisions made by agents with reasoning';
COMMENT ON TABLE agent_state_snapshots IS 'State snapshots for rollback and debugging';
COMMENT ON TABLE agent_metrics IS 'Performance and usage metrics for monitoring';
COMMENT ON TABLE agent_prompt_cache IS 'Cache for frequently used AI prompts';

COMMENT ON COLUMN agent_sessions.session_type IS 'Type: feature, deployment, qa, refactor, debug';
COMMENT ON COLUMN agent_sessions.status IS 'Status: active, paused, completed, failed, cancelled';
COMMENT ON COLUMN agent_tasks.agent_type IS 'Agent: chief, design, dev, ops, guard';
COMMENT ON COLUMN agent_tasks.depends_on IS 'Array of task IDs that must complete first';
COMMENT ON COLUMN agent_messages.to_agent IS 'NULL indicates broadcast message';
COMMENT ON COLUMN agent_decisions.approved_by IS 'NULL means decision does not require approval';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
