"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Zap,
  ChefHat,
  TrendingUp,
  ArrowDown
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface HeroSectionProps {
  videoSrc?: string;
  videoPoster?: string;
}

export function HeroSection({
  videoSrc = "https://v1.pinimg.com/videos/mc/720p/ab/94/65/ab9465dc20b9a1842b3f7957251cd14d.mp4",
  videoPoster = "/images/hero-sf-wallpaper.jpg",
}: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<"explore" | "builder" | "pricing">("explore");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);

      const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
      };

      setCurrentTime(formatTime(current));
      setDuration(formatTime(total));
    }
  };

  return (
    <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#dbeafe]/40 via-[#eff6ff]/30 to-[#fdfbf7] overflow-hidden">
      {/* Gentle Floating Atmospheric Clouds */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Left Cloud SVG */}
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 -left-20 w-[420px] h-[220px] opacity-40 blur-2xl bg-white rounded-full"
        />
        {/* Right Cloud SVG */}
        <motion.div
          animate={{ x: [0, -18, 0], y: [0, 10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-24 w-[460px] h-[240px] opacity-40 blur-2xl bg-white rounded-full"
        />
      </div>

      <div className="max-w-[1240px] mx-auto text-center flex flex-col items-center relative z-10">
        {/* 1. Top Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link
            href="#pricing"
            onClick={() => trackEvent("hero_cta_clicked", { button: "announcement_pill" })}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-medium shadow-md transition-all cursor-pointer mb-5 group"
          >
            <span className="bg-[#38bdf8] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">
              NEW
            </span>
            <span className="text-neutral-200">MenuSnap v2.0 is live</span>
            <span className="text-neutral-400 group-hover:text-white transition-colors flex items-center gap-1">
              Explore 3,000+ Menus <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </motion.div>

        {/* 2. Floating Segmented Mode Selector Bar with 'Click me' Pointer */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="relative inline-flex items-center mb-6 sm:mb-7"
        >
          {/* Blue 'Click me' Tooltip on Left */}
          <div className="absolute -left-20 sm:-left-24 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 pointer-events-none">
            <span className="bg-[#2563eb] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              Click me <ArrowRight className="w-2.5 h-2.5" />
            </span>
            {/* Mouse Cursor SVG */}
            <svg
              className="w-4 h-4 text-neutral-900 fill-current drop-shadow-sm -rotate-45 translate-y-0.5"
              viewBox="0 0 24 24"
            >
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>
          </div>

          {/* Mode Pill Bar */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => setActiveTab("explore")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === "explore"
                  ? "bg-neutral-100 text-neutral-900 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Explore Menus</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === "builder"
                  ? "bg-neutral-100 text-neutral-900 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-orange-500" />
              <span>Menu Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pricing")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeTab === "pricing"
                  ? "bg-neutral-100 text-neutral-900 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Price Matrix</span>
            </button>
          </div>
        </motion.div>

        {/* 3. Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#111827] tracking-tight leading-[1.08] mb-5 text-center"
        >
          Research. Build. Launch.
        </motion.h1>

        {/* 4. Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto text-center font-normal leading-relaxed mb-8"
        >
          The all-in-one menu intelligence and design studio for restaurants. Explore 3,000+ real menus, benchmark competitor pricing, and export print-ready blueprints in minutes.
        </motion.p>

        {/* 5. Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-4"
        >
          {/* Primary CTA */}
          <Link
            href="#pricing"
            onClick={() => trackEvent("hero_cta_clicked", { button: "primary_download" })}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] border border-sky-300 text-[#0369a1] font-bold text-sm shadow-[0_4px_16px_rgba(56,189,248,0.25)] hover:shadow-[0_6px_20px_rgba(56,189,248,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ChefHat className="w-4 h-4 text-[#0369a1]" />
            <span>Start Building Free</span>
          </Link>

          {/* Secondary CTA: Scroll to demo/database */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("database") || document.getElementById("pricing");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/90 text-neutral-800 font-semibold text-sm shadow-sm hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>See how MenuSnap works</span>
            <div className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
              <ArrowDown className="w-2.5 h-2.5" />
            </div>
          </button>
        </motion.div>

        {/* 6. Subtext & Platform Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center gap-2 text-xs text-neutral-500 mb-10 sm:mb-12"
        >
          <div className="flex items-center gap-1.5 hover:text-neutral-800 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span>Switching from manual spreadsheets?</span>
            <span className="font-semibold underline underline-offset-2">Import your menu library →</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium mt-0.5">
            <span>Trusted by 300+ food businesses across</span>
            <span className="font-semibold text-neutral-600">Dhaka • Chittagong • Sylhet</span>
            <span>🇧🇩</span>
          </div>
        </motion.div>

        {/* 7. Pixel-Perfect Laptop Mockup with Inside Demo Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="w-full max-w-[1040px] mx-auto"
        >
          {/* Laptop Outer Aluminum Bezel */}
          <div className="bg-[#1e2022] p-2 sm:p-3 rounded-t-[28px] sm:rounded-t-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] border-t border-x border-neutral-700/60 relative">
            
            {/* Webcam & Top Notch Indicator */}
            <div className="w-2 h-2 rounded-full bg-neutral-900 mx-auto mb-1.5 border border-neutral-700/50 flex items-center justify-center">
              <span className="w-0.5 h-0.5 rounded-full bg-emerald-500/70 animate-pulse" />
            </div>

            {/* Laptop Screen Viewport with Embedded Demo Video */}
            <div
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
              className="relative aspect-[16/10] w-full rounded-t-[18px] sm:rounded-t-[24px] overflow-hidden bg-black border border-neutral-800 flex flex-col justify-between select-none group"
            >
              {/* Actual Video Element or Fallback Interactive Demo Stream */}
              {videoSrc ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  poster={videoPoster}
                  preload="metadata"
                  loop
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={handleTimeUpdate}
                  onTimeUpdate={handleTimeUpdate}
                  className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
                  onClick={togglePlay}
                />
              ) : (
                <div className="absolute inset-0 z-0">
                  {/* High Resolution Demo Video Backdrop */}
                  <Image
                    src={videoPoster}
                    alt="MenuSnap Demo Video"
                    fill
                    priority
                    className="object-cover object-center"
                  />
                  {/* Video Ambient Lighting Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/30" />
                </div>
              )}

              {/* Top Video Header Bar (Live Status & Badges) */}
              <div className="relative z-20 p-3 sm:p-4 flex items-center justify-between text-white drop-shadow-md">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>Demo Walkthrough</span>
                  </div>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-mono">
                    1080p HD
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white cursor-pointer transition-all"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Central Big Play / Pause Overlay Button */}
              <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <button
                  type="button"
                  onClick={togglePlay}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 hover:bg-[#FF5A36] text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/30 transition-all transform hover:scale-105 pointer-events-auto cursor-pointer ${
                    isPlaying && !showControls ? "opacity-0" : "opacity-100"
                  }`}
                  aria-label={isPlaying ? "Pause Demo" : "Play Demo"}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Bottom Video Progress & Controls Bar */}
              <div className="relative z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 sm:p-4 text-white">
                {/* Video Scrubber Bar */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newProgress = (clickX / rect.width) * 100;
                    setProgress(newProgress);
                    if (videoRef.current && videoRef.current.duration) {
                      videoRef.current.currentTime = (newProgress / 100) * videoRef.current.duration;
                    }
                  }}
                  className="w-full bg-white/25 hover:bg-white/40 h-1.5 rounded-full mb-2.5 overflow-hidden cursor-pointer transition-all"
                >
                  <div
                    className="bg-[#FF5A36] h-full rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Bottom Bar Controls & Ticker */}
                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="font-mono text-[11px]">
                      {currentTime} / {duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="hidden sm:inline-block text-neutral-400">
                      MenuSnap Interactive Demo
                    </span>
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white font-medium cursor-pointer transition-all"
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Laptop Bottom Base / Lip */}
          <div className="bg-[#d1d5db] h-3.5 sm:h-4 rounded-b-[18px] sm:rounded-b-[24px] shadow-lg border-t border-neutral-300/80 mx-auto w-[102%] -ml-[1%] relative">
            <div className="w-16 h-1 bg-neutral-400/60 rounded-full mx-auto" />
          </div>

        </motion.div>

      </div>
    </section>
  );
}
