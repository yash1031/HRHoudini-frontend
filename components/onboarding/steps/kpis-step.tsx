"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  Award,
  Calendar,
  Briefcase,
} from "lucide-react"
import { useOnboarding } from "../onboarding-template"

// Available KPI panels
const AVAILABLE_KPIS = [
  {
    id: "turnover-rate",
    label: "Turnover Rate",
    description: "Monthly/quarterly employee turnover",
    icon: TrendingDown,
    category: "retention",
  },
  {
    id: "employee-productivity",
    label: "Employee Productivity Rate",
    description: "Output per employee metrics",
    icon: TrendingUp,
    category: "performance",
  },
  {
    id: "salary-increase",
    label: "Salary Increase Rate",
    description: "Compensation growth trends",
    icon: DollarSign,
    category: "compensation",
  },
  {
    id: "engagement-score",
    label: "Employee Engagement Score",
    description: "Survey-based engagement metrics",
    icon: Users,
    category: "engagement",
  },
  {
    id: "training-cost",
    label: "Training Cost Per Employee",
    description: "L&D investment per person",
    icon: Award,
    category: "development",
  },
  {
    id: "revenue-per-employee",
    label: "Revenue Per Employee",
    description: "Business impact per person",
    icon: DollarSign,
    category: "business",
  },
  {
    id: "cost-per-hire",
    label: "Cost Per Hire",
    description: "Total recruiting investment",
    icon: Briefcase,
    category: "recruiting",
  },
  {
    id: "absenteeism-rate",
    label: "Absenteeism Rate",
    description: "Unplanned absence tracking",
    icon: Calendar,
    category: "wellness",
  },
  {
    id: "offer-acceptance",
    label: "Offer Acceptance Rate",
    description: "Recruiting conversion success",
    icon: Target,
    category: "recruiting",
  },
  {
    id: "time-to-fill",
    label: "Time to Fill",
    description: "Days to fill open positions",
    icon: Clock,
    category: "recruiting",
  },
]

// Role-specific KPI recommendations
const ROLE_KPI_RECOMMENDATIONS = {
  "hr-generalist": ["turnover-rate", "engagement-score", "cost-per-hire", "absenteeism-rate", "salary-increase"],
  "talent-acquisition": ["time-to-fill", "cost-per-hire", "offer-acceptance", "revenue-per-employee"],
  "team-lead": ["engagement-score", "turnover-rate", "employee-productivity", "absenteeism-rate"],
}

export function KPIsStep() {
  const { setStep, userContext } = useOnboarding()
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(
    ROLE_KPI_RECOMMENDATIONS[userContext.role as keyof typeof ROLE_KPI_RECOMMENDATIONS] || [],
  )

  const handleKPIToggle = (kpiId: string) => {
    setSelectedKPIs((prev) => (prev.includes(kpiId) ? prev.filter((id) => id !== kpiId) : [...prev, kpiId]))
  }

  const handleNext = () => {
    // Store selected KPIs in localStorage or context
    localStorage.setItem("hr-houdini-selected-kpis", JSON.stringify(selectedKPIs))
    // setStep(4)
    setStep(3)
  }

  const groupedKPIs = AVAILABLE_KPIS.reduce(
    (acc, kpi) => {
      if (!acc[kpi.category]) acc[kpi.category] = []
      acc[kpi.category].push(kpi)
      return acc
    },
    {} as Record<string, typeof AVAILABLE_KPIS>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Which KPIs matter most to you?</CardTitle>
        <CardDescription>
          Select the metrics you track regularly. We've pre-selected some based on your role, but you can customize
          these.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {Object.entries(groupedKPIs).map(([category, kpis]) => (
            <div key={category} className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 capitalize text-center">{category}</h4>
              <div className="space-y-2">
                {kpis.map((kpi) => {
                  const IconComponent = kpi.icon
                  const isRecommended = ROLE_KPI_RECOMMENDATIONS[
                    userContext.role as keyof typeof ROLE_KPI_RECOMMENDATIONS
                  ]?.includes(kpi.id)
                  return (
                    <div
                      key={kpi.id}
                      className={`flex items-start space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedKPIs.includes(kpi.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() => handleKPIToggle(kpi.id)}
                    >
                      <Checkbox
                        checked={selectedKPIs.includes(kpi.id)}
                        onChange={() => handleKPIToggle(kpi.id)}
                        className="mt-0.5"
                      />
                      <IconComponent className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{kpi.label}</p>
                          {isRecommended && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{kpi.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">
            <strong>Selected:</strong> {selectedKPIs.length} of {AVAILABLE_KPIS.length} KPIs. Your dashboard will show
            tiles for these metrics, and you can add or remove them later.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(2)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={selectedKPIs.length === 0}>
            <span>Continue</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
