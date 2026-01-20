// app/api/ai-agents/reports/[report_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ai-agents/reports/[report_id]
 * Fetches a single report by report_id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { report_id: string } }
) {
  try {
    const { report_id } = params;
    const authHeader = request.headers.get("authorization");

    // Validate required fields
    if (!report_id) {
      return NextResponse.json(
        { error: 'Missing required field: report_id' },
        { status: 400 }
      );
    }

    // Forward to Lambda via backend domain
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/ai-agents/reports/${report_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { authorization: authHeader } : {})
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch report' }));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch report' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in ai-agents/reports/[report_id] API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
