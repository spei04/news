export type FeedSource = {
  id: string;
  name: string;
  feedUrl: string;
  categoryHints: string[]; // category slugs
  weight: number; // higher => more likely to be selected
};

export type CandidateItem = {
  title: string;
  url: string;
  sourceId: string;
  sourceName: string;
  publishedAt: string; // ISO
  snippet: string;
};

export type DigestCategory = string;

export type DigestItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category: DigestCategory;
  score: number;
  summary: string[];
  whyItMatters: string;
};
