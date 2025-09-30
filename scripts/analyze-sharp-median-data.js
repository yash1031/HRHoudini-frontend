// Script to fetch and analyze the Sharp Median sample data
const csvUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SharpMedian-HQ8cx4jRnzn7q4QIsRoxvQAS5Bleze.csv"

async function fetchAndAnalyzeData() {
  try {
    console.log("[v0] Fetching Sharp Median CSV data...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("[v0] CSV data fetched successfully")
    console.log("[v0] First 500 characters:", csvText.substring(0, 500))

    // Parse CSV data
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        data.push(row)
      }
    }

    console.log("[v0] Total records:", data.length)
    console.log("[v0] Headers:", headers)

    // Analyze key metrics
    const analysis = {
      totalEmployees: data.length,
      activeEmployees: data.filter((emp) => emp["Employee Status"] === "Active").length,
      terminatedEmployees: data.filter((emp) => emp["Employee Status"] === "Terminated").length,
      departments: [...new Set(data.map((emp) => emp.Department))].filter((d) => d),
      locations: [...new Set(data.map((emp) => emp.Location))].filter((l) => l),
      jobTitles: [...new Set(data.map((emp) => emp["Job Title"]))].filter((j) => j),
      employeeTypes: [...new Set(data.map((emp) => emp["Employee Type"]))].filter((t) => t),
      regions: [...new Set(data.map((emp) => emp.Region))].filter((r) => r),
      genderDistribution: {},
      ethnicityDistribution: {},
      compensationStats: {
        hourlyEmployees: data.filter((emp) => emp["Salary or Hourly"] === "Hourly").length,
        salaryEmployees: data.filter((emp) => emp["Salary or Hourly"] === "Salary").length,
        avgHourlyRate: 0,
        avgSalary: 0,
      },
    }

    // Gender distribution
    data.forEach((emp) => {
      const gender = emp.Gender
      if (gender) {
        analysis.genderDistribution[gender] = (analysis.genderDistribution[gender] || 0) + 1
      }
    })

    // Ethnicity distribution
    data.forEach((emp) => {
      const ethnicity = emp.Ethnicity
      if (ethnicity) {
        analysis.ethnicityDistribution[ethnicity] = (analysis.ethnicityDistribution[ethnicity] || 0) + 1
      }
    })

    // Department breakdown
    const departmentBreakdown = {}
    data.forEach((emp) => {
      const dept = emp.Department
      if (dept) {
        departmentBreakdown[dept] = (departmentBreakdown[dept] || 0) + 1
      }
    })
    analysis.departmentBreakdown = departmentBreakdown

    // Calculate average compensation
    const hourlyRates = data
      .filter((emp) => emp["Hourly Rate"] && !isNaN(Number.parseFloat(emp["Hourly Rate"])))
      .map((emp) => Number.parseFloat(emp["Hourly Rate"]))

    const salaries = data
      .filter((emp) => emp["Annual Salary"] && !isNaN(Number.parseFloat(emp["Annual Salary"])))
      .map((emp) => Number.parseFloat(emp["Annual Salary"]))

    if (hourlyRates.length > 0) {
      analysis.compensationStats.avgHourlyRate = hourlyRates.reduce((a, b) => a + b, 0) / hourlyRates.length
    }

    if (salaries.length > 0) {
      analysis.compensationStats.avgSalary = salaries.reduce((a, b) => a + b, 0) / salaries.length
    }

    // Termination analysis
    const terminationReasons = {}
    data
      .filter((emp) => emp["Termination Reason"])
      .forEach((emp) => {
        const reason = emp["Termination Reason"]
        terminationReasons[reason] = (terminationReasons[reason] || 0) + 1
      })
    analysis.terminationReasons = terminationReasons

    console.log("[v0] Analysis complete:", JSON.stringify(analysis, null, 2))

    return { data, analysis }
  } catch (error) {
    console.error("[v0] Error fetching/analyzing data:", error)
    throw error
  }
}

// Execute the analysis
fetchAndAnalyzeData()
  .then((result) => {
    console.log("[v0] Sharp Median data analysis completed successfully")
    console.log("[v0] Key insights:")
    console.log(`- Total employees: ${result.analysis.totalEmployees}`)
    console.log(`- Active employees: ${result.analysis.activeEmployees}`)
    console.log(`- Departments: ${result.analysis.departments.length}`)
    console.log(`- Locations: ${result.analysis.locations.length}`)
    console.log(`- Average hourly rate: $${result.analysis.compensationStats.avgHourlyRate.toFixed(2)}`)
    console.log(`- Average salary: $${result.analysis.compensationStats.avgSalary.toLocaleString()}`)
  })
  .catch((error) => {
    console.error("[v0] Analysis failed:", error)
  })
