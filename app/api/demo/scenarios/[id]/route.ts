import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { is_active } = await request.json()

    const result = await sql`
      UPDATE demo_scenarios 
      SET is_active = ${is_active}
      WHERE id = ${params.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating scenario:", error)
    return NextResponse.json({ error: "Failed to update scenario" }, { status: 500 })
  }
}
