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

export const DEFAULT_REFERENCE_BENTO_ITEMS: GalleryItemData[] = [
  // Column 1
  {
    id: 'ref-1',
    title: 'Book of Esther Cover Design',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    column: 1,
    size: 'large',
    tags: 'Esther, Green Roll',
  },
  {
    id: 'ref-2',
    title: 'Open Menu Book Showcase',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    column: 1,
    size: 'small',
    tags: 'Open Book',
  },
  {
    id: 'ref-3',
    title: 'Green Book Cover Mockup',
    imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
    column: 1,
    size: 'small',
    tags: 'Green Cover',
  },

  // Column 2
  {
    id: 'ref-4',
    title: 'Colorful Artwork Book Cover',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    column: 2,
    size: 'small',
    tags: 'Artwork',
  },
  {
    id: 'ref-5',
    title: 'Stacked Manuscript Pages',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    column: 2,
    size: 'small',
    tags: 'Manuscript',
  },
  {
    id: 'ref-6',
    title: 'Book of Psalms Soft Focus',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    column: 2,
    size: 'large',
    tags: 'Psalms, Blur',
  },

  // Column 3
  {
    id: 'ref-7',
    title: 'Psalms Book with Flower Twig',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    column: 3,
    size: 'large',
    tags: 'Psalms, Floral',
  },
  {
    id: 'ref-8',
    title: 'Esther Mini Green Card',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    column: 3,
    size: 'small',
    tags: 'Esther Mini',
  },
  {
    id: 'ref-9',
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
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>(propItems || []);

  useEffect(() => {
    if (propItems !== undefined) {
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

  const activeItems = galleryItems;

  if (activeItems.length === 0) {
    return (
      <section className="w-full py-12 px-4 text-center bg-background">
        {showTitle && (
          <div className="w-full mb-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-foreground">
              Client Gallery
            </h2>
          </div>
        )}
        <div className="p-12 border border-dashed border-border/60 rounded-3xl max-w-md mx-auto bg-card/40">
          <p className="text-sm font-semibold text-muted-foreground">No gallery images available.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Click &quot;Add Gallery Image&quot; to add new photos.</p>
        </div>
      </section>
    );
  }

  // Organize active items into 3 columns dynamically
  const col1: GalleryItemData[] = [];
  const col2: GalleryItemData[] = [];
  const col3: GalleryItemData[] = [];

  activeItems.forEach((item, index) => {
    const colNum = item.column && [1, 2, 3].includes(item.column) ? item.column : (index % 3) + 1;
    if (colNum === 1) col1.push(item);
    else if (colNum === 2) col2.push(item);
    else col3.push(item);
  });

  return (
    <section className="w-full py-6 bg-background">
      {/* Optional Title */}
      {showTitle && (
        <div className="w-full mb-8 text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-foreground">
            Client Gallery
          </h2>
        </div>
      )}

      {/* Exact Match Bento Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        <Column1Layout items={col1} actionSlot={actionSlot} />
        <Column2Layout items={col2} actionSlot={actionSlot} />
        <Column3Layout items={col3} actionSlot={actionSlot} />
      </div>
    </section>
  );
}
