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
} from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"
import { HeroInsightsTile } from "@/components/hero-insights-tile"
import { getDashboardConfig, saveDashboardConfig, getDefaultDashboardConfig } from "@/lib/dashboard-config"

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
              <span className="text-gray-600">12 detected</span>
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

export default function DashboardUO1() {
  const searchParams = useSearchParams()
  const [dashboardConfig, setDashboardConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWelcomeTour, setShowWelcomeTour] = useState(false)
  const [chatHeight, setChatHeight] = useState(400)
  const [employeeData, setEmployeeData] = useState<any[]>([])
  const kpiGridRef = useRef<HTMLDivElement>(null)

  const designVersion = searchParams.get("design") || "v1"

  const isSampleFile = false
  const fileName = "HRIS_Export_HealthServ_2024.csv"
  const companyName = "HealthServ"

  const loadEmployeeData = async () => {
    try {
      const response = await fetch("/sample-data/HRIS_Export_HealthServ_2024.csv")
      const csvText = await response.text()

      const lines = csvText.split("\n")
      const headers = lines[0].split(",")

      const data = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
          const values = line.split(",")
          const employee: any = {}
          headers.forEach((header, index) => {
            employee[header.trim()] = values[index]?.trim() || ""
          })
          return employee
        })

      setEmployeeData(data)
      console.log("[v0] Loaded HealthServ employee data:", data.length, "records")
    } catch (error) {
      console.error("[v0] Error loading employee data:", error)
    }
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const persona = searchParams.get("persona") || "hr-generalist"
        const company = searchParams.get("company") || "HealthServ"
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
        const defaultConfig = getDefaultDashboardConfig("upload-only", "hr-generalist", "HealthServ")
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

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        {/* DesignVersionToggle is hidden */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <FileProcessingTooltip fileName={fileName} recordCount={recordCount}>
                <span className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                  {fileName}
                </span>
              </FileProcessingTooltip>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {recordCount.toLocaleString()} records analyzed
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyName} Workforce Intelligence</h1>
            <p className="text-lg text-gray-600">Your AI assistant has analyzed your data and is ready to help</p>
          </div>

          {/* ... existing code for KPI tiles and chat interface ... */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 max-w-6xl mx-auto">
            {dashboardConfig?.kpis &&
              Object.entries(dashboardConfig.kpis)
                .slice(0, 4)
                .map(([kpiId, kpi]: [string, any]) => {
                  const IconComponent =
                    kpi.icon === "Users"
                      ? Users
                      : kpi.icon === "DollarSign"
                        ? DollarSign
                        : kpi.icon === "TrendingUp"
                          ? TrendingUp
                          : kpi.icon === "Briefcase"
                            ? Briefcase
                            : Users

                  return (
                    <Card
                      key={kpiId}
                      className="bg-white shadow-lg rounded-xl overflow-hidden flex-1 min-w-[260px] max-w-[320px]"
                    >
                      <CardContent className="p-6 text-center">
                        <div className="flex items-center justify-center mb-3">
                          <div className="bg-blue-50 rounded-full p-3">
                            <IconComponent className={`h-6 w-6 ${kpi.color}`} />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                        <div className="text-sm font-medium text-gray-700 mb-1">{kpi.title}</div>
                        <div className="text-xs text-gray-500">{kpi.change}</div>
                      </CardContent>
                    </Card>
                  )
                })}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">HR Houdini</h2>
                    <p className="text-blue-100">Your AI workforce analyst</p>
                  </div>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">File Analysis Complete</Badge>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-blue-600 rounded-full p-2 mt-1 flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                      Analysis Complete - Here's What I Found:
                    </h3>

                    {employeeData.length > 0 && (
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200 mb-6">
                        <HeroInsightsTile
                          employeeData={employeeData}
                          onPromptClick={handlePromptClick}
                          compact={true}
                          className="bg-transparent border-0 shadow-none p-0"
                        />
                      </div>
                    )}

                    <p className="text-gray-700 mb-6 leading-relaxed">
                      I've identified key patterns in your workforce data. The insights above highlight critical areas
                      that need your attention. Click any insight or ask me specific questions below to dive deeper into
                      your data.
                    </p>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Suggested Questions:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          "What should I tell leadership about our workforce?",
                          "Which departments need immediate attention?",
                          "Show me our biggest retention risks",
                          "How does our compensation compare to market?",
                          "What are the key trends I should know about?",
                          "Generate a summary for my next board meeting",
                        ].map((query, index) => (
                          <button
                            key={index}
                            onClick={() => handlePromptClick(query)}
                            className="text-sm bg-white border border-blue-200 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-left shadow-sm hover:shadow-md"
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
            </div>

            <div className="p-8">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Continue the Conversation</h4>
                <p className="text-sm text-gray-600">
                  Ask me anything about your workforce data, or dive deeper into the insights above.
                </p>
              </div>
              <ChatInterface
                context={dashboardConfig?.context || {}}
                height={450}
                placeholder="Ask me anything about your workforce data..."
                welcomeMessage=""
                suggestedQueries={[]}
                inputProps={{ "data-chat-input": true }}
                className="border border-gray-200 rounded-xl shadow-sm bg-gray-50"
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
                    Your dashboard shows insights from your uploaded data. We're ready to help you tackle your urgent
                    task!
                  </p>

                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-900">File Upload Status</p>
                    </div>
                    <p className="text-sm text-green-800 mb-1">
                      The file <span className="font-medium">{fileName}</span> has been successfully uploaded and is
                      being processed.
                    </p>
                    <p className="text-xs text-green-700">
                      Processing complete • {(employeeData.length || 1247).toLocaleString()} employee records analyzed •
                      Ready for insights
                    </p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Your data insights:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• KPI tiles show real metrics from your HRIS data</li>
                      <li>• Chat with your data using natural language</li>
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
    "Great! I can see you've successfully uploaded HRIS_Export_HealthServ_2024.csv with 1,247 employee records. I'm ready to help you analyze this data and generate insights for your HR initiatives. What would you like to explore first?"

  const suggestedQueries = [
    "Show me a breakdown of our 1,247 employees by department",
    "What's our current turnover rate and which departments are most affected?",
    "Analyze salary distribution across different roles and levels",
    "Who are our highest-risk employees for attrition?",
    "Compare our headcount growth over the past quarters",
    "What insights can you provide for our next leadership meeting?",
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
            placeholder="Ask about your uploaded data insights..."
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
                  Your dashboard shows insights from your uploaded data. We're ready to help you tackle your urgent
                  task!
                </p>

                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900">File Upload Status</p>
                  </div>
                  <p className="text-sm text-green-800 mb-1">
                    The file <span className="font-medium">{fileName}</span> has been successfully uploaded and is being
                    processed.
                  </p>
                  <p className="text-xs text-green-700">
                    Processing complete • {recordCount.toLocaleString()} employee records analyzed • Ready for insights
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Your data insights:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• KPI tiles show real metrics from your HRIS data</li>
                    <li>• Chat with your data using natural language</li>
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
