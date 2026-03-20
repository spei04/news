import { NextResponse } from "next/server";
import { runAllDailyDigests } from "@/lib/agent/runAll";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();
  return token === secret || querySecret === secret || ua.includes("vercel-cron/1.0");
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return unauthorized();
  const { results } = await runAllDailyDigests();
  return NextResponse.json({ ok: true, results });
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
