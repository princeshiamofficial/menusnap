"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

const chapters = [
  {
    number: "CHAPTER 1",
    icon: "📸",
    title: "ফুড ফটোগ্রাফি",
    description: "প্রাকৃতিক আলো, সঠিক অ্যাঙ্গেল এবং প্রপস ব্যবহার করে কাস্টমারের ক্ষুধা জাগিয়ে তোলার কৌশল।"
  },
  {
    number: "CHAPTER 2",
    icon: "📱",
    title: "সোশ্যাল মিডিয়া মার্কেটিং",
    description: "ফেসবুক ও ইনস্টাগ্রামে নিয়মিত পোস্ট, টার্গেটেড অ্যাড এবং ইউজার জেনারেটেড কন্টেন্টের সঠিক ব্যবহার।"
  },
  {
    number: "CHAPTER 3",
    icon: "🎬",
    title: "ভিডিও কন্টেন্ট",
    description: "Behind-the-scene ক্লিপ, ফুড প্রিপারেশন Reels এবং কাস্টমার রিভিউ — যা বিক্রি বাড়ায়।"
  },
  {
    number: "CHAPTER 4",
    icon: "🔍",
    title: "Local SEO ও Google Maps",
    description: "\"Best Restaurant near me\" সার্চে প্রথমে থাকতে Google Business Profile, রিভিউ ও লোকাল কীওয়ার্ড।"
  },
  {
    number: "CHAPTER 5",
    icon: "⚙️",
    title: "রেস্টুরেন্ট অটোমেশন",
    description: "Smart POS, অনলাইন অর্ডার সিস্টেম, KDS এবং কাস্টমার ডেটাবেজ দিয়ে কাজের চাপ কমান।"
  },
  {
    number: "CHAPTER 6",
    icon: "🏆",
    title: "৭ সাকসেস ফর্মুলা",
    description: "ওয়েটার ট্রেনিং, আপ-সেলিং, বান্ডেল অফার, স্টুডেন্ট ডিল, কর্পোরেট গেস্ট — সব কৌশল একসাথে।"
  },
  {
    number: "CHAPTER 7",
    icon: "📋",
    title: "মেনু ইঞ্জিনিয়ারিং",
    description: "BCG Matrix দিয়ে Stars, Plowhorses, Puzzles, Low আইটেম চিহ্নিত করে মুনাফা বাড়ান।"
  },
  {
    number: "CHAPTER 8",
    icon: "💛",
    title: "কাস্টমার রিটেনশন",
    description: "লয়্যালটি প্রোগ্রাম, SMS মার্কেটিং এবং পার্সোনালাইজেশন দিয়ে পুরোনো কাস্টমার ধরে রাখুন।"
  }
];


export default function EBookPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30">
      {/* Hero Section / Chapter Overview */}
      <section className="relative pt-0 md:pt-24 pb-40 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="hidden md:block max-w-4xl mx-auto text-center mb-16 md:mb-24 px-4">
            <div className="w-fit mx-auto text-center mb-3">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight whitespace-nowrap mb-1">
                রেস্টুরেন্ট ডিজিটাল সাকসেস গাইড
              </h1>
              <div className="h-[2px] w-full bg-orange-500/50" />
            </div>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              আপনার রেস্টুরেন্টকে ব্র্যান্ডে পরিণত করার সম্পূর্ণ রোডম্যাপ।
            </p>
          </div>

          <div className="lg:bg-transparent bg-white text-[#111] lg:text-white -mx-4 px-4 py-16 md:px-8 lg:p-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-4 items-center max-w-6xl mx-auto">
            {/* Left Chapters */}
            <div className="lg:col-span-3 space-y-10 md:space-y-14 order-2 lg:order-1">
              {chapters.slice(0, 4).map((chapter, index) => (
                <div 
                  key={index}
                  className="text-center lg:text-right"
                >
                  <h4 className="text-lg font-bold text-black lg:text-white mb-2">{chapter.title}</h4>
                  <p className="text-gray-600 lg:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto lg:ml-auto lg:mr-0 font-light">
                    {chapter.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Center Ebook Cover */}
            <div className="lg:col-span-6 flex justify-center order-1 lg:order-2 mb-4 lg:mb-0">
              <div className="relative px-4 md:px-0">
                <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-white/5">
                  <Image 
                    src="/Ebook.png" 
                    alt="Restaurant Digital Success Ebook Cover" 
                    width={600} 
                    height={840}
                    priority
                    className="w-full max-w-[350px] md:max-w-[450px] lg:max-w-[520px] h-auto object-cover rounded-sm"
                  />
                </div>
                {/* Download Button */}
                <div className="mt-8 flex justify-center">
                  <button className="bg-orange-600 text-white font-bold py-3.5 px-8 rounded-full shadow-xl shadow-orange-500/20 flex items-center gap-2 text-sm uppercase tracking-wider active:scale-95 transition-transform">
                    ইবুকটি ডাউনলোড করুন
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>


            {/* Right Chapters */}
            <div className="lg:col-span-3 space-y-10 md:space-y-14 order-3">
              {chapters.slice(4, 8).map((chapter, index) => (
                <div 
                  key={index}
                  className="text-center lg:text-left"
                >
                  <h4 className="text-lg font-bold text-black lg:text-white mb-2">{chapter.title}</h4>
                  <p className="text-gray-600 lg:text-gray-400 text-sm leading-relaxed max-w-xs mx-auto lg:ml-0 font-light">
                    {chapter.description}
                  </p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
