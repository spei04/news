import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { getSubscriptionByEmail, upsertSubscriptionByEmail } from "@/lib/db/subscriptions";
import { SITE_CATEGORIES } from "@/lib/site/categories";

export const runtime = "nodejs";

const SubscriptionUpdateSchema = z.object({
  enabled: z.boolean().default(true),
  categorySlugs: z.array(z.string()).default([]),
  timezone: z.string().min(1).default("America/New_York"),
  sendHour: z.number().int().min(0).max(23).default(7)
});

export async function GET() {
  const { userId } = await auth.protect();
  const user = await currentUser();
  if (!userId || !user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  if (!email) return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 });

  const sub = await getSubscriptionByEmail(email);
  return NextResponse.json({
    ok: true,
    subscription: sub ?? {
      email,
      enabled: true,
      categorySlugs: SITE_CATEGORIES.slice(1).map((c) => c.slug),
      timezone: "America/New_York",
      sendHour: 7
    }
  });
}

export async function POST(req: Request) {
  const { userId } = await auth.protect();
  const user = await currentUser();
  if (!userId || !user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  if (!email) return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = SubscriptionUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  const allowed = new Set(SITE_CATEGORIES.map((c) => c.slug));
  const categorySlugs = parsed.data.categorySlugs.filter((s) => allowed.has(s) && s !== "all");

  const ok = await upsertSubscriptionByEmail({
    email,
    enabled: parsed.data.enabled,
    categorySlugs: categorySlugs.length ? categorySlugs : SITE_CATEGORIES.slice(1).map((c) => c.slug),
    timezone: parsed.data.timezone,
    sendHour: parsed.data.sendHour,
    userId: null
  });

  return NextResponse.json({ ok });
}
