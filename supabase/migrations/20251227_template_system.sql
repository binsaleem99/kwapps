-- ============================================
-- TEMPLATE SYSTEM
-- 15 Pre-built Arabic templates for faster website creation
-- Created: 2025-12-27
-- ============================================

-- ============================================
-- TEMPLATES TABLE
-- Template definitions with metadata
-- ============================================

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,

  -- Names & Description
  name_en VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_ar TEXT,

  -- Classification
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'ecommerce',
    'restaurant',
    'service',
    'corporate',
    'portfolio',
    'real_estate',
    'healthcare',
    'education',
    'government',
    'travel'
  )),
  industry VARCHAR(50),
  tags TEXT[] DEFAULT '{}',

  -- Visual
  thumbnail_url TEXT NOT NULL,
  preview_url TEXT,
  screenshots TEXT[] DEFAULT '{}',

  -- Technical
  tech_stack TEXT[] DEFAULT '{"next.js", "tailwind", "shadcn/ui"}',
  features JSONB DEFAULT '[]', -- ['products', 'booking', 'blog']
  pages JSONB DEFAULT '[]', -- [{name: 'Home', route: '/', sections: [...]}]
  sections JSONB DEFAULT '[]', -- [{id: 'hero', name: 'Hero Section', required: true}]
  components_used TEXT[] DEFAULT '{}',

  -- Customization
  color_schemes JSONB DEFAULT '[]', -- [{name: 'Modern Blue', primary: '#...'}]
  content_requirements JSONB DEFAULT '{}', -- {businessName: required, aboutUs: optional}
  image_requirements JSONB DEFAULT '{}', -- {logo: required, hero: required, featured: 3}
  customization_steps JSONB DEFAULT '[]', -- Wizard steps configuration

  -- Metadata
  is_premium BOOLEAN DEFAULT FALSE,
  credits_to_customize INTEGER NOT NULL DEFAULT 25,
  popularity_score INTEGER DEFAULT 0,
  average_rating NUMERIC(3, 2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_new BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_slug ON templates(slug);
CREATE INDEX idx_templates_active ON templates(is_active);
CREATE INDEX idx_templates_featured ON templates(featured, popularity_score DESC);
CREATE INDEX idx_templates_popularity ON templates(popularity_score DESC);
CREATE INDEX idx_templates_rating ON templates(average_rating DESC);

-- RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON templates FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Service role can manage templates"
  ON templates FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- TEMPLATE USAGE TABLE
-- Track when users customize templates
-- ============================================

CREATE TABLE IF NOT EXISTS template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Customization data
  customizations JSONB NOT NULL DEFAULT '{}',
  selected_color_scheme VARCHAR(100),
  selected_sections TEXT[] DEFAULT '{}',

  -- Credits & Status
  credits_used INTEGER NOT NULL,
  generation_time_seconds INTEGER,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN (
    'started',
    'generating',
    'completed',
    'failed'
  )),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_template_usage_template ON template_usage(template_id);
CREATE INDEX idx_template_usage_user ON template_usage(user_id);
CREATE INDEX idx_template_usage_project ON template_usage(project_id);
CREATE INDEX idx_template_usage_created ON template_usage(created_at DESC);

-- RLS
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own template usage"
  ON template_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create template usage"
  ON template_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage template usage"
  ON template_usage FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- TEMPLATE RATINGS TABLE
-- User ratings and reviews
-- ============================================

CREATE TABLE IF NOT EXISTS template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,

  -- Metadata
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One rating per user per template
  UNIQUE(template_id, user_id)
);

-- Indexes
CREATE INDEX idx_template_ratings_template ON template_ratings(template_id);
CREATE INDEX idx_template_ratings_rating ON template_ratings(rating DESC);
CREATE INDEX idx_template_ratings_created ON template_ratings(created_at DESC);

-- RLS
ALTER TABLE template_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view template ratings"
  ON template_ratings FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can rate templates they've used"
  ON template_ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM template_usage
      WHERE template_id = template_ratings.template_id
        AND user_id = auth.uid()
        AND status = 'completed'
    )
  );

CREATE POLICY "Users can update own ratings"
  ON template_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage ratings"
  ON template_ratings FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- UPDATE PROJECTS TABLE
-- Link templates to projects
-- ============================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES templates(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS customizations JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS from_template BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_projects_template ON projects(template_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update template stats when rated
CREATE OR REPLACE FUNCTION update_template_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate average rating and total ratings
  UPDATE templates
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM template_ratings
      WHERE template_id = NEW.template_id
    ),
    total_ratings = (
      SELECT COUNT(*)
      FROM template_ratings
      WHERE template_id = NEW.template_id
    ),
    updated_at = NOW()
  WHERE id = NEW.template_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER template_rating_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON template_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating_stats();

-- Update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE templates
    SET
      usage_count = usage_count + 1,
      popularity_score = popularity_score + 1,
      updated_at = NOW()
    WHERE id = NEW.template_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER template_usage_count_trigger
  AFTER INSERT OR UPDATE ON template_usage
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION increment_template_usage();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_timestamp();

CREATE TRIGGER template_ratings_updated_at
  BEFORE UPDATE ON template_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_template_timestamp();

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Popular templates
CREATE OR REPLACE VIEW popular_templates AS
SELECT
  t.*,
  COUNT(DISTINCT tu.user_id) AS unique_users,
  COUNT(tu.id) AS total_customizations,
  AVG(tu.credits_used) AS avg_credits_used,
  AVG(tu.generation_time_seconds) AS avg_generation_time
FROM templates t
LEFT JOIN template_usage tu ON t.id = tu.template_id AND tu.status = 'completed'
WHERE t.is_active = TRUE
GROUP BY t.id
ORDER BY t.popularity_score DESC, t.average_rating DESC;

-- Template performance by category
CREATE OR REPLACE VIEW template_category_stats AS
SELECT
  category,
  COUNT(*) AS template_count,
  SUM(usage_count) AS total_usage,
  ROUND(AVG(average_rating), 2) AS avg_rating,
  SUM(popularity_score) AS total_popularity
FROM templates
WHERE is_active = TRUE
GROUP BY category
ORDER BY total_usage DESC;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get template by slug
CREATE OR REPLACE FUNCTION get_template_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  name_ar TEXT,
  category TEXT,
  credits_to_customize INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name_ar,
    t.category,
    t.credits_to_customize
  FROM templates t
  WHERE t.slug = p_slug AND t.is_active = TRUE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if user has used template
CREATE OR REPLACE FUNCTION has_user_used_template(
  p_user_id UUID,
  p_template_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM template_usage
    WHERE user_id = p_user_id
      AND template_id = p_template_id
      AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE templates IS '15 pre-built Arabic templates for various industries';
COMMENT ON TABLE template_usage IS 'Tracks when users customize and generate from templates';
COMMENT ON TABLE template_ratings IS 'User ratings and reviews for templates';
COMMENT ON VIEW popular_templates IS 'Templates sorted by popularity with usage statistics';
COMMENT ON VIEW template_category_stats IS 'Aggregated statistics by template category';

-- ============================================
-- END OF MIGRATION
-- ============================================
