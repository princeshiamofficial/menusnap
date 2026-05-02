"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Globe, ShieldCheck, Zap } from "lucide-react";

export default function TeamTrackerCaseStudy() {
  const benefits = [
    { icon: <Globe className="w-6 h-6 text-[#F07C22]" />, text: "মাল্টি-লোকেশন সাপোর্ট" },
    { icon: <ShieldCheck className="w-6 h-6 text-[#F07C22]" />, text: "১০০% নির্ভুল ট্র্যাকিং" },
    { icon: <Zap className="w-6 h-6 text-yellow-500" />, text: "পেরোল ও ইআরপি ইন্টিগ্রেশন" },
  ];

  return (
    <section id="case-study" className="py-24 px-6 md:px-12 lg:px-24 bg-white dark:bg-slate-950 overflow-hidden font-bengali">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <div className="aspect-square relative">
              <Image 
                src="/team-tracker-case-study.png" 
                alt="Smart Attendance Case Study" 
                fill 
                className="object-cover"
              />
            </div>
            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </motion.div>

          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-8"
          >
            <div>
              <h2 className="text-[#F07C22] text-lg font-bold uppercase tracking-widest mb-4">
                প্রফেশনাল সলিউশন
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.2] mb-6">
                যেকোনো স্কেলের ব্যবসার জন্য স্মার্ট টিম ম্যানেজমেন্ট
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed">
                মেনুস্ন্যাপ-এর স্মার্ট অ্যাটেনডেন্স এবং টিম ট্র্যাকিং প্রযুক্তি এখন বড় বড় ফ্র্যাঞ্চাইজি এবং মাল্টি-লোকেশন ব্যবসার ম্যানেজমেন্টকে আরও সহজ করে তুলেছে।
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                জিও-লকিং ফিচারের মাধ্যমে নিশ্চিত করা হয় যে কর্মীরা নির্দিষ্ট কাজের জায়গা থেকেই অ্যাটেনডেন্স দিচ্ছে। এটি পেরোল প্রসেসিং এবং ইআরপি সলিউশনের জন্য নির্ভুল ডেটা প্রদান করে, যা আপনার রেস্টুরেন্ট বা ব্যবসার অপারেশনাল দক্ষতা বহুগুণ বাড়িয়ে দেয়।
              </p>

              <div className="grid sm:grid-cols-1 gap-4 pt-4">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                    <div className="flex-shrink-0">{benefit.icon}</div>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
