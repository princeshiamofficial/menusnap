"use client";

import { Button } from "@/components/ui/button";
import { Star, LibraryBig } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function FreeDesignHero() {
  const stats = [
    { label: "Happy Clients", value: "৫০০০+" },
    { label: "Risk Free", value: "১০০%" },
    { label: "Design Ready", value: "৭২ঘ" },
    { label: "Upfront Cost", value: "৳০" }
  ];

  return (
    <section className="relative w-full bg-white pt-6 pb-6 md:pt-10 md:pb-24 px-6 md:px-12 lg:px-24 flex items-start font-bengali">
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="flex flex-col items-start max-w-xl">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="bg-[#1A1A1A] p-2 rounded-sm">
              <LibraryBig className="w-6 h-6 text-white" />
            </div>
            <span className="text-[#F07C22] text-2xl font-bold font-sans tracking-tight">MenuSnap</span>
          </div>

          {/* Headline */}
          <h1 className="text-[#1A1A1A] text-3xl md:text-4xl lg:text-5xl leading-[1.2] font-serif mb-6 tracking-tight">
            আগে ডিজাইন দেখুন, তারপর সিদ্ধান্ত নিন
          </h1>

          {/* Subtitle */}
          <p className="text-[#666666] text-lg lg:text-xl mb-10 leading-relaxed font-medium">
            আপনার রেস্টুরেন্ট, পার্লার বা সেলুনের জন্য কাস্টম প্রফেশনাল ডিজাইন — সম্পূর্ণ বিনামূল্যে। ডিজাইন পছন্দ হলে পেমেন্ট করুন, না হলে কোনো প্রশ্ন নেই।
          </p>

          {/* CTA Button */}
          <a href="#booking-form">
            <Button 
              className="bg-[#F07C22] hover:bg-[#D96B19] text-white px-10 py-7 rounded-xl text-xl font-bold mb-12 shadow-md transition-all active:scale-95"
            >
              স্লট বুক করুন
            </Button>
          </a>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full pt-12 border-t border-slate-100">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1">
                <span className="text-[#F07C22] text-2xl font-bold">{stat.value}</span>
                <span className="text-[#666666] text-sm font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content - Book Mockup */}
        <div className="relative flex justify-center lg:justify-end items-center">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-full aspect-[4/3] max-w-[700px]"
          >
            <Image
              src="/book-hero.png"
              alt="Book Mockup"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-bengali {
          font-family: 'Hind Siliguri', sans-serif;
        }
      `}</style>
    </section>
  );
}
