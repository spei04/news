"use client";

import { Filter, ChevronDown } from "lucide-react";
import { SITE_CATEGORIES } from "@/lib/site/categories";
import { useState } from "react";

export function Filters({
  selectedCategories,
  onCategoriesChange,
  sortBy,
  onSortChange,
  dateRange,
  onDateRangeChange
}: {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}) {
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [sortExpanded, setSortExpanded] = useState(true);
  const [dateExpanded, setDateExpanded] = useState(true);

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h2 className="font-semibold text-gray-900">Filters</h2>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          Categories
          <ChevronDown className={`h-4 w-4 transition-transform ${categoriesExpanded ? "rotate-180" : ""}`} />
        </button>
        {categoriesExpanded && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {SITE_CATEGORIES.slice(1).map((category) => (
              <label
                key={category.slug}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => handleCategoryToggle(category.name)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6">
        <button
          onClick={() => setSortExpanded(!sortExpanded)}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          Sort By
          <ChevronDown className={`h-4 w-4 transition-transform ${sortExpanded ? "rotate-180" : ""}`} />
        </button>
        {sortExpanded && (
          <div className="space-y-2">
            {[
              { value: "latest", label: "Latest" },
              { value: "relevant", label: "Most Relevant" }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <button
          onClick={() => setDateExpanded(!dateExpanded)}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-gray-900"
        >
          Date Range
          <ChevronDown className={`h-4 w-4 transition-transform ${dateExpanded ? "rotate-180" : ""}`} />
        </button>
        {dateExpanded && (
          <div className="space-y-2">
            {[
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "all", label: "All Time" }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="radio"
                  name="date"
                  value={option.value}
                  checked={dateRange === option.value}
                  onChange={(e) => onDateRangeChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          onCategoriesChange([]);
          onSortChange("latest");
          onDateRangeChange("all");
        }}
        className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}

