'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/blog/rich-text-editor'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Sparkles, FileText, Target, TrendingUp } from 'lucide-react'

export default function BlogPostForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-writing Planning (Victorious Template Section 1)
  const [targetAudience, setTargetAudience] = useState('')
  const [funnelStage, setFunnelStage] = useState<'ToFu' | 'MoFu' | 'BoFu'>('ToFu')
  const [primaryKeyword, setPrimaryKeyword] = useState('')
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([])
  const [articleObjective, setArticleObjective] = useState('')

  // Headline Optimization
  const [headlineVariations, setHeadlineVariations] = useState<string[]>(['', '', '', '', ''])
  const [selectedHeadline, setSelectedHeadline] = useState(0)

  // Basic Info
  const [titleAr, setTitleAr] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // Content Sections (Victorious Template)
  const [summary, setSummary] = useState('') // Bulleted list at top
  const [introductionAr, setIntroductionAr] = useState('') // ~100 words
  const [bodyPoint1Ar, setBodyPoint1Ar] = useState('') // Supporting idea 1
  const [bodyPoint2Ar, setBodyPoint2Ar] = useState('') // Supporting idea 2
  const [bodyPoint3Ar, setBodyPoint3Ar] = useState('') // Supporting idea 3
  const [conclusionAr, setConclusionAr] = useState('') // ~60 words
  const [ctaText, setCtaText] = useState('') // Max 8 words
  const [sources, setSources] = useState<string[]>([])

  // SEO Fields
  const [metaTitleAr, setMetaTitleAr] = useState('') // Max 60 chars
  const [metaDescriptionAr, setMetaDescriptionAr] = useState('') // 110-140 chars
  const [featuredImage, setFeaturedImage] = useState('')

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100)
  }

  async function handleSubmit(e: React.FormEvent, publishNow: boolean = false) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Combine sections into full content
      const fullContentAr = `
${summary}

${introductionAr}

## ${bodyPoint1Ar.split('\n')[0] || 'النقطة الأولى'}
${bodyPoint1Ar}

## ${bodyPoint2Ar.split('\n')[0] || 'النقطة الثانية'}
${bodyPoint2Ar}

## ${bodyPoint3Ar.split('\n')[0] || 'النقطة الثالثة'}
${bodyPoint3Ar}

${conclusionAr}

${ctaText ? `---\n${ctaText}` : ''}

${sources.length > 0 ? `### المصادر\n${sources.map(s => `- ${s}`).join('\n')}` : ''}
      `.trim()

      // Insert blog post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          title_ar: headlineVariations[selectedHeadline] || titleAr,
          title_en: titleEn,
          slug: slug || generateSlug(titleAr),
          excerpt_ar: metaDescriptionAr,
          content_ar: fullContentAr,
          category,
          tags,
          featured_image: featuredImage,
          seo_title_ar: metaTitleAr,
          seo_description_ar: metaDescriptionAr,
          seo_keywords: [primaryKeyword, ...secondaryKeywords],
          published: publishNow,
          published_at: publishNow ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (postError) throw postError

      // Insert SEO metadata
      await supabase.from('blog_seo_metadata').insert({
        blog_post_id: post.id,
        target_audience: targetAudience,
        funnel_stage: funnelStage,
        primary_keyword: primaryKeyword,
        secondary_keywords: secondaryKeywords,
        article_objective: articleObjective,
        headline_variations: headlineVariations.filter(h => h),
        selected_headline: headlineVariations[selectedHeadline],
        meta_title_ar: metaTitleAr,
        meta_description_ar: metaDescriptionAr,
        external_sources: sources,
        estimated_reading_time: Math.ceil(fullContentAr.split(' ').length / 200) // ~200 words/min
      })

      // Insert template sections for tracking
      const sections = [
        { type: 'summary', content: summary },
        { type: 'introduction', content: introductionAr },
        { type: 'body_point_1', content: bodyPoint1Ar },
        { type: 'body_point_2', content: bodyPoint2Ar },
        { type: 'body_point_3', content: bodyPoint3Ar },
        { type: 'conclusion', content: conclusionAr },
        { type: 'cta', content: ctaText }
      ].map((section, index) => ({
        blog_post_id: post.id,
        section_type: section.type,
        content_ar: section.content,
        display_order: index,
        word_count: section.content.split(' ').length
      }))

      await supabase.from('blog_template_sections').insert(sections)

      toast.success(publishNow ? 'تم نشر المقال بنجاح!' : 'تم حفظ المسودة!')
      router.push('/admin/blog')

    } catch (error: any) {
      toast.error('حدث خطأ: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Cairo'] mb-2">
          <FileText className="inline w-8 h-8 ml-2" />
          إنشاء مقال جديد
        </h1>
        <p className="text-gray-600 font-['Cairo']">
          اتبع النموذج المحسّن لمحركات البحث لإنشاء محتوى عالي الجودة
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <Tabs defaultValue="planning" dir="rtl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planning">
              <Target className="w-4 h-4 ml-2" />
              التخطيط
            </TabsTrigger>
            <TabsTrigger value="headline">
              <Sparkles className="w-4 h-4 ml-2" />
              العنوان
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileText className="w-4 h-4 ml-2" />
              المحتوى
            </TabsTrigger>
            <TabsTrigger value="seo">
              <TrendingUp className="w-4 h-4 ml-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Pre-writing Planning */}
          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-['Cairo']">التخطيط قبل الكتابة</CardTitle>
                <CardDescription className="font-['Cairo']">
                  حدد الجمهور المستهدف والأهداف والكلمات المفتاحية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Audience */}
                <div>
                  <Label>الجمهور المستهدف</Label>
                  <Input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="مثال: أصحاب المطاعم في الكويت"
                    className="font-['Cairo']"
                  />
                  <p className="text-sm text-gray-500 mt-1 font-['Cairo']">
                    من هم القراء؟ ما هي اهتماماتهم؟
                  </p>
                </div>

                {/* Funnel Stage */}
                <div>
                  <Label>مرحلة رحلة العميل</Label>
                  <Select value={funnelStage} onValueChange={(v: any) => setFunnelStage(v)}>
                    <SelectTrigger className="font-['Cairo']">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ToFu">ToFu - أعلى القمع (التوعية)</SelectItem>
                      <SelectItem value="MoFu">MoFu - منتصف القمع (التفكير)</SelectItem>
                      <SelectItem value="BoFu">BoFu - أسفل القمع (القرار)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Primary Keyword */}
                <div>
                  <Label>الكلمة المفتاحية الرئيسية *</Label>
                  <Input
                    value={primaryKeyword}
                    onChange={(e) => setPrimaryKeyword(e.target.value)}
                    placeholder="مثال: أفضل منصات إنشاء المواقع"
                    className="font-['Cairo']"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1 font-['Cairo']">
                    الكلمة الأساسية التي تريد الترتيب عليها في جوجل
                  </p>
                </div>

                {/* Secondary Keywords */}
                <div>
                  <Label>الكلمات المفتاحية الثانوية</Label>
                  <Input
                    placeholder="اضغط Enter بعد كل كلمة"
                    className="font-['Cairo']"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !secondaryKeywords.includes(value)) {
                          setSecondaryKeywords([...secondaryKeywords, value])
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {secondaryKeywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="font-['Cairo']">
                        {kw}
                        <button
                          type="button"
                          onClick={() => setSecondaryKeywords(secondaryKeywords.filter((_, idx) => idx !== i))}
                          className="mr-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Article Objective */}
                <div>
                  <Label>هدف المقال</Label>
                  <Textarea
                    value={articleObjective}
                    onChange={(e) => setArticleObjective(e.target.value)}
                    placeholder="اكتب 2-3 جمل توضح الفوائد التي سيحصل عليها القارئ من هذا المقال"
                    className="font-['Cairo']"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Headline Optimization */}
          <TabsContent value="headline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-['Cairo']">تحسين العنوان</CardTitle>
                <CardDescription className="font-['Cairo']">
                  اكتب 5-10 عناوين واختر الأفضل (20-70 حرف، يحتوي الكلمة المفتاحية)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index} className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="headline"
                      checked={selectedHeadline === index}
                      onChange={() => setSelectedHeadline(index)}
                      className="mt-3"
                    />
                    <div className="flex-1">
                      <Input
                        value={headlineVariations[index] || ''}
                        onChange={(e) => {
                          const newVariations = [...headlineVariations]
                          newVariations[index] = e.target.value
                          setHeadlineVariations(newVariations)
                          // Auto-update titleAr if it's the first headline
                          if (index === 0 && !titleAr) {
                            setTitleAr(e.target.value)
                          }
                        }}
                        placeholder={`العنوان ${index + 1}`}
                        className="font-['Cairo']"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(headlineVariations[index] || '').length} حرف
                        {headlineVariations[index] && headlineVariations[index].length > 70 && (
                          <span className="text-amber-600 mr-2">⚠️ طويل جداً</span>
                        )}
                        {headlineVariations[index] && headlineVariations[index].length < 20 && (
                          <span className="text-amber-600 mr-2">⚠️ قصير جداً</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Content (Victorious Template Structure) */}
          <TabsContent value="content" className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Cairo']">الملخص (في أعلى المقال)</CardTitle>
                <CardDescription className="font-['Cairo']">
                  نقاط رئيسية في شكل قائمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="- النقطة الأولى&#10;- النقطة الثانية&#10;- النقطة الثالثة"
                  className="font-['Cairo']"
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Cairo']">المقدمة (~100 كلمة)</CardTitle>
                <CardDescription className="font-['Cairo']">
                  يجب أن تحتوي على الكلمة المفتاحية الرئيسية: "{primaryKeyword}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={introductionAr}
                  onChange={setIntroductionAr}
                  placeholder="اكتب مقدمة جذابة توضح المشكلة والحل..."
                  minWords={50}
                />
              </CardContent>
            </Card>

            {/* Body Points */}
            {[
              { title: 'النقطة الأولى', value: bodyPoint1Ar, setter: setBodyPoint1Ar },
              { title: 'النقطة الثانية', value: bodyPoint2Ar, setter: setBodyPoint2Ar },
              { title: 'النقطة الثالثة', value: bodyPoint3Ar, setter: setBodyPoint3Ar }
            ].map((point, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="font-['Cairo']">{point.title}</CardTitle>
                  <CardDescription className="font-['Cairo']">
                    فكرة داعمة للموضوع الرئيسي
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    content={point.value}
                    onChange={point.setter}
                    placeholder={`اكتب ${point.title} هنا...`}
                  />
                </CardContent>
              </Card>
            ))}

            {/* Conclusion */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Cairo']">الخاتمة (~60 كلمة)</CardTitle>
                <CardDescription className="font-['Cairo']">
                  تلخيص النقاط الرئيسية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={conclusionAr}
                  onChange={setConclusionAr}
                  placeholder="لخص أهم النقاط وأعد التأكيد على الفوائد..."
                  minWords={30}
                />
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Cairo']">دعوة لاتخاذ إجراء (CTA)</CardTitle>
                <CardDescription className="font-['Cairo']">
                  جملة واحدة (8 كلمات كحد أقصى)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="جرّب KW APPS اليوم مجاناً"
                  className="font-['Cairo']"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {ctaText.split(' ').filter(w => w).length} كلمة
                </p>
              </CardContent>
            </Card>

            {/* Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="font-['Cairo']">المصادر والبحث</CardTitle>
                <CardDescription className="font-['Cairo']">
                  روابط المراجع الخارجية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="أضف رابط واضغط Enter"
                  className="font-['Cairo']"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const value = e.currentTarget.value.trim()
                      if (value) {
                        setSources([...sources, value])
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
                <ul className="mt-2 space-y-1">
                  {sources.map((source, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <a href={source} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex-1 truncate">
                        {source}
                      </a>
                      <button
                        type="button"
                        onClick={() => setSources(sources.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700"
                      >
                        حذف
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: SEO & Publishing */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-['Cairo']">تحسين محركات البحث (SEO)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Meta Title */}
                <div>
                  <Label>عنوان الصفحة (Page Title) *</Label>
                  <Input
                    value={metaTitleAr}
                    onChange={(e) => setMetaTitleAr(e.target.value)}
                    placeholder="عنوان جذاب يحتوي على الكلمة المفتاحية"
                    className="font-['Cairo']"
                    maxLength={60}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {metaTitleAr.length}/60 حرف
                    {metaTitleAr.length > 60 && <span className="text-red-500 mr-2">⚠️ طويل جداً</span>}
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <Label>وصف الميتا (Meta Description) *</Label>
                  <Textarea
                    value={metaDescriptionAr}
                    onChange={(e) => setMetaDescriptionAr(e.target.value)}
                    placeholder="وصف مختصر يحتوي على الكلمات المفتاحية الثانوية"
                    className="font-['Cairo']"
                    maxLength={160}
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {metaDescriptionAr.length}/160 حرف
                    {metaDescriptionAr.length >= 110 && metaDescriptionAr.length <= 140 && (
                      <span className="text-green-600 mr-2">✓ طول مثالي</span>
                    )}
                  </p>
                </div>

                {/* Slug */}
                <div>
                  <Label>رابط المقال (Slug) *</Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="best-website-builders-kuwait"
                    className="font-['Cairo']"
                    dir="ltr"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    سيكون الرابط: kwapps.com/blog/{slug}
                  </p>
                </div>

                <Separator />

                {/* Category */}
                <div>
                  <Label>الفئة</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="font-['Cairo']">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="تقنية">تقنية</SelectItem>
                      <SelectItem value="تصميم">تصميم</SelectItem>
                      <SelectItem value="أعمال">أعمال</SelectItem>
                      <SelectItem value="تسويق">تسويق</SelectItem>
                      <SelectItem value="تطوير">تطوير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div>
                  <Label>الوسوم (Tags)</Label>
                  <Input
                    placeholder="اضغط Enter بعد كل وسم"
                    className="font-['Cairo']"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value && !tags.includes(value)) {
                          setTags([...tags, value])
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, i) => (
                      <Badge key={i} className="font-['Cairo']">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                          className="mr-1"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <Label>الصورة المميزة (رابط)</Label>
                  <Input
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://..."
                    className="font-['Cairo']"
                    dir="ltr"
                  />
                  {featuredImage && (
                    <img src={featuredImage} alt="معاينة" className="mt-2 rounded-lg max-h-40 object-cover" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="font-['Cairo']"
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            className="font-['Cairo']"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ كمسودة'}
          </Button>

          <Button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="font-['Cairo']"
          >
            {isSubmitting ? 'جاري النشر...' : 'نشر الآن'}
          </Button>
        </div>
      </form>
    </div>
  )
}
