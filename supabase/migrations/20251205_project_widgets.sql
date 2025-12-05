-- =====================================================
-- Project Widgets Migration
-- KWq8.com Widget Integration System
-- =====================================================
--
-- This migration creates the project_widgets table for
-- storing widget configurations (WhatsApp, Telegram, etc.)
-- that are embedded in client websites.
-- =====================================================

-- Create widget type enum
DO $$ BEGIN
    CREATE TYPE widget_type AS ENUM (
        'whatsapp',
        'telegram',
        'instagram',
        'facebook_messenger',
        'custom_chat',
        'callback_request'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create widget position enum
DO $$ BEGIN
    CREATE TYPE widget_position AS ENUM (
        'bottom-right',
        'bottom-left',
        'top-right',
        'top-left'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- Project Widgets Table
-- =====================================================

CREATE TABLE IF NOT EXISTS project_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationship to project
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Widget type
    widget_type widget_type NOT NULL,

    -- Configuration JSON
    -- Contains type-specific settings:
    -- WhatsApp: { phoneNumber, welcomeMessage, buttonText, style, ... }
    -- Telegram: { username, welcomeMessage, buttonText, style, ... }
    -- Instagram: { username, buttonText, style, ... }
    -- etc.
    config JSONB NOT NULL DEFAULT '{}',

    -- Position on screen
    position widget_position NOT NULL DEFAULT 'bottom-right',

    -- Is widget active/visible
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Generated snippet (cached for performance)
    generated_snippet TEXT,
    generated_minified TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_project_widgets_project_id
    ON project_widgets(project_id);

CREATE INDEX IF NOT EXISTS idx_project_widgets_type
    ON project_widgets(widget_type);

CREATE INDEX IF NOT EXISTS idx_project_widgets_active
    ON project_widgets(project_id, is_active)
    WHERE is_active = true;

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE project_widgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view widgets for their own projects
CREATE POLICY "Users can view their project widgets"
    ON project_widgets
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert widgets for their own projects
CREATE POLICY "Users can create widgets for their projects"
    ON project_widgets
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update widgets for their own projects
CREATE POLICY "Users can update their project widgets"
    ON project_widgets
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete widgets for their own projects
CREATE POLICY "Users can delete their project widgets"
    ON project_widgets
    FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- Callback Requests Table (for callback_request widget)
-- =====================================================

CREATE TABLE IF NOT EXISTS callback_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relationship to project (optional, for tracking)
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Widget ID that generated this request
    widget_id UUID REFERENCES project_widgets(id) ON DELETE SET NULL,

    -- Contact information
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,

    -- Request status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),

    -- Tracking
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,

    -- Notes from staff
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    contacted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_callback_requests_project_id
    ON callback_requests(project_id);

CREATE INDEX IF NOT EXISTS idx_callback_requests_status
    ON callback_requests(status);

CREATE INDEX IF NOT EXISTS idx_callback_requests_created_at
    ON callback_requests(created_at DESC);

-- Row Level Security for callback_requests
ALTER TABLE callback_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view callback requests for their projects
CREATE POLICY "Users can view their callback requests"
    ON callback_requests
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy: Anyone can create callback requests (public form)
CREATE POLICY "Anyone can create callback requests"
    ON callback_requests
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can update callback requests for their projects
CREATE POLICY "Users can update their callback requests"
    ON callback_requests
    FOR UPDATE
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- Widget Analytics Table
-- =====================================================

CREATE TABLE IF NOT EXISTS widget_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Widget reference
    widget_id UUID NOT NULL REFERENCES project_widgets(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Event type
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'open', 'submit', 'close')),

    -- Additional data
    event_data JSONB DEFAULT '{}',

    -- Tracking
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,

    -- Location (derived from IP)
    country TEXT,
    city TEXT,

    -- Device info
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser TEXT,
    os TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_widget_analytics_widget_id
    ON widget_analytics(widget_id);

CREATE INDEX IF NOT EXISTS idx_widget_analytics_project_id
    ON widget_analytics(project_id);

CREATE INDEX IF NOT EXISTS idx_widget_analytics_event_type
    ON widget_analytics(event_type);

CREATE INDEX IF NOT EXISTS idx_widget_analytics_created_at
    ON widget_analytics(created_at DESC);

-- Composite index for daily stats
CREATE INDEX IF NOT EXISTS idx_widget_analytics_daily
    ON widget_analytics(widget_id, event_type, created_at);

-- Row Level Security for widget_analytics
ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view analytics for their projects
CREATE POLICY "Users can view their widget analytics"
    ON widget_analytics
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

-- Policy: Anyone can insert analytics events (tracking)
CREATE POLICY "Anyone can create widget analytics"
    ON widget_analytics
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- Trigger: Auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_widget_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_widget_updated_at ON project_widgets;
CREATE TRIGGER trigger_update_widget_updated_at
    BEFORE UPDATE ON project_widgets
    FOR EACH ROW
    EXECUTE FUNCTION update_widget_updated_at();

-- =====================================================
-- Helpful Views
-- =====================================================

-- View: Widget statistics per project
CREATE OR REPLACE VIEW widget_stats AS
SELECT
    pw.project_id,
    pw.id AS widget_id,
    pw.widget_type,
    pw.is_active,
    COUNT(wa.id) FILTER (WHERE wa.event_type = 'view') AS total_views,
    COUNT(wa.id) FILTER (WHERE wa.event_type = 'click') AS total_clicks,
    COUNT(wa.id) FILTER (WHERE wa.event_type = 'submit') AS total_submissions,
    ROUND(
        CASE
            WHEN COUNT(wa.id) FILTER (WHERE wa.event_type = 'view') > 0
            THEN (COUNT(wa.id) FILTER (WHERE wa.event_type = 'click')::NUMERIC /
                  COUNT(wa.id) FILTER (WHERE wa.event_type = 'view')::NUMERIC) * 100
            ELSE 0
        END, 2
    ) AS click_rate,
    MAX(wa.created_at) AS last_interaction
FROM project_widgets pw
LEFT JOIN widget_analytics wa ON wa.widget_id = pw.id
GROUP BY pw.project_id, pw.id, pw.widget_type, pw.is_active;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE project_widgets IS 'Widget configurations for client websites (WhatsApp, Telegram, etc.)';
COMMENT ON TABLE callback_requests IS 'Callback request submissions from callback_request widgets';
COMMENT ON TABLE widget_analytics IS 'Analytics events for widget interactions';
COMMENT ON VIEW widget_stats IS 'Aggregated widget statistics per project';

COMMENT ON COLUMN project_widgets.config IS 'JSON configuration specific to widget type';
COMMENT ON COLUMN project_widgets.generated_snippet IS 'Cached HTML/CSS/JS snippet for embedding';
COMMENT ON COLUMN project_widgets.generated_minified IS 'Cached minified version of snippet';
