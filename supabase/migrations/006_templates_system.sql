/**
 * Templates System Migration
 *
 * Creates tables and functions for the template gallery system
 * Allows users to browse and use pre-built application templates
 */

-- ====================================================================
-- TABLE: app_templates
-- ====================================================================
CREATE TABLE IF NOT EXISTS app_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50), -- Lucide icon name
  preview_image_url TEXT,
  template_code TEXT NOT NULL, -- React component code
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature strings
  tags JSONB DEFAULT '[]'::jsonb, -- Array of tag strings
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- TABLE: template_usage
-- ====================================================================
CREATE TABLE IF NOT EXISTS template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES app_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_templates_category ON app_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON app_templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_active ON app_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON template_usage(user_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE app_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;

-- Templates: Anyone can view active templates
CREATE POLICY "Anyone can view active templates"
  ON app_templates
  FOR SELECT
  USING (is_active = true);

-- Templates: Only authenticated users with service role can manage templates
-- For now, we'll allow insert/update via service role only (backend API)
-- Frontend users can only read active templates

-- Template Usage: Users can view their own usage
CREATE POLICY "Users can view own template usage"
  ON template_usage
  FOR SELECT
  USING (user_id = auth.uid());

-- Template Usage: Users can record their own usage
CREATE POLICY "Users can record template usage"
  ON template_usage
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ====================================================================
-- FUNCTIONS
-- ====================================================================

/**
 * Function: record_template_usage
 * Records template usage and increments usage counter
 */
CREATE OR REPLACE FUNCTION record_template_usage(
  p_template_id UUID,
  p_user_id UUID,
  p_project_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert usage record
  INSERT INTO template_usage (template_id, user_id, project_id)
  VALUES (p_template_id, p_user_id, p_project_id);

  -- Increment template usage count
  UPDATE app_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_template_id;
END;
$$;

/**
 * Function: get_popular_templates
 * Returns most used templates
 */
CREATE OR REPLACE FUNCTION get_popular_templates(p_limit INTEGER DEFAULT 6)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  category VARCHAR,
  icon_name VARCHAR,
  preview_image_url TEXT,
  usage_count INTEGER,
  is_premium BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
  SELECT id, name, slug, description, category, icon_name, preview_image_url, usage_count, is_premium
  FROM app_templates
  WHERE is_active = true
  ORDER BY usage_count DESC, created_at DESC
  LIMIT p_limit;
$$;

/**
 * Function: get_templates_by_category
 * Returns templates filtered by category
 */
CREATE OR REPLACE FUNCTION get_templates_by_category(p_category VARCHAR)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  category VARCHAR,
  icon_name VARCHAR,
  preview_image_url TEXT,
  usage_count INTEGER,
  is_premium BOOLEAN
)
LANGUAGE sql
STABLE
AS $$
  SELECT id, name, slug, description, category, icon_name, preview_image_url, usage_count, is_premium
  FROM app_templates
  WHERE is_active = true
  AND category = p_category
  ORDER BY usage_count DESC, created_at DESC;
$$;

-- ====================================================================
-- SEED DATA: Initial Templates
-- ====================================================================

INSERT INTO app_templates (name, slug, description, category, icon_name, template_code, features, tags, is_premium) VALUES
(
  'متجر إلكتروني',
  'ecommerce-store',
  'منصة تجارة إلكترونية كاملة مع إدارة المنتجات والطلبات والمدفوعات',
  'تجارة إلكترونية',
  'ShoppingCart',
  'export default function EcommerceStore() { return <div className="min-h-screen bg-gray-50"><header className="bg-white shadow"><div className="container mx-auto px-4 py-6"><h1 className="text-3xl font-bold text-gray-900">متجري الإلكتروني</h1></div></header><main className="container mx-auto px-4 py-8"><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-lg shadow p-6"><div className="bg-gray-200 h-48 rounded mb-4"></div><h3 className="text-xl font-semibold mb-2">منتج {i}</h3><p className="text-gray-600 mb-4">وصف المنتج هنا</p><button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">إضافة للسلة</button></div>)}</div></main></div>; }',
  '["إدارة المنتجات", "سلة التسوق", "معالجة الدفع", "تتبع الطلبات", "إدارة المخزون"]',
  '["ecommerce", "store", "shop", "متجر"]',
  false
),
(
  'نظام حجوزات',
  'booking-system',
  'تطبيق حجوزات احترافي للمواعيد والخدمات مع تقويم تفاعلي',
  'خدمات',
  'Calendar',
  'export default function BookingSystem() { return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"><div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">نظام الحجوزات</h1><div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto"><div className="mb-6"><label className="block text-gray-700 font-semibold mb-2">اختر الخدمة</label><select className="w-full border border-gray-300 rounded px-4 py-2"><option>قص شعر</option><option>حلاقة</option><option>صبغة</option></select></div><div className="mb-6"><label className="block text-gray-700 font-semibold mb-2">اختر التاريخ</label><input type="date" className="w-full border border-gray-300 rounded px-4 py-2" /></div><div className="mb-6"><label className="block text-gray-700 font-semibold mb-2">اختر الوقت</label><div className="grid grid-cols-4 gap-2">{["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map(time => <button key={time} className="border border-gray-300 rounded py-2 hover:bg-blue-600 hover:text-white transition">{time}</button>)}</div></div><button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">تأكيد الحجز</button></div></div></div>; }',
  '["تقويم تفاعلي", "حجز المواعيد", "إشعارات تلقائية", "إدارة العملاء", "تقارير الحجوزات"]',
  '["booking", "appointment", "calendar", "حجز"]',
  false
),
(
  'منصة تعليمية',
  'learning-platform',
  'نظام إدارة تعلم متكامل مع الدروس والاختبارات وتتبع التقدم',
  'تعليم',
  'GraduationCap',
  'export default function LearningPlatform() { return <div className="min-h-screen bg-gray-50"><nav className="bg-white shadow-md"><div className="container mx-auto px-4 py-4"><h1 className="text-2xl font-bold text-blue-600">منصتي التعليمية</h1></div></nav><div className="container mx-auto px-4 py-8"><div className="grid md:grid-cols-3 gap-6"><div className="md:col-span-2"><h2 className="text-3xl font-bold mb-6">دوراتك الحالية</h2><div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-lg shadow p-6"><h3 className="text-xl font-semibold mb-2">دورة {i}</h3><div className="mb-4"><div className="bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{width: `${i * 30}%`}}></div></div><p className="text-sm text-gray-600 mt-1">{i * 30}% مكتمل</p></div><button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">متابعة الدرس</button></div>)}</div></div><div><h3 className="text-xl font-bold mb-4">إحصائياتك</h3><div className="bg-white rounded-lg shadow p-6"><div className="space-y-4"><div><p className="text-gray-600">الدروس المكتملة</p><p className="text-3xl font-bold text-blue-600">24</p></div><div><p className="text-gray-600">ساعات التعلم</p><p className="text-3xl font-bold text-green-600">48</p></div></div></div></div></div></div></div>; }',
  '["دروس فيديو", "اختبارات تفاعلية", "شهادات إكمال", "تتبع التقدم", "منتدى نقاش"]',
  '["education", "learning", "courses", "تعليم"]',
  false
),
(
  'إدارة مشاريع',
  'project-management',
  'أداة إدارة مشاريع ومهام مع لوحات كانبان وتقارير متقدمة',
  'إنتاجية',
  'LayoutDashboard',
  'export default function ProjectManagement() { return <div className="min-h-screen bg-gray-100"><div className="bg-white border-b"><div className="container mx-auto px-4 py-4"><h1 className="text-2xl font-bold">إدارة المشاريع</h1></div></div><div className="container mx-auto px-4 py-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{["قائمة المهام", "قيد التنفيذ", "قيد المراجعة", "مكتمل"].map(status => <div key={status} className="bg-gray-50 rounded-lg p-4"><h3 className="font-bold mb-4 text-gray-700">{status}</h3><div className="space-y-3">{[1,2].map(i => <div key={i} className="bg-white rounded shadow p-4 cursor-move hover:shadow-md transition"><h4 className="font-semibold mb-2">مهمة {i}</h4><p className="text-sm text-gray-600 mb-2">وصف المهمة</p><div className="flex items-center justify-between text-xs"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">عادية</span><span className="text-gray-500">غداً</span></div></div>)}</div></div>)}</div></div></div>; }',
  '["لوحات كانبان", "تعيين المهام", "تتبع الوقت", "تقارير الأداء", "التعاون الجماعي"]',
  '["project", "management", "tasks", "مشاريع"]',
  false
),
(
  'مدونة احترافية',
  'blog-platform',
  'منصة نشر محتوى مع محرر نصوص غني وإدارة مقالات متقدمة',
  'محتوى',
  'FileText',
  'export default function BlogPlatform() { return <div className="min-h-screen bg-white"><header className="border-b"><div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">مدونتي</h1><p className="text-gray-600 mt-2">أفكار ومقالات تقنية</p></div></header><main className="container mx-auto px-4 py-12"><div className="max-w-4xl mx-auto"><div className="space-y-8">{[1,2,3].map(i => <article key={i} className="border-b pb-8"><h2 className="text-3xl font-bold mb-3 hover:text-blue-600 cursor-pointer">عنوان المقالة {i}</h2><div className="flex items-center gap-4 text-sm text-gray-600 mb-4"><span>محمد أحمد</span><span>•</span><span>منذ {i} أيام</span><span>•</span><span>{i * 5} دقائق قراءة</span></div><p className="text-gray-700 leading-relaxed mb-4">مقدمة المقالة تظهر هنا. يمكنك كتابة أي محتوى تريده. المدونة تدعم النصوص الغنية والصور والروابط والمزيد...</p><button className="text-blue-600 font-semibold hover:underline">اقرأ المزيد ←</button></article>)}</div></div></main></div>; }',
  '["محرر نصوص غني", "تصنيفات ووسوم", "التعليقات", "SEO محسّن", "مشاركة اجتماعية"]',
  '["blog", "content", "writing", "مدونة"]',
  false
),
(
  'نظام CRM',
  'crm-system',
  'إدارة علاقات العملاء مع تتبع المبيعات والفرص التجارية',
  'أعمال',
  'Users',
  'export default function CRMSystem() { return <div className="min-h-screen bg-gray-50"><div className="bg-white border-b"><div className="container mx-auto px-4 py-4 flex justify-between items-center"><h1 className="text-2xl font-bold">نظام CRM</h1><button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ إضافة عميل</button></div></div><div className="container mx-auto px-4 py-8"><div className="grid md:grid-cols-3 gap-4 mb-8">{[{title: "العملاء الجدد", value: "24", color: "blue"}, {title: "الصفقات النشطة", value: "12", color: "green"}, {title: "الإيرادات المتوقعة", value: "١٢٠,٠٠٠", color: "purple"}].map(stat => <div key={stat.title} className="bg-white rounded-lg shadow p-6"><h3 className="text-gray-600 text-sm mb-2">{stat.title}</h3><p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p></div>)}</div><div className="bg-white rounded-lg shadow"><div className="p-6 border-b"><h2 className="text-xl font-bold">قائمة العملاء</h2></div><table className="w-full"><thead><tr className="border-b bg-gray-50"><th className="text-right p-4">الاسم</th><th className="text-right p-4">الشركة</th><th className="text-right p-4">الحالة</th><th className="text-right p-4">القيمة</th></tr></thead><tbody>{[1,2,3,4].map(i => <tr key={i} className="border-b hover:bg-gray-50"><td className="p-4">عميل {i}</td><td className="p-4">شركة {i}</td><td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">نشط</span></td><td className="p-4">{i * 10000} د.ك</td></tr>)}</tbody></table></div></div></div>; }',
  '["إدارة جهات الاتصال", "تتبع الصفقات", "تقارير المبيعات", "إدارة المهام", "تحليلات متقدمة"]',
  '["crm", "sales", "customers", "عملاء"]',
  true
)
ON CONFLICT (slug) DO NOTHING;

-- ====================================================================
-- TRIGGER: Update updated_at timestamp
-- ====================================================================
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_templates_updated_at
BEFORE UPDATE ON app_templates
FOR EACH ROW
EXECUTE FUNCTION update_templates_updated_at();
