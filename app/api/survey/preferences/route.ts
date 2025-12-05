import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, never_show_again } = body;
    const authHeader = request.headers.get("authorization");

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Forward to Lambda
    // const lambdaUrl = process.env.NEXT_PUBLIC_SURVEY_API_URL;
    
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/survey/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
            ...(authHeader ? { authorization: authHeader } : {}) 
      },
      body: JSON.stringify({
        user_id: user_id,
        never_show_again: never_show_again || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to update preference' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in preferences API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}