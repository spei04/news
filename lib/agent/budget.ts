import type { DigestItem } from "./types";
import { countWords, estimateReadMinutesFromWords } from "../time";

export function trimToTenMinutes(items: DigestItem[]) {
  const headerWords = 80;
  const wordCount = (it: DigestItem) =>
    countWords(it.title) + it.summary.reduce((a, b) => a + countWords(b), 0) + countWords(it.whyItMatters);

  const sorted = [...items].sort((a, b) => b.score - a.score);
  const kept: DigestItem[] = [];
  let total = headerWords;
  for (const it of sorted) {
    const next = total + wordCount(it);
    // ~10 minutes at 220 wpm => 2200 words; keep margin for UI chrome.
    if (next > 1900) continue;
    kept.push(it);
    total = next;
    if (kept.length >= 12) break;
  }
  return { items: kept, wordCount: total, estimatedReadMinutes: estimateReadMinutesFromWords(total) };
}
