import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {user_id} = body;
    // Get headers from the incoming request
    const headers = req.headers;
    
    // Access specific headers
    const authorization = headers.get('authorization');

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const responseCurrentPlan = await fetch(
        `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/subscriptions/usage?user_id=${user_id}`,
        {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
            ...(authorization && { authorization }),
          },
        }
      );

    // const response= await responseCurrentPlan;
    // const data = await response.json();
    const data = await responseCurrentPlan.json();

      return NextResponse.json(
          { success: true, data },
          { status: responseCurrentPlan.status }
          // { status: response.status }
        );
  } catch (error: any) {
    console.error("Error generating response", error);
    return NextResponse.json(
      { error: "Error generating response" },
      { status: 500 }
    );
  }
}
