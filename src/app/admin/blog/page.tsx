'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface BlogPost {
  id: string
  title_ar: string
  title_en: string
  slug: string
  category: string
  published: boolean
  view_count: number
  created_at: string
  published_at: string | null
}

export default function BlogAdminPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const supabase = createClient()
    setIsLoading(true)

    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title_ar, title_en, slug, category, published, view_count, created_at, published_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      toast.error('فشل تحميل المقالات')
    } else {
      setPosts(data || [])
    }

    setIsLoading(false)
  }

  async function togglePublished(postId: string, currentStatus: boolean) {
    const supabase = createClient()

    const updates: any = {
      published: !currentStatus,
      updated_at: new Date().toISOString(),
    }

    // If publishing for the first time, set published_at
    if (!currentStatus) {
      updates.published_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', postId)

    if (error) {
      console.error('Error toggling publish status:', error)
      toast.error('فشل تحديث حالة النشر')
    } else {
      toast.success(currentStatus ? 'تم إلغاء النشر' : 'تم النشر بنجاح')
      fetchPosts()
    }
  }

  async function deletePost(postId: string) {
    if (!confirm('هل أنت متأكد من حذف هذه المقالة؟')) return

    const supabase = createClient()

    const { error } = await supabase.from('blog_posts').delete().eq('id', postId)

    if (error) {
      console.error('Error deleting post:', error)
      toast.error('فشل حذف المقالة')
    } else {
      toast.success('تم حذف المقالة بنجاح')
      fetchPosts()
    }
  }

  const publishedCount = posts.filter((p) => p.published).length
  const draftCount = posts.filter((p) => !p.published).length
  const totalViews = posts.reduce((sum, p) => sum + p.view_count, 0)

  return (
    <div className="p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-['Cairo']">إدارة المدونة</h1>
            <p className="text-gray-600 mt-2 font-['Cairo']">
              إنشاء وتحرير مقالات المدونة مع تحسين SEO
            </p>
          </div>
          <Button onClick={() => router.push('/admin/blog/new')} className="font-['Cairo']">
            <Plus className="w-4 h-4 ml-2" />
            مقالة جديدة
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 font-['Cairo']">
                المقالات المنشورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 font-['Cairo']">
                {publishedCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 font-['Cairo']">
                المسودات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 font-['Cairo']">
                {draftCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 font-['Cairo']">
                إجمالي المشاهدات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 font-['Cairo']">
                {totalViews.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-['Cairo']">جميع المقالات</CardTitle>
            <CardDescription className="font-['Cairo']">
              قائمة بجميع مقالات المدونة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 font-['Cairo']">جاري التحميل...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-['Cairo']">
                لا توجد مقالات بعد. ابدأ بإنشاء أول مقالة!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-['Cairo']">العنوان</TableHead>
                    <TableHead className="text-right font-['Cairo']">الفئة</TableHead>
                    <TableHead className="text-right font-['Cairo']">المشاهدات</TableHead>
                    <TableHead className="text-right font-['Cairo']">الحالة</TableHead>
                    <TableHead className="text-right font-['Cairo']">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right font-['Cairo']">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium font-['Cairo']">
                        <div>
                          <div className="text-gray-900">{post.title_ar}</div>
                          <div className="text-sm text-gray-500">{post.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-['Cairo']">
                        <Badge>{post.category}</Badge>
                      </TableCell>
                      <TableCell className="font-['Cairo']">{post.view_count}</TableCell>
                      <TableCell>
                        <Badge
                          variant={post.published ? 'default' : 'secondary'}
                          className="font-['Cairo']"
                        >
                          {post.published ? 'منشور' : 'مسودة'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-['Cairo']">
                        {new Date(post.created_at).toLocaleDateString('ar-KW')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/blog/${post.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePublished(post.id, post.published)}
                          >
                            {post.published ? (
                              <EyeOff className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
