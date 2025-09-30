"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, CheckCircle, Sparkles, Clock, DollarSign, Briefcase, TrendingDown } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download } from "lucide-react"
import { HeroInsightsTile } from "@/components/hero-insights-tile"

// Enhanced persona to lens mapping
const PERSONA_LENS_MAPPING = {
  "hr-generalist": "census",
  "hr-business-partner": "attrition",
  "talent-acquisition": "recruiting",
  chro: "executive",
  "people-ops": "operations",
  "compensation-analyst": "compensation",
  "diversity-inclusion": "diversity",
  "hr-analyst": "analytics",
  recruiter: "recruiting",
  sourcer: "recruiting",
  "recruiting-coordinator": "recruiting",
  "team-lead": "attrition",
  manager: "attrition",
  director: "executive",
  vp: "executive",
  ceo: "executive",
}

// Role-specific chat placeholders
const ROLE_CHAT_PLACEHOLDERS = {
  "hr-generalist": "Ask about headcount, turnover, or departmental insights...",
  "hr-business-partner": "Ask about team risks, retention strategies, or performance trends...",
  "talent-acquisition": "Ask about pipeline status, time-to-fill, or recruiting metrics...",
  chro: "Ask about strategic workforce insights or executive summaries...",
  "people-ops": "Ask about process efficiency, compliance, or operational metrics...",
  "compensation-analyst": "Ask about pay equity, market analysis, or compensation trends...",
  "diversity-inclusion": "Ask about representation metrics, inclusion surveys, or DEI progress...",
  "hr-analyst": "Ask about data trends, predictive insights, or custom analysis...",
  recruiter: "Ask about candidate pipeline, sourcing effectiveness, or req status...",
  sourcer: "Ask about sourcing channels, candidate quality, or market insights...",
  "recruiting-coordinator": "Ask about interview scheduling, candidate experience, or process efficiency...",
  "team-lead": "Ask about your team's engagement, retention risks, or performance...",
  manager: "Ask about direct report insights, team health, or development needs...",
  director: "Ask about departmental trends, strategic workforce planning, or budget impact...",
  vp: "Ask about organizational health, talent strategy, or executive insights...",
  ceo: "Ask about company-wide talent metrics, strategic workforce insights, or ROI analysis...",
}

// Role-specific suggested queries
const ROLE_SUGGESTED_QUERIES = {
  "hr-generalist": [
    "Show me our current headcount by department",
    "What's our turnover rate this quarter?",
    "Which departments have the highest attrition?",
  ],
  "hr-business-partner": [
    "Who are the employees at risk of leaving?",
    "Show me engagement scores by team",
    "What retention strategies are working best?",
  ],
  "talent-acquisition": [
    "What's the status of our open requisitions?",
    "Which roles take longest to fill?",
    "How is our recruiting pipeline performing?",
  ],
  chro: [
    "Give me an executive summary of workforce health",
    "What are our biggest talent risks?",
    "Show me ROI on our HR initiatives",
  ],
  "people-ops": [
    "What processes need optimization?",
    "Show me compliance metrics",
    "Which HR operations are most efficient?",
  ],
  "compensation-analyst": [
    "Analyze pay equity across demographics",
    "Show me compensation benchmarking data",
    "What are our salary budget variances?",
  ],
  "diversity-inclusion": [
    "Show me representation metrics by level",
    "What's our inclusion survey feedback?",
    "Track progress on DEI goals",
  ],
  "hr-analyst": [
    "Run predictive analysis on turnover",
    "Show me correlation between engagement and performance",
    "Create custom workforce analytics",
  ],
  recruiter: [
    "What's my candidate pipeline status?",
    "Which sourcing channels work best?",
    "Show me my recruiting metrics",
  ],
  sourcer: [
    "Analyze sourcing channel effectiveness",
    "What's our candidate quality by source?",
    "Show me market talent insights",
  ],
  "recruiting-coordinator": [
    "What's our interview-to-offer ratio?",
    "Show me candidate experience feedback",
    "Which processes cause delays?",
  ],
  "team-lead": ["How is my team's engagement?", "Who might be at risk of leaving?", "Show me team performance trends"],
  manager: [
    "What development needs do my reports have?",
    "Show me team health metrics",
    "Who needs attention or recognition?",
  ],
  director: [
    "What are departmental talent trends?",
    "Show me workforce planning insights",
    "What's our talent budget impact?",
  ],
  vp: [
    "Give me organizational health overview",
    "What's our talent strategy effectiveness?",
    "Show me executive talent insights",
  ],
  ceo: [
    "What's our overall talent ROI?",
    "Show me strategic workforce insights",
    "What are company-wide talent risks?",
  ],
}

