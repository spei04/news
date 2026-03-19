import type { CandidateItem, DigestCategory, FeedSource } from "./types";
import { CATEGORY_DEFS } from "./categories";

export function normalizeUrl(u: string) {
  try {
    const url = new URL(u);
    url.hash = "";
    // Strip the usual tracking params.
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "ref_src"].forEach(
      (k) => url.searchParams.delete(k)
    );
    // Preserve other params because some sites use them for canonical identity.
    return url.toString();
  } catch {
    return u;
  }
}

function keywordScore(text: string, keywords: string[]) {
  const t = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (t.includes(kw)) score += 1;
  }
  return score;
}

export function classify(item: CandidateItem, source: FeedSource): DigestCategory | null {
  const text = `${item.title}\n${item.snippet}`;
  const scored = CATEGORY_DEFS.map((c) => ({ slug: c.slug, hits: keywordScore(text, c.keywords) }));
  scored.sort((a, b) => b.hits - a.hits);
  const best = scored[0];
  if (!best || best.hits === 0) {
    // Fall back to source hint if we couldn't classify by keywords.
    return source.categoryHints[0] ?? null;
  }
  return best.slug;
}

export function scoreCandidate(item: CandidateItem, source: FeedSource, category: DigestCategory) {
  const text = `${item.title}\n${item.snippet}`;
  const now = Date.now();
  const ageHrs = (now - new Date(item.publishedAt).getTime()) / 3_600_000;
  const recency = Math.max(0, 48 - ageHrs) / 48; // 0..1 within 2 days

  const def = CATEGORY_DEFS.find((c) => c.slug === category);
  const kwHits = def ? keywordScore(text, def.keywords) : 0;

  // Source weight dominates ties; keywords separate relevance; recency avoids stale items.
  return source.weight * 10 + kwHits * 2 + recency * 4;
}
