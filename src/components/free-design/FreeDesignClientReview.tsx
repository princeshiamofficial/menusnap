"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

export function FreeDesignClientReview() {
  const reviews = [
    {
      videoUrl: "https://youtube.com/shorts/Cyahmutl3uI?si=qNmlnUeayBKSkw3K",
      alt: "Restaurant Video Review"
    },
    {
      videoUrl: "https://youtube.com/shorts/st116OEhUls?si=7YVXGVe8plabiwdr",
      alt: "Parlor Video Review"
    }
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Mouse Drag Scrolling States
  const [isDragging, setIsDragging] = useState(false);
  const [dragMoved, setDragMoved] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Inline Player State - tracks which card index is playing
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // Helper to extract YouTube Video ID from standard, shorts, or shortened link formats
  const getYoutubeId = (url: string) => {
    if (!url) return "";
    if (url.includes("/shorts/")) {
      const parts = url.split("/shorts/");
      return parts[1] ? parts[1].split(/[?#]/)[0] : "";
    }
    if (url.includes("watch?v=")) {
      const parts = url.split("watch?v=");
      return parts[1] ? parts[1].split(/[?#]/)[0] : "";
    }
    if (url.includes("youtu.be/")) {
      const parts = url.split("youtu.be/");
      return parts[1] ? parts[1].split(/[?#]/)[0] : "";
    }
    return "";
  };

  // Helper to auto convert YouTube/Shorts URL to Embed iframe URL
  const getYoutubeEmbedUrl = (url: string) => {
    const videoId = getYoutubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1`;
    }
    return url;
  };

  // Helper to get YouTube thumbnail image URL
  const getYoutubeThumbnailUrl = (url: string) => {
    const videoId = getYoutubeId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return "";
  };

  const updateArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      // Give 5px tolerance for minor math rounding issues
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", updateArrows);
      // Run on mount
      updateArrows();
      // Listen to window resizing
      window.addEventListener("resize", updateArrows);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", updateArrows);
      }
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = container.firstElementChild?.getBoundingClientRect().width || 300;
      const gap = 16; // gap-4 is 16px
      const scrollAmount = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    if (Math.abs(walk) > 5) {
      setDragMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <section id="client-reviews" className="scroll-mt-[120px] w-full bg-white px-0 md:px-6 pt-3 pb-0 md:pt-6 md:pb-0 font-bengali border-t border-slate-100">
      <div className="max-w-7xl mx-auto w-full bg-black rounded-none md:rounded-[2.5rem] border-x-0 md:border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] px-6 pt-8 pb-4 md:pt-12 md:pb-6 md:px-12 lg:px-20 relative overflow-hidden">
        {/* Background glow gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-black to-slate-900 pointer-events-none" />

        <div className="relative z-10">
          {/* Section Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-white text-[20px] sm:text-3xl md:text-5xl font-serif leading-tight">
                Client Review
              </h2>
            </div>
            <p className="text-slate-400 text-base md:text-lg max-w-md font-medium">
              আমাদের সেবার মাধ্যমে লাভবান হওয়া কিছু উদ্যোক্তার আসল ফিডব্যাক ও রিভিউর ঝলক।
            </p>
          </div>

          {/* Horizontal Scroller (Carousel Style) */}
          <div className="relative w-full group/carousel">
            {/* Left Arrow Button */}
            {showLeftArrow && (
              <button
                onClick={() => handleScroll("left")}
                className="hidden md:flex absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-slate-900 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] items-center justify-center text-white hover:text-red-500 hover:scale-110 hover:border-red-600/30 active:scale-95 transition-all duration-200"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Right Arrow Button */}
            {showRightArrow && (
              <button
                onClick={() => handleScroll("right")}
                className="hidden md:flex absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-slate-900 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] items-center justify-center text-white hover:text-red-500 hover:scale-110 hover:border-red-600/30 active:scale-95 transition-all duration-200"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Left/Right Fade Out Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-black via-black/50 to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-black via-black/50 to-transparent pointer-events-none z-10" />

            {/* Scroller Viewport */}
            <div className="w-full overflow-hidden">
              <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
                className={`flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x snap-mandatory px-1 select-none ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{ scrollBehavior: isDragging ? "auto" : "smooth" }}
              >
                {[...reviews, ...reviews, ...reviews, ...reviews].map((item, idx) => {
                  const isPlaying = playingIndex === idx;
                  return (
                    <motion.div
                      key={idx}
                      whileTap={!isPlaying ? { scale: 0.98 } : undefined}
                      onClick={() => {
                        if (!dragMoved && !isPlaying) {
                          setPlayingIndex(idx);
                        }
                      }}
                      className="flex-shrink-0 w-[calc((100%-32px)/3.4)] sm:w-[calc((100%-48px)/4.2)] md:w-[calc((100%-64px)/5.2)] lg:w-[calc((100%-96px)/6.3)] aspect-[9/16] snap-center relative rounded-[1.2rem] md:rounded-[2rem] overflow-hidden border-2 border-red-600 shadow-[0_15px_35px_rgba(220,38,38,0.12)] bg-slate-950 group cursor-pointer p-[2px]"
                    >
                      <div className="w-full h-full relative overflow-hidden rounded-[calc(1.2rem-2px)] md:rounded-[calc(2rem-2px)] bg-slate-950">
                        {isPlaying ? (
                          <div className="w-full h-full relative overflow-hidden">
                            {/* Close Button Inside Card */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingIndex(null);
                              }}
                              className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-black/60 hover:bg-black/85 border border-white/10 flex items-center justify-center text-white hover:text-red-500 transition-all duration-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* YouTube Iframe Player Embedded Inline */}
                            <iframe
                              src={getYoutubeEmbedUrl(item.videoUrl)}
                              className="w-[102%] h-[calc(100%+120px)] -top-[60px] -left-[1%] border-none z-10 absolute pointer-events-auto"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <>
                            {/* Background Image */}
                            <Image
                              src={getYoutubeThumbnailUrl(item.videoUrl)}
                              alt={item.alt}
                              fill
                              unoptimized
                              className="object-cover opacity-80 group-hover:opacity-95 transition-all duration-700 group-hover:scale-105 pointer-events-none"
                              sizes="(max-w-320px) 100vw, 320px"
                            />

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                              <div className="w-8 h-8 md:w-14 md:h-14 rounded-full bg-red-600/90 border border-red-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
                                <Play className="w-3.5 h-3.5 md:w-6 md:h-6 text-white fill-white ml-0.5 md:ml-1" />
                              </div>
                            </div>

                            {/* Subtle Overlay */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 pointer-events-none" />
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-bengali {
          font-family: 'Hind Siliguri', sans-serif;
        }
        /* Hide scrollbars but keep scrolling functional */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
