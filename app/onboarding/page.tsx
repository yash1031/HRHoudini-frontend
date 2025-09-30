"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { demoScenarios, ROLE_SCENARIO_MAPPING, ROLE_CHALLENGE_PRESETS } from "@/lib/demo-config"
import { HRGeneralistOnboarding } from "@/components/onboarding/scenarios/hr-generalist-onboarding"
import { RecruiterOnboarding } from "@/components/onboarding/scenarios/recruiter-onboarding"
import { TeamLeadOnboarding } from "@/components/onboarding/scenarios/team-lead-onboarding"
// import Image from "next/image"

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

interface Challenge {
  id: string
  label: string
  priority: number
  preSelected: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<any>(null)
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const name = urlParams.get("name")
    const email = urlParams.get("email")
    const company = urlParams.get("company")
    const role = urlParams.get("role")

    if (name && email && company && role) {
      const context = { name, email, company, role }
      setUserContext(context)

      // Auto-select scenario based on role
      const scenarioId = ROLE_SCENARIO_MAPPING[role as keyof typeof ROLE_SCENARIO_MAPPING] || 1
      const scenario = demoScenarios.find((s) => s.id === scenarioId)
      setSelectedScenario(scenario)

      // Set up role-specific challenges
      const roleChallenges =
        ROLE_CHALLENGE_PRESETS[role as keyof typeof ROLE_CHALLENGE_PRESETS] || ROLE_CHALLENGE_PRESETS["hr-generalist"]
      setAvailableChallenges(roleChallenges)
      setSelectedChallenges(roleChallenges.filter((c) => c.preSelected).map((c) => c.id))
    }
  }, [])

  const handleChallengeToggle = (challengeId: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challengeId) ? prev.filter((id) => id !== challengeId) : [...prev, challengeId],
    )
  }

  const handleFileUpload = (file: File, metadata: any) => {
    setUploadedFile({ file, metadata })
  }

  const skipToStep = (targetStep: number) => {
    setStep(targetStep)
  }

  const skipToDashboard = () => {
    finishOnboarding(true)
  }

  const finishOnboarding = (skipped = false) => {
    if (!userContext) return

    const onboardingData = {
      user: userContext,
      scenario: selectedScenario,
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

  if (!userContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/hr-houdini-logo-new.png" alt="HR Houdini Logo" width="200" height="60" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized experience...</p>
        </div>
      </div>
    )
  }

  // Route to appropriate scenario based on role
  switch (userContext.role) {
    case "hr-generalist":
      return <HRGeneralistOnboarding userContext={userContext} />
    case "talent-acquisition":
      return <RecruiterOnboarding userContext={userContext} />
    case "team-lead":
      return <TeamLeadOnboarding userContext={userContext} />
    default:
      // Default to HR Generalist for unknown roles
      return <HRGeneralistOnboarding userContext={userContext} />
  }
}
