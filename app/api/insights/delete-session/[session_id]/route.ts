import { NextRequest, NextResponse } from 'next/server';


export async function DELETE(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const session_id = params.session_id;
    
    // Get user_id from query params or auth context
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'MISSING_PARAMETER', message: 'user_id is required' },
        { status: 400 }
      );
    }
    
    // Call Lambda API
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/sessions/${session_id}?user_id=${user_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        errorData,
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to delete session' },
      { status: 500 }
    );
  }
}