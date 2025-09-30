import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

// TypeScript interfaces for response types
interface Employee {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  job_title: string
  role_level: string
  hire_date: string
  termination_date: string | null
  employment_status: string
  salary: number
  manager_id: number | null
  location: string
  employment_type: string
  age_group: string
  gender: string
  ethnicity: string
  performance_rating: string
}

interface EmployeeResponse {
  employees: Employee[]
  total_count: number
  lens: string
  time_period: string
  company_id: number
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

    const validTimePeriods = ["last_week", "last_month", "last_quarter", "last_year"]
    if (!validTimePeriods.includes(time_period)) {
      return NextResponse.json(
        { error: "Invalid time_period. Must be one of: last_week, last_month, last_quarter, last_year" },
        { status: 400 },
      )
    }

    // Calculate date range based on time_period
    const getDateFilter = (period: string) => {
      const now = new Date()
      switch (period) {
        case "last_week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return weekAgo.toISOString().split("T")[0]
        case "last_month":
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          return monthAgo.toISOString().split("T")[0]
        case "last_quarter":
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          return quarterAgo.toISOString().split("T")[0]
        case "last_year":
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          return yearAgo.toISOString().split("T")[0]
        default:
          return "1900-01-01"
      }
    }

    const dateFilter = getDateFilter(time_period)

    // Build lens-specific queries
    let query = ""
    const queryParams: any[] = [company_id]

    switch (lens) {
      case "census":
        query = `
          SELECT * FROM employees 
          WHERE company_id = $1 
          AND employment_status = 'active'
          ORDER BY department, job_title, last_name
        `
        break

      case "attrition":
        query = `
          SELECT * FROM employees 
          WHERE company_id = $1 
          AND (
            employment_status = 'terminated' 
            OR (termination_date IS NOT NULL AND termination_date >= $2)
            OR (employment_status = 'active' AND hire_date <= $2)
          )
          ORDER BY termination_date DESC NULLS LAST, hire_date DESC
        `
        queryParams.push(dateFilter)
        break

      case "recruiting":
        query = `
          SELECT * FROM employees 
          WHERE company_id = $1 
          AND hire_date >= $2
          ORDER BY hire_date DESC, department
        `
        queryParams.push(dateFilter)
        break

      case "executive":
        query = `
          SELECT * FROM employees 
          WHERE company_id = $1 
          AND (
            role_level IN ('Executive', 'Manager', 'Director') 
            OR job_title ILIKE '%manager%' 
            OR job_title ILIKE '%director%' 
            OR job_title ILIKE '%chief%'
          )
          AND employment_status = 'active'
          ORDER BY 
            CASE 
              WHEN role_level = 'Executive' THEN 1
              WHEN role_level = 'Director' THEN 2
              WHEN role_level = 'Manager' THEN 3
              ELSE 4
            END,
            department, last_name
        `
        break

      default:
        query = `
          SELECT * FROM employees 
          WHERE company_id = $1 
          AND employment_status = 'active'
          ORDER BY last_name, first_name
        `
    }

    const employees = await sql(query, queryParams)

    const response: EmployeeResponse = {
      employees: employees as Employee[],
      total_count: employees.length,
      lens,
      time_period,
      company_id: Number.parseInt(company_id),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
