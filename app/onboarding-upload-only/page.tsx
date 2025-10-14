"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HRGeneralistUploadOnlyOnboarding } from "@/components/onboarding/scenarios/hr-generalist-upload-only-onboarding"
import {getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
// import Hub  from 'aws-amplify';
import Image from "next/image"
import { useUserContext } from "@/contexts/user-context" 
// Amplify.Logger.LOG_LEVEL = 'DEBUG';

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

export default function OnboardingUploadOnlyPage() {
  const router = useRouter()
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  
  const { updateUser} = useUserContext()

  useEffect(() => {
    
    onboardingFun()
  }, [])

  const onboardingFun = async () => {
    const urlParams = new URLSearchParams(window.location.search)
      const name = urlParams.get("name")
      const email = urlParams.get("email")
      const company = urlParams.get("company")
      const role = urlParams.get("role")

      if (name && email && company && role) {
        const context = { name, email, company, role }
        setUserContext(context)
      }
  }

  if (!userContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Image src="/hr-houdini-final.png" alt="HR Houdini Logo" width={100} height={100} className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized experience...</p>
        </div>
      </div>
    )
  }

  return <HRGeneralistUploadOnlyOnboarding userContext={userContext} />
}
