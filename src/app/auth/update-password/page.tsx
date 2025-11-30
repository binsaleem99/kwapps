'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AlertCircle, Loader2 } from 'lucide-react'

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'كلمة المرور غير متطابقة',
  path: ['confirm_password'],
})

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    },
  })

  useEffect(() => {
    // Verify user has valid recovery session
    const verifySession = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        setError('رابط غير صالح أو منتهي الصلاحية')
        setIsVerifying(false)
        return
      }

      setIsVerifying(false)
    }

    verifySession()
  }, [])

  async function onSubmit(values: UpdatePasswordFormValues) {
    setError(null)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.updateUser({
        password: values.password
      })

      if (error) {
        setError('حدث خطأ أثناء تحديث كلمة المرور')
      } else {
        // Success - redirect to login
        router.push('/sign-in?message=password_updated')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4">
        <Card className="border-2 w-full max-w-md" dir="rtl">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-slate-600">جاري التحقق...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4">
      <Card className="border-2 w-full max-w-md" dir="rtl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            تعيين كلمة مرور جديدة
          </CardTitle>
          <CardDescription className="text-center">
            أدخل كلمة المرور الجديدة الخاصة بك
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور الجديدة</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading || !!error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأكيد كلمة المرور</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading || !!error}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-primary text-white hover:shadow-glow transition-all"
                disabled={isLoading || !!error}
              >
                {isLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
