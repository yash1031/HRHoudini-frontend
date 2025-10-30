import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {fileName, fileType, userId} = body;
    const authHeader = req.headers.get("authorization");
    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      );
    }
    if (!fileType) {
      return NextResponse.json(
        { error: "fileType is required" },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/uploads/session`,
        // `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/upload-docs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json",
            ...(authHeader ? { authorization: authHeader } : {}) },
          body: JSON.stringify({
            fileName: fileName,
            fileType: fileType,
            userId: userId,
          }),
        }
      );

    const data = await response.json();

    return NextResponse.json(
        { success: true, data },
        { status: response.status }
      );
    } catch (error: any) {
      console.error("Error generating response", error);
      return NextResponse.json(
        { error: "Error generating response" },
        { status: 500 }
      );
    }
}
