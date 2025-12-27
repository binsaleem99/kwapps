/**
 * SpinWheel Component
 *
 * Gamified discount wheel based on weighted probabilities:
 * - 5% off → 5% chance
 * - 10% off → 30% chance
 * - 15% off → 35% chance (most common)
 * - 20% off → 20% chance
 * - 25% off → 8% chance
 * - 30% off → 2% chance
 *
 * Features:
 * - Email capture (required)
 * - One spin per email/session
 * - Animated wheel rotation
 * - Auto-apply discount code
 *
 * Usage:
 * <SpinWheel onWin={(discount, code) => applyDiscount(code)} />
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Gift } from 'lucide-react'

interface SpinWheelProps {
  onWin: (discountPercent: number, code: string) => void
  onClose?: () => void
  className?: string
}

export function SpinWheel({ onWin, onClose, className = '' }: SpinWheelProps) {
  const [email, setEmail] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [prize, setPrize] = useState<{ percent: number; code: string } | null>(null)
  const [hasSpun, setHasSpun] = useState(false)
  const [error, setError] = useState('')

  const prizes = [
    { percent: 30, color: 'from-purple-500 to-purple-600', text: '30%' },
    { percent: 10, color: 'from-blue-500 to-blue-600', text: '10%' },
    { percent: 25, color: 'from-pink-500 to-pink-600', text: '25%' },
    { percent: 15, color: 'from-green-500 to-green-600', text: '15%' },
    { percent: 5, color: 'from-yellow-500 to-yellow-600', text: '5%' },
    { percent: 20, color: 'from-red-500 to-red-600', text: '20%' },
  ]

  const handleSpin = async () => {
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح')
      return
    }

    setError('')
    setSpinning(true)

    try {
      // Call backend to get prize
      const response = await fetch('/api/paywall/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sessionId: sessionStorage.getItem('paywall_session_id'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'فشل الدوران')
      }

      // Animate wheel
      const prizeIndex = data.prizeIndex
      const targetRotation = 360 * 5 + (360 / 6) * prizeIndex // 5 full rotations + prize angle

      setRotation(targetRotation)

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 4000))

      // Show prize
      setPrize({
        percent: data.discountPercent,
        code: data.discountCode,
      })

      setHasSpun(true)

      // Auto-apply after showing prize
      setTimeout(() => {
        onWin(data.discountPercent, data.discountCode)
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally {
      setSpinning(false)
    }
  }

  return (
    <div
      className={`${className} bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-lg mx-auto`}
      dir="rtl"
    >
      {!hasSpun ? (
        <>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Gift className="w-4 h-4" />
              عرض خاص لك!
            </div>
            <h2 className="text-3xl font-bold mb-2">دوّر واربح خصم!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              احصل على خصم يصل إلى 30% على اشتراكك الأول
            </p>
          </div>

          {/* Wheel */}
          <div className="relative w-80 h-80 mx-auto mb-6">
            {/* Pointer */}
            <div className="absolute top-0 start-1/2 -translate-x-1/2 z-10 -mt-3">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-red-600" />
            </div>

            {/* Wheel Container */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden shadow-2xl transition-transform duration-[4000ms] ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {prizes.map((prize, index) => {
                const angle = (360 / prizes.length) * index
                return (
                  <div
                    key={index}
                    className={`absolute w-full h-full origin-center bg-gradient-to-br ${prize.color}`}
                    style={{
                      transform: `rotate(${angle}deg)`,
                      clipPath: 'polygon(50% 50%, 100% 0%, 100% 16.67%, 50% 50%)',
                    }}
                  >
                    <div
                      className="absolute top-[15%] start-[70%] text-white font-bold text-2xl"
                      style={{ transform: `rotate(${-angle + 30}deg)` }}
                    >
                      {prize.text}
                    </div>
                  </div>
                )
              })}

              {/* Center Circle */}
              <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center">
                <Gift className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-4">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="text-center text-lg"
                dir="ltr"
              />
              {error && <p className="text-sm text-red-600 mt-1 text-center">{error}</p>}
            </div>

            <Button
              size="lg"
              className="w-full text-xl py-6 font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={handleSpin}
              disabled={spinning}
            >
              {spinning ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full me-2" />
                  جاري الدوران...
                </>
              ) : (
                <>🎯 دوّر الآن!</>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              دورة واحدة لكل بريد إلكتروني
            </p>
          </div>
        </>
      ) : (
        // Prize Reveal
        <div className="text-center space-y-6">
          <div className="text-8xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold">مبروك!</h2>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-8">
            <div className="text-6xl font-bold mb-2">{prize?.percent}%</div>
            <div className="text-2xl">خصم على اشتراكك</div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            كود الخصم: <span className="font-mono font-bold text-primary">{prize?.code}</span>
          </p>
          <p className="text-sm text-gray-500">
            سيتم تطبيق الخصم تلقائياً عند الدفع
          </p>
        </div>
      )}
    </div>
  )
}
