'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Activity,
  Server,
  Database,
  Globe,
  Zap,
  Clock,
  RefreshCw,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const services = [
  {
    name: 'موقع KW APPS',
    description: 'الموقع الرئيسي ولوحة التحكم',
    status: 'operational',
    icon: Globe,
    uptime: '99.99%',
  },
  {
    name: 'منشئ التطبيقات',
    description: 'خدمة إنشاء التطبيقات بالذكاء الاصطناعي',
    status: 'operational',
    icon: Zap,
    uptime: '99.95%',
  },
  {
    name: 'قاعدة البيانات',
    description: 'تخزين المشاريع وبيانات المستخدمين',
    status: 'operational',
    icon: Database,
    uptime: '99.99%',
  },
  {
    name: 'خدمة الاستضافة',
    description: 'استضافة التطبيقات المنشورة',
    status: 'operational',
    icon: Server,
    uptime: '99.98%',
  },
  {
    name: 'API الذكاء الاصطناعي',
    description: 'DeepSeek API للتوليد',
    status: 'operational',
    icon: Activity,
    uptime: '99.90%',
  },
]

const recentIncidents = [
  {
    date: '2025-11-28',
    title: 'صيانة مجدولة',
    description: 'تم إجراء صيانة دورية لتحسين الأداء',
    status: 'resolved',
    duration: '15 دقيقة',
  },
  {
    date: '2025-11-15',
    title: 'تحديث النظام',
    description: 'تحديث الإصدار الجديد من منشئ التطبيقات',
    status: 'resolved',
    duration: '30 دقيقة',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-green-500'
    case 'degraded':
      return 'bg-yellow-500'
    case 'outage':
      return 'bg-red-500'
    default:
      return 'bg-slate-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'operational':
      return 'يعمل بشكل طبيعي'
    case 'degraded':
      return 'أداء منخفض'
    case 'outage':
      return 'انقطاع في الخدمة'
    default:
      return 'غير معروف'
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-green-100 text-green-700'
    case 'degraded':
      return 'bg-yellow-100 text-yellow-700'
    case 'outage':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === 'operational')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white" dir="rtl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">KW APPS</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16" dir="rtl">
        {/* Overall Status */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-6">
            <Activity className="w-4 h-4" />
            حالة النظام
          </div>

          <Card
            className={`max-w-xl mx-auto border-2 ${
              allOperational ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
            }`}
          >
            <CardContent className="p-8 text-center">
              {allOperational ? (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-green-700 mb-2 font-['Cairo']">
                    جميع الأنظمة تعمل
                  </h1>
                  <p className="text-green-600 font-['Cairo']">
                    لا توجد مشاكل معروفة في الوقت الحالي
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-yellow-700 mb-2 font-['Cairo']">
                    بعض الخدمات متأثرة
                  </h1>
                  <p className="text-yellow-600 font-['Cairo']">نعمل على حل المشكلة</p>
                </>
              )}
            </CardContent>
          </Card>

          <p className="text-sm text-slate-500 mt-4 font-['Cairo']">
            <Clock className="w-4 h-4 inline ml-1" />
            آخر تحديث: {new Date().toLocaleString('ar-KW')}
          </p>
        </div>

        {/* Services Status */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 font-['Cairo']">حالة الخدمات</h2>
          <div className="space-y-4">
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold font-['Cairo']">{service.name}</h3>
                        <p className="text-sm text-slate-500 font-['Cairo']">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="text-sm text-slate-500 font-['Cairo']">وقت التشغيل</div>
                        <div className="font-bold text-slate-900">{service.uptime}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                        <Badge className={getStatusBadge(service.status)}>
                          {getStatusText(service.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 font-['Cairo']">الحوادث الأخيرة</h2>
          {recentIncidents.length > 0 ? (
            <div className="space-y-4">
              {recentIncidents.map((incident, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={
                              incident.status === 'resolved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {incident.status === 'resolved' ? 'تم الحل' : 'قيد المعالجة'}
                          </Badge>
                          <span className="text-sm text-slate-500">{incident.date}</span>
                        </div>
                        <h3 className="font-bold font-['Cairo'] mb-1">{incident.title}</h3>
                        <p className="text-slate-600 text-sm font-['Cairo']">
                          {incident.description}
                        </p>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-slate-500 font-['Cairo']">المدة</div>
                        <div className="text-sm font-semibold">{incident.duration}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-600 font-['Cairo']">لا توجد حوادث في آخر 90 يوماً</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Subscribe */}
        <div className="max-w-xl mx-auto">
          <Card className="border-2 border-blue-100">
            <CardContent className="p-8 text-center">
              <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 font-['Cairo']">احصل على تحديثات الحالة</h3>
              <p className="text-slate-600 mb-4 font-['Cairo']">
                سنرسل لك إشعاراً عند حدوث أي تغيير في حالة الخدمات
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="بريدك@example.com"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-['Cairo']"
                />
                <Button className="font-['Cairo']">اشترك</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-900 text-white py-8 mt-16" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <p className="font-['Cairo']">© 2025 KW APPS - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  )
}
