import { z } from "zod";

export const DigestItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  source: z.string(),
  publishedAt: z.string(),
  category: z.string(),
  score: z.number(),
  summary: z.array(z.string()),
  whyItMatters: z.string()
});

export const DigestSchema = z.object({
  date: z.string(),
  generatedAt: z.string(),
  items: z.array(DigestItemSchema),
  stats: z.object({
    totalFetched: z.number(),
    totalCandidates: z.number(),
    totalItems: z.number(),
    sources: z.record(z.number()),
    wordCount: z.number(),
    estimatedReadMinutes: z.number()
  })
});

export type Digest = z.infer<typeof DigestSchema>;

