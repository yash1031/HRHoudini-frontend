"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { MailCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get("email") || ""

  console.log("email in check-email page", email)

  const handleGoHome = () => {
    const target = email ? `/login?email=${encodeURIComponent(email)}` : "/login"
    console.log("target in check-email page", target)   
    router.push(target)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <MailCheck className="h-7 w-7 text-blue-600" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Verify your email to get started
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          {email
            ? `We’ve sent a verification link to `
            : `We’ve sent a verification link to your email address.`}
          {email && <span className="font-medium text-slate-900">{email}</span>}
        </p>
        <p className="text-xs text-slate-500 mb-8">
          Please check your inbox and spam folder. You&apos;ll be able to sign in once your email
          is verified.
        </p>
        <Button
          type="button"
          onClick={handleGoHome}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Go to Home
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

