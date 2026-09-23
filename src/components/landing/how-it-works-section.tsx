"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Compass,
  CheckCircle,
  FileCheck,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  Sliders,
  GripVertical,
} from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Explore References",
      banglaTitle: "Explore করুন",
      description:
        "Browse organized menu references from 3,000+ restaurants, cafés, fast food joints, and bakeries across Bangladesh.",
      badge: "3,000+ Menus",
      icon: <Compass className="w-6 h-6 text-[#FF5A36]" />,
      mockup: (
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 pb-2 border-b border-gray-200">
            <span className="px-2 py-0.5 rounded bg-orange-100 text-[#FF5A36] font-bold text-[10px]">
              Café
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-medium text-[10px]">
              Fast Food
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-medium text-[10px]">
              Bakery
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Dhanmondi Bistro</span>
            <span className="text-[11px] text-gray-400">42 Items</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Gulshan Burger Joint</span>
            <span className="text-[11px] text-gray-400">28 Items</span>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      title: "Pick & Customize",
      banglaTitle: "Select ও Customize করুন",
      description:
        "Shortlist winning items with one click. Adjust item names, tweak appetizing descriptions, set your own selling price, and reassign categories.",
      badge: "One-Click Add",
      icon: <Sliders className="w-6 h-6 text-[#FF5A36]" />,
      mockup: (
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 space-y-2 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-orange-200 shadow-2xs flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">BBQ Smash Burger</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span>Reference ৳280</span>
                <ArrowRight className="w-2.5 h-2.5 inline" />
                <span>Your Price: ৳320</span>
              </p>
            </div>
            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Added
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex justify-between items-center">
            <span className="font-medium text-gray-700">Garlic Butter Pasta</span>
            <span className="text-[10px] text-gray-400">Ref: ৳340</span>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      title: "Build & Export",
      banglaTitle: "Final Menu তৈরি করুন",
      description:
        "Drag and drop to organize categories, review menu flow, save multiple projects, and export ready-to-print PDF or spreadsheet files.",
      badge: "Ready-to-Print",
      icon: <FileCheck className="w-6 h-6 text-[#FF5A36]" />,
      mockup: (
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 pb-1">
            <span>Main Course (4 Items)</span>
            <span className="text-[#FF5A36]">Reorderable</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center gap-2">
            <GripVertical className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800 flex-1">Crispy Wings (6pcs)</span>
            <span className="font-bold text-gray-900">৳240</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center gap-2">
            <GripVertical className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800 flex-1">Loaded Cheese Fries</span>
            <span className="font-bold text-gray-900">৳180</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          How It Works
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight max-w-3xl mx-auto mb-4">
          3 Steps-এ নিজের Menu Plan করুন।
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-bengali max-w-2xl mx-auto mb-16">
          রিসার্চ থেকে শুরু করে রেডি মেন্যু তৈরি পর্যন্ত প্রতিটি ধাপ সহজ ও গোছানো।
        </p>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-14">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.12 }}
              className="flex flex-col bg-[#FAFAF8] rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-orange-300 transition-all group"
            >
              {/* Header: Step Number & Icon */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-3xl sm:text-4xl font-black text-gray-300 group-hover:text-[#FF5A36] transition-colors font-mono">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/90 flex items-center justify-center shadow-2xs">
                  {step.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-gray-950 leading-tight mb-1">
                {step.title}
              </h3>
              <p className="text-xs font-bold text-[#FF5A36] font-bengali mb-3">
                {step.banglaTitle}
              </p>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-6 font-normal flex-1">
                {step.description}
              </p>

              {/* Interactive Mockup Preview */}
              <div className="mt-auto">{step.mockup}</div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Workflow Strip */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-6 py-3 rounded-full bg-gray-50 border border-gray-200 text-xs sm:text-sm font-bold text-gray-700 shadow-2xs">
          <span className="text-gray-900 font-extrabold">Explore</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span className="text-gray-900 font-extrabold">Select</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span className="text-gray-900 font-extrabold">Customize</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF5A36]" />
          <span className="text-emerald-600 font-extrabold">Done</span>
        </div>
      </div>
    </section>
  );
}
