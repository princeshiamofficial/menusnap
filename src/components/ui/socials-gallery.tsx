"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getClientGallery, GalleryItemData } from '@/app/actions/client-gallery';

interface SocialsGalleryProps {
  items?: GalleryItemData[];
}

const FALLBACK_ITEMS: GalleryItemData[] = [
  { id: '1', title: 'Card A', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', column: 1, size: 'large' },
  { id: '2', title: 'Card B', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', column: 1, size: 'small' },
  { id: '3', title: 'Card C1', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', column: 2, size: 'small' },
  { id: '4', title: 'Card C2', imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', column: 2, size: 'small' },
  { id: '5', title: 'Card D', imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80', column: 2, size: 'large' },
  { id: '6', title: 'Card E', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80', column: 3, size: 'large' },
  { id: '7', title: 'Card F', imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80', column: 3, size: 'small' },
  { id: '8', title: 'Card G', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', column: 3, size: 'small' },
];

export function SocialsGallery({ items: propItems }: SocialsGalleryProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItemData[]>(propItems || FALLBACK_ITEMS);

  useEffect(() => {
    if (propItems) {
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

  const col1Items = galleryItems.filter(i => (i.column || 1) === 1);
  const col2Items = galleryItems.filter(i => (i.column || 1) === 2);
  const col3Items = galleryItems.filter(i => (i.column || 1) === 3);

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-background">
      {/* Title */}
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-foreground">
          Client Gallery
        </h2>
      </div>

      {/* Gallery Bento Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* ================= COLUMN 1 (LEFT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {(col1Items.length > 0 ? col1Items : FALLBACK_ITEMS.filter(i => i.column === 1)).map((item, idx) => (
            <motion.div
              key={item.id || idx}
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer ${
                item.size === 'small' ? 'h-[160px] sm:h-[180px]' : 'h-[340px] sm:h-[380px]'
              }`}
            >
              <Image
                src={item.imageUrl}
                alt={item.title || 'Client Gallery Showcase'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                <span className="text-xs font-bold text-white drop-shadow">{item.title}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ================= COLUMN 2 (CENTER) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {(col2Items.length > 0 ? col2Items : FALLBACK_ITEMS.filter(i => i.column === 2)).map((item, idx) => (
            <motion.div
              key={item.id || idx}
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer ${
                item.size === 'small' ? 'h-[160px] sm:h-[180px]' : 'h-[340px] sm:h-[380px]'
              }`}
            >
              <Image
                src={item.imageUrl}
                alt={item.title || 'Client Gallery Showcase'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                <span className="text-xs font-bold text-white drop-shadow">{item.title}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ================= COLUMN 3 (RIGHT) ================= */}
        <div className="md:col-span-4 flex flex-col gap-4 sm:gap-5">
          {(col3Items.length > 0 ? col3Items : FALLBACK_ITEMS.filter(i => i.column === 3)).map((item, idx) => (
            <motion.div
              key={item.id || idx}
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-[24px] overflow-hidden shadow-sm border border-border/40 bg-muted/30 group cursor-pointer ${
                item.size === 'small' ? 'h-[160px] sm:h-[180px]' : 'h-[340px] sm:h-[380px]'
              }`}
            >
              <Image
                src={item.imageUrl}
                alt={item.title || 'Client Gallery Showcase'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex items-end">
                <span className="text-xs font-bold text-white drop-shadow">{item.title}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
