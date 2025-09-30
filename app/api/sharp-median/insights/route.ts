import { NextResponse } from "next/server"
import { getSharpMedianInsights } from "@/lib/sharp-median-db"

export async function GET() {
  try {
    const insights = await getSharpMedianInsights()
    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error fetching Sharp Median insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}
