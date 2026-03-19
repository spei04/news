import { getDb } from "../lib/db/connection";
import { categories, sources } from "../lib/db/schema";
import { SITE_CATEGORIES } from "../lib/site/categories";
import { SOURCES } from "../lib/agent/sources";

async function main() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set");

  await db
    .insert(categories)
    .values(
      SITE_CATEGORIES.map((c, idx) => ({
        slug: c.slug,
        name: c.name,
        sortOrder: idx
      }))
    )
    .onConflictDoNothing();

  await db
    .insert(sources)
    .values(
      SOURCES.map((s) => ({
        sourceId: s.id,
        name: s.name,
        feedUrl: s.feedUrl,
        categorySlugs: s.categoryHints,
        weight: Math.round(s.weight * 10),
        enabled: true
      }))
    )
    .onConflictDoNothing();

  // eslint-disable-next-line no-console
  console.log("Seeded categories + sources.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

