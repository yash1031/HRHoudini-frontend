// More robust CSV population script that handles the full Sharp Median dataset
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function populateFromCSV() {
  try {
    console.log("[v0] Starting CSV population...")

    // First, clear existing data
    await sql`TRUNCATE TABLE sharp_median_employees`
    console.log("[v0] Cleared existing data")

    // Read the CSV data from the Sharp Median source
    const csvUrl = "https://blob.v0.app/pjtmy8OGJ.csv"
    console.log("[v0] Fetching CSV from:", csvUrl)

    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV fetched, size:", csvText.length, "characters")

    // Parse CSV manually with better handling
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())
    console.log("[v0] Headers found:", headers.length)
    console.log("[v0] First few headers:", headers.slice(0, 5))

    const dataRows = lines.slice(1)
    console.log("[v0] Data rows to process:", dataRows.length)

    // Process in smaller batches to avoid memory issues
    const batchSize = 25
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < dataRows.length; i += batchSize) {
      const batch = dataRows.slice(i, i + batchSize)
      console.log(
        `[v0] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dataRows.length / batchSize)} (${batch.length} records)`,
      )

      try {
        for (const row of batch) {
          // Simple CSV parsing - split by comma but handle quoted fields
          const values = []
          let current = ""
          let inQuotes = false

          for (let j = 0; j < row.length; j++) {
            const char = row[j]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
              values.push(current.trim())
              current = ""
            } else {
              current += char
            }
          }
          values.push(current.trim()) // Add the last value

          if (values.length < headers.length) {
            console.log(`[v0] Skipping row with insufficient data: ${values.length} vs ${headers.length}`)
            continue
          }

          // Map values to database columns
          const employeeData = {
            employee_id: values[0] || null,
            employee_name: values[1] || null,
            email_address: values[2] || null,
            job_title: values[3] || null,
            job_code: values[4] || null,
            department: values[5] || null,
            organization: values[6] || null,
            company: values[7] || null,
            location: values[8] || null,
            employee_type: values[9] || null,
            employee_status: values[10] || null,
            salary_or_hourly: values[11] || null,
            annual_salary: values[12] ? Number.parseFloat(values[12]) : null,
            hourly_rate: values[13] ? Number.parseFloat(values[13]) : null,
            local_currency_code: values[14] || null,
            original_hire_date: values[15] ? new Date(values[15]) : null,
            last_hire_date: values[16] ? new Date(values[16]) : null,
            seniority_date: values[17] ? new Date(values[17]) : null,
            termination_date: values[18] ? new Date(values[18]) : null,
            termination_type: values[19] || null,
            termination_reason_code: values[20] || null,
            termination_reason: values[21] || null,
            supervisor_employee_number: values[22] || null,
            supervisor_name: values[23] || null,
            date_of_birth: values[24] ? new Date(values[24]) : null,
            gender: values[25] || null,
            ethnicity: values[26] || null,
            address_home: values[27] || null,
            city_home: values[28] || null,
            state_home: values[29] || null,
            postal_code_home: values[30] || null,
            country_home: values[31] || null,
            address_work: values[32] || null,
            city_work: values[33] || null,
            state_work: values[34] || null,
            postal_code_work: values[35] || null,
            country_work: values[36] || null,
            region: values[37] || null,
            remote_flag: values[38] ? Number.parseInt(values[38]) : 0,
          }

          // Insert individual record
          await sql`
            INSERT INTO sharp_median_employees (
              employee_id, employee_name, email_address, job_title, job_code, department,
              organization, company, location, employee_type, employee_status, salary_or_hourly,
              annual_salary, hourly_rate, local_currency_code, original_hire_date, last_hire_date,
              seniority_date, termination_date, termination_type, termination_reason_code,
              termination_reason, supervisor_employee_number, supervisor_name, date_of_birth,
              gender, ethnicity, address_home, city_home, state_home, postal_code_home,
              country_home, address_work, city_work, state_work, postal_code_work,
              country_work, region, remote_flag
            ) VALUES (
              ${employeeData.employee_id}, ${employeeData.employee_name}, ${employeeData.email_address},
              ${employeeData.job_title}, ${employeeData.job_code}, ${employeeData.department},
              ${employeeData.organization}, ${employeeData.company}, ${employeeData.location},
              ${employeeData.employee_type}, ${employeeData.employee_status}, ${employeeData.salary_or_hourly},
              ${employeeData.annual_salary}, ${employeeData.hourly_rate}, ${employeeData.local_currency_code},
              ${employeeData.original_hire_date}, ${employeeData.last_hire_date}, ${employeeData.seniority_date},
              ${employeeData.termination_date}, ${employeeData.termination_type}, ${employeeData.termination_reason_code},
              ${employeeData.termination_reason}, ${employeeData.supervisor_employee_number}, ${employeeData.supervisor_name},
              ${employeeData.date_of_birth}, ${employeeData.gender}, ${employeeData.ethnicity},
              ${employeeData.address_home}, ${employeeData.city_home}, ${employeeData.state_home},
              ${employeeData.postal_code_home}, ${employeeData.country_home}, ${employeeData.address_work},
              ${employeeData.city_work}, ${employeeData.state_work}, ${employeeData.postal_code_work},
              ${employeeData.country_work}, ${employeeData.region}, ${employeeData.remote_flag}
            )
          `

          successCount++
        }

        console.log(`[v0] Batch completed successfully. Total inserted: ${successCount}`)
      } catch (error) {
        console.error(`[v0] Error in batch ${Math.floor(i / batchSize) + 1}:`, error.message)
        errorCount++
      }

      // Small delay between batches to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log("[v0] Population completed!")
    console.log(`[v0] Successfully inserted: ${successCount} records`)
    console.log(`[v0] Errors: ${errorCount}`)

    // Verify final count
    const result = await sql`SELECT COUNT(*) as count FROM sharp_median_employees`
    console.log(`[v0] Final record count in database: ${result[0].count}`)
  } catch (error) {
    console.error("[v0] Fatal error during population:", error)
    throw error
  }
}

populateFromCSV()
