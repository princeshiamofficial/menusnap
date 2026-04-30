"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EbookSuccessPage() {
  const handleManualDownload = () => {
    const link = document.createElement('a');
    link.href = '/Business Growth Guide By Color Hut.pdf';
    link.download = 'Business Growth Guide By Color Hut.pdf';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 selection:bg-orange-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center space-y-8 relative z-10"
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20"
          >
            <CheckCircle2 className="w-12 h-12 text-orange-500" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ধন্যবাদ!</h1>
          <p className="text-gray-400 text-lg md:text-xl font-light">
            আপনার গাইডটি সফলভাবে প্রস্তুত করা হয়েছে এবং <br className="hidden md:block" /> ডাউনলোড শুরু হয়েছে।
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-6 text-left">
            <div className="relative w-20 h-28 flex-shrink-0 shadow-2xl">
              <Image 
                src="/Ebook.png" 
                alt="Ebook Cover" 
                fill
                className="object-cover rounded-sm"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Ebook Downloaded</p>
              <h3 className="text-xl font-bold leading-tight">Business Growth Guide <br/> By Color Hut</h3>
              <p className="text-sm text-gray-400 mt-1">PDF • 1.6 MB</p>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-sm text-gray-500">যদি ডাউনলোড শুরু না হয়, তবে নিচের বাটনে ক্লিক করুন:</p>
            <button 
              onClick={handleManualDownload}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2 group"
            >
              <Download className="w-5 h-5 text-orange-500 group-hover:animate-bounce" />
              আবার ডাউনলোড করুন
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ড্যাশবোর্ডে ফিরে যান
          </Link>
          <div className="hidden md:block w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Globe className="w-4 h-4" />
            আমাদের ওয়েবসাইট ভিজিট করুন
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
