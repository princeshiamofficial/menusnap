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

function Column1Layout({ items, actionSlot }: { items: GalleryItemData[]; actionSlot?: (item: GalleryItemData) => React.ReactNode }) {
  if (items.length === 0) return null;
  const largeCard = items.find(i => i.size === 'large') || items[0];
  const smallCards = items.filter(i => i.id !== largeCard?.id).slice(0, 2);
  const extraCards = items.filter(i => i.id !== largeCard?.id && !smallCards.some(s => s.id === i.id));

  return (
    <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
      {largeCard && <BentoCard item={largeCard} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />}
      {smallCards.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {smallCards.map((item, idx) => (
            <BentoCard key={item.id || idx} item={item} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
          ))}
        </div>
      )}
      {extraCards.map((item, idx) => (
        <BentoCard key={item.id || idx} item={item} height={item.size === 'small' ? "h-[160px] sm:h-[180px]" : "h-[340px] sm:h-[380px]"} actionSlot={actionSlot} />
      ))}
    </div>
  );
}

function Column2Layout({ items, actionSlot }: { items: GalleryItemData[]; actionSlot?: (item: GalleryItemData) => React.ReactNode }) {
  if (items.length === 0) return null;
  const largeCard = items.find(i => i.size === 'large') || items[2] || items[0];
  const smallCards = items.filter(i => i.id !== largeCard?.id).slice(0, 2);
  const extraCards = items.filter(i => i.id !== largeCard?.id && !smallCards.some(s => s.id === i.id));

  return (
    <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
      {smallCards.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {smallCards.map((item, idx) => (
            <BentoCard key={item.id || idx} item={item} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
          ))}
        </div>
      )}
      {largeCard && <BentoCard item={largeCard} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />}
      {extraCards.map((item, idx) => (
        <BentoCard key={item.id || idx} item={item} height={item.size === 'small' ? "h-[160px] sm:h-[180px]" : "h-[340px] sm:h-[380px]"} actionSlot={actionSlot} />
      ))}
    </div>
  );
}

function Column3Layout({ items, actionSlot }: { items: GalleryItemData[]; actionSlot?: (item: GalleryItemData) => React.ReactNode }) {
  if (items.length === 0) return null;
  const largeCard = items.find(i => i.size === 'large') || items[0];
  const smallCards = items.filter(i => i.id !== largeCard?.id).slice(0, 2);
  const extraCards = items.filter(i => i.id !== largeCard?.id && !smallCards.some(s => s.id === i.id));

  return (
    <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
      {largeCard && <BentoCard item={largeCard} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />}
      {smallCards.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {smallCards.map((item, idx) => (
            <BentoCard key={item.id || idx} item={item} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
          ))}
        </div>
      )}
      {extraCards.map((item, idx) => (
        <BentoCard key={item.id || idx} item={item} height={item.size === 'small' ? "h-[160px] sm:h-[180px]" : "h-[340px] sm:h-[380px]"} actionSlot={actionSlot} />
      ))}
    </div>
  );
}

export function SocialsGallery({ items: propItems, actionSlot, showTitle = true }: SocialsGalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>(propItems && propItems.length > 0 ? propItems : []);

  useEffect(() => {
    if (propItems && propItems.length > 0) {
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

  // Organize all items into 3 columns dynamically
  const col1: GalleryItemData[] = [];
  const col2: GalleryItemData[] = [];
  const col3: GalleryItemData[] = [];

  galleryItems.forEach((item, index) => {
    const colNum = item.column && [1, 2, 3].includes(item.column) ? item.column : (index % 3) + 1;
    if (colNum === 1) col1.push(item);
    else if (colNum === 2) col2.push(item);
    else col3.push(item);
  });

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

      {/* Exact Bento Grid UI with Side-by-Side Small Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        <Column1Layout items={col1} actionSlot={actionSlot} />
        <Column2Layout items={col2} actionSlot={actionSlot} />
        <Column3Layout items={col3} actionSlot={actionSlot} />
      </div>
    </section>
  );
}
