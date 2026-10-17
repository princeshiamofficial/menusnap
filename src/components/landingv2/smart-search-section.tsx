"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Plus, Check, ArrowRight, Store } from "lucide-react";

interface SearchResultItem {
  id: string;
  name: string;
  source: string;
  category: string;
  refPrice: number;
  highlight: string;
}

const SEARCH_RESULTS: SearchResultItem[] = [
  {
    id: "s1",
    name: "Classic Chicken Burger",
    source: "Takeout / Herfy ref",
    category: "Burger",
    refPrice: 240,
    highlight: "Standard 120g patty, lettuce, mayo",
  },
  {
    id: "s2",
    name: "Crispy Fried Chicken Burger",
    source: "KFC / Madchef ref",
    category: "Burger",
    refPrice: 280,
    highlight: "Double coated breast fillet",
  },
  {
    id: "s3",
    name: "BBQ Smoked Chicken Burger",
    source: "Chillox / Takeout ref",
    category: "Burger",
    refPrice: 320,
    highlight: "House smoky BBQ glaze & caramelized onion",
  },
  {
    id: "s4",
    name: "Double Cheese Chicken Burger",
    source: "Burger King / Farmhouse ref",
    category: "Burger",
    refPrice: 350,
    highlight: "Double cheddar slices, garlic aioli",
  },
  {
    id: "s5",
    name: "Grilled Herb Chicken Burger",
    source: "North End / Bistro E ref",
    category: "Healthy / Gourmet",
    refPrice: 380,
    highlight: "Flame-grilled tender fillet with brioche bun",
  },
];

export function SmartSearchSection() {
  const [query, setQuery] = useState("Chicken Burger");
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const handleToggleAdd = (id: string) => {
    if (addedIds.includes(id)) {
      setAddedIds(addedIds.filter((item) => item !== id));
    } else {
      setAddedIds([...addedIds, id]);
    }
  };

  const filtered = SEARCH_RESULTS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[1000px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          Smart Food Item Search
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight mb-4">
          Food Item খুঁজুন Seconds-এর মধ্যে।
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans font-normal max-w-xl mx-auto mb-10">
          Thousands of items. One search. Find inspiration for item names, flavor profiles, and market price benchmarks.
        </p>

        {/* Large Search Bar Mockup */}
        <div className="max-w-2xl mx-auto relative mb-6">
          <div className="relative flex items-center bg-[#FAFAF8] rounded-2xl border-2 border-orange-400/80 shadow-[0_8px_30px_rgba(255,90,54,0.08)] p-2 transition-all">
            <Search className="w-5 h-5 text-[#FF5A36] ml-3 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food item (e.g. Chicken Burger, Cold Coffee, Pizza)..."
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-gray-900 focus:outline-none placeholder:text-gray-400 py-1.5"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 px-2 mt-2">
            <span>Try searching: &quot;BBQ&quot;, &quot;Cheese&quot;, &quot;Pasta&quot;, &quot;Coffee&quot;</span>
            <span className="font-semibold text-gray-600">Showing {filtered.length} variations</span>
          </div>
        </div>

        {/* Results Container Card */}
        <div className="max-w-3xl mx-auto bg-[#FAFAF8] rounded-3xl border border-gray-200/90 p-4 sm:p-6 shadow-sm text-left">
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No variations found for &quot;{query}&quot;. Try typing &quot;Burger&quot; or &quot;Chicken&quot;.
              </div>
            ) : (
              filtered.map((item) => {
                const isAdded = addedIds.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-2xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAdded
                        ? "border-emerald-300 bg-emerald-50/20 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300 shadow-2xs"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Store className="w-3 h-3" /> {item.source}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-gray-950 leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.highlight}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-gray-400 block font-semibold">
                          Reference Price
                        </span>
                        <span className="text-base font-extrabold text-gray-900">
                          ৳{item.refPrice}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAdd(item.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          isAdded
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-[#111111] hover:bg-black text-white shadow-xs"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Your Menu</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Shortlist</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
