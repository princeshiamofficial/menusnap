"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Info, BarChart3, CheckCircle, ShieldAlert } from "lucide-react";

interface CompetitorPrice {
  restaurant: string;
  location: string;
  price: number;
  highlight: string;
}

const COMPARISON_ITEMS = {
  burger: {
    name: "Classic Chicken Burger",
    min: 220,
    max: 320,
    avg: 268,
    data: [
      { restaurant: "Burger Point (Mohammadpur)", location: "Budget Friendly", price: 220, highlight: "Entry price point" },
      { restaurant: "Takeout (Dhanmondi)", location: "Popular Chain", price: 250, highlight: "High volume seller" },
      { restaurant: "Madchef (Banani)", location: "Gourmet Fast Food", price: 280, highlight: "Premium toppings" },
      { restaurant: "Chillox (Uttara)", location: "Established Brand", price: 320, highlight: "Top tier pricing" },
    ],
  },
  pasta: {
    name: "Creamy Chicken Alfredo Pasta",
    min: 290,
    max: 420,
    avg: 350,
    data: [
      { restaurant: "Local Café A", location: "Mirpur", price: 290, highlight: "Standard portion" },
      { restaurant: "Crimson Cup", location: "Dhanmondi", price: 340, highlight: "Café crowd favorite" },
      { restaurant: "Secret Recipe", location: "Gulshan", price: 380, highlight: "Imported cream & cheese" },
      { restaurant: "Bistro E", location: "Banani", price: 420, highlight: "Fine dining style" },
    ],
  },
  coffee: {
    name: "Iced Caramel Macchiato",
    min: 180,
    max: 290,
    avg: 235,
    data: [
      { restaurant: "Coffee Glory", location: "Khilgaon", price: 180, highlight: "Affordable sweet treat" },
      { restaurant: "Gloria Jean's", location: "Gulshan", price: 240, highlight: "International standard" },
      { restaurant: "North End Coffee", location: "Banani", price: 260, highlight: "Artisan roasted bean" },
      { restaurant: "Tabaq", location: "Jamuna Future Park", price: 290, highlight: "Double espresso shot" },
    ],
  },
};

export function PriceResearchSection() {
  const [activeItemKey, setActiveItemKey] =
    useState<keyof typeof COMPARISON_ITEMS>("burger");

  const current = COMPARISON_ITEMS[activeItemKey];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#101010] text-white overflow-hidden">
      <div className="max-w-[1240px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-4 border border-white/10">
            <TrendingUp className="w-3.5 h-3.5" />
            Price Research & Benchmarking
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-bengali tracking-tight leading-tight mb-4">
            Price Guess না করে Reference দেখুন।
          </h2>

          <p className="text-base sm:text-lg text-gray-400 font-sans font-normal">
            Inspect listed market reference prices across similar food items to price your menu competitively alongside your own costing and business strategy.
          </p>
        </div>

        {/* Item Selector Pills */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-1 scrollbar-hide">
          {(
            [
              { key: "burger", label: "Chicken Burger" },
              { key: "pasta", label: "Chicken Alfredo Pasta" },
              { key: "coffee", label: "Iced Caramel Macchiato" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveItemKey(item.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeItemKey === item.key
                  ? "bg-[#FF5A36] text-white shadow-md shadow-orange-500/20"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Competitor Price List */}
          <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-7 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {current.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real reference prices collected from public menus
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                4 Reference Points
              </span>
            </div>

            <div className="space-y-3">
              {current.data.map((row, idx) => (
                <div
                  key={row.restaurant}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-white/20 transition-all gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-gray-300 text-xs font-mono flex items-center justify-center flex-shrink-0">
                      0{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{row.restaurant}</p>
                      <p className="text-[11px] text-gray-400">{row.location} • {row.highlight}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right pl-9 sm:pl-0">
                    <span className="text-base sm:text-lg font-black text-emerald-400">
                      ৳{row.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Reference Range & Insight Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-emerald-950/60 to-gray-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-xl">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 block mb-1">
                MARKET REFERENCE RANGE
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight my-2">
                ৳{current.min} – ৳{current.max}
              </div>
              <p className="text-xs text-gray-300 font-medium mb-4">
                Average Market Benchmark: <span className="text-emerald-400 font-bold">৳{current.avg}</span>
              </p>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-emerald-500 via-amber-400 to-[#FF5A36] h-full rounded-full w-full" />
              </div>

              <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                <span>Budget tier (৳{current.min})</span>
                <span>Premium tier (৳{current.max})</span>
              </div>
            </div>

            {/* Strategy Tip Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-gray-300 space-y-1.5">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#FF5A36]" />
                Pricing Strategy Guidance
              </p>
              <p className="leading-relaxed text-gray-400">
                Use these price points to determine where your food business should sit (value-driven, mid-market, or gourmet premium).
              </p>
            </div>
          </div>

        </div>

        {/* Mandatory Disclaimer */}
        <div className="mt-10 p-4 rounded-2xl bg-white/[0.03] border border-white/10 max-w-3xl mx-auto flex items-start gap-3 text-left">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            <strong className="text-gray-200">Legal Disclaimer:</strong> Displayed prices are references only and may change over time. MenuSnap provides research information and does not guarantee or prescribe selling prices. Final pricing decisions must be based on your food costs, margins, and target positioning.
          </p>
        </div>
      </div>
    </section>
  );
}
