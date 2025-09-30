import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scenarioType = searchParams.get("scenario_type")
    const userId = searchParams.get("user_id")
    const company = searchParams.get("company")

    if (!scenarioType || !userId || !company) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const configs = await sql`
      SELECT * FROM dashboard_configs 
      WHERE scenario_type = ${scenarioType} 
      AND user_id = ${userId} 
      AND company = ${company}
      ORDER BY updated_at DESC
      LIMIT 1
    `

    if (configs.length === 0) {
      // Return default config if none exists
      const defaultConfig = getDefaultConfig(scenarioType)
      return NextResponse.json({ config: defaultConfig, isDefault: true })
    }

    return NextResponse.json({ config: configs[0].config, isDefault: false })
  } catch (error) {
    console.error("Error fetching dashboard config:", error)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { scenario_type, user_id, company, config } = await request.json()

    if (!scenario_type || !user_id || !company || !config) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upsert the configuration
    const result = await sql`
      INSERT INTO dashboard_configs (scenario_type, user_id, company, config, created_at, updated_at)
      VALUES (${scenario_type}, ${user_id}, ${company}, ${JSON.stringify(config)}, NOW(), NOW())
      ON CONFLICT (scenario_type, user_id, company) 
      DO UPDATE SET 
        config = ${JSON.stringify(config)},
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json({ success: true, config: result[0] })
  } catch (error) {
    console.error("Error saving dashboard config:", error)
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 })
  }
}

function getDefaultConfig(scenarioType: string) {
  const baseConfig = {
    kpis: [
      {
        id: "turnover-rate",
        title: "Turnover Rate",
        description: "Monthly employee turnover",
        value: "2.3%",
        change: "-0.5% vs last month",
        trend: "down",
        icon: "TrendingDown",
      },
      {
        id: "engagement-score",
        title: "Engagement Score",
        description: "Employee engagement metrics",
        value: "7.8/10",
        change: "+0.3 vs last quarter",
        trend: "up",
        icon: "Users",
      },
      {
        id: "cost-per-hire",
        title: "Cost Per Hire",
        description: "Total recruiting investment",
        value: "$4,200",
        change: "-$300 vs last quarter",
        trend: "down",
        icon: "DollarSign",
      },
    ],
    layout: {
      showUrgentTask: true,
      showChat: true,
      showKpiTiles: true,
    },
    chatPrompts: [
      "What's our turnover rate by department?",
      "Show me compensation gaps",
      "Analyze engagement survey results",
    ],
  }

  // Customize based on scenario type
  if (scenarioType === "upload-only") {
    return {
      ...baseConfig,
      layout: {
        ...baseConfig.layout,
        showFileStatus: true,
        showProcessingInfo: true,
      },
      chatPrompts: [
        "What insights can you find in my uploaded data?",
        "Show me key metrics from the file",
        "What should I focus on first?",
      ],
    }
  }

  return baseConfig
}
