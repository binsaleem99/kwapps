'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Eye, Users, Clock, TrendingUp, Share2, MessageSquare, Heart } from 'lucide-react'

interface BlogAnalytics {
  id: string
  title_ar: string
  title_en: string
  view_count: number
  unique_views: number
  avg_time_on_page: number
  scroll_depth_avg: number
  bounce_rate: number
  engagement_score: number
}

interface AnalyticsSummary {
  total_views: number
  total_unique_views: number
  avg_time_on_page: number
  avg_scroll_depth: number
  avg_bounce_rate: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function BlogAnalyticsPage() {
  const [topBlogs, setTopBlogs] = useState<BlogAnalytics[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary>({
    total_views: 0,
    total_unique_views: 0,
    avg_time_on_page: 0,
    avg_scroll_depth: 0,
    avg_bounce_rate: 0
  })
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  async function loadAnalytics() {
    setLoading(true)
    try {
      // Get top performing blogs using the database function
      const { data: topBlogsData, error: topBlogsError } = await supabase
        .rpc('get_top_blogs', { limit_count: 10 })

      if (topBlogsError) throw topBlogsError
      setTopBlogs(topBlogsData || [])

      // Calculate summary statistics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('blog_post_analytics')
        .select('*')

      if (analyticsError) throw analyticsError

      if (analyticsData && analyticsData.length > 0) {
        const totalViews = analyticsData.reduce((sum, item) => sum + (item.view_count || 0), 0)
        const totalUniqueViews = analyticsData.reduce((sum, item) => sum + (item.unique_views || 0), 0)
        const avgTime = analyticsData.reduce((sum, item) => sum + (item.avg_time_on_page || 0), 0) / analyticsData.length
        const avgScroll = analyticsData.reduce((sum, item) => sum + (item.scroll_depth_avg || 0), 0) / analyticsData.length
        const avgBounce = analyticsData.reduce((sum, item) => sum + (parseFloat(item.bounce_rate) || 0), 0) / analyticsData.length

        setSummary({
          total_views: Math.round(totalViews),
          total_unique_views: Math.round(totalUniqueViews),
          avg_time_on_page: Math.round(avgTime),
          avg_scroll_depth: Math.round(avgScroll),
          avg_bounce_rate: parseFloat(avgBounce.toFixed(2))
        })
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Prepare chart data
  const engagementChartData = topBlogs.slice(0, 5).map(blog => ({
    name: blog.title_ar?.substring(0, 20) + '...' || blog.title_en?.substring(0, 20) + '...' || 'Untitled',
    views: blog.view_count,
    uniqueViews: blog.unique_views,
    timeOnPage: Math.round(blog.avg_time_on_page / 60) // Convert to minutes
  }))

  const scrollDepthData = topBlogs.slice(0, 5).map(blog => ({
    name: blog.title_ar?.substring(0, 20) + '...' || blog.title_en?.substring(0, 20) + '...' || 'Untitled',
    scrollDepth: blog.scroll_depth_avg,
    bounceRate: parseFloat(blog.bounce_rate.toString())
  }))

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Cairo, sans-serif' }}>
            تحليلات المدونة
          </h1>
          <p className="text-gray-600 mt-2">
            متابعة الأداء والتفاعل مع المحتوى
          </p>
        </div>

        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)} dir="rtl">
          <TabsList>
            <TabsTrigger value="7d">7 أيام</TabsTrigger>
            <TabsTrigger value="30d">30 يوم</TabsTrigger>
            <TabsTrigger value="90d">90 يوم</TabsTrigger>
            <TabsTrigger value="all">كل الوقت</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_views.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">جميع المشاهدات</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">زوار فريدون</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_unique_views.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">مستخدمون مختلفون</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط الوقت</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(summary.avg_time_on_page)}</div>
                <p className="text-xs text-muted-foreground">في الصفحة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">عمق التصفح</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.avg_scroll_depth}%</div>
                <p className="text-xs text-muted-foreground">متوسط</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل الارتداد</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.avg_bounce_rate}%</div>
                <p className="text-xs text-muted-foreground">متوسط</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Engagement Chart */}
            <Card>
              <CardHeader>
                <CardTitle>المشاهدات والتفاعل</CardTitle>
                <CardDescription>أعلى 5 مقالات من حيث المشاهدات والزوار</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#0088FE" name="المشاهدات" />
                    <Bar dataKey="uniqueViews" fill="#00C49F" name="الزوار الفريدون" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scroll Depth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>عمق التصفح ومعدل الارتداد</CardTitle>
                <CardDescription>تحليل سلوك القراءة للمقالات</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scrollDepthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="scrollDepth" stroke="#8884d8" name="عمق التصفح %" strokeWidth={2} />
                    <Line type="monotone" dataKey="bounceRate" stroke="#ff8042" name="معدل الارتداد %" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Blogs Table */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل المقالات أداءً</CardTitle>
              <CardDescription>مرتبة حسب درجة التفاعل الإجمالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full" dir="rtl">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3 font-semibold">المرتبة</th>
                      <th className="text-right p-3 font-semibold">العنوان</th>
                      <th className="text-right p-3 font-semibold">المشاهدات</th>
                      <th className="text-right p-3 font-semibold">زوار فريدون</th>
                      <th className="text-right p-3 font-semibold">متوسط الوقت</th>
                      <th className="text-right p-3 font-semibold">عمق التصفح</th>
                      <th className="text-right p-3 font-semibold">معدل الارتداد</th>
                      <th className="text-right p-3 font-semibold">درجة التفاعل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBlogs.map((blog, index) => (
                      <tr key={blog.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="font-medium truncate">
                            {blog.title_ar || blog.title_en || 'Untitled'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-400" />
                            {blog.view_count.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            {blog.unique_views.toLocaleString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatTime(blog.avg_time_on_page)}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            {blog.scroll_depth_avg}%
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            parseFloat(blog.bounce_rate.toString()) > 70
                              ? 'bg-red-100 text-red-800'
                              : parseFloat(blog.bounce_rate.toString()) > 40
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {parseFloat(blog.bounce_rate.toString()).toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-primary">
                            {Math.round(blog.engagement_score).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {topBlogs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>لا توجد بيانات تحليلية حتى الآن</p>
                    <p className="text-sm mt-2">ستظهر الإحصائيات بعد نشر المقالات وبدء التفاعل معها</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
