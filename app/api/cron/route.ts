import { NextResponse } from "next/server";
import { runAllDailyDigests } from "@/lib/agent/runAll";
import { Resend } from "resend";
import { listActiveSubscriptions } from "@/lib/db/subscriptions";
import { readLatestDigests } from "@/lib/storage";
import { renderSubscriptionEmail } from "@/lib/email/digestEmail";

export const runtime = "nodejs";

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret") ?? "";
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();

  // Vercel Cron Jobs send GET requests with `vercel-cron/1.0` user-agent.
  const isVercelCron = ua.includes("vercel-cron/1.0");
  return bearer === secret || querySecret === secret || isVercelCron;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const digests = await runAllDailyDigests();

  // Optional: send subscription emails if configured.
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const siteUrl = process.env.SITE_URL ?? "";
  if (!resendKey || !from || !siteUrl) {
    return NextResponse.json({ ok: true, digests, emailed: { ok: false, reason: "email_not_configured" } });
  }

  const subs = await listActiveSubscriptions();
  const uniqueSlugs = Array.from(new Set(subs.flatMap((s) => s.categorySlugs))).filter((s) => s && s !== "all");
  const digestsByCategory = await readLatestDigests(uniqueSlugs);
  const resend = new Resend(resendKey);

  let sent = 0;
  let failed = 0;
  const batchSize = 10;
  for (let i = 0; i < subs.length; i += batchSize) {
    const batch = subs.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (sub) => {
        try {
          const email = renderSubscriptionEmail({
            digestsByCategory,
            categorySlugs: sub.categorySlugs,
            siteUrl,
            toEmail: sub.email
          });
          await resend.emails.send({ from, to: sub.email, subject: email.subject, html: email.html, text: email.text });
          sent += 1;
        } catch {
          failed += 1;
        }
      })
    );
  }

  return NextResponse.json({ ok: true, digests, emailed: { ok: true, sent, failed, total: subs.length } });
}

