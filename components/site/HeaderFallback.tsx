import Link from "next/link";
import { Newspaper } from "lucide-react";

export function HeaderFallback() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">NewsHub</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

