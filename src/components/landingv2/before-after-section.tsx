"use client";

import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export function BeforeAfterSection() {
  const withoutItems = [
    "Endless Facebook page scrolling",
    "Blurry random mobile screenshots",
    "Outdated downloaded PDF files",
    "Scattered paper notes & lost napkin drafts",
    "Messy manual Excel spreadsheets",
    "Repeated time-consuming research",
    "Confusing price references & guesses",
  ];

  const withItems = [
    "One centralized intelligent dashboard",
    "500+ verified restaurant references in Bangladesh",
    "Instant smart food item & category search",
    "Market price range benchmarking",
    "Interactive drag-and-drop Menu Builder",
    "Cloud-saved multiple restaurant projects",
    "One-click print-ready PDF & Excel export",
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[1180px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          The Direct Comparison
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight mb-4">
          From Menu Chaos → Menu Clarity
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-xl mx-auto mb-14">
          See the stark difference between disorganized manual menu planning and building with MenuSnap.
        </p>

        {/* Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* WITHOUT MENUSNAP (Cluttered / Frustrating) */}
          <div className="bg-red-50/40 rounded-3xl p-6 sm:p-8 border border-red-200/80 shadow-2xs relative">
            <div className="flex items-center justify-between pb-4 border-b border-red-200/60 mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-600">
                  WITHOUT MENUSNAP
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  The Frustrating Old Way
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
                <XCircle className="w-5 h-5" />
              </div>
            </div>

            <ul className="space-y-3.5">
              {withoutItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="line-through text-gray-500 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WITH MENUSNAP (Crisp / Calm / Powerful) */}
          <div className="bg-gradient-to-br from-gray-950 to-[#111111] text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-52 h-52 bg-[#FF5A36]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  WITH MENUSNAP
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Streamlined Menu Intelligence
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <ul className="space-y-3.5">
              {withItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
