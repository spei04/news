import Link from "next/link";
import { Newspaper, Mail, Twitter, Facebook, Instagram } from "lucide-react";
import { SITE_CATEGORIES } from "@/lib/site/categories";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Newspaper className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">NewsHub</span>
            </Link>
            <p className="text-sm text-gray-400">
              A daily, under-10-minute digest across AI/ML and the categories you care about.
            </p>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {SITE_CATEGORIES.slice(1, 5).map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`} className="text-sm hover:text-blue-500 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">More</h3>
            <ul className="space-y-2">
              {SITE_CATEGORIES.slice(5).map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`} className="text-sm hover:text-blue-500 transition-colors">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">Subscribe to get the daily digest delivered to your inbox.</p>
            <form action="/api/subscribe" method="post" className="flex gap-2 mb-6">
              <input
                name="email"
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                aria-label="Subscribe"
              >
                <Mail className="h-4 w-4" />
              </button>
            </form>
            <div className="flex gap-4">
              <a href="#" className="hover:text-blue-500 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 NewsHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

