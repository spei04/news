import { NextResponse } from "next/server";
import { runAllDailyDigests } from "@/lib/agent/runAll";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return unauthorized();

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (token !== secret) return unauthorized();

  const { results } = await runAllDailyDigests();
  return NextResponse.json({ ok: true, results });
}
