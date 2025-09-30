import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Helper function to generate realistic employee data
function generateEmployee(id: number): any {
  const firstNames = [
    "Sarah",
    "Marcus",
    "Jennifer",
    "Robert",
    "Maria",
    "James",
    "Ashley",
    "David",
    "Emily",
    "Michael",
    "Lisa",
    "Kevin",
    "Rachel",
    "Tom",
    "Susan",
    "Alex",
    "Dr. Sarah",
    "Amanda",
    "Mike",
    "Jessica",
    "Brian",
    "Nicole",
    "Christopher",
    "Stephanie",
    "Daniel",
    "Michelle",
    "Matthew",
    "Lauren",
    "Andrew",
    "Samantha",
  ]
  const lastNames = [
    "Johnson",
    "Williams",
    "Chen",
    "Thompson",
    "Garcia",
    "Wilson",
    "Brown",
    "Martinez",
    "Davis",
    "Lee",
    "Rodriguez",
    "Kim",
    "Anderson",
    "Taylor",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Clark",
    "Lewis",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "King",
    "Wright",
    "Lopez",
    "Hill",
    "Scott",
    "Green",
  ]

  const departments = [
    "Engineering",
    "Marketing",
    "Human Resources",
    "Sales",
    "Customer Success",
    "Finance",
    "Product",
    "Design",
    "Operations",
    "Legal",
    "Data Science",
    "Security",
    "Quality Assurance",
    "Business Development",
    "Research",
  ]

  const jobTitles = {
    Engineering: [
      "Software Engineer",
      "Senior Software Engineer",
      "Lead Engineer",
      "Engineering Manager",
      "DevOps Engineer",
      "Full Stack Developer",
      "Backend Developer",
      "Frontend Developer",
    ],
    Marketing: [
      "Marketing Manager",
      "Digital Marketing Specialist",
      "Content Marketing Manager",
      "Marketing Coordinator",
      "Brand Manager",
      "Growth Marketing Manager",
    ],
    "Human Resources": [
      "HR Business Partner",
      "HR Generalist",
      "Talent Acquisition Specialist",
      "HR Manager",
      "People Operations Specialist",
      "Compensation Analyst",
    ],
    Sales: [
      "Sales Representative",
      "Account Executive",
      "Sales Manager",
      "Business Development Representative",
      "Enterprise Sales Manager",
      "Inside Sales Representative",
    ],
    "Customer Success": [
      "Customer Success Manager",
      "Customer Support Specialist",
      "Technical Support Engineer",
      "Customer Success Coordinator",
    ],
    Finance: [
      "Finance Analyst",
      "Senior Finance Analyst",
      "Finance Manager",
      "Accounting Specialist",
      "Financial Planning Analyst",
      "Controller",
    ],
    Product: [
      "Product Manager",
      "Senior Product Manager",
      "Product Owner",
      "Product Marketing Manager",
      "Associate Product Manager",
    ],
    Design: [
      "UX Designer",
      "UI Designer",
      "Senior UX Designer",
      "Product Designer",
      "Visual Designer",
      "Design Manager",
    ],
    Operations: [
      "Operations Manager",
      "Operations Coordinator",
      "Business Operations Analyst",
      "Operations Specialist",
    ],
    Legal: ["Legal Counsel", "Paralegal", "Compliance Manager", "Contract Manager"],
    "Data Science": [
      "Data Scientist",
      "Senior Data Scientist",
      "Data Analyst",
      "Machine Learning Engineer",
      "Analytics Manager",
    ],
    Security: ["Security Engineer", "Information Security Analyst", "Security Manager", "Cybersecurity Specialist"],
    "Quality Assurance": ["QA Engineer", "Test Engineer", "QA Manager", "Automation Engineer"],
    "Business Development": ["Business Development Manager", "Partnership Manager", "Strategic Partnerships"],
    Research: ["Research Scientist", "Research Manager", "Market Research Analyst"],
  }

  const locations = [
    { city: "San Francisco", state: "CA", zip: "94105", region: "West" },
    { city: "New York", state: "NY", zip: "10001", region: "East" },
    { city: "Austin", state: "TX", zip: "73301", region: "South" },
    { city: "Chicago", state: "IL", zip: "60601", region: "Midwest" },
    { city: "Seattle", state: "WA", zip: "98101", region: "West" },
    { city: "Boston", state: "MA", zip: "02101", region: "East" },
    { city: "Denver", state: "CO", zip: "80201", region: "West" },
    { city: "Miami", state: "FL", zip: "33101", region: "South" },
    { city: "Portland", state: "OR", zip: "97201", region: "West" },
    { city: "Phoenix", state: "AZ", zip: "85001", region: "West" },
    { city: "Atlanta", state: "GA", zip: "30301", region: "South" },
    { city: "Los Angeles", state: "CA", zip: "90001", region: "West" },
    { city: "Dallas", state: "TX", zip: "75201", region: "South" },
    { city: "Philadelphia", state: "PA", zip: "19101", region: "East" },
    { city: "Minneapolis", state: "MN", zip: "55401", region: "Midwest" },
  ]

  const ethnicities = [
    "White",
    "Black or African American",
    "Asian",
    "Hispanic or Latino",
    "Native American",
    "Pacific Islander",
    "Two or More Races",
  ]
  const genders = ["Male", "Female", "Non-binary"]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const department = departments[Math.floor(Math.random() * departments.length)]
  const jobTitle = jobTitles[department][Math.floor(Math.random() * jobTitles[department].length)]
  const location = locations[Math.floor(Math.random() * locations.length)]
  const gender = genders[Math.floor(Math.random() * genders.length)]
  const ethnicity = ethnicities[Math.floor(Math.random() * ethnicities.length)]

  // Generate realistic salary based on role and department
  const baseSalaries = {
    Engineering: { min: 80000, max: 180000 },
    Marketing: { min: 60000, max: 130000 },
    "Human Resources": { min: 65000, max: 120000 },
    Sales: { min: 55000, max: 150000 },
    "Customer Success": { min: 50000, max: 90000 },
    Finance: { min: 70000, max: 140000 },
    Product: { min: 90000, max: 160000 },
    Design: { min: 70000, max: 130000 },
    Operations: { min: 55000, max: 100000 },
    Legal: { min: 100000, max: 200000 },
    "Data Science": { min: 95000, max: 170000 },
    Security: { min: 85000, max: 150000 },
    "Quality Assurance": { min: 60000, max: 110000 },
    "Business Development": { min: 70000, max: 140000 },
    Research: { min: 80000, max: 160000 },
  }

  const salaryRange = baseSalaries[department]
  const isHourly = Math.random() < 0.15 // 15% hourly employees
  const salary = Math.floor(Math.random() * (salaryRange.max - salaryRange.min) + salaryRange.min)
  const hourlyRate = isHourly ? Math.round((salary / 2080) * 100) / 100 : null // 2080 work hours per year

  // Generate hire date (last 5 years)
  const hireDate = new Date(
    2019 + Math.floor(Math.random() * 5),
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
  )

  // 10% chance of termination
  const isTerminated = Math.random() < 0.1
  const terminationDate = isTerminated
    ? new Date(hireDate.getTime() + Math.random() * (Date.now() - hireDate.getTime()))
    : null
  const terminationType = isTerminated ? (Math.random() < 0.7 ? "Voluntary" : "Involuntary") : null
  const terminationReasons = {
    Voluntary: [
      "Career advancement opportunity",
      "Relocation",
      "Better compensation",
      "Work-life balance",
      "Career change",
    ],
    Involuntary: ["Performance issues", "Restructuring", "Budget cuts", "Policy violation", "Attendance issues"],
  }
  const terminationReason = isTerminated
    ? terminationReasons[terminationType][Math.floor(Math.random() * terminationReasons[terminationType].length)]
    : null

  return {
    employee_id: `EMP${String(id).padStart(4, "0")}`,
    employee_name: `${firstName} ${lastName}`,
    job_title: jobTitle,
    department: department,
    salary_or_hourly: isHourly ? "Hourly" : "Salary",
    annual_salary: isHourly ? null : salary,
    hourly_rate: hourlyRate,
    original_hire_date: hireDate.toISOString().split("T")[0],
    last_hire_date: hireDate.toISOString().split("T")[0],
    seniority_date: hireDate.toISOString().split("T")[0],
    termination_date: terminationDate ? terminationDate.toISOString().split("T")[0] : null,
    termination_type: terminationType,
    termination_reason: terminationReason,
    termination_reason_code: isTerminated ? (terminationType === "Voluntary" ? "VOL001" : "INV001") : null,
    employee_status: isTerminated ? "Terminated" : "Active",
    employee_type: Math.random() < 0.9 ? "Full-time" : "Part-time",
    organization: "Sharp Median",
    company: "Sharp Median",
    location: `${location.city}, ${location.state}`,
    address_work: `${Math.floor(Math.random() * 9999) + 1} Business St`,
    city_work: location.city,
    state_work: location.state,
    postal_code_work: location.zip,
    country_work: "USA",
    address_home: `${Math.floor(Math.random() * 9999) + 1} Home Ave`,
    city_home: location.city,
    state_home: location.state,
    postal_code_home: location.zip,
    country_home: "USA",
    region: location.region,
    job_code: `${department.substring(0, 3).toUpperCase()}${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`,
    supervisor_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    supervisor_employee_number: `EMP${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`,
    email_address: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@sharpmedian.com`,
    date_of_birth: new Date(
      1970 + Math.floor(Math.random() * 35),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    )
      .toISOString()
      .split("T")[0],
    gender: gender,
    ethnicity: ethnicity,
    local_currency_code: "USD",
    remote_flag: Math.random() < 0.3 ? 1 : 0, // 30% remote
  }
}

export async function POST(request: Request) {
  try {
    const { count = 200 } = await request.json()
    const recordCount = Math.min(Math.max(count, 10), 500) // Limit between 10-500 records

    console.log(`[v0] Starting Sharp Median data population with ${recordCount} records...`)

    // Clear existing data
    await sql`TRUNCATE TABLE sharp_median_employees`
    console.log("[v0] Cleared existing data")

    // Generate employee data
    const employees = []
    for (let i = 1; i <= recordCount; i++) {
      employees.push(generateEmployee(i))
    }

    console.log(`[v0] Generated ${employees.length} employee records, starting batch insertion...`)

    // Insert in batches of 25 for optimal performance
    const batchSize = 25
    let insertedCount = 0

    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize)

      try {
        // Use batch insert for better performance
        for (const emp of batch) {
          await sql`
            INSERT INTO sharp_median_employees (
              employee_id, employee_name, job_title, department, salary_or_hourly,
              annual_salary, hourly_rate, original_hire_date, last_hire_date, seniority_date,
              termination_date, termination_type, termination_reason, termination_reason_code,
              employee_status, employee_type, organization, company, location, address_work,
              city_work, state_work, postal_code_work, country_work, address_home, city_home,
              state_home, postal_code_home, country_home, region, job_code, supervisor_name,
              supervisor_employee_number, email_address, date_of_birth, gender, ethnicity,
              local_currency_code, remote_flag
            ) VALUES (
              ${emp.employee_id}, ${emp.employee_name}, ${emp.job_title}, ${emp.department}, ${emp.salary_or_hourly},
              ${emp.annual_salary}, ${emp.hourly_rate}, ${emp.original_hire_date}, ${emp.last_hire_date}, ${emp.seniority_date},
              ${emp.termination_date}, ${emp.termination_type}, ${emp.termination_reason}, ${emp.termination_reason_code},
              ${emp.employee_status}, ${emp.employee_type}, ${emp.organization}, ${emp.company}, ${emp.location}, ${emp.address_work},
              ${emp.city_work}, ${emp.state_work}, ${emp.postal_code_work}, ${emp.country_work}, ${emp.address_home}, ${emp.city_home},
              ${emp.state_home}, ${emp.postal_code_home}, ${emp.country_home}, ${emp.region}, ${emp.job_code}, ${emp.supervisor_name},
              ${emp.supervisor_employee_number}, ${emp.email_address}, ${emp.date_of_birth}, ${emp.gender}, ${emp.ethnicity},
              ${emp.local_currency_code}, ${emp.remote_flag}
            )
          `
          insertedCount++
        }

        console.log(
          `[v0] Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(employees.length / batchSize)} (${insertedCount}/${employees.length} records)`,
        )
      } catch (error) {
        console.error(`[v0] Error inserting batch starting at record ${i + 1}:`, error)
      }
    }

    // Verify the data was inserted
    const result = await sql`SELECT COUNT(*) as count FROM sharp_median_employees`
    const totalCount = result[0].count

    console.log(`[v0] Data population complete. Total records: ${totalCount}`)

    return Response.json({
      success: true,
      message: `Successfully populated ${insertedCount} employee records`,
      totalRecords: totalCount,
      requestedCount: recordCount,
    })
  } catch (error) {
    console.error("[v0] Error populating Sharp Median data:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
