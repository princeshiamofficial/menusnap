"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ThreeDTiltCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  glareEffect?: boolean;
}

export function ThreeDTiltCard({
  children,
  className = "",
  depth = 20,
  glareEffect = true,
}: ThreeDTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates normalized to [-0.5, 0.5]
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for fluid motion
  const mouseX = useSpring(x, { stiffness: 260, damping: 24 });
  const mouseY = useSpring(y, { stiffness: 260, damping: 24 });

  // Compute 3D rotation based on mouse coordinates
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [depth, -depth]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-depth, depth]);

  // Compute glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mousePosX = (e.clientX - rect.left) / width - 0.5;
    const mousePosY = (e.clientY - rect.top) / height - 0.5;

    x.set(mousePosX);
    y.set(mousePosY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative [perspective:1400px] w-full"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={`relative transition-shadow duration-300 ${className}`}
      >
        {children}

        {/* Dynamic Specular Glare Overlay */}
        {glareEffect && (
          <motion.div
            style={{
              background: `radial-gradient(circle 350px at ${glareX} ${glareY}, rgba(255,255,255,0.25), transparent 70%)`,
              opacity: isHovered ? 1 : 0,
            }}
            className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-50"
          />
        )}
      </motion.div>
    </div>
  );
}
