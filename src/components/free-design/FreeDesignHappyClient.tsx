"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function FreeDesignHappyClient() {
  return (
    <section id="happy-clients" className="scroll-mt-[120px] bg-slate-50 pt-4 pb-2 md:pt-6 md:pb-4 px-0 md:px-12 lg:px-24 font-bengali">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-8">

          <h2 className="text-[#1A1A1A] text-[20px] sm:text-3xl md:text-5xl font-serif mb-6 leading-tight tracking-tight">
            শতশত রেস্টুরেন্ট ও পার্লারের বিশ্বস্ত পার্টনার
          </h2>
          
          <p className="text-[#666666] text-lg md:text-xl max-w-3xl mx-auto font-medium">
            মেনুডিজাইন থেকে শুরু করে কাস্টমার ফিডব্যাক—সবখানেই আমাদের সেবা এনে দিচ্ছে চমৎকার ফলাফল। নিচে আমাদের হ্যাপি ক্লায়েন্টদের গ্যালারি দেখুন।
          </p>
        </div>

        {/* Image Showcase Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-none md:rounded-3xl overflow-hidden border-x-0 md:border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-white"
        >
          <Image
            src="/happclient.png"
            alt="Happy Clients Feedback Showcase"
            width={1920}
            height={1080}
            className="w-full h-auto object-contain"
            priority
          />
          {/* Black Opacity Overlay */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </motion.div>
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
