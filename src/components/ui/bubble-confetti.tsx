"use client";

import { useRef } from 'react';
import { motion } from 'framer-motion';

const Bubble = ({ onComplete }: { onComplete: () => void }) => {
  const duration = Math.random() * 1.5 + 0.5; // 0.5s to 2.0s
  const delay = Math.random() * 0.2; // up to 0.2s delay
  const x = (Math.random() - 0.5) * 250; // spread horizontally
  const y = (Math.random() - 0.5) * 250; // spread vertically
  const scale = Math.random() * 0.5 + 0.5; // size from 0.5 to 1.0

  const colors = [
    'hsl(var(--primary))',
    '#fb923c', // orange-400
    '#fde047', // yellow-300
    '#a78bfa', // violet-400
    '#60a5fa', // blue-400
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
      animate={{ 
        opacity: 0, 
        scale: scale, 
        x: x, 
        y: y,
      }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete}
      style={{
        position: 'absolute',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 5px ${color}`,
      }}
      className="pointer-events-none"
    />
  );
};

export const BubbleConfetti = ({ count = 30, onComplete }: { count?: number; onComplete: () => void }) => {
  const completedCount = useRef(0);

  const handleAnimationComplete = () => {
    completedCount.current++;
    if (completedCount.current >= count) {
      onComplete();
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Bubble key={i} onComplete={handleAnimationComplete} />
      ))}
    </>
  );
};
