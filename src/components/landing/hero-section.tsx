"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Check,
  Play,
  ArrowRight,
  Sparkles,
  Utensils,
  Coffee,
  Store,
  FileSpreadsheet,
  TrendingUp,
  Layers,
  ChefHat,
  Eye,
  SlidersHorizontal,
  Rotate3d,
  MapPin,
  X,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { ThreeDTiltCard } from "@/components/landing/three-d-tilt-card";

interface HeroSectionProps {
  onOpenDemo: () => void;
}

interface MockItem {
  id: string;
  name: string;
  category: string;
  restaurant: string;
  refPrice: number;
  myPrice: number;
}

const SAMPLE_ITEMS: MockItem[] = [
  {
    id: "item-1",
    name: "Classic Chicken Burger",
    category: "Fast Food",
    restaurant: "Takeout / Burger King ref",
    refPrice: 250,
    myPrice: 280,
  },
  {
    id: "item-2",
    name: "Creamy Chicken Pasta",
    category: "Café",
    restaurant: "Crimson Cup / Secret Recipe",
    refPrice: 320,
    myPrice: 350,
  },
  {
    id: "item-3",
    name: "Thai Crispy Fried Chicken (2pcs)",
    category: "Restaurant",
    restaurant: "CP / Time Out ref",
    refPrice: 280,
    myPrice: 299,
  },
  {
    id: "item-4",
    name: "Hazelnut Cold Coffee",
    category: "Coffee",
    restaurant: "North End / Coffee Glory",
    refPrice: 180,
    myPrice: 210,
  },
];

const FILTER_TAGS = [
  "All",
  "Restaurant",
  "Café",
  "Fast Food",
  "Chinese",
  "Coffee",
  "Bakery",
];

