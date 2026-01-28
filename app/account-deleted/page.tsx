"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home } from "lucide-react"
import { signOutUser } from "@/lib/auth/sign-out"

export default function AccountDeletedPage() {
  const router = useRouter()

  // Automatically sign out when page loads (in case user navigated here directly)
  useEffect(() => {
    // Only sign out if user is still logged in (has tokens)
    const hasTokens = localStorage.getItem('access_token') || localStorage.getItem('id_token')
    if (hasTokens) {
      signOutUser('/account-deleted')
    }
  }, [])

  const handleBackToHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md border-gray-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Account Deleted
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Your account has been permanently deleted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 text-center">
              We're sorry to see you go. All your account data and associated information have been permanently removed from our systems.
            </p>
          </div>
          <Button
            onClick={handleBackToHome}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            size="lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}