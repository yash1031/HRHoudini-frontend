"use server"

import { getSharpMedianInsights, getSharpMedianEmployees } from "@/lib/sharp-median-db"

export async function getSharpMedianInsightsAction() {
  try {
    console.log("[v0] Server action: Getting Sharp Median insights")
    const insights = await getSharpMedianInsights()
    console.log("[v0] Server action: Successfully got insights")
    return { success: true, data: insights }
  } catch (error) {
    console.error("[v0] Server action error getting insights:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getSharpMedianEmployeesAction() {
  try {
    console.log("[v0] Server action: Getting Sharp Median employees")
    const employees = await getSharpMedianEmployees()
    console.log("[v0] Server action: Successfully got employees, count:", employees.length)
    return { success: true, data: employees }
  } catch (error) {
    console.error("[v0] Server action error getting employees:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
