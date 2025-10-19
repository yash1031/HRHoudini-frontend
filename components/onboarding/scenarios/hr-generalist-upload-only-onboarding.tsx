"use client"

import { WelcomeStep } from "../steps-upload-only/welcome-step"
import { FileUploadStep } from "../steps-upload-only/file-upload-step"
import { KPIsStep } from "../steps-upload-only/kpis-step"
// import {  useOnboarding } from "../onboarding-template"
import { OnboardingTemplate, useOnboarding } from "../onboarding-template"
// import { ONBOARDING_SCENARIOS } from "@/lib/demo-config"

interface UserContext {
  name: string
  email: string
  company: string
  role: string
}

interface HRGeneralistUploadOnlyOnboardingProps {
  userContext: UserContext
}

function OnboardingContent() {
  const { step } = useOnboarding()

  switch (step) {
    case 1:
      return <WelcomeStep />
    case 2:
      return <FileUploadStep />
    case 3:
      return <KPIsStep />
    default:
      return <WelcomeStep />
  }
}

export function HRGeneralistUploadOnlyOnboarding({ userContext }: HRGeneralistUploadOnlyOnboardingProps) {
  // const scenarioConfig = {
  //   ...ONBOARDING_SCENARIOS["hr-generalist"],
  //   totalSteps: 3,
  // }

  return (
    <OnboardingTemplate
      userContext={userContext}
      // scenarioConfig={scenarioConfig}
      useLabels={true}
      stepLabels={["Welcome", "Upload", "KPIs"]}
      totalSteps={3}
      hideProgress={true}
    >
      <OnboardingContent />
    </OnboardingTemplate>
  )
}
