import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getTurnoverAnalysis, getWorkforceAnalysis, getLocationAnalysis } from "@/lib/sharp-median-db"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatRequest {
  message: string
  context?: {
    company?: string
    persona?: string
  }
} 

export async function POST(request: NextRequest) {
  try {
    const { message, context }: ChatRequest = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // const response = await processQuery(message.toLowerCase(), context)
    // const response= "Response is awesome"
    // console.log("Response is: ", response)

    const response = await fetch(
      "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/nl-to-athena",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: message,
          user_id: "41ec5a3d-b522-4b86-aae8-6f4cfc658b8d",
          session_id: "7db0da0c-0e88-40ec-a514-7f40919cb305"
          // user_id: localStorage.getItem("user_id"),
          // session_id: localStorage.getItem("session_id")
        }),
      }
    );

    const data = await response.json();
    const queryResponse = await JSON.parse(data.body);

    console.log("queryResponse is", queryResponse)

    return NextResponse.json({
      message: queryResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.log("Error processing chat message:", error)
    return NextResponse.json({ error: "It's Internal server error" }, { status: 500 })
  }
}

async function processQuery(query: string, context?: { company?: string; persona?: string }): Promise<string> {
  try {
    if (
      query.includes("turnover") ||
      query.includes("attrition") ||
      query.includes("leaving") ||
      query.includes("quit")
    ) {
      const analysis = await getTurnoverAnalysis()
      return generateTurnoverResponse(analysis, query)
    }

    if (
      query.includes("workforce") ||
      query.includes("department") ||
      query.includes("employee") ||
      query.includes("headcount")
    ) {
      const analysis = await getWorkforceAnalysis()
      return generateWorkforceResponse(analysis, query)
    }

    if (query.includes("location") || query.includes("office") || query.includes("site") || query.includes("region")) {
      const analysis = await getLocationAnalysis()
      return generateLocationResponse(analysis, query)
    }

    if (query.includes("salary") || query.includes("compensation") || query.includes("pay")) {
      return await generateSalaryResponse(query)
    }

    if (query.includes("performance") || query.includes("rating")) {
      return await generatePerformanceResponse(query)
    }

    if (query.includes("diversity") || query.includes("gender") || query.includes("ethnicity")) {
      return await generateDiversityResponse(query)
    }

    if (query.includes("leadership") || query.includes("recommend") || query.includes("insight")) {
      const turnoverAnalysis = await getTurnoverAnalysis()
      const workforceAnalysis = await getWorkforceAnalysis()
      return generateLeadershipResponse(turnoverAnalysis, workforceAnalysis, query)
    }

    const workforceAnalysis = await getWorkforceAnalysis()
    return `Based on Sharp Median's data with ${workforceAnalysis.totalEmployees} employees, I can help you analyze workforce patterns, turnover trends, department distribution, location performance, compensation, and diversity metrics. What specific aspect would you like to explore?`
  } catch (error) {
    console.error("Error processing query:", error)
    return "I encountered an issue analyzing the Sharp Median data. Please try rephrasing your question or ask about turnover, workforce distribution, locations, or compensation."
  }
}

function generateTurnoverResponse(analysis: any, query: string): string {
  const { totalEmployees, terminatedEmployees, turnoverRate, turnoverByDepartment, terminationReasons } = analysis

  let response = `**Sharp Median Turnover Analysis:**\n\n`
  response += `• **Overall turnover rate: ${turnoverRate}%** (${terminatedEmployees} of ${totalEmployees} employees)\n`
  response += `• This is significantly above the industry average of 15-20%\n\n`

  if (turnoverByDepartment.length > 0) {
    response += `**Departments with highest turnover:**\n`
    turnoverByDepartment.slice(0, 3).forEach((dept, index) => {
      response += `${index + 1}. ${dept.department}: ${dept.rate}% (${dept.terminated}/${dept.total})\n`
    })
    response += `\n`
  }

  if (terminationReasons.length > 0) {
    response += `**Top termination reasons:**\n`
    terminationReasons.slice(0, 3).forEach((reason, index) => {
      response += `${index + 1}. ${reason.reason}: ${reason.count} employees (${reason.percentage}%)\n`
    })
    response += `\n`
  }

  response += `**Key Recommendations:**\n`
  response += `• Conduct exit interviews to understand root causes\n`
  response += `• Focus retention efforts on ${turnoverByDepartment[0]?.department || "high-turnover departments"}\n`
  response += `• Review compensation and benefits packages\n`
  response += `• Implement manager training programs`

  return response
}

