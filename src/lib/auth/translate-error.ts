/**
 * Translates Supabase/Auth error messages to Arabic
 * Used across all authentication pages for consistent error messaging
 */
export function translateAuthError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    // Email errors
    'Email address is invalid': 'عنوان البريد الإلكتروني غير صالح',
    'Unable to validate email address: invalid format': 'صيغة البريد الإلكتروني غير صحيحة',
    'A user with this email address has already been registered': 'هذا البريد الإلكتروني مسجل بالفعل',
    'User already registered': 'هذا البريد الإلكتروني مسجل بالفعل',
    'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً',
    'User not found': 'لم يتم العثور على حساب بهذا البريد الإلكتروني',

    // Password errors
    'Password should be at least 6 characters': 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل',
    'Password should be at least 8 characters': 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل',
    'Password is too weak': 'كلمة المرور ضعيفة جداً',
    'New password should be different from the old password': 'يجب أن تكون كلمة المرور الجديدة مختلفة عن القديمة',

    // Rate limiting
    'For security purposes, you can only request this once every 60 seconds': 'لأسباب أمنية، يمكنك المحاولة مرة واحدة كل 60 ثانية',
    'Too many requests': 'طلبات كثيرة جداً. يرجى الانتظار قليلاً',

    // Database errors
    'Database error saving new user': 'خطأ في حفظ البيانات. يرجى المحاولة مرة أخرى',
    'Database error': 'خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى',

    // Network errors
    'Network error': 'خطأ في الاتصال. يرجى التحقق من الإنترنت',
    'Failed to fetch': 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى',

    // Auth errors
    'Invalid login credentials': 'بيانات تسجيل الدخول غير صحيحة',
    'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'Signup is disabled': 'التسجيل معطل حالياً',

    // OAuth errors
    'oauth_failed': 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى',

    // Password reset errors
    'Auth session missing': 'انتهت صلاحية الجلسة. يرجى إعادة المحاولة',
    'Token has expired or is invalid': 'رابط غير صالح أو منتهي الصلاحية',
  }

  // Check for exact or partial match
  for (const [en, ar] of Object.entries(errorMap)) {
    if (errorMessage.includes(en)) {
      return ar
    }
  }

  // Check for email-specific pattern (e.g., "Email address "x@y.com" is invalid")
  if (errorMessage.includes('is invalid') && errorMessage.includes('Email')) {
    return 'عنوان البريد الإلكتروني غير صالح'
  }

  // Default fallback
  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى'
}
