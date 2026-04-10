"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeamTrackerPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden"
      >
        {/* Decorative Background Blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full" />

        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6"
          >
            <Users className="w-12 h-12 text-blue-600" />
          </motion.div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Team Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
            Manage your crew and streamline workflows. Our team is finalizing the workspace for yours.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Button asChild className="rounded-2xl h-12 font-bold text-lg shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white border-none">
              <Link href="/dashboard">
                <ChevronLeft className="mr-2 h-5 w-5" /> Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-8">
          <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            In Active Development
          </span>
        </div>
      </motion.div>
    </div>
  );
}
