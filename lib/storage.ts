import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { readLatestDigestFromDb, writeDigestToDb } from "@/lib/db/digests";
import { DigestSchema, type Digest } from "@/lib/digest";

const DIGEST_DIR = path.join(process.cwd(), "data", "digests");
function latestPath(categorySlug: string) {
  return path.join(DIGEST_DIR, categorySlug, "latest.json");
}

function datePath(categorySlug: string, date: string) {
  return path.join(DIGEST_DIR, categorySlug, `${date}.json`);
}

export { DigestSchema };
export type { Digest };

export async function writeDigest(digest: Digest, categorySlug = "all") {
  // Prefer durable storage when a Postgres URL is configured.
  if (process.env.DATABASE_URL) {
    const ok = await writeDigestToDb(digest, categorySlug);
    if (ok) return { datePath: "(db)", latestPath: "(db)" };
  }

  const dir = path.join(DIGEST_DIR, categorySlug);
  await mkdir(dir, { recursive: true });
  const dPath = datePath(categorySlug, digest.date);
  const lPath = latestPath(categorySlug);
  const body = JSON.stringify(digest, null, 2) + "\n";
  await writeFile(dPath, body, "utf8");
  await writeFile(lPath, body, "utf8");
  return { datePath: dPath, latestPath: lPath };
}

export async function readLatestDigest(categorySlug = "all"): Promise<Digest | null> {
  if (process.env.DATABASE_URL) {
    const fromDb = await readLatestDigestFromDb(categorySlug);
    if (fromDb) return fromDb;
  }
  try {
    const raw = await readFile(latestPath(categorySlug), "utf8");
    return DigestSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function readLatestDigests(categorySlugs: string[]): Promise<Record<string, Digest | null>> {
  const out: Record<string, Digest | null> = {};
  for (const slug of categorySlugs) out[slug] = await readLatestDigest(slug);
  return out;
}