function generateWorkforceResponse(analysis: any, query: string): string {
  const { totalEmployees, departmentDistribution, locationDistribution, genderDistribution } = analysis

  let response = `**Sharp Median Workforce Analysis:**\n\n`
  response += `• **Total workforce: ${totalEmployees} employees**\n`
  response += `• Distributed across ${departmentDistribution.length} departments and ${locationDistribution.length} locations\n\n`

  if (departmentDistribution.length > 0) {
    response += `**Largest departments:**\n`
    departmentDistribution.slice(0, 4).forEach((dept, index) => {
      response += `${index + 1}. ${dept.department}: ${dept.count} employees (${dept.percentage}%)\n`
    })
    response += `\n`
  }

  if (genderDistribution.length > 0) {
    response += `**Gender distribution:**\n`
    genderDistribution.forEach((gender) => {
      response += `• ${gender.gender}: ${gender.count} employees (${gender.percentage}%)\n`
    })
    response += `\n`
  }

  response += `**Strategic Insights:**\n`
  response += `• ${departmentDistribution[0]?.department || "Customer Service"} is the largest department with potential for cross-training\n`
  response += `• Consider span of control optimization for large departments\n`
  response += `• Evaluate resource allocation across locations`

  return response
}

function generateLocationResponse(analysis: any, query: string): string {
  const { totalLocations, locationMetrics, regionComparison } = analysis

  let response = `**Sharp Median Location Analysis:**\n\n`
  response += `• **${totalLocations} office locations** across multiple regions\n\n`

  if (locationMetrics.length > 0) {
    response += `**Top locations by headcount:**\n`
    locationMetrics.slice(0, 4).forEach((loc, index) => {
      response += `${index + 1}. ${loc.location} (${loc.region}): ${loc.totalEmployees} employees\n`
      response += `   • Turnover rate: ${loc.turnoverRate}%\n`
      response += `   • Top department: ${loc.topDepartment}\n`
    })
    response += `\n`
  }

  if (regionComparison.length > 0) {
    response += `**Regional comparison:**\n`
    regionComparison.forEach((region) => {
      response += `• ${region.region}: ${region.totalEmployees} employees across ${region.locations} locations\n`
    })
    response += `\n`
  }

  response += `**Optimization Opportunities:**\n`
  response += `• ${locationMetrics[0]?.location || "Gateway"} is the largest location - consider workload distribution\n`
  response += `• Evaluate cost-effectiveness of smaller locations\n`
  response += `• Assess regional performance metrics for expansion planning`

  return response
}

async function generateSalaryResponse(query: string): Promise<string> {
  try {
    const salaryStats = await sql`
      SELECT 
        department,
        AVG(CASE WHEN annual_salary IS NOT NULL THEN annual_salary ELSE hourly_rate * 2080 END) as avg_salary,
        MIN(CASE WHEN annual_salary IS NOT NULL THEN annual_salary ELSE hourly_rate * 2080 END) as min_salary,
        MAX(CASE WHEN annual_salary IS NOT NULL THEN annual_salary ELSE hourly_rate * 2080 END) as max_salary,
        COUNT(*) as employee_count
      FROM sharp_median_employees
      WHERE (annual_salary IS NOT NULL OR hourly_rate IS NOT NULL)
      GROUP BY department
      ORDER BY avg_salary DESC
    `

    let response = `**Sharp Median Compensation Analysis:**\n\n`

    if (salaryStats.length > 0) {
      const overallAvg =
        salaryStats.reduce((sum, dept) => sum + Number.parseFloat(dept.avg_salary) * dept.employee_count, 0) /
        salaryStats.reduce((sum, dept) => sum + dept.employee_count, 0)

      response += `• **Company average salary: $${Math.round(overallAvg).toLocaleString()}**\n\n`
      response += `**Department salary ranges:**\n`

      salaryStats.slice(0, 5).forEach((dept, index) => {
        response += `${index + 1}. ${dept.department}:\n`
        response += `   • Average: $${Math.round(Number.parseFloat(dept.avg_salary)).toLocaleString()}\n`
        response += `   • Range: $${Math.round(Number.parseFloat(dept.min_salary)).toLocaleString()} - $${Math.round(Number.parseFloat(dept.max_salary)).toLocaleString()}\n`
      })
    }

    response += `\n**Compensation Insights:**\n`
    response += `• Review pay equity across departments and roles\n`
    response += `• Consider market rate analysis for competitive positioning\n`
    response += `• Evaluate performance-based compensation structures`

    return response
  } catch (error) {
    return "I encountered an issue analyzing compensation data. Please try asking about specific departments or salary ranges."
  }
}

