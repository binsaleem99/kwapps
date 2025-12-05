// ==============================================
// KW APPS - Admin Dashboard Generator
// ==============================================
// Generates admin dashboard UI code based on
// detected schema from generated client apps
// ==============================================

import {
  type ProjectSchema,
  type ContentSection,
  type ContentType,
  type EditableField,
  CONTENT_TYPE_FIELDS,
} from './schema-analyzer'

/**
 * Generated dashboard output
 */
export interface GeneratedDashboard {
  // Main dashboard component
  dashboardCode: string
  // Individual section components
  sectionComponents: Record<string, string>
  // API routes for CRUD operations
  apiRoutes: Record<string, string>
  // SQL migrations for admin tables
  migrations: string
  // Summary of generated components
  summary: {
    totalSections: number
    contentTypes: ContentType[]
    hasAuth: boolean
    hasEcommerce: boolean
  }
}

/**
 * Dashboard configuration options
 */
export interface DashboardConfig {
  projectId: string
  projectName: string
  schema: ProjectSchema
  primaryColor?: string
  accentColor?: string
}

/**
 * Dashboard Generator Class
 */
export class DashboardGenerator {
  private config: DashboardConfig

  constructor(config: DashboardConfig) {
    this.config = config
  }

  /**
   * Generate complete admin dashboard
   */
  generate(): GeneratedDashboard {
    const { schema } = this.config

    // Generate main dashboard component
    const dashboardCode = this.generateMainDashboard()

    // Generate section components
    const sectionComponents: Record<string, string> = {}
    for (const section of schema.sections) {
      sectionComponents[section.type] = this.generateSectionComponent(section)
    }

    // Generate API routes
    const apiRoutes: Record<string, string> = {}
    for (const section of schema.sections) {
      apiRoutes[section.type] = this.generateAPIRoute(section)
    }

    // Generate migrations
    const migrations = this.generateMigrations()

    return {
      dashboardCode,
      sectionComponents,
      apiRoutes,
      migrations,
      summary: {
        totalSections: schema.sections.length,
        contentTypes: schema.sections.map(s => s.type),
        hasAuth: schema.hasAuth,
        hasEcommerce: schema.hasEcommerce,
      },
    }
  }

  /**
   * Generate main dashboard layout
   */
  private generateMainDashboard(): string {
    const { schema, projectName, projectId } = this.config

    const sidebarItems = schema.sections.map(section => {
      const icons = this.getIconForType(section.type)
      return `{ label: '${section.labelAr}', href: '/admin/${projectId}/${section.type}', icon: ${icons} }`
    })

    return `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  MessageSquare,
  Image,
  DollarSign,
  HelpCircle,
  BookOpen,
  Phone,
  Briefcase,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', href: '/admin/${projectId}', icon: LayoutDashboard },
  ${sidebarItems.join(',\n  ')},
  { label: 'الإعدادات', href: '/admin/${projectId}/settings', icon: Settings },
]

export default function AdminDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-slate-900 text-white z-50 transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold font-cairo">${projectName}</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-cairo',
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Back to site */}
        <div className="absolute bottom-4 right-4 left-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-cairo">
            <ChevronLeft className="h-4 w-4" />
            <span>العودة للوحة الرئيسية</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:mr-64">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-cairo">لوحة تحكم المشروع</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

/**
 * Dashboard Overview Component
 */
export function DashboardOverview() {
  const stats = [
    ${this.generateStatsCards()}
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 font-cairo">نظرة عامة</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 font-cairo">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-cairo">{stat.value}</div>
              {stat.change && (
                <p className={cn(
                  'text-xs mt-1 font-cairo',
                  stat.change > 0 ? 'text-green-500' : 'text-red-500'
                )}>
                  {stat.change > 0 ? '+' : ''}{stat.change}% من الشهر الماضي
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-cairo">النشاط الأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500 text-center py-8 font-cairo">
            لا يوجد نشاط حديث
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
`
  }

  /**
   * Generate stats cards based on content types
   */
  private generateStatsCards(): string {
    const { schema } = this.config
    const stats: string[] = []

    for (const section of schema.sections) {
      const icon = this.getIconForType(section.type)
      stats.push(`{ label: '${section.labelAr}', value: '0', icon: ${icon}, change: 0 }`)
    }

    // Add analytics if not present
    if (!schema.sections.find(s => s.type === 'gallery')) {
      stats.push(`{ label: 'الزوار', value: '0', icon: BarChart3, change: 0 }`)
    }

    return stats.join(',\n    ')
  }

