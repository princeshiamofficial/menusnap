"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rotate3d,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Store,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Star,
} from "lucide-react";

interface DeckItem {
  id: string;
  name: string;
  category: string;
  location: string;
  items: string[];
  refPriceRange: string;
  popularItem: string;
  color: string;
}

const DECK_ITEMS: DeckItem[] = [
  {
    id: "deck-1",
    name: "Takeout Smash Burgers",
    category: "Burger & Fast Food",
    location: "Dhanmondi / Banani",
    items: ["Classic Beef Patty", "Crispy Chicken Fillet", "Smoky BBQ Bacon", "Cheese Overload"],
    refPriceRange: "৳220 – ৳380",
    popularItem: "Smash Supreme (৳280)",
    color: "#FF5A36",
  },
  {
    id: "deck-2",
    name: "North End Coffee Roasters",
    category: "Café & Coffee",
    location: "Gulshan / Uttara",
    items: ["Hazelnut Cold Brew", "Caramel Macchiato", "Almond Croissant", "Matcha Latte"],
    refPriceRange: "৳180 – ৳390",
    popularItem: "Signature Cold Coffee (৳220)",
    color: "#D97706",
  },
  {
    id: "deck-3",
    name: "Secret Recipe Gourmet",
    category: "Casual Dining & Cakes",
    location: "Multiple Outlets",
    items: ["Chicken Alfredo Pasta", "Lamb Shank Rice", "Tom Yum Soup", "Hokkaido Cheesecake"],
    refPriceRange: "৳320 – ৳680",
    popularItem: "Creamy Chicken Pasta (৳380)",
    color: "#2563EB",
  },
  {
    id: "deck-4",
    name: "Kasturi Heritage",
    category: "Traditional Bengali",
    location: "Purana Paltan",
    items: ["Ilish Bhaja", "Mustard Chingri", "12 Bhorta Platter", "Mutton Kacchi"],
    refPriceRange: "৳160 – ৳550",
    popularItem: "Special Ilish Platter (৳450)",
    color: "#059669",
  },
];

export function DatabaseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewAngle, setViewAngle] = useState<"isometric" | "front" | "perspective">("isometric");

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % DECK_ITEMS.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + DECK_ITEMS.length) % DECK_ITEMS.length);
  };

  // 3D rotation transforms based on chosen view
  const angleStyles = {
    isometric: { rotateX: 18, rotateY: -22, rotateZ: 4 },
    perspective: { rotateX: 8, rotateY: -12, rotateZ: 0 },
    front: { rotateX: 0, rotateY: 0, rotateZ: 0 },
  };

  return (
    <section id="product" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAFAF8] via-white to-[#FAFAF8] overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-400/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-gray-200/90 shadow-2xs text-xs font-bold text-gray-800 tracking-wider uppercase mb-4">
          <Rotate3d className="w-3.5 h-3.5 text-[#FF5A36]" />
          3,000+ Menu References • 3D Stage
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight max-w-3xl mx-auto mb-4">
          Market-এ কী চলছে, এক জায়গা থেকেই দেখুন।
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-2xl mx-auto mb-8">
          Explore structured menu blueprints from 3,000+ restaurants and parlors across Bangladesh in an interactive 3D perspective stage. Switch camera angles or flip through category references.
        </p>

        {/* Category & Restaurant Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-3xl mx-auto">
          {DECK_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeIndex === idx
                  ? "bg-[#111111] text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span>{item.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({item.category})</span>
            </button>
          ))}
        </div>

        {/* 3D Perspective Controls */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white border border-gray-200 shadow-sm mb-12">
          {(["isometric", "perspective", "front"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setViewAngle(view)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                viewAngle === view
                  ? "bg-[#FF5A36] text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {view} 3D View
            </button>
          ))}
        </div>

        {/* 3D Stage Container */}
        <div className="relative max-w-4xl mx-auto min-h-[460px] flex items-center justify-center [perspective:1400px]">
          
          {/* Previous / Next Floating Arrows */}
          <button
            type="button"
            onClick={prevCard}
            className="absolute left-2 sm:left-4 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF5A36] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={nextCard}
            className="absolute right-2 sm:right-4 z-30 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF5A36] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Next card"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 3D Rotating Stack */}
          <motion.div
            animate={angleStyles[viewAngle]}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full max-w-md sm:max-w-lg aspect-[4/3] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {DECK_ITEMS.map((card, idx) => {
              const offset = (idx - activeIndex + DECK_ITEMS.length) % DECK_ITEMS.length;
              const isFront = offset === 0;

              return (
                <motion.div
                  key={card.id}
                  style={{
                    transformStyle: "preserve-3d",
                    transformOrigin: "center center",
                  }}
                  animate={{
                    z: -offset * 55,
                    y: offset * 18,
                    x: offset * 22,
                    scale: 1 - offset * 0.05,
                    opacity: offset > 2 ? 0 : 1 - offset * 0.2,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  className={`absolute inset-0 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-[0_25px_60px_rgba(0,0,0,0.12)] flex flex-col justify-between select-none ${
                    isFront ? "pointer-events-auto" : "pointer-events-none"
                  }`}
                >
                  {/* Top Bar with Category & Tag */}
                  <div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: card.color }}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {card.category}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {card.location}
                      </span>
                    </div>

                    {/* Restaurant Name */}
                    <div className="text-left mb-4">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                        {card.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Verified Menu Blueprint & Reference Model
                      </p>
                    </div>

                    {/* Items Sample Grid */}
                    <div className="grid grid-cols-2 gap-2 text-left mb-4">
                      {card.items.map((item) => (
                        <div
                          key={item}
                          className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-gray-800 truncate">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom: Reference Pricing & Metric */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Reference Price Span
                      </span>
                      <span className="text-base sm:text-lg font-black text-gray-950">
                        {card.refPriceRange}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Signature Item
                      </span>
                      <span className="text-xs font-bold text-[#FF5A36]">
                        {card.popularItem}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Trust Badges Strip Below 3D Stage */}
        <div className="mt-14 pt-8 border-t border-gray-200/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center max-w-4xl mx-auto">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-950">3,000+</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Curated Restaurant Menus</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-950">30,000+</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Indexed Food Items</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-950">500+</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Categories & Cuisines</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">Weekly</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Market Price Updates</p>
          </div>
        </div>

      </div>
    </section>
  );
}
