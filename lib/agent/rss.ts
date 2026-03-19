import { XMLParser } from "fast-xml-parser";
import type { CandidateItem, FeedSource } from "./types";

function arr<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function stripHtml(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickUrl(it: any): string | null {
  // RSS: link is string; Atom: link may be { "@_href": ... } or array.
  if (typeof it?.link === "string") return it.link;
  if (typeof it?.link?.["@_href"] === "string") return it.link["@_href"];
  const links = arr(it?.link);
  for (const l of links) {
    if (typeof l?.["@_href"] === "string") return l["@_href"];
    if (typeof l === "string") return l;
  }
  return null;
}

function pickDate(it: any): string {
  const raw =
    it?.pubDate ??
    it?.published ??
    it?.updated ??
    it?.date ??
    it?.["dc:date"] ??
    null;
  const d = raw ? new Date(raw) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function pickSnippet(it: any): string {
  const raw = it?.description ?? it?.summary ?? it?.content ?? it?.["content:encoded"] ?? "";
  return stripHtml(String(raw)).slice(0, 600);
}

export function parseFeedXml(xml: string, source: FeedSource): CandidateItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    // Avoid high memory usage on large feeds.
    processEntities: true
  });
  const data = parser.parse(xml);

  // RSS 2.0
  const rssItems = arr(data?.rss?.channel?.item);
  if (rssItems.length) {
    return rssItems
      .map((it: any) => {
        const url = pickUrl(it);
        if (!url) return null;
        return {
          title: stripHtml(String(it?.title ?? "")).slice(0, 240),
          url,
          sourceId: source.id,
          sourceName: source.name,
          publishedAt: pickDate(it),
          snippet: pickSnippet(it)
        } satisfies CandidateItem;
      })
      .filter(Boolean) as CandidateItem[];
  }

  // Atom
  const atomEntries = arr(data?.feed?.entry);
  if (atomEntries.length) {
    return atomEntries
      .map((it: any) => {
        const url = pickUrl(it);
        if (!url) return null;
        return {
          title: stripHtml(String(it?.title ?? "")).slice(0, 240),
          url,
          sourceId: source.id,
          sourceName: source.name,
          publishedAt: pickDate(it),
          snippet: pickSnippet(it)
        } satisfies CandidateItem;
      })
      .filter(Boolean) as CandidateItem[];
  }

  return [];
}

