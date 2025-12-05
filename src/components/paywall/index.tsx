'use client';

// ============================================
// Multi-Step Paywall Orchestrator
// ============================================
// Manages the 3-step conversion flow
// Integrates with credit system API

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BenefitsStep } from './benefits-step';
import { TrialTimelineStepComponent } from './trial-timeline-step';
import { OffersStep } from './offers-step';
import type { PaywallStep, SubscriptionTierName } from '@/types/paywall';

interface PaywallProps {
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function Paywall({ onComplete, onDismiss }: PaywallProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<PaywallStep>('benefits');
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (currentStep === 'benefits') {
      setCurrentStep('trial-timeline');
    } else if (currentStep === 'trial-timeline') {
      setCurrentStep('offers');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'trial-timeline') {
      setCurrentStep('benefits');
    } else if (currentStep === 'offers') {
      setCurrentStep('trial-timeline');
    }
  };

  const handleSelectTier = async (
    tier: SubscriptionTierName,
    withTrial: boolean
  ) => {
    setIsLoading(true);

    try {
      if (withTrial) {
        // Create trial subscription
        const response = await fetch('/api/billing/trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_method: 'upayments',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create trial');
        }

        const data = await response.json();

        // Redirect to payment URL
        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          // If no payment URL (should not happen), redirect to dashboard
          router.push('/dashboard');
          onComplete?.();
        }
      } else {
        // Create regular subscription
        const response = await fetch('/api/billing/subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tier_name: tier,
            payment_method: 'upayments',
            is_trial: false,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create subscription');
        }

        const data = await response.json();

        // Redirect to payment URL
        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          router.push('/dashboard');
          onComplete?.();
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('حدث خطأ أثناء إنشاء الاشتراك. يرجى المحاولة مرة أخرى.');
      setIsLoading(false);
    }
  };

  return (
    <div className="paywall-container">
      {currentStep === 'benefits' && <BenefitsStep onNext={handleNextStep} />}

      {currentStep === 'trial-timeline' && (
        <TrialTimelineStepComponent
          onNext={handleNextStep}
          onBack={handlePrevStep}
        />
      )}

      {currentStep === 'offers' && (
        <OffersStep
          onSelectTier={handleSelectTier}
          onBack={handlePrevStep}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default Paywall;
