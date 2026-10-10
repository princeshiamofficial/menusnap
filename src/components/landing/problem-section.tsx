"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Image as ImageIcon,
  Search,
  FileSpreadsheet,
  HelpCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Facebook,
} from "lucide-react";

export function ProblemSection() {
  const painQuestions = [
    "কোন Item মেন্যুতে রাখবো?",
    "Competitors কী অফার করছে?",
    "কোন কোন Category দরকার?",
    "Price কত রাখলে কাস্টমার নিবে?",
    "সব নির্ভরযোগ্য তথ্য কোথায় পাবো?",
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF8] overflow-hidden">
      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-100/80 text-red-700 text-xs font-bold tracking-wider uppercase mb-4">
          <AlertTriangle className="w-3.5 h-3.5" />
          The Old Way
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight max-w-3xl mx-auto mb-5">
          Restaurant Menu Research এত কঠিন হওয়ার কথা না।
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-bengali font-normal max-w-2xl mx-auto mb-14">
          নতুন রেস্টুরেন্ট খোলার সময় হাজারটা ফেসবুক পেইজ ঘোরা, ঘোলাটে স্ক্রিনশট আর এলোমেলো এক্সেল ফাইলে ঘণ্টার পর ঘণ্টা সময় নষ্ট হয়।
        </p>

        {/* Chaos vs Clarity Visual Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          
          {/* THE OLD WAY: Chaotic Scattered Cards */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-red-200/80 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                Before: Scattered & Confusing
              </span>
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 20+ Hours Wasted
              </span>
            </div>

            {/* Scattered Mock Sticky Notes / Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 relative">
              <div className="p-3 bg-red-50/50 border border-red-200/70 rounded-xl text-xs rotate-[-2deg] shadow-2xs">
                <p className="font-bold text-gray-800">Facebook Pages</p>
                <p className="text-[11px] text-gray-500">Scattered posts & photos</p>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl text-xs rotate-[3deg] shadow-2xs">
                <p className="font-bold text-gray-800">Screenshots</p>
                <p className="text-[11px] text-gray-500">Unreadable blurry photos</p>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs rotate-[-1deg] shadow-2xs">
                <p className="font-bold text-gray-800">PDF Files</p>
                <p className="text-[11px] text-gray-500">Outdated menu copies</p>
              </div>

              <div className="p-3 bg-red-50/60 border border-red-200/80 rounded-xl text-xs rotate-[2deg] shadow-2xs">
                <p className="font-bold text-gray-800">Food Apps</p>
                <p className="text-[11px] text-gray-500">High markup prices</p>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-xl text-xs rotate-[-3deg] shadow-2xs">
                <p className="font-bold text-gray-800">Excel Spreadsheets</p>
                <p className="text-[11px] text-gray-500">Messy manual typing</p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs rotate-[1deg] shadow-2xs">
                <p className="font-bold text-gray-800">Paper Notes</p>
                <p className="text-[11px] text-gray-500">Lost or forgotten notes</p>
              </div>
            </div>

            {/* Pain Point Questions */}
            <div className="space-y-2 pt-4 border-t border-gray-100 font-bengali">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Constant Frustrations:
              </p>
              {painQuestions.map((q) => (
                <div key={q} className="flex items-center gap-2 text-xs text-gray-700">
                  <HelpCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span className="font-medium">{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* THE NEW WAY: MenuSnap Clarity & Organization */}
          <div className="lg:col-span-6 bg-[#111111] text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5A36]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full">
                Now: Organized in MenuSnap
              </span>
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Done in Minutes
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-bengali leading-tight mb-3">
              MenuSnap সবকিছু এক জায়গায় নিয়ে আসে।
            </h3>

            <p className="text-sm text-gray-400 font-bengali leading-relaxed mb-6">
              একটি মাত্র সার্চেই বাংলাদেশের 5,000+ রেস্টুরেন্টের সঠিক ক্যাটাগরি, আইটেমের নাম, এবং মার্কেট রেফারেন্স প্রাইস পেয়ে যান।
            </p>

            {/* 4 Clarity Pillars */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#FF5A36] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-200">
                  এক ক্লিকে 5,000+ রেস্টুরেন্টের ভেরিফাইড মেন্যু ডাটাবেজ
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#FF5A36] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-200">
                  হাজারো ফুড আইটেম সার্চ ও ইনস্ট্যান্ট কম্পারিজন
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#FF5A36] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-200">
                  পছন্দের আইটেম সিলেক্ট করে নিজের কাস্টম মেন্যু লিস্ট তৈরি
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#FF5A36] flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-200">
                  PDF ও Excel ফরম্যাটে এক ক্লিকে রেডি এক্সপোর্ট
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
