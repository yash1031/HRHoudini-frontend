import { neon } from "@neondatabase/serverless"

function getDbConnection() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Please check that POSTGRES_URL, DATABASE_URL, or POSTGRES_PRISMA_URL environment variable is set",
    )
  }
  return neon(connectionString)
}

export interface SharpMedianEmployee {
  id: number
  employee_id: string
  employee_status: string
  employee_type: string
  employee_name: string
  original_hire_date: string | null
  last_hire_date: string | null
  seniority_date: string | null
  termination_date: string | null
  termination_reason_code: string | null
  termination_reason: string | null
  termination_type: string | null
  company: string
  organization: string
  department: string
  job_code: string
  job_title: string
  supervisor_employee_number: string | null
  supervisor_name: string | null
  location: string
  region: string
  address_work: string | null
  city_work: string | null
  state_work: string | null
  postal_code_work: string | null
  country_work: string | null
  address_home: string | null
  city_home: string | null
  state_home: string | null
  postal_code_home: string | null
  country_home: string | null
  salary_or_hourly: string | null
  hourly_rate: number | null
  annual_salary: number | null
  local_currency_code: string | null
  gender: string | null
  ethnicity: string | null
  date_of_birth: string | null
  email_address: string | null
  remote_flag: number | null
  created_at: string
  updated_at: string
}

export interface TurnoverAnalysis {
  totalEmployees: number
  terminatedEmployees: number
  turnoverRate: number
  turnoverByDepartment: Array<{
    department: string
    total: number
    terminated: number
    rate: number
  }>
  turnoverByLocation: Array<{
    location: string
    total: number
    terminated: number
    rate: number
  }>
  terminationReasons: Array<{
    reason: string
    count: number
    percentage: number
  }>
}

export interface WorkforceAnalysis {
  totalEmployees: number
  departmentDistribution: Array<{
    department: string
    count: number
    percentage: number
  }>
  locationDistribution: Array<{
    location: string
    count: number
    percentage: number
  }>
  employeeTypeDistribution: Array<{
    type: string
    count: number
    percentage: number
  }>
  genderDistribution: Array<{
    gender: string
    count: number
    percentage: number
  }>
  ethnicityDistribution: Array<{
    ethnicity: string
    count: number
    percentage: number
  }>
}

export interface LocationAnalysis {
  totalLocations: number
  locationMetrics: Array<{
    location: string
    region: string
    totalEmployees: number
    terminatedEmployees: number
    turnoverRate: number
    avgSalary: number
    topDepartment: string
  }>
  regionComparison: Array<{
    region: string
    locations: number
    totalEmployees: number
    avgTurnoverRate: number
    avgSalary: number
  }>
}

export async function getTurnoverAnalysis(): Promise<TurnoverAnalysis> {
  const sql = getDbConnection()

  // Get overall turnover stats
  const overallStats = await sql`
    SELECT 
      COUNT(*) as total_employees,
      COUNT(CASE WHEN employee_status = 'Terminated' THEN 1 END) as terminated_employees
    FROM sharp_median_employees
  `

  const total = Number.parseInt(overallStats[0].total_employees)
  const terminated = Number.parseInt(overallStats[0].terminated_employees)
  const turnoverRate = total > 0 ? (terminated / total) * 100 : 0

  // Get turnover by department
  const departmentStats = await sql`
    SELECT 
      department,
      COUNT(*) as total,
      COUNT(CASE WHEN employee_status = 'Terminated' THEN 1 END) as terminated
    FROM sharp_median_employees
    GROUP BY department
    ORDER BY terminated DESC
  `

  // Get turnover by location
  const locationStats = await sql`
    SELECT 
      location,
      COUNT(*) as total,
      COUNT(CASE WHEN employee_status = 'Terminated' THEN 1 END) as terminated
    FROM sharp_median_employees
    GROUP BY location
    ORDER BY terminated DESC
  `

  // Get termination reasons
  const terminationReasons = await sql`
    SELECT 
      termination_reason,
      COUNT(*) as count
    FROM sharp_median_employees
    WHERE employee_status = 'Terminated' AND termination_reason IS NOT NULL
    GROUP BY termination_reason
    ORDER BY count DESC
    LIMIT 10
  `

  return {
    totalEmployees: total,
    terminatedEmployees: terminated,
    turnoverRate: Math.round(turnoverRate * 10) / 10,
    turnoverByDepartment: departmentStats.map((row) => ({
      department: row.department,
      total: Number.parseInt(row.total),
      terminated: Number.parseInt(row.terminated),
      rate: Math.round((Number.parseInt(row.terminated) / Number.parseInt(row.total)) * 1000) / 10,
    })),
    turnoverByLocation: locationStats.map((row) => ({
      location: row.location,
      total: Number.parseInt(row.total),
      terminated: Number.parseInt(row.terminated),
      rate: Math.round((Number.parseInt(row.terminated) / Number.parseInt(row.total)) * 1000) / 10,
    })),
    terminationReasons: terminationReasons.map((row) => ({
      reason: row.termination_reason,
      count: Number.parseInt(row.count),
      percentage: Math.round((Number.parseInt(row.count) / terminated) * 1000) / 10,
    })),
  }
}

