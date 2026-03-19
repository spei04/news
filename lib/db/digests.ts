import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "./connection";
import { digests } from "./schema";
import { DigestSchema, type Digest } from "@/lib/digest";

export async function writeDigestToDb(digest: Digest, categorySlug: string) {
  const db = getDb();
  if (!db) return false;

  await db.insert(digests).values({
    categorySlug,
    date: digest.date,
    generatedAt: new Date(digest.generatedAt),
    items: digest.items,
    stats: digest.stats
  });

  return true;
}

export async function readLatestDigestFromDb(categorySlug: string): Promise<Digest | null> {
  const db = getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(digests)
    .where(eq(digests.categorySlug, categorySlug))
    .orderBy(desc(digests.generatedAt))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const parsed = DigestSchema.safeParse({
    date: row.date,
    generatedAt: new Date(row.generatedAt).toISOString(),
    items: row.items,
    stats: row.stats
  });

  return parsed.success ? parsed.data : null;
}

export async function readDigestByDateFromDb(date: string, categorySlug: string): Promise<Digest | null> {
  const db = getDb();
  if (!db) return null;

  const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
  const ok = dateSchema.safeParse(date);
  if (!ok.success) return null;

  const rows = await db
    .select()
    .from(digests)
    .where(and(eq(digests.date, date), eq(digests.categorySlug, categorySlug)))
    .orderBy(desc(digests.generatedAt))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const parsed = DigestSchema.safeParse({
    date: row.date,
    generatedAt: new Date(row.generatedAt).toISOString(),
    items: row.items,
    stats: row.stats
  });

  return parsed.success ? parsed.data : null;
}
