import { NextResponse } from "next/server"
import { getSharpMedianEmployees } from "@/lib/sharp-median-db"

export async function GET() {
  try {
    const employees = await getSharpMedianEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error fetching Sharp Median employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}
