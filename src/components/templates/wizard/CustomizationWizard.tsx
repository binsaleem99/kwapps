/**
 * CustomizationWizard - 5-Step Template Customization
 *
 * Guides users through customizing a template:
 * Step 1: Basic Info (name, contact, hours)
 * Step 2: Color Scheme (preset or custom)
 * Step 3: Content (about, services, etc.)
 * Step 4: Images (logo, hero, gallery)
 * Step 5: Review & Generate
 *
 * Usage:
 * <CustomizationWizard
 *   template={template}
 *   onComplete={(customization) => generateSite(customization)}
 * />
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Template, TemplateCustomization } from '@/lib/templates/types'
import { Step1BasicInfo } from './Step1BasicInfo'
import { Step2ColorScheme } from './Step2ColorScheme'
import { Step3Content } from './Step3Content'
import { Step4Images } from './Step4Images'
import { Step5Review } from './Step5Review'

interface CustomizationWizardProps {
  template: Template
  onComplete: (customization: TemplateCustomization) => Promise<void>
  onCancel: () => void
}

export function CustomizationWizard({
  template,
  onComplete,
  onCancel,
}: CustomizationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)

  const [customization, setCustomization] = useState<TemplateCustomization>({
    templateId: template.id,
    basicInfo: {
      businessName: '',
      phone: '',
      email: '',
      country: 'KW',
    },
    colorScheme: {
      preset: template.colorSchemes[0]?.id,
    },
    content: {},
    images: {},
    enabledSections: template.sections.filter((s) => s.required).map((s) => s.id),
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await onComplete(customization)
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateCustomization = (updates: Partial<TemplateCustomization>) => {
    setCustomization({ ...customization, ...updates })
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{template.nameAr}</h1>
            <p className="text-gray-600 dark:text-gray-400">{template.descriptionAr}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>الخطوة {currentStep} من {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 min-h-[500px]">
        {currentStep === 1 && (
          <Step1BasicInfo
            data={customization.basicInfo}
            onChange={(basicInfo) => updateCustomization({ basicInfo })}
            template={template}
          />
        )}

        {currentStep === 2 && (
          <Step2ColorScheme
            data={customization.colorScheme}
            onChange={(colorScheme) => updateCustomization({ colorScheme })}
            template={template}
          />
        )}

        {currentStep === 3 && (
          <Step3Content
            data={customization.content}
            onChange={(content) => updateCustomization({ content })}
            template={template}
          />
        )}

        {currentStep === 4 && (
          <Step4Images
            data={customization.images}
            onChange={(images) => updateCustomization({ images })}
            template={template}
          />
        )}

        {currentStep === 5 && (
          <Step5Review
            customization={customization}
            template={template}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isGenerating}
        >
          رجوع
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            💎 {template.creditsToCustomize} رصيد
          </span>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} size="lg">
              التالي
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full me-2" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  توليد الموقع 🚀
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
