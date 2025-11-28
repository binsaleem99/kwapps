'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AlertCircle, CheckCircle } from 'lucide-react'

const resetPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        setError('حدث خطأ. يرجى المحاولة مرة أخرى')
      } else {
        setSuccess(true)
        form.reset()
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2" dir="rtl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          إعادة تعيين كلمة المرور
        </CardTitle>
        <CardDescription className="text-center">
          أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
              يرجى التحقق من صندوق الوارد الخاص بك.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      disabled={isLoading || success}
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
              disabled={isLoading || success}
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-muted-foreground w-full">
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline font-medium"
          >
            العودة إلى تسجيل الدخول
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
