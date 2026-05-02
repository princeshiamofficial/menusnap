"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FreeDesignSolution() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const steps = [
    {
      id: "১",
      title: "ফ্রি স্লট বুক করুন",
      description: "নিচের ফর্ম পূরণ করুন। বিজনেসের ধরন ও ডিজাইন চাহিদা জানান।"
    },
    {
      id: "২",
      title: "মাত্র ৭২ ঘণ্টায় ডিজাইন রেডি",
      description: "আমাদের টিম কাস্টম ডিজাইন তৈরি করে WhatsApp এ পাঠাবে।"
    },
    {
      id: "৩",
      title: "ডিজাইন পছন্দ হলে পেমেন্ট করুন",
      description: "পছন্দ না হলে কোনো চাপ নেই। পছন্দ হলে পেমেন্ট করুন — বাকিটা আমাদের দায়িত্ব।"
    },
    {
      id: "৪",
      title: "প্রিন্ট, বাইন্ডিং ও হোম ডেলিভারি",
      description: "আমাদের লজিস্টিক টিম প্রিন্ট, বাইন্ডিং ও প্যাকেজিং করে কুরিয়ারে আপনার ঠিকানায় পাঠাবে।"
    }
  ];

  return (
    <section className="bg-[#FAF9F6] py-6 md:py-24 px-6 md:px-12 lg:px-24 font-bengali">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
        
        {/* Left Side - Content & Steps */}
        <div className="flex flex-col items-start">
          <h2 className="text-[#1A1A1A] text-3xl md:text-5xl font-serif mb-4 leading-tight">
            আগে ডিজাইন, পরে পেমেন্ট
          </h2>
          <p className="text-[#666666] text-xl mb-8 leading-relaxed font-medium">
            ডিজাইন পছন্দ হলে তবেই পেমেন্ট করবেন — এটাই আমাদের প্রতিশ্রুতি।
          </p>

          <div className="relative flex flex-col gap-3 w-full max-w-2xl mt-4">
            {/* Connecting Line (Desktop) */}
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#F07C22] via-[#F07C22]/50 to-transparent hidden md:block" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center gap-6 group"
              >
                {/* Step Number Bubble */}
                <div className="relative z-10 w-12 h-12 bg-white border-2 border-[#F07C22] rounded-2xl flex items-center justify-center text-[#F07C22] font-bold text-xl flex-shrink-0 group-hover:bg-[#F07C22] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                  {step.id}
                </div>
                
                {/* Content Card */}
                <div className="bg-white p-3.5 px-6 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-[#F07C22]/5 group-hover:-translate-y-1 transition-all duration-500 flex-1">
                  <h3 className="text-[#1A1A1A] text-lg font-bold group-hover:text-[#F07C22] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-[#666666] text-sm leading-relaxed mt-0.5 md:whitespace-nowrap">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side - Slider Mockup */}
        <div className="sticky top-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-white rounded-3xl p-4 border border-slate-200 overflow-hidden"
          >
            <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center group">
              <Image
                src="/menu-sample-1.png"
                alt="Design Sample"
                fill
                className="object-cover"
              />
              
              {/* Slider Controls */}
              <button className="absolute left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
              </button>
              <button className="absolute right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                <ChevronRight className="w-6 h-6 text-[#1A1A1A]" />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                <div className="w-6 h-2 bg-[#F07C22] rounded-full" />
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
              </div>
            </div>

            <div className="p-4 pt-2 flex justify-between items-end">
              <div>
                <h4 className="text-[#1A1A1A] font-bold text-lg">মেনস সেলুন প্রাইজ কার্ড</h4>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[#666666] text-sm">কাস্টম ডিজাইন স্যাম্পল</span>
                <ImageIcon className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 text-center"
      >
        <a href="#booking-form">
          <Button className="bg-[#F07C22] hover:bg-[#D96B19] text-white px-8 py-6 rounded-xl text-lg font-bold shadow-lg shadow-[#F07C22]/20 transition-all active:scale-95">
            স্লট বুক করুন
          </Button>
        </a>
      </motion.div>

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
