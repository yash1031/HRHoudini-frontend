import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; 
// // if you want DB checks // import { redis } from "@/lib/redis";
export async function GET() {
  // Optional: dependency checks with tight timeouts
//   const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  // const cacheOk = await redis.ping().then(() => true).catch(() => false);
  return NextResponse.json({
    status: "ok",
    uptime: process.uptime(),
    // db: dbOk ? "ok" : "fail",// cache: cacheOk ? "ok" : "fail",version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
  }, { status: 200 });
}