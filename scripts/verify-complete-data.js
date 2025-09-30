import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function verifyCompleteData() {
  console.log("[v0] Verifying Sharp Median data completeness...")

  try {
    // Get total count
    const countResult = await sql`SELECT COUNT(*) as total_count FROM sharp_median_employees`
    const totalCount = countResult[0].total_count
    console.log(`[v0] Total employee records: ${totalCount}`)

    // Get sample of data
    const sampleResult = await sql`
      SELECT employee_id, employee_name, department, location, employee_status 
      FROM sharp_median_employees 
      LIMIT 5
    `
    console.log("[v0] Sample records:")
    sampleResult.forEach((record, index) => {
      console.log(
        `[v0] ${index + 1}. ${record.employee_name} (${record.employee_id}) - ${record.department} - ${record.location} - ${record.employee_status}`,
      )
    })

    // Get department breakdown
    const deptResult = await sql`
      SELECT department, COUNT(*) as count 
      FROM sharp_median_employees 
      WHERE department IS NOT NULL 
      GROUP BY department 
      ORDER BY count DESC
    `
    console.log("[v0] Department breakdown:")
    deptResult.forEach((dept) => {
      console.log(`[v0] ${dept.department}: ${dept.count} employees`)
    })

    // Get location breakdown
    const locationResult = await sql`
      SELECT location, COUNT(*) as count 
      FROM sharp_median_employees 
      WHERE location IS NOT NULL 
      GROUP BY location 
      ORDER BY count DESC
    `
    console.log("[v0] Location breakdown:")
    locationResult.forEach((loc) => {
      console.log(`[v0] ${loc.location}: ${loc.count} employees`)
    })

    // Check for terminated employees
    const terminatedResult = await sql`
      SELECT COUNT(*) as terminated_count 
      FROM sharp_median_employees 
      WHERE termination_date IS NOT NULL
    `
    const terminatedCount = terminatedResult[0].terminated_count
    console.log(`[v0] Terminated employees: ${terminatedCount}`)
    console.log(`[v0] Active employees: ${totalCount - terminatedCount}`)

    console.log("[v0] Data verification completed successfully!")
  } catch (error) {
    console.error("[v0] Error during data verification:", error)
    throw error
  }
}

// Run the verification
verifyCompleteData()
  .then(() => {
    console.log("[v0] Data verification script completed")
  })
  .catch((error) => {
    console.error("[v0] Data verification script failed:", error)
    process.exit(1)
  })
