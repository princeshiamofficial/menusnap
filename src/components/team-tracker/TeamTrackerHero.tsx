"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function TeamTrackerHero() {
  const scrollToForm = () => {
    const form = document.getElementById("booking-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToCaseStudy = () => {
    const section = document.getElementById("case-study");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative lg:min-h-[75vh] min-h-0 bg-[#0F0F0F] flex items-end justify-center overflow-hidden px-6 md:px-12 lg:px-24 pt-12 lg:pt-20 pb-0 font-bengali">
      <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-2 gap-12 items-end">
        
        {/* Left Side: Content */}
        <motion.div 
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start text-white z-10 lg:pb-20 pb-0"
        >
          <h1 className="text-5xl md:text-6xl lg:text-[85px] font-bold leading-[1.1] mb-6 tracking-tight max-w-2xl">
            স্মার্ট অ্যাটেনডেন্স ম্যানেজমেন্ট সিস্টেম
          </h1>

          <p className="text-[#A1A1A1] text-lg md:text-xl mb-8 max-w-[600px] leading-relaxed font-normal">
            টিমট্র্যাকার হলো একটি বুদ্ধিমান ক্লাউড-ভিত্তিক অ্যাটেনডেন্স ম্যানেজমেন্ট অ্যাপ, যা ব্যবহারকারীর লোকেশন অনুযায়ী স্বয়ংক্রিয়ভাবে পাঞ্চ-ইন এবং আউট নিশ্চিত করে। এটি পেরোল প্রসেসিংয়ের জন্য কোনো প্রকার ম্যানুয়াল হস্তক্ষেপ ছাড়াই স্বয়ংক্রিয় ইনপুট প্রদান করে।
          </p>

          <div className="flex items-center gap-10">
            <Button 
              onClick={scrollToForm}
              className="bg-[#F07C22] hover:bg-[#d96a1a] text-white h-12 md:h-20 px-6 md:px-12 rounded-full text-base md:text-2xl font-bold flex items-center gap-2 md:gap-3 transition-all active:scale-95 border-none"
            >
              ফ্রি ডেমো বুক করুন <ArrowRight className="w-5 h-5 md:w-7 md:h-7" />
            </Button>
            <button 
              onClick={scrollToCaseStudy}
              className="text-white text-base md:text-2xl font-bold hover:opacity-80 transition-opacity"
            >
              আরও জানুন
            </button>
          </div>
        </motion.div>

        {/* Right Side: Phone Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: 60 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative flex justify-center lg:justify-end self-end mt-auto"
        >
          <div className="relative w-full max-w-[600px] aspect-[4/5] lg:aspect-square">
            <Image
              src="/team-tracker-phone.png"
              alt="Team Tracker App Mockup"
              fill
              className="object-contain object-bottom"
              priority
            />
          </div>
        </motion.div>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        .font-bengali {
          font-family: 'Hind Siliguri', sans-serif;
        }
      `}</style>
    </section>
  );
}

