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
            {/* Card C1: Book Cover image */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              className="relative h-[160px] sm:h-[180px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer"
            >
              <Image
                src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
                alt="Book Cover Showcase"
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
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

          {/* Card D: Large Full Cover Landscape Image */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            className="relative h-[340px] sm:h-[380px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer"
          >
            <Image
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80"
              alt="Psalms Landscape Showcase"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
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

            {/* Card G: Creative Full Cover Image */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              className="relative h-[160px] sm:h-[180px] rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer"
            >
              <Image
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
                alt="Creative Cover Showcase"
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
