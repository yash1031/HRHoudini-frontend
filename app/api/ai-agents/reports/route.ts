// app/api/ai-agents/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ai-agents/reports?session_id=...
 * Fetches all reports for a given session_id
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const session_id = searchParams.get('session_id');
    const authHeader = request.headers.get("authorization");

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: session_id' },
        { status: 400 }
      );
    }

    // Forward to Lambda via backend domain
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/ai-agents/reports?session_id=${encodeURIComponent(session_id)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { authorization: authHeader } : {})
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch reports' }));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch reports' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in ai-agents/reports API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
