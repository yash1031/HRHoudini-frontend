"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Users, TrendingUp, FileText } from "lucide-react"
import { useOnboarding } from "../onboarding-template"

export function WelcomeStep() {
  const { setStep, userContext, scenarioConfig } = useOnboarding()

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-blue-600" />
        </div>
        <CardTitle>Welcome to HR Houdini, {userContext.name.split(" ")[0]}!</CardTitle>
        <CardDescription>
          Let's personalize your experience based on your role as {userContext.role.replace("-", " ")} at{" "}
          {userContext.company}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What we'll help you accomplish:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Identify Your Tasks</p>
                <p className="text-xs text-gray-600">What you do regularly</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Choose Your KPIs</p>
                <p className="text-xs text-gray-600">Metrics that matter to you</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Handle Urgent Tasks</p>
                <p className="text-xs text-gray-600">What's top-of-mind now</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Upload a Sample File</p>
                <p className="text-xs text-gray-600">See HR Houdini in action</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>Chat with HR Houdini</strong> - Experience the insight and ease of interacting with HR Houdini as
              we walk you through this in minutes, not hours.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={() => setStep(2)} className="flex items-center space-x-2">
            <span>Let's personalize your experience</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
