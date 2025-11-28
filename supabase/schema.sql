-- KW APPS - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'builder', 'pro', 'hosting_only')),
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  arabic_prompt TEXT,
  english_prompt TEXT,
  generated_code TEXT,
  template_id UUID,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'preview', 'published', 'error')),
  active_version INTEGER DEFAULT 1,
  deployed_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- MESSAGES TABLE (Chat History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own project messages" ON messages
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- ============================================================================
-- TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'ecommerce', 'restaurant', 'saas', 'landing', 'portfolio', 'booking', 'social', 'dashboard'
  )),
  preview_url TEXT,
  thumbnail_url TEXT,
  base_code TEXT NOT NULL,
  customizable_sections JSONB DEFAULT '{}',
  color_scheme JSONB DEFAULT '{}',
  is_rtl BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read templates" ON templates
  FOR SELECT USING (true);

-- ============================================================================
-- USER ASSETS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'logo', 'hero', 'product', 'banner', 'icon', 'other'
  )),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own assets" ON user_assets
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'builder', 'pro', 'hosting_only')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
  upayments_subscription_id TEXT,
  upayments_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- USAGE LIMITS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_limits (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  prompt_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Function to check usage limit
CREATE OR REPLACE FUNCTION check_usage_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_count INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT plan INTO v_plan FROM subscriptions WHERE user_id = p_user_id;
  SELECT prompt_count INTO v_count FROM usage_limits WHERE user_id = p_user_id AND date = CURRENT_DATE;

  v_limit := CASE v_plan
    WHEN 'free' THEN 3
    WHEN 'builder' THEN 30
    WHEN 'pro' THEN 100
    ELSE 0
  END;

  RETURN COALESCE(v_count, 0) < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROJECT VERSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  code_snapshot TEXT NOT NULL,
  prompt_snapshot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, version)
);

ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own project versions" ON project_versions
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Auto-increment version trigger
CREATE OR REPLACE FUNCTION save_project_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_versions (project_id, version, code_snapshot, prompt_snapshot)
  VALUES (
    NEW.id,
    COALESCE((SELECT MAX(version) FROM project_versions WHERE project_id = NEW.id), 0) + 1,
    NEW.generated_code,
    NEW.arabic_prompt
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_save_project_version
  AFTER INSERT OR UPDATE OF generated_code ON projects
  FOR EACH ROW
  WHEN (NEW.generated_code IS NOT NULL)
  EXECUTE FUNCTION save_project_version();

-- ============================================================================
-- BILLING EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  upayments_event_id TEXT,
  amount_kwd DECIMAL(10,3),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own billing events" ON billing_events
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);

-- ============================================================================
-- SEED DATA: Basic Templates
-- ============================================================================
INSERT INTO templates (name_en, name_ar, description_en, description_ar, category, base_code, is_premium)
VALUES
  ('Simple Landing Page', 'صفحة هبوط بسيطة', 'Clean landing page with hero and features', 'صفحة هبوط نظيفة مع قسم البطل والمزايا', 'landing', '<div>Template Code Here</div>', false),
  ('Restaurant Menu', 'قائمة مطعم', 'Restaurant website with menu display', 'موقع مطعم مع عرض القائمة', 'restaurant', '<div>Template Code Here</div>', false),
  ('Portfolio', 'معرض أعمال', 'Personal portfolio with project showcase', 'معرض أعمال شخصي مع عرض المشاريع', 'portfolio', '<div>Template Code Here</div>', false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS FOR USER CREATION
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
