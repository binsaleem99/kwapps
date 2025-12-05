/**
 * Code Validation System
 *
 * Validates generated code against quality checklist:
 * 1. RTL Layout
 * 2. Arabic Rendering
 * 3. Widget Functionality
 * 4. Mobile Responsive
 * 5. No Console Errors
 */

import type { ValidationResult, ValidationCheck, DeepSeekPrompt } from './types'

/**
 * Validate generated code
 */
export async function validateGeneratedCode(
  code: string,
  prompt: DeepSeekPrompt
): Promise<ValidationResult> {
  const checks: ValidationCheck[] = []

  // 1. RTL Layout Check
  checks.push(await checkRTLLayout(code, prompt))

  // 2. Arabic Rendering Check
  checks.push(await checkArabicRendering(code, prompt))

  // 3. Widget Functionality Check
  checks.push(await checkWidgetFunctionality(code, prompt))

  // 4. Mobile Responsive Check
  checks.push(await checkMobileResponsive(code))

  // 5. Console Errors Check
  checks.push(await checkConsoleErrors(code))

  // 6. Color Scheme Check
  checks.push(await checkColorScheme(code, prompt))

  // 7. Security Check
  checks.push(await checkSecurity(code))

  // Calculate overall score
  const passedCount = checks.filter((c) => c.passed).length
  const score = Math.round((passedCount / checks.length) * 100)

  // Collect errors and warnings
  const errors = checks
    .filter((c) => !c.passed && c.severity === 'critical')
    .map((c) => c.messageAr || c.message || '')

  const warnings = checks
    .filter((c) => !c.passed && c.severity === 'warning')
    .map((c) => c.messageAr || c.message || '')

  const passed = errors.length === 0

  return {
    passed,
    checks,
    score,
    errors,
    warnings,
  }
}

/**
 * Check 1: RTL Layout
 */
