"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Digest } from "@/lib/storage";
import { Filters } from "@/components/site/Filters";
import { NewsCard } from "@/components/site/NewsCard";
import type { Article } from "@/lib/site/article";
import { pickImageForArticle } from "@/lib/site/article";
import { SITE_CATEGORIES } from "@/lib/site/categories";

function fmtLong(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });
}

function roughReadTimeFromText(s: string) {
  const words = s.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(2, Math.round(words / 220));
  return `${minutes} min read`;
}

function digestToArticles(digest: Digest | null): Article[] {
  if (!digest) return [];
  return digest.items.map((it, idx) => {
    const categoryName =
      it.category === "ai-ml"
        ? "AI/ML"
        : it.category === "startups"
          ? "Startups"
          : it.category === "finance"
            ? "Finance"
            : it.category === "politics"
              ? "Politics"
              : it.category === "entertainment"
                ? "Entertainment"
                : "AI/ML";
    const imageUrl = pickImageForArticle(categoryName, it.url);
    // Keep list cards short; full bullet list appears on the article detail page.
    const excerpt = it.summary.slice(0, 2).join(" ");
    return {
      id: it.id,
      title: it.title,
      excerpt,
      category: categoryName,
      author: it.source,
      date: fmtLong(it.publishedAt),
      imageUrl,
      readTime: roughReadTimeFromText(`${it.title} ${excerpt} ${it.whyItMatters}`),
      href: `/article/${encodeURIComponent(it.id)}` as Article["href"],
      featured: idx === 0
    };
  });
}

export function HomeClient({ digest }: { digest: Digest | null }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("latest");
  const [dateRange, setDateRange] = useState("all");

  const articles = useMemo(() => digestToArticles(digest), [digest]);

  const filteredArticles = useMemo(() => {
    let out = [...articles];

    if (selectedCategories.length > 0) {
      out = out.filter((a) => selectedCategories.includes(a.category));
    }

    if (sortBy === "latest") {
      out.sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    // dateRange is a UI affordance here; real implementation will filter by publishedAt in DB.
    void dateRange;

    return out;
  }, [articles, dateRange, selectedCategories, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Today’s 10-minute brief</h1>
        <p className="text-gray-600">
          {digest ? (
            <>
              {digest.stats.estimatedReadMinutes} min read · {digest.items.length} picks · {digest.date}
            </>
          ) : (
            <>Run `npm run digest` to generate the first daily brief.</>
          )}
        </p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {SITE_CATEGORIES.map((tab) => (
            <Link
              key={tab.slug}
              className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                tab.slug === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
              href={tab.slug === "all" ? "/" : `/category/${tab.slug}`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Filters
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            sortBy={sortBy}
            onSortChange={setSortBy}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </aside>

        <main className="lg:col-span-3">
          {filteredArticles.length > 0 ? (
            <div className="space-y-6">
              {filteredArticles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg overflow-hidden">
                  <NewsCard article={article} featured={Boolean(article.featured)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 text-lg mb-2">No items yet</p>
              <p className="text-gray-500 text-sm">Try adjusting filters or check back after the next ingest run.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
