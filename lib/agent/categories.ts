export type CategoryDef = {
  slug: string;
  name: string;
  keywords: string[];
};

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    slug: "ai-ml",
    name: "AI/ML",
    keywords: [
      "ai",
      "ml",
      "machine learning",
      "model",
      "llm",
      "multimodal",
      "agent",
      "transformer",
      "benchmark",
      "arxiv",
      "paper",
      "diffusion",
      "reasoning",
      "inference",
      "training",
      "openai",
      "anthropic",
      "deepmind",
      "mistral",
      "llama",
      "gemini",
      "gpu",
      "cuda",
      "pytorch",
      "tensorflow",
      "eval"
    ]
  },
  {
    slug: "startups",
    name: "Startups",
    keywords: [
      "startup",
      "raises",
      "raised",
      "seed",
      "series a",
      "series b",
      "series c",
      "round",
      "valuation",
      "funding",
      "invests",
      "investment",
      "venture",
      "vc",
      "term sheet",
      "acquired",
      "acquisition",
      "ipo",
      "merger"
    ]
  },
  {
    slug: "finance",
    name: "Finance",
    keywords: [
      "earnings",
      "revenue",
      "profit",
      "loss",
      "stocks",
      "bond",
      "rates",
      "inflation",
      "fed",
      "ecb",
      "macro",
      "markets",
      "s&p",
      "nasdaq",
      "dow",
      "crypto"
    ]
  },
  {
    slug: "politics",
    name: "Politics",
    keywords: ["election", "senate", "congress", "bill", "law", "regulation", "policy", "white house", "campaign"]
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    keywords: ["film", "movie", "tv", "streaming", "netflix", "disney", "music", "hollywood", "box office", "celebrity"]
  }
];

