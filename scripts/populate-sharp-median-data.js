// Fetch Sharp Median CSV data and populate the database table
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function populateSharpMedianData() {
  console.log("[v0] Starting Sharp Median data population...")

  try {
    // Fetch the CSV data
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SharpMedian-pZZDRrwRoYB9AYlYQ6WqW9423DyQkW.csv",
    )
    const csvText = await response.text()

    console.log("[v0] CSV data fetched successfully")

    // Parse CSV data
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("[v0] Headers found:", headers)

    // Clear existing data
    await sql`DELETE FROM sharp_median_employees`
    console.log("[v0] Cleared existing data")

    // Process each row
    let insertedCount = 0
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse CSV row (handling quoted values)
      const values = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())

      if (values.length < headers.length) continue

      try {
        // Parse dates
        const parseDate = (dateStr) => {
          if (!dateStr || dateStr === "") return null
          const date = new Date(dateStr)
          return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0]
        }

        // Parse numbers
        const parseNumber = (numStr) => {
          if (!numStr || numStr === "") return null
          const num = Number.parseFloat(numStr)
          return isNaN(num) ? null : num
        }

        const parseInt = (intStr) => {
          if (!intStr || intStr === "") return null
          const num = parseInt(intStr)
          return isNaN(num) ? null : num
        }

        // Insert row
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
            ${values[0]}, ${values[1]}, ${values[2]}, ${values[3]},
            ${parseDate(values[4])}, ${parseDate(values[5])}, ${parseDate(values[6])}, ${parseDate(values[7])},
            ${values[8]}, ${values[9]}, ${values[10]}, ${values[11]},
            ${values[12]}, ${values[13]}, ${values[14]}, ${values[15]},
            ${values[16]}, ${values[17]}, ${values[18]}, ${values[19]},
            ${values[20]}, ${values[21]}, ${values[22]}, ${values[23]}, ${values[24]},
            ${values[25]}, ${values[26]}, ${values[27]}, ${values[28]}, ${values[29]},
            ${values[30]}, ${parseNumber(values[31])}, ${parseNumber(values[32])}, ${values[33]},
            ${values[34]}, ${values[35]}, ${parseDate(values[36])}, ${values[37]}, ${parseInt(values[38])}
          )
        `

        insertedCount++

        if (insertedCount % 100 === 0) {
          console.log(`[v0] Inserted ${insertedCount} records...`)
        }
      } catch (error) {
        console.error(`[v0] Error inserting row ${i}:`, error)
        console.error("[v0] Row data:", values)
      }
    }

    console.log(`[v0] Successfully inserted ${insertedCount} Sharp Median employee records`)

    // Verify the data
    const count = await sql`SELECT COUNT(*) as count FROM sharp_median_employees`
    console.log(`[v0] Total records in database: ${count[0].count}`)

    // Show some sample statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN employee_status = 'Terminated' THEN 1 END) as terminated_count,
        COUNT(DISTINCT department) as department_count,
        COUNT(DISTINCT location) as location_count
      FROM sharp_median_employees
    `

    console.log("[v0] Database statistics:", stats[0])
  } catch (error) {
    console.error("[v0] Error populating Sharp Median data:", error)
    throw error
  }
}

// Run the population script
populateSharpMedianData().catch(console.error)
