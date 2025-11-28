'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowUpCircle } from 'lucide-react'

interface UpgradePlanButtonProps {
  currentPlan: string
}

export function UpgradePlanButton({ currentPlan }: UpgradePlanButtonProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  // Don't show upgrade button for pro plan
  if (currentPlan === 'pro') {
    return null
  }

  return (
    <Button onClick={handleUpgrade} className="gap-2">
      <ArrowUpCircle className="w-4 h-4" />
      {currentPlan === 'free' ? 'ترقية الخطة' : 'تغيير الخطة'}
    </Button>
  )
}
