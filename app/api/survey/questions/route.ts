import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Forward to Lambda
    // const lambdaUrl = process.env.NEXT_PUBLIC_SURVEY_API_URL;
    
    const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/survey/questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch questions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in questions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}