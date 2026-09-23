"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, Quote, Store, ChefHat, Sparkles } from "lucide-react";

interface TestimonialCard {
  quote: string;
  banglaQuote: string;
  author: string;
  role: string;
  outlet: string;
  verified: boolean;
}

const TESTIMONIALS: TestimonialCard[] = [
  {
    quote:
      "Planning our burger joint menu usually took two weeks of arguing over items. With MenuSnap, we checked market prices in Dhanmondi and finalized our 28 items in one evening.",
    banglaQuote: "মেন্যু রিসার্চ আর প্রাইসিং ঠিক করতে আমাদের মাত্র ১ দিন লেগেছে!",
    author: "Tanvir Ahmed",
    role: "Co-Founder",
    outlet: "Smash Hub Burgers, Dhanmondi",
    verified: true,
  },
  {
    quote:
      "As a food consultant setting up cafés in Uttara and Banani, MenuSnap is my daily secret weapon. I can export clean, structured menu drafts directly to my design team.",
    banglaQuote: "ক্লায়েন্টদের জন্য মেন্যু ড্রাফট রেডি করা এখন ১০ গুণ সহজ।",
    author: "Nabila Karim",
    role: "Hospitality & Menu Consultant",
    outlet: "Bistro Solutions BD",
    verified: true,
  },
  {
    quote:
      "We were clueless on whether our pasta pricing was too high for Gulshan-1. The price benchmark range gave us the confidence to launch our signature dishes.",
    banglaQuote: "মার্কেট প্রাইস রেঞ্জের সঠিক তথ্য পেয়ে আমাদের কনফিডেন্স অনেক বেড়ে গেছে।",
    author: "Shakil Hossain",
    role: "Owner & Head Baker",
    outlet: "Crumb & Co. Artisan Café",
    verified: true,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF8]">
      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          Verified Stories
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-sans tracking-tight leading-tight mb-4">
          Built for people who build food businesses.
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-xl mx-auto mb-16">
          Hear how restaurateurs and café founders across Bangladesh plan smarter menus with MenuSnap.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs font-bold text-[#FF5A36] font-bengali mb-2">
                  &ldquo;{t.banglaQuote}&rdquo;
                </p>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-950">
                    {t.author}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {t.role} • {t.outlet}
                  </p>
                </div>
                {t.verified && (
                  <span
                    className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full"
                    title="Verified Customer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
