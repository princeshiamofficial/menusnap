"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitEbookLead } from '@/app/actions/ebook';

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30">
      {/* Hero Section / Chapter Overview */}
      <section className="relative pt-0 md:pt-24 pb-0 md:pb-40 overflow-hidden">
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

          <div className="lg:bg-transparent bg-white text-[#111] lg:text-white -mx-4 px-6 pt-16 pb-6 md:px-8 lg:p-0">
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
                  <a href="#download-section" className="bg-orange-600 text-white font-bold py-3.5 px-8 rounded-full shadow-xl shadow-orange-500/20 flex items-center gap-2 text-sm uppercase tracking-wider active:scale-95 transition-transform">
                    ইবুকটি ডাউনলোড করুন
                    <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </a>
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
      
      {/* Testimonials Section */}
      <section className="pt-16 pb-12 md:pb-32 px-6 relative z-10 bg-[#050505] md:bg-white text-white md:text-black -mx-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">রেস্টুরেন্ট মালিকরা কী বলছেন</h2>
            <div className="h-[2px] w-24 bg-orange-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "আরিফুল ইসলাম",
                role: "মালিক, চিল অ্যান্ড গ্রিল",
                text: "এই ইবুকটি পড়ার পর আমার রেস্টুরেন্টের মার্কেটিং করার ধরন পুরোপুরি বদলে গেছে। বিশেষ করে মেনু ইঞ্জিনিয়ারিং চ্যাপ্টারটি আমার প্রফিট অনেক বাড়িয়ে দিয়েছে।",
                avatar: "/avatars/ariful.png"
              },
              {
                name: "সাদিয়া রহমান",
                role: "ফাউন্ডার, দ্য পাস্তা হাট",
                text: "সোশ্যাল মিডিয়া নিয়ে অনেক কনফিউশন ছিল, কিন্তু এই গাইডে সব কিছু খুব সহজভাবে বুঝানো হয়েছে। রেস্টুরেন্ট ব্যবসার জন্য এটি একটি অসাধারণ রোডম্যাপ।",
                avatar: "/avatars/sadia.png"
              },
              {
                name: "রাকিবুল হাসান",
                role: "ম্যানেজার, ফুড এক্সপ্রেস",
                text: "অটোমেশন এবং কাস্টমার রিটেনশন চ্যাপ্টারটি আমাদের অপারেশনাল খরচ অনেক কমিয়ে দিয়েছে। নতুন এবং পুরাতন সব ব্যবসায়ীদের জন্য এটি মাস্ট-হ্যাভ।",
                avatar: "/avatars/rakibul.png"
              },
              {
                name: "ফারহান আহমেদ",
                role: "মালিক, বিরিয়ানি হাউস",
                text: "এই ইবুকটি শুধু একটি গাইড না, এটি রেস্টুরেন্ট ব্যবসার একটি পরিপূর্ণ রোডম্যাপ। কাস্টমার রিটেনশন নিয়ে এর চ্যাপ্টারগুলো অসাধারণ। মাত্র ১ মাসে আমার রিপিট কাস্টমার ২০% বেড়েছে।",
                avatar: "/avatars/farhan.png"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-white/5 md:border-gray-100 bg-white/[0.03] md:bg-gray-50 shadow-sm relative"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 md:border-gray-200">
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      width={48} 
                      height={48} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white md:text-gray-900">{testimonial.name}</h4>
                    <p className="text-xs text-gray-400 md:text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 md:text-gray-600 text-sm leading-relaxed font-light italic">
                  "{testimonial.text}"
                </p>
                <div className="mt-4 flex text-orange-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Lead Capture Section */}
      <section id="download-section" className="pt-12 pb-24 md:py-24 px-6 relative z-10 bg-[#0a0a0a] border-t border-white/5 -mx-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-2xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              আপনার ফ্রি কপিটি সংগ্রহ করুন
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              আপনার ইমেইল অ্যাড্রেসটি দিন, আমরা এখনই ইবুকটি <br className="hidden md:block" /> আপনার ইনবক্সে পাঠিয়ে দেব। 
            </p>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                
                const formData = new FormData(e.currentTarget as HTMLFormElement);
                const email = formData.get('email') as string;

                try {
                  const res = await submitEbookLead(email);
                  
                  if (res.success) {
                    toast({
                      title: "সফলভাবে পাঠানো হয়েছে!",
                      description: res.message,
                    });
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: res.error,
                    });
                  }
                } catch (err) {
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="max-w-2xl mx-auto flex flex-col md:flex-row gap-3 mt-10"
            >
              <input 
                type="email" 
                name="email"
                placeholder="আপনার ইমেইল লিখুন" 
                className="flex-[3] bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                required
                disabled={isSubmitting}
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-fit mx-auto md:mx-0 md:flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-500/20 whitespace-nowrap min-w-fit"
              >
                {isSubmitting ? "পাঠানো হচ্ছে..." : "ডাউনলোড করুন"}
              </button>
            </form>
            
            <div className="flex items-center justify-center gap-6 pt-8 opacity-40 grayscale">
              <Image src="/Ebook.png" alt="Ebook Mini" width={40} height={60} className="rounded-sm" />
              <div className="text-left text-xs text-gray-400">
                <p className="font-bold uppercase tracking-wider">Business Growth Guide</p>
                <p>By Color Hut • PDF • 1.6 MB</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
