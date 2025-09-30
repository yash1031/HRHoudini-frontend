import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function populateSharpMedianData() {
  console.log("[v0] Starting Sharp Median data population v2...")

  try {
    // First, check if we can connect to the database
    const testConnection = await sql`SELECT 1 as test`
    console.log("[v0] Database connection successful:", testConnection)

    // Fetch the CSV data with timeout
    console.log("[v0] Fetching CSV data...")
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SharpMedian-pZZDRrwRoYB9AYlYQ6WqW9423DyQkW.csv",
      { signal: controller.signal },
    )
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log(`[v0] CSV data fetched successfully. Size: ${csvText.length} characters`)

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`[v0] Found ${lines.length} lines in CSV`)

    if (lines.length < 2) {
      throw new Error("CSV file appears to be empty or invalid")
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("[v0] Headers found:", headers.slice(0, 5), "... (showing first 5)")

    // Clear existing data
    const deleteResult = await sql`DELETE FROM sharp_median_employees`
    console.log("[v0] Cleared existing data")

    // Process each row with better error handling
    let insertedCount = 0
    let errorCount = 0

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        // Simple CSV parsing (assuming no commas in quoted fields for now)
        const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))

        if (values.length < 35) {
          console.log(`[v0] Skipping row ${i}: insufficient columns (${values.length})`)
          continue
        }

        // Helper functions
        const parseDate = (dateStr) => {
          if (!dateStr || dateStr === "" || dateStr === "NULL") return null
          try {
            const date = new Date(dateStr)
            return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0]
          } catch {
            return null
          }
        }

        const parseNumber = (numStr) => {
          if (!numStr || numStr === "" || numStr === "NULL") return null
          const num = Number.parseFloat(numStr)
          return isNaN(num) ? null : num
        }

        const parseInteger = (intStr) => {
          if (!intStr || intStr === "" || intStr === "NULL") return null
          const num = Number.parseInt(intStr, 10)
          return isNaN(num) ? null : num
        }

        // Insert row with proper error handling
        await sql`
          INSERT INTO sharp_median_employees (
            employee_id, employee_status, employee_type, employee_name,
            original_hire_date, last_hire_date, seniority_date, termination_date,
            termination_reason_code, termination_reason, termination_type, company,
            organization, department, job_code, job_title,
            supervisor_employee_number, supervisor_name, location, region,
            address_work, city_work, state_work, postal_code_work, country_work,
            address_home, city_home, state_home, postal_code_home, country_home,
            salary_or_hourly, hourly_rate, annual_salary, local_currency_code,
            gender, ethnicity, date_of_birth, email_address, remote_flag
          ) VALUES (
            ${values[0] || null}, ${values[1] || null}, ${values[2] || null}, ${values[3] || null},
            ${parseDate(values[4])}, ${parseDate(values[5])}, ${parseDate(values[6])}, ${parseDate(values[7])},
            ${values[8] || null}, ${values[9] || null}, ${values[10] || null}, ${values[11] || null},
            ${values[12] || null}, ${values[13] || null}, ${values[14] || null}, ${values[15] || null},
            ${values[16] || null}, ${values[17] || null}, ${values[18] || null}, ${values[19] || null},
            ${values[20] || null}, ${values[21] || null}, ${values[22] || null}, ${values[23] || null}, ${values[24] || null},
            ${values[25] || null}, ${values[26] || null}, ${values[27] || null}, ${values[28] || null}, ${values[29] || null},
            ${values[30] || null}, ${parseNumber(values[31])}, ${parseNumber(values[32])}, ${values[33] || null},
            ${values[34] || null}, ${values[35] || null}, ${parseDate(values[36])}, ${values[37] || null}, ${parseInteger(values[38])}
          )
        `

        insertedCount++

        if (insertedCount % 50 === 0) {
          console.log(`[v0] Inserted ${insertedCount} records...`)
        }
      } catch (error) {
        errorCount++
        if (errorCount <= 5) {
          // Only log first 5 errors to avoid spam
          console.error(`[v0] Error inserting row ${i}:`, error.message)
        }
      }
    }

    console.log(`[v0] Data population complete!`)
    console.log(`[v0] Successfully inserted: ${insertedCount} records`)
    console.log(`[v0] Errors encountered: ${errorCount} records`)

    // Verify the data
    const count = await sql`SELECT COUNT(*) as count FROM sharp_median_employees`
    console.log(`[v0] Total records in database: ${count[0].count}`)

    if (count[0].count > 0) {
      // Show sample statistics
      const stats = await sql`
        SELECT 
          COUNT(*) as total_employees,
          COUNT(CASE WHEN employee_status = 'Terminated' THEN 1 END) as terminated_count,
          COUNT(DISTINCT department) as department_count,
          COUNT(DISTINCT location) as location_count
        FROM sharp_median_employees
      `

      console.log("[v0] Database statistics:", stats[0])

      // Show a sample record
      const sample = await sql`SELECT * FROM sharp_median_employees LIMIT 1`
      console.log("[v0] Sample record:", sample[0])
    }
  } catch (error) {
    console.error("[v0] Fatal error populating Sharp Median data:", error)
    throw error
  }
}

// Run the population script
populateSharpMedianData().catch(console.error)
