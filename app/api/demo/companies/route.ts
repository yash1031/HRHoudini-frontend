import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")

    if (name) {
      // Get specific company by name
      const companies = await sql`
        SELECT * FROM demo_companies 
        WHERE name ILIKE ${`%${name}%`}
        LIMIT 1
      `

      if (companies.length === 0) {
        return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 })
      }

      return NextResponse.json({ success: true, company: companies[0] })
    } else {
      // Get all companies
      const companies = await sql`SELECT * FROM demo_companies ORDER BY name`
      return NextResponse.json({ success: true, companies })
    }
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, industry, size, description } = body

    if (!name || !industry || !size) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO demo_companies (name, industry, size, description)
      VALUES (${name}, ${industry}, ${size}, ${description})
      RETURNING *
    `

    return NextResponse.json({ success: true, company: result[0] })
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ success: false, error: "Failed to create company" }, { status: 500 })
  }
}
