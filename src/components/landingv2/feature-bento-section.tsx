"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Search,
  TrendingUp,
  ChefHat,
  Layers,
  Heart,
  FileDown,
  Folders,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export function FeatureBentoSection() {
  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          All-In-One Toolkit
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight mb-4 max-w-3xl mx-auto">
          Menu Planning-এর প্রয়োজনীয় Tools এক জায়গায়।
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-2xl mx-auto mb-14">
          Everything you need to research competitor offerings, find inspiration, benchmark prices, and export ready menu files.
        </p>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left">
          
          {/* 1. Large Bento: 3,000+ Menu References (Span 7) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between overflow-hidden relative group hover:border-orange-300 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5A36] flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 mb-2">
                3,000+ Menu References
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mb-6">
                Curated and categorized menus from 3,000+ cafés, restaurants, cloud kitchens, and bakeries across Bangladesh.
              </p>
            </div>

            {/* Small Product UI Preview */}
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                <span>Categories: Fast Food • Bakery • Asian</span>
                <span className="text-emerald-600">Updated Daily</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <p className="font-bold text-gray-900">Takeout Burger</p>
                  <p className="text-[10px] text-gray-400">38 Menu Items</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-gray-200">
                  <p className="font-bold text-gray-900">North End Coffee</p>
                  <p className="text-[10px] text-gray-400">52 Menu Items</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Medium Bento: Smart Search (Span 5) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between overflow-hidden group hover:border-orange-300 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5A36] flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 mb-2">
                Smart Food Item Search
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                Type any food item to discover hundreds of variations, descriptions, and portion notes instantly.
              </p>
            </div>

            {/* Small Search Preview */}
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 space-y-2 text-xs">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold text-gray-800">Chicken Pasta</span>
              </div>
              <p className="text-[10px] text-gray-400 pl-1">
                Found: Alfredo, Arrabiata, Creamy Mushroom, Peri Peri...
              </p>
            </div>
          </motion.div>

          {/* 3. Medium Bento: Price Reference (Span 5) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between overflow-hidden group hover:border-orange-300 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 mb-2">
                Price Reference Range
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                Compare price spread across neighborhoods and restaurant formats to price with confidence.
              </p>
            </div>

            <div className="bg-[#111111] text-white p-3.5 rounded-2xl border border-gray-800">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Benchmark Span</p>
              <p className="text-lg font-black text-emerald-400">৳240 – ৳360</p>
              <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full w-3/4 rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* 4. Large Bento: Menu Builder (Span 7) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between overflow-hidden group hover:border-orange-300 transition-all"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5A36] flex items-center justify-center mb-4">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 mb-2">
                Dedicated Menu Builder Studio
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mb-6">
                Organize menu categories, set custom prices, reorder dishes, and craft compelling item descriptions in one streamlined canvas.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200/80 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>3 Categories • 24 Items Built</span>
              </div>
              <span className="text-[#FF5A36] font-bold">1-Click Auto Save</span>
            </div>
          </motion.div>

          {/* 5. Small Bento: Custom Categories (Span 3) */}
          <div className="md:col-span-3 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF5A36] flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-base font-extrabold text-gray-950 mb-1">Custom Categories</h4>
            <p className="text-xs text-gray-500">
              Create, rename and reorder custom sections effortlessly.
            </p>
          </div>

          {/* 6. Small Bento: Item Shortlist (Span 3) */}
          <div className="md:col-span-3 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mb-3">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="text-base font-extrabold text-gray-950 mb-1">Item Shortlist</h4>
            <p className="text-xs text-gray-500">
              Bookmark promising ideas during your research phase.
            </p>
          </div>

          {/* 7. Small Bento: PDF & Excel Export (Span 3) */}
          <div className="md:col-span-3 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileDown className="w-4 h-4" />
            </div>
            <h4 className="text-base font-extrabold text-gray-950 mb-1">PDF / Excel Export</h4>
            <p className="text-xs text-gray-500">
              Instant print-ready PDF and clean Excel spreadsheet downloads.
            </p>
          </div>

          {/* 8. Small Bento: Multiple Menus (Span 3) */}
          <div className="md:col-span-3 bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Folders className="w-4 h-4" />
            </div>
            <h4 className="text-base font-extrabold text-gray-950 mb-1">Multiple Menu Drafts</h4>
            <p className="text-xs text-gray-500">
              Maintain separate drafts for dine-in, takeaway, or festive menus.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
