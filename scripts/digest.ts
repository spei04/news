import { runAllDailyDigests } from "../lib/agent/runAll";

async function main() {
  const { results } = await runAllDailyDigests();
  // eslint-disable-next-line no-console
  console.log(`Wrote ${results.length} digests: ${results.map((r) => `${r.categorySlug}(${r.items})`).join(", ")}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
