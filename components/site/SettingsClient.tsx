"use client";

import { useEffect, useMemo, useState } from "react";
import { SITE_CATEGORIES } from "@/lib/site/categories";

type Subscription = {
  email: string;
  enabled: boolean;
  categorySlugs: string[];
  timezone: string;
  sendHour: number;
};

export function SettingsClient() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/me/subscription")
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        setSub(j?.subscription ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => SITE_CATEGORIES.slice(1), []);

  if (!sub) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Daily Email</h2>
        <p className="text-gray-600">Loading your subscription…</p>
      </div>
    );
  }

  const toggle = (slug: string) => {
    setSub((prev) => {
      if (!prev) return prev;
      const has = prev.categorySlugs.includes(slug);
      return { ...prev, categorySlugs: has ? prev.categorySlugs.filter((s) => s !== slug) : [...prev.categorySlugs, slug] };
    });
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/me/subscription", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sub)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Daily Email</h2>
      <p className="text-gray-600 mb-6">Choose which categories you want in your inbox.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((c) => (
          <label key={c.slug} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={sub.categorySlugs.includes(c.slug)}
              onChange={() => toggle(c.slug)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className="text-sm text-gray-800 font-semibold">{c.name}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 items-center">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <div className="text-sm font-semibold text-green-700">Saved.</div>}
      </div>
    </div>
  );
}

