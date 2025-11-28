'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CancelSubscriptionButtonProps {
  subscriptionId: string
}

export function CancelSubscriptionButton({ subscriptionId }: CancelSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCancel = async () => {
    setLoading(true)

    try {
      // Update subscription to cancel at period end
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)

      if (error) throw error

      // Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('حدث خطأ أثناء إلغاء الاشتراك. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
          <XCircle className="w-4 h-4" />
          إلغاء الاشتراك
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من إلغاء اشتراكك؟</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            سيظل اشتراكك نشطاً حتى نهاية فترة الفوترة الحالية، ثم سيتم تخفيضك تلقائياً إلى الخطة
            المجانية. لن يتم خصم أي مبالغ إضافية.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
