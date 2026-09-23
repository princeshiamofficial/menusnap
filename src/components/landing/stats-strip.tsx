"use client";

import React from "react";
import { motion } from "framer-motion";
import { Store, Utensils, Layers, CheckCircle2 } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const STATS: StatItem[] = [
  {
    value: "3,000+",
    label: "Restaurant & Parlor Menus",
    sublabel: "Across Dhaka, Chittagong & Bangladesh",
    icon: <Store className="w-5 h-5 text-[#FF5A36]" />,
  },
  {
    value: "30,000+",
    label: "Menu Items & Categories",
    sublabel: "Verified names, descriptions & prices",
    icon: <Utensils className="w-5 h-5 text-[#FF5A36]" />,
  },
  {
    value: "500+",
    label: "Cuisines & Specialties",
    sublabel: "Fast food, café, bakery, traditional",
    icon: <Layers className="w-5 h-5 text-[#FF5A36]" />,
  },
  {
    value: "One Platform",
    label: "To Build Your Menu",
    sublabel: "From research to print-ready export",
    icon: <CheckCircle2 className="w-5 h-5 text-[#FF5A36]" />,
  },
];

export function StatsStrip() {
  return (
    <section className="w-full bg-white border-y border-gray-100 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex flex-col items-start p-4 sm:p-5 rounded-2xl bg-[#FAFAF8] border border-gray-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:border-orange-200 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-3 shadow-2xs">
                {stat.icon}
              </div>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                {stat.value}
              </span>
              <span className="text-sm font-bold text-gray-800 leading-snug mt-1">
                {stat.label}
              </span>
              <span className="text-xs text-gray-500 font-medium leading-normal mt-0.5">
                {stat.sublabel}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