// Function to calculate KPIs from uploaded data based on selected lens
function calculateKPIsFromData(employeeData: any[], lens = "census") {
  if (!employeeData || employeeData.length === 0) {
    return null
  }

  const activeEmployees = employeeData.filter((emp) => emp.employment_status === "Active")
  const terminatedEmployees = employeeData.filter((emp) => emp.employment_status === "Terminated")

  switch (lens) {
    case "census":
      return calculateCensusKPIs(activeEmployees, terminatedEmployees)
    case "attrition":
      return calculateAttritionKPIs(activeEmployees, terminatedEmployees)
    case "recruiting":
      return calculateRecruitingKPIs(activeEmployees, terminatedEmployees)
    case "executive":
      return calculateExecutiveKPIs(activeEmployees, terminatedEmployees)
    default:
      return calculateCensusKPIs(activeEmployees, terminatedEmployees)
  }
}

// Lens-specific KPI calculation functions
function calculateCensusKPIs(activeEmployees: any[], terminatedEmployees: any[]) {
  const totalSalary = activeEmployees.reduce((sum, emp) => sum + (Number.parseInt(emp.salary) || 0), 0)
  const avgSalary = Math.round(totalSalary / activeEmployees.length)
  const newHires2024 = activeEmployees.filter((emp) => emp.hire_date && emp.hire_date.startsWith("2024"))
  const departments = [...new Set(activeEmployees.map((emp) => emp.department))].length

  return {
    "total-headcount": {
      title: "Total Headcount",
      description: "Active employees",
      icon: Users,
      value: `${activeEmployees.length}`,
      change: "Current staff",
      color: "text-indigo-600",
    },
    "avg-salary": {
      title: "Average Salary",
      description: "Current workforce compensation",
      icon: DollarSign,
      value: `$${avgSalary.toLocaleString()}`,
      change: "Active employees",
      color: "text-blue-600",
    },
    "new-hires": {
      title: "New Hires 2024",
      description: "Recent additions to team",
      icon: TrendingUp,
      value: `${newHires2024.length}`,
      change: "This year",
      color: "text-green-600",
    },
    departments: {
      title: "Departments",
      description: "Organizational structure",
      icon: Briefcase,
      value: `${departments}`,
      change: "Active departments",
      color: "text-teal-600",
    },
  }
}