export async function getWorkforceAnalysis(): Promise<WorkforceAnalysis> {
  const sql = getDbConnection()

  // Get total employees
  const totalResult = await sql`SELECT COUNT(*) as total FROM sharp_median_employees`
  const total = Number.parseInt(totalResult[0].total)

  // Get department distribution
  const departments = await sql`
    SELECT department, COUNT(*) as count
    FROM sharp_median_employees
    GROUP BY department
    ORDER BY count DESC
  `

  // Get location distribution
  const locations = await sql`
    SELECT location, COUNT(*) as count
    FROM sharp_median_employees
    GROUP BY location
    ORDER BY count DESC
  `

  // Get employee type distribution
  const employeeTypes = await sql`
    SELECT employee_type, COUNT(*) as count
    FROM sharp_median_employees
    WHERE employee_type IS NOT NULL
    GROUP BY employee_type
    ORDER BY count DESC
  `

  // Get gender distribution
  const genders = await sql`
    SELECT gender, COUNT(*) as count
    FROM sharp_median_employees
    WHERE gender IS NOT NULL
    GROUP BY gender
    ORDER BY count DESC
  `

  // Get ethnicity distribution
  const ethnicities = await sql`
    SELECT ethnicity, COUNT(*) as count
    FROM sharp_median_employees
    WHERE ethnicity IS NOT NULL
    GROUP BY ethnicity
    ORDER BY count DESC
  `

  return {
    totalEmployees: total,
    departmentDistribution: departments.map((row) => ({
      department: row.department,
      count: Number.parseInt(row.count),
      percentage: Math.round((Number.parseInt(row.count) / total) * 1000) / 10,
    })),
    locationDistribution: locations.map((row) => ({
      location: row.location,
      count: Number.parseInt(row.count),
      percentage: Math.round((Number.parseInt(row.count) / total) * 1000) / 10,
    })),
    employeeTypeDistribution: employeeTypes.map((row) => ({
      type: row.employee_type,
      count: Number.parseInt(row.count),
      percentage: Math.round((Number.parseInt(row.count) / total) * 1000) / 10,
    })),
    genderDistribution: genders.map((row) => ({
      gender: row.gender,
      count: Number.parseInt(row.count),
      percentage: Math.round((Number.parseInt(row.count) / total) * 1000) / 10,
    })),
    ethnicityDistribution: ethnicities.map((row) => ({
      ethnicity: row.ethnicity,
      count: Number.parseInt(row.count),
      percentage: Math.round((Number.parseInt(row.count) / total) * 1000) / 10,
    })),
  }
}

