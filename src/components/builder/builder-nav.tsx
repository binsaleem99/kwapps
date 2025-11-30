'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Folder,
  LayoutTemplate,
  CreditCard,
  User,
  Save,
  Upload,
  Menu,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BuilderNavProps {
  projectName: string
  onSave?: () => void
  onDeploy?: () => void
  onNewProject?: () => void
  isSaving?: boolean
  isDeploying?: boolean
  hasChanges?: boolean
}

export function BuilderNav({
  projectName,
  onSave,
  onDeploy,
  onNewProject,
  isSaving = false,
  isDeploying = false,
  hasChanges = false,
}: BuilderNavProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-white shadow-sm" dir="rtl">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group transition-transform hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 font-['Cairo']">KW APPS</span>
                <span className="text-xs text-slate-500 block font-['Cairo'] leading-none">
                  AI Vibe Coder
                </span>
              </div>
            </Link>

            <div className="hidden md:block h-8 w-px bg-slate-200" />

            {/* Project Name */}
            <div className="hidden md:block">
              <p className="text-sm text-slate-500 font-['Cairo']">المشروع</p>
              <p className="text-base font-bold text-slate-900 font-['Cairo']">{projectName}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="font-['Cairo']">
                <Folder className="w-4 h-4 ml-2" />
                مشاريعي
              </Button>
            </Link>

            <Link href="/dashboard?tab=templates">
              <Button variant="ghost" size="sm" className="font-['Cairo']">
                <LayoutTemplate className="w-4 h-4 ml-2" />
                القوالب
              </Button>
            </Link>

            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="font-['Cairo']">
                <CreditCard className="w-4 h-4 ml-2" />
                الأسعار
              </Button>
            </Link>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 mx-2" />

            {/* Action Buttons */}
            {onSave && (
              <Button
                onClick={onSave}
                disabled={isSaving || !hasChanges}
                variant="outline"
                size="sm"
                className="font-['Cairo'] border-2"
              >
                <Save className="w-4 h-4 ml-2" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            )}

            {onDeploy && (
              <Button
                onClick={onDeploy}
                disabled={isDeploying}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white font-bold font-['Cairo'] shadow-lg hover:shadow-xl"
                size="sm"
              >
                <Upload className="w-4 h-4 ml-2" />
                {isDeploying ? 'جاري النشر...' : 'نشر'}
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" dir="rtl">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/account" className="font-['Cairo']">
                    <User className="w-4 h-4 ml-2" />
                    الحساب
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing" className="font-['Cairo']">
                    <CreditCard className="w-4 h-4 ml-2" />
                    الاشتراك
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="font-['Cairo']">
                    <Folder className="w-4 h-4 ml-2" />
                    لوحة التحكم
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start font-['Cairo']">
                <Folder className="w-4 h-4 ml-2" />
                مشاريعي
              </Button>
            </Link>

            <Link href="/dashboard?tab=templates">
              <Button variant="ghost" className="w-full justify-start font-['Cairo']">
                <LayoutTemplate className="w-4 h-4 ml-2" />
                القوالب
              </Button>
            </Link>

            <Link href="/pricing">
              <Button variant="ghost" className="w-full justify-start font-['Cairo']">
                <CreditCard className="w-4 h-4 ml-2" />
                الأسعار
              </Button>
            </Link>

            {onSave && (
              <Button
                onClick={onSave}
                disabled={isSaving || !hasChanges}
                variant="outline"
                className="w-full justify-start font-['Cairo']"
              >
                <Save className="w-4 h-4 ml-2" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            )}

            {onDeploy && (
              <Button
                onClick={onDeploy}
                disabled={isDeploying}
                className="w-full justify-start bg-gradient-to-r from-green-600 to-green-500 text-white font-bold font-['Cairo']"
              >
                <Upload className="w-4 h-4 ml-2" />
                {isDeploying ? 'جاري النشر...' : 'نشر'}
              </Button>
            )}

            <div className="h-px bg-slate-200 my-2" />

            <Link href="/dashboard/account">
              <Button variant="ghost" className="w-full justify-start font-['Cairo']">
                <User className="w-4 h-4 ml-2" />
                الحساب
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
