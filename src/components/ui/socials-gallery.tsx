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

export const FALLBACK_BENTO_ITEMS: GalleryItemData[] = [
  // Column 1
  {
    id: '1',
    title: 'Book of Esther Cover Design',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    column: 1,
    size: 'large',
    tags: 'Esther, Green Roll',
  },
  {
    id: '2',
    title: 'Open Menu Book Showcase',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    column: 1,
    size: 'small',
    tags: 'Open Book',
  },
  {
    id: '3',
    title: 'Green Book Cover Mockup',
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
    column: 1,
    size: 'small',
    tags: 'Green Cover',
  },

  // Column 2
  {
    id: '4',
    title: 'Colorful Artwork Book Cover',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    column: 2,
    size: 'small',
    tags: 'Artwork',
  },
  {
    id: '5',
    title: 'Stacked Manuscript Pages',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    column: 2,
    size: 'small',
    tags: 'Manuscript',
  },
  {
    id: '6',
    title: 'Book of Psalms Soft Focus',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    column: 2,
    size: 'large',
    tags: 'Psalms, Blur',
  },

  // Column 3
  {
    id: '7',
    title: 'Psalms Book with Flower Twig',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    column: 3,
    size: 'large',
    tags: 'Psalms, Floral',
  },
  {
    id: '8',
    title: 'Esther Mini Green Card',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    column: 3,
    size: 'small',
    tags: 'Esther Mini',
  },
  {
    id: '9',
    title: 'Abstract Art Cover',
    imageUrl: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=600&q=80',
    column: 3,
    size: 'small',
    tags: 'Abstract',
  },
];

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
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>(propItems || FALLBACK_BENTO_ITEMS);

  useEffect(() => {
    if (propItems && propItems.length > 0) {
      setGalleryItems(propItems);
      return;
    }

    async function loadData() {
      const res = await getClientGallery();
      if (res.success && res.data && res.data.length > 0) {
        setGalleryItems(res.data);
      }
    }
    loadData();
  }, [propItems]);

  // Organize items by column
  const col1 = galleryItems.filter(i => (i.column || 1) === 1);
  const col2 = galleryItems.filter(i => (i.column || 1) === 2);
  const col3 = galleryItems.filter(i => (i.column || 1) === 3);

  // Fallback cards mapping if DB items are fewer
  const col1Large = col1.find(i => i.size === 'large') || col1[0] || FALLBACK_BENTO_ITEMS[0];
  const col1Small1 = col1.filter(i => i.id !== col1Large.id)[0] || FALLBACK_BENTO_ITEMS[1];
  const col1Small2 = col1.filter(i => i.id !== col1Large.id)[1] || FALLBACK_BENTO_ITEMS[2];

  const col2Large = col2.find(i => i.size === 'large') || col2[0] || FALLBACK_BENTO_ITEMS[5];
  const col2Small1 = col2.filter(i => i.id !== col2Large.id)[0] || FALLBACK_BENTO_ITEMS[3];
  const col2Small2 = col2.filter(i => i.id !== col2Large.id)[1] || FALLBACK_BENTO_ITEMS[4];

  const col3Large = col3.find(i => i.size === 'large') || col3[0] || FALLBACK_BENTO_ITEMS[6];
  const col3Small1 = col3.filter(i => i.id !== col3Large.id)[0] || FALLBACK_BENTO_ITEMS[7];
  const col3Small2 = col3.filter(i => i.id !== col3Large.id)[1] || FALLBACK_BENTO_ITEMS[8];

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

      {/* Exact Match Bento Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* ================= COLUMN 1 (LEFT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {/* Large Card Top */}
          <BentoCard item={col1Large} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />

          {/* Bottom Sub-Row: 2 Small Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <BentoCard item={col1Small1} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
            <BentoCard item={col1Small2} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
          </div>
        </div>

        {/* ================= COLUMN 2 (CENTER) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {/* Top Sub-Row: 2 Small Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <BentoCard item={col2Small1} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
            <BentoCard item={col2Small2} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
          </div>

          {/* Large Card Bottom */}
          <BentoCard item={col2Large} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />
        </div>

        {/* ================= COLUMN 3 (RIGHT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {/* Large Card Top */}
          <BentoCard item={col3Large} height="h-[340px] sm:h-[380px]" actionSlot={actionSlot} />

          {/* Bottom Sub-Row: 2 Small Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <BentoCard item={col3Small1} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
            <BentoCard item={col3Small2} height="h-[160px] sm:h-[180px]" actionSlot={actionSlot} />
          </div>
        </div>

      </div>
    </section>
  );
}
