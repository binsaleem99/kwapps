-- ============================================
-- ADMIN DASHBOARD AUTO-GENERATION SYSTEM
-- Auto-generated admin panel per deployed project
-- FREE to use (no credits for manual CRUD operations)
-- Created: 2025-12-27
-- ============================================

-- ============================================
-- ADMIN DASHBOARDS TABLE
-- Configuration for each project's admin dashboard
-- ============================================

CREATE TABLE IF NOT EXISTS admin_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,

  -- Features enabled (based on project type)
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {"products": true, "orders": true, "users": true, "blog": true, "analytics": true}

  -- Generated pages
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [
  --   {id: "home", title: "Dashboard", titleAr: "لوحة التحكم", route: "/admin", component: "DashboardHome"},
  --   {id: "products", title: "Products", titleAr: "المنتجات", route: "/admin/products", component: "ProductsManager"}
  -- ]

  -- Dashboard config
  theme TEXT DEFAULT 'arabic-rtl',
  primary_color TEXT DEFAULT '#3b82f6',
  logo_url TEXT,

  -- Access
  public_url TEXT, -- /admin/project-xxx
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_dashboards_project ON admin_dashboards(project_id);
CREATE INDEX idx_admin_dashboards_active ON admin_dashboards(is_active);

-- RLS
ALTER TABLE admin_dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view their admin dashboard"
  ON admin_dashboards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = admin_dashboards.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage admin dashboards"
  ON admin_dashboards FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- PROJECT ADMIN USERS TABLE
-- Admin credentials for each project's dashboard
-- ============================================

CREATE TABLE IF NOT EXISTS project_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Credentials
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  temp_password TEXT, -- Shown once on creation

  -- Role
  role TEXT DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),

  -- Security
  must_change_password BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One admin per project
  UNIQUE(project_id, email)
);

-- Indexes
CREATE INDEX idx_project_admin_users_project ON project_admin_users(project_id);
CREATE INDEX idx_project_admin_users_email ON project_admin_users(email);

-- RLS
ALTER TABLE project_admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view their admin users"
  ON project_admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_admin_users.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage project admin users"
  ON project_admin_users FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- ADMIN ACTIVITY LOGS TABLE
-- Audit trail for all admin actions
-- ============================================

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES project_admin_users(id) ON DELETE SET NULL,

  -- Action details
  action TEXT NOT NULL CHECK (action IN (
    'create',
    'update',
    'delete',
    'view',
    'export',
    'import',
    'login',
    'logout',
    'settings_change'
  )),

  -- Resource
  resource_type TEXT, -- 'product', 'order', 'user', 'post', etc.
  resource_id TEXT,
  resource_name TEXT,

  -- Changes
  changes JSONB DEFAULT '{}', -- {field: {old: 'value', new: 'value'}}
  details TEXT,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_admin_activity_project ON admin_activity_logs(project_id);
CREATE INDEX idx_admin_activity_admin_user ON admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_action ON admin_activity_logs(action, resource_type);
CREATE INDEX idx_admin_activity_created ON admin_activity_logs(created_at DESC);

-- RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project owners can view activity logs"
  ON admin_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = admin_activity_logs.project_id
        AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage activity logs"
  ON admin_activity_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- ADMIN DASHBOARD CONTENT TABLES
-- Generic content storage for admin-managed data
-- ============================================

-- Products/Services
CREATE TABLE IF NOT EXISTS admin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Product details
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  sku TEXT,

  -- Pricing
  price DECIMAL(10, 3) NOT NULL,
  compare_at_price DECIMAL(10, 3),
  cost DECIMAL(10, 3),

  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT TRUE,
  allow_backorder BOOLEAN DEFAULT FALSE,

  -- Media
  images TEXT[] DEFAULT '{}',
  featured_image TEXT,

  -- Categorization
  category TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- SEO
  slug TEXT,
  meta_title TEXT,
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, slug)
);

CREATE INDEX idx_admin_products_project ON admin_products(project_id);
CREATE INDEX idx_admin_products_category ON admin_products(category);
CREATE INDEX idx_admin_products_active ON admin_products(is_active);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update admin_dashboards timestamp
CREATE OR REPLACE FUNCTION update_admin_dashboard_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_dashboards_updated_at
  BEFORE UPDATE ON admin_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_dashboard_timestamp();

-- Update project_admin_users timestamp
CREATE OR REPLACE FUNCTION update_project_admin_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_admin_users_updated_at
  BEFORE UPDATE ON project_admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_project_admin_users_timestamp();

-- Update admin_products timestamp
CREATE OR REPLACE FUNCTION update_admin_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_products_updated_at
  BEFORE UPDATE ON admin_products
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_products_timestamp();

-- Log admin product changes
CREATE OR REPLACE FUNCTION log_admin_product_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_activity_logs (
    project_id,
    action,
    resource_type,
    resource_id,
    resource_name,
    changes
  ) VALUES (
    NEW.project_id,
    TG_OP,
    'product',
    NEW.id::TEXT,
    NEW.name_ar,
    CASE
      WHEN TG_OP = 'UPDATE' THEN
        jsonb_build_object(
          'name', jsonb_build_object('old', OLD.name_ar, 'new', NEW.name_ar),
          'price', jsonb_build_object('old', OLD.price, 'new', NEW.price)
        )
      ELSE '{}'::jsonb
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_products_change_log
  AFTER INSERT OR UPDATE ON admin_products
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_product_change();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Generate random password
CREATE OR REPLACE FUNCTION generate_temp_password()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 12));
END;
$$ LANGUAGE plpgsql;

-- Check if project has admin dashboard
CREATE OR REPLACE FUNCTION has_admin_dashboard(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_dashboards
    WHERE project_id = p_project_id
      AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VIEWS FOR DASHBOARD ANALYTICS
-- ============================================

-- Dashboard usage statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  ad.project_id,
  ad.id AS dashboard_id,
  COUNT(DISTINCT aal.admin_user_id) AS total_admins,
  COUNT(aal.id) FILTER (WHERE aal.action = 'login') AS total_logins,
  MAX(aal.created_at) FILTER (WHERE aal.action = 'login') AS last_login,
  COUNT(aal.id) FILTER (WHERE aal.action IN ('create', 'update', 'delete')) AS total_changes,
  COUNT(DISTINCT ap.id) AS total_products
FROM admin_dashboards ad
LEFT JOIN admin_activity_logs aal ON ad.project_id = aal.project_id
LEFT JOIN admin_products ap ON ad.project_id = ap.project_id
GROUP BY ad.project_id, ad.id;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE admin_dashboards IS 'Auto-generated admin dashboard configuration per project';
COMMENT ON TABLE project_admin_users IS 'Admin user credentials for project dashboards (separate from main auth)';
COMMENT ON TABLE admin_activity_logs IS 'Complete audit trail of all admin actions';
COMMENT ON TABLE admin_products IS 'Products/services managed through admin dashboard';
COMMENT ON VIEW admin_dashboard_stats IS 'Usage statistics for admin dashboards';

-- ============================================
-- END OF MIGRATION
-- ============================================
