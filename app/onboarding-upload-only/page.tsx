"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HRGeneralistUploadOnlyOnboarding } from "@/components/onboarding/scenarios/hr-generalist-upload-only-onboarding"
import Image from "next/image"
import { useDashboard } from '@/contexts/dashboard-context';

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

export default function OnboardingUploadOnlyPage() {
  const router = useRouter()
  const [userContext, setUserContext] = useState<UserContext | null>(null)
    const { setCardsState, setChartsState, setMetadata} = useDashboard();

  useEffect(() => {
    const name= localStorage.getItem("user_name")||""
    const email= localStorage.getItem("user_email")||""
    const company= localStorage.getItem("user_company")||""
    const role= localStorage.getItem("user_role")||""
    console.log("In onboarding-upload-only page", "name", name, "email", email, "company", company, "role", role)
    const context = { name, email, company, role }
    setUserContext(context)
    // sessionStorage.removeItem("cardsState")
    // sessionStorage.removeItem("chartsState")
    // sessionStorage.removeItem("metadata")
    // setCardsState({data: [], loading: false, error: null})
    // setChartsState({data: [], loading: false, error: null})
    // setMetadata({"filename":"", "totalRows":""})
  }, [])

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
