export async function GET() {
  return Response.json(
    {
      ok: true,
      uptime: process.uptime(),
      ts: new Date().toISOString(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}