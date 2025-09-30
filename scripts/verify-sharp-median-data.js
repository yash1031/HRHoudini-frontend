import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function verifyData() {
  console.log("[v0] Verifying Sharp Median data...")

  try {
    // Check record count
    const count = await sql`SELECT COUNT(*) as count FROM sharp_median_employees`
    console.log(`[v0] Total records: ${count[0].count}`)

    if (count[0].count === 0) {
      console.log("[v0] ❌ No data found in sharp_median_employees table")
      return
    }

    // Basic statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN employee_status = 'Terminated' THEN 1 END) as terminated_count,
        COUNT(CASE WHEN employee_status = 'Active' THEN 1 END) as active_count,
        COUNT(DISTINCT department) as department_count,
        COUNT(DISTINCT location) as location_count,
        AVG(CASE WHEN annual_salary > 0 THEN annual_salary END) as avg_salary
      FROM sharp_median_employees
    `

    console.log("[v0] ✅ Data verification results:")
    console.log("  - Total employees:", stats[0].total_employees)
    console.log("  - Terminated:", stats[0].terminated_count)
    console.log("  - Active:", stats[0].active_count)
    console.log("  - Departments:", stats[0].department_count)
    console.log("  - Locations:", stats[0].location_count)
    console.log("  - Average salary:", stats[0].avg_salary ? `$${Math.round(stats[0].avg_salary)}` : "N/A")

    // Sample departments
    const departments = await sql`
      SELECT department, COUNT(*) as count 
      FROM sharp_median_employees 
      WHERE department IS NOT NULL 
      GROUP BY department 
      ORDER BY count DESC 
      LIMIT 5
    `

    console.log("[v0] Top departments:")
    departments.forEach((dept) => {
      console.log(`  - ${dept.department}: ${dept.count} employees`)
    })
  } catch (error) {
    console.error("[v0] Error verifying data:", error)
  }
}

verifyData()
