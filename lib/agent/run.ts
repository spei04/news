import { isoDateUTC } from "../time";
import { writeDigest } from "../storage";
import { fetchText } from "./fetch";
import { parseFeedXml } from "./rss";
import { classify, normalizeUrl, scoreCandidate } from "./rank";
import { SOURCES } from "./sources";
import { summarizeHeuristic, summarizeWithOpenAI } from "./summarize";
import type { CandidateItem, DigestItem, FeedSource } from "./types";
import { trimToTenMinutes } from "./budget";

function withinHours(iso: string, hours: number) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  return Date.now() - t <= hours * 3_600_000;
}

export async function runDailyDigest(opts?: {
  date?: string;
  maxAgeHours?: number;
  maxItems?: number;
  categorySlug?: string; // "all" or a specific category slug
}) {
  const date = opts?.date ?? isoDateUTC(new Date());
  const maxAgeHours = opts?.maxAgeHours ?? 72;
  const maxItems = opts?.maxItems ?? 10;
  const categorySlug = opts?.categorySlug ?? "all";

  const sourcesById = new Map<string, FeedSource>(SOURCES.map((s) => [s.id, s]));
  const perSourceCounts: Record<string, number> = {};

  const candidates: CandidateItem[] = [];
  for (const source of SOURCES) {
    try {
      const xml = await fetchText(source.feedUrl);
      const items = parseFeedXml(xml, source);
      perSourceCounts[source.name] = items.length;
      candidates.push(...items);
    } catch {
      perSourceCounts[source.name] = 0;
    }
  }

  const seen = new Set<string>();
  const scored: { candidate: CandidateItem; category: string; score: number }[] = [];
  for (const c of candidates) {
    if (!withinHours(c.publishedAt, maxAgeHours)) continue;
    const url = normalizeUrl(c.url);
    if (seen.has(url)) continue;
    seen.add(url);
    c.url = url;

    const source = sourcesById.get(c.sourceId);
    if (!source) continue;
    const category = classify(c, source);
    if (!category) continue;
    if (categorySlug !== "all" && category !== categorySlug) continue;
    const score = scoreCandidate(c, source, category);
    scored.push({ candidate: c, category, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 40);

  const llmItems = await summarizeWithOpenAI(top, { maxItems, date, categorySlug });
  const items = llmItems ?? (await summarizeHeuristic(top.slice(0, maxItems * 2)));

  // Always apply 10-minute budget, even if LLM returns more than desired.
  const trimmed = trimToTenMinutes(items);

  const digest = {
    date,
    generatedAt: new Date().toISOString(),
    items: trimmed.items
      .slice(0, maxItems)
      .sort((a, b) => {
        // Keep categories mixed but roughly in score order.
        if (b.score !== a.score) return b.score - a.score;
        return b.publishedAt.localeCompare(a.publishedAt);
      }),
    stats: {
      totalFetched: candidates.length,
      totalCandidates: scored.length,
      totalItems: Math.min(trimmed.items.length, maxItems),
      sources: perSourceCounts,
      wordCount: trimmed.wordCount,
      estimatedReadMinutes: trimmed.estimatedReadMinutes
    }
  };

  const paths = await writeDigest(digest, categorySlug);
  return { digest, paths };
}
