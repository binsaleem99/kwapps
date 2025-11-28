'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Clock, Eye, Calendar, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface BlogPostViewProps {
  post: {
    id: string
    slug: string
    title_ar: string | null
    title_en: string | null
    content_ar: string | null
    content_en: string | null
    excerpt_ar: string | null
    excerpt_en: string | null
    featured_image: string | null
    category: string | null
    tags: string[]
    published_at: string | null
    updated_at: string | null
    view_count: number
    reading_time: number
    author: {
      name: string
      avatar: string
    }
  }
  sections: Array<{
    type: string
    title: string | null
    content_ar: string | null
    content_en: string | null
  }>
  seoData: {
    primary_keyword?: string
    secondary_keywords: string[]
    internal_links: string[]
    external_sources: string[]
  }
}

export function BlogPostView({ post, sections, seoData }: BlogPostViewProps) {
  const [scrollDepth, setScrollDepth] = useState(0)
  const [timeOnPage, setTimeOnPage] = useState(0)
  const [sessionId] = useState(() => {
    // Generate or retrieve session ID
    if (typeof window !== 'undefined') {
      let sid = sessionStorage.getItem('blog_session_id')
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
        sessionStorage.setItem('blog_session_id', sid)
      }
      return sid
    }
    return ''
  })
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const contentRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    // Track initial page view
    trackPageView()

    // Track time on page
    const timeInterval = setInterval(() => {
      setTimeOnPage(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100)
      setScrollDepth(Math.max(scrollDepth, Math.min(100, scrollPercentage)))
    }

    window.addEventListener('scroll', handleScroll)

    // Track when user leaves
    const handleBeforeUnload = () => {
      trackPageViewDetails()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(timeInterval)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      trackPageViewDetails()
    }
  }, [])

  async function trackPageView() {
    if (hasTrackedView) return

    try {
      // Check if this is a unique view (first time in this session)
      const isUnique = !sessionStorage.getItem(`viewed_${post.id}`)

      // Increment view count using the database function
      await supabase.rpc('increment_blog_view_count', {
        post_id: post.id,
        is_unique: isUnique
      })

      if (isUnique) {
        sessionStorage.setItem(`viewed_${post.id}`, 'true')
      }

      setHasTrackedView(true)
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  async function trackPageViewDetails() {
    if (!hasTrackedView) return

    try {
      const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000)

      // Get device and browser info
      const userAgent = navigator.userAgent
      let deviceType = 'desktop'
      if (/mobile/i.test(userAgent)) deviceType = 'mobile'
      else if (/tablet/i.test(userAgent)) deviceType = 'tablet'

      let browser = 'unknown'
      if (userAgent.includes('Chrome')) browser = 'Chrome'
      else if (userAgent.includes('Safari')) browser = 'Safari'
      else if (userAgent.includes('Firefox')) browser = 'Firefox'
      else if (userAgent.includes('Edge')) browser = 'Edge'

      // Insert detailed page view record
      await supabase.from('blog_page_views').insert({
        blog_post_id: post.id,
        session_id: sessionId,
        time_on_page: currentTime,
        scroll_depth: scrollDepth,
        referrer: document.referrer || null,
        device_type: deviceType,
        browser: browser,
        os: navigator.platform
      })

      // Update aggregate metrics
      await supabase.rpc('update_blog_engagement_metrics', {
        post_id: post.id
      })
    } catch (error) {
      console.error('Error tracking page view details:', error)
    }
  }

  async function handleShare(platform: 'facebook' | 'twitter' | 'linkedin' | 'copy') {
    const url = `${window.location.origin}/blog/${post.slug}`
    const title = post.title_ar || post.title_en || ''

    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        alert('تم نسخ الرابط!')
        setShowShareMenu(false)
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      setShowShareMenu(false)

      // Track share event
      try {
        await supabase
          .from('blog_post_analytics')
          .update({ shares_count: post.view_count + 1 })
          .eq('blog_post_id', post.id)
      } catch (error) {
        console.error('Error tracking share:', error)
      }
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <article className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Category & Reading Time */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {post.category && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {post.category}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.reading_time} دقائق قراءة</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.view_count.toLocaleString()} مشاهدة</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>
            {post.title_ar || post.title_en}
          </h1>

          {/* Excerpt */}
          {(post.excerpt_ar || post.excerpt_en) && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.excerpt_ar || post.excerpt_en}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-3">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <div className="font-medium">{post.author.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {formatDate(post.published_at)}
                </div>
              </div>
            </div>

            {/* Share Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                مشاركة
              </Button>

              {showShareMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-10">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded text-right"
                  >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    فيسبوك
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded text-right"
                  >
                    <Twitter className="w-4 h-4 text-sky-500" />
                    تويتر
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded text-right"
                  >
                    <Linkedin className="w-4 h-4 text-blue-700" />
                    لينكد إن
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded text-right"
                  >
                    <LinkIcon className="w-4 h-4 text-gray-600" />
                    نسخ الرابط
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="container mx-auto px-4 max-w-4xl -mt-8 mb-12">
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-xl">
            <Image
              src={post.featured_image}
              alt={post.title_ar || post.title_en || 'Blog post image'}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12" ref={contentRef}>
          <div
            className="prose prose-lg max-w-none prose-headings:font-cairo prose-headings:font-bold prose-a:text-primary hover:prose-a:underline"
            style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}
            dangerouslySetInnerHTML={{ __html: post.content_ar || post.content_en || '' }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {seoData.external_sources && seoData.external_sources.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-bold mb-4">المصادر</h3>
              <ul className="space-y-2">
                {seoData.external_sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Related Internal Links */}
        {seoData.internal_links && seoData.internal_links.length > 0 && (
          <Card className="mt-8 p-6">
            <h3 className="text-xl font-bold mb-4">مقالات ذات صلة</h3>
            <div className="grid gap-3">
              {seoData.internal_links.slice(0, 3).map((link, index) => (
                <Link
                  key={index}
                  href={link}
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <span>←</span>
                  {link}
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-150"
        style={{ width: `${scrollDepth}%` }}
      />
    </article>
  )
}
