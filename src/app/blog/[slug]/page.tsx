import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BlogPostView } from '@/components/blog/blog-post-view'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params

  const { data: post } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_seo_metadata (
        meta_title_ar,
        meta_title_en,
        meta_description_ar,
        meta_description_en,
        og_title,
        og_description,
        og_image,
        twitter_title,
        twitter_description,
        twitter_image,
        primary_keyword,
        secondary_keywords
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) {
    return {
      title: 'المقال غير موجود',
      description: 'لم يتم العثور على المقال المطلوب'
    }
  }

  const seoMeta = post.blog_seo_metadata?.[0]

  return {
    title: seoMeta?.meta_title_ar || post.title_ar || post.title_en,
    description: seoMeta?.meta_description_ar || post.excerpt_ar || post.excerpt_en,
    keywords: [
      seoMeta?.primary_keyword,
      ...(seoMeta?.secondary_keywords || []),
      ...(post.seo_keywords || [])
    ].filter(Boolean),
    authors: post.author_id ? [{ name: 'KW APPS' }] : [],
    openGraph: {
      title: seoMeta?.og_title || seoMeta?.meta_title_ar || post.title_ar,
      description: seoMeta?.og_description || seoMeta?.meta_description_ar || post.excerpt_ar,
      images: seoMeta?.og_image || post.featured_image ? [
        {
          url: seoMeta?.og_image || post.featured_image || '',
          alt: post.title_ar || post.title_en
        }
      ] : [],
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      locale: 'ar_AR',
      siteName: 'KW APPS'
    },
    twitter: {
      card: 'summary_large_image',
      title: seoMeta?.twitter_title || seoMeta?.meta_title_ar || post.title_ar,
      description: seoMeta?.twitter_description || seoMeta?.meta_description_ar || post.excerpt_ar,
      images: seoMeta?.twitter_image || seoMeta?.og_image || post.featured_image ? [
        seoMeta?.twitter_image || seoMeta?.og_image || post.featured_image || ''
      ] : []
    },
    alternates: {
      canonical: `/blog/${slug}`
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_seo_metadata (
        target_audience,
        funnel_stage,
        primary_keyword,
        secondary_keywords,
        estimated_reading_time,
        internal_links,
        external_sources
      ),
      blog_template_sections (
        section_type,
        title,
        content_ar,
        content_en,
        display_order,
        word_count
      ),
      blog_post_analytics (
        view_count,
        unique_views,
        avg_time_on_page,
        scroll_depth_avg,
        shares_count,
        comments_count,
        likes_count
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !post) {
    notFound()
  }

  const seoMeta = post.blog_seo_metadata?.[0]
  const sections = post.blog_template_sections || []
  const analytics = post.blog_post_analytics?.[0]

  // Sort sections by display order
  sections.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))

  return (
    <BlogPostView
      post={{
        id: post.id,
        slug: post.slug,
        title_ar: post.title_ar,
        title_en: post.title_en,
        content_ar: post.content_ar,
        content_en: post.content_en,
        excerpt_ar: post.excerpt_ar,
        excerpt_en: post.excerpt_en,
        featured_image: post.featured_image,
        category: post.category,
        tags: post.tags || [],
        published_at: post.published_at,
        updated_at: post.updated_at,
        view_count: analytics?.view_count || post.view_count || 0,
        reading_time: seoMeta?.estimated_reading_time || 5,
        author: {
          name: 'KW APPS',
          avatar: '/logo.png'
        }
      }}
      sections={sections.map((s: any) => ({
        type: s.section_type,
        title: s.title,
        content_ar: s.content_ar,
        content_en: s.content_en
      }))}
      seoData={{
        primary_keyword: seoMeta?.primary_keyword,
        secondary_keywords: seoMeta?.secondary_keywords || [],
        internal_links: seoMeta?.internal_links || [],
        external_sources: seoMeta?.external_sources || []
      }}
    />
  )
}

export async function generateStaticParams() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)

  return posts?.map((post) => ({
    slug: post.slug
  })) || []
}
