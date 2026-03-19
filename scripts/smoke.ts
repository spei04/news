import { readLatestDigest } from "../lib/storage";

async function main() {
  const digest = await readLatestDigest("all");
  if (!digest) throw new Error("No latest digest found at data/digests/all/latest.json (or DB)");
  if (digest.items.length === 0) throw new Error("Digest has no items");
  // eslint-disable-next-line no-console
  console.log(`OK: ${digest.date} (${digest.items.length} items, ~${digest.stats.estimatedReadMinutes} min read)`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
