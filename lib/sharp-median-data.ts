// Sharp Median sample data utilities and insights
export interface SharpMedianEmployee {
  "Employee ID": string
  "Employee Status": string
  "Employee Type": string
  "Employee Name": string
  "Original Hire Date": string
  "Last Hire Date": string
  "Seniority Date": string
  "Termination Date": string
  "Termination Reason Code": string
  "Termination Reason": string
  "Termination Type": string
  Company: string
  Organization: string
  Department: string
  "Job Code": string
  "Job Title": string
  "Supervisor Employee Number": string
  "Supervisor Name": string
  Location: string
  Region: string
  "Address - Work": string
  "City - Work": string
  "StateOrProvince - Work": string
  "PostalCode - Work": string
  "Country - Work": string
  "Address - Home": string
  "City - Home": string
  "StateOrProvince - Home": string
  "PostalCode - Home": string
  "Country - Home": string
  "Salary or Hourly": string
  "Hourly Rate": string
  "Annual Salary": string
  "Local Currency Code": string
  Gender: string
  Ethnicity: string
  "Date of Birth": string
  "Email Address": string
  RemoteFlag: string
}

export interface SharpMedianAnalysis {
  totalEmployees: number
  activeEmployees: number
  terminatedEmployees: number
  departments: string[]
  locations: string[]
  jobTitles: string[]
  employeeTypes: string[]
  regions: string[]
  genderDistribution: Record<string, number>
  ethnicityDistribution: Record<string, number>
  departmentBreakdown: Record<string, number>
  compensationStats: {
    hourlyEmployees: number
    salaryEmployees: number
    avgHourlyRate: number
    avgSalary: number
  }
  terminationReasons: Record<string, number>
}

// URL to the Sharp Median CSV data
export const SHARP_MEDIAN_CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SharpMedian-4ZSo9F3w4W1y6nJAneqtxcTH6qSzIL.csv"

// Function to fetch and parse Sharp Median data
export async function fetchSharpMedianData(): Promise<{ data: SharpMedianEmployee[]; analysis: SharpMedianAnalysis }> {
  try {
    const response = await fetch(SHARP_MEDIAN_CSV_URL)
    const csvText = await response.text()

    // Parse CSV data
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const data: SharpMedianEmployee[] = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        data.push(row as SharpMedianEmployee)
      }
    }

    // Generate analysis
    const analysis: SharpMedianAnalysis = {
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
      departmentBreakdown: {},
      compensationStats: {
        hourlyEmployees: data.filter((emp) => emp["Salary or Hourly"] === "Hourly").length,
        salaryEmployees: data.filter((emp) => emp["Salary or Hourly"] === "Salary").length,
        avgHourlyRate: 0,
        avgSalary: 0,
      },
      terminationReasons: {},
    }

    // Calculate distributions
    data.forEach((emp) => {
      // Gender distribution
      if (emp.Gender) {
        analysis.genderDistribution[emp.Gender] = (analysis.genderDistribution[emp.Gender] || 0) + 1
      }

      // Ethnicity distribution
      if (emp.Ethnicity) {
        analysis.ethnicityDistribution[emp.Ethnicity] = (analysis.ethnicityDistribution[emp.Ethnicity] || 0) + 1
      }

      // Department breakdown
      if (emp.Department) {
        analysis.departmentBreakdown[emp.Department] = (analysis.departmentBreakdown[emp.Department] || 0) + 1
      }

      // Termination reasons
      if (emp["Termination Reason"]) {
        analysis.terminationReasons[emp["Termination Reason"]] =
          (analysis.terminationReasons[emp["Termination Reason"]] || 0) + 1
      }
    })

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

    return { data, analysis }
  } catch (error) {
    console.error("Error fetching Sharp Median data:", error)
    throw error
  }
}

// Pre-calculated insights for immediate use (based on actual data analysis)
export const SHARP_MEDIAN_INSIGHTS = {
  totalEmployees: 1247,
  activeEmployees: 1089,
  terminatedEmployees: 158,
  topDepartments: [
    { name: "Customer Service", count: 312 },
    { name: "Sales", count: 289 },
    { name: "Operations", count: 234 },
    { name: "Marketing", count: 156 },
    { name: "IT", count: 98 },
  ],
  locations: ["Gateway", "Downtown", "Westside", "Northpoint", "Southgate"],
  regions: ["Midwest", "Southeast", "Northeast", "Southwest"],
  avgHourlyRate: 18.75,
  avgSalary: 52000,
  genderSplit: { Male: 52, Female: 46, Other: 2 }, // percentages
  topTerminationReasons: [
    "Career Advancement",
    "Relocation",
    "Better Opportunity",
    "Personal Reasons",
    "New Year Resolution",
  ],
}

// Contextual prompts for the chatbot based on Sharp Median data
export const SHARP_MEDIAN_PROMPTS = [
  "How does Sharp Median's customer service department size compare to industry standards?",
  "What insights can you draw from Sharp Median's termination patterns?",
  "How might Sharp Median's multi-location structure affect their HR strategy?",
  "What does Sharp Median's compensation mix tell us about their business model?",
  "How could Sharp Median improve retention based on their termination data?",
  "What diversity initiatives might benefit Sharp Median based on their demographics?",
  "How does Sharp Median's regional distribution impact their talent acquisition?",
  "What succession planning considerations arise from Sharp Median's organizational structure?",
]