async function checkRTLLayout(code: string, prompt: DeepSeekPrompt): Promise<ValidationCheck> {
  const isRTL = prompt.language.direction === 'rtl'

  if (!isRTL) {
    return {
      name: 'RTL Layout',
      nameAr: 'تخطيط من اليمين لليسار',
      passed: true,
      severity: 'info',
      message: 'LTR layout as expected',
      messageAr: 'تخطيط من اليسار لليمين كما هو متوقع',
    }
  }

  // Check for dir="rtl" in HTML
  const hasDirRTL = /dir\s*=\s*["']rtl["']/i.test(code)

  // Check for RTL Tailwind classes
  const hasRTLClasses = /text-right|rtl:|flex-row-reverse/.test(code)

  const passed = hasDirRTL || hasRTLClasses

  return {
    name: 'RTL Layout',
    nameAr: 'تخطيط من اليمين لليسار',
    passed,
    severity: 'critical',
    message: passed ? 'RTL layout detected' : 'Missing dir="rtl" attribute',
    messageAr: passed
      ? 'تم اكتشاف تخطيط RTL'
      : 'السمة dir="rtl" مفقودة',
    autoFix: !passed,
  }
}

/**
 * Check 2: Arabic Rendering
 */
async function checkArabicRendering(
  code: string,
  prompt: DeepSeekPrompt
): Promise<ValidationCheck> {
  const isPrimaryArabic = prompt.language.primary === 'ar'

  if (!isPrimaryArabic) {
    return {
      name: 'Arabic Rendering',
      nameAr: 'عرض النص العربي',
      passed: true,
      severity: 'info',
      message: 'English content as expected',
      messageAr: 'محتوى إنجليزي كما هو متوقع',
    }
  }

  // Check for Cairo font
  const hasCairoFont =
    /font-family.*Cairo/.test(code) || /fontFamily.*Cairo/.test(code) || /font-\['Cairo'\]/.test(code)

  // Check for Arabic Unicode characters
  const hasArabicText = /[\u0600-\u06FF]/.test(code)

  const passed = hasCairoFont && hasArabicText

  return {
    name: 'Arabic Rendering',
    nameAr: 'عرض النص العربي',
    passed,
    severity: 'critical',
    message: passed
      ? 'Cairo font and Arabic text detected'
      : 'Missing Cairo font or Arabic text',
    messageAr: passed
      ? 'تم اكتشاف خط Cairo ونص عربي'
      : 'خط Cairo أو النص العربي مفقود',
    autoFix: !passed && hasCairoFont,
  }
}

/**
 * Check 3: Widget Functionality
 */
async function checkWidgetFunctionality(
  code: string,
  prompt: DeepSeekPrompt
): Promise<ValidationCheck> {
  const requestedWidgets = prompt.functionality.widgets

  if (requestedWidgets.length === 0) {
    return {
      name: 'Widget Functionality',
      nameAr: 'وظائف الويدجت',
      passed: true,
      severity: 'info',
      message: 'No widgets requested',
      messageAr: 'لا توجد ويدجت مطلوبة',
    }
  }

  // Check for presence of each widget
  const widgetPatterns: Record<string, RegExp> = {
    booking_calendar: /calendar|booking|appointment/i,
    gallery: /gallery|carousel|image.*grid/i,
    whatsapp_bubble: /whatsapp|wa\.me/i,
    menu: /menu|menuItem/i,
    online_ordering: /order|cart|checkout/i,
    location_map: /map|location|coordinates/i,
    product_grid: /product.*grid|shop.*grid/i,
    cart: /cart|shopping.*cart/i,
    payment: /payment|checkout|stripe|upayments/i,
    contact_form: /form.*contact|contact.*form/i,
    testimonials: /testimonial|review/i,
    pricing_table: /pricing|price.*table/i,
    faq_accordion: /faq|accordion/i,
  }

  const missingWidgets: string[] = []

  for (const widget of requestedWidgets) {
    const pattern = widgetPatterns[widget]
    if (pattern && !pattern.test(code)) {
      missingWidgets.push(widget)
    }
  }

  const passed = missingWidgets.length === 0

  return {
    name: 'Widget Functionality',
    nameAr: 'وظائف الويدجت',
    passed,
    severity: missingWidgets.length > 2 ? 'critical' : 'warning',
    message: passed
      ? 'All widgets present'
      : `Missing widgets: ${missingWidgets.join(', ')}`,
    messageAr: passed
      ? 'جميع الويدجت موجودة'
      : `ويدجت مفقودة: ${missingWidgets.length}`,
    autoFix: false,
  }
}

/**
 * Check 4: Mobile Responsive
 */
async function checkMobileResponsive(code: string): Promise<ValidationCheck> {
  // Check for responsive Tailwind classes
  const hasResponsiveClasses = /\b(sm|md|lg|xl|2xl):/.test(code)

  // Check for viewport meta tag
  const hasViewportMeta = /viewport.*width=device-width/.test(code)

  // Check for flexbox/grid
  const hasFlexOrGrid = /\b(flex|grid)\b/.test(code)

  const score = [hasResponsiveClasses, hasViewportMeta, hasFlexOrGrid].filter(Boolean).length
  const passed = score >= 2

  return {
    name: 'Mobile Responsive',
    nameAr: 'متجاوب مع الموبايل',
    passed,
    severity: 'warning',
    message: passed ? 'Responsive design detected' : 'Limited responsive design',
    messageAr: passed ? 'تصميم متجاوب مكتشف' : 'تصميم متجاوب محدود',
    autoFix: false,
  }
}

/**
 * Check 5: Console Errors
 */
async function checkConsoleErrors(code: string): Promise<ValidationCheck> {
  // Check for common error patterns
  const errorPatterns = [
    /console\.error/,
    /throw new Error/,
    /undefined is not/,
    /cannot read property/i,
  ]

  const hasErrors = errorPatterns.some((pattern) => pattern.test(code))

  // Check for debugging console.log (warning only)
  const hasDebugLogs = /console\.log/.test(code)

  return {
    name: 'Console Errors',
    nameAr: 'أخطاء الكونسول',
    passed: !hasErrors,
    severity: hasErrors ? 'critical' : hasDebugLogs ? 'warning' : 'info',
    message: hasErrors
      ? 'Error handling code detected'
      : hasDebugLogs
        ? 'Debug console.log detected'
        : 'No console errors',
    messageAr: hasErrors
      ? 'تم اكتشاف كود معالجة أخطاء'
      : hasDebugLogs
        ? 'تم اكتشاف console.log للتطوير'
        : 'لا توجد أخطاء في الكونسول',
    autoFix: false,
  }
}

/**
 * Check 6: Color Scheme
 */
async function checkColorScheme(code: string, prompt: DeepSeekPrompt): Promise<ValidationCheck> {
  const primaryColor = prompt.styling.colors.primary

  // Check if primary color is used
  const hasPrimaryColor = code.includes(primaryColor)

  // Check for color classes (Tailwind or inline styles)
  const hasColorClasses = /bg-|text-|border-/.test(code) || /style.*color/.test(code)

  const passed = hasPrimaryColor || hasColorClasses

  return {
    name: 'Color Scheme',
    nameAr: 'نظام الألوان',
    passed,
    severity: 'warning',
    message: passed ? 'Color scheme applied' : 'Color scheme may be missing',
    messageAr: passed ? 'نظام الألوان مطبق' : 'نظام الألوان قد يكون مفقوداً',
    autoFix: false,
  }
}

/**
 * Check 7: Security
 */
async function checkSecurity(code: string): Promise<ValidationCheck> {
  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /dangerouslySetInnerHTML/, name: 'dangerouslySetInnerHTML' },
    { pattern: /eval\s*\(/, name: 'eval()' },
    { pattern: /Function\s*\(/, name: 'Function() constructor' },
    { pattern: /<script[^>]*>.*<\/script>/i, name: 'inline script tags' },
  ]

  const foundDangerousPatterns = dangerousPatterns.filter((p) => p.pattern.test(code))

  const passed = foundDangerousPatterns.length === 0

  return {
    name: 'Security',
    nameAr: 'الأمان',
    passed,
    severity: 'critical',
    message: passed
      ? 'No security issues detected'
      : `Security issues: ${foundDangerousPatterns.map((p) => p.name).join(', ')}`,
    messageAr: passed
      ? 'لا توجد مشاكل أمنية'
      : `مشاكل أمنية: ${foundDangerousPatterns.length}`,
    autoFix: false,
  }
}

/**
 * Auto-fix validation issues where possible
 */
export function autoFixCode(code: string, validationResult: ValidationResult): string {
  let fixedCode = code

  for (const check of validationResult.checks) {
    if (!check.passed && check.autoFix) {
      if (check.name === 'RTL Layout') {
        fixedCode = addRTLAttribute(fixedCode)
      } else if (check.name === 'Arabic Rendering') {
        fixedCode = addCairoFont(fixedCode)
      }
    }
  }

  return fixedCode
}

/**
 * Add dir="rtl" to root HTML element
 */
function addRTLAttribute(code: string): string {
  // Add to <html> tag
  if (/<html[^>]*>/.test(code)) {
    return code.replace(/<html([^>]*)>/, '<html$1 dir="rtl">')
  }

  // Add to root div
  if (/<div[^>]*className=["'].*root/.test(code)) {
    return code.replace(/(<div[^>]*className=["'][^"']*root[^"']*["'][^>]*)>/, '$1 dir="rtl">')
  }

  // Add as wrapper
  return `<div dir="rtl">\n${code}\n</div>`
}

/**
 * Add Cairo font import and application
 */
function addCairoFont(code: string): string {
  // Check if Google Fonts import exists
  if (!/@import.*fonts\.googleapis\.com/.test(code)) {
    const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');\n\n`

    // Add to <style> tag if exists
    if (/<style[^>]*>/.test(code)) {
      code = code.replace(/(<style[^>]*>)/, `$1\n${fontImport}`)
    } else {
      // Add as inline style
      code = `<style>\n${fontImport}</style>\n${code}`
    }
  }

  // Apply font to body or root
  if (!/font-family.*Cairo/.test(code)) {
    const fontStyle = `font-family: 'Cairo', sans-serif;`

    if (/<body[^>]*style=["']/.test(code)) {
      code = code.replace(/(<body[^>]*style=["'][^"']*)/, `$1${fontStyle}`)
    } else if (/<body[^>]*>/.test(code)) {
      code = code.replace(/<body([^>]*)>/, `<body$1 style="${fontStyle}">`)
    }
  }

  return code
}

/**
 * Generate validation summary for display
 */
export function generateValidationSummary(result: ValidationResult): string {
  const lines: string[] = []

  lines.push(`✓ النتيجة: ${result.score}%`)
  lines.push(``)

  if (result.passed) {
    lines.push(`✅ جميع الفحوصات نجحت`)
  } else {
    lines.push(`⚠️ يوجد ${result.errors.length} أخطاء حرجة`)
    if (result.warnings.length > 0) {
      lines.push(`⚠️ يوجد ${result.warnings.length} تحذيرات`)
    }
  }

  lines.push(``)
  lines.push(`الفحوصات:`)

  for (const check of result.checks) {
    const icon = check.passed ? '✅' : check.severity === 'critical' ? '❌' : '⚠️'
    lines.push(`${icon} ${check.nameAr}`)
  }

  return lines.join('\n')
}