  /**
   * Generate component for a specific content section
   */
  private generateSectionComponent(section: ContentSection): string {
    switch (section.type) {
      case 'products':
        return this.generateProductsComponent(section)
      case 'services':
        return this.generateServicesComponent(section)
      case 'pages':
        return this.generatePagesComponent(section)
      case 'forms':
        return this.generateFormsComponent(section)
      case 'testimonials':
        return this.generateTestimonialsComponent(section)
      case 'team_members':
        return this.generateTeamComponent(section)
      case 'gallery':
        return this.generateGalleryComponent(section)
      case 'pricing':
        return this.generatePricingComponent(section)
      case 'faq':
        return this.generateFAQComponent(section)
      case 'blog':
        return this.generateBlogComponent(section)
      case 'contact':
        return this.generateContactComponent(section)
      case 'users':
        return this.generateUsersComponent(section)
      default:
        return this.generateGenericComponent(section)
    }
  }

  /**
   * Generate Products management component (CRUD table)
   */
  private generateProductsComponent(section: ContentSection): string {
    const { projectId } = this.config

    return `'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface Product {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  price: number
  originalPrice?: number
  image?: string
  category?: string
  inStock: boolean
  featured: boolean
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const res = await fetch('/api/projects/${projectId}/admin/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(product: Partial<Product>) {
    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const res = await fetch('/api/projects/${projectId}/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct ? { ...editingProduct, ...product } : product),
      })

      if (res.ok) {
        fetchProducts()
        setIsDialogOpen(false)
        setEditingProduct(null)
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

    try {
      await fetch('/api/projects/${projectId}/admin/products?id=' + id, {
        method: 'DELETE',
      })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter(p =>
    p.nameAr?.includes(searchQuery) || p.name?.includes(searchQuery)
  )

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 font-cairo">المنتجات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة منتج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-cairo">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="البحث في المنتجات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 font-cairo"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-cairo">
              لا توجد منتجات
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-cairo">الصورة</TableHead>
                  <TableHead className="text-right font-cairo">الاسم</TableHead>
                  <TableHead className="text-right font-cairo">السعر</TableHead>
                  <TableHead className="text-right font-cairo">المتوفر</TableHead>
                  <TableHead className="text-right font-cairo">مميز</TableHead>
                  <TableHead className="text-right font-cairo">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.nameAr}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-slate-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-cairo font-medium">
                      {product.nameAr || product.name}
                    </TableCell>
                    <TableCell className="font-cairo">
                      {product.price} د.ك
                      {product.originalPrice && (
                        <span className="text-slate-400 line-through mr-2">
                          {product.originalPrice}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={product.inStock ? 'text-green-500' : 'text-red-500'}>
                        {product.inStock ? 'متوفر' : 'غير متوفر'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={product.featured ? 'text-blue-500' : 'text-slate-400'}>
                        {product.featured ? 'نعم' : 'لا'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
  )
}

function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product | null
  onSave: (product: Partial<Product>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    nameAr: product?.nameAr || '',
    description: product?.description || '',
    descriptionAr: product?.descriptionAr || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    image: product?.image || '',
    category: product?.category || '',
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(formData)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-cairo">الاسم (عربي)</Label>
          <Input
            value={formData.nameAr}
            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
            className="font-cairo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="font-cairo">الاسم (إنجليزي)</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-cairo">الوصف (عربي)</Label>
        <Textarea
          value={formData.descriptionAr}
          onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
          className="font-cairo"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-cairo">السعر (د.ك)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="font-cairo">السعر الأصلي (اختياري)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-cairo">رابط الصورة</Label>
        <Input
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.inStock}
            onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
          />
          <Label className="font-cairo">متوفر</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
          />
          <Label className="font-cairo">منتج مميز</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {product ? 'حفظ التغييرات' : 'إضافة المنتج'}
        </Button>
      </div>
    </form>
  )
}
`
  }

  /**
   * Generate Services component
   */
  private generateServicesComponent(section: ContentSection): string {
    return this.generateListComponent(section, 'services', 'الخدمات', [
      { key: 'nameAr', label: 'الاسم', type: 'text' },
      { key: 'descriptionAr', label: 'الوصف', type: 'textarea' },
      { key: 'price', label: 'السعر', type: 'number' },
      { key: 'icon', label: 'الأيقونة', type: 'text' },
      { key: 'featured', label: 'مميز', type: 'boolean' },
    ])
  }

