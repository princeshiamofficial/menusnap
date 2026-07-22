"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function SocialsGallery() {
  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-background">
      {/* Title */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-foreground">
          Our Happy Clients
        </h2>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* ================= COLUMN 1 (LEFT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {/* Card A: Large Green Paper with ESTHER Cover */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            className="relative h-[340px] sm:h-[380px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer"
          >
            <Image
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"
              alt="Book of Esther Cover Design"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Card B: Open Book on Table */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            className="relative h-[160px] sm:h-[180px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer"
          >
            <Image
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
              alt="Open Menu Book Showcase"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </motion.div>
        </div>

        {/* ================= COLUMN 2 (CENTER-LEFT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {/* Top Sub-Row: 2 Small Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {/* Card C1: Book Cover mockup in light box */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative h-[160px] sm:h-[180px] rounded-[24px] bg-[#f4f4f2] dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 p-4 flex items-center justify-center shadow-sm group cursor-pointer overflow-hidden"
            >
              <div className="relative w-20 h-28 rounded-xl shadow-md overflow-hidden bg-white dark:bg-neutral-800 p-2.5 flex flex-col justify-between border border-neutral-200/80 dark:border-neutral-700 group-hover:scale-105 transition-transform duration-500">
                <div className="flex flex-col text-left pl-0.5 pt-0.5">
                  <span className="text-[9px] font-mono tracking-[0.2em] font-extrabold uppercase text-neutral-800 dark:text-neutral-200 leading-none mb-0.5">BOOK</span>
                  <span className="text-[9px] font-mono tracking-[0.2em] font-extrabold uppercase text-neutral-800 dark:text-neutral-200 leading-none">COVER</span>
                </div>
                <div className="w-full h-14 rounded-lg bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 overflow-hidden relative shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.7)_1.5px,transparent_1.5px)] [background-size:6px_6px]" />
                </div>
              </div>
            </motion.div>

            {/* Card C2: Stacked Paper Texture */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              className="relative h-[160px] sm:h-[180px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer"
            >
              <Image
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80"
                alt="Stacked Pages Texture"
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </motion.div>
          </div>

          {/* Card D: Large PSALMS Soft Blurred Backdrop Card */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            className="relative h-[340px] sm:h-[380px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-gradient-to-b from-emerald-900/10 via-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-950 group cursor-pointer flex flex-col justify-end items-center p-6"
          >
            <Image
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
              alt="Soft Landscape Backdrop"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover blur-[2px] opacity-70 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Embedded Book Cover Mockup at bottom */}
            <div className="relative z-10 w-44 sm:w-48 h-36 bg-white dark:bg-neutral-900 rounded-t-xl shadow-2xl border-t border-x border-white/60 dark:border-neutral-700 p-3 flex flex-col items-center text-center translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-[10px] tracking-[0.2em] font-serif uppercase text-neutral-500 font-medium">Book of</span>
              <h4 className="text-sm font-serif tracking-widest font-bold uppercase text-neutral-800 dark:text-neutral-100 mb-2">PSALMS</h4>
              <div className="relative w-full h-16 rounded overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80"
                  alt="Psalms landscape"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ================= COLUMN 3 (RIGHT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {/* Card E: Large PSALMS Cover with Flower Twig */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            className="relative h-[340px] sm:h-[380px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer"
          >
            <Image
              src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
              alt="Psalms Book Cover with Floral Element"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </motion.div>

          {/* Bottom Sub-Row: 2 Small Cards F & G */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {/* Card F: Small ESTHER Green Card */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              className="relative h-[160px] sm:h-[180px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer"
            >
              <Image
                src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80"
                alt="Esther Mini Cover"
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </motion.div>

            {/* Card G: Small Light Box with Dark Green Book Cover */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative h-[160px] sm:h-[180px] rounded-[24px] bg-[#f4f4f2] dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 p-4 flex items-center justify-center shadow-sm group cursor-pointer overflow-hidden"
            >
              <div className="relative w-20 h-28 rounded-xl shadow-md overflow-hidden bg-[#1a382b] p-2.5 flex flex-col justify-between border border-emerald-700/60 group-hover:scale-105 transition-transform duration-500">
                <div className="flex flex-col text-left pl-0.5 pt-0.5">
                  <span className="text-[9px] font-mono tracking-[0.2em] font-extrabold uppercase text-emerald-100 leading-none mb-0.5">BOOK</span>
                  <span className="text-[9px] font-mono tracking-[0.2em] font-extrabold uppercase text-emerald-100 leading-none">COVER</span>
                </div>
                <div className="w-full h-14 rounded-lg bg-gradient-to-br from-red-600 via-rose-700 to-amber-600 overflow-hidden relative shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.5)_1.5px,transparent_1.5px)] [background-size:5px_5px]" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
