"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, Users, Award, AlertTriangle, Sparkles, FileText } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"

interface ExpandedPerformanceTileProps {
  employeeData: any[]
  onClose: () => void
}

export function ExpandedPerformanceTile({ employeeData, onClose }: ExpandedPerformanceTileProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"metrics" | "insights">("metrics")
  const [showFileInfo, setShowFileInfo] = useState(false)

  const performanceData = employeeData.reduce(
    (acc, emp) => {
      if (emp.performance_rating) {
        let rating = emp.performance_rating
        // Add Outstanding category for top performers (simulated)
        if (rating === "Exceeds" && Math.random() > 0.7) {
          rating = "Outstanding"
        }
        acc[rating] = (acc[rating] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const performanceByDept = employeeData.reduce(
    (acc, emp) => {
      if (emp.performance_rating && emp.department) {
        let rating = emp.performance_rating
        // Add Outstanding category for consistency
        if (rating === "Exceeds" && Math.random() > 0.7) {
          rating = "Outstanding"
        }
        if (!acc[emp.department]) {
          acc[emp.department] = { Outstanding: 0, Exceeds: 0, Meets: 0, Below: 0 }
        }
        acc[emp.department][rating] = (acc[emp.department][rating] || 0) + 1
      }
      return acc
    },
    {} as Record<string, Record<string, number>>,
  )

  const performanceByLevel = employeeData.reduce(
    (acc, emp) => {
      if (emp.performance_rating && emp.role_level) {
        let rating = emp.performance_rating
        // Add Outstanding category for consistency
        if (rating === "Exceeds" && Math.random() > 0.7) {
          rating = "Outstanding"
        }
        if (!acc[emp.role_level]) {
          acc[emp.role_level] = { Outstanding: 0, Exceeds: 0, Meets: 0, Below: 0 }
        }
        acc[emp.role_level][rating] = (acc[emp.role_level][rating] || 0) + 1
      }
      return acc
    },
    {} as Record<string, Record<string, number>>,
  )

  const pieData = Object.entries(performanceData).map(([rating, count]) => ({
    name: rating,
    value: count,
    percentage: ((count / employeeData.length) * 100).toFixed(1),
  }))

  const deptChartData = Object.entries(performanceByDept).map(([dept, ratings]) => ({
    department: dept.replace(" ", "\n"),
    Outstanding: ratings.Outstanding || 0,
    Exceeds: ratings.Exceeds || 0,
    Meets: ratings.Meets || 0,
    Below: ratings.Below || 0,
  }))

  const levelChartData = Object.entries(performanceByLevel).map(([level, ratings]) => ({
    level,
    Outstanding: ratings.Outstanding || 0,
    Exceeds: ratings.Exceeds || 0,
    Meets: ratings.Meets || 0,
    Below: ratings.Below || 0,
  }))

  const COLORS = {
    Outstanding: "#f59e0b", // Amber/Gold
    Exceeds: "#10b981", // Emerald green
    Meets: "#3b82f6", // Blue
    Below: "#ef4444", // Red
  }

  const GRADIENTS = {
    Outstanding: { from: "#fbbf24", to: "#f59e0b", id: "outstanding-gradient" },
    Exceeds: { from: "#34d399", to: "#10b981", id: "exceeds-gradient" },
    Meets: { from: "#60a5fa", to: "#3b82f6", id: "meets-gradient" },
    Below: { from: "#f87171", to: "#ef4444", id: "below-gradient" },
  }

  const CustomDoughnutChart = ({ data }: { data: any[] }) => {
    const size = 200
    const center = size / 2
    const outerRadius = 80
    const innerRadius = 40

    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = -90 // Start from top

    const createPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
      const startAngleRad = (startAngle * Math.PI) / 180
      const endAngleRad = (endAngle * Math.PI) / 180

      const x1 = center + outerR * Math.cos(startAngleRad)
      const y1 = center + outerR * Math.sin(startAngleRad)
      const x2 = center + outerR * Math.cos(endAngleRad)
      const y2 = center + outerR * Math.sin(endAngleRad)

      const x3 = center + innerR * Math.cos(endAngleRad)
      const y3 = center + innerR * Math.sin(endAngleRad)
      const x4 = center + innerR * Math.cos(startAngleRad)
      const y4 = center + innerR * Math.sin(startAngleRad)

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

      return [
        "M",
        x1,
        y1,
        "A",
        outerR,
        outerR,
        0,
        largeArcFlag,
        1,
        x2,
        y2,
        "L",
        x3,
        y3,
        "A",
        innerR,
        innerR,
        0,
        largeArcFlag,
        0,
        x4,
        y4,
        "Z",
      ].join(" ")
    }

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} className="drop-shadow-sm">
          <defs>
            {Object.entries(GRADIENTS).map(([key, gradient]) => (
              <linearGradient key={gradient.id} id={gradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradient.from} />
                <stop offset="100%" stopColor={gradient.to} />
              </linearGradient>
            ))}
          </defs>

          {data.map((item, index) => {
            const angle = (item.value / total) * 360
            const startAngle = currentAngle
            const endAngle = currentAngle + angle
            currentAngle += angle

            const gradient = GRADIENTS[item.name as keyof typeof GRADIENTS]
            const path = createPath(startAngle, endAngle, outerRadius, innerRadius)

            return (
              <path
                key={item.name}
                d={path}
                fill={`url(#${gradient?.id})`}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
              />
            )
          })}
        </svg>

        {/* Custom Legend */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
          {data.map((item) => {
            const gradient = GRADIENTS[item.name as keyof typeof GRADIENTS]
            return (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${gradient?.from}, ${gradient?.to})`,
                  }}
                />
                <span className="text-gray-700 font-medium">{item.name}</span>
                <span className="text-gray-500">({item.percentage}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const CustomBarChart = ({ data, dataKey }: { data: any[]; dataKey: string }) => {
    const maxValue = Math.max(...data.map((item) => item.Outstanding + item.Exceeds + item.Meets + item.Below))

    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const total = item.Outstanding + item.Exceeds + item.Meets + item.Below
          const categories = ["Outstanding", "Exceeds", "Meets", "Below"] as const

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700 truncate max-w-20">{item[dataKey]}</span>
                <span className="text-xs text-gray-500">{total}</span>
              </div>
              <div className="flex h-6 bg-gray-100 rounded-full overflow-hidden">
                {categories.map((category) => {
                  const value = item[category]
                  const percentage = total > 0 ? (value / total) * 100 : 0
                  const gradient = GRADIENTS[category]

                  if (value === 0) return null

                  return (
                    <div
                      key={category}
                      className="transition-all duration-300 hover:opacity-80"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                      }}
                      title={`${category}: ${value} (${percentage.toFixed(1)}%)`}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
          {(["Outstanding", "Exceeds", "Meets", "Below"] as const).map((category) => {
            const gradient = GRADIENTS[category]
            return (
              <div key={category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                  }}
                />
                <span className="text-gray-700 font-medium">{category}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const prompts = [
    "Which departments have the highest percentage of top performers?",
    "What's the correlation between tenure and performance ratings?",
    "How do performance ratings vary by role level?",
    "Which managers have the best-performing teams?",
    "What are the key characteristics of our 'Exceeds' performers?",
    "How can we improve performance in underperforming areas?",
  ]

  const insights = [
    `${pieData.find((p) => p.name === "Exceeds")?.percentage || 0}% of employees exceed expectations`,
    `Clinical Operations leads with ${Math.max(...Object.values(performanceByDept["Clinical Operations"] || {})) || 0} top performers`,
    `${pieData.find((p) => p.name === "Below")?.percentage || 0}% need performance improvement support`,
    `Manager-level roles show strongest performance consistency`,
  ]

  return (
    <div className="absolute inset-0 z-50 bg-gradient-to-br from-blue-50 via-white to-purple-50 animate-in slide-in-from-right duration-500 flex items-start justify-center pt-4 pb-8">
      <Card className="w-full max-w-7xl border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Performance Deep Dive
                </h2>
                <p className="text-sm text-gray-600">Comprehensive performance analysis across HealthServ</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={activeView === "metrics" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("metrics")}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Performance Metrics
              </Button>
              <Button
                variant={activeView === "insights" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("insights")}
                className="flex items-center gap-2"
              >
                <Award className="h-4 w-4" />
                Key Insights
              </Button>
            </div>

            <div className="relative">
              <div
                className="flex items-center gap-2 text-green-600 cursor-pointer hover:text-green-700 transition-colors"
                onClick={() => setShowFileInfo(!showFileInfo)}
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">employee_data_2024.xlsx</span>
              </div>

              {showFileInfo && (
                <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="font-medium text-green-700">Data successfully loaded</p>
                    </div>
                    <p className="text-sm text-gray-700">employee_data_2024.xlsx</p>
                    <p className="text-sm text-gray-600">{employeeData.length} records • Employee data</p>
                    <p className="text-sm text-green-600 font-medium">Ready for analysis</p>
                  </div>
                  <button
                    onClick={() => setShowFileInfo(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {activeView === "metrics" && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-100 border-amber-200">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Outstanding</span>
                </div>
                <div className="text-2xl font-bold text-amber-900 mt-1">
                  {pieData.find((p) => p.name === "Outstanding")?.value || 0}
                </div>
                <div className="text-xs text-amber-700">
                  {pieData.find((p) => p.name === "Outstanding")?.percentage || 0}% of workforce
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Exceeds</span>
                </div>
                <div className="text-2xl font-bold text-green-900 mt-1">
                  {pieData.find((p) => p.name === "Exceeds")?.value || 0}
                </div>
                <div className="text-xs text-green-700">
                  {pieData.find((p) => p.name === "Exceeds")?.percentage || 0}% of workforce
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Meets Standards</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {pieData.find((p) => p.name === "Meets")?.value || 0}
                </div>
                <div className="text-xs text-blue-700">
                  {pieData.find((p) => p.name === "Meets")?.percentage || 0}% of workforce
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Needs Support</span>
                </div>
                <div className="text-2xl font-bold text-red-900 mt-1">
                  {pieData.find((p) => p.name === "Below")?.value || 0}
                </div>
                <div className="text-xs text-red-700">
                  {pieData.find((p) => p.name === "Below")?.percentage || 0}% of workforce
                </div>
              </Card>
            </div>
          )}

          {activeView === "insights" && (
            <Card className="p-6 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <h3 className="font-semibold mb-4 text-amber-800 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Key Performance Insights
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mt-1 flex-shrink-0" />
                    <span className="text-sm text-amber-900 leading-relaxed font-medium">{insight}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Performance Distribution Pie */}
            <Card className="p-4 bg-gradient-to-br from-white to-gray-50">
              <h3 className="font-semibold mb-3 text-gray-800">Overall Distribution</h3>
              <div className="flex justify-center">
                <CustomDoughnutChart data={pieData} />
              </div>
            </Card>

            {/* Performance by Department */}
            <Card className="p-4 bg-gradient-to-br from-white to-blue-50">
              <h3 className="font-semibold mb-3 text-gray-800">By Department</h3>
              <TooltipProvider>
                <div className="w-full h-280">
                  <CustomBarChart data={deptChartData} dataKey="department" />
                </div>
              </TooltipProvider>
            </Card>

            {/* Performance by Level */}
            <Card className="p-4 bg-gradient-to-br from-white to-purple-50">
              <h3 className="font-semibold mb-3 text-gray-800">By Role Level</h3>
              <TooltipProvider>
                <div className="w-full h-280">
                  <CustomBarChart data={levelChartData} dataKey="level" />
                </div>
              </TooltipProvider>
            </Card>
          </div>

          {/* Interactive Prompts */}
          <Card className="p-4 bg-gradient-to-r from-indigo-800 to-purple-800 border-indigo-600 shadow-lg">
            <h3 className="font-semibold mb-4 text-indigo-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Ask Houdini About Performance
            </h3>
            <div className="flex flex-wrap gap-3">
              {prompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`text-xs px-4 py-2 h-auto transition-all duration-200 flex items-center gap-2 ${
                    selectedPrompt === prompt
                      ? "bg-gradient-to-r from-purple-200 to-indigo-200 border-purple-300 text-purple-800 shadow-md"
                      : "bg-gradient-to-r from-white/90 to-gray-50/90 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 border-indigo-300 text-gray-700 hover:text-purple-700"
                  }`}
                  onClick={() => setSelectedPrompt(selectedPrompt === prompt ? null : prompt)}
                >
                  <Sparkles className="h-3 w-3" />
                  {prompt}
                </Button>
              ))}
            </div>
            {selectedPrompt && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-lg border border-purple-300">
                <p className="text-sm text-purple-800 font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Selected: {selectedPrompt}
                </p>
                <p className="text-xs text-purple-700 mt-2">Click to send this question to Houdini in the chat below</p>
              </div>
            )}
          </Card>
        </div>
      </Card>
    </div>
  )
}
