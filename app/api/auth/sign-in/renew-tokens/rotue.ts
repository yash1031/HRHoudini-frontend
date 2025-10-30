// app/api/auth/sign-in/renew-tokens/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Route works!" });
}