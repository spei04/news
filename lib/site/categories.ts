export type SiteCategory = {
  slug: string;
  name: string;
};

export const SITE_CATEGORIES: SiteCategory[] = [
  { slug: "all", name: "All" },
  { slug: "ai-ml", name: "AI/ML" },
  { slug: "startups", name: "Startups" },
  { slug: "finance", name: "Finance" },
  { slug: "politics", name: "Politics" },
  { slug: "entertainment", name: "Entertainment" }
];

