-- ==============================================
-- KW APPS - Admin Dashboard Tables Migration
-- ==============================================
-- Tables for dynamic admin dashboard content management
-- Supports multiple content types per project
-- ==============================================

-- Admin Dashboard Configuration Table
CREATE TABLE IF NOT EXISTS admin_dashboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  schema JSONB NOT NULL DEFAULT '{}',
  theme JSONB DEFAULT '{"primaryColor": "#3b82f6", "accentColor": "#0f172a"}',
  enabled_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Index for project lookup
CREATE INDEX IF NOT EXISTS idx_admin_config_project ON admin_dashboard_config(project_id);

-- RLS Policy
ALTER TABLE admin_dashboard_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their admin config" ON admin_dashboard_config;
CREATE POLICY "Users can manage their admin config"
  ON admin_dashboard_config
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Products Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price NUMERIC DEFAULT 0,
  original_price NUMERIC,
  image TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_products_project ON admin_products(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_products_category ON admin_products(project_id, category);

ALTER TABLE admin_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their products" ON admin_products;
CREATE POLICY "Users can manage their products"
  ON admin_products
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Services Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price NUMERIC,
  icon TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_services_project ON admin_services(project_id);

ALTER TABLE admin_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their services" ON admin_services;
CREATE POLICY "Users can manage their services"
  ON admin_services
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Pages Table (Content Pages)
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  title_ar TEXT,
  slug TEXT,
  content TEXT,
  content_ar TEXT,
  meta_title TEXT,
  meta_description TEXT,
  published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_pages_project ON admin_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_pages_slug ON admin_pages(project_id, slug);

ALTER TABLE admin_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their pages" ON admin_pages;
CREATE POLICY "Users can manage their pages"
  ON admin_pages
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Forms/Contact Submissions Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  form_type TEXT DEFAULT 'contact',
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_forms_project ON admin_forms(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_forms_read ON admin_forms(project_id, read);

ALTER TABLE admin_forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their forms" ON admin_forms;
CREATE POLICY "Users can manage their forms"
  ON admin_forms
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Public can submit forms (INSERT only)
DROP POLICY IF EXISTS "Public can submit forms" ON admin_forms;
CREATE POLICY "Public can submit forms"
  ON admin_forms
  FOR INSERT
  WITH CHECK (true);

-- ==============================================
-- Testimonials Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT,
  content TEXT,
  role TEXT,
  company TEXT,
  image TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_testimonials_project ON admin_testimonials(project_id);

ALTER TABLE admin_testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their testimonials" ON admin_testimonials;
CREATE POLICY "Users can manage their testimonials"
  ON admin_testimonials
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Team Members Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT,
  bio TEXT,
  image TEXT,
  email TEXT,
  phone TEXT,
  social_links JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_team_project ON admin_team(project_id);

ALTER TABLE admin_team ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their team" ON admin_team;
CREATE POLICY "Users can manage their team"
  ON admin_team
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Gallery Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  image TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_gallery_project ON admin_gallery(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_gallery_category ON admin_gallery(project_id, category);

ALTER TABLE admin_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their gallery" ON admin_gallery;
CREATE POLICY "Users can manage their gallery"
  ON admin_gallery
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Pricing/Plans Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT,
  name_ar TEXT,
  price NUMERIC DEFAULT 0,
  period TEXT DEFAULT 'month',
  description TEXT,
  description_ar TEXT,
  features TEXT,
  features_ar TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_pricing_project ON admin_pricing(project_id);

ALTER TABLE admin_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their pricing" ON admin_pricing;
CREATE POLICY "Users can manage their pricing"
  ON admin_pricing
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- FAQ Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  question TEXT,
  question_ar TEXT,
  answer TEXT,
  answer_ar TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_faq_project ON admin_faq(project_id);

ALTER TABLE admin_faq ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their faq" ON admin_faq;
CREATE POLICY "Users can manage their faq"
  ON admin_faq
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Blog Posts Table
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_blog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  title_ar TEXT,
  slug TEXT,
  excerpt TEXT,
  excerpt_ar TEXT,
  content TEXT,
  content_ar TEXT,
  image TEXT,
  author TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_blog_project ON admin_blog(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_blog_slug ON admin_blog(project_id, slug);
CREATE INDEX IF NOT EXISTS idx_admin_blog_published ON admin_blog(project_id, published);

ALTER TABLE admin_blog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their blog" ON admin_blog;
CREATE POLICY "Users can manage their blog"
  ON admin_blog
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Contact Messages Table (alias for forms)
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_contact_project ON admin_contact(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_contact_read ON admin_contact(project_id, read);

ALTER TABLE admin_contact ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their contact" ON admin_contact;
CREATE POLICY "Users can manage their contact"
  ON admin_contact
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Public can submit contact forms
DROP POLICY IF EXISTS "Public can submit contact" ON admin_contact;
CREATE POLICY "Public can submit contact"
  ON admin_contact
  FOR INSERT
  WITH CHECK (true);

-- ==============================================
-- Project Users Table (for projects with auth)
-- ==============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  avatar TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, email)
);

CREATE INDEX IF NOT EXISTS idx_admin_users_project ON admin_users(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(project_id, email);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their project users" ON admin_users;
CREATE POLICY "Users can manage their project users"
  ON admin_users
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ==============================================
-- Updated At Trigger Function
-- ==============================================
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all admin tables
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN
    SELECT unnest(ARRAY[
      'admin_dashboard_config',
      'admin_products',
      'admin_services',
      'admin_pages',
      'admin_testimonials',
      'admin_team',
      'admin_gallery',
      'admin_pricing',
      'admin_faq',
      'admin_blog',
      'admin_users'
    ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
      CREATE TRIGGER update_%s_updated_at
        BEFORE UPDATE ON %s
        FOR EACH ROW
        EXECUTE FUNCTION update_admin_updated_at();
    ', table_name, table_name, table_name, table_name);
  END LOOP;
END $$;

-- ==============================================
-- Comments
-- ==============================================
COMMENT ON TABLE admin_dashboard_config IS 'Configuration for project admin dashboards';
COMMENT ON TABLE admin_products IS 'Products managed through admin dashboard';
COMMENT ON TABLE admin_services IS 'Services managed through admin dashboard';
COMMENT ON TABLE admin_pages IS 'Content pages managed through admin dashboard';
COMMENT ON TABLE admin_forms IS 'Form submissions from project websites';
COMMENT ON TABLE admin_testimonials IS 'Testimonials managed through admin dashboard';
COMMENT ON TABLE admin_team IS 'Team members managed through admin dashboard';
COMMENT ON TABLE admin_gallery IS 'Gallery images managed through admin dashboard';
COMMENT ON TABLE admin_pricing IS 'Pricing plans managed through admin dashboard';
COMMENT ON TABLE admin_faq IS 'FAQs managed through admin dashboard';
COMMENT ON TABLE admin_blog IS 'Blog posts managed through admin dashboard';
COMMENT ON TABLE admin_contact IS 'Contact form submissions';
COMMENT ON TABLE admin_users IS 'Users registered in client projects';
