import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, answers, never_show_again } = body;
    const authHeader = request.headers.get("authorization");

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers must be an array' },
        { status: 400 }
      );
    }

    // Forward to Lambda
    // const lambdaUrl = process.env.NEXT_PUBLIC_SURVEY_API_URL;
    
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/survey/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
            ...(authHeader ? { authorization: authHeader } : {}) 
      },
      body: JSON.stringify({
        user_id: user_id,
        answers,
        never_show_again: never_show_again || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to submit survey' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in submit API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}