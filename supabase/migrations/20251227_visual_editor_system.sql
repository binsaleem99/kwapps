-- ============================================
-- VISUAL EDITOR SYSTEM
-- Chat-based visual editing in Arabic
-- DOM analysis (Gemini) + Code modification (DeepSeek)
-- Created: 2025-12-27
-- ============================================

-- ============================================
-- VISUAL EDITOR SESSIONS TABLE
-- Active editing sessions
-- ============================================

CREATE TABLE IF NOT EXISTS visual_editor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session state
  current_code TEXT, -- Latest code snapshot
  initial_code TEXT, -- Code at session start

  -- Credits tracking
  total_credits_used INTEGER DEFAULT 0,
  changes_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_visual_editor_sessions_project ON visual_editor_sessions(project_id);
CREATE INDEX idx_visual_editor_sessions_user ON visual_editor_sessions(user_id);
CREATE INDEX idx_visual_editor_sessions_active ON visual_editor_sessions(is_active, last_active_at DESC);

-- RLS
ALTER TABLE visual_editor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own editor sessions"
  ON visual_editor_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create editor sessions"
  ON visual_editor_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON visual_editor_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions"
  ON visual_editor_sessions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- EDITOR MESSAGES TABLE
-- Chat conversation in visual editor
-- ============================================

CREATE TABLE IF NOT EXISTS editor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES visual_editor_sessions(id) ON DELETE CASCADE,

  -- Message details
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Change tracking
  change_type VARCHAR(50), -- 'text_edit', 'color_change', 'add_element', etc.
  target_element VARCHAR(200), -- CSS selector or element path
  credits_used INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  -- Example: {elementPath: 'header > h1', changeDescription: 'Changed color to blue'}

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_editor_messages_session ON editor_messages(session_id);
CREATE INDEX idx_editor_messages_created ON editor_messages(created_at);
CREATE INDEX idx_editor_messages_role ON editor_messages(role);

-- RLS
ALTER TABLE editor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their sessions"
  ON editor_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM visual_editor_sessions
      WHERE visual_editor_sessions.id = editor_messages.session_id
        AND visual_editor_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their sessions"
  ON editor_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visual_editor_sessions
      WHERE visual_editor_sessions.id = editor_messages.session_id
        AND visual_editor_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all messages"
  ON editor_messages FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- CODE SNAPSHOTS TABLE
-- Undo/Redo functionality (50-step history)
-- ============================================

CREATE TABLE IF NOT EXISTS code_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES visual_editor_sessions(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Snapshot data
  snapshot_index INTEGER NOT NULL, -- 0 to 49 (circular buffer)
  code TEXT NOT NULL,

  -- Change description
  change_type VARCHAR(50),
  description_ar TEXT,
  description_en TEXT,

  -- Credits
  credits_used INTEGER DEFAULT 0,

  -- Metadata
  files_changed JSONB DEFAULT '[]', -- [{path: 'App.tsx', linesChanged: 5}]

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One snapshot per index per session
  UNIQUE(session_id, snapshot_index)
);

-- Indexes
CREATE INDEX idx_code_snapshots_session ON code_snapshots(session_id, snapshot_index);
CREATE INDEX idx_code_snapshots_project ON code_snapshots(project_id);
CREATE INDEX idx_code_snapshots_created ON code_snapshots(created_at DESC);

-- RLS
ALTER TABLE code_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view snapshots in their sessions"
  ON code_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM visual_editor_sessions
      WHERE visual_editor_sessions.id = code_snapshots.session_id
        AND visual_editor_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create snapshots in their sessions"
  ON code_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM visual_editor_sessions
      WHERE visual_editor_sessions.id = code_snapshots.session_id
        AND visual_editor_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all snapshots"
  ON code_snapshots FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- ELEMENT SELECTIONS TABLE
-- Track which elements users interact with
-- ============================================

CREATE TABLE IF NOT EXISTS element_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES visual_editor_sessions(id) ON DELETE CASCADE,

  -- Element details
  element_path TEXT NOT NULL, -- CSS selector
  element_type TEXT, -- 'heading', 'button', 'image', etc.
  element_content TEXT,

  -- Selection metadata
  selected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_element_selections_session ON element_selections(session_id);
CREATE INDEX idx_element_selections_created ON element_selections(selected_at DESC);

-- RLS
ALTER TABLE element_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage selections in their sessions"
  ON element_selections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM visual_editor_sessions
      WHERE visual_editor_sessions.id = element_selections.session_id
        AND visual_editor_sessions.user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Update session last_active_at on message
CREATE OR REPLACE FUNCTION update_session_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE visual_editor_sessions
  SET last_active_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER editor_messages_update_session_activity
  AFTER INSERT ON editor_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_last_active();

-- Update session totals on message
CREATE OR REPLACE FUNCTION update_session_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE visual_editor_sessions
  SET
    total_credits_used = total_credits_used + NEW.credits_used,
    changes_count = changes_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER editor_messages_update_totals
  AFTER INSERT ON editor_messages
  FOR EACH ROW
  WHEN (NEW.role = 'assistant' AND NEW.credits_used > 0)
  EXECUTE FUNCTION update_session_totals();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get latest snapshot for session
CREATE OR REPLACE FUNCTION get_latest_snapshot(p_session_id UUID)
RETURNS TABLE (
  code TEXT,
  description_ar TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.code,
    cs.description_ar,
    cs.created_at
  FROM code_snapshots cs
  WHERE cs.session_id = p_session_id
  ORDER BY cs.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get undo/redo history
CREATE OR REPLACE FUNCTION get_snapshot_history(p_session_id UUID)
RETURNS TABLE (
  snapshot_index INTEGER,
  description_ar TEXT,
  credits_used INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.snapshot_index,
    cs.description_ar,
    cs.credits_used,
    cs.created_at
  FROM code_snapshots cs
  WHERE cs.session_id = p_session_id
  ORDER BY cs.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Editor usage statistics
CREATE OR REPLACE VIEW visual_editor_stats AS
SELECT
  DATE(ves.started_at) AS date,
  COUNT(DISTINCT ves.id) AS total_sessions,
  COUNT(DISTINCT ves.user_id) AS unique_users,
  SUM(ves.changes_count) AS total_changes,
  SUM(ves.total_credits_used) AS total_credits,
  AVG(ves.changes_count) AS avg_changes_per_session,
  AVG(ves.total_credits_used) AS avg_credits_per_session
FROM visual_editor_sessions ves
GROUP BY DATE(ves.started_at)
ORDER BY date DESC;

-- Popular change types
CREATE OR REPLACE VIEW popular_change_types AS
SELECT
  em.change_type,
  COUNT(*) AS usage_count,
  AVG(em.credits_used) AS avg_credits,
  SUM(em.credits_used) AS total_credits
FROM editor_messages em
WHERE em.change_type IS NOT NULL
  AND em.role = 'assistant'
GROUP BY em.change_type
ORDER BY usage_count DESC;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE visual_editor_sessions IS 'Active visual editing sessions with code state';
COMMENT ON TABLE editor_messages IS 'Chat conversation in visual editor with change tracking';
COMMENT ON TABLE code_snapshots IS 'Code snapshots for undo/redo (50-step circular buffer)';
COMMENT ON TABLE element_selections IS 'Track which elements users interact with for analytics';
COMMENT ON VIEW visual_editor_stats IS 'Daily usage statistics for visual editor';
COMMENT ON VIEW popular_change_types IS 'Most common types of edits users make';

-- ============================================
-- END OF MIGRATION
-- ============================================
