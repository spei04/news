import { NextResponse } from "next/server";
import { Resend } from "resend";
import { readLatestDigests } from "@/lib/storage";
import { listActiveSubscriptions } from "@/lib/db/subscriptions";
import { renderSubscriptionEmail } from "@/lib/email/digestEmail";

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

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
  if (!resendKey || !from) {
    return NextResponse.json({ ok: false, error: "missing_email_config" }, { status: 500 });
  }

  const subs = await listActiveSubscriptions();
  const uniqueSlugs = Array.from(new Set(subs.flatMap((s) => s.categorySlugs))).filter((s) => s && s !== "all");
  const digestsByCategory = await readLatestDigests(uniqueSlugs);
  const resend = new Resend(resendKey);

  let sent = 0;
  let failed = 0;

  // Small concurrency cap to avoid hammering the email provider.
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
          await resend.emails.send({
            from,
            to: sub.email,
            subject: email.subject,
            html: email.html,
            text: email.text
          });
          sent += 1;
        } catch {
          failed += 1;
        }
      })
    );
  }

  return NextResponse.json({ ok: true, sent, failed, total: subs.length });
}
