import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Return default demo settings
    const settings = {
      autoRefresh: false,
      mockResponses: true,
      debugMode: false,
      maxScenarios: 10,
    }

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // In a real implementation, you would save these settings to a database
    // For now, we'll just return the settings that were sent

    return NextResponse.json({ success: true, settings: body })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