  /**
   * Generate Pages component (content editor)
   */
  private generatePagesComponent(section: ContentSection): string {
    const { projectId } = this.config

    return `'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Page {
  id: string
  title: string
  titleAr: string
  slug: string
  content: string
  contentAr: string
  metaTitle?: string
  metaDescription?: string
  published: boolean
  createdAt: string
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchPages()
  }, [])

  async function fetchPages() {
    try {
      const res = await fetch('/api/projects/${projectId}/admin/pages')
      const data = await res.json()
      setPages(data.pages || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(page: Partial<Page>) {
    try {
      const method = editingPage ? 'PUT' : 'POST'
      const res = await fetch('/api/projects/${projectId}/admin/pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPage ? { ...editingPage, ...page } : page),
      })

      if (res.ok) {
        fetchPages()
        setIsDialogOpen(false)
        setEditingPage(null)
      }
    } catch (error) {
      console.error('Error saving page:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return

    try {
      await fetch('/api/projects/${projectId}/admin/pages?id=' + id, {
        method: 'DELETE',
      })
      fetchPages()
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 font-cairo">الصفحات</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPage(null)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة صفحة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-cairo">
                {editingPage ? 'تعديل الصفحة' : 'إضافة صفحة جديدة'}
              </DialogTitle>
            </DialogHeader>
            <PageForm
              page={editingPage}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 text-slate-500 font-cairo">
          لا توجد صفحات
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <CardTitle className="font-cairo text-lg flex items-center justify-between">
                  <span>{page.titleAr || page.title}</span>
                  <span className={page.published ? 'text-green-500 text-xs' : 'text-slate-400 text-xs'}>
                    {page.published ? 'منشور' : 'مسودة'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 font-cairo mb-4 line-clamp-2">
                  {page.contentAr?.substring(0, 100) || page.content?.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPage(page)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function PageForm({
  page,
  onSave,
  onCancel,
}: {
  page: Page | null
  onSave: (page: Partial<Page>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: page?.title || '',
    titleAr: page?.titleAr || '',
    slug: page?.slug || '',
    content: page?.content || '',
    contentAr: page?.contentAr || '',
    metaTitle: page?.metaTitle || '',
    metaDescription: page?.metaDescription || '',
    published: page?.published ?? false,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(formData)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-cairo">العنوان (عربي)</Label>
          <Input
            value={formData.titleAr}
            onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
            className="font-cairo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="font-cairo">العنوان (إنجليزي)</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-cairo">الرابط (slug)</Label>
        <Input
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="about-us"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label className="font-cairo">المحتوى (عربي)</Label>
        <Textarea
          value={formData.contentAr}
          onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
          className="font-cairo min-h-[200px]"
          rows={8}
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="font-bold font-cairo mb-3">إعدادات SEO</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="font-cairo">عنوان الصفحة (Meta Title)</Label>
            <Input
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              className="font-cairo"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-cairo">وصف الصفحة (Meta Description)</Label>
            <Textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="font-cairo"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {page ? 'حفظ التغييرات' : 'إضافة الصفحة'}
        </Button>
      </div>
    </form>
  )
}
`
  }

