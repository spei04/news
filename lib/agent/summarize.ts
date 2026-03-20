import OpenAI from "openai";
import type { CandidateItem, DigestCategory, DigestItem } from "./types";
import { CATEGORY_DEFS } from "./categories";

function toBullets(snippet: string) {
  const s = snippet.replace(/\s+/g, " ").trim();
  if (!s) return [];
  // Prefer sentence-ish splits; fall back to truncation.
  const parts = s.split(/(?<=[.!?])\s+/).filter(Boolean);
  const bullets = parts.slice(0, 4).map((p) => p.replace(/^[-*•\s]+/, "").trim());
  return bullets
    .map((b) => (b.length > 160 ? b.slice(0, 157).trimEnd() + "..." : b))
    .filter(Boolean)
    .slice(0, 3);
}

function defaultWhy(category: DigestCategory, title: string) {
  const name = CATEGORY_DEFS.find((c) => c.slug === category)?.name ?? category;
  if (category === "ai-ml") return `Track this if you're watching model capability, evaluation, or deployment shifts: ${title}`;
  if (category === "startups") return `Track this if you care about funding and company-building signals: ${title}`;
  if (category === "finance") return `Track this if you care about markets and macro implications: ${title}`;
  if (category === "politics") return `Track this if you care about regulation and policy shifts: ${title}`;
  if (category === "entertainment") return `Track this if you care about media and culture shifts: ${title}`;
  return `A notable update in ${name}: ${title}`;
}

export async function summarizeHeuristic(
  items: { candidate: CandidateItem; category: DigestCategory; score: number }[]
): Promise<DigestItem[]> {
  return items.map(({ candidate, category, score }) => {
    const summary = toBullets(candidate.snippet);
    return {
      id: `${candidate.sourceId}:${Buffer.from(candidate.url).toString("base64url").slice(0, 18)}`,
      title: candidate.title,
      url: candidate.url,
      source: candidate.sourceName,
      publishedAt: candidate.publishedAt,
      category,
      score,
      summary: summary.length ? summary : [candidate.title],
      whyItMatters: defaultWhy(category, candidate.title)
    };
  });
}

export async function summarizeWithOpenAI(
  items: { candidate: CandidateItem; category: DigestCategory; score: number }[],
  opts: { maxItems: number; date: string; categorySlug: string }
): Promise<DigestItem[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({ apiKey });
  const payload = items.slice(0, 40).map((x) => ({
    title: x.candidate.title,
    url: x.candidate.url,
    source: x.candidate.sourceName,
    publishedAt: x.candidate.publishedAt,
    category: x.category,
    snippet: x.candidate.snippet.slice(0, 500),
    score: x.score
  }));

  const prompt = [
    "You are an editor creating a DAILY DIGEST for a busy reader.",
    `Date: ${opts.date}`,
    opts.categorySlug === "all"
      ? `Pick up to ${opts.maxItems} total items across these categories: ${CATEGORY_DEFS.map((c) => `${c.slug} (${c.name})`).join(", ")}.`
      : `Pick up to ${opts.maxItems} total items ONLY for category ${opts.categorySlug}.`,
    "Hard constraint: the entire digest must be readable in under 10 minutes.",
    "For each selected item, write 3 bullet points (tight, factual) and one short 'why it matters' sentence.",
    "Avoid hype, avoid speculation, no more than ~55 words per item total.",
    "Return STRICT JSON with shape: { items: Array<{ url, category, summary: string[], whyItMatters: string }> }",
    "",
    "Candidates:",
    JSON.stringify(payload)
  ].join("\n");

  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }]
  });

  const content = res.choices[0]?.message?.content ?? "";
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start < 0 || end < 0) return null;

  let json: any;
  try {
    json = JSON.parse(content.slice(start, end + 1));
  } catch {
    return null;
  }

  const byUrl = new Map(items.map((x) => [x.candidate.url, x]));
  const out: DigestItem[] = [];

  for (const it of Array.isArray(json?.items) ? json.items : []) {
    const hit = byUrl.get(it?.url);
    if (!hit) continue;
    const summary = Array.isArray(it?.summary) ? it.summary.map(String) : [];
    const whyItMatters = typeof it?.whyItMatters === "string" ? it.whyItMatters : defaultWhy(hit.category, hit.candidate.title);
    out.push({
      id: `${hit.candidate.sourceId}:${Buffer.from(hit.candidate.url).toString("base64url").slice(0, 18)}`,
      title: hit.candidate.title,
      url: hit.candidate.url,
      source: hit.candidate.sourceName,
      publishedAt: hit.candidate.publishedAt,
      category: hit.category,
      score: hit.score,
      summary: summary.slice(0, 3),
      whyItMatters
    });
  }

  return out.length ? out : null;
}
