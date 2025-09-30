import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

// TypeScript interfaces for KPI response types
interface KPI {
  label: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "stable"
  description?: string
}

interface KPIResponse {
  kpis: KPI[]
  lens: string
  time_period: string
  company_id: number
  generated_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company_id = searchParams.get("company_id")
    const lens = searchParams.get("lens") || "census"
    const time_period = searchParams.get("time_period") || "last_year"

    // Validation
    if (!company_id) {
      return NextResponse.json({ error: "company_id is required" }, { status: 400 })
    }

    const validLenses = ["census", "attrition", "recruiting", "executive"]
    if (!validLenses.includes(lens)) {
      return NextResponse.json(
        { error: "Invalid lens. Must be one of: census, attrition, recruiting, executive" },
        { status: 400 },
      )
    }

    // Calculate date ranges for comparison
    const getDateRanges = (period: string) => {
      const now = new Date()
      let currentStart: Date, previousStart: Date, previousEnd: Date

      switch (period) {
        case "last_week":
          currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          previousEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "last_month":
          currentStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          previousStart = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())
          previousEnd = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        case "last_quarter":
          currentStart = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          previousStart = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
          previousEnd = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          break
        case "last_year":
        default:
          currentStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          previousStart = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
          previousEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          break
      }

      return {
        currentStart: currentStart.toISOString().split("T")[0],
        previousStart: previousStart.toISOString().split("T")[0],
        previousEnd: previousEnd.toISOString().split("T")[0],
      }
    }

    const { currentStart, previousStart, previousEnd } = getDateRanges(time_period)
    let kpis: KPI[] = []

    switch (lens) {
      case "census":
        // Total Headcount
        const totalHeadcount = await sql(
          `
          SELECT COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 AND employment_status = 'active'
        `,
          [company_id],
        )

        // Department Breakdown
        const deptBreakdown = await sql(
          `
          SELECT department, COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 AND employment_status = 'active'
          GROUP BY department 
          ORDER BY count DESC
        `,
          [company_id],
        )

        // Average Tenure
        const avgTenure = await sql(
          `
          SELECT AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date::date))) as avg_years
          FROM employees 
          WHERE company_id = $1 AND employment_status = 'active'
        `,
          [company_id],
        )

        // Gender Distribution
        const genderDist = await sql(
          `
          SELECT gender, COUNT(*) as count,
                 ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
          FROM employees 
          WHERE company_id = $1 AND employment_status = 'active'
          GROUP BY gender
        `,
          [company_id],
        )

        kpis = [
          {
            label: "Total Headcount",
            value: totalHeadcount[0]?.count || 0,
            description: "Active employees",
          },
          {
            label: "Largest Department",
            value: deptBreakdown[0]?.department || "N/A",
            description: `${deptBreakdown[0]?.count || 0} employees`,
          },
          {
            label: "Average Tenure",
            value: `${Math.round(avgTenure[0]?.avg_years || 0)} years`,
            description: "Company-wide average",
          },
          {
            label: "Gender Split",
            value: `${genderDist.find((g) => g.gender === "Female")?.percentage || 0}% F / ${genderDist.find((g) => g.gender === "Male")?.percentage || 0}% M`,
            description: "Female / Male ratio",
          },
        ]
        break

      case "attrition":
        // Attrition Rate
        const currentTerminations = await sql(
          `
          SELECT COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 
          AND termination_date >= $2 
          AND termination_date <= CURRENT_DATE
        `,
          [company_id, currentStart],
        )

        const previousTerminations = await sql(
          `
          SELECT COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 
          AND termination_date >= $2 
          AND termination_date < $3
        `,
          [company_id, previousStart, previousEnd],
        )

        const avgHeadcount = await sql(
          `
          SELECT COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1
        `,
          [company_id],
        )

        const attritionRate =
          avgHeadcount[0]?.count > 0
            ? (((currentTerminations[0]?.count || 0) / avgHeadcount[0].count) * 100).toFixed(1)
            : "0.0"

        // High Risk Employees (low performance + recent hires)
        const highRisk = await sql(
          `
          SELECT COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 
          AND employment_status = 'active'
          AND (
            performance_rating::float < 3.5 
            OR hire_date >= $2
          )
        `,
          [company_id, currentStart],
        )

        // Top Departure Department
        const topDeptTerms = await sql(
          `
          SELECT department, COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 
          AND termination_date >= $2
          GROUP BY department 
          ORDER BY count DESC 
          LIMIT 1
        `,
          [company_id, currentStart],
        )

        kpis = [
          {
            label: "Attrition Rate",
            value: `${attritionRate}%`,
            change:
              previousTerminations[0]?.count > 0
                ? `${((currentTerminations[0]?.count || 0) - previousTerminations[0].count) > 0 ? "+" : ""}${(currentTerminations[0]?.count || 0) - previousTerminations[0].count}`
                : "N/A",
            trend: (currentTerminations[0]?.count || 0) > (previousTerminations[0]?.count || 0) ? "up" : "down",
          },
          {
            label: "Recent Departures",
            value: currentTerminations[0]?.count || 0,
            description: `In ${time_period.replace("_", " ")}`,
          },
          {
            label: "High Risk Employees",
            value: highRisk[0]?.count || 0,
            description: "Low performance or new hires",
          },
          {
            label: "Top Departure Dept",
            value: topDeptTerms[0]?.department || "None",
            description: `${topDeptTerms[0]?.count || 0} departures`,
          },
        ]
        break

      case "recruiting":
        // New Hires
        const newHires = await sql(
          `
          SELECT COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 
          AND hire_date >= $2
        `,
          [company_id, currentStart],
        )

        const previousHires = await sql(
          `
          SELECT COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 
          AND hire_date >= $2 
          AND hire_date < $3
        `,
          [company_id, previousStart, previousEnd],
        )

        // Time to Fill (simulated - average days between posting and hire)
        const avgTimeToFill = await sql(
          `
          SELECT AVG(EXTRACT(DAY FROM hire_date::date - (hire_date::date - INTERVAL '30 days'))) as avg_days
          FROM employees 
          WHERE company_id = $1 
          AND hire_date >= $2
        `,
          [company_id, currentStart],
        )

        // Top Hiring Department
        const topHiringDept = await sql(
          `
          SELECT department, COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 
          AND hire_date >= $2
          GROUP BY department 
          ORDER BY count DESC 
          LIMIT 1
        `,
          [company_id, currentStart],
        )

        // Hiring Velocity
        const hiringVelocity =
          previousHires[0]?.count > 0
            ? ((((newHires[0]?.count || 0) - previousHires[0].count) / previousHires[0].count) * 100).toFixed(1)
            : "0.0"

        kpis = [
          {
            label: "New Hires",
            value: newHires[0]?.count || 0,
            change: `${((newHires[0]?.count || 0) - (previousHires[0]?.count || 0)) >= 0 ? "+" : ""}${(newHires[0]?.count || 0) - (previousHires[0]?.count || 0)}`,
            trend: (newHires[0]?.count || 0) > (previousHires[0]?.count || 0) ? "up" : "down",
          },
          {
            label: "Avg Time to Fill",
            value: `${Math.round(avgTimeToFill[0]?.avg_days || 30)} days`,
            description: "Estimated average",
          },
          {
            label: "Top Hiring Dept",
            value: topHiringDept[0]?.department || "None",
            description: `${topHiringDept[0]?.count || 0} new hires`,
          },
          {
            label: "Hiring Velocity",
            value: `${hiringVelocity}%`,
            description: "Change vs previous period",
            trend:
              Number.parseFloat(hiringVelocity) > 0 ? "up" : Number.parseFloat(hiringVelocity) < 0 ? "down" : "stable",
          },
        ]
        break

      case "executive":
        // Leadership Headcount
        const leadershipCount = await sql(
          `
          SELECT COUNT(*) as count 
          FROM employees 
          WHERE company_id = $1 
          AND employment_status = 'active'
          AND (
            role_level IN ('Executive', 'Manager', 'Director') 
            OR job_title ILIKE '%manager%' 
            OR job_title ILIKE '%director%' 
            OR job_title ILIKE '%chief%'
          )
        `,
          [company_id],
        )

        // Span of Control
        const spanOfControl = await sql(
          `
          SELECT AVG(direct_reports) as avg_span
          FROM (
            SELECT manager_id, COUNT(*) as direct_reports
            FROM employees 
            WHERE company_id = $1 
            AND employment_status = 'active'
            AND manager_id IS NOT NULL
            GROUP BY manager_id
          ) spans
        `,
          [company_id],
        )

        // Leadership Performance
        const leadershipPerf = await sql(
          `
          SELECT AVG(performance_rating::float) as avg_rating
          FROM employees 
          WHERE company_id = $1 
          AND employment_status = 'active'
          AND (
            role_level IN ('Executive', 'Manager', 'Director') 
            OR job_title ILIKE '%manager%' 
            OR job_title ILIKE '%director%' 
            OR job_title ILIKE '%chief%'
          )
        `,
          [company_id],
        )

        // Leadership Diversity
        const leadershipDiversity = await sql(
          `
          SELECT 
            COUNT(CASE WHEN gender = 'Female' THEN 1 END) * 100.0 / COUNT(*) as female_percentage
          FROM employees 
          WHERE company_id = $1 
          AND employment_status = 'active'
          AND (
            role_level IN ('Executive', 'Manager', 'Director') 
            OR job_title ILIKE '%manager%' 
            OR job_title ILIKE '%director%' 
            OR job_title ILIKE '%chief%'
          )
        `,
          [company_id],
        )

        kpis = [
          {
            label: "Leadership Team",
            value: leadershipCount[0]?.count || 0,
            description: "Managers, Directors, Executives",
          },
          {
            label: "Avg Span of Control",
            value: Math.round(spanOfControl[0]?.avg_span || 0),
            description: "Direct reports per manager",
          },
          {
            label: "Leadership Performance",
            value: (leadershipPerf[0]?.avg_rating || 0).toFixed(1),
            description: "Average rating out of 5.0",
          },
          {
            label: "Female Leadership",
            value: `${Math.round(leadershipDiversity[0]?.female_percentage || 0)}%`,
            description: "Women in leadership roles",
          },
        ]
        break

      default:
        kpis = []
    }

    const response: KPIResponse = {
      kpis,
      lens,
      time_period,
      company_id: Number.parseInt(company_id),
      generated_at: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error calculating KPIs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