  /**
   * Generate Forms submissions viewer
   */
  private generateFormsComponent(section: ContentSection): string {
    const { projectId } = this.config

    return `'use client'

import { useState, useEffect } from 'react'
import { Trash2, Eye, Download, Loader2, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface FormSubmission {
  id: string
  formType: string
  data: Record<string, string>
  read: boolean
  createdAt: string
}

export default function FormsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    try {
      const res = await fetch('/api/projects/${projectId}/admin/forms')
      const data = await res.json()
      setSubmissions(data.submissions || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch('/api/projects/${projectId}/admin/forms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      })
      fetchSubmissions()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return

    try {
      await fetch('/api/projects/${projectId}/admin/forms?id=' + id, {
        method: 'DELETE',
      })
      fetchSubmissions()
    } catch (error) {
      console.error('Error deleting submission:', error)
    }
  }

  function exportToCSV() {
    const headers = ['التاريخ', 'النوع', ...Object.keys(submissions[0]?.data || {})]
    const rows = submissions.map(s => [
      new Date(s.createdAt).toLocaleDateString('ar-KW'),
      s.formType,
      ...Object.values(s.data),
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'form-submissions.csv'
    link.click()
  }

  const unreadCount = submissions.filter(s => !s.read).length

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900 font-cairo">النماذج والرسائل</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} جديد</Badge>
          )}
        </div>
        <Button variant="outline" onClick={exportToCSV} disabled={submissions.length === 0}>
          <Download className="h-4 w-4 ml-2" />
          تصدير CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-cairo">
              لا توجد رسائل
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-cairo">الحالة</TableHead>
                  <TableHead className="text-right font-cairo">التاريخ</TableHead>
                  <TableHead className="text-right font-cairo">النوع</TableHead>
                  <TableHead className="text-right font-cairo">البيانات</TableHead>
                  <TableHead className="text-right font-cairo">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id} className={!submission.read ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <Badge variant={submission.read ? 'secondary' : 'default'}>
                        {submission.read ? 'مقروء' : 'جديد'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-cairo">
                      {new Date(submission.createdAt).toLocaleDateString('ar-KW')}
                    </TableCell>
                    <TableCell className="font-cairo">{submission.formType}</TableCell>
                    <TableCell className="font-cairo">
                      <div className="flex items-center gap-2">
                        {submission.data.email && (
                          <span className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {submission.data.email}
                          </span>
                        )}
                        {submission.data.phone && (
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {submission.data.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(submission)
                            if (!submission.read) markAsRead(submission.id)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(submission.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* View Submission Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-cairo">تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="text-sm text-slate-500 font-cairo">
                {new Date(selectedSubmission.createdAt).toLocaleString('ar-KW')}
              </div>
              {Object.entries(selectedSubmission.data).map(([key, value]) => (
                <div key={key} className="border-b pb-2">
                  <div className="text-sm font-medium text-slate-500 font-cairo">{key}</div>
                  <div className="font-cairo">{value}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
`
  }

  /**
   * Generate generic list component for other content types
   */
  private generateListComponent(
    section: ContentSection,
    type: string,
    title: string,
    fields: { key: string; label: string; type: string }[]
  ): string {
    const { projectId } = this.config

    return `'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface Item {
  id: string
  ${fields.map(f => `${f.key}: ${f.type === 'number' ? 'number' : f.type === 'boolean' ? 'boolean' : 'string'}`).join('\n  ')}
  createdAt: string
}

export default function ${type.charAt(0).toUpperCase() + type.slice(1)}Page() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const res = await fetch('/api/projects/${projectId}/admin/${type}')
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(item: Partial<Item>) {
    try {
      const method = editingItem ? 'PUT' : 'POST'
      await fetch('/api/projects/${projectId}/admin/${type}', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem ? { ...editingItem, ...item } : item),
      })
      fetchItems()
      setIsDialogOpen(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من الحذف؟')) return

    try {
      await fetch('/api/projects/${projectId}/admin/${type}?id=' + id, {
        method: 'DELETE',
      })
      fetchItems()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 font-cairo">${title}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle className="font-cairo">
                {editingItem ? 'تعديل' : 'إضافة جديد'}
              </DialogTitle>
            </DialogHeader>
            <ItemForm
              item={editingItem}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-cairo">
              لا توجد عناصر
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  ${fields.slice(0, 3).map(f => `<TableHead className="text-right font-cairo">${f.label}</TableHead>`).join('\n                  ')}
                  <TableHead className="text-right font-cairo">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    ${fields.slice(0, 3).map(f => `<TableCell className="font-cairo">{${f.type === 'boolean' ? `item.${f.key} ? 'نعم' : 'لا'` : `item.${f.key}`}}</TableCell>`).join('\n                    ')}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
  )
}

function ItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: Item | null
  onSave: (item: Partial<Item>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    ${fields.map(f => `${f.key}: item?.${f.key} || ${f.type === 'number' ? '0' : f.type === 'boolean' ? 'false' : "''"}`).join(',\n    ')}
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(formData)
      }}
      className="space-y-4"
    >
      ${fields.map(f => {
        if (f.type === 'textarea') {
          return `<div className="space-y-2">
        <Label className="font-cairo">${f.label}</Label>
        <Textarea
          value={formData.${f.key}}
          onChange={(e) => setFormData({ ...formData, ${f.key}: e.target.value })}
          className="font-cairo"
          rows={3}
        />
      </div>`
        } else if (f.type === 'boolean') {
          return `<div className="flex items-center gap-2">
        <Switch
          checked={formData.${f.key}}
          onCheckedChange={(checked) => setFormData({ ...formData, ${f.key}: checked })}
        />
        <Label className="font-cairo">${f.label}</Label>
      </div>`
        } else if (f.type === 'number') {
          return `<div className="space-y-2">
        <Label className="font-cairo">${f.label}</Label>
        <Input
          type="number"
          value={formData.${f.key}}
          onChange={(e) => setFormData({ ...formData, ${f.key}: parseFloat(e.target.value) })}
        />
      </div>`
        } else {
          return `<div className="space-y-2">
        <Label className="font-cairo">${f.label}</Label>
        <Input
          value={formData.${f.key}}
          onChange={(e) => setFormData({ ...formData, ${f.key}: e.target.value })}
          className="font-cairo"
        />
      </div>`
        }
      }).join('\n\n      ')}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit">
          {item ? 'حفظ التغييرات' : 'إضافة'}
        </Button>
      </div>
    </form>
  )
}
`
  }

