"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Sparkles } from "lucide-react"
import { ExpandedPerformanceTile } from "./expanded-performance-tile"

interface HeroInsightsTileProps {
  employeeData: any[]
  onPromptClick: (prompt: string) => void
  compact?: boolean
  className?: string
}

export function HeroInsightsTile({
  employeeData,
  onPromptClick,
  compact = false,
  className = "",
}: HeroInsightsTileProps) {
  const [showExpandedPerformance, setShowExpandedPerformance] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const activeEmployees = employeeData.filter((emp) => emp["Employee Status"] === "Active")
  const terminatedEmployees = employeeData.filter((emp) => emp["Employee Status"] === "Terminated")

  // Department breakdown using Sharp Median schema
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

  // Since Sharp Median doesn't have performance ratings, we'll simulate based on tenure and role
  const performanceData = activeEmployees.reduce((acc: any, emp) => {
    // Simulate performance based on tenure and role level
    const hireDate = new Date(emp["Original Hire Date"])
    const tenure = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    const salary = Number.parseFloat(emp["Annual Salary"]) || Number.parseFloat(emp["Hourly Rate"]) * 2080 || 0

    let rating = "Meets"
    if (tenure > 3 && salary > 60000) rating = "Exceeds"
    if (tenure > 5 && salary > 80000) rating = "Outstanding"
    if (tenure < 1 || salary < 30000) rating = "Below"

    acc[rating] = (acc[rating] || 0) + 1
    return acc
  }, {})

  const perfChartData = Object.entries(performanceData).map(([rating, count]) => ({
    rating,
    count: count as number,
  }))

  const totalHeadcount = activeEmployees.length
  const avgSalary = Math.round(
    activeEmployees
      .filter((emp) => emp["Annual Salary"])
      .reduce((sum, emp) => sum + (Number.parseFloat(emp["Annual Salary"]) || 0), 0) /
      activeEmployees.filter((emp) => emp["Annual Salary"]).length || 1,
  )

  const newHires2024 = activeEmployees.filter(
    (emp) => emp["Original Hire Date"] && emp["Original Hire Date"].includes("2024"),
  ).length

  const turnoverRate = ((terminatedEmployees.length / (totalHeadcount + terminatedEmployees.length)) * 100).toFixed(1)

  const highPerformers = activeEmployees.filter((emp) => {
    const hireDate = new Date(emp["Original Hire Date"])
    const tenure = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    const salary = Number.parseFloat(emp["Annual Salary"]) || Number.parseFloat(emp["Hourly Rate"]) * 2080 || 0
    return tenure > 2 && salary > 55000
  }).length

  const suggestedPrompts = [
    "Analyze Sharp Median's turnover patterns",
    "Compare compensation across departments",
    "Identify retention risks by location",
    "Review workforce diversity metrics",
    "Generate leadership insights",
  ]

  const PERFORMANCE_COLORS = {
    Outstanding: "#F59E0B", // Gold for outstanding
    Exceeds: "#10B981", // Green for exceeds
    Meets: "#3B82F6", // Blue for meets
    Below: "#EF4444", // Red for below
  }

  const DEPARTMENT_COLORS = [
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#F97316", // Orange
    "#84CC16", // Lime
  ]

  const CustomDepartmentChart = () => {
    const maxCount = Math.max(...chartData.slice(0, 5).map((d) => d.count))
    const barWidth = 40
    const barSpacing = 16
    const chartWidth = (barWidth + barSpacing) * 5 - barSpacing
    const chartHeight = 140

    return (
      <div className="w-full h-[180px] flex flex-col">
        <svg
          width="100%"
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="overflow-visible"
        >
          <defs>
            {DEPARTMENT_COLORS.map((color, index) => (
              <linearGradient key={index} id={`deptGrad${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
              </linearGradient>
            ))}
          </defs>
          {chartData.slice(0, 5).map((item, index) => {
            const barHeight = (item.count / maxCount) * (chartHeight - 20)
            const x = index * (barWidth + barSpacing)
            const y = chartHeight - barHeight

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={`url(#deptGrad${index})`}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  rx="3"
                  className="drop-shadow-sm"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="fill-white/80 text-xs font-medium"
                  fontSize="10"
                >
                  {item.count}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="flex justify-between text-xs text-white/80 mt-2 px-2">
          {chartData.slice(0, 5).map((item, index) => (
            <div key={index} className="text-center" style={{ width: `${barWidth}px` }}>
              <div className="leading-tight">
                {item.department.split(" ").map((word, wordIndex) => (
                  <div key={wordIndex} className="truncate">
                    {word}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const CustomPerformanceChart = () => {
    const total = perfChartData.reduce((sum, item) => sum + item.count, 0)
    const radius = 50
    const innerRadius = 30
    const centerX = 60
    const centerY = 60

    let currentAngle = -90 // Start from top

    const createPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
      const startAngleRad = (startAngle * Math.PI) / 180
      const endAngleRad = (endAngle * Math.PI) / 180

      const x1 = centerX + outerR * Math.cos(startAngleRad)
      const y1 = centerY + outerR * Math.sin(startAngleRad)
      const x2 = centerX + outerR * Math.cos(endAngleRad)
      const y2 = centerY + outerR * Math.sin(endAngleRad)

      const x3 = centerX + innerR * Math.cos(endAngleRad)
      const y3 = centerY + innerR * Math.sin(endAngleRad)
      const x4 = centerX + innerR * Math.cos(startAngleRad)
      const y4 = centerY + innerR * Math.sin(startAngleRad)

      const largeArc = endAngle - startAngle > 180 ? 1 : 0

      return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`
    }

    return (
      <svg width="100%" height="100%" viewBox="0 0 120 120" className="overflow-visible">
        <defs>
          <linearGradient id="outstandingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="exceedsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="meetsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="belowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        {perfChartData.map((item, index) => {
          const percentage = (item.count / total) * 100
          const angle = (percentage / 100) * 360
          const endAngle = currentAngle + angle

          const gradientMap: { [key: string]: string } = {
            Outstanding: "url(#outstandingGrad)",
            Exceeds: "url(#exceedsGrad)",
            Meets: "url(#meetsGrad)",
            Below: "url(#belowGrad)",
          }

          const path = createPath(currentAngle, endAngle, radius, innerRadius)
          currentAngle = endAngle

          return (
            <path
              key={index}
              d={path}
              fill={gradientMap[item.rating] || "url(#meetsGrad)"}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
              className="drop-shadow-sm"
            />
          )
        })}
      </svg>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Card
        className={`w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white border-0 shadow-2xl transition-all duration-500 ${showExpandedPerformance ? "transform rotate-y-180 opacity-0" : ""}`}
      >
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Sharp Median Workforce</h2>
                <p className="text-blue-100 text-sm">AI insights • {totalHeadcount} employees</p>
              </div>
            </div>

            <div className="relative">
              <div
                className="cursor-pointer hover:text-blue-200 transition-colors duration-200"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className="text-sm text-white/90 font-medium">SharpMedian.csv</span>
              </div>

              {showTooltip && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-50 border border-gray-700">
                  <div className="font-semibold mb-1">Sharp Median Export Summary</div>
                  <div className="space-y-1 text-gray-300">
                    <div>• {totalHeadcount} active employees</div>
                    <div>• ${avgSalary.toLocaleString()} average salary</div>
                    <div>• {turnoverRate}% turnover rate</div>
                    <div>• {highPerformers} high performers</div>
                    <div>• {Object.keys(departmentData).length} departments tracked</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Department Chart - Custom SVG */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-all duration-200 hover:scale-105">
              <h3 className="text-sm font-semibold mb-2 text-white/90">Department Headcount</h3>
              <CustomDepartmentChart />
            </div>

            {/* Performance Chart - Custom SVG with Click Handler */}
            <div
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-all duration-200 hover:scale-105"
              onClick={() => setShowExpandedPerformance(true)}
            >
              <h3 className="text-sm font-semibold mb-2 text-white/90 flex items-center justify-between">
                Performance Mix
                <span className="text-xs text-white/60">Click to expand</span>
              </h3>
              <div className="h-[180px] flex items-center justify-center">
                <CustomPerformanceChart />
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-all duration-200 hover:scale-105">
              <h3 className="text-sm font-semibold mb-2 text-white/90 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Key Insights
              </h3>
              <div className="space-y-1 text-sm text-white/80">
                <p>
                  • {chartData[0]?.department} leads with {chartData[0]?.count || 0} staff
                </p>
                <p>• {newHires2024} new hires show growth momentum</p>
                <p>• {((highPerformers / totalHeadcount) * 100).toFixed(1)}% are high performers</p>
                <p>• Focus needed on {turnoverRate}% turnover rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 text-white/90">Ask Houdini</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="default"
                  className="text-sm whitespace-nowrap bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white flex-shrink-0"
                  onClick={() => onPromptClick(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {showExpandedPerformance && (
        <ExpandedPerformanceTile employeeData={employeeData} onClose={() => setShowExpandedPerformance(false)} />
      )}
    </div>
  )
}
