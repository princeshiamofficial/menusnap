"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FreeDesignTestimonials() {
  const testimonials = [
    {
      initial: "র",
      name: "রাহেলা বেগম",
      role: "ক্যাফে মালিক, ঢাকা",
      quote: "শুরুতে ফ্রি ডিজাইনের কথা শুনে একটু খটকা লেগেছিল, ভেবেছিলাম কোনো মারপ্যাঁচ আছে। কিন্তু কাজটা দেখার পর আমার সব ভুল ভেঙে গেল। এখন ক্যাফেতে আসা কাস্টমাররা মেনু কার্ড হাতে নিয়ে যখন প্রশংসা করে, তখন মনে হয় ডিসিশনটা ঠিক ছিল।"
    },
    {
      initial: "আ",
      name: "আরিফ হোসেন",
      role: "রেস্টুরেন্ট ওনার, চট্টগ্রাম",
      quote: "আমাদের রেস্টুরেন্টের মেইন আইটেম গুলোর বিক্রি কেন যেন বাড়ছিল না। MenuSnap টিমকে জানানোর পর তারা মেনুতে ওগুলো এমনভাবে হাইলাইট করল যে এখন কাস্টমাররা ওগুলোই বেশি অর্ডার দিচ্ছে। আমাদের প্রফিটও এখন আগের চেয়ে অনেক বেশি।"
    },
    {
      initial: "সু",
      name: "সুমাইয়া আক্তার",
      role: "বিউটি পার্লার, ঢাকা",
      quote: "পার্লারের প্রাইজ লিস্টটা আগে একটু অগোছালো ছিল, কাস্টমাররা প্রিমিয়াম সার্ভিসের জন্য ভরসা পেত না। কিন্তু এখনকার নতুন আর প্রফেশনাল ডিজাইন দেখে কাস্টমারদের মাইন্ডসেটই পাল্টে গেছে। এখন কোনো দামাদামি ছাড়াই তারা আমাদের সেরা সার্ভিসগুলো বুক করছে।"
    }
  ];

  return (
    <section className="bg-[#FAF9F6] py-6 md:py-24 px-6 md:px-12 lg:px-24 font-bengali border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-[#F07C22] font-bold mb-4 block uppercase tracking-widest text-sm">আসল অভিজ্ঞতা</span>
          <h2 className="text-[#1A1A1A] text-4xl md:text-5xl font-serif mb-6 leading-tight">
            তাঁরা কেন আমাদের ওপর ভরসা করেছেন?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-2.5"
            >
              <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:border-[#F07C22]/20 transition-colors">
                <Quote className="w-10 h-10 text-[#F07C22]/5 absolute top-4 left-4" />
                <div className="flex items-center gap-1 mb-2 relative z-10">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-[#F07C22] text-[#F07C22]" />
                  ))}
                </div>
                <p className="text-[#1A1A1A] text-[14px] leading-relaxed italic relative z-10">
                  &quot;{t.quote}&quot;
                </p>
              </div>
              
              <div className="flex items-center gap-3 px-4">
                <div className="w-10 h-10 bg-[#F07C22]/10 rounded-full flex items-center justify-center text-[#F07C22] font-bold text-lg flex-shrink-0">
                  {t.initial}
                </div>
                <div>
                  <h4 className="text-[#1A1A1A] font-bold text-sm leading-none mb-1">{t.name}</h4>
                  <p className="text-slate-400 text-[12px] leading-none">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
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
