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
  MapPin,
  UserX,
} from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { HeroInsightsTile } from "@/components/hero-insights-tile"
import { BarChart, Bar, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { MinimalChatInput } from "@/components/minimal-chat-input"
import { DataVisualizationModal } from "@/components/data-visualization-modal"
import { getSharpMedianInsightsAction, getSharpMedianEmployeesAction } from "@/app/actions/sharp-median-actions"

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
            <span className="font-semibold text-green-900">File Successfully Processed</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">File Size:</span>
              <span className="text-gray-600">2.4 MB</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Data Type:</span>
              <span className="text-gray-600">HRIS Export</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Records:</span>
              <span className="text-gray-600">{recordCount.toLocaleString()} analyzed</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Columns:</span>
              <span className="text-gray-600">35 detected</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 mt-2">
            Ready for Analysis
          </Badge>
        </div>
      )}
    </div>
  )
}

export default function UploadOnlyDashboard() {
  const searchParams = useSearchParams()
  const [dashboardConfig, setDashboardConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWelcomeTour, setShowWelcomeTour] = useState(false)
  const [chatHeight, setChatHeight] = useState(400)
  const [employeeData, setEmployeeData] = useState<any[]>([])
  const [sharpMedianInsights, setSharpMedianInsights] = useState<any>(null)
  const kpiGridRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<any>(null)
  const [visualizationModal, setVisualizationModal] = useState<{
    isOpen: boolean
    type: "turnover" | "workforce" | "locations" | null
  }>({
    isOpen: false,
    type: null,
  })

  const designVersion = searchParams.get("design") || "v2"
  const hasFile = searchParams.get("hasFile") === "true"
  const sampleFileParam = searchParams.get("sampleFile") === "true"
  const company = searchParams.get("company")

  const isSampleFile = sampleFileParam || (!hasFile && searchParams.get("onboarding") === "completed")

  console.log("[v0] UploadOnlyDashboard component rendering")
  console.log("[v0] loading state:", loading)
  console.log("[v0] isSampleFile:", isSampleFile)
  console.log("[v0] hasFile:", hasFile)
  console.log("[v0] company:", company)

  const loadEmployeeData = async () => {
    try {
      setLoading(true)

      if (isSampleFile || !hasFile) {
        console.log("[v0] Loading Sharp Median data via server actions")
        try {
          const [insightsResult, employeesResult] = await Promise.all([
            getSharpMedianInsightsAction(),
            getSharpMedianEmployeesAction(),
          ])

          if (!insightsResult.success) {
            throw new Error(`Failed to get insights: ${insightsResult.error}`)
          }

          if (!employeesResult.success) {
            throw new Error(`Failed to get employees: ${employeesResult.error}`)
          }

          setSharpMedianInsights(insightsResult.data)
          setEmployeeData(employeesResult.data)
          console.log("[v0] Sharp Median database insights loaded via server actions:", insightsResult.data)
        } catch (dbError) {
          console.error("[v0] Database error:", dbError)
          throw new Error("Failed to load Sharp Median data from database")
        }
      } else {
        const response = await fetch("/sample-data/HRIS_Export_HealthServ_2024.csv")
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
        console.log("[v0] Loaded user employee data:", data.length, "records")
      }

      setLoading(false)
    } catch (error) {
      console.error("[v0] Error loading employee data:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployeeData()
  }, [isSampleFile, hasFile])

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

  const handleChatSend = (message: string) => {
    console.log("Chat message sent:", message)
  }

  const handleVisualizationClick = (type: "turnover" | "workforce" | "locations") => {
    setVisualizationModal({
      isOpen: true,
      type: type,
    })
  }

  const handlePromptClick = (prompt: string) => {
    console.log("Prompt clicked:", prompt)

    // Use the ref to send the message through the MinimalChatInput component
    if (chatInputRef.current) {
      chatInputRef.current.sendMessage(prompt)
    }
  }

  const fileName = isSampleFile || !hasFile ? "SharpMedian.csv" : "employee_data_2024.xlsx"
  const recordCount = employeeData.length || 1247
  const welcomeMessage = isSampleFile
    ? "Great! I can see you've selected the Sharp Median sample dataset with 1,247 employee records. This is a comprehensive retail company dataset that demonstrates our platform's capabilities. I'm ready to show you the types of insights you'll get with your own data. What would you like to explore first?"
    : "Great! I can see you've successfully uploaded employee_data_2024.xlsx with 1,247 employee records. I'm ready to help you analyze this data and generate insights for your HR initiatives. What would you like to explore first?"

  const suggestedQueries = isSampleFile
    ? [
        "Tell me about Sharp Median's workforce composition",
        "What are the key retention challenges in this sample?",
        "Show me compensation patterns across departments",
        "Which locations have the highest turnover?",
        "What insights can you provide for leadership?",
        "How does this sample demonstrate your capabilities?",
      ]
    : [
        "Show me a breakdown of our 1,247 employees by department",
        "What's our current turnover rate and which departments are most affected?",
        "Analyze salary distribution across different roles and levels",
        "Who are our highest-risk employees for attrition?",
        "Compare our headcount growth over the past quarters",
        "What insights can you provide for our next leadership meeting?",
      ]

      
  if (designVersion === "v2") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Sharp Median sample data...</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl mb-6">
                <div className="px-8 py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 rounded-full p-3">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white">HR Houdini</h1>
                        <p className="text-blue-100">
                          Your AI workforce analyst - Ready to dive deeper into Sharp Median data
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {(!sharpMedianInsights || employeeData.length === 0) && (
                        <div className="flex items-center space-x-2">
                          <span className="text-white/80 text-sm">
                            {employeeData.length > 0 ? `${employeeData.length} records loaded` : "Loading database..."}
                          </span>
                        </div>
                      )}
                      <Badge className="bg-white/20 text-white border-white/30">Analysis Complete</Badge>
                      <div className="bg-white/10 rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2 text-white">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">{fileName}</span>
                          <span className="text-blue-200">•</span>
                          <span className="text-blue-200">{recordCount.toLocaleString()} records</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <h2 className="text-xl font-semibold text-white mb-3">3 Critical Insights Found</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="font-medium text-white">Turnover:</span>
                        <span className="text-blue-100">
                          {sharpMedianInsights ? `${sharpMedianInsights.turnoverRate}%` : "24.3%"} rate
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="font-medium text-white">Departments:</span>
                        <span className="text-blue-100">
                          {sharpMedianInsights ? Object.keys(sharpMedianInsights.departments).length : "8"} active
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="font-medium text-white">Locations:</span>
                        <span className="text-blue-100">
                          {sharpMedianInsights ? Object.keys(sharpMedianInsights.locations).length : "12"} sites
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-white shadow-lg rounded-xl overflow-hidden border-l-4 border-l-red-500 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-red-50 rounded-full p-2">
                        <UserX className="h-5 w-5 text-red-600" />
                      </div>
                      <Badge variant="destructive" className="bg-red-100 text-red-800 text-xs">
                        URGENT
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">High Turnover Rate</h3>
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      {sharpMedianInsights ? `${sharpMedianInsights.turnoverRate}%` : "24.3%"}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      {sharpMedianInsights
                        ? `${sharpMedianInsights.terminatedEmployees} of ${sharpMedianInsights.totalEmployees} employees terminated`
                        : "Significantly higher than industry average"}
                    </p>
                    {sharpMedianInsights && (
                      <div className="mb-3 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sharpMedianInsights.departmentChartData.slice(0, 4)}>
                            <Bar dataKey="terminated" fill="#dc2626" />
                            <Tooltip />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                      onClick={() => handleVisualizationClick("turnover")}
                    >
                      Analyze turnover patterns
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg rounded-xl overflow-hidden border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-blue-50 rounded-full p-2">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        INSIGHT
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Workforce Distribution</h3>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {sharpMedianInsights ? Object.keys(sharpMedianInsights.departments).length : "8"}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      {sharpMedianInsights
                        ? `Customer Service (${sharpMedianInsights.departments["Customer Service"] || 0}) largest dept`
                        : "Departments with uneven distribution"}
                    </p>
                    {sharpMedianInsights && (
                      <div className="mb-3 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sharpMedianInsights.departmentChartData.slice(0, 4)}
                              dataKey="employees"
                              cx="50%"
                              cy="50%"
                              outerRadius={35}
                              fill="#2563eb"
                            >
                              {sharpMedianInsights.departmentChartData.slice(0, 4).map((entry: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"][index]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 text-left bg-transparent"
                      onClick={() => handleVisualizationClick("workforce")}
                    >
                      Explore workforce structure
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg rounded-xl overflow-hidden border-l-4 border-l-green-500 hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-green-50 rounded-full p-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        OPPORTUNITY
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Multi-Location Operations</h3>
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {sharpMedianInsights ? Object.keys(sharpMedianInsights.locations).length : "12"}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      {sharpMedianInsights
                        ? `Gateway (${sharpMedianInsights.locations["Gateway"] || 0}) largest location`
                        : "Locations with varying performance"}
                    </p>
                    {sharpMedianInsights && (
                      <div className="mb-3 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sharpMedianInsights.locationChartData.slice(0, 4)}>
                            <Bar dataKey="employees" fill="#16a34a" />
                            <Tooltip />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200 text-left bg-transparent"
                      onClick={() => handleVisualizationClick("locations")}
                    >
                      Compare locations
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask Questions About Your Data</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      This Sharp Median sample data demonstrates the types of hidden patterns I can find in your actual
                      HR data.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {[
                        "What's driving Sharp Median's high turnover rate?",
                        "Which departments need immediate attention?",
                        "How do different locations compare in performance?",
                        "What would you recommend to Sharp Median's leadership?",
                      ].map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(query)}
                          className="text-sm bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 text-left bg-transparent"
                        >
                          <span className="text-blue-500 mr-2">→</span>
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <MinimalChatInput
          ref={chatInputRef}
          placeholder="Ask me about the Sharp Median sample data..."
          onSend={handleChatSend}
          sessionId="sharp-median-demo" // Add session ID for chat history
        />

        <DataVisualizationModal
          isOpen={visualizationModal.isOpen}
          onClose={() => setVisualizationModal({ isOpen: false, type: null })}
          type={visualizationModal.type}
          data={sharpMedianInsights}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
        {employeeData.length > 0 && (
          <div className="mb-8">
            <HeroInsightsTile employeeData={employeeData} onPromptClick={(prompt) => handlePromptClick(prompt)} />
          </div>
        )}

        <div ref={kpiGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {renderKPITiles()}
        </div>

        <div className="w-full">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Ask Me Anything</h4>
            <p className="text-sm text-gray-600">
              {isSampleFile
                ? "Explore the sample data with natural language questions, or ask about different types of workforce analysis."
                : "Ask me anything about your workforce data, or dive deeper into the insights above."}
            </p>
          </div>
          <ChatInterface
            context={dashboardConfig?.context || {}}
            height={chatHeight}
            placeholder={
              isSampleFile ? "Ask about the Sharp Median sample data..." : "Ask about your uploaded data insights..."
            }
            welcomeMessage={welcomeMessage}
            suggestedQueries={suggestedQueries}
            inputProps={{ "data-chat-input": true }}
          />
        </div>
      </div>

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
                  {isSampleFile
                    ? "You're exploring our platform with sample data from Sharp Median. This demonstrates the insights you'll get with your own data!"
                    : "Your dashboard shows insights from your uploaded data. We're ready to help you tackle your urgent task!"}
                </p>

                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900">
                      {isSampleFile ? "Sample Data Status" : "File Upload Status"}
                    </p>
                  </div>
                  <p className="text-sm text-green-800 mb-1">
                    The file <span className="font-medium">{fileName}</span> has been successfully
                    {isSampleFile ? " loaded" : " uploaded"} and is being processed.
                  </p>
                  <p className="text-xs text-green-700">
                    Processing complete • {recordCount.toLocaleString()} employee records analyzed • Ready for insights
                    {isSampleFile && (
                      <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">SAMPLE</span>
                    )}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    {isSampleFile ? "Sample data insights:" : "Your data insights:"}
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • KPI tiles show {isSampleFile ? "sample" : "real"} metrics from {isSampleFile ? "the" : "your"}{" "}
                      HRIS data
                    </li>
                    <li>• Chat with {isSampleFile ? "the sample" : "your"} data using natural language</li>
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
