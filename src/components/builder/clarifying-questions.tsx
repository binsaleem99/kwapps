'use client'

/**
 * Clarifying Questions Component
 *
 * Shows Arabic questions to gather missing parameters from user
 * before code generation. Uses checkboxes, radio buttons, and text inputs.
 */

import React from 'react'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Info,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ClarifyingQuestion } from '@/lib/gemini/parameter-detector'

interface ClarifyingQuestionsProps {
  /** Questions to ask */
  questions: ClarifyingQuestion[]

  /** Callback when user submits answers */
  onSubmit: (answers: Record<string, any>) => void

  /** Loading state during submission */
  isLoading?: boolean

  /** Allow skipping optional questions */
  allowSkip?: boolean
}

export function ClarifyingQuestions({
  questions,
  onSubmit,
  isLoading = false,
  allowSkip = true,
}: ClarifyingQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, any>>({})

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const hasAnswered = answers[currentQuestion?.key] !== undefined

  // Handle answer change
  const handleAnswerChange = (key: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Handle next question
  const handleNext = () => {
    if (isLastQuestion) {
      // Submit all answers
      onSubmit(answers)
    } else {
      // Move to next question
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  // Handle skip
  const handleSkip = () => {
    if (isLastQuestion) {
      // Submit without this answer
      onSubmit(answers)
    } else {
      // Move to next without answering
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  // Handle back
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  if (!currentQuestion) {
    return null
  }

  // Calculate progress
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-blue-950 p-4 sm:p-6"
      dir="rtl"
    >
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-cairo">
            السؤال {currentQuestionIndex + 1} من {questions.length}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-cairo">
            {Math.round(progress)}% مكتمل
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="max-w-2xl mx-auto w-full flex-1 p-6 sm:p-8">
        {/* Priority Badge */}
        {currentQuestion.priority === 'high' && (
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400 font-cairo">
              سؤال ضروري
            </span>
          </div>
        )}

        {currentQuestion.priority === 'medium' && (
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 font-cairo">
              سؤال مفيد
            </span>
          </div>
        )}

        {/* Question */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6 font-cairo leading-relaxed">
          {currentQuestion.question_ar}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {/* Multiple Choice (Radio buttons) */}
          {currentQuestion.type === 'multiple_choice' &&
            currentQuestion.options?.map((option, index) => {
              const Icon = option.icon
                ? (LucideIcons as any)[option.icon]
                : Circle
              const isSelected = answers[currentQuestion.key] === option.value

              return (
                <button
                  key={index}
                  onClick={() =>
                    handleAnswerChange(currentQuestion.key, option.value)
                  }
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {/* Icon */}
                  {Icon && (
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      />
                    </div>
                  )}

                  {/* Label */}
                  <span
                    className={`flex-1 text-right text-base sm:text-lg font-medium font-cairo ${
                      isSelected
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {option.label_ar}
                  </span>

                  {/* Checkmark */}
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  )}
                </button>
              )
            })}

          {/* Checkboxes (Multiple selection) */}
          {currentQuestion.type === 'checkboxes' &&
            currentQuestion.options?.map((option, index) => {
              const Icon = option.icon
                ? (LucideIcons as any)[option.icon]
                : Circle
              const currentAnswers: string[] =
                answers[currentQuestion.key] || []
              const isSelected = currentAnswers.includes(option.value)

              return (
                <button
                  key={index}
                  onClick={() => {
                    const newAnswers = isSelected
                      ? currentAnswers.filter((v) => v !== option.value)
                      : [...currentAnswers, option.value]
                    handleAnswerChange(currentQuestion.key, newAnswers)
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {/* Icon */}
                  {Icon && (
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      />
                    </div>
                  )}

                  {/* Label */}
                  <span
                    className={`flex-1 text-right text-base sm:text-lg font-medium font-cairo ${
                      isSelected
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {option.label_ar}
                  </span>

                  {/* Checkmark */}
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  )}
                </button>
              )
            })}

          {/* Text Input */}
          {currentQuestion.type === 'text' && (
            <textarea
              value={answers[currentQuestion.key] || ''}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.key, e.target.value)
              }
              placeholder="اكتب إجابتك هنا..."
              className="w-full min-h-[120px] p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-cairo text-right resize-none"
              dir="rtl"
            />
          )}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="max-w-2xl mx-auto w-full mt-6 flex gap-3">
        {/* Back Button */}
        {currentQuestionIndex > 0 && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="px-6 font-cairo"
            disabled={isLoading}
          >
            رجوع
          </Button>
        )}

        {/* Skip Button (for optional questions) */}
        {allowSkip && currentQuestion.skipable && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="px-6 font-cairo"
            disabled={isLoading}
          >
            تخطي
          </Button>
        )}

        {/* Next/Submit Button */}
        <Button
          onClick={handleNext}
          disabled={isLoading || (!hasAnswered && !currentQuestion.skipable)}
          className="flex-1 h-12 sm:h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-cairo group"
        >
          {isLoading ? (
            <>
              <LucideIcons.Loader2 className="w-5 h-5 ml-2 animate-spin" />
              <span>جاري التحميل...</span>
            </>
          ) : isLastQuestion ? (
            <>
              <Sparkles className="w-5 h-5 ml-2" />
              <span>ابدأ الإنشاء</span>
            </>
          ) : (
            <>
              <span>التالي</span>
              <ChevronRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>

      {/* Helper Text */}
      {currentQuestion.skipable && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4 font-cairo">
          يمكنك تخطي هذا السؤال إذا كنت غير متأكد
        </p>
      )}
    </div>
  )
}
