// app/api/dashboard/generate-html-report/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface SelectedKPI {
  kpi_id: string;
  label: string;
  description: string;
  category: string;
}

interface GenerateReportRequest {
  user_id: string;
  session_id: string;
  file_name: string;
  selected_kpis: SelectedKPI[];
}

/**
 * POST /api/dashboard/generate-html-report
 * Fetches HTML content from S3 via Lambda function
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateReportRequest = await request.json();
    const { user_id, session_id, file_name, selected_kpis } = body;
    const authHeader = request.headers.get("authorization");

    // Validate required fields
    if (!user_id || !session_id || !file_name) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, session_id, or file_name' },
        { status: 400 }
      );
    }

    // Forward to Lambda via backend domain
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/dashboard/trigger-agent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { authorization: authHeader } : {})
        },
        body: JSON.stringify({
          user_id,
          session_id,
          file_name,
          selected_kpis: selected_kpis || []
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate HTML report' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Ensure we have HTML content
    if (!data.html_content) {
      return NextResponse.json(
        { error: 'No HTML content received from backend' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in generate-html-report API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}