async function generatePerformanceResponse(query: string): Promise<string> {
  return (
    `**Sharp Median Performance Insights:**\n\n` +
    `Based on the available data, I can help analyze performance patterns, but detailed performance ratings aren't fully captured in the current dataset.\n\n` +
    `**What I can analyze:**\n` +
    `• Tenure vs. termination patterns\n` +
    `• Department-specific retention rates\n` +
    `• Location performance comparisons\n\n` +
    `Would you like me to analyze any of these specific performance indicators?`
  )
}

async function generateDiversityResponse(query: string): Promise<string> {
  try {
    const diversityStats = await sql`
      SELECT 
        gender,
        ethnicity,
        department,
        COUNT(*) as count
      FROM sharp_median_employees
      WHERE gender IS NOT NULL AND ethnicity IS NOT NULL
      GROUP BY gender, ethnicity, department
      ORDER BY count DESC
    `

    const genderStats = await sql`
      SELECT gender, COUNT(*) as count
      FROM sharp_median_employees
      WHERE gender IS NOT NULL
      GROUP BY gender
    `

    const ethnicityStats = await sql`
      SELECT ethnicity, COUNT(*) as count
      FROM sharp_median_employees
      WHERE ethnicity IS NOT NULL
      GROUP BY ethnicity
      ORDER BY count DESC
    `

    let response = `**Sharp Median Diversity Analysis:**\n\n`

    if (genderStats.length > 0) {
      const total = genderStats.reduce((sum, g) => sum + g.count, 0)
      response += `**Gender distribution:**\n`
      genderStats.forEach((gender) => {
        const percentage = Math.round((gender.count / total) * 100)
        response += `• ${gender.gender}: ${gender.count} employees (${percentage}%)\n`
      })
      response += `\n`
    }

    if (ethnicityStats.length > 0) {
      response += `**Ethnicity representation:**\n`
      ethnicityStats.slice(0, 5).forEach((ethnicity, index) => {
        response += `${index + 1}. ${ethnicity.ethnicity}: ${ethnicity.count} employees\n`
      })
      response += `\n`
    }

    response += `**Diversity Recommendations:**\n`
    response += `• Analyze representation across leadership levels\n`
    response += `• Review recruitment and promotion practices\n`
    response += `• Consider diversity and inclusion training programs`

    return response
  } catch (error) {
    return "I encountered an issue analyzing diversity data. Please try asking about specific demographic breakdowns."
  }
}

function generateLeadershipResponse(turnoverAnalysis: any, workforceAnalysis: any, query: string): string {
  const { turnoverRate, terminatedEmployees } = turnoverAnalysis
  const { totalEmployees, departmentDistribution } = workforceAnalysis

  let response = `**Executive Summary for Sharp Median Leadership:**\n\n`
  response += `**🚨 Critical Issues:**\n`
  response += `• **High turnover crisis:** ${turnoverRate}% rate (${terminatedEmployees}/${totalEmployees} employees)\n`
  response += `• Significantly above industry benchmark of 15-20%\n`
  response += `• ${departmentDistribution[0]?.department || "Customer Service"} department most affected\n\n`

  response += `**📊 Key Metrics:**\n`
  response += `• Total workforce: ${totalEmployees} employees\n`
  response += `• ${departmentDistribution.length} active departments\n`
  response += `• Estimated annual turnover cost: $${Math.round(terminatedEmployees * 50000).toLocaleString()}\n\n`

  response += `**🎯 Immediate Action Plan:**\n`
  response += `1. **Conduct urgent exit interviews** - Identify root causes\n`
  response += `2. **Review compensation packages** - Ensure market competitiveness\n`
  response += `3. **Manager training program** - Improve retention skills\n`
  response += `4. **Employee engagement survey** - Measure satisfaction\n`
  response += `5. **Retention bonuses** - For high-risk employees\n\n`

  response += `**💡 Strategic Recommendations:**\n`
  response += `• Implement predictive analytics for at-risk employees\n`
  response += `• Develop career progression pathways\n`
  response += `• Enhance onboarding and mentorship programs\n`
  response += `• Consider flexible work arrangements`

  return response
}
