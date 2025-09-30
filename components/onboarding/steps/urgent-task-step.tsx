"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, ArrowLeft, Sparkles, Clock, AlertTriangle, FileText, Users, BarChart } from "lucide-react"
import { useOnboarding } from "../onboarding-template"

// Common urgent tasks by role
const ROLE_URGENT_TASKS = {
  "hr-generalist": [
    {
      id: "leadership-prep",
      title: "Leadership Meeting Prep",
      description: "Prepare insights and reports for upcoming leadership meeting",
      icon: BarChart,
      example:
        "I need to prep for a leadership meeting next week and surface patterns I normally wouldn't have time to analyze",
      workflow: "leadership-prep",
    },
    {
      id: "turnover-investigation",
      title: "Turnover Spike Investigation",
      description: "Investigate sudden increase in departures",
      icon: AlertTriangle,
      example: "We've had 5 people quit this month and I need to understand why",
      workflow: "crisis-response",
    },
    {
      id: "compliance-audit",
      title: "Compliance Audit Prep",
      description: "Prepare documentation for compliance review",
      icon: FileText,
      example: "I have a compliance audit coming up and need to gather all our HR metrics",
      workflow: "compliance-prep",
    },
  ],
  "talent-acquisition": [
    {
      id: "pipeline-review",
      title: "Pipeline Health Check",
      description: "Review recruiting pipeline and identify bottlenecks",
      icon: Users,
      example: "I need to review our recruiting pipeline for the monthly talent ops meeting",
      workflow: "pipeline-review",
    },
    {
      id: "aging-reqs",
      title: "Aging Requisitions",
      description: "Address requisitions that have been open too long",
      icon: Clock,
      example: "Several of my reqs have been open for over 30 days and I need to understand why",
      workflow: "aging-reqs",
    },
  ],
  "team-lead": [
    {
      id: "team-risk-alert",
      title: "Team Risk Assessment",
      description: "Respond to team member retention risk alerts",
      icon: AlertTriangle,
      example: "I got an alert that two of my team members might be at risk of leaving",
      workflow: "team-risk",
    },
    {
      id: "engagement-review",
      title: "Team Engagement Review",
      description: "Review team engagement and plan interventions",
      icon: Users,
      example: "Our latest engagement scores are concerning and I need to understand what's happening",
      workflow: "engagement-review",
    },
  ],
}

export function UrgentTaskStep() {
  const { setStep, userContext, finishOnboarding } = useOnboarding()
  const [selectedTask, setSelectedTask] = useState<string>("")
  const [customTask, setCustomTask] = useState<string>("")
  const [useCustom, setUseCustom] = useState(false)

  const roleTasks = ROLE_URGENT_TASKS[userContext.role as keyof typeof ROLE_URGENT_TASKS] || []

  const handleTaskSelect = (taskId: string) => {
    setSelectedTask(taskId)
    setUseCustom(false)
    setCustomTask("")
  }

  const handleCustomToggle = () => {
    setUseCustom(true)
    setSelectedTask("")
  }

  const handleNext = () => {
    const urgentTask = useCustom ? customTask : selectedTask

    // Store the urgent task context
    const urgentTaskData = {
      type: useCustom ? "custom" : selectedTask,
      description: useCustom ? customTask : roleTasks.find((t) => t.id === selectedTask)?.example || "",
      workflow: useCustom ? "custom" : roleTasks.find((t) => t.id === selectedTask)?.workflow || "",
    }

    localStorage.setItem("hr-houdini-urgent-task", JSON.stringify(urgentTaskData))

    // Proceed to step 5 (data upload)
    setStep(5)
  }

  const canProceed = selectedTask || (useCustom && customTask.trim().length > 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's most urgent for you right now?</CardTitle>
        <CardDescription>
          Tell us about any pressing tasks or challenges. We can help you tackle these immediately after setup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          {roleTasks.map((task) => {
            const IconComponent = task.icon
            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTask === task.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleTaskSelect(task.id)}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 italic">
                      Example: "{task.example}"
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              useCustom ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={handleCustomToggle}
          >
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Something else</h4>
                <p className="text-sm text-gray-600 mt-1">Describe your specific urgent task or challenge</p>
                {useCustom && (
                  <Textarea
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    placeholder="Describe what you need help with right now..."
                    className="mt-3"
                    rows={3}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">We'll help you tackle this immediately</p>
              <p className="text-sm text-blue-800 mt-1">
                After setup, we'll guide you through handling your urgent task step-by-step, turning hours of work into
                minutes of insights.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(3)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => finishOnboarding(false)}>
              Skip - No urgent tasks
            </Button>
            <Button onClick={handleNext} disabled={!canProceed}>
              <span>Next</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
