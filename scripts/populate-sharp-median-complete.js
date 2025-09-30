import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

async function populateSharpMedianData() {
  console.log("[v0] Starting complete Sharp Median data population...")

  try {
    // First, clear existing data to avoid duplicates
    console.log("[v0] Clearing existing data...")
    await sql`DELETE FROM sharp_median_employees`
    console.log("[v0] Existing data cleared")

    // Fetch the CSV data
    console.log("[v0] Fetching CSV data from URL...")
    const response = await fetch("https://blob.v0.app/pjtmy8OGJ.csv")

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("[v0] CSV data fetched successfully")
    console.log(`[v0] CSV size: ${csvText.length} characters`)

    // Parse CSV manually with better error handling
    const lines = csvText.split("\n").filter((line) => line.trim())
    console.log(`[v0] Total lines in CSV: ${lines.length}`)

    if (lines.length < 2) {
      throw new Error("CSV file appears to be empty or invalid")
    }

    // Get headers
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log(`[v0] Headers found: ${headers.length} columns`)
    console.log(`[v0] First few headers: ${headers.slice(0, 5).join(", ")}`)

    // Process data in smaller batches to avoid memory/connection issues
    const BATCH_SIZE = 50 // Smaller batch size for reliability
    const dataRows = lines.slice(1) // Skip header row
    console.log(`[v0] Data rows to process: ${dataRows.length}`)

    let totalInserted = 0
    let batchNumber = 1

    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      const batch = dataRows.slice(i, i + BATCH_SIZE)
      console.log(
        `[v0] Processing batch ${batchNumber} (rows ${i + 1} to ${Math.min(i + BATCH_SIZE, dataRows.length)})`,
      )

      const batchData = []

      for (const row of batch) {
        try {
          // Parse CSV row with proper quote handling
          const values = []
          let currentValue = ""
          let inQuotes = false

          for (let j = 0; j < row.length; j++) {
            const char = row[j]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
              values.push(currentValue.trim())
              currentValue = ""
            } else {
              currentValue += char
            }
          }
          values.push(currentValue.trim()) // Add the last value

          if (values.length !== headers.length) {
            console.log(`[v0] Warning: Row has ${values.length} values but expected ${headers.length}, skipping`)
            continue
          }

          // Convert values to proper types
          const processedRow = {}
          for (let j = 0; j < headers.length; j++) {
            let value = values[j]

            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1)
            }

            // Handle empty values
            if (value === "" || value === "NULL" || value === "null") {
              value = null
            }

            processedRow[headers[j]] = value
          }

          batchData.push(processedRow)
        } catch (error) {
          console.log(`[v0] Error processing row: ${error.message}, skipping`)
        }
      }

      if (batchData.length === 0) {
        console.log(`[v0] No valid data in batch ${batchNumber}, skipping`)
        batchNumber++
        continue
      }

      // Insert batch with retry logic
      let retries = 3
      while (retries > 0) {
        try {
          console.log(`[v0] Inserting ${batchData.length} records in batch ${batchNumber}...`)

          for (const row of batchData) {
            await sql`
              INSERT INTO sharp_median_employees (
                employee_id, employee_name, email_address, job_title, job_code, department, 
                organization, location, employee_status, employee_type, salary_or_hourly, 
                annual_salary, hourly_rate, local_currency_code, original_hire_date, 
                last_hire_date, seniority_date, termination_date, termination_type, 
                termination_reason_code, termination_reason, supervisor_employee_number, 
                supervisor_name, date_of_birth, gender, ethnicity, address_home, 
                city_home, state_home, postal_code_home, country_home, address_work, 
                city_work, state_work, postal_code_work, country_work, region, 
                remote_flag, company
              ) VALUES (
                ${row["Employee ID"]}, ${row["Employee Name"]}, ${row["Email Address"]}, 
                ${row["Job Title"]}, ${row["Job Code"]}, ${row["Department"]}, 
                ${row["Organization"]}, ${row["Location"]}, ${row["Employee Status"]}, 
                ${row["Employee Type"]}, ${row["Salary or Hourly"]}, 
                ${row["Annual Salary"] ? Number.parseFloat(row["Annual Salary"]) : null}, 
                ${row["Hourly Rate"] ? Number.parseFloat(row["Hourly Rate"]) : null}, 
                ${row["Local Currency Code"]}, 
                ${row["Original Hire Date"] ? row["Original Hire Date"] : null}, 
                ${row["Last Hire Date"] ? row["Last Hire Date"] : null}, 
                ${row["Seniority Date"] ? row["Seniority Date"] : null}, 
                ${row["Termination Date"] ? row["Termination Date"] : null}, 
                ${row["Termination Type"]}, ${row["Termination Reason Code"]}, 
                ${row["Termination Reason"]}, ${row["Supervisor Employee Number"]}, 
                ${row["Supervisor Name"]}, 
                ${row["Date of Birth"] ? row["Date of Birth"] : null}, 
                ${row["Gender"]}, ${row["Ethnicity"]}, ${row["Address - Home"]}, 
                ${row["City - Home"]}, ${row["State - Home"]}, ${row["Postal Code - Home"]}, 
                ${row["Country - Home"]}, ${row["Address - Work"]}, ${row["City - Work"]}, 
                ${row["State - Work"]}, ${row["Postal Code - Work"]}, ${row["Country - Work"]}, 
                ${row["Region"]}, ${row["Remote Flag"] ? Number.parseInt(row["Remote Flag"]) : null}, 
                ${row["Company"]}
              )
            `
          }

          totalInserted += batchData.length
          console.log(`[v0] Batch ${batchNumber} completed successfully. Total inserted: ${totalInserted}`)
          break // Success, exit retry loop
        } catch (error) {
          retries--
          console.log(`[v0] Error inserting batch ${batchNumber}: ${error.message}`)
          if (retries > 0) {
            console.log(`[v0] Retrying batch ${batchNumber} (${retries} retries left)...`)
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
          } else {
            console.log(`[v0] Failed to insert batch ${batchNumber} after all retries`)
          }
        }
      }

      batchNumber++

      // Small delay between batches to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Verify final count
    const result = await sql`SELECT COUNT(*) as count FROM sharp_median_employees`
    const finalCount = result[0].count

    console.log(`[v0] Data population completed!`)
    console.log(`[v0] Total records inserted: ${totalInserted}`)
    console.log(`[v0] Final database count: ${finalCount}`)

    if (finalCount != totalInserted) {
      console.log(`[v0] Warning: Mismatch between inserted (${totalInserted}) and final count (${finalCount})`)
    }
  } catch (error) {
    console.error("[v0] Error during data population:", error)
    throw error
  }
}

// Run the population
populateSharpMedianData()
  .then(() => {
    console.log("[v0] Sharp Median data population script completed successfully")
  })
  .catch((error) => {
    console.error("[v0] Sharp Median data population script failed:", error)
    process.exit(1)
  })