export function HeroSection({ onOpenDemo }: HeroSectionProps) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([
    "item-1",
    "item-2",
  ]);

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const filteredItems = SAMPLE_ITEMS.filter((item) => {
    const matchesFilter =
      activeFilter === "All" || item.category === activeFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const addedItemsList = SAMPLE_ITEMS.filter((item) =>
    selectedItems.includes(item.id)
  );

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFFFFF] via-[#FAFAF8] to-white overflow-hidden">
      {/* 3D Dynamic Floating Mesh & Ambient Lights */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#FF5A36]/10 via-amber-400/5 to-transparent blur-3xl rounded-full"
        />
        <div className="absolute top-1/4 -left-36 w-80 h-80 bg-orange-400/10 rounded-full blur-[110px]" />
        <div className="absolute top-1/3 -right-36 w-80 h-80 bg-amber-400/10 rounded-full blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      </div>

      <div className="max-w-[1240px] mx-auto text-center flex flex-col items-center">
        {/* Flagship Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] mb-6"
        >
          <MapPin className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span className="text-xs sm:text-[13px] font-semibold text-gray-800 tracking-tight">
            Built for Bangladesh&apos;s Food Businesses
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] animate-pulse" />
        </motion.div>

        {/* Main Bangla Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.15rem] font-extrabold text-gray-950 tracking-tight leading-[1.18] max-w-4xl font-bengali mb-6"
        >
          আপনার Restaurant-এর Menu বানানো এখন{" "}
          <span className="text-[#FF5A36] relative inline-block underline decoration-[#FF5A36]/30 decoration-wavy decoration-2">
            অনেক সহজ।
          </span>
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="text-base sm:text-lg md:text-[1.18rem] text-gray-600 leading-relaxed max-w-3xl font-bengali font-normal mb-8 sm:mb-10"
        >
          বাংলাদেশের <strong className="text-gray-900 font-semibold">3,000+ Restaurant & Parlor</strong>-এর Menu Reference Explore করুন, 30,000+ Food Item ও Category Search করুন, Price সম্পর্কে বাস্তবসম্মত ধারণা নিন এবং নিজের Restaurant-এর Complete Menu List তৈরি করুন।
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 }}
          className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto mb-6"
        >
          <Link
            href="#pricing"
            onClick={() => trackEvent("hero_cta_clicked", { button: "primary_hero" })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#FF5A36] hover:bg-[#e64c29] text-white font-semibold text-[15px] sm:text-[16px] px-7 py-3.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-[0.98] transition-all cursor-pointer group"
          >
            <span>Start Building My Menu</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={() => {
              trackEvent("demo_started", { source: "hero" });
              onOpenDemo();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-[15px] sm:text-[16px] px-6 py-3.5 rounded-xl border border-gray-200/90 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-gray-900 text-gray-900" />
            <span>Watch 2-Min Demo</span>
          </button>
        </motion.div>

        {/* Trust Microcopy with 3D hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="flex items-center justify-center gap-2 text-xs sm:text-[13px] text-gray-500 font-medium mb-12 sm:mb-14"
        >
          <span>Easy to use</span>
          <span>•</span>
          <span>Bangla-friendly</span>
          <span>•</span>
          <span>Built for food businesses</span>
          <span>•</span>
          <span className="text-[#FF5A36] font-semibold flex items-center gap-1">
            <Rotate3d className="w-3.5 h-3.5" /> Interactive 3D Canvas
          </span>
        </motion.div>

        {/* ======================================================== */}
        {/* HERO PRODUCT MOCKUP WITH INTERACTIVE 3D PERSPECTIVE TILT */}
        {/* ======================================================== */}
        <div className="w-full relative [perspective:1400px]">
          
          <ThreeDTiltCard depth={12} className="w-full">
            {/* Floating Metric Card: 3,000+ Restaurants (Elevated in 3D Space) */}
            <div
              style={{ transform: "translateZ(55px)" }}
              className="hidden lg:flex absolute -left-6 top-16 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200/90 shadow-[0_16px_36px_rgba(0,0,0,0.1)] items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A36] flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-base font-extrabold text-gray-950 leading-tight">3,000+ Menus</p>
                <p className="text-[11px] text-gray-500 font-medium">Real Restaurant References</p>
              </div>
            </div>

            {/* Floating Metric Card: Price Reference (Elevated in 3D Space) */}
            <div
              style={{ transform: "translateZ(55px)" }}
              className="hidden lg:flex absolute -right-6 top-28 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200/90 shadow-[0_16px_36px_rgba(0,0,0,0.1)] items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-base font-extrabold text-gray-950 leading-tight">Price Ranges</p>
                <p className="text-[11px] text-gray-500 font-medium">Market Reference Data</p>
              </div>
            </div>

            {/* Main Browser Window Frame */}
            <div
              style={{ transform: "translateZ(15px)" }}
              className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.08)] overflow-hidden text-left"
            >
              {/* Browser Top Chrome / Titlebar */}
              <div className="bg-gray-50/90 border-b border-gray-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="hidden sm:inline-block ml-3 text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-md border border-gray-200">
                    app.menusnap.io/builder
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live 3D Intelligence
                  </span>
                </div>
              </div>

              {/* Dashboard Inner Workspace */}
              <div className="p-4 sm:p-6 lg:p-7 bg-[#FAF9F7]/70">
                {/* Top Search & Filter Bar */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search restaurant or food item... (e.g. Burger, Pasta, Coffee)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
                      {FILTER_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setActiveFilter(tag)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                            activeFilter === tag
                              ? "bg-gray-900 text-white font-semibold"
                              : "bg-gray-100/80 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2-Column Dashboard View: Search Results + Live "My Menu" Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Left Column: Explorer Item Cards */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="flex items-center justify-between px-1 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Discovered Reference Items ({filteredItems.length})
                      </span>
                      <span className="text-[11px] text-gray-400">Click &apos;+ Add&apos; to test</span>
                    </div>

                    {filteredItems.map((item) => {
                      const isAdded = selectedItems.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-xl p-3.5 border transition-all flex items-center justify-between gap-3 ${
                            isAdded
                              ? "border-orange-300 shadow-sm bg-orange-50/30"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                {item.category}
                              </span>
                              <span className="text-[11px] text-gray-400 truncate">
                                Ref: {item.restaurant}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-[14.5px] font-bold text-gray-900 leading-snug truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs font-semibold text-gray-500">
                              Market Ref: <span className="text-gray-900">৳{item.refPrice}</span>
                            </p>
                          </div>

                          {/* Add to Menu Action Button */}
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isAdded
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-[#FF5A36] hover:bg-[#e64c29] text-white shadow-xs"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Add to My Menu</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Floating "My Menu" Builder Preview Panel (Elevated in 3D) */}
                  <div
                    style={{ transform: "translateZ(35px)" }}
                    className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3.5">
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-[#FF5A36]" />
                        <h3 className="text-sm font-extrabold text-gray-900">
                          My Restaurant Menu
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5A36]">
                        {addedItemsList.length} Items Selected
                      </span>
                    </div>

                    {/* List of Added Items in Builder */}
                    <div className="space-y-2 mb-4 max-h-[210px] overflow-y-auto pr-1">
                      {addedItemsList.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          No items added yet. Click &quot;+ Add to My Menu&quot; to begin!
                        </div>
                      ) : (
                        addedItemsList.map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 border border-gray-200/70 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-gray-400 text-[10px] font-mono">0{idx + 1}</span>
                              <span className="font-semibold text-gray-800 truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-bold text-gray-900">৳{item.myPrice}</span>
                              <button
                                type="button"
                                onClick={() => toggleItem(item.id)}
                                className="text-gray-400 hover:text-red-500 font-bold p-0.5 rounded-sm hover:bg-red-50 transition-colors"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Builder Actions & Stats */}
                    <div className="pt-3 border-t border-gray-100 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Menu Completeness</span>
                        <span className="font-bold text-emerald-600">Ready to Export</span>
                      </div>

                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, addedItemsList.length * 25)}%` }}
                        />
                      </div>

                      <Link
                        href="#pricing"
                        className="w-full flex items-center justify-center gap-1.5 bg-[#111111] hover:bg-black text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
                      >
                        <span>Export My Menu (PDF / Excel)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </ThreeDTiltCard>

        </div>

      </div>
    </section>
  );
}
