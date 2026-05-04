'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ChevronDown } from 'lucide-react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative w-full bg-[#F15A5A] overflow-hidden flex flex-col min-h-[600px] md:min-h-[750px]">
      {/* Background Texture (Denser Dot Pattern) */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, white 0.8px, transparent 0.8px)', 
          backgroundSize: '14px 14px' 
        }} 
      />

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[52%_48%] px-6 md:px-16 pt-12 md:py-[60px] items-center gap-12 md:gap-0 relative z-10 flex-grow">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6 md:gap-[28px] z-20 order-2 md:order-1 pb-16 md:pb-0">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[15px] md:text-[17px] font-semibold text-white tracking-[0.03em] uppercase"
          >
            Exclusive Offer 20% off This Week
          </motion.span>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[52px] md:text-[92px] font-[900] text-white leading-[0.95] max-w-[600px] tracking-tight"
          >
            Stylish <br /> Female Clothes
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.85, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[18px] md:text-[22px] font-medium text-white max-w-[500px] leading-relaxed"
          >
            Made from Sof, Durable, US- grown Supima Cotton.
          </motion.p>

          {/* Combined CTA Pill Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center bg-white/20 backdrop-blur-md border border-white/30 p-1.5 rounded-full w-fit max-w-full shadow-2xl shadow-black/10"
          >
            <div className="flex items-center">
              <Select>
                <SelectTrigger className="border-none bg-transparent h-12 px-4 md:px-8 text-white font-bold text-[16px] focus:ring-0 shadow-none ring-0">
                  <SelectValue placeholder="Select Catagory" />
                </SelectTrigger>
                <SelectContent className="bg-[#F15A5A] border-white/20 text-white">
                  <SelectItem value="dresses">Dresses</SelectItem>
                  <SelectItem value="tops">Tops</SelectItem>
                  <SelectItem value="bottoms">Bottoms</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/30 text-white mr-3">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>

            <Button 
              className="h-[52px] px-10 bg-white text-[#F15A5A] hover:bg-neutral-100 rounded-full font-[800] text-[16px] transition-all hover:scale-[1.03] active:scale-95 shadow-lg"
            >
              Shop Now
            </Button>
          </motion.div>

          {/* Social Proof Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-start gap-0 mt-8 max-w-[300px]"
          >
            {/* Avatars Row */}
            <div className="flex items-center -space-x-5 ml-4 -mb-10 z-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative w-[72px] h-[72px] rounded-full border-[5px] border-white overflow-hidden bg-neutral-100 shadow-xl">
                   <Image 
                    src="/oso/avatars.png" 
                    alt={`Avatar ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Content Card */}
            <div className="bg-white/20 backdrop-blur-xl pt-12 pb-5 px-8 rounded-[30px] w-full flex flex-col items-start gap-1 border border-white/20 shadow-xl">
              <span className="text-[17px] font-bold text-white">Our Happy Customer</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                  ))}
                </div>
                <span className="text-[15px] text-white font-semibold">8.5 (453k Reviews)</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="relative flex items-center justify-end h-full min-h-[400px] md:min-h-[600px] order-1 md:order-2">
          {/* Circle Backdrop */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.18 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute aspect-square w-[100%] md:w-[110%] rounded-full bg-white z-0 right-0 md:-right-10"
          />
          
          {/* Model Image - Using Masking to blend background */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full h-full flex items-center justify-end overflow-hidden"
            style={{
              maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)'
            }}
          >
            <div className="relative w-[110%] aspect-square max-w-[650px] md:-mr-10">
              <Image 
                src="/oso/hero-model-v3.png" 
                alt="Fashion model in red outfit"
                fill
                className="object-contain object-bottom select-none pointer-events-none scale-125"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="w-full bg-black/10 py-[20px] px-6 md:px-16 flex flex-row items-center gap-[20px] relative z-10 mt-auto">
        <span className="text-[16px] font-medium text-white opacity-90">Not Yet Member?</span>
        <button className="px-[30px] py-[12px] bg-white/20 border-[1.5px] border-white/50 text-white rounded-full text-[15px] font-bold hover:bg-white/30 transition-all active:scale-95 shadow-md">
          Sign Up Now
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
