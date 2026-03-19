import { isoDateUTC } from "../time";
import { writeDigest } from "../storage";
import { fetchText } from "./fetch";
import { parseFeedXml } from "./rss";
import { classify, normalizeUrl, scoreCandidate } from "./rank";
import { summarizeHeuristic, summarizeWithOpenAI } from "./summarize";
import { SOURCES } from "./sources";
import { trimToTenMinutes } from "./budget";
import { SITE_CATEGORIES } from "../site/categories";
import type { CandidateItem, FeedSource } from "./types";

function withinHours(iso: string, hours: number) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return true;
  return Date.now() - t <= hours * 3_600_000;
}

function selectDiverse(
  scored: { candidate: CandidateItem; category: string; score: number }[],
  opts: { maxTotal: number; maxPerSource: number }
) {
  const out: typeof scored = [];
  const perSource = new Map<string, number>();
  for (const s of scored) {
    const n = perSource.get(s.candidate.sourceId) ?? 0;
    if (n >= opts.maxPerSource) continue;
    out.push(s);
    perSource.set(s.candidate.sourceId, n + 1);
    if (out.length >= opts.maxTotal) break;
  }
  return out;
}

export async function runAllDailyDigests(opts?: { date?: string; maxAgeHours?: number; maxItemsPerCategory?: number }) {
  const date = opts?.date ?? isoDateUTC(new Date());
  const maxAgeHours = opts?.maxAgeHours ?? 72;
  const maxItemsPerCategory = opts?.maxItemsPerCategory ?? 10;

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
    const score = scoreCandidate(c, source, category);
    scored.push({ candidate: c, category, score });
  }

  scored.sort((a, b) => b.score - a.score);

  const results: { categorySlug: string; items: number }[] = [];

  for (const cat of SITE_CATEGORIES) {
    const categorySlug = cat.slug;
    const slice = categorySlug === "all" ? scored : scored.filter((s) => s.category === categorySlug);
    const top = selectDiverse(slice, {
      // LLM/heuristics get more varied candidates to avoid a single source (e.g., arXiv) dominating.
      maxTotal: 60,
      maxPerSource: categorySlug === "ai-ml" ? 6 : 8
    });

    const llmItems = await summarizeWithOpenAI(top, { maxItems: maxItemsPerCategory, date, categorySlug });
    const items = llmItems ?? (await summarizeHeuristic(top.slice(0, maxItemsPerCategory * 2)));

    const trimmed = trimToTenMinutes(items);
    const digest = {
      date,
      generatedAt: new Date().toISOString(),
      items: trimmed.items.slice(0, maxItemsPerCategory),
      stats: {
        totalFetched: candidates.length,
        totalCandidates: slice.length,
        totalItems: Math.min(trimmed.items.length, maxItemsPerCategory),
        sources: perSourceCounts,
        wordCount: trimmed.wordCount,
        estimatedReadMinutes: trimmed.estimatedReadMinutes
      }
    };

    await writeDigest(digest, categorySlug);
    results.push({ categorySlug, items: digest.items.length });
  }

  return { results };
}
