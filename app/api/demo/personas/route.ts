import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * Make sure the referenced tables exist so the first request
 * after installing the app doesn't crash with "relation … does not exist".
 * This runs very fast on Neon ― `CREATE TABLE IF NOT EXISTS` is a no-op
 * when the table is already present.
 */
async function ensureTables() {
  // Companies (needed for the FK below)
  await sql`
    CREATE TABLE IF NOT EXISTS demo_companies (
      id           SERIAL PRIMARY KEY,
      name         TEXT        NOT NULL,
      industry     TEXT,
      size         INTEGER,
      logo_url     TEXT,
      color        TEXT        DEFAULT '#3496D8',
      description  TEXT,
      sort_order   INTEGER     DEFAULT 0,
      is_active    BOOLEAN     DEFAULT TRUE,
      created_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Personas with expanded fields including AI-related attributes
  await sql`
    CREATE TABLE IF NOT EXISTS demo_personas (
      id                      SERIAL PRIMARY KEY,
      company_id              INTEGER      REFERENCES demo_companies(id) ON DELETE CASCADE,
      name                    VARCHAR(255) NOT NULL,
      role                    VARCHAR(255) NOT NULL,
      avatar_url              TEXT,
      description             TEXT,
      login_hint              TEXT,
      sort_order              INTEGER      DEFAULT 0,
      is_active               BOOLEAN      DEFAULT TRUE,
      created_at              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    );
  `

  // --- NEW: make sure newer columns exist on an older table --------------
  await sql`ALTER TABLE demo_personas ADD COLUMN IF NOT EXISTS trust_level_with_ai  TEXT[];`
  await sql`ALTER TABLE demo_personas ADD COLUMN IF NOT EXISTS comfort_with_ai      TEXT[];`
  await sql`ALTER TABLE demo_personas ADD COLUMN IF NOT EXISTS primary_tasks        TEXT;`
  await sql`ALTER TABLE demo_personas ADD COLUMN IF NOT EXISTS top_concerns         TEXT;`
  // -----------------------------------------------------------------------
}

export async function GET(request: NextRequest) {
  await ensureTables()
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("company_id")

    let personas
    if (companyId) {
      personas = await sql`
        SELECT p.*, c.name as company_name, c.size as company_size, c.industry as company_industry
        FROM demo_personas p
        JOIN demo_companies c ON p.company_id = c.id
        WHERE p.company_id = ${companyId} AND p.is_active = true
        ORDER BY p.sort_order, p.name
      `
    } else {
      personas = await sql`
        SELECT p.*, c.name as company_name, c.size as company_size, c.industry as company_industry
        FROM demo_personas p
        LEFT JOIN demo_companies c ON p.company_id = c.id
        WHERE p.is_active = true
        ORDER BY c.name, p.sort_order, p.name
      `
    }

    return NextResponse.json(personas)
  } catch (error: any) {
    console.error("Error fetching demo personas:", error)
    return NextResponse.json({ error: "Failed to fetch personas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await ensureTables()
  try {
    const data = await request.json()

    const result = await sql`
      INSERT INTO demo_personas (
        company_id, name, role, avatar_url, description, login_hint,
        trust_level_with_ai, comfort_with_ai, primary_tasks, top_concerns,
        sort_order, is_active
      )
      VALUES (
        ${data.company_id}, ${data.name}, ${data.role}, ${data.avatar_url || null}, 
        ${data.description || null}, ${data.login_hint || null},
        ${JSON.stringify(data.trust_level_with_ai || [])}, ${JSON.stringify(data.comfort_with_ai || [])},
        ${data.primary_tasks || null}, ${data.top_concerns || null},
        ${data.sort_order || 0}, ${data.is_active ?? true}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating demo persona:", error)
    return NextResponse.json({ error: "Failed to create persona" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  await ensureTables()
  try {
    const data = await request.json()

    const result = await sql`
      UPDATE demo_personas 
      SET 
        company_id = ${data.company_id},
        name = ${data.name},
        role = ${data.role},
        avatar_url = ${data.avatar_url || null},
        description = ${data.description || null},
        login_hint = ${data.login_hint || null},
        trust_level_with_ai = ${JSON.stringify(data.trust_level_with_ai || [])},
        comfort_with_ai = ${JSON.stringify(data.comfort_with_ai || [])},
        primary_tasks = ${data.primary_tasks || null},
        top_concerns = ${data.top_concerns || null},
        sort_order = ${data.sort_order || 0},
        is_active = ${data.is_active ?? true},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${data.id}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating demo persona:", error)
    return NextResponse.json({ error: "Failed to update persona" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  await ensureTables()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM demo_personas WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting demo persona:", error)
    return NextResponse.json({ error: "Failed to delete persona" }, { status: 500 })
  }
}