  /**
   * Generate Testimonials component
   */
  private generateTestimonialsComponent(section: ContentSection): string {
    return this.generateListComponent(section, 'testimonials', 'الشهادات والآراء', [
      { key: 'name', label: 'الاسم', type: 'text' },
      { key: 'content', label: 'المحتوى', type: 'textarea' },
      { key: 'role', label: 'المنصب', type: 'text' },
      { key: 'rating', label: 'التقييم', type: 'number' },
      { key: 'featured', label: 'مميز', type: 'boolean' },
    ])
  }

  /**
   * Generate Team members component
   */
  private generateTeamComponent(section: ContentSection): string {
    return this.generateListComponent(section, 'team', 'فريق العمل', [
      { key: 'name', label: 'الاسم', type: 'text' },
      { key: 'role', label: 'المنصب', type: 'text' },
      { key: 'bio', label: 'نبذة', type: 'textarea' },
      { key: 'image', label: 'الصورة', type: 'text' },
    ])
  }

  /**
   * Generate Gallery component
   */
  private generateGalleryComponent(section: ContentSection): string {
    return this.generateListComponent(section, 'gallery', 'معرض الصور', [
      { key: 'title', label: 'العنوان', type: 'text' },
      { key: 'image', label: 'الصورة', type: 'text' },
      { key: 'category', label: 'التصنيف', type: 'text' },
    ])
  }

  /**
   * Generate Pricing component
   */
  private generatePricingComponent(section: ContentSection): string {
    return this.generateListComponent(section, 'pricing', 'الأسعار والباقات', [
      { key: 'name', label: 'الاسم', type: 'text' },
      { key: 'price', label: 'السعر', type: 'number' },
      { key: 'features', label: 'المميزات', type: 'textarea' },
      { key: 'featured', label: 'مميز', type: 'boolean' },
    ])
  }

  /**
   * Generate FAQ component
   */
  private generateFAQComponent(section: ContentSection): string {
    return this.generateListComponent(section, 'faq', 'الأسئلة الشائعة', [
      { key: 'question', label: 'السؤال', type: 'text' },
      { key: 'answer', label: 'الإجابة', type: 'textarea' },
      { key: 'order', label: 'الترتيب', type: 'number' },
    ])
  }

  /**
   * Generate Blog component
   */
  private generateBlogComponent(section: ContentSection): string {
    return this.generateListComponent(section, 'blog', 'المدونة', [
      { key: 'title', label: 'العنوان', type: 'text' },
      { key: 'content', label: 'المحتوى', type: 'textarea' },
      { key: 'excerpt', label: 'المقتطف', type: 'textarea' },
      { key: 'published', label: 'منشور', type: 'boolean' },
    ])
  }

  /**
   * Generate Contact component
   */
  private generateContactComponent(section: ContentSection): string {
    return this.generateFormsComponent(section)
  }

  /**
   * Generate Users component (if auth enabled)
   */
  private generateUsersComponent(section: ContentSection): string {
    const { projectId } = this.config

    return `'use client'

import { useState, useEffect } from 'react'
import { Trash2, Loader2, Shield, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  name?: string
  role: 'admin' | 'user'
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/projects/${projectId}/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      await fetch('/api/projects/${projectId}/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      })
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return

    try {
      await fetch('/api/projects/${projectId}/admin/users?id=' + id, {
        method: 'DELETE',
      })
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredUsers = users.filter(u =>
    u.email?.includes(searchQuery) || u.name?.includes(searchQuery)
  )

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 font-cairo">المستخدمين</h2>
      </div>

      <div className="relative max-w-sm">
        <Input
          placeholder="البحث في المستخدمين..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="font-cairo"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-cairo">
              لا يوجد مستخدمين
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-cairo">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right font-cairo">الاسم</TableHead>
                  <TableHead className="text-right font-cairo">الدور</TableHead>
                  <TableHead className="text-right font-cairo">تاريخ التسجيل</TableHead>
                  <TableHead className="text-right font-cairo">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-cairo">{user.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-cairo">
                      {new Date(user.createdAt).toLocaleDateString('ar-KW')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRole(user.id, user.role)}
                          title={user.role === 'admin' ? 'إزالة صلاحيات المدير' : 'جعله مدير'}
                        >
                          {user.role === 'admin' ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
  )
}
`
  }

