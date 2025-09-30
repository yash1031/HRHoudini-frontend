"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowRight, ArrowLeft, Users, FileText, BarChart, AlertTriangle, Calendar } from "lucide-react"
import { useOnboarding } from "../onboarding-template"

// Primary tasks based on persona role
const ROLE_PRIMARY_TASKS = {
  "hr-generalist": [
    { id: "leadership-reporting", label: "Prepare leadership reports and presentations", icon: BarChart, priority: 1 },
    { id: "headcount-tracking", label: "Track headcount and organizational changes", icon: Users, priority: 2 },
    { id: "turnover-analysis", label: "Analyze turnover patterns and trends", icon: AlertTriangle, priority: 3 },
    { id: "compliance-monitoring", label: "Monitor HR compliance and policies", icon: FileText, priority: 4 },
    { id: "employee-relations", label: "Handle employee relations issues", icon: Users, priority: 5 },
    { id: "benefits-administration", label: "Manage benefits and compensation", icon: Calendar, priority: 6 },
  ],
  "talent-acquisition": [
    { id: "pipeline-management", label: "Manage recruiting pipeline and requisitions", icon: Users, priority: 1 },
    { id: "sourcing-analysis", label: "Analyze sourcing effectiveness", icon: BarChart, priority: 2 },
    { id: "hiring-metrics", label: "Track time-to-fill and hiring metrics", icon: AlertTriangle, priority: 3 },
    { id: "candidate-experience", label: "Improve candidate experience", icon: FileText, priority: 4 },
    { id: "recruiter-performance", label: "Monitor recruiter performance", icon: Calendar, priority: 5 },
  ],
  "team-lead": [
    { id: "team-health", label: "Monitor team health and engagement", icon: Users, priority: 1 },
    { id: "retention-risk", label: "Identify retention risks early", icon: AlertTriangle, priority: 2 },
    { id: "performance-tracking", label: "Track team performance metrics", icon: BarChart, priority: 3 },
    { id: "one-on-ones", label: "Conduct effective 1:1 meetings", icon: Calendar, priority: 4 },
    { id: "development-planning", label: "Plan employee development", icon: FileText, priority: 5 },
  ],
}

export function TasksStep() {
  const { setStep, userContext, selectedChallenges, setSelectedChallenges } = useOnboarding()
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const roleTasks =
    ROLE_PRIMARY_TASKS[userContext.role as keyof typeof ROLE_PRIMARY_TASKS] || ROLE_PRIMARY_TASKS["hr-generalist"]

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const handleNext = () => {
    // Store selected tasks in the onboarding context
    setSelectedChallenges([...selectedChallenges, ...selectedTasks])
    setStep(3)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What are your primary responsibilities?</CardTitle>
        <CardDescription>
          Select the tasks you perform regularly. This helps us personalize your dashboard and suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {roleTasks.map((task) => {
            const IconComponent = task.icon
            return (
              <div
                key={task.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTasks.includes(task.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleTaskToggle(task.id)}
              >
                <Checkbox checked={selectedTasks.includes(task.id)} onChange={() => handleTaskToggle(task.id)} />
                <IconComponent className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> Select 3-5 tasks that take up most of your time. You can always adjust these later in
            your dashboard settings.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={selectedTasks.length === 0}>
            <span>Continue to KPIs</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
