"use client";

import { useRef } from 'react';
import { motion } from 'framer-motion';

const Bubble = ({ onComplete }: { onComplete: () => void }) => {
  const duration = Math.random() * 1.5 + 0.8; // 0.8s to 2.3s
  const delay = Math.random() * 0.2;
  const x = (Math.random() - 0.5) * 400; // Increased spread
  const y = (Math.random() - 0.5) * 400; // Increased spread
  const scale = Math.random() * 0.6 + 0.6; // size from 0.6 to 1.2

  const colors = [
    'hsl(var(--primary))',
    '#fb923c', // orange-400
    '#fde047', // yellow-300
    '#a78bfa', // violet-400
    '#60a5fa', // blue-400
    '#f472b6', // pink-400
    '#34d399', // emerald-400
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
        width: '15px', // slightly larger bubbles
        height: '15px',
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`,
        filter: 'blur(0.5px)', // adds a softer look
      }}
      className="pointer-events-none"
    />
  );
};

export const BubbleConfetti = ({ count = 50, onComplete }: { count?: number; onComplete: () => void }) => {
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
