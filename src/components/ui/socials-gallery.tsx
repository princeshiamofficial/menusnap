"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getClientGallery, GalleryItemData } from '@/app/actions/client-gallery';

interface SocialsGalleryProps {
  items?: GalleryItemData[];
  actionSlot?: (item: GalleryItemData) => React.ReactNode;
  showTitle?: boolean;
}

interface CardProps {
  item: GalleryItemData;
  height: string;
  actionSlot?: (item: GalleryItemData) => React.ReactNode;
}

function BentoCard({ item, height, actionSlot }: CardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer ${height}`}
    >
      <Image
        src={item.imageUrl}
        alt={item.title || 'Client Gallery Showcase'}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end justify-between gap-2">
        <span className="text-xs font-bold text-white drop-shadow truncate">{item.title}</span>
        {actionSlot && (
          <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {actionSlot(item)}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function SocialsGallery({ items: propItems, actionSlot, showTitle = true }: SocialsGalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>(propItems || []);

  useEffect(() => {
    if (propItems) {
      setGalleryItems(propItems);
      return;
    }

    async function loadData() {
      const res = await getClientGallery();
      if (res.success && res.data) {
        setGalleryItems(res.data);
      }
    }
    loadData();
  }, [propItems]);

  // SMART AUTO ADJUSTMENT: Automatically balance items across 3 columns
  const col1: GalleryItemData[] = [];
  const col2: GalleryItemData[] = [];
  const col3: GalleryItemData[] = [];

  galleryItems.forEach((item, index) => {
    // Priority to item.column if explicitly specified, otherwise auto-distribute
    const targetCol = item.column ? item.column : (index % 3) + 1;
    if (targetCol === 1) col1.push(item);
    else if (targetCol === 2) col2.push(item);
    else col3.push(item);
  });

  // Slot mapping with Auto-Adjustment for Bento heights
  const col1Large = col1.find(i => i.size === 'large') || col1[0];
  const col1Small1 = col1.filter(i => i.id !== col1Large?.id)[0];
  const col1Small2 = col1.filter(i => i.id !== col1Large?.id)[1];
  const col1Extra = col1.filter(i => i.id !== col1Large?.id && i.id !== col1Small1?.id && i.id !== col1Small2?.id);

  const col2Large = col2.find(i => i.size === 'large') || col2[2] || col2[0];
  const col2Small1 = col2.filter(i => i.id !== col2Large?.id)[0];
  const col2Small2 = col2.filter(i => i.id !== col2Large?.id)[1];
  const col2Extra = col2.filter(i => i.id !== col2Large?.id && i.id !== col2Small1?.id && i.id !== col2Small2?.id);

  const col3Large = col3.find(i => i.size === 'large') || col3[0];
  const col3Small1 = col3.filter(i => i.id !== col3Large?.id)[0];
  const col3Small2 = col3.filter(i => i.id !== col3Large?.id)[1];
  const col3Extra = col3.filter(i => i.id !== col3Large?.id && i.id !== col3Small1?.id && i.id !== col3Small2?.id);

  return (
    <section className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-background">
      {/* Optional Title */}
      {showTitle && (
        <div className="max-w-6xl mx-auto mb-10 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-foreground">
            Client Gallery
          </h2>
        </div>
      )}

      {/* Auto-Adjusted Bento Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* ================= COLUMN 1 (LEFT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {col1Large && <BentoCard item={col1Large} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />}

          {(col1Small1 || col1Small2) && (
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {col1Small1 && <BentoCard item={col1Small1} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />}
              {col1Small2 && <BentoCard item={col1Small2} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />}
            </div>
          )}

          {col1Extra.map((item, idx) => (
            <BentoCard 
              key={item.id || idx} 
              item={item} 
              height={idx % 2 === 0 ? "h-[160px] sm:h-[180px]" : "h-[340px] sm:h-[380px]"} 
              actionSlot={actionSlot} 
            />
          ))}
        </div>

        {/* ================= COLUMN 2 (CENTER) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {(col2Small1 || col2Small2) && (
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {col2Small1 && <BentoCard item={col2Small1} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />}
              {col2Small2 && <BentoCard item={col2Small2} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />}
            </div>
          )}

          {col2Large && <BentoCard item={col2Large} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />}

          {col2Extra.map((item, idx) => (
            <BentoCard 
              key={item.id || idx} 
              item={item} 
              height={idx % 2 === 0 ? "h-[160px] sm:h-[180px]" : "h-[340px] sm:h-[380px]"} 
              actionSlot={actionSlot} 
            />
          ))}
        </div>

        {/* ================= COLUMN 3 (RIGHT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {col3Large && <BentoCard item={col3Large} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />}

          {(col3Small1 || col3Small2) && (
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {col3Small1 && <BentoCard item={col3Small1} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />}
              {col3Small2 && <BentoCard item={col3Small2} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />}
            </div>
          )}

          {col3Extra.map((item, idx) => (
            <BentoCard 
              key={item.id || idx} 
              item={item} 
              height={idx % 2 === 0 ? "h-[160px] sm:h-[180px]" : "h-[340px] sm:h-[380px]"} 
              actionSlot={actionSlot} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}