function calculateAttritionKPIs(activeEmployees: any[], terminatedEmployees: any[]) {
  const recentTerminations = terminatedEmployees.filter(
    (emp) => emp.termination_date && emp.termination_date.startsWith("2024"),
  )
  const turnoverRate = (
    (recentTerminations.length / (activeEmployees.length + recentTerminations.length)) *
    100
  ).toFixed(1)

  const earlyTurnover = terminatedEmployees.filter((emp) => {
    if (!emp.hire_date || !emp.termination_date) return false
    const hireDate = new Date(emp.hire_date)
    const termDate = new Date(emp.termination_date)
    const monthsDiff = (termDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsDiff < 6
  }).length

  const highPerformerTurnover = terminatedEmployees.filter(
    (emp) => emp.performance_rating === "Exceeds" && emp.termination_date?.startsWith("2024"),
  ).length

  const atRiskEmployees = activeEmployees.filter((emp) => {
    if (!emp.hire_date) return false
    const hireDate = new Date(emp.hire_date)
    const monthsEmployed = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    return monthsEmployed > 12 && monthsEmployed < 24 && emp.performance_rating !== "Exceeds"
  }).length

  return {
    "turnover-rate": {
      title: "Turnover Rate",
      description: "2024 employee turnover",
      icon: TrendingDown,
      value: `${turnoverRate}%`,
      change: `${recentTerminations.length} departures`,
      color: Number.parseFloat(turnoverRate) > 10 ? "text-red-600" : "text-orange-600",
    },
    "early-turnover": {
      title: "Early Departures",
      description: "Left within 6 months",
      icon: Clock,
      value: `${earlyTurnover}`,
      change: "Quick exits",
      color: "text-red-600",
    },
    "high-performer-loss": {
      title: "Top Talent Loss",
      description: "High performers who left",
      icon: TrendingDown,
      value: `${highPerformerTurnover}`,
      change: "Exceeds rating departures",
      color: "text-red-600",
    },
    "at-risk": {
      title: "At-Risk Employees",
      description: "Potential flight risks",
      icon: Users,
      value: `${atRiskEmployees}`,
      change: "Need attention",
      color: "text-yellow-600",
    },
  }
}

function calculateRecruitingKPIs(activeEmployees: any[], terminatedEmployees: any[]) {
  const newHires2024 = activeEmployees.filter((emp) => emp.hire_date && emp.hire_date.startsWith("2024"))
  const q1Hires = newHires2024.filter(
    (emp) =>
      emp.hire_date.includes("2024-01") || emp.hire_date.includes("2024-02") || emp.hire_date.includes("2024-03"),
  ).length
  const q2Hires = newHires2024.filter(
    (emp) =>
      emp.hire_date.includes("2024-04") || emp.hire_date.includes("2024-05") || emp.hire_date.includes("2024-06"),
  ).length

  const hiringVelocity = q2Hires > q1Hires ? "Accelerating" : q2Hires < q1Hires ? "Slowing" : "Steady"
  const seniorHires = newHires2024.filter((emp) => emp.role_level === "Senior" || emp.role_level === "Lead").length
  const diverseHires = newHires2024.filter((emp) => emp.gender === "Female" || emp.ethnicity !== "White").length

  return {
    "new-hires": {
      title: "New Hires 2024",
      description: "Total recruitment success",
      icon: TrendingUp,
      value: `${newHires2024.length}`,
      change: "This year",
      color: "text-green-600",
    },
    "hiring-velocity": {
      title: "Hiring Velocity",
      description: "Q2 vs Q1 comparison",
      icon: Clock,
      value: `${q2Hires}`,
      change: `${hiringVelocity} pace`,
      color: hiringVelocity === "Accelerating" ? "text-green-600" : "text-orange-600",
    },
    "senior-hires": {
      title: "Senior Level Hires",
      description: "Leadership additions",
      icon: Users,
      value: `${seniorHires}`,
      change: "Experienced talent",
      color: "text-blue-600",
    },
    "diverse-hires": {
      title: "Diverse Hires",
      description: "Inclusion in recruiting",
      icon: Users,
      value: `${diverseHires}`,
      change: "Diverse talent",
      color: "text-purple-600",
    },
  }
}

function calculateExecutiveKPIs(activeEmployees: any[], terminatedEmployees: any[]) {
  const totalSalary = activeEmployees.reduce((sum, emp) => sum + (Number.parseInt(emp.salary) || 0), 0)
  const avgSalary = Math.round(totalSalary / activeEmployees.length)

  const recentTerminations = terminatedEmployees.filter(
    (emp) => emp.termination_date && emp.termination_date.startsWith("2024"),
  )
  const turnoverRate = (
    (recentTerminations.length / (activeEmployees.length + recentTerminations.length)) *
    100
  ).toFixed(1)

  const highPerformers = activeEmployees.filter((emp) => emp.performance_rating === "Exceeds").length
  const performanceScore = ((highPerformers / activeEmployees.length) * 100).toFixed(1)

  const payrollCost = (totalSalary / 1000000).toFixed(1)

  return {
    "workforce-health": {
      title: "Workforce Health",
      description: "Overall organization score",
      icon: Users,
      value: `${performanceScore}%`,
      change: "High performers",
      color: "text-green-600",
    },
    "turnover-rate": {
      title: "Turnover Rate",
      description: "Annual retention metric",
      icon: TrendingDown,
      value: `${turnoverRate}%`,
      change: "2024 departures",
      color: Number.parseFloat(turnoverRate) > 10 ? "text-red-600" : "text-orange-600",
    },
    "payroll-cost": {
      title: "Payroll Cost",
      description: "Total compensation expense",
      icon: DollarSign,
      value: `$${payrollCost}M`,
      change: "Annual cost",
      color: "text-blue-600",
    },
    "engagement-score": {
      title: "Engagement Score",
      description: "Employee engagement metrics",
      icon: Users,
      value: "7.8/10",
      change: "+0.3 vs last quarter",
      color: "text-purple-600",
    },
  }
}

// Lens-specific default KPI selections
const LENS_DEFAULT_KPIS = {
  census: ["turnover-rate", "engagement-score", "cost-per-hire", "total-headcount"],
  attrition: ["turnover-rate", "engagement-score", "time-to-fill", "total-headcount"],
  recruiting: ["new-hires", "hiring-velocity", "senior-hires", "diverse-hires"],
  executive: ["turnover-rate", "engagement-score", "cost-per-hire", "total-headcount"],
}

// Default KPI configurations (fallback)
const DEFAULT_KPI_CONFIGS = {
  "turnover-rate": {
    title: "Turnover Rate",
    description: "Monthly employee turnover",
    icon: TrendingDown,
    value: "2.3%",
    change: "-0.5% vs last month",
    color: "text-orange-600",
  },
  "engagement-score": {
    title: "Engagement Score",
    description: "Employee engagement metrics",
    icon: Users,
    value: "7.8/10",
    change: "+0.3 vs last quarter",
    color: "text-purple-600",
  },
  "cost-per-hire": {
    title: "Cost Per Hire",
    description: "Total recruiting investment",
    icon: Briefcase,
    value: "$4,200",
    change: "-$300 vs last quarter",
    color: "text-blue-600",
  },
  "time-to-fill": {
    title: "Time to Fill",
    description: "Days to fill open positions",
    icon: Clock,
    value: "28 days",
    change: "-5 days improvement",
    color: "text-blue-600",
  },
  "total-headcount": {
    title: "Total Headcount",
    description: "Active employees",
    icon: Users,
    value: "120",
    change: "Current staff",
    color: "text-indigo-600",
  },
}

export default function Dashboard() {
  const searchParams = useSearchParams()
  const [context, setContext] = useState<{
    persona?: string
    company?: string
    companyData?: any
    challenges?: string[]
  }>({})

  const [isFirstTime, setIsFirstTime] = useState(false)
  const [onboardingData, setOnboardingData] = useState<any>(null)
  const [showWelcomeTour, setShowWelcomeTour] = useState(false)
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([])
  const [urgentTask, setUrgentTask] = useState<any>(null)
  const [chatHeight, setChatHeight] = useState(400)
  const [employeeData, setEmployeeData] = useState<any[]>([])
  const [kpiConfigs, setKpiConfigs] = useState(DEFAULT_KPI_CONFIGS)
  const kpiGridRef = useRef<HTMLDivElement>(null)
  const [showAnalysisSlides, setShowAnalysisSlides] = useState(false)

  // Calculate dynamic chat height based on KPI grid position
  useEffect(() => {
    const calculateChatHeight = () => {
      if (kpiGridRef.current) {
        const kpiGridRect = kpiGridRef.current.getBoundingClientRect()
        const kpiGridBottom = kpiGridRect.bottom
        const windowHeight = window.innerHeight
        const availableHeight = windowHeight - kpiGridBottom - 60 // 60px distance from KPI tiles
        const minHeight = 350
        const maxHeight = 600
        const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight))
        setChatHeight(calculatedHeight)
      }
    }

    calculateChatHeight()
    window.addEventListener("resize", calculateChatHeight)

    // Recalculate when KPIs change
    const timer = setTimeout(calculateChatHeight, 100)

    return () => {
      window.removeEventListener("resize", calculateChatHeight)
      clearTimeout(timer)
    }
  }, [selectedKPIs, isFirstTime, onboardingData, urgentTask])

  // Load and process uploaded data
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hr-houdini-onboarding")
      if (saved) {
        const data = JSON.parse(saved)
        console.log("Onboarding data loaded:", data) // Add logging
        if (data.uploadedFile && data.uploadedFile.processedData) {
          console.log("Employee data found:", data.uploadedFile.processedData.length, "records") // Add logging
          setEmployeeData(data.uploadedFile.processedData)

          // Calculate KPIs from real data
          const calculatedKPIs = calculateKPIsFromData(data.uploadedFile.processedData, context.persona)
          console.log("Calculated KPIs:", calculatedKPIs) // Add logging
          if (calculatedKPIs) {
            setKpiConfigs(calculatedKPIs)
          }
        }
      }
    } catch (error) {
      console.error("Error loading employee data:", error)
    }
  }, [context.persona]) // Add context.persona as dependency

  // --------------------------
  // Initialise context once    ⬇⬇
  // --------------------------
  const pathname = usePathname() // stable string we can depend on
  useEffect(() => {
    // Parse URL params from the current location string instead of using the
    // unstable ReadonlyURLSearchParams object itself.
    const params = new URLSearchParams(window.location.search)

    const persona = params.get("persona") ?? undefined
    const company = params.get("company") ?? undefined
    const challenges = params.get("challenges")?.split(",") ?? undefined

    // Check for onboarding completion
    const onboardingParam = params.get("onboarding")
    const hasFileParam = params.get("hasFile") === "true"

    if (onboardingParam === "completed") {
      setIsFirstTime(true)
      setShowWelcomeTour(true)

      // Load onboarding data from localStorage
      try {
        const saved = localStorage.getItem("hr-houdini-onboarding")
        if (saved) {
          const data = JSON.parse(saved)
          setOnboardingData(data)
        }

        // Load selected KPIs
        const savedKPIs = localStorage.getItem("hr-houdini-selected-kpis")
        if (savedKPIs) {
          setSelectedKPIs(JSON.parse(savedKPIs))
        }

        // Load urgent task
        const savedUrgentTask = localStorage.getItem("hr-houdini-urgent-task")
        if (savedUrgentTask) {
          setUrgentTask(JSON.parse(savedUrgentTask))
        }
      } catch (error) {
        console.error("Error loading onboarding data:", error)
      }
    }

    if (persona || company || challenges) {
      setContext({ persona, company, challenges })
    } else {
      // Fallback to localStorage only once
      try {
        const saved = localStorage.getItem("hr-houdini-context")
        if (saved) {
          const parsed = JSON.parse(saved)
          setContext(parsed)
        }
      } catch (err) {
        console.error("Error loading context from localStorage:", err)
      }
    }
    // `pathname` changes if the user navigates to a different page, making the
    // effect re-run only when the URL truly changes.
  }, [pathname])

  // Fetch company data when company context is available
  useEffect(() => {
    if (context.company) {
      fetch(`/api/demo/companies?name=${encodeURIComponent(context.company)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.company) {
            setContext((prev) => ({ ...prev, companyData: data.company }))
          }
        })
        .catch((error) => console.error("Error fetching company data:", error))
    }
  }, [context.company])

  // Add lens-specific suggested queries
  const LENS_SUGGESTED_QUERIES = {
    census: [
      "Show me our current headcount by department",
      "What's our average salary by role level?",
      "How many new hires did we make this year?",
    ],
    attrition: [
      "Who are the employees at risk of leaving?",
      "Which departments have the highest turnover?",
      "Show me early departure patterns",
    ],
    recruiting: [
      "How is our hiring velocity trending?",
      "What's our diversity in new hires?",
      "Which roles are we hiring for most?",
    ],
    executive: [
      "Give me an executive workforce summary",
      "What's our total payroll cost?",
      "Show me overall organization health",
    ],
  }

  // Get role-specific placeholder and suggestions
  const chatPlaceholder = context.persona
    ? ROLE_CHAT_PLACEHOLDERS[context.persona as keyof typeof ROLE_CHAT_PLACEHOLDERS] ||
      "Ask me anything about your HR data..."
    : "Ask me anything about your HR data..."

  const suggestedQueries = context.persona
    ? isFirstTime && urgentTask
      ? [urgentTask.description, "Show me the data I need for this task", "Walk me through solving this step by step"]
      : employeeData.length > 0
        ? LENS_SUGGESTED_QUERIES[context.persona as keyof typeof LENS_SUGGESTED_QUERIES] ||
          ROLE_SUGGESTED_QUERIES[context.persona as keyof typeof ROLE_SUGGESTED_QUERIES] ||
          []
        : ROLE_SUGGESTED_QUERIES[context.persona as keyof typeof ROLE_SUGGESTED_QUERIES] || []
    : employeeData.length > 0
      ? LENS_SUGGESTED_QUERIES[context.persona as keyof typeof LENS_SUGGESTED_QUERIES] || []
      : []

  // Render KPI tiles based on user selection and data
  const renderKPITiles = () => {
    let kpisToShow: string[]

    if (employeeData.length > 0) {
      // Use lens-specific KPIs when we have real data
      kpisToShow =
        selectedKPIs.length > 0
          ? selectedKPIs
          : LENS_DEFAULT_KPIS[context.persona as keyof typeof LENS_DEFAULT_KPIS] || LENS_DEFAULT_KPIS.census
    } else {
      // Fallback to default KPIs when no data
      kpisToShow =
        selectedKPIs.length > 0
          ? selectedKPIs
          : ["turnover-rate", "engagement-score", "cost-per-hire", "total-headcount"]
    }

    if (!kpisToShow.includes("total-headcount") && kpisToShow.length === 3) {
      kpisToShow = [...kpisToShow, "total-headcount"]
    }

    return kpisToShow.map((kpiId) => {
      const kpi = kpiConfigs[kpiId as keyof typeof kpiConfigs]
      if (!kpi) return null

      const IconComponent = kpi.icon
      return (
        <Card key={kpiId} className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <IconComponent className={`h-6 w-6 ${kpi.color}`} />
              <CardTitle>{kpi.title}</CardTitle>
            </div>
            <CardDescription>{kpi.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              <div className="text-sm font-medium text-gray-700">{kpi.title}</div>
              <div className="text-xs text-gray-500">{kpi.change}</div>
            </div>
          </CardContent>
        </Card>
      )
    })
  }

  const handlePromptClick = (prompt: string) => {
    // This would integrate with the chat interface to send the prompt
    console.log("[v0] Hero tile prompt clicked:", prompt)
    // You can integrate this with your chat interface's message sending function
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        {/* Urgent Task Banner */}
        {isFirstTime && urgentTask && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">Ready to tackle your urgent task</p>
                <p className="text-sm text-blue-700 mt-1">{urgentTask.description}</p>
                <Button onClick={() => setShowAnalysisSlides(true)}>View Analysis Slides</Button>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Success Banner */}
        {isFirstTime && onboardingData?.uploadedFile && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  Data successfully loaded: {onboardingData.uploadedFile.file.name}
                </p>
                <p className="text-sm text-green-700">
                  {employeeData.length} records • Employee data • Ready for analysis
                </p>
              </div>
            </div>
          </div>
        )}

        {employeeData.length > 0 && (
          <div className="mb-8">
            <HeroInsightsTile employeeData={employeeData} onPromptClick={handlePromptClick} />
          </div>
        )}

        {/* Personalized KPI Tiles */}
        <div ref={kpiGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {renderKPITiles()}
        </div>

        {/* Dynamic Chat Interface */}
        <div className="mt-8">
          <div style={{ height: `${chatHeight}px` }}>
            <ChatInterface placeholder={chatPlaceholder} suggestedQueries={suggestedQueries} context={context} />
          </div>

          {/* Disclaimer - Outside the chat interface */}
          <div className="text-center mt-4">
            <button className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer">
              HR Houdini can make mistakes. Please double-check responses.
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Slides Dialog */}
      <Dialog open={showAnalysisSlides} onOpenChange={setShowAnalysisSlides}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Executive Analysis Slides</span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download to PPT
              </Button>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="turnover" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="turnover">Turnover Risk</TabsTrigger>
              <TabsTrigger value="dei">DEI Breakdown</TabsTrigger>
              <TabsTrigger value="recruiting">Recruiting Trends</TabsTrigger>
              <TabsTrigger value="summary">Executive Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="turnover" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Turnover Risk by Department</CardTitle>
                  <CardDescription>
                    Departments with highest attrition risk based on recent departures and tenure patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { department: "Clinical", risk: 85, departures: 3 },
                          { department: "Administrative", risk: 65, departures: 1 },
                          { department: "Support", risk: 45, departures: 1 },
                          { department: "Management", risk: 25, departures: 0 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="risk" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Key Insights:</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Clinical department shows highest risk (85%) with 3 recent departures</li>
                      <li>• Administrative team at moderate risk due to workload increases</li>
                      <li>• Support staff relatively stable but monitor closely</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dei" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>DEI Breakdown by Role and Level</CardTitle>
                  <CardDescription>Diversity representation across organizational levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Gender Distribution</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Female", value: 68, color: "#8b5cf6" },
                                { name: "Male", value: 52, color: "#06b6d4" },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              dataKey="value"
                            >
                              {[
                                { name: "Female", value: 68, color: "#8b5cf6" },
                                { name: "Male", value: 52, color: "#06b6d4" },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Leadership Representation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Senior Level</span>
                          <span>60% Female</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Management</span>
                          <span>45% Female</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Key Insights:</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Strong female representation overall (57%)</li>
                      <li>• Leadership pipeline shows good diversity at senior levels</li>
                      <li>• Opportunity to increase management diversity</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recruiting" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Open Requisition Trends</CardTitle>
                  <CardDescription>Time to fill and hiring manager activity analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { role: "RN", timeToFill: 45, openReqs: 3 },
                          { role: "Medical Assistant", timeToFill: 32, openReqs: 2 },
                          { role: "Admin Coordinator", timeToFill: 28, openReqs: 1 },
                          { role: "Therapist", timeToFill: 52, openReqs: 2 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="role" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="timeToFill" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Top Hiring Managers</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Dr. Sarah Chen</span>
                          <span>4 open reqs</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Mike Rodriguez</span>
                          <span>3 open reqs</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Lisa Park</span>
                          <span>1 open req</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Recruiting Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg. Time to Fill</span>
                          <span>39 days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Open Reqs</span>
                          <span>8 positions</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pipeline Health</span>
                          <span className="text-green-600">Good</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                  <CardDescription>Key workforce insights for leadership presentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">🚨 Immediate Attention</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Clinical department turnover risk (85%)</li>
                          <li>• 5 departures this month vs. 2 last month</li>
                          <li>• RN positions taking 45+ days to fill</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-600 mb-2">✅ Strengths</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Strong DEI representation (57% female)</li>
                          <li>• Management team stability</li>
                          <li>• Healthy recruiting pipeline</li>
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">📊 Key Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Headcount</span>
                            <span className="font-medium">120</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Monthly Turnover</span>
                            <span className="font-medium">4.2%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Open Positions</span>
                            <span className="font-medium">8</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Avg. Time to Fill</span>
                            <span className="font-medium">39 days</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-orange-600 mb-2">🎯 Recommendations</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Conduct clinical team retention interviews</li>
                          <li>• Accelerate RN recruiting efforts</li>
                          <li>• Implement stay interviews for at-risk staff</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Welcome Tour Overlay for First-Time Users */}
      {showWelcomeTour && isFirstTime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>Welcome to your personalized dashboard!</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Your dashboard shows insights from your uploaded data.
                  {urgentTask && " We're ready to help you tackle your urgent task!"}
                </p>

                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900">File Upload Status</p>
                  </div>
                  <p className="text-sm text-green-800 mb-1">
                    The file <span className="font-medium">employee_data_2024.xlsx</span> has been successfully uploaded
                    and is being processed.
                  </p>
                  <p className="text-xs text-green-700">
                    Processing complete • 1,247 employee records analyzed • Ready for insights
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Your data insights:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• KPI tiles show real metrics from your HRIS data</li>
                    <li>• Chat with your data using natural language</li>
                    <li>• Ask about turnover, departments, or specific employees</li>
                    {urgentTask && <li>• Get leadership meeting insights instantly</li>}
                  </ul>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowWelcomeTour(false)}>Got it, let's explore!</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
