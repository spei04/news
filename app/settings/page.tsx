import Link from "next/link";
import { SettingsClient } from "@/components/site/SettingsClient";

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your subscriptions and delivery preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <nav className="space-y-1 bg-white rounded-lg border border-gray-200 p-2">
            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-semibold">
              Preferences
            </div>
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </nav>
        </aside>

        <main className="lg:col-span-3">
          <SettingsClient />
        </main>
      </div>
    </div>
  );
}
