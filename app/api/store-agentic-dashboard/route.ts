// app/api/store-agentic-dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface StoreAgenticDashboardRequest {
  user_id: string;
  org_id: string | null;
  session_id: string;
  source_file_path: string;
  report_title: string;
  report_description: string;
  report_s3_path: string;
}

/**
 * POST /api/store-agentic-dashboard
 * Stores agentic dashboard record via backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body: StoreAgenticDashboardRequest = await request.json();
    const { user_id, org_id, session_id, source_file_path, report_title, report_description, report_s3_path } = body;
    const authHeader = request.headers.get("authorization");

    // Validate required fields
    if (!user_id || !session_id || !source_file_path || !report_title || !report_description || !report_s3_path) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, session_id, source_file_path, report_title, report_description, report_s3_path' },
        { status: 400 }
      );
    }

    // Forward to Lambda via backend domain
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/dashboard/store`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { authorization: authHeader } : {})
        },
        body: JSON.stringify([{
          user_id,
          org_id,
          session_id,
          source_file_path,
          report_title,
          report_description,
          report_s3_path,
        }])
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to store agentic dashboard' }));
      return NextResponse.json(
        { error: errorData.error || 'Failed to store agentic dashboard' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in store-agentic-dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}