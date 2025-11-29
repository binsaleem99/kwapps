'use client'

/**
 * Template Gallery Component
 *
 * Displays filterable grid of application templates
 * with category filters and template preview cards
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ShoppingCart,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  FileText,
  Users,
  Star,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  slug: string
  description: string
  category: string
  icon_name: string
  preview_image_url: string | null
  usage_count: number
  is_premium: boolean
  features: string[]
  tags: string[]
}

interface TemplateGalleryProps {
  templates: Template[]
  categories: string[]
}

// Map icon names to Lucide components
const iconMap: Record<string, any> = {
  ShoppingCart,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  FileText,
  Users,
  Sparkles
}

export function TemplateGallery({ templates, categories }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter((t) => t.category === selectedCategory)

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Sparkles
    return <Icon className="w-12 h-12" />
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className="font-bold"
        >
          الكل ({templates.length})
        </Button>
        {categories.map((category) => {
          const count = templates.filter((t) => t.category === category).length
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="font-bold"
            >
              {category} ({count})
            </Button>
          )
        })}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">لا توجد قوالب في هذه الفئة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              {/* Premium Badge */}
              {template.is_premium && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 ml-1" />
                    Premium
                  </Badge>
                </div>
              )}

              <CardHeader>
                {/* Icon */}
                <div className="mb-4 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {getIcon(template.icon_name)}
                </div>

                {/* Category Badge */}
                <Badge variant="outline" className="mb-3 w-fit">
                  {template.category}
                </Badge>

                <CardTitle className="text-2xl mb-2">
                  {template.name}
                </CardTitle>

                <CardDescription className="text-base">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                {template.features && template.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">المزايا:</p>
                    <ul className="space-y-1">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Usage Count */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>استخدمه {template.usage_count} شخص</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    asChild
                  >
                    <Link href={`/builder?template=${template.slug}`}>
                      استخدم القالب
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link href={`/templates/${template.slug}`}>
                      معاينة
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center pt-8 border-t">
        <p className="text-lg text-gray-600 mb-6">
          لا تجد ما تبحث عنه؟
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
          asChild
        >
          <Link href="/builder">
            إنشاء تطبيق مخصص
            <Sparkles className="w-5 h-5 mr-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