  /**
   * Generate generic component for unhandled types
   */
  private generateGenericComponent(section: ContentSection): string {
    return this.generateListComponent(section, section.type, section.labelAr, [
      { key: 'name', label: 'الاسم', type: 'text' },
      { key: 'description', label: 'الوصف', type: 'textarea' },
    ])
  }

  /**
   * Generate API route for a content section
   */
  private generateAPIRoute(section: ContentSection): string {
    const { projectId } = this.config
    const tableName = `admin_${section.type}`

    return `import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PROJECT_ID = '${projectId}'
const TABLE_NAME = '${tableName}'

/**
 * GET - Fetch all items
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user owns this project
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('project_id', PROJECT_ID)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ items: data })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

/**
 * POST - Create new item
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({ ...body, project_id: PROJECT_ID })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء العنصر' }, { status: 500 })
  }
}

/**
 * PUT - Update item
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updates } = body

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('project_id', PROJECT_ID)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ error: 'خطأ في تحديث العنصر' }, { status: 500 })
  }
}

/**
 * DELETE - Remove item
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
      .eq('project_id', PROJECT_ID)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'خطأ في حذف العنصر' }, { status: 500 })
  }
}
`
  }

  /**
   * Generate database migrations for admin tables
   */
  private generateMigrations(): string {
    const { schema, projectId } = this.config
    const tables: string[] = []

    for (const section of schema.sections) {
      const tableName = `admin_${section.type}`
      const fields = CONTENT_TYPE_FIELDS[section.type] || []

      let columns = fields.map(field => {
        let sqlType = 'TEXT'
        if (field.type === 'number' || field.type === 'price') sqlType = 'NUMERIC'
        else if (field.type === 'boolean') sqlType = 'BOOLEAN DEFAULT false'
        else if (field.type === 'image' || field.type === 'url') sqlType = 'TEXT'
        else if (field.type === 'images') sqlType = 'JSONB DEFAULT \'[]\''
        else if (field.type === 'richtext' || field.type === 'textarea') sqlType = 'TEXT'

        return `  ${field.name} ${sqlType}`
      }).join(',\n')

      tables.push(`
-- ${section.labelAr} table
CREATE TABLE IF NOT EXISTS ${tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
${columns},
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for project lookup
CREATE INDEX IF NOT EXISTS idx_${tableName}_project ON ${tableName}(project_id);

-- RLS Policy
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their project ${section.type}"
  ON ${tableName}
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
`)
    }

    return `-- ==============================================
-- Admin Dashboard Tables Migration
-- Project: ${projectId}
-- Generated: ${new Date().toISOString()}
-- ==============================================

${tables.join('\n')}

-- Admin dashboard config table
CREATE TABLE IF NOT EXISTS admin_dashboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  schema JSONB NOT NULL,
  theme JSONB DEFAULT '{"primaryColor": "#3b82f6", "accentColor": "#0f172a"}',
  enabled_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

ALTER TABLE admin_dashboard_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their admin config"
  ON admin_dashboard_config
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
`
  }

  /**
   * Get icon component name for content type
   */
  private getIconForType(type: ContentType): string {
    const icons: Record<ContentType, string> = {
      products: 'Package',
      services: 'Briefcase',
      pages: 'FileText',
      forms: 'MessageSquare',
      content_blocks: 'FileText',
      users: 'Users',
      testimonials: 'MessageSquare',
      team_members: 'UserCircle',
      gallery: 'Image',
      pricing: 'DollarSign',
      faq: 'HelpCircle',
      blog: 'BookOpen',
      contact: 'Phone',
    }
    return icons[type] || 'FileText'
  }
}

/**
 * Helper function to generate admin dashboard
 */
export function generateAdminDashboard(
  projectId: string,
  projectName: string,
  schema: ProjectSchema
): GeneratedDashboard {
  const generator = new DashboardGenerator({
    projectId,
    projectName,
    schema,
  })
  return generator.generate()
}

// Types are already exported with the interface definitions above
