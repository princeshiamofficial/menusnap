"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, LineChart, Zap, CheckCircle2, Sparkles } from "lucide-react";

interface BenefitCard {
  title: string;
  banglaTitle: string;
  description: string;
  icon: React.ReactNode;
}

const BENEFITS: BenefitCard[] = [
  {
    title: "Save Research Time",
    banglaTitle: "ঘণ্টার পর ঘণ্টা সময় বাঁচান",
    description:
      "Eliminate endless manual searching across dozens of Facebook pages, Instagram photos, and old paper flyers. Everything is pre-indexed.",
    icon: <Clock className="w-6 h-6 text-[#FF5A36]" />,
  },
  {
    title: "Make Better Decisions",
    banglaTitle: "আত্মবিশ্বাসের সাথে সিদ্ধান্ত নিন",
    description:
      "Understand what competitor restaurants are offering and discover which portion sizes and price points are standard in the market.",
    icon: <LineChart className="w-6 h-6 text-[#FF5A36]" />,
  },
  {
    title: "Build Much Faster",
    banglaTitle: "একদম দ্রুত মেন্যু রেডি করুন",
    description:
      "Go from initial concept to a structured, categorized, and priced restaurant menu in a single organized session.",
    icon: <Zap className="w-6 h-6 text-[#FF5A36]" />,
  },
  {
    title: "Stay Fully Organized",
    banglaTitle: "সবকিছু এক সেন্ট্রাল ওয়ার্কস্পেসে",
    description:
      "Replace scattered mobile screenshots, lost WhatsApp voice notes, and messy Excel spreadsheets with one saved cloud project.",
    icon: <CheckCircle2 className="w-6 h-6 text-[#FF5A36]" />,
  },
];

export function BenefitsSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          The Value Proposition
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight max-w-3xl mx-auto mb-4">
          Database নয়। আপনার Menu Planning Shortcut.
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-2xl mx-auto mb-16">
          MenuSnap is designed not just to show you other menus, but to give you an unfair speed advantage when opening or revising your food business.
        </p>

        {/* 4 Premium Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="p-6 sm:p-7 rounded-3xl bg-[#FAFAF8] border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/90 flex items-center justify-center shadow-2xs mb-5">
                  {b.icon}
                </div>
                <h3 className="text-lg font-black text-gray-950 mb-1 leading-snug">
                  {b.title}
                </h3>
                <p className="text-xs font-bold text-[#FF5A36] font-bengali mb-3">
                  {b.banglaTitle}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {b.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
