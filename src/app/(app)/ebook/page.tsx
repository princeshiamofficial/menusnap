"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function EBookPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 selection:bg-amber-100">


      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-24">
        {/* Hero Section - Pure Minimal */}
        <section className="flex flex-col md:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-slate-950 dark:text-white">
                Restaurant <br />
                Growth Blueprint
              </h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                The strategic playbook for modern restaurant scaling. Distilled into 45 minutes of actionable intelligence.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                {[
                  "Menu engineering for 40% higher margins",
                  "Viral social media acquisition tactics",
                  "CRM systems for 2.5x customer retention",
                  "Automation workflows for lean operations"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button className="h-14 px-10 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-base hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-950/10">
                  Download PDF
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-[300px] md:max-w-sm aspect-[3/4.2] relative"
          >
            <div className="absolute inset-0 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] bg-slate-50 border border-slate-100 dark:border-slate-800">
              <img 
                src="/dashboard/ebook-premium-3d.png" 
                alt="eBook"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </section>

        {/* Minimal Footer CTA */}
        <section className="border-t border-slate-100 dark:border-slate-900 pt-16 text-center space-y-8">
           <div className="space-y-2">
             <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Ready to begin?</h2>
             <p className="text-slate-500 font-medium">Join 500+ operators scaling with MenuSnap.</p>
           </div>
           <Button variant="outline" className="h-12 px-12 rounded-full border-2 font-bold hover:bg-slate-50 transition-colors">
              Access Full Guide
           </Button>
        </section>

      </div>
    </div>
  );
}
