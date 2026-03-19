import { readLatestDigest } from "@/lib/storage";
import { SITE_CATEGORIES } from "@/lib/site/categories";
import { NewsCard } from "@/components/site/NewsCard";
import { CATEGORY_IMAGES } from "@/lib/site/article";
import type { Article } from "@/lib/site/article";
import { Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtLong(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, { month: "long", day: "2-digit", year: "numeric" });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const digest = await readLatestDigest(slug);

  const category = SITE_CATEGORIES.find((c) => c.slug === slug) ?? SITE_CATEGORIES[0];
  const categoryName = category.name;

  const articles: Article[] =
    digest?.items.map((it) => ({
      id: it.id,
      title: it.title,
      excerpt: it.summary.join(" "),
      category: categoryName,
      author: it.source,
      date: fmtLong(it.publishedAt),
      imageUrl: CATEGORY_IMAGES[categoryName] ?? CATEGORY_IMAGES.Default,
      readTime: "5 min read",
      href: `/article/${encodeURIComponent(it.id)}`
    })) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">{categoryName}</h1>
        </div>
        <p className="text-gray-600">
          {articles.length} {articles.length === 1 ? "item" : "items"} found
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No items found</h2>
          <p className="text-gray-600">There are no items in this category yet. Check back later!</p>
        </div>
      )}
    </div>
  );
}
