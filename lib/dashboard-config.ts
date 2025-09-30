export interface DashboardKPI {
  id: string
  title: string
  description: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: string
  color?: string
}

export interface DashboardLayout {
  showUrgentTask: boolean
  showChat: boolean
  showKpiTiles: boolean
  showFileStatus?: boolean
  showProcessingInfo?: boolean
}

export interface DashboardConfig {
  kpis: { [key: string]: DashboardKPI }
  selectedKPIs: string[]
  selectedLens: string
  selectedTimePeriod: string
  layout: DashboardLayout
  chatPrompts: string[]
  context: {
    persona: string
    company: string
  }
  chatPlaceholder: string
  fileUploadStatus?: {
    fileName: string
    recordCount: number
    status: "processing" | "completed" | "error"
  }
}

export async function fetchDashboardConfig(
  scenarioType: string,
  userId: string,
  company: string,
): Promise<DashboardConfig> {
  try {
    const response = await fetch(
      `/api/dashboard-configs?scenario_type=${scenarioType}&user_id=${userId}&company=${company}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard config")
    }

    const data = await response.json()
    return data.config
  } catch (error) {
    console.error("Error fetching dashboard config:", error)
    // Return fallback config
    return getDefaultDashboardConfig(scenarioType)
  }
}

export async function saveDashboardConfig(
  scenarioType: string,
  userId: string,
  company: string,
  config: DashboardConfig,
): Promise<boolean> {
  try {
    const response = await fetch("/api/dashboard-configs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scenario_type: scenarioType,
        user_id: userId,
        company: company,
        config: config,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error saving dashboard config:", error)
    return false
  }
}

export function getDefaultDashboardConfig(scenarioType: string, persona?: string, company?: string): any {
  // Enhanced default config for dashboard component compatibility
  const baseKpis = {
    "turnover-rate": {
      title: "Turnover Rate",
      description: "Monthly employee turnover",
      value: "2.3%",
      change: "-0.5% vs last month",
      color: "text-orange-600",
      icon: "TrendingDown",
    },
    "engagement-score": {
      title: "Engagement Score",
      description: "Employee engagement metrics",
      value: "7.8/10",
      change: "+0.3 vs last quarter",
      color: "text-purple-600",
      icon: "Users",
    },
    "cost-per-hire": {
      title: "Cost Per Hire",
      description: "Total recruiting investment",
      value: "$4,200",
      change: "-$300 vs last quarter",
      color: "text-blue-600",
      icon: "DollarSign",
    },
    "total-headcount": {
      title: "Total Headcount",
      description: "Active employees",
      value: "1,247",
      change: "Current staff",
      color: "text-indigo-600",
      icon: "Users",
    },
  }

  const config = {
    kpis: baseKpis,
    selectedKPIs: ["turnover-rate", "engagement-score", "cost-per-hire", "total-headcount"],
    selectedLens: "census",
    selectedTimePeriod: "last_quarter",
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
    context: {
      persona: persona || "hr-generalist",
      company: company || "default",
    },
    chatPlaceholder: "Ask questions about your HR data...",
  }

  if (scenarioType === "upload-only") {
    return {
      ...config,
      fileUploadStatus: {
        fileName: "employee_data_2024.xlsx",
        recordCount: 1247,
        status: "completed",
      },
      chatPlaceholder: "Ask about your uploaded data insights...",
    }
  }

  return config
}

export async function getDashboardConfig(scenarioType: string, userId: string, company: string): Promise<any> {
  try {
    const response = await fetch(
      `/api/dashboard-configs?scenario_type=${scenarioType}&user_id=${userId}&company=${company}`,
    )

    if (!response.ok) {
      return null // Return null if no config found, let caller handle default
    }

    const data = await response.json()
    return data.config
  } catch (error) {
    console.error("Error fetching dashboard config:", error)
    return null
  }
}
