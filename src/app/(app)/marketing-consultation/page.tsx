"use client";

import React, { useState } from "react";
import { 
  Users, 
  Layers, 
  Heart, 
  AlertCircle, 
  Check, 
  Star
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { Hind_Siliguri, Tiro_Bangla } from "next/font/google";
import { useClientAuth } from "@/hooks/use-client-auth";
import { useEffect } from "react";

const hindSiliguri = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
});

const tiroBangla = Tiro_Bangla({
  subsets: ["latin", "bengali"],
  weight: ["400"],
  variable: "--font-tiro",
});

import { ClientGate } from "@/components/auth/ClientGate";

export default function MarketingConsultationPage() {
  const router = useRouter();
  const { clientUser } = useClientAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bizType: "",
    problem: ""
  });

  useEffect(() => {
    if (clientUser) {
      setFormData(prev => ({
        ...prev,
        name: clientUser.businessName || prev.name,
        phone: clientUser.whatsappNumber || prev.phone,
        bizType: clientUser.type || prev.bizType
      }));
    }
  }, [clientUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.bizType || !formData.problem) {
      alert("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }
    
    // In a real app, you'd call a server action here
    router.push('/success?type=consultation');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ClientGate>
      <div className={`${hindSiliguri.className} bg-white text-[#1A1A1A] min-h-screen`}>
        
        {/* HERO */}
        <section className="relative overflow-hidden bg-white border-b border-[#F0F0F0]" id="hero">
          
          {/* Animated Background Circle Lines */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[700px] flex items-center justify-center pointer-events-none select-none overflow-hidden">
            
            {/* Inner Circle - High-Tech Satellite */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-[280px] h-[280px] sm:w-[450px] sm:h-[450px] border border-dashed border-[#D85A30]/20 rounded-full"
            >
              {/* Primary Orange Satellite */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
                 <div className="w-4 h-[1px] bg-[#D85A30]/40" /> {/* Left Panel */}
                 <div className="relative w-3 h-3 bg-[#D85A30] rounded-sm transform rotate-45 shadow-[0_0_15px_rgba(216,90,48,0.5)]">
                    {/* Blinking Light */}
                    <motion.div 
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0.5 bg-white rounded-full opacity-80"
                    />
                 </div>
                 <div className="w-4 h-[1px] bg-[#D85A30]/40" /> {/* Right Panel */}
              </div>
            </motion.div>

            {/* Middle Circle - Dual Research Satellites */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute w-[450px] h-[450px] sm:w-[700px] sm:h-[700px] border border-dashed border-[#30AFD8]/10 rounded-full"
            >
              {/* Blue Satellite */}
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-[1px] h-3 bg-[#30AFD8]/40" />
                 <div className="w-2.5 h-2.5 bg-[#30AFD8] rounded-full shadow-[0_0_10px_rgba(48,175,216,0.6)]" />
                 <div className="w-[1px] h-3 bg-[#30AFD8]/40" />
              </div>
              
              {/* Green Satellite */}
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-[1px] h-3 bg-[#22c55e]/40" />
                 <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                 <div className="w-[1px] h-3 bg-[#22c55e]/40" />
              </div>
            </motion.div>

            {/* Outer Circle - Distant Comm-Links */}
            <motion.div 
              animate={{ rotate: 180 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
              className="absolute w-[650px] h-[650px] sm:w-[950px] sm:h-[950px] border border-dashed border-[#8b5cf6]/5 rounded-full"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
                <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                <div className="ml-1 w-3 h-[0.5px] bg-[#8b5cf6]/30" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center">
                <div className="mr-1 w-3 h-[0.5px] bg-[#f59e0b]/30" />
                <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              </div>
            </motion.div>

            {/* Center Hub Pulsing Field */}
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-[#D85A30]/10 rounded-full blur-[80px]"
            />
          </div>

          <div className="px-[5%] pt-20 pb-24 text-center max-w-[900px] mx-auto relative z-10">
            <div className="inline-block px-4 py-1.5 bg-[#FEF3EE] text-[#D85A30] text-[11px] font-bold uppercase tracking-widest rounded-full mb-6">
               Hospitality Growth Partner
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-[#1A1A1A] mb-6">
              আপনার স্বপ্ন, আমাদের<br />
              <span className="text-[#D85A30]">স্ট্র্যাটেজিক মিশন</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#555] max-w-[640px] mx-auto leading-relaxed mb-12">
              বাংলাদেশি Hospitality বিজনেসের প্রবৃদ্ধি নিশ্চিত করতে আমরা প্রদান করি প্রফিট-ফোকাসড এবং সাস্টেইনেবল **বিজনেস স্ট্র্যাটেজি কনসাল্টিং**।
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button 
                onClick={() => scrollToSection("cta")}
                className="w-full sm:w-auto bg-[#D85A30] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#993C1D] transition-colors shadow-xl shadow-[#D85A30]/20"
              >
                ফ্রি কনসাল্টেশন কল
              </button>
              <button 
                onClick={() => scrollToSection("how")}
                className="w-full sm:w-auto bg-white border border-[#E8E4DE] text-[#1A1A1A] px-10 py-4 rounded-xl font-bold hover:bg-[#F9F7F5] transition-colors"
              >
                আমাদের মেথডোলজি
              </button>
            </div>
          </div>
        </section>

        {/* PROBLEMS */}
        <section className="py-20 px-[5%] bg-[#F9F7F5]" id="problem">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#1A1A1A]">কেন আমাদের কনসালটিং প্রয়োজন?</h2>
              <p className="text-[#666]">অদক্ষ মার্কেটিং বা ভুল পরিকল্পনার কারণে আপনার বিজনেসের প্রফিট মার্জিন কমে যাচ্ছে কি?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { icon: "/strategy/profit.png", title: "প্রফিট অপ্টিমাইজেশন", desc: "বিজনেসের খরচ কমিয়ে কীভাবে নিট মুনাফা বাড়ানো যায় তার স্ট্র্যাটেজিক পরামর্শ।" },
                { icon: "/strategy/roadmap.png", title: "অপারেশনাল রোডম্যাপ", desc: "টিম ম্যানেজমেন্ট এবং কাস্টমার সার্ভিস উন্নত করার জন্য সুনির্দিষ্ট গাইডলাইন।" },
                { icon: "/strategy/positioning.png", title: "ব্র্যান্ড পজিশনিং", desc: "বাজারে হাজারো প্রতিযোগীর ভিড়ে কীভাবে আপনার বিজনেসকে আলাদা করবেন তার রোডম্যাপ।" },
                { icon: "/strategy/growth.png", title: "সাসটেইনেবল গ্রোথ", desc: "সাময়িক ভাইরাল হওয়া নয়, বরং দীর্ঘমেয়াদী প্রবৃদ্ধির জন্য স্থায়ী বিজনেস প্ল্যান।" }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="bg-white p-7 rounded-[32px] border border-[#E8E4DE] hover:border-[#D85A30]/30 transition-all hover:shadow-2xl hover:shadow-[#000000]/05 group relative overflow-hidden flex items-center min-h-[160px] md:min-h-[180px]"
                >
                  <div className="flex-1 relative z-20 pr-16 sm:pr-24">
                    <h3 className="text-xl sm:text-2xl xl:text-lg font-black mb-2 text-[#0F172A] leading-tight">{item.title}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed line-clamp-3">{item.desc}</p>
                  </div>
                  <div className="absolute right-[-45px] bottom-[-40px] w-32 h-32 sm:w-48 sm:h-48 flex shrink-0 items-center justify-center z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                     <div className="absolute inset-0 bg-[#D85A30]/5 rounded-full blur-3xl" />
                     <img 
                      src={item.icon} 
                      alt={item.title} 
                      className="w-full h-full object-contain relative z-20" 
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* APPROACH */}
        <section className="py-20 px-[5%]" id="how">
          <div className="max-w-[800px] mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-[#1A1A1A]">আমাদের কনসালটিং প্রসেস</h2>
            <div className="space-y-6">
              {[
                { n: "১", t: "বিজনেস অডিট", d: "আপনার বিজনেসের বর্তমান লাভ-ক্ষতি, কাস্টমার ফিডব্যাক এবং ইন্টারনাল অপারেশন বিশ্লেষণ করা।" },
                { n: "২", t: "স্ট্র্যাটেজি ডিজাইন", d: "আগামী ২-৪ কোয়ার্টারের জন্য একটি কম্প্রিহেনসিভ বিজনেস গ্রোথ রোডম্যাপ তৈরি করা।" },
                { n: "৩", t: "ব্লুপ্রিন্ট হ্যান্ড-অফ", d: "আমরা আপনাকে একটি পুর্ণাঙ্গ গাইডলাইন দিই যা আপনি আপনার বর্তমান টিম দিয়ে বাস্তবায়ন করতে পারবেন।" }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 p-6 border border-[#E8E4DE] rounded-2xl bg-[#F9F7F5]">
                  <div className="w-10 h-10 rounded-full bg-[#D85A30] text-white flex items-center justify-center font-bold shrink-0">{step.n}</div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{step.t}</h4>
                    <p className="text-[#666]">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 px-[5%] bg-[#F9F7F5] border-t border-[#E8E4DE]">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">সফল ক্লায়েন্টদের কথা</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "রাহেলা বেগম", quote: "তাদের স্ট্র্যাটেজিক ব্লুপ্রিন্ট আমাদের বিজনেসের পুরো মোড় ঘুরিয়ে দিয়েছে। এখন আমাদের কাছে একটি সুনির্দিষ্ট রোডম্যাপ আছে।" },
                { name: "আরিফ হোসেন", quote: "কনসাল্টেশন নেওয়ার পর আমাদের অপারেশনাল খরচ কমেছে এবং প্রফিট মার্জিন বেড়েছে। অসাধারণ গাইডলাইন!" },
                { name: "সুমাইয়া আক্তার", quote: "আগে আমাদের কোনো সঠিক প্ল্যান ছিল না। তাদের স্ট্র্যাটেজিক রোডম্যাপ আমাদের টিমকে একটি লক্ষ্য দিয়েছে।" }
              ].map((t, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-[#E8E4DE]">
                  <div className="flex gap-1 mb-4 text-[#D85A30]">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className={`${tiroBangla.className} text-lg mb-6 text-[#444]`}>"{t.quote}"</p>
                  <div className="font-bold text-sm text-[#1A1A1A]">— {t.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-[5%] bg-white" id="cta">
            <div className="max-w-[700px] mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">আপনার সফলতার যাত্রা শুরু হোক</h2>
              <p className="text-[#666] mb-12">একটি ফ্রি মিটিং করার মাধ্যমে আজকের দিনটি আপনার বিজনেসের জন্য টার্নিং পয়েন্ট হতে পারে।</p>
              
              <div className="text-left">
                <form onSubmit={handleSubmit} className="space-y-6">
                {clientUser ? (
                  <div className="flex flex-col md:flex-row gap-6 items-end text-left mb-6 max-w-2xl mx-auto">
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-sm font-bold text-[#1A1A1A] ml-1">প্রধান লক্ষ্য</label>
                      <select 
                         className="w-full px-5 py-3.5 bg-white border border-[#E8E4DE] rounded-xl outline-none focus:border-[#D85A30] transition-colors shadow-sm"
                         required
                         value={formData.problem}
                         onChange={e => setFormData({...formData, problem: e.target.value})}
                      >
                        <option value="">নির্বাচন করুন</option>
                        <option>কাস্টমার বাড়ানো</option>
                        <option>ব্র্যান্ড পরিচিতি</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="w-full md:w-auto md:px-12 bg-[#D85A30] text-white py-4 rounded-xl font-bold hover:bg-[#993C1D] transition-colors shadow-lg shadow-[#D85A30]/20 shrink-0"
                    >
                      বুকিং নিশ্চিত করুন
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#F9F7F5] p-8 sm:p-12 rounded-[32px] border border-[#E8E4DE]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1A1A1A]">আপনার নাম</label>
                        <input 
                          type="text" 
                          placeholder="আপনার নাম"
                          className="w-full px-5 py-3.5 bg-white border border-[#E8E4DE] rounded-xl outline-none focus:border-[#D85A30] transition-colors"
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1A1A1A]">ফোন নম্বর</label>
                        <input 
                          type="tel" 
                          placeholder="ফোন নম্বর"
                          className="w-full px-5 py-3.5 bg-white border border-[#E8E4DE] rounded-xl outline-none focus:border-[#D85A30] transition-colors"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1A1A1A]">বিজনেসের ধরন</label>
                        <select 
                           className="w-full px-5 py-3.5 bg-white border border-[#E8E4DE] rounded-xl outline-none focus:border-[#D85A30] transition-colors"
                           required
                           value={formData.bizType}
                           onChange={e => setFormData({...formData, bizType: e.target.value})}
                        >
                          <option value="">নির্বাচন করুন</option>
                          <option value="restaurant">রেস্টুরেন্ট / ক্যাফে</option>
                          <option value="parlour">বিউটি পার্লার / সেলুন</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-[#1A1A1A]">প্রধান লক্ষ্য</label>
                        <select 
                           className="w-full px-5 py-3.5 bg-white border border-[#E8E4DE] rounded-xl outline-none focus:border-[#D85A30] transition-colors"
                           required
                           value={formData.problem}
                           onChange={e => setFormData({...formData, problem: e.target.value})}
                        >
                          <option value="">নির্বাচন করুন</option>
                          <option>কাস্টমার বাড়ানো</option>
                          <option>ব্র্যান্ড পরিচিতি</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-center pt-8">
                      <button 
                        type="submit"
                        className="w-full sm:w-[280px] bg-[#D85A30] text-white py-4 rounded-xl font-bold hover:bg-[#993C1D] transition-colors shadow-lg shadow-[#D85A30]/20"
                      >
                        বুকিং নিশ্চিত করুন
                      </button>
                    </div>
                  </div>
                )}
                </form>
            </div>
          </div>
        </section>

      </div>
    </ClientGate>
  );
}
