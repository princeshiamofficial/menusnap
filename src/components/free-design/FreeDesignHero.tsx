"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Scissors, ChefHat, Sparkles, Flame, Utensils } from "lucide-react";

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
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-black to-slate-900 pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center w-full">
          
          <div className="relative flex justify-center lg:justify-start items-center order-2 lg:order-1 w-full">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full aspect-square max-w-[400px] lg:max-w-[450px]"
            >
              <Image
                src="/free-design-hero.png"
                alt="Digital Menu Card"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>

          {/* Right Content - Text & Stats */}
          <div className="flex flex-col items-start max-w-xl order-1 lg:order-2 lg:ml-auto">

            {/* Headline */}
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl leading-[1.2] font-serif mb-6 tracking-tight">
              তো সেলস হারাবেন আর কত?
            </h1>

            {/* Subtitle */}
            <div className="space-y-4 text-slate-400 text-sm md:text-base leading-relaxed font-medium">
              <p className="text-red-400 font-semibold border-l-2 border-red-500 pl-3">
                গড়ে বাংলাদেশের ৩৫% রেস্টুরেন্ট দেউলিয়া হওয়ার পথে।
              </p>
              <p>
                আমিও একসময় রেস্টুরেন্ট বিজনেস করেছি, কদমে কদমে হোঁচট খেয়েছি। হারিয়েছি বিজনেস, পড়েছি ঋণে।
              </p>
              <p className="text-[#F07C22] font-semibold border-l-2 border-[#F07C22] pl-3">
                তাই আমি দায়িত্ব নিয়েছি আপনার বিজনেসের প্রতিটি স্ট্রাগল ও পেইনফুল মোমেন্টকে স্মুথ জার্নিতে নিয়ে যেতে।
              </p>
            </div>
          </div>
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
