import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log("=== FETCHING SCENARIOS ===")

    const scenarios = await sql`
      SELECT 
        ds.*,
        dc.name as company_name
      FROM demo_scenarios ds
      LEFT JOIN demo_companies dc ON ds.company_id = dc.id
      ORDER BY ds.created_at DESC
    `

    console.log("Fetched scenarios:", scenarios.length)

    return Response.json(scenarios)
  } catch (error) {
    console.error("Error fetching scenarios:", error)
    return Response.json({ error: "Failed to fetch scenarios", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== CREATING SCENARIO ===")

    const body = await request.json()
    console.log("Request body:", body)

    // Validate required fields
    if (!body.name?.trim()) {
      return Response.json({ error: "Scenario name is required" }, { status: 400 })
    }

    if (!body.company_id) {
      return Response.json({ error: "Company ID is required" }, { status: 400 })
    }

    if (!body.target_personas || !Array.isArray(body.target_personas) || body.target_personas.length === 0) {
      return Response.json({ error: "At least one target persona is required" }, { status: 400 })
    }

    // Prepare the data for insertion
    const scenarioData = {
      name: body.name.trim(),
      description: body.description?.trim() || "",
      company_id: Number(body.company_id),
      target_personas: body.target_personas || [],
      estimated_duration: body.estimated_duration || null,
      difficulty_level: body.difficulty_level || null,
      category: body.category || null,
      is_active: body.is_active !== false,
      steps: JSON.stringify(body.steps || []),
      core_needs: JSON.stringify(body.core_needs || []),
      user_journey: JSON.stringify(body.user_journey || []),
      value_delivered: JSON.stringify(body.value_delivered || []),
      url: body.url?.trim() || null,
    }

    console.log("Prepared scenario data:", scenarioData)

    const result = await sql`
      INSERT INTO demo_scenarios (
        name, 
        description, 
        company_id, 
        target_personas, 
        estimated_duration, 
        difficulty_level, 
        category, 
        is_active, 
        steps, 
        core_needs, 
        user_journey,
        value_delivered,
        url
      ) VALUES (
        ${scenarioData.name},
        ${scenarioData.description},
        ${scenarioData.company_id},
        ${scenarioData.target_personas},
        ${scenarioData.estimated_duration},
        ${scenarioData.difficulty_level},
        ${scenarioData.category},
        ${scenarioData.is_active},
        ${scenarioData.steps}::jsonb,
        ${scenarioData.core_needs}::jsonb,
        ${scenarioData.user_journey}::jsonb,
        ${scenarioData.value_delivered}::jsonb,
        ${scenarioData.url}
      ) RETURNING *
    `

    console.log("✅ Scenario created successfully:", result[0])

    return Response.json(result[0], { status: 201 })
  } catch (error) {
    console.error("❌ Error creating scenario:", error)
    return Response.json(
      {
        error: "Failed to create scenario",
        details: error.message,
        hint: "Make sure the database migration has been run: scripts/12_add_url_column_to_demo_scenarios.sql",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    console.log("=== UPDATING SCENARIO ===")

    const body = await request.json()
    console.log("Request body:", body)

    if (!body.id) {
      return Response.json({ error: "Scenario ID is required for updates" }, { status: 400 })
    }

    // Validate required fields
    if (!body.name?.trim()) {
      return Response.json({ error: "Scenario name is required" }, { status: 400 })
    }

    if (!body.company_id) {
      return Response.json({ error: "Company ID is required" }, { status: 400 })
    }

    if (!body.target_personas || !Array.isArray(body.target_personas) || body.target_personas.length === 0) {
      return Response.json({ error: "At least one target persona is required" }, { status: 400 })
    }

    // Prepare the data for update
    const scenarioData = {
      id: Number(body.id),
      name: body.name.trim(),
      description: body.description?.trim() || "",
      company_id: Number(body.company_id),
      target_personas: body.target_personas || [],
      estimated_duration: body.estimated_duration || null,
      difficulty_level: body.difficulty_level || null,
      category: body.category || null,
      is_active: body.is_active !== false,
      steps: JSON.stringify(body.steps || []),
      core_needs: JSON.stringify(body.core_needs || []),
      user_journey: JSON.stringify(body.user_journey || []),
      value_delivered: JSON.stringify(body.value_delivered || []),
      url: body.url?.trim() || null,
    }

    console.log("Prepared scenario data for update:", scenarioData)

    const result = await sql`
      UPDATE demo_scenarios 
      SET 
        name = ${scenarioData.name},
        description = ${scenarioData.description},
        company_id = ${scenarioData.company_id},
        target_personas = ${scenarioData.target_personas},
        estimated_duration = ${scenarioData.estimated_duration},
        difficulty_level = ${scenarioData.difficulty_level},
        category = ${scenarioData.category},
        is_active = ${scenarioData.is_active},
        steps = ${scenarioData.steps}::jsonb,
        core_needs = ${scenarioData.core_needs}::jsonb,
        user_journey = ${scenarioData.user_journey}::jsonb,
        value_delivered = ${scenarioData.value_delivered}::jsonb,
        url = ${scenarioData.url},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${scenarioData.id}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Scenario not found" }, { status: 404 })
    }

    console.log("✅ Scenario updated successfully:", result[0])

    return Response.json(result[0])
  } catch (error) {
    console.error("❌ Error updating scenario:", error)
    return Response.json(
      {
        error: "Failed to update scenario",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    console.log("=== DELETING SCENARIO ===")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Scenario ID is required" }, { status: 400 })
    }

    console.log("Deleting scenario with ID:", id)

    const result = await sql`
      DELETE FROM demo_scenarios 
      WHERE id = ${Number(id)}
      RETURNING id
    `

    if (result.length === 0) {
      return Response.json({ error: "Scenario not found" }, { status: 404 })
    }

    console.log("✅ Scenario deleted successfully:", result[0])

    return Response.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("❌ Error deleting scenario:", error)
    return Response.json(
      {
        error: "Failed to delete scenario",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