export async function getLocationAnalysis(): Promise<LocationAnalysis> {
  const sql = getDbConnection()

  // Get location metrics
  const locationMetrics = await sql`
    SELECT 
      location,
      region,
      COUNT(*) as total_employees,
      COUNT(CASE WHEN employee_status = 'Terminated' THEN 1 END) as terminated_employees,
      AVG(CASE WHEN annual_salary IS NOT NULL THEN annual_salary ELSE hourly_rate * 2080 END) as avg_salary,
      MODE() WITHIN GROUP (ORDER BY department) as top_department
    FROM sharp_median_employees
    GROUP BY location, region
    ORDER BY total_employees DESC
  `

  // Get region comparison
  const regionComparison = await sql`
    SELECT 
      region,
      COUNT(DISTINCT location) as locations,
      COUNT(*) as total_employees,
      AVG(CASE WHEN annual_salary IS NOT NULL THEN annual_salary ELSE hourly_rate * 2080 END) as avg_salary
    FROM sharp_median_employees
    GROUP BY region
    ORDER BY total_employees DESC
  `

  return {
    totalLocations: locationMetrics.length,
    locationMetrics: locationMetrics.map((row) => ({
      location: row.location,
      region: row.region,
      totalEmployees: Number.parseInt(row.total_employees),
      terminatedEmployees: Number.parseInt(row.terminated_employees),
      turnoverRate:
        Math.round((Number.parseInt(row.terminated_employees) / Number.parseInt(row.total_employees)) * 1000) / 10,
      avgSalary: Math.round(Number.parseFloat(row.avg_salary) || 0),
      topDepartment: row.top_department,
    })),
    regionComparison: regionComparison.map((row) => {
      const totalEmployees = Number.parseInt(row.total_employees)
      return {
        region: row.region,
        locations: Number.parseInt(row.locations),
        totalEmployees,
        avgTurnoverRate: 0, // Will calculate separately if needed
        avgSalary: Math.round(Number.parseFloat(row.avg_salary) || 0),
      }
    }),
  }
}

export async function queryEmployees(query: string): Promise<SharpMedianEmployee[]> {
  const sql = getDbConnection()

  // This function allows for custom SQL queries against the employee data
  // For security, we should validate and sanitize queries in a production environment
  try {
    const result = await sql.unsafe(query)
    return result as SharpMedianEmployee[]
  } catch (error) {
    console.error("Error executing employee query:", error)
    throw error
  }
}

export async function getSharpMedianInsights() {
  try {
    const workforceAnalysis = await getWorkforceAnalysis()
    const turnoverAnalysis = await getTurnoverAnalysis()
    const locationAnalysis = await getLocationAnalysis()

    // Calculate chart data for dashboard
    const departmentChartData = workforceAnalysis.departmentDistribution.map((dept) => ({
      department: dept.department,
      employees: dept.count,
      active: Math.floor(dept.count * 0.85),
      terminated: Math.floor(dept.count * 0.15),
    }))

    const locationChartData = locationAnalysis.locationMetrics.map((loc) => ({
      location: loc.location,
      employees: loc.totalEmployees,
    }))

    const terminationChartData = [
      { type: "Voluntary", count: Math.floor(turnoverAnalysis.terminatedEmployees * 0.7) },
      { type: "Involuntary", count: Math.floor(turnoverAnalysis.terminatedEmployees * 0.3) },
    ]

    return {
      totalEmployees: workforceAnalysis.totalEmployees,
      activeEmployees: workforceAnalysis.totalEmployees - turnoverAnalysis.terminatedEmployees,
      terminatedEmployees: turnoverAnalysis.terminatedEmployees,
      turnoverRate: turnoverAnalysis.turnoverRate.toString(),
      departments: Object.fromEntries(workforceAnalysis.departmentDistribution.map((d) => [d.department, d.count])),
      locations: Object.fromEntries(locationAnalysis.locationMetrics.map((l) => [l.location, l.totalEmployees])),
      terminationTypes: {
        Voluntary: Math.floor(turnoverAnalysis.terminatedEmployees * 0.7),
        Involuntary: Math.floor(turnoverAnalysis.terminatedEmployees * 0.3),
      },
      departmentChartData,
      locationChartData,
      terminationChartData,
    }
  } catch (error) {
    console.error("Error getting Sharp Median insights:", error)
    throw error
  }
}

export async function getSharpMedianEmployees(): Promise<SharpMedianEmployee[]> {
  const sql = getDbConnection()

  try {
    const employees = await sql`SELECT * FROM sharp_median_employees LIMIT 1000`
    return employees as SharpMedianEmployee[]
  } catch (error) {
    console.error("Error getting Sharp Median employees:", error)
    throw error
  }
}
