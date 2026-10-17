"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface DemoVideoSectionProps {
  onOpenDemo: () => void;
}

export function DemoVideoSection({ onOpenDemo }: DemoVideoSectionProps) {
  const workflowSteps = [
    "Login",
    "Explore",
    "Search",
    "Research Price",
    "Add Items",
    "Customize",
    "Build",
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#101010] text-white overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FF5A36]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[1100px] mx-auto text-center relative z-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          See MenuSnap In Action
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-bengali tracking-tight leading-tight mb-4">
          Research থেকে Ready Menu — দেখুন কীভাবে।
        </h2>

        <p className="text-base sm:text-lg text-gray-400 font-sans font-normal max-w-xl mx-auto mb-10">
          2 minutes. That&apos;s all you need to understand how MenuSnap transforms your menu planning workflow.
        </p>

        {/* 16:9 Video Player Container Mockup with Play Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onClick={() => {
            trackEvent("demo_started", { source: "video_container" });
            onOpenDemo();
          }}
          className="relative aspect-video w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-white/15 bg-gradient-to-br from-gray-900 to-black overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.5)] cursor-pointer group mb-12"
        >
          {/* Simulated video thumbnail backdrop preview */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
          
          {/* Dashboard Silhouette in video */}
          <div className="absolute inset-6 sm:inset-10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xs flex flex-col p-4 opacity-75 group-hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </div>
              <span className="text-[11px] text-gray-400 font-mono">MenuSnap Platform Walkthrough</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-500 text-sm font-bengali">
                500+ রেস্টুরেন্ট ডাটাবেজ • লাইভ প্রাইস রিসার্চ • ড্র্যাগ অ্যান্ড ড্রপ বিল্ডার
              </span>
            </div>
          </div>

          {/* Large Elegant Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FF5A36] text-white flex items-center justify-center shadow-[0_0_50px_rgba(255,90,54,0.4)] group-hover:scale-110 group-hover:bg-[#ff6f4e] transition-all duration-300">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
              </div>
              {/* Subtle pulsing ripple */}
              <div className="absolute inset-0 rounded-full bg-[#FF5A36] opacity-30 animate-ping pointer-events-none" />
            </div>
          </div>

          {/* Bottom Video Badge */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex items-center justify-between text-xs text-gray-400 font-medium">
            <span className="bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              HD Preview (2:15 mins)
            </span>
            <span className="bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Click to Watch
            </span>
          </div>
        </motion.div>

        {/* Workflow Underneath: Login -> Explore -> Search -> Research Price -> Add Items -> Customize -> Build */}
        <div className="mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Core Workflow Process:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
            {workflowSteps.map((step, idx) => (
              <React.Fragment key={step}>
                <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-200">
                  {step}
                </span>
                {idx < workflowSteps.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Action CTA */}
        <Link
          href="#pricing"
          onClick={() => trackEvent("hero_cta_clicked", { source: "demo_section" })}
          className="inline-flex items-center gap-2 bg-[#FF5A36] hover:bg-[#e64c29] text-white font-bold text-[15px] px-7 py-3.5 rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Start Building My Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
