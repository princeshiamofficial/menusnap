"use client";

import { motion } from "framer-motion";
import Script from "next/script";

export function FreeDesignFeatures() {
  const pricingData: { title: string; price: string; highlight?: boolean }[] = [
    { title: "১০ পেইজ ডিজাইন চার্জ (৩০০ × ১০)", price: "৳ ৩,০০০" },
    { title: "৫টি রিভিশন (২০০ × ৫)", price: "৳ ১,০০০" },
    { title: "পাঁচ বছরের অভিজ্ঞ ডিজাইনারের কনসালটেন্সি", price: "৳ ২০০" },
    { title: "মেনু লিস্ট কম্পিউটার কম্পোজ", price: "৳ ২০০" },
    { title: "প্রাইজ এবং রং রাইটিং চেক", price: "৳ ২০০" },
    { title: "হাই কোয়ালিটি (HD) সোশ্যাল ইউজ ফাইল", price: "৳ ৫০০" }
  ];

  return (
    <section id="features" className="scroll-mt-[120px] bg-white pt-3 pb-6 md:pt-5 md:pb-10 px-6 md:px-12 lg:px-24 border-t border-slate-100 font-bengali">
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="afterInteractive" />
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-[#1A1A1A] text-[20px] sm:text-3xl md:text-5xl font-bengali mb-6 leading-tight">
            ডিজাইন ও সার্ভিস মূল্য তালিকা
          </h2>
          <p className="text-[#666666] text-lg md:text-xl max-w-2xl mx-auto font-medium">
            ডিজাইন পছন্দ হলে তবেই পেমেন্ট করবেন — এটাই আমাদের প্রতিশ্রুতি। আমাদের ডিজাইন ও সার্ভিসের বিবরণ নিচে দেখে নিন।
          </p>
        </div>

        {/* Pricing Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full overflow-hidden rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-[#FAF9F6] p-3 md:p-5"
        >
          <div className="space-y-1">
            {pricingData.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-200/60 last:border-0 hover:bg-slate-100/10 px-2 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full border-[2.5px] border-[#F07C22] flex items-center justify-center text-[#F07C22]">
                    <i className="fa-solid fa-check text-xs" />
                  </div>
                  <span className="text-[#1A1A1A] text-sm md:text-base font-semibold font-bengali">
                    {item.title}
                  </span>
                </div>
                <span className="text-right text-sm md:text-base font-semibold text-[#1A1A1A] shrink-0 font-bengali">
                  {item.price}
                </span>
              </div>
            ))}

            {/* Total Row */}
            <div className="flex items-center justify-between gap-4 pt-4 mt-3 border-t-2 border-dashed border-slate-300 px-2">
              <span className="text-[#1A1A1A] text-base md:text-lg font-bold font-bengali">
                মোট মূল্য (Total Price)
              </span>
              <span className="text-right text-base md:text-lg font-bold text-[#F07C22] font-bengali">
                ৳ ৫,১০০
              </span>
            </div>
          </div>
        </motion.div>

        {/* Hot Offer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-6 w-full overflow-hidden rounded-2xl border border-red-600/30 shadow-[0_15px_40px_rgba(220,38,38,0.15)] bg-black py-1.5 px-2 sm:py-2 sm:px-4 flex flex-row items-center justify-between gap-2 sm:gap-4 font-bengali"
        >
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-black bg-neutral-900 border border-red-500/30 text-white uppercase tracking-wider whitespace-nowrap">
              🔥 <span className="animate-fire text-[#FFEA00]">Hot Offer</span>
            </span>
            <span className="text-white text-[10px] sm:text-lg font-bold whitespace-nowrap">
              সম্পূর্ণ প্যাকেজ ও সার্ভিস চার্জ
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Lottie Discount Animation */}
            <lottie-player
              src="/discount-animation.json"
              background="transparent"
              speed="1"
              className="w-10 h-10 sm:w-16 sm:h-16 shrink-0"
              loop
              autoplay
            />
            {/* Vertically Stacked Prices */}
            <div className="flex flex-col items-end justify-center gap-0.5 sm:gap-1">
              <span className="text-white text-base sm:text-2xl font-semibold whitespace-nowrap">
                ৳{" "}
                <span className="relative px-0.5">
                  ৫,১০০
                  <span className="absolute left-[-2px] right-[-2px] top-[35%] h-[8px] md:h-[12px] border-t-2 md:border-t-[3px] border-red-500 rounded-[50%] -rotate-[6deg] pointer-events-none" />
                </span>
              </span>
              <span className="text-xs sm:text-lg font-bold text-[#caa460] whitespace-nowrap">
                ৳ ১,০০০
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-bengali {
          font-family: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif;
        }
        @keyframes fire-glow {
          0%, 100% {
            text-shadow: 
              0 0 4px #ff2a00,
              0 -2px 8px #ff7b00,
              0 -4px 12px #ffea00;
          }
          50% {
            text-shadow: 
              0 0 6px #ff2a00,
              0 -4px 10px #ff7b00,
              0 -6px 16px #ffea00;
          }
        }
        .animate-fire {
          animation: fire-glow 1.2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
