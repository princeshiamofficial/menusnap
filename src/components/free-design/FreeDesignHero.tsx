"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Scissors, ChefHat, Sparkles, Flame, Utensils } from "lucide-react";
import { Albert_Sans } from "next/font/google";

const albert = Albert_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export function FreeDesignHero() {
  const brands = [
    { name: "Persona Salon", icon: Scissors },
    { name: "Sultans Dine", icon: ChefHat },
    { name: "Farzana Shakil's", icon: Sparkles },
    { name: "Takeout Metro", icon: Flame },
    { name: "Chillox Burgers", icon: Utensils },
    { name: "LUNA Kitchen", icon: ChefHat },
    { name: "Urban Cuts", icon: Scissors },
    { name: "Glow Spa", icon: Sparkles },
  ];

  return (
    <section className="w-full bg-white px-4 md:px-6 pt-4 pb-1 md:pt-8 md:pb-2 font-bengali">
      <div className="max-w-7xl mx-auto w-full bg-black rounded-3xl md:rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] px-6 py-6 md:py-8 md:px-12 lg:py-10 lg:px-20 relative overflow-hidden">
        {/* Background glow gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-black to-slate-900 pointer-events-none" />        {/* ROW: Coach Kanchon Quote Card */}
        <div className="relative z-10 grid md:grid-cols-12 gap-4 items-center w-full bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Card Background Image */}
          <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay">
            <img 
              src="/login-bg.png" 
              alt="Card Background" 
              className="w-full h-full object-cover filter blur-[1px]"
            />
          </div>
          {/* Left Column (Content) */}
          <div className="flex flex-col items-start text-left select-none relative z-20 md:col-span-8 md:pr-4">
            {/* Quote Icon */}
            <div className="mb-4">
              <img 
                src="/Asset-8-1.webp" 
                alt="Quote Icon" 
                className="w-[30px] h-[22px] object-contain"
              />
            </div>

            {/* Story Content */}
            <div className="space-y-4 mb-6">
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-2">
                তো সেলস হারাবেন আর কত?
              </h2>
              <div className="space-y-3.5 text-slate-300 text-sm md:text-base leading-relaxed font-medium">
                <p className="text-red-400 font-semibold border-l-2 border-red-500 pl-3">
                  গড়ে বাংলাদেশের ৩৫% রেস্টুরেন্ট দেউলিয়া হওয়ার পথে।
                </p>
                <p>
                  আমিও একসময় রেস্টুরেন্ট বিজনেস করেছি, কদমে কদমে হোঁচট খেয়েছি। হারিয়েছি বিজনেস, পড়েছি ঋণে।
                </p>
                <p className="text-[#F07C22] font-semibold border-l-2 border-[#F07C22] pl-3">
                  তাই আমি দায়িত্ব নিয়েছি আপনার বিজনেসের প্রতিটি স্ট্রাগল ও পেইন ফুল মোমেন্ট কে স্মুথ জার্নি তে নিয়ে যেতে।
                </p>
              </div>
            </div>

            {/* Signature Area */}
            <div className="flex flex-col items-start gap-1">
              <span className={`text-white text-xl md:text-2xl font-bold tracking-wide italic ${albert.className}`}>
                Abdul Awal
              </span>
              <img 
                src="/Asset-9-1.webp" 
                alt="Signature Underline" 
                className="w-[84px] h-[16px] object-contain mt-1"
              />
            </div>
          </div>

          {/* Right Column Spacer (to preserve layout grid column) */}
          <div className="hidden md:block md:col-span-4 h-full min-h-[300px]" />

          {/* Portrait Image absolute to Card Container */}
          <img 
            src="/abdul awal.png" 
            alt="Abdul Awal" 
            className="hidden md:block max-h-[340px] lg:max-h-[390px] w-auto object-contain absolute bottom-0 right-0 z-10"
          />
        </div>
        {/* Divider */}
        <div className="w-full h-[1px] bg-white/10 my-5 md:my-8 relative z-10" />

        {/* Trust Marquee Section */}
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F07C22] animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-300">
              Trusted by 5000+ Leading Restaurants & Salons
            </span>
          </div>

          {/* Marquee Wrapper with Fade Effect */}
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)] select-none">
            <div className="flex gap-4 w-max animate-marquee py-2">
              {[...brands, ...brands, ...brands].map((brand, i) => {
                const Icon = brand.icon;
                return (
                  <div 
                    key={i} 
                    className="flex items-center gap-2.5 px-6 py-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-colors duration-300"
                  >
                    <Icon className="w-4 h-4 text-[#F07C22]" />
                    <span className="text-white text-sm md:text-base font-semibold tracking-wide whitespace-nowrap">
                      {brand.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
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
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </section>
  );
}
