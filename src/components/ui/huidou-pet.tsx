"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Heart } from 'lucide-react';

interface HuidouPetProps {
  className?: string;
}

export function HuidouPet({ className = "" }: HuidouPetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("Hi! I'm Huidou (灰豆) 🐾 Welcome to MagicTab!");
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isBouncing, setIsBouncing] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  const CUTE_MESSAGES = [
    "Need help managing your categories or menu items? 🐾",
    "MagicTab makes digital menu creation so easy! ✨",
    "Purr... Everything looks delicious here! 😺",
    "Huidou is watching over your orders! 🐱",
    "Meow! Don't forget to save your drafts! 📑"
  ];

  // Sprite animation loop (cycles through 6 idle cat frames)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 6);
    }, 200); // 200ms per frame

    return () => clearInterval(interval);
  }, []);

  const handlePetClick = (e: React.MouseEvent) => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);

    // Spawn heart effect
    const rect = e.currentTarget.getBoundingClientRect();
    const newHeart = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setHearts((prev) => [...prev.slice(-4), newHeart]);

    // Change message
    const randomMsg = CUTE_MESSAGES[Math.floor(Math.random() * CUTE_MESSAGES.length)];
    setMessage(randomMsg);
  };

  // Calculate background position percentage for 8-column spritesheet
  const bgXPercent = (frameIndex / 7) * 100;

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all border border-amber-300/40 group"
        title="Summon Huidou Pet 灰豆"
      >
        <span className="text-2xl">🐱</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      </motion.button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto mb-3 max-w-xs p-3.5 rounded-2xl bg-card border border-border shadow-2xl text-xs text-foreground font-medium relative backdrop-blur-md"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-2 -right-2 bg-muted hover:bg-destructive hover:text-white text-muted-foreground p-1 rounded-full border border-border shadow-md transition-colors"
            title="Dismiss Huidou"
          >
            <X className="h-3 w-3" />
          </button>
          
          <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-amber-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Huidou (灰豆) • Pet Assistant</span>
          </div>
          <p className="leading-relaxed text-foreground/90">{message}</p>
          
          {/* Arrow */}
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-border rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Interactive Pet Mascot */}
      <motion.div
        onClick={handlePetClick}
        animate={isBouncing ? { y: [-15, 0], scale: [1.15, 1] } : { y: [0, -6, 0] }}
        transition={isBouncing ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-auto relative cursor-pointer group"
      >
        {/* Floating Heart Effects */}
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -40, scale: 1.4 }}
            transition={{ duration: 0.8 }}
            className="absolute z-10 text-pink-500 pointer-events-none"
            style={{ left: h.x, top: h.y }}
          >
            <Heart className="h-5 w-5 fill-pink-500" />
          </motion.div>
        ))}

        {/* Mascot Avatar Container (Transparent CSS Animated Sprite) */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <div
            className="w-full h-full filter drop-shadow-2xl transition-all"
            style={{
              backgroundImage: `url('/huidou-spritesheet.webp')`,
              backgroundSize: `800% 1200%`,
              backgroundPosition: `${bgXPercent}% 0%`,
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
