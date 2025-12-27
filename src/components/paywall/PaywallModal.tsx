/**
 * PaywallModal - 3-Step Conversion Funnel
 *
 * Multi-step paywall optimized for conversion based on behavioral psychology
 * Step 1: Benefits (value proposition)
 * Step 2: Trial Timeline (fear removal)
 * Step 3: Offers (social proof + CTA)
 *
 * Features:
 * - Progress indicator
 * - Back/forward navigation
 * - Trial toggle (with/without trial)
 * - Discount code support
 * - Analytics tracking
 *
 * Usage:
 * <PaywallModal
 *   isOpen={showPaywall}
 *   onClose={() => setShowPaywall(false)}
 *   placement="post_onboarding"
 *   onSubscribe={(plan) => handleSubscribe(plan)}
 * />
 */

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog'
import { BenefitsStep } from './BenefitsStep'
import { TrialTimelineStep } from './TrialTimelineStep'
import { OffersStep } from './OffersStep'

type PaywallStep = 'benefits' | 'trial-timeline' | 'offers'

export interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  placement?: string
  defaultPlan?: 'basic' | 'pro' | 'premium' | 'enterprise'
  onSubscribe: (data: SubscriptionData) => Promise<void>
}

export interface SubscriptionData {
  plan: string
  billingInterval: 'monthly' | 'annual'
  withTrial: boolean
  discountCode?: string
}

export function PaywallModal({
  isOpen,
  onClose,
  placement = 'default',
  defaultPlan = 'basic',
  onSubscribe,
}: PaywallModalProps) {
  const [currentStep, setCurrentStep] = useState<PaywallStep>('benefits')
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan)
  const [withTrial, setWithTrial] = useState(true)
  const [discountCode, setDiscountCode] = useState<string | undefined>()

  // Track paywall impression
  useEffect(() => {
    if (isOpen) {
      trackPaywallEvent('paywall_impression', placement)
      trackPaywallEvent('step_1_view', placement)
    }
  }, [isOpen])

  // Track step views
  useEffect(() => {
    if (isOpen) {
      if (currentStep === 'trial-timeline') {
        trackPaywallEvent('step_2_view', placement)
      } else if (currentStep === 'offers') {
        trackPaywallEvent('step_3_view', placement)
      }
    }
  }, [currentStep, isOpen])

  const handleStepContinue = (step: PaywallStep) => {
    // Track continuation
    if (step === 'benefits') {
      trackPaywallEvent('step_1_continue', placement)
      setCurrentStep('trial-timeline')
    } else if (step === 'trial-timeline') {
      trackPaywallEvent('step_2_continue', placement)
      setCurrentStep('offers')
    }
  }

  const handleBack = () => {
    if (currentStep === 'trial-timeline') {
      setCurrentStep('benefits')
    } else if (currentStep === 'offers') {
      setCurrentStep('trial-timeline')
    }
  }

  const handleSubscribe = async (data: Omit<SubscriptionData, 'discountCode'>) => {
    // Track CTA click
    trackPaywallEvent('cta_click', placement, {
      plan: data.plan,
      billingInterval: data.billingInterval,
      withTrial: data.withTrial,
    })

    // Start payment
    trackPaywallEvent('payment_started', placement)

    try {
      await onSubscribe({
        ...data,
        discountCode,
      })

      // Track completion
      trackPaywallEvent('payment_completed', placement)
    } catch (error) {
      console.error('Subscription error:', error)
    }
  }

  const handleClose = () => {
    // Track abandonment
    if (currentStep === 'offers') {
      trackPaywallEvent('payment_abandoned', placement, {
        plan: selectedPlan,
        withTrial,
        step: currentStep,
      })
    }
    onClose()
  }

  // Calculate progress
  const stepIndex = { benefits: 0, 'trial-timeline': 1, offers: 2 }[currentStep]
  const progress = ((stepIndex + 1) / 3) * 100

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8">
          {(['benefits', 'trial-timeline', 'offers'] as const).map((step, index) => {
            const isActive = currentStep === step
            const isCompleted = stepIndex > index

            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                           ${
                             isCompleted
                               ? 'bg-green-500 text-white'
                               : isActive
                               ? 'bg-primary text-white'
                               : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                           }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-24 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Steps Content */}
        {currentStep === 'benefits' && (
          <BenefitsStep onContinue={() => handleStepContinue('benefits')} />
        )}

        {currentStep === 'trial-timeline' && (
          <TrialTimelineStep
            withTrial={withTrial}
            onContinue={() => handleStepContinue('trial-timeline')}
            onBack={handleBack}
          />
        )}

        {currentStep === 'offers' && (
          <OffersStep
            selectedPlan={selectedPlan}
            onPlanChange={setSelectedPlan}
            withTrial={withTrial}
            onTrialToggle={setWithTrial}
            discountCode={discountCode}
            onDiscountChange={setDiscountCode}
            onSubscribe={handleSubscribe}
            onBack={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Track paywall events to database
 */
async function trackPaywallEvent(
  eventType: string,
  placement: string,
  metadata: Record<string, any> = {}
) {
  try {
    await fetch('/api/paywall/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        placement,
        metadata,
        sessionId: getSessionId(),
      }),
    })
  } catch (error) {
    console.error('Failed to track paywall event:', error)
  }
}

/**
 * Get or create session ID for tracking
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('paywall_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('paywall_session_id', sessionId)
  }
  return sessionId
}
