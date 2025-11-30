'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle2, HelpCircle, Sparkles } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: {
    value: string
    label: string
    description: string
  }[]
}

interface ClarificationPanelProps {
  questions: Question[]
  onConfirm: (answers: Record<string, string>) => void
  onSkip: () => void
}

export function ClarificationPanel({ questions, onConfirm, onSkip }: ClarificationPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const allQuestionsAnswered = questions.every((q) => answers[q.id])

  function handleAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleConfirm() {
    if (allQuestionsAnswered) {
      onConfirm(answers)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-6 mb-4 shadow-lg" dir="rtl">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-blue-500 rounded-lg">
          <HelpCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-1 font-['Cairo']">
            أسئلة لتحسين النتيجة
          </h3>
          <p className="text-sm text-slate-600 font-['Cairo']">
            ساعدنا على فهم متطلباتك بشكل أفضل للحصول على نتيجة أدق
          </p>
        </div>
        <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((question, index) => {
          const isAnswered = !!answers[question.id]

          return (
            <Card
              key={question.id}
              className={`p-5 transition-all duration-300 ${
                isAnswered
                  ? 'border-2 border-green-300 bg-green-50'
                  : 'border-2 border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                {isAnswered ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                )}
                <p className="text-base font-semibold text-slate-900 font-['Cairo']">
                  {question.question}
                </p>
              </div>

              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(value) => handleAnswer(question.id, value)}
                className="space-y-3"
              >
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.value

                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor={option.value}
                          className={`text-base font-medium cursor-pointer font-['Cairo'] ${
                            isSelected ? 'text-blue-900' : 'text-slate-900'
                          }`}
                        >
                          {option.label}
                        </Label>
                        <p
                          className={`text-sm mt-1 font-['Cairo'] ${
                            isSelected ? 'text-blue-700' : 'text-slate-600'
                          }`}
                        >
                          {option.description}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </RadioGroup>
            </Card>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={handleConfirm}
          disabled={!allQuestionsAnswered}
          className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-['Cairo']"
        >
          <CheckCircle2 className="w-5 h-5 ml-2" />
          تأكيد وإنشاء الكود
        </Button>
        <Button
          onClick={onSkip}
          variant="outline"
          className="h-12 px-6 border-2 border-slate-300 font-bold font-['Cairo'] hover:bg-slate-100"
        >
          تخطي
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 font-['Cairo']">
          {Object.keys(answers).length} من {questions.length} أسئلة تمت الإجابة عليها
        </p>
      </div>
    </div>
  )
}
