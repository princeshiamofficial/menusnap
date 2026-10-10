"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatItem {
  value: string;
  label: string;
  sublabel?: string;
  highlight?: boolean;
}

const STATS: StatItem[] = [
  {
    value: "30,000+",
    label: "Restaurant & Parlor Menus",
  },
  {
    value: "Thousands",
    label: "Menu Items",
    highlight: true,
  },
  {
    value: "5,000+",
    label: "Food Categories",
  },
  {
    value: "One Platform",
    label: "to Build Your Menu",
    highlight: true,
  },
];

export function StatsStrip() {
  const borderClasses = [
    "border-b sm:border-b lg:border-b-0 sm:border-r border-gray-100", // item 0
    "border-b sm:border-b lg:border-b-0 lg:border-r border-gray-100", // item 1
    "border-b sm:border-b-0 sm:border-r border-gray-100",            // item 2
    "",                                                               // item 3
  ];

  return (
    <section className="w-full bg-white py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
      <div className="max-w-[1240px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col p-5 sm:p-6 lg:p-7 hover:bg-orange-50/20 transition-colors group ${borderClasses[i] || ""}`}
              >
                {/* Bold Stat Value */}
                <span
                  className={`text-3xl sm:text-4xl lg:text-[36px] font-black tracking-tight leading-none mb-2 sm:mb-2.5 ${
                    stat.highlight ? "text-[#FF5A36]" : "text-gray-950"
                  }`}
                >
                  {stat.value}
                </span>

                {/* Label underneath */}
                <span className="text-sm sm:text-base font-bold text-gray-800 leading-snug">
                  {stat.label}
                </span>
                {stat.sublabel && (
                  <span className="text-xs sm:text-[13px] text-gray-500 font-medium leading-normal mt-1">
                    {stat.sublabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
