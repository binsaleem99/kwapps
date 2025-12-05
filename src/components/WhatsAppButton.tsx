'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false)

  const phoneNumber = '96599000000' // Replace with actual KW APPS WhatsApp number
  const defaultMessage = 'مرحباً! أريد الاستفسار عن KW APPS'

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="rtl">
      {/* Tooltip */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-2xl p-4 w-72 border-2 border-green-500 animate-in slide-in-from-bottom-2">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="text-right">
            <p className="font-bold text-gray-900 mb-1 font-['Cairo']">مرحباً! 👋</p>
            <p className="text-sm text-gray-600 mb-3 font-['Cairo']">
              كيف يمكننا مساعدتك؟ تواصل معنا مباشرة عبر واتساب
            </p>
            <button
              onClick={handleClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-['Cairo']"
            >
              <MessageCircle className="w-5 h-5" />
              ابدأ المحادثة
            </button>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
        title="تواصل معنا عبر واتساب"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7" />
            {/* Ping animation */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-300"></span>
            </span>
          </>
        )}
      </button>
    </div>
  )
}
