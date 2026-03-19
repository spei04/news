import type { FeedSource } from "./types";

// Prefer RSS/Atom feeds from public sites.
// If a feed changes, adjust here without touching the rest of the agent.
export const SOURCES: FeedSource[] = [
  {
    id: "techcrunch",
    name: "TechCrunch",
    feedUrl: "https://techcrunch.com/feed/",
    categoryHints: ["ai-ml", "startups", "finance"],
    weight: 1.2
  },
  {
    id: "venturebeat",
    name: "VentureBeat",
    feedUrl: "https://venturebeat.com/feed/",
    categoryHints: ["ai-ml", "startups"],
    weight: 1.1
  },
  {
    id: "verge",
    name: "The Verge",
    feedUrl: "https://www.theverge.com/rss/index.xml",
    categoryHints: ["ai-ml", "entertainment"],
    weight: 0.9
  },
  {
    id: "npr-politics",
    name: "NPR Politics",
    feedUrl: "https://feeds.npr.org/1014/rss.xml",
    categoryHints: ["politics"],
    weight: 0.9
  },
  {
    id: "npr-business",
    name: "NPR Business",
    feedUrl: "https://feeds.npr.org/1006/rss.xml",
    categoryHints: ["finance"],
    weight: 0.85
  },
  {
    id: "variety",
    name: "Variety",
    feedUrl: "https://variety.com/feed/",
    categoryHints: ["entertainment"],
    weight: 0.75
  },
  {
    id: "arxiv-cs-ai",
    name: "arXiv (cs.AI)",
    feedUrl: "http://export.arxiv.org/rss/cs.AI",
    categoryHints: ["ai-ml"],
    weight: 0.45
  },
  {
    id: "arxiv-cs-lg",
    name: "arXiv (cs.LG)",
    feedUrl: "http://export.arxiv.org/rss/cs.LG",
    categoryHints: ["ai-ml"],
    weight: 0.45
  }
];
