import type { Digest } from "@/lib/digest";
import { SITE_CATEGORIES } from "@/lib/site/categories";
import { countWords, estimateReadMinutesFromWords } from "@/lib/time";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderDigestEmail(opts: {
  digest: Digest;
  categorySlugs: string[];
  siteUrl: string;
  toEmail: string;
}) {
  const catName = (slug: string) => SITE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  const allowed = new Set(opts.categorySlugs);
  const items = opts.digest.items.filter((it) => allowed.has(it.category));

  const title = `Your NewsHub Digest (${opts.digest.date})`;
  const intro =
    items.length > 0
      ? `Here are ${items.length} picks from your selected categories: ${opts.categorySlugs.map(catName).join(", ")}.`
      : `No picks matched your selected categories today. You can update your preferences on NewsHub.`;

  const viewUrl = `${opts.siteUrl.replace(/\/$/, "")}/`;
  const settingsUrl = `${opts.siteUrl.replace(/\/$/, "")}/settings`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
  </head>
  <body style="margin:0;background:#f3f4f6;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:24px 14px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 18px 14px;">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;">Daily briefing</div>
        <div style="font-size:26px;font-weight:800;color:#111827;margin-top:6px;">NewsHub Digest</div>
        <div style="color:#6b7280;margin-top:6px;line-height:1.5;">${esc(intro)}</div>
        <div style="margin-top:10px;color:#6b7280;font-size:13px;">Estimated read: ${opts.digest.stats.estimatedReadMinutes} min · Date: ${opts.digest.date}</div>
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
          <a href="${esc(viewUrl)}" style="background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:10px 12px;border-radius:10px;display:inline-block;">View on site</a>
          <a href="${esc(settingsUrl)}" style="border:1px solid #d1d5db;color:#111827;text-decoration:none;font-weight:700;padding:10px 12px;border-radius:10px;display:inline-block;">Edit preferences</a>
        </div>
      </div>

      <div style="margin-top:14px;">
        ${items
          .map((it) => {
            const bullets = it.summary.slice(0, 2).map((b) => `<li style="margin:6px 0;color:#111827;">${esc(b)}</li>`).join("");
            const cat = catName(it.category);
            return `<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin:10px 0;">
              <div style="font-size:12px;color:#6b7280;font-weight:700;">${esc(cat)} · ${esc(it.source)}</div>
              <div style="margin-top:6px;font-size:16px;font-weight:800;line-height:1.3;">
                <a href="${esc(it.url)}" style="color:#111827;text-decoration:none;">${esc(it.title)}</a>
              </div>
              <ul style="margin:10px 0 0 18px;padding:0;">${bullets}</ul>
              <div style="margin-top:10px;color:#6b7280;font-size:13px;line-height:1.45;">${esc(it.whyItMatters)}</div>
            </div>`;
          })
          .join("")}
      </div>

      <div style="color:#9ca3af;font-size:12px;margin-top:14px;text-align:center;">
        Sent to ${esc(opts.toEmail)} · <a href="${esc(settingsUrl)}" style="color:#6b7280;">Manage subscription</a>
      </div>
    </div>
  </body>
</html>`;

  const textLines = [
    title,
    "",
    intro,
    "",
    `View: ${viewUrl}`,
    `Settings: ${settingsUrl}`,
    "",
    ...items.flatMap((it) => [
      `${catName(it.category)} · ${it.source}`,
      it.title,
      it.url,
      ...it.summary.slice(0, 2).map((b) => `- ${b}`),
      `Why: ${it.whyItMatters}`,
      ""
    ])
  ];

  return { subject: title, html, text: textLines.join("\n") };
}

export function renderSubscriptionEmail(opts: {
  digestsByCategory: Record<string, Digest | null>;
  categorySlugs: string[];
  siteUrl: string;
  toEmail: string;
}) {
  const catName = (slug: string) => SITE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
  const allowed = opts.categorySlugs.filter((s) => s !== "all");
  const sections = allowed
    .map((slug) => ({ slug, digest: opts.digestsByCategory[slug] }))
    .filter((x) => x.digest && x.digest.items.length > 0) as { slug: string; digest: Digest }[];

  const itemsForStats = sections.flatMap((s) => s.digest.items.slice(0, 6));
  const wordCount =
    80 +
    itemsForStats.reduce(
      (acc, it) => acc + countWords(it.title) + it.summary.reduce((a, b) => a + countWords(b), 0) + countWords(it.whyItMatters),
      0
    );
  const estimatedReadMinutes = estimateReadMinutesFromWords(wordCount);

  const title = `Your NewsHub Digest (${sections[0]?.digest.date ?? "Today"})`;
  const intro = sections.length
    ? `Your selected categories: ${allowed.map(catName).join(", ")}.`
    : `No category digests are available yet.`;

  const viewUrl = `${opts.siteUrl.replace(/\/$/, "")}/`;
  const settingsUrl = `${opts.siteUrl.replace(/\/$/, "")}/settings`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
  </head>
  <body style="margin:0;background:#f3f4f6;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:720px;margin:0 auto;padding:24px 14px;">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 18px 14px;">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;">Daily briefing</div>
        <div style="font-size:26px;font-weight:800;color:#111827;margin-top:6px;">NewsHub Digest</div>
        <div style="color:#6b7280;margin-top:6px;line-height:1.5;">${esc(intro)}</div>
        <div style="margin-top:10px;color:#6b7280;font-size:13px;">Estimated read: ${estimatedReadMinutes} min</div>
        <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
          <a href="${esc(viewUrl)}" style="background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:10px 12px;border-radius:10px;display:inline-block;">View on site</a>
          <a href="${esc(settingsUrl)}" style="border:1px solid #d1d5db;color:#111827;text-decoration:none;font-weight:700;padding:10px 12px;border-radius:10px;display:inline-block;">Edit preferences</a>
        </div>
      </div>

      <div style="margin-top:14px;">
        ${sections
          .map((section) => {
            const items = section.digest.items.slice(0, 5);
            return `<div style="margin:14px 0 6px 2px;font-weight:800;color:#111827;">${esc(catName(section.slug))}</div>
              ${items
                .map((it) => {
                  const bullets = it.summary
                    .slice(0, 2)
                    .map((b) => `<li style="margin:6px 0;color:#111827;">${esc(b)}</li>`)
                    .join("");
                  return `<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin:10px 0;">
                    <div style="font-size:12px;color:#6b7280;font-weight:700;">${esc(it.source)}</div>
                    <div style="margin-top:6px;font-size:16px;font-weight:800;line-height:1.3;">
                      <a href="${esc(it.url)}" style="color:#111827;text-decoration:none;">${esc(it.title)}</a>
                    </div>
                    <ul style="margin:10px 0 0 18px;padding:0;">${bullets}</ul>
                    <div style="margin-top:10px;color:#6b7280;font-size:13px;line-height:1.45;">${esc(it.whyItMatters)}</div>
                  </div>`;
                })
                .join("")}`;
          })
          .join("")}
      </div>

      <div style="color:#9ca3af;font-size:12px;margin-top:14px;text-align:center;">
        Sent to ${esc(opts.toEmail)} · <a href="${esc(settingsUrl)}" style="color:#6b7280;">Manage subscription</a>
      </div>
    </div>
  </body>
</html>`;

  const textLines = [
    title,
    "",
    intro,
    "",
    `View: ${viewUrl}`,
    `Settings: ${settingsUrl}`,
    "",
    ...sections.flatMap((section) => {
      const lines: string[] = [`== ${catName(section.slug)} ==`];
      for (const it of section.digest.items.slice(0, 5)) {
        lines.push(`${it.source}`);
        lines.push(it.title);
        lines.push(it.url);
        lines.push(...it.summary.slice(0, 2).map((b) => `- ${b}`));
        lines.push(`Why: ${it.whyItMatters}`);
        lines.push("");
      }
      return lines;
    })
  ];

  return { subject: title, html, text: textLines.join("\n") };
}
