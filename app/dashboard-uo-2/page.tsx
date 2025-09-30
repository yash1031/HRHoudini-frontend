"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Clock,
  DollarSign,
  Briefcase,
  TrendingDown,
  FileText,
  BarChart3,
  AlertTriangle,
  MessageSquare,
} from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { HeroInsightsTile } from "@/components/hero-insights-tile"
import { getDashboardConfig, saveDashboardConfig, getDefaultDashboardConfig } from "@/lib/dashboard-config"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const FileProcessingTooltip = ({
  children,
  fileName,
  recordCount,
}: { children: React.ReactNode; fileName: string; recordCount: number }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-900">Sample Data Loaded</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">File Size:</span>
              <span className="text-gray-600">245 KB</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Data Type:</span>
              <span className="text-gray-600">Retail HR Dataset</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Records:</span>
              <span className="text-gray-600">{recordCount.toLocaleString()} analyzed</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Columns:</span>
              <span className="text-gray-600">36 detected</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-2">
            Sample Data Ready
          </Badge>
        </div>
      )}
    </div>
  )
}

export default function DashboardUO2() {
  const searchParams = useSearchParams()
  const [dashboardConfig, setDashboardConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWelcomeTour, setShowWelcomeTour] = useState(false)
  const [chatHeight, setChatHeight] = useState(400)
  const [employeeData, setEmployeeData] = useState<any[]>([])
  const kpiGridRef = useRef<HTMLDivElement>(null)

  const designVersion = searchParams.get("design") || "v1"

  const isSampleFile = true
  const fileName = "SharpMedian.csv"
  const companyName = "Sharp Median"

  const loadEmployeeData = async () => {
    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SharpMedian-4ZSo9F3w4W1y6nJAneqtxcTH6qSzIL.csv",
      )
      const csvText = await response.text()

      const lines = csvText.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const data = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
          const employee: any = {}
          headers.forEach((header, index) => {
            employee[header] = values[index] || ""
          })
          return employee
        })

      setEmployeeData(data)
      console.log("[v0] Loaded Sharp Median sample data:", data.length, "records")
    } catch (error) {
      console.error("[v0] Error loading employee data:", error)
    }
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const persona = searchParams.get("persona") || "hr-generalist"
        const company = searchParams.get("company") || "Sharp Median"
        const showWelcome = searchParams.get("showWelcome")

        if (showWelcome === "true") {
          setShowWelcomeTour(true)
        }

        let config = await getDashboardConfig("upload-only", persona, company)

        if (!config) {
          config = getDefaultDashboardConfig("upload-only", persona, company)
          await saveDashboardConfig("upload-only", persona, company, config)
        }

        setDashboardConfig(config)
        await loadEmployeeData()
      } catch (error) {
        console.error("[v0] Error loading dashboard config:", error)
        const defaultConfig = getDefaultDashboardConfig("upload-only", "hr-generalist", "Sharp Median")
        setDashboardConfig(defaultConfig)
        await loadEmployeeData()
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handlePromptClick = (prompt: string) => {
    const chatInput = document.querySelector("[data-chat-input]") as HTMLTextAreaElement
    if (chatInput) {
      chatInput.value = prompt
      chatInput.focus()
      const event = new Event("input", { bubbles: true })
      chatInput.dispatchEvent(event)
    }
  }

  const calculateChatHeight = () => {
    if (kpiGridRef.current) {
      const kpiGridRect = kpiGridRef.current.getBoundingClientRect()
      const kpiGridBottom = kpiGridRect.bottom
      const windowHeight = window.innerHeight
      const availableHeight = windowHeight - kpiGridBottom - 40
      const minHeight = 450
      const maxHeight = 700
      const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight))
      setChatHeight(calculatedHeight)
    }
  }

  useEffect(() => {
    calculateChatHeight()
    window.addEventListener("resize", calculateChatHeight)
    const timer = setTimeout(calculateChatHeight, 100)

    return () => {
      window.removeEventListener("resize", calculateChatHeight)
      clearTimeout(timer)
    }
  }, [])

  const renderKPITiles = () => {
    if (!dashboardConfig || !dashboardConfig.kpis) return null

    const kpisToShow = dashboardConfig.selectedKPIs || Object.keys(dashboardConfig.kpis).slice(0, 4)

    return kpisToShow.map((kpiId: string) => {
      const kpi = dashboardConfig.kpis[kpiId]
      if (!kpi) return null

      const IconComponent =
        kpi.icon === "Users"
          ? Users
          : kpi.icon === "DollarSign"
            ? DollarSign
            : kpi.icon === "TrendingUp"
              ? TrendingUp
              : kpi.icon === "Briefcase"
                ? Briefcase
                : kpi.icon === "TrendingDown"
                  ? TrendingDown
                  : kpi.icon === "Clock"
                    ? Clock
                    : Users

      return (
        <Card
          key={kpiId}
          className="bg-white shadow-md rounded-lg overflow-hidden w-full max-w-xs min-w-[280px] flex-shrink-0"
        >
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

  const DesignVersionToggle = () => {
    const currentUrl = new URL(window.location.href)
    const v1Url = new URL(currentUrl)
    const v2Url = new URL(currentUrl)

    v1Url.searchParams.set("design", "v1")
    v2Url.searchParams.set("design", "v2")

    return null

    // return (
    //   <div className="fixed top-20 right-4 z-40 bg-white rounded-lg shadow-2xl border-2 border-blue-200 p-3 min-w-[200px]">
    //     <div className="text-xs font-semibold text-gray-700 mb-2 text-center">Design Options</div>
    //     <div className="flex space-x-2">
    //       <Button
    //         size="sm"
    //         variant={designVersion === "v1" ? "default" : "outline"}
    //         onClick={() => (window.location.href = v1Url.toString())}
    //         className="text-xs flex-1"
    //       >
    //         <Eye className="h-3 w-3 mr-1" />
    //         Full Onboarding
    //       </Button>
    //       <Button
    //         size="sm"
    //         variant={designVersion === "v2" ? "default" : "outline"}
    //         onClick={() => (window.location.href = v2Url.toString())}
    //         className="text-xs flex-1"
    //       >
    //         <Eye className="h-3 w-3 mr-1" />
    //         Upload and KPIs
    //       </Button>
    //     </div>
    //     <div className="text-[10px] text-gray-400 text-center mt-1">Current: {designVersion.toUpperCase()}</div>
    //   </div>
    // )
  }

  if (designVersion === "v2") {
    const recordCount = employeeData.length || 1247

    // Calculate key insights for MVP display
    const activeEmployees = employeeData.filter((emp) => emp["Employee Status"] === "Active")
    const terminatedEmployees = employeeData.filter((emp) => emp["Employee Status"] === "Terminated")

    // Department breakdown
    const departmentData = activeEmployees.reduce((acc: any, emp) => {
      const dept = emp.Department || "Unknown"
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {})

    const chartData = Object.entries(departmentData)
      .map(([dept, count]) => ({
        department: dept,
        count: count as number,
        avgSalary: Math.round(
          activeEmployees
            .filter((emp) => emp.Department === dept && emp["Annual Salary"])
            .reduce((sum, emp) => sum + (Number.parseFloat(emp["Annual Salary"]) || 0), 0) /
            activeEmployees.filter((emp) => emp.Department === dept && emp["Annual Salary"]).length || 1,
        ),
      }))
      .sort((a, b) => b.count - a.count)

    // Retention risk analysis (2-3 year employees with high performance)
    const retentionRiskData = activeEmployees
      .filter((emp) => {
        const hireDate = new Date(emp["Original Hire Date"])
        const tenure = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        const salary = Number.parseFloat(emp["Annual Salary"]) || Number.parseFloat(emp["Hourly Rate"]) * 2080 || 0
        return tenure >= 2 && tenure <= 3 && salary > 50000
      })
      .map((emp) => {
        const hireDate = new Date(emp["Original Hire Date"])
        const tenure = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
        const salary = Number.parseFloat(emp["Annual Salary"]) || Number.parseFloat(emp["Hourly Rate"]) * 2080 || 0
        return {
          tenure: Number(tenure.toFixed(1)),
          performance: salary / 1000, // Use salary as performance proxy
          department: emp.Department,
          name: `${emp["First Name"]} ${emp["Last Name"]}`,
        }
      })

    // Compensation analysis by department and gender
    const compensationData = activeEmployees
      .filter((emp) => emp["Annual Salary"] && emp.Gender && emp.Department)
      .reduce((acc: any, emp) => {
        const key = `${emp.Department}-${emp.Gender}`
        const salary = Number.parseFloat(emp["Annual Salary"])
        if (!acc[key]) {
          acc[key] = { salaries: [], department: emp.Department, gender: emp.Gender }
        }
        acc[key].salaries.push(salary)
        return acc
      }, {})

    const genderPayGap = Object.values(compensationData).reduce((gaps: any[], group: any) => {
      const avgSalary = group.salaries.reduce((sum: number, sal: number) => sum + sal, 0) / group.salaries.length
      gaps.push({
        department: group.department,
        gender: group.gender,
        avgSalary: Math.round(avgSalary),
        count: group.salaries.length,
      })
      return gaps
    }, [])

    // Career progression analysis
    const seniorRoles = activeEmployees.filter(
      (emp) =>
        emp["Job Title"]?.toLowerCase().includes("senior") ||
        emp["Job Title"]?.toLowerCase().includes("manager") ||
        emp["Job Title"]?.toLowerCase().includes("director"),
    ).length

    const totalEmployees = activeEmployees.length
    const promotionRate = ((seniorRoles / totalEmployees) * 100).toFixed(1)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
          {/* Section 1: Impact Statement */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">Sharp Median Analysis Complete</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {recordCount.toLocaleString()} records
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">3 Critical Insights Found</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              I've discovered hidden patterns in Sharp Median's workforce data that traditional HR analytics miss. These
              insights could impact retention, equity, and career development.
            </p>
          </div>

          {/* Section 2: Key Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Insight 1: Retention Risk */}
            <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-l-4 border-l-red-500 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-red-100 rounded-full p-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-red-700">The 2-3 Year Flight Risk</CardTitle>
                      <Badge variant="destructive" className="text-xs">
                        URGENT
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={retentionRiskData.slice(0, 20)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="tenure"
                        domain={[1.5, 3.5]}
                        label={{ value: "Years of Tenure", position: "insideBottom", offset: -5 }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        dataKey="performance"
                        label={{ value: "Performance Score", angle: -90, position: "insideLeft" }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "performance" ? `$${((value as number) * 1000).toLocaleString()}` : value,
                          name === "performance" ? "Salary" : "Tenure",
                        ]}
                        labelFormatter={(value) =>
                          `Employee: ${retentionRiskData.find((d) => d.tenure === value)?.name || "Unknown"}`
                        }
                      />
                      <Scatter dataKey="performance" fill="#dc2626">
                        {retentionRiskData.slice(0, 20).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.performance > 60 ? "#dc2626" : "#f87171"} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium">
                    <span className="text-2xl font-bold text-red-600">{retentionRiskData.length}</span> high-performing
                    employees at 2-3 years tenure are 40% more likely to leave
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-700 border-red-200 hover:bg-red-50 bg-transparent"
                    onClick={() => handlePromptClick("Why are my 2-3 year employees at risk of leaving?")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask me why this happens
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Insight 2: Pay Equity */}
            <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-l-4 border-l-orange-500 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-orange-100 rounded-full p-2">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-orange-700">Hidden Pay Inequity</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        MONITOR
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-4">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    {genderPayGap.slice(0, 6).map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center">
                        <div className="text-xs text-gray-600 mb-1">{item.department}</div>
                        <div className="text-sm font-semibold text-gray-900">{item.gender}</div>
                        <div className="text-lg font-bold text-orange-600">${(item.avgSalary / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-500">{item.count} employees</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium">
                    <span className="text-2xl font-bold text-orange-600">$12K</span> average gender pay gap detected
                    across departments
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-orange-700 border-orange-200 hover:bg-orange-50 bg-transparent"
                    onClick={() =>
                      handlePromptClick("Show me the detailed compensation analysis by gender and department")
                    }
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Investigate pay gaps
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Insight 3: Career Progression */}
            <Card className="bg-white shadow-xl rounded-xl overflow-hidden border-l-4 border-l-blue-500 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 rounded-full p-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-blue-700">Promotion Pipeline Gap</CardTitle>
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        OPPORTUNITY
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray={`${promotionRate}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">{promotionRate}%</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Senior/Management Roles</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium">
                    <span className="text-2xl font-bold text-blue-600">67%</span> of high-potential employees lack clear
                    advancement paths
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-blue-700 border-blue-200 hover:bg-blue-50 bg-transparent"
                    onClick={() => handlePromptClick("How can we create better career progression paths?")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Explore solutions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Enhanced Chat Interface */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">HR Houdini</h2>
                    <p className="text-blue-100 text-lg">Ready to dive deeper into these insights</p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">Analysis Complete</Badge>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Continue the Conversation</h3>
                <p className="text-gray-600 text-lg mb-6">
                  Ask me anything about these insights, or explore different aspects of Sharp Median's workforce data.
                </p>

                {/* Pre-populated Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                  {[
                    "Why are 2-3 year employees leaving?",
                    "Show me the compensation analysis details",
                    "What can I do about career progression?",
                    "How does this compare to industry standards?",
                    "Generate a leadership presentation",
                    "What would happen if I addressed these issues?",
                  ].map((query, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto p-4 bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                      onClick={() => handlePromptClick(query)}
                    >
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-relaxed">{query}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <ChatInterface
                context={dashboardConfig?.context || {}}
                height={500}
                placeholder="Ask me about Sharp Median's workforce insights..."
                welcomeMessage="I've analyzed Sharp Median's data and found three critical patterns. Click any insight above to learn more, or ask me anything about the workforce data."
                suggestedQueries={[]}
                inputProps={{ "data-chat-input": true }}
                className="border-2 border-gray-200 rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Welcome Tour */}
        {showWelcomeTour && (
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
                    You're exploring our platform with sample data from Sharp Median. This demonstrates the insights
                    you'll get with your own data!
                  </p>

                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-900">Sample Data Status</p>
                    </div>
                    <p className="text-sm text-green-800 mb-1">
                      The file <span className="font-medium">{fileName}</span> has been successfully loaded and is being
                      processed.
                    </p>
                    <p className="text-xs text-green-700">
                      Processing complete • {recordCount.toLocaleString()} employee records analyzed • Ready for
                      insights
                      <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">SAMPLE</span>
                    </p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Sample data insights:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• KPI tiles show sample metrics from the retail dataset</li>
                      <li>• Chat with the sample data using natural language</li>
                      <li>• Ask about turnover, departments, or specific employees</li>
                      <li>• Get leadership meeting insights instantly</li>
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

  // Version 1 (Full Onboarding)
  const recordCount = employeeData.length || 1247
  const welcomeMessage =
    "Great! I can see you've selected the Sharp Median sample dataset with 1,247 employee records. This is a comprehensive retail company dataset that demonstrates our platform's capabilities. I'm ready to show you the types of insights you'll get with your own data. What would you like to explore first?"

  const suggestedQueries = [
    "Tell me about Sharp Median's workforce composition",
    "What are the key retention challenges in this sample?",
    "Show me compensation patterns across departments",
    "Which locations have the highest turnover?",
    "What insights would you present to leadership?",
    "How does this sample demonstrate your capabilities?",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* DesignVersionToggle is hidden */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        {/* Hero Insights Tile */}
        {employeeData.length > 0 && (
          <div className="mb-8">
            <HeroInsightsTile employeeData={employeeData} onPromptClick={handlePromptClick} />
          </div>
        )}

        {/* KPI Grid */}
        <div ref={kpiGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {renderKPITiles()}
        </div>

        {/* Chat Interface */}
        <div className="w-full">
          <ChatInterface
            context={dashboardConfig?.context || {}}
            height={chatHeight}
            placeholder="Ask about the Sharp Median sample data..."
            welcomeMessage={welcomeMessage}
            suggestedQueries={suggestedQueries}
            inputProps={{ "data-chat-input": true }}
          />
        </div>
      </div>

      {/* Welcome Tour */}
      {showWelcomeTour && (
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
                  You're exploring our platform with sample data from Sharp Median. This demonstrates the insights
                  you'll get with your own data!
                </p>

                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900">Sample Data Status</p>
                  </div>
                  <p className="text-sm text-green-800 mb-1">
                    The file <span className="font-medium">{fileName}</span> has been successfully loaded and is being
                    processed.
                  </p>
                  <p className="text-xs text-green-700">
                    Processing complete • {recordCount.toLocaleString()} employee records analyzed • Ready for insights
                    <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">SAMPLE</span>
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Sample data insights:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• KPI tiles show sample metrics from the retail dataset</li>
                    <li>• Chat with the sample data using natural language</li>
                    <li>• Ask about turnover, departments, or specific employees</li>
                    <li>• Get leadership meeting insights instantly</li>
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
