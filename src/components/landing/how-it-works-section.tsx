"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Sliders,
  TrendingUp,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function HowItWorksSection() {
  const modes = [
    {
      id: "instant",
      modeBadge: "Instant Mode",
      icon: <Zap className="w-3.5 h-3.5 fill-current" />,
      badgeBg: "bg-[#eff6ff] text-[#2563eb] border-[#dbeafe]",
      circleBg: "bg-[#eff6ff] text-[#2563eb]",
      title: "From discovery to insights in one step",
      steps: [
        "Search dishes, ingredients, or cuisine types. MenuSnap indexes 3,000+ menus so there is nothing to wait for.",
        "Filter by city, neighborhood, and price bracket. Winning benchmark references are ready on your screen.",
        "Save anywhere. Export clean dish cards or copy pricing spreads straight to your project clipboard."
      ],
      bestFor: "Menu research, competitor benchmarking, dish discovery"
    },
    {
      id: "studio",
      modeBadge: "Studio Mode",
      icon: <Sliders className="w-3.5 h-3.5" />,
      badgeBg: "bg-[#faf5ff] text-[#9333ea] border-[#f3e8ff]",
      circleBg: "bg-[#faf5ff] text-[#9333ea]",
      title: "Full quality, polished before anyone sees it",
      steps: [
        "Build locally in real-time. Categories, dishes, descriptions, and portion variations each get their own track.",
        "The builder formats automatically as you type: clean margins, smart category sorting, and allergen tags.",
        "Export in high-res vector PDF, or share it as a live interactive digital menu link like everything else."
      ],
      bestFor: "Restaurant launches, seasonal menu revamp, print blueprints"
    },
    {
      id: "matrix",
      modeBadge: "Price Matrix Mode",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      badgeBg: "bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]",
      circleBg: "bg-[#f0fdf4] text-[#16a34a]",
      title: "Pricing structures that boost your margin",
      steps: [
        "Hit compare to instantly view local market min, average, and high price points for any dish category.",
        "Optimize with one click: automatic food cost margin targets, psychological pricing tiers, and inflation adjustments.",
        "It's on your clipboard, ready to paste into Excel, send to your accountant, or export as CSV."
      ],
      bestFor: "Pricing strategy, food cost optimization, margin audits"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]/60 border-t border-neutral-100">
      <div className="max-w-[1240px] mx-auto text-center">
        
        {/* 1. Top Overline with Small Color Square */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-center gap-2 mb-3.5 sm:mb-4"
        >
          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#38bdf8]" />
          <span className="text-[11px] sm:text-xs font-bold text-neutral-500 uppercase tracking-[0.2em]">
            MENUSNAP HAS 3 MODES
          </span>
        </motion.div>

        {/* 2. Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="text-4xl sm:text-5xl md:text-[56px] font-extrabold text-[#111827] tracking-tight leading-[1.1] mb-4 text-center max-w-4xl mx-auto"
        >
          One app for every workflow
        </motion.h2>

        {/* 3. Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="text-sm sm:text-base text-neutral-500 max-w-xl mx-auto text-center leading-relaxed mb-7 sm:mb-8 font-normal"
        >
          Discover benchmarks with Instant, build print-ready menus with Studio, or optimize your margins with Price Matrix.
        </motion.p>

        {/* 4. Glossy Sky CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="mb-14 sm:mb-16"
        >
          <Link
            href="#pricing"
            onClick={() => trackEvent("hero_cta_clicked", { button: "how_it_works_cta" })}
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] border border-sky-300 text-[#0369a1] font-bold text-sm shadow-[0_4px_16px_rgba(56,189,248,0.25)] hover:shadow-[0_6px_20px_rgba(56,189,248,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            Start building for free
          </Link>
        </motion.div>

        {/* 5. Three Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 max-w-[1180px] mx-auto text-left">
          {modes.map((mode, idx) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 + idx * 0.1 }}
              className="bg-white rounded-[24px] p-6 sm:p-7 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-neutral-300/90 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Mode Pill Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border mb-5 ${mode.badgeBg}`}
                >
                  {mode.icon}
                  <span>{mode.modeBadge}</span>
                </div>

                {/* Card Title */}
                <h3 className="text-xl font-bold text-[#111827] leading-snug mb-6">
                  {mode.title}
                </h3>

                {/* Numbered Steps List (1, 2, 3) */}
                <div className="space-y-4 mb-8">
                  {mode.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-start gap-3">
                      <span
                        className={`w-5 h-5 rounded-full ${mode.circleBg} text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        {stepIdx + 1}
                      </span>
                      <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed font-normal">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom "BEST FOR" Section */}
              <div className="border-t border-neutral-100 pt-4 mt-auto">
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                  BEST FOR
                </span>
                <p className="text-xs text-neutral-700 font-medium leading-normal">
                  {mode.bestFor}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

