import Link from "next/link";
import { readLatestDigest, readLatestDigests } from "@/lib/storage";
import { ExternalLink } from "lucide-react";
import { SITE_CATEGORIES } from "@/lib/site/categories";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slugs = SITE_CATEGORIES.map((c) => c.slug);
  const digests = await readLatestDigests(slugs);
  const item =
    Object.values(digests)
      .flatMap((d) => d?.items ?? [])
      .find((x) => x.id === id) ?? null;

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Not found</h1>
        <p className="text-gray-600 mb-6">This item isn’t available in the latest digest.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
          {item.category === "ai-ml"
            ? "AI/ML"
            : item.category === "startups"
              ? "Startups"
              : item.category === "finance"
                ? "Finance"
                : item.category === "politics"
                  ? "Politics"
                  : item.category === "entertainment"
                    ? "Entertainment"
                    : item.category}
          <span className="opacity-60">·</span>
          {item.source}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-3">{item.title}</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          {item.summary.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <p className="text-gray-600 mt-4">{item.whyItMatters}</p>

        <div className="mt-6">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Read original
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
