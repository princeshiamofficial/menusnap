"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Sparkles, CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-[#111111] rounded-3xl border border-white/15 shadow-2xl overflow-hidden z-10 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A36] animate-pulse" />
              <h3 className="text-sm font-bold text-white">
                MenuSnap 2-Minute Product Walkthrough
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Container Area */}
          <div className="relative aspect-video w-full bg-black flex flex-col items-center justify-center p-6 text-center">
            {/* Embedded video player placeholder / live interactive player */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="max-w-md p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-center">
                <div className="w-16 h-16 rounded-full bg-[#FF5A36] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
                  <Play className="w-7 h-7 fill-white ml-0.5" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  Ready to See the Full Demo?
                </h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Learn how to explore 3,000+ menus, research 30,000+ items & categories, and export your complete menu in under 2 minutes.
                </p>
                <div className="space-y-1.5 text-[11px] text-gray-300 text-left bg-white/[0.04] p-3 rounded-xl mb-4">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>0:00 – 0:40: Database Explorer & Category Filter</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>0:40 – 1:20: Price Benchmarking & Competitor Lookup</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1:20 – 2:15: Menu Builder Studio & PDF Export</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("demo_completed", { source: "modal_action" });
                    onClose();
                    window.location.href = "#pricing";
                  }}
                  className="w-full py-2.5 bg-[#FF5A36] hover:bg-[#e64c29] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Start Building My Menu Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
