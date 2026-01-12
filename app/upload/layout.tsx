"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { UploadProvider } from "@/contexts/upload-context"
import { UploadLayout } from "@/components/upload/layout/upload-layout"

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

export default function UploadRoutesLayout({ children }: { children: React.ReactNode }) {
  const [userContext, setUserContext] = useState<UserContext | null>(null)

  useEffect(() => {
    const name = localStorage.getItem("user_name") || ""
    const email = localStorage.getItem("user_email") || ""
    const company = localStorage.getItem("user_company") || ""
    const role = localStorage.getItem("user_role") || ""
    const context = { name, email, company, role }
    setUserContext(context)
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

  return (
    <UploadProvider>
      <UploadLayout userContext={userContext} showWelcome={true}>
        {children}
      </UploadLayout>
    </UploadProvider>
  )
}
