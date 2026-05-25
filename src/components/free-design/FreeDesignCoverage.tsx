"use client";

import { motion } from "framer-motion";

export function FreeDesignCoverage() {
  return (
    <section id="coverage" className="w-full bg-white px-4 md:px-6 pt-3 pb-3 md:pt-4 md:pb-4 font-bengali">
      <div className="max-w-7xl mx-auto w-full text-center px-6 md:px-12 lg:px-20">
        {/* Description Text */}
        <p className="text-[#666666] text-[20px] md:text-[26px] font-bold mb-6">
          বিগত ৫ বছরে আমাদের সেবার পরিধি ও দেশজুড়ে আমাদের কাজের ব্যাপ্তি।
        </p>

        {/* Coverage Image Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full flex items-center justify-center"
        >
          <img
            src="/coverage-country.png"
            alt="Last 5 Years Coverage Map"
            className="w-full h-auto object-contain"
          />
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
