import { NextResponse } from "next/server";
import { upsertSubscriptionByEmail } from "@/lib/db/subscriptions";
import { SITE_CATEGORIES } from "@/lib/site/categories";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim();
  if (!email) return NextResponse.redirect(new URL("/", req.url), 303);

  // If Postgres is configured, store a lightweight pre-auth subscription.
  if (process.env.DATABASE_URL) {
    await upsertSubscriptionByEmail({
      email,
      enabled: true,
      categorySlugs: SITE_CATEGORIES.slice(1).map((c) => c.slug),
      timezone: "America/New_York",
      sendHour: 7,
      userId: null
    });
  }

  return NextResponse.redirect(new URL(`/register?email=${encodeURIComponent(email)}`, req.url), 303);
}
