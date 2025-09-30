"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import type { OnboardingScenarioConfig } from "@/lib/demo-config"

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

interface OnboardingTemplateProps {
  userContext: UserContext
  scenarioConfig: OnboardingScenarioConfig
  children: React.ReactNode
  useLabels?: boolean
  stepLabels?: string[]
  totalSteps?: number
  hideProgress?: boolean
}

export function OnboardingTemplate({
  userContext,
  scenarioConfig,
  children,
  useLabels = false,
  stepLabels = [],
  totalSteps = 5,
  hideProgress = false,
}: OnboardingTemplateProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(
    scenarioConfig.challenges.filter((c) => c.preSelected).map((c) => c.id),
  )

  const skipToDashboard = () => {
    finishOnboarding(true)
  }

  const finishOnboarding = (skipped = false) => {
    const onboardingData = {
      user: userContext,
      scenario: scenarioConfig,
      uploadedFile: uploadedFile,
      challenges: selectedChallenges,
      completed: !skipped,
      timestamp: new Date().toISOString(),
    }

    // Store in localStorage
    try {
      localStorage.setItem("hr-houdini-onboarding", JSON.stringify(onboardingData))
    } catch (error) {
      console.error("Error saving onboarding data:", error)
    }

    // Navigate to dashboard with onboarding context
    const params = new URLSearchParams({
      persona: userContext.role,
      company: userContext.company,
      challenges: selectedChallenges.join(","),
      onboarding: "completed",
      hasFile: uploadedFile ? "true" : "false",
    })

    router.push(`/dashboard?${params.toString()}`)
  }

  const contextValue = {
    step,
    setStep,
    uploadedFile,
    setUploadedFile,
    selectedChallenges,
    setSelectedChallenges,
    userContext,
    scenarioConfig,
    skipToDashboard,
    finishOnboarding,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HR Houdini, {userContext.name.split(" ")[0]}!
          </h1>
          <p className="text-lg text-gray-600">Let's transform your data into strategic HR insights</p>

          {!hideProgress && (
            <>
              {useLabels ? (
                <div className="flex justify-center mt-6 space-x-12">
                  {stepLabels.slice(0, totalSteps).map((label, index) => {
                    const stepNum = index + 1
                    const isActive = step === stepNum
                    const isCompleted = step > stepNum

                    return (
                      <div key={stepNum} className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${
                            isCompleted ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        />
                        <div className={`mt-2 text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                          {label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                // Numbered Steps Design (Original)
                <div className="flex justify-center mt-6 space-x-4">
                  {Array.from({ length: totalSteps }, (_, index) => index + 1).map((stepNum) => (
                    <div key={stepNum} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum}
                      </div>
                      {stepNum < totalSteps && (
                        <div className={`w-12 h-0.5 ml-4 ${step > stepNum ? "bg-blue-600" : "bg-gray-200"}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Step Content */}
        <OnboardingContext.Provider value={contextValue}>{children}</OnboardingContext.Provider>
      </div>
    </div>
  )
}

// Context for sharing state between steps
import { createContext, useContext } from "react"

interface OnboardingContextType {
  step: number
  setStep: (step: number) => void
  uploadedFile: any
  setUploadedFile: (file: any) => void
  selectedChallenges: string[]
  setSelectedChallenges: (challenges: string[]) => void
  userContext: UserContext
  scenarioConfig: OnboardingScenarioConfig
  skipToDashboard: () => void
  finishOnboarding: (skipped?: boolean) => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingTemplate")
  }
  return context
}
