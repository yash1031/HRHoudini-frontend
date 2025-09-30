"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, Target } from "lucide-react"
import { useOnboarding } from "../onboarding-template"

export function ChallengeStep() {
  const { setStep, selectedChallenges, setSelectedChallenges, userContext, scenarioConfig } = useOnboarding()

  const handleChallengeToggle = (challengeId: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challengeId) ? prev.filter((id) => id !== challengeId) : [...prev, challengeId],
    )
  }

  const skipToStep = (targetStep: number) => {
    setStep(targetStep)
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Target className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>What should we focus on first?</CardTitle>
        <CardDescription>
          We've pre-selected the most important challenges for {userContext.role}s. Reorder or adjust as needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {scenarioConfig.challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                selectedChallenges.includes(challenge.id)
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Checkbox
                id={challenge.id}
                checked={selectedChallenges.includes(challenge.id)}
                onCheckedChange={() => handleChallengeToggle(challenge.id)}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{challenge.label}</span>
                  {challenge.preSelected && (
                    <Badge variant="secondary" className="text-xs">
                      Recommended
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500">Priority {challenge.priority}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => skipToStep(4)}>
              Use recommended priorities
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={selectedChallenges.length === 0}
              className="flex items-center space-x-2"
            >
              <span>Personalize dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
