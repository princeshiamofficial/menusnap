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
    category: "Fast Food",
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
    category: "Casual Dining",
    location: "Multiple Outlets",
    items: ["Chicken Alfredo Pasta", "Lamb Shank Rice", "Tom Yum Soup", "Hokkaido Cheesecake"],
    refPriceRange: "৳320 – ৳680",
    popularItem: "Creamy Chicken Pasta (৳380)",
    color: "#2563EB",
  },
  {
    id: "deck-4",
    name: "Kasturi Heritage",
    category: "Bangla Traditional",
    location: "Purana Paltan",
    items: ["Ilish Bhaja", "Mustard Chingri", "12 Bhorta Platter", "Mutton Kacchi"],
    refPriceRange: "৳160 – ৳550",
    popularItem: "Special Ilish Platter (৳450)",
    color: "#059669",
  },
];

export function Interactive3DStage() {
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
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#FAFAF8] to-white overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-400/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-gray-200/90 shadow-2xs text-xs font-bold text-gray-800 tracking-wider uppercase mb-4">
          <Rotate3d className="w-3.5 h-3.5 text-[#FF5A36]" />
          3D Interactive Menu Stage
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight max-w-3xl mx-auto mb-4">
          Interactive 3D-তে এক্সপ্লোর করুন দেশের সেরা Menu গুলোর Structure
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-2xl mx-auto mb-10">
          Rotate through verified restaurant menu blueprints in real-time 3D. Inspect category setups, pricing spreads, and star items.
        </p>

        {/* 3D Perspective Controls */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-white border border-gray-200 shadow-sm mb-12">
          {(["isometric", "perspective", "front"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setViewAngle(view)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                viewAngle === view
                  ? "bg-[#111111] text-white shadow-2xs"
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
            className="absolute left-2 sm:left-4 z-30 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF5A36] hover:scale-105 active:scale-95 transition-all"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={nextCard}
            className="absolute right-2 sm:right-4 z-30 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF5A36] hover:scale-105 active:scale-95 transition-all"
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
                  }}
                  animate={{
                    z: -offset * 65,
                    y: offset * 18,
                    x: offset * 14,
                    scale: 1 - offset * 0.06,
                    opacity: offset > 2 ? 0 : 1 - offset * 0.22,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  onClick={() => setActiveIndex(idx)}
                  className={`absolute inset-0 bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col justify-between text-left select-none transition-shadow ${
                    isFront ? "ring-2 ring-orange-500/20 shadow-2xl" : "pointer-events-none"
                  }`}
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {card.category}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        {card.location}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight mb-2">
                      {card.name}
                    </h3>

                    <p className="text-xs text-gray-500 mb-4">
                      Top Pick: <strong className="text-gray-800">{card.popularItem}</strong>
                    </p>

                    {/* Items Checklist */}
                    <div className="space-y-2 pt-2 border-t border-gray-50">
                      {card.items.map((it) => (
                        <div key={it} className="flex items-center gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium">{it}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">
                        Market Price Spread
                      </span>
                      <span className="text-base font-black text-gray-900">
                        {card.refPriceRange}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#FF5A36] flex items-center gap-1">
                      <span>Menu Reference</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>

        {/* Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {DECK_ITEMS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === i ? "w-8 bg-[#FF5A36]" : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Jump to 3D card ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
