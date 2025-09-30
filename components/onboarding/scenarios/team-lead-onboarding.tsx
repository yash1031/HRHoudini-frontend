"use client"

import { WelcomeStep } from "../steps/welcome-step"
import { TasksStep } from "../steps/tasks-step"
import { KPIsStep } from "../steps/kpis-step"
import { UrgentTaskStep } from "../steps/urgent-task-step"
import { DataUploadStep } from "../steps/data-upload-step"
import { OnboardingTemplate, useOnboarding } from "../onboarding-template"
import { ONBOARDING_SCENARIOS } from "@/lib/demo-config"

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

interface TeamLeadOnboardingProps {
  userContext: UserContext
}

function OnboardingContent() {
  const { step } = useOnboarding()

  switch (step) {
    case 1:
      return <WelcomeStep />
    case 2:
      return <TasksStep />
    case 3:
      return <KPIsStep />
    case 4:
      return <UrgentTaskStep />
    case 5:
      return <DataUploadStep />
    default:
      return <WelcomeStep />
  }
}

export function TeamLeadOnboarding({ userContext }: TeamLeadOnboardingProps) {
  const scenarioConfig = ONBOARDING_SCENARIOS["team-lead"]

  return (
    <OnboardingTemplate userContext={userContext} scenarioConfig={scenarioConfig}>
      <OnboardingContent />
    </OnboardingTemplate>
  )
}
