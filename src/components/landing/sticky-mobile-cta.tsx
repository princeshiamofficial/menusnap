"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show only after scrolling beyond ~600px (past hero)
      setShow(window.scrollY > 650);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="md:hidden fixed bottom-4 left-4 right-4 z-40"
        >
          <div className="bg-gray-950/95 backdrop-blur-md text-white p-3 rounded-2xl border border-white/15 shadow-2xl flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 pl-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse" />
                <p className="text-xs font-black text-white truncate">
                  Get MenuSnap Pro
                </p>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Plans from only <strong className="text-white">৳499</strong>
              </p>
            </div>

            <a
              href="#pricing"
              onClick={() => trackEvent("hero_cta_clicked", { source: "sticky_mobile_bar" })}
              className="inline-flex items-center gap-1.5 bg-[#FF5A36] hover:bg-[#e64c29] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 flex-shrink-0 cursor-pointer"
            >
              <span>Build Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
