"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Utensils,
  Coffee,
  Store,
  Pizza,
  Building2,
  Palette,
  ChefHat,
  ArrowRight,
  Sparkles,
  Sandwich,
  Croissant,
  Rocket,
  LucideIcon,
} from "lucide-react";

interface AudienceCard {
  icon: LucideIcon;
  title: string;
  bangla: string;
  useCase: string;
}

const AUDIENCE: AudienceCard[] = [
  {
    icon: Utensils,
    title: "New Restaurant Owners",
    bangla: "নতুন রেস্টুরেন্ট উদ্যোক্তা",
    useCase: "Establish strong starter categories, identify staple dishes, and avoid initial pricing blunders.",
  },
  {
    icon: Sandwich,
    title: "Fast Food Joints",
    bangla: "ফাস্ট ফুড শপ",
    useCase: "Benchmark competitive combo pricing for burgers, fried chicken, fries, and beverage upsells.",
  },
  {
    icon: Coffee,
    title: "Cafés & Coffee Shops",
    bangla: "ক্যাফে ও কফি শপ",
    useCase: "Curate specialty espresso lineups, iced beverages, and bakery pairing items with high margins.",
  },
  {
    icon: Store,
    title: "Cloud Kitchens",
    bangla: "ক্লাউড কিচেন",
    useCase: "Design lean, high-velocity delivery menus optimized for online orders and competitive packaging.",
  },
  {
    icon: Croissant,
    title: "Bakeries & Pastry Shops",
    bangla: "বেকারি ও পেস্ট্রি",
    useCase: "Explore savory snack ideas, portion weights, and price bands for customized cakes and pastries.",
  },
  {
    icon: Palette,
    title: "Freelance Menu Designers",
    bangla: "মেন্যু ডিজাইনার",
    useCase: "Get verified item descriptions, spelling, and categorized lists for client design projects in minutes.",
  },
  {
    icon: Building2,
    title: "Branding & Food Agencies",
    bangla: "কনসালটেন্ট ও এজেন্সি",
    useCase: "Manage multiple client menus, conduct in-depth competitive audits, and export polished menus.",
  },
];

export function TargetAudienceSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF8]">
      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          Who It&apos;s For
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight max-w-3xl mx-auto mb-4">
          MenuSnap কার জন্য?
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-2xl mx-auto mb-14">
          Built specifically for food entrepreneurs, culinary creators, and hospitality consultants across Bangladesh.
        </p>

        {/* Grid of 7 Audience Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 text-left mb-12">
          {AUDIENCE.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A36] border border-orange-200/50 flex items-center justify-center mb-3.5">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-gray-950 leading-snug">
                  {card.title}
                </h3>
                <p className="text-xs font-bold text-[#FF5A36] font-bengali mb-2.5">
                  {card.bangla}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {card.useCase}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Last Card CTA Highlight */}
          <div className="bg-[#111111] text-white p-5 sm:p-6 rounded-2xl border border-gray-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-[#FF5A36] border border-white/15 flex items-center justify-center mb-3.5">
                <Rocket className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white leading-snug">
                Ready to Launch Your Menu?
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Join 500+ food businesses in Bangladesh building smarter menus today.
              </p>
            </div>

            <Link
              href="#pricing"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] hover:text-white transition-colors mt-4 pt-3 border-t border-gray-800"
            >
              <span>Find Your Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
