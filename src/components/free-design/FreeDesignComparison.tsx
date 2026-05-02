"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export function FreeDesignComparison() {
  const beforePoints = [
    "আগে পুরো টাকা দিতে হয়",
    "পছন্দ না হলে টাকা ফেরত নেই",
    "কাজ শেষ হতে ১-২ সপ্তাহ লাগে",
    "প্রিন্ট ও ডেলিভারি আলাদা ঝামেলা",
    "রিভিশনে extra চার্জ"
  ];

  const afterPoints = [
    "আগে ডিজাইন দেখুন, পছন্দ হলে পেমেন্ট",
    "পছন্দ না হলে একটাও টাকা লাগবে না",
    "মাত্র ৭২ ঘণ্টায় ডিজাইন রেডি",
    "প্রিন্ট, বাইন্ডিং ও কুরিয়ার সব একসাথে",
    "পছন্দমতো পরিবর্তন বিনামূল্যে"
  ];

  return (
    <section className="bg-white py-6 md:py-24 px-6 md:px-12 lg:px-24 font-bengali">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-[#F07C22] font-bold mb-4 block">পার্থক্যটা দেখুন</span>
          <h2 className="text-[#1A1A1A] text-4xl md:text-6xl font-serif mb-6 leading-tight">
            আগে এবং পরে
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-100"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200/50 rounded-full text-slate-500 text-sm font-bold mb-8">
              আগে — অন্য কোথাও
            </div>
            <ul className="flex flex-col gap-6">
              {beforePoints.map((point, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-500">
                  <X className="w-5 h-5 mt-1 flex-shrink-0 text-slate-300" />
                  <span className="text-lg leading-snug">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#FFF5EE] p-8 md:p-12 rounded-[3rem] border border-[#F07C22]/10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F07C22]/10 rounded-full text-[#F07C22] text-sm font-bold mb-8">
              পরে — MENUSNAP
            </div>
            <ul className="flex flex-col gap-6">
              {afterPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-4 text-[#1A1A1A]">
                  <Check className="w-5 h-5 mt-1 flex-shrink-0 text-[#F07C22]" />
                  <span className="text-lg font-bold leading-snug">{point}</span>
                </li>
              ))}
            </ul>
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
