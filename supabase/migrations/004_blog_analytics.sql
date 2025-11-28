-- Blog Analytics and SEO Enhancement Migration
-- Phase I: Advanced Blog Management System

-- Blog Post Analytics Table
CREATE TABLE IF NOT EXISTS blog_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,

  -- View Tracking
  view_count INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,

  -- Engagement Metrics
  avg_time_on_page INTEGER DEFAULT 0, -- seconds
  scroll_depth_avg INTEGER DEFAULT 0, -- percentage
  bounce_rate DECIMAL(5,2) DEFAULT 0.00, -- percentage

  -- Interaction Metrics
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,

  -- Traffic Sources
  direct_traffic INTEGER DEFAULT 0,
  search_traffic INTEGER DEFAULT 0,
  social_traffic INTEGER DEFAULT 0,
  referral_traffic INTEGER DEFAULT 0,

  -- SEO Performance
  search_impressions INTEGER DEFAULT 0,
  search_clicks INTEGER DEFAULT 0,
  avg_search_position DECIMAL(5,2) DEFAULT 0.00,

  -- Updated timestamp
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blog_post_id)
);

-- Individual Page View Events (for detailed tracking)
CREATE TABLE IF NOT EXISTS blog_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,

  -- Session Info
  session_id TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_hash TEXT, -- Hashed IP for privacy

  -- Page View Details
  time_on_page INTEGER, -- seconds
  scroll_depth INTEGER, -- percentage

  -- Traffic Source
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Device Info
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,

  -- Timestamp
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_blog_views_post ON blog_page_views(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_date ON blog_page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_blog_views_session ON blog_page_views(session_id);

-- Blog Template Sections (for structured content)
CREATE TABLE IF NOT EXISTS blog_template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,

  -- Section Type (based on Victorious template)
  section_type TEXT NOT NULL CHECK (section_type IN (
    'planning', -- Pre-writing section
    'headline', -- Multiple headline options
    'summary', -- Bulleted summary
    'introduction', -- ~100 words with keyword
    'body_point_1', -- First supporting idea
    'body_point_2', -- Second supporting idea
    'body_point_3', -- Third supporting idea
    'body_point_additional', -- Additional points
    'conclusion', -- ~60 words
    'cta', -- Call to action
    'sources' -- Research sources
  )),

  -- Section Content
  title TEXT,
  content_ar TEXT,
  content_en TEXT,

  -- Section Order
  display_order INTEGER DEFAULT 0,

  -- Section Metadata
  word_count INTEGER,
  includes_keyword BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog SEO Metadata (expanded from blog_posts)
CREATE TABLE IF NOT EXISTS blog_seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE UNIQUE,

  -- Pre-writing Planning (Victorious Template)
  target_audience TEXT, -- Who is this for?
  funnel_stage TEXT CHECK (funnel_stage IN ('ToFu', 'MoFu', 'BoFu')), -- Marketing funnel
  primary_keyword TEXT NOT NULL,
  secondary_keywords TEXT[], -- Array of keywords
  article_objective TEXT, -- 2-3 sentence benefits statement

  -- Headline Optimization
  headline_variations TEXT[], -- Store 10 variations
  selected_headline TEXT,
  headline_score INTEGER, -- From headline analyzer tool

  -- Meta Tags (duplicated from blog_posts for convenience)
  meta_title_ar TEXT,
  meta_title_en TEXT,
  meta_description_ar TEXT,
  meta_description_en TEXT,

  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,

  -- Twitter Card
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,

  -- Structured Data
  schema_markup JSONB, -- JSON-LD structured data

  -- Internal/External Links
  internal_links TEXT[], -- Array of internal URLs
  external_sources TEXT[], -- Research sources

  -- Reading Metrics
  estimated_reading_time INTEGER, -- minutes

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE blog_post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_seo_metadata ENABLE ROW LEVEL SECURITY;

-- Public can view analytics
CREATE POLICY "Anyone can view blog analytics"
  ON blog_post_analytics FOR SELECT
  USING (true);

-- Admins can manage all
CREATE POLICY "Admins manage blog analytics"
  ON blog_post_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view page views"
  ON blog_page_views FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert page views"
  ON blog_page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins manage template sections"
  ON blog_template_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins manage SEO metadata"
  ON blog_seo_metadata FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Helper Functions

-- Function: Update analytics on page view
CREATE OR REPLACE FUNCTION increment_blog_view_count(post_id UUID, is_unique BOOLEAN DEFAULT false)
RETURNS void AS $$
BEGIN
  INSERT INTO blog_post_analytics (blog_post_id, view_count, unique_views)
  VALUES (post_id, 1, CASE WHEN is_unique THEN 1 ELSE 0 END)
  ON CONFLICT (blog_post_id)
  DO UPDATE SET
    view_count = blog_post_analytics.view_count + 1,
    unique_views = blog_post_analytics.unique_views + CASE WHEN is_unique THEN 1 ELSE 0 END,
    last_updated = NOW();

  -- Also update legacy view_count in blog_posts table
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Calculate average engagement metrics
CREATE OR REPLACE FUNCTION update_blog_engagement_metrics(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_post_analytics
  SET
    avg_time_on_page = (
      SELECT COALESCE(AVG(time_on_page), 0)::INTEGER
      FROM blog_page_views
      WHERE blog_post_id = post_id
      AND time_on_page IS NOT NULL
    ),
    scroll_depth_avg = (
      SELECT COALESCE(AVG(scroll_depth), 0)::INTEGER
      FROM blog_page_views
      WHERE blog_post_id = post_id
      AND scroll_depth IS NOT NULL
    ),
    bounce_rate = (
      SELECT COALESCE(
        (COUNT(*) FILTER (WHERE time_on_page < 10)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
      )
      FROM blog_page_views
      WHERE blog_post_id = post_id
    ),
    last_updated = NOW()
  WHERE blog_post_id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top performing blogs
CREATE OR REPLACE FUNCTION get_top_blogs(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title_ar TEXT,
  title_en TEXT,
  view_count INTEGER,
  unique_views INTEGER,
  avg_time_on_page INTEGER,
  scroll_depth_avg INTEGER,
  bounce_rate DECIMAL,
  engagement_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.title_ar,
    bp.title_en,
    COALESCE(bpa.view_count, 0) as view_count,
    COALESCE(bpa.unique_views, 0) as unique_views,
    COALESCE(bpa.avg_time_on_page, 0) as avg_time_on_page,
    COALESCE(bpa.scroll_depth_avg, 0) as scroll_depth_avg,
    COALESCE(bpa.bounce_rate, 0.00) as bounce_rate,
    -- Engagement score = weighted average of metrics
    COALESCE(
      (bpa.view_count * 0.3) +
      (bpa.unique_views * 0.3) +
      (bpa.avg_time_on_page * 0.2) +
      (bpa.scroll_depth_avg * 0.2),
      0
    )::DECIMAL AS engagement_score
  FROM blog_posts bp
  LEFT JOIN blog_post_analytics bpa ON bpa.blog_post_id = bp.id
  WHERE bp.published = true
  ORDER BY engagement_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
