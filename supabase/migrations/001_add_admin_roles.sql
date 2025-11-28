-- =====================================================
-- Migration 001: Admin Roles & Authentication System
-- =====================================================

-- 1. Create admin_role enum
CREATE TYPE admin_role AS ENUM ('owner', 'support', 'content', 'readonly');

-- 2. Add admin fields to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_role admin_role,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'ar',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- 3. Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT, -- 'user', 'project', 'template', 'billing', etc.
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_resource ON admin_audit_log(resource_type, resource_id);

-- 4. Create impersonation log table
CREATE TABLE IF NOT EXISTS impersonation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  ip_address INET
);

CREATE INDEX idx_impersonation_log_admin_id ON impersonation_log(admin_id);
CREATE INDEX idx_impersonation_log_target_user_id ON impersonation_log(target_user_id);
CREATE INDEX idx_impersonation_log_started_at ON impersonation_log(started_at DESC);

-- 5. Create user activity log table (for support tools)
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at DESC);

-- 6. Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Helper function: Check if admin has permission
CREATE OR REPLACE FUNCTION has_admin_permission(
  user_id UUID,
  required_role admin_role
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role admin_role;
BEGIN
  SELECT admin_role INTO user_role
  FROM users
  WHERE id = user_id AND is_admin = true;

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Owner has all permissions
  IF user_role = 'owner' THEN
    RETURN true;
  END IF;

  -- Check specific role requirements
  RETURN user_role = required_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RLS Policies for admin access

-- Admin can read all users
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (is_admin(auth.uid()));

-- Admin can update all users
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (is_admin(auth.uid()));

-- Admin can read all projects
CREATE POLICY "Admins can read all projects" ON projects
  FOR SELECT USING (is_admin(auth.uid()));

-- Admin can update all projects
CREATE POLICY "Admins can update all projects" ON projects
  FOR UPDATE USING (is_admin(auth.uid()));

-- Admin can read all templates
CREATE POLICY "Admins can read all templates" ON templates
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins with 'owner' or 'content' role can modify templates
CREATE POLICY "Content admins can modify templates" ON templates
  FOR ALL USING (
    has_admin_permission(auth.uid(), 'owner') OR
    has_admin_permission(auth.uid(), 'content')
  );

-- Admin can read all subscriptions
CREATE POLICY "Admins can read all subscriptions" ON subscriptions
  FOR SELECT USING (is_admin(auth.uid()));

-- Only owners can modify subscriptions
CREATE POLICY "Owners can modify subscriptions" ON subscriptions
  FOR ALL USING (has_admin_permission(auth.uid(), 'owner'));

-- Admin can read all billing events
CREATE POLICY "Admins can read all billing_events" ON billing_events
  FOR SELECT USING (is_admin(auth.uid()));

-- Only owners can see billing events
CREATE POLICY "Owners can see billing_events" ON billing_events
  FOR SELECT USING (has_admin_permission(auth.uid(), 'owner'));

-- 9. RLS Policies for audit logs

-- Admins can insert audit logs
CREATE POLICY "Admins can insert audit logs" ON admin_audit_log
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON admin_audit_log
  FOR SELECT USING (is_admin(auth.uid()));

-- 10. RLS Policies for impersonation logs

-- Admins can insert impersonation logs
CREATE POLICY "Admins can insert impersonation logs" ON impersonation_log
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

-- Admins can read impersonation logs
CREATE POLICY "Admins can read impersonation logs" ON impersonation_log
  FOR SELECT USING (is_admin(auth.uid()));

-- 11. Function to log admin actions (can be called from server actions)
CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address
  ) VALUES (
    p_admin_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Comments for documentation
COMMENT ON TABLE admin_audit_log IS 'Logs all admin actions for security and compliance';
COMMENT ON TABLE impersonation_log IS 'Tracks when admins impersonate users for support';
COMMENT ON TABLE user_activity IS 'Tracks user actions for support and debugging';
COMMENT ON FUNCTION is_admin IS 'Check if a user has admin privileges';
COMMENT ON FUNCTION has_admin_permission IS 'Check if admin has specific role permission';
COMMENT ON FUNCTION log_admin_action IS 'Helper function to log admin actions';
