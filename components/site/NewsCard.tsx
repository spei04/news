import Link from "next/link";
import { Clock, User } from "lucide-react";
import type { Article } from "@/lib/site/article";

export function NewsCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  if (featured) {
    return (
      <Link href={article.href} className="group block overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative h-64 md:h-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-4 left-4">
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                {article.category}
              </span>
            </div>
          </div>
          <div className="p-6 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-600 text-lg mb-4 line-clamp-3">{article.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
              <span>{article.date}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={article.href} className="group block overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
            {article.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

