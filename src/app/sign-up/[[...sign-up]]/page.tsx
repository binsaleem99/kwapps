import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white" dir="rtl">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-['Cairo']">
            أنشئ حسابك
          </h1>
          <p className="text-slate-600 font-['Cairo']">
            ابدأ رحلتك مع KW APPS اليوم
          </p>
        </div>

        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-xl',
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            redirectUrl="/onboarding"
          />
        </div>
      </div>
    </div>
  )
}
