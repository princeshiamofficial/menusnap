"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface FAQItem {
  q: string;
  a: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    q: "MenuSnap কী?",
    a: "MenuSnap হলো বাংলাদেশের প্রথম Restaurant Menu Research & Menu Builder SaaS প্ল্যাটফর্ম। এর মাধ্যমে আপনি দেশের 3,000+ জনপ্রিয় রেস্টুরেন্ট ও পার্লারের মেন্যু রেফারেন্স দেখতে পারবেন, 30,000+ খাবারের নাম ও ক্যাটাগরি রিসার্চ করতে পারবেন এবং আপনার নিজস্ব রেস্টুরেন্টের কমপ্লিট মেন্যু লিস্ট সাজিয়ে এক্সপোর্ট করতে পারবেন।",
  },
  {
    q: "MenuSnap-এ কতগুলো Menu Reference আছে?",
    a: "MenuSnap-এ বর্তমানে ঢাকা, চট্টগ্রামসহ বাংলাদেশের ৩,০০০টিরও বেশি জনপ্রিয় রেস্টুরেন্ট ও পার্লারের ভেরিফাইড মেন্যু রেফারেন্স এবং ৩০,০০০টিরও বেশি ফুড আইটেম ও ক্যাটাগরি ইনডেক্স করা রয়েছে, যা নিয়মিত আপডেট করা হয়।",
  },
  {
    q: "আমি কি অন্য Restaurant-এর Menu সরাসরি Copy করবো?",
    a: "না, হুবহু কপি করা রিকমেন্ডেড নয়। MenuSnap তৈরি করা হয়েছে আপনার রিসার্চ ও ডিসিশন নেওয়ার সুবিধার্থে—যাতে আপনি বুঝতে পারেন বাজারে কী ধরণের আইটেম চলছে, কোন ক্যাটাগরিগুলো কাস্টমাররা বেশি চায় এবং বাজারের প্রাইস রেঞ্জ কেমন। সেখান থেকে আইডিয়া নিয়ে আপনি নিজের মতো ইউনিক মেন্যু তৈরি করবেন।",
  },
  {
    q: "Displayed Price কি recommended selling price?",
    a: "না। MenuSnap-এ প্রদর্শিত মূল্য কেবল মার্কেট রেফারেন্সের জন্য। আপনার নিজস্ব ফুড কস্টিং, শেফ স্যালারি, লোকেশন ও প্রফিট মার্জিন বিবেচনা করে আপনাকে নিজস্ব বিক্রয়মূল্য নির্ধারণ করতে হবে।",
  },
  {
    q: "আমি কি নিজের Menu তৈরি করতে পারবো?",
    a: "হ্যাঁ, অবশ্যই! আপনি রিসার্চ করা আইটেমগুলো ‘+ Add to My Menu’ বাটনে ক্লিক করে নিজের মেন্যু লিস্টে যুক্ত করতে পারবেন, নাম ও বিবরণ এডিট করতে পারবেন, নিজের প্রাইস বসাতে পারবেন এবং ক্যাটাগরি অনুযায়ী সাজিয়ে নিতে পারবেন।",
  },
  {
    q: "Menu Export করা যাবে?",
    a: "হ্যাঁ! Pro এবং Agency সাবস্ক্রিপশনে আপনি যেকোনো সময় আপনার তৈরি করা সম্পূর্ণ মেন্যু লিস্টটি প্রিন্ট-রেডি PDF এবং Excel স্প্রেডশিট আকারে ওয়ান-ক্লিকে ডাউনলোড করে নিতে পারবেন।",
  },
  {
    q: "Agency Plan কার জন্য?",
    a: "Agency Plan তৈরি করা হয়েছে ফুড কনসালটেন্ট, ব্র্যান্ডিং এজেন্সি, মেন্যু ডিজাইনার এবং মাল্টি-ব্রাঞ্চ রেস্টুরেন্ট ওনারদের জন্য, যারা একাধিক ক্লায়েন্টের আলাদা আলাদা মেন্যু প্রজেক্ট একসাথে হ্যান্ডেল করতে চান।",
  },
  {
    q: "Subscription কতদিনের?",
    a: "MenuSnap-এ ১ মাস এবং ৩ মাসের সাবস্ক্রিপশন অপশন রয়েছে। ৩ মাসের প্ল্যানে Launch Offer এবং বিশেষ ছাড় দেওয়া হয়, যা আপনার খরচ অনেকটাই কমিয়ে দেয়।",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    const next = openIndex === idx ? null : idx;
    setOpenIndex(next);
    if (next !== null) {
      trackEvent("faq_opened", { questionIndex: idx, question: FAQ_LIST[idx].q });
    }
  };

  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-[900px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <HelpCircle className="w-3.5 h-3.5" />
          Common Questions
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight mb-4">
          সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-xl mx-auto mb-14">
          Got questions about MenuSnap? Here are the answers to the most common queries.
        </p>

        {/* Accordion List */}
        <div className="space-y-3.5 text-left">
          {FAQ_LIST.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? "border-orange-300 bg-orange-50/20 shadow-2xs"
                    : "border-gray-200 bg-[#FAFAF8] hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors"
                >
                  <span className="text-base font-bold text-gray-950 font-bengali pr-4">
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180 bg-orange-100 text-[#FF5A36]" : "bg-white text-gray-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-sm text-gray-600 font-bengali leading-relaxed border-t border-gray-100/80">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
