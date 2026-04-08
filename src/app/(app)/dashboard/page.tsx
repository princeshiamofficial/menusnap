"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Star, AlertTriangle, X, ListOrdered, Layers, FileEdit, History, TrendingUp, ChevronDown } from "lucide-react";
import { motion, animate, AnimatePresence } from "framer-motion";
import { useClientAuth } from '@/hooks/use-client-auth';
import { decodeHtmlEntities, cn } from '@/lib/utils';
import { getTemplatesFromMySql } from '@/app/actions/orders';
import { getDashboardSlides, getDashboardSpotlights } from '@/app/actions/storefront';



// Interface for API template structure
interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  isTopRated?: boolean;
  isPublished: boolean;
  tags: string[];
  imageUrl: string;
}

interface TemplateCardProps {
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  isTopRated?: boolean;
  imageHint?: string;
}

const DEFAULT_TEMPLATE_IMAGE_URL = 'https://erp.colorhutbd.xyz/file/uploads/68502bf9cec52_placeholder.svg';

function TemplateCard({ imageUrl, title, description, tags, isTopRated, imageHint }: TemplateCardProps) {
  const actualImageUrl = imageUrl || DEFAULT_TEMPLATE_IMAGE_URL;
  const isUsingPlaceholder = !imageUrl || imageUrl === DEFAULT_TEMPLATE_IMAGE_URL;

  return (
    <motion.div
      className="w-full max-w-md mx-auto sm:max-w-sm h-full"
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Card className="shadow-xl rounded-xl overflow-hidden w-full flex flex-col h-full">
        <CardHeader className="p-0 relative">
          <div className="aspect-[4/3] relative">
            <img
              src={actualImageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-95"
              aria-hidden="true"
            />
            <img
              src={actualImageUrl}
              alt={decodeHtmlEntities(title)}
              className="w-full h-full object-contain relative z-10 drop-shadow-xl"
              data-ai-hint={isUsingPlaceholder ? "placeholder abstract" : (imageHint || "template design")}
            />
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.15)] pointer-events-none z-20" />
          </div>
          {isTopRated && (
            <Badge variant="default" className="absolute top-3 right-3 bg-primary text-primary-foreground z-20">
              <Star className="h-3 w-3 mr-1 fill-current" />
              TOP RATED
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-xl font-semibold mb-1">{decodeHtmlEntities(title)}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-3 min-h-[40px]">{decodeHtmlEntities(description)}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TemplateSkeletonCard() {
  return (
    <Card className="shadow-xl rounded-xl overflow-hidden w-full max-w-md mx-auto sm:max-w-sm">
      <CardHeader className="p-0 relative">
        <Skeleton className="w-full aspect-[4/3]" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />

      </CardContent>

    </Card>
  );
}

const getImageHint = (name: string): string => {
  return name.toLowerCase().split(' ').slice(0, 2).join(' ') || 'template design';
}



function RoleIconSlider() {
  const roles = [
    { src: '/beautician_3d.png', label: 'Beautician' },
    { src: '/chef_3d.png', label: 'Chef' },
    { src: '/manager_3d.png', label: 'Manager' },
    { src: '/waiter_3d.png', label: 'Waiter' }
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence initial={false}>
        <motion.div
           key={index}
           initial={{ x: '120%', opacity: 0, scale: 0.8 }}
           animate={{ 
             x: ['120%', '0%', '0%', '-400%'],
             opacity: [0, 1, 1, 0],
             scale: [0.8, 1, 1, 0.9]
           }}
           transition={{ 
             duration: 3.8,
             times: [0, 0.15, 0.85, 1],
             ease: ["easeOut", "linear", "easeIn"]
           }}
           className="absolute -bottom-1 right-0 h-12 flex items-center gap-1"
        >
          <span className="text-[12px] font-bold text-black/80 whitespace-nowrap">
            {roles[index].label}
          </span>
          <div className="h-10 w-10 shrink-0">
            <img src={roles[index].src} alt={roles[index].label} className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MobileImageSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<{src: string, title: string, desc: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      try {
        const result = await getDashboardSlides();
        if (result.success && result.slides && result.slides.length > 0) {
          // Map database rows to slider format
          const mappedSlides = (result.slides as any[]).map((slide, index) => ({
            src: slide.image_url,
            title: index === 0 ? "Design Your Dream Menu" : 
                   index === 1 ? "Real-time Collaboration" : 
                   "WhatsApp Integration",
            desc: index === 0 ? "Customize templates with your branding" :
                  index === 1 ? "Edit together in real-time" :
                  "Share your menu directly"
          }));
          setSlides(mappedSlides);
        } else {
          setSlides([]);
        }
      } catch (err) {
        console.error("Failed to load dashboard slides:", err);
        setSlides([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (isLoading || slides.length === 0) {
    return (
      <div className="md:hidden w-full aspect-[3/1] relative rounded-3xl overflow-hidden bg-muted/20 animate-pulse" />
    );
  }

  return (
    <div className="md:hidden w-full aspect-[3/1] relative rounded-[1.5rem] overflow-hidden shadow-2xl group ring-1 ring-white/10 bg-slate-100 dark:bg-slate-900/50">
      {/* Hidden preloader for all slider images */}
      <div className="hidden" aria-hidden="true">
        {slides.map((img, i) => (
          <img key={`preload-${i}`} src={img.src} alt="" width={1} height={1} />
        ))}
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{
            duration: 1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <img
            src={slides[current].src}
            alt={slides[current].title}
            className="w-full h-full object-contain absolute inset-0"
            loading={current === 0 ? "eager" : "lazy"}
          />
        </motion.div>
      </AnimatePresence>

      {/* Premium Pagination Dots (Moved to bottom left horizontal) */}
      <div className="absolute bottom-4 left-6 flex flex-row gap-2 z-30">
        {slides.map((_, i) => (
          <motion.div
            key={i}
            onClick={() => setCurrent(i)}
            animate={{
              width: i === current ? 24 : 8,
              backgroundColor: i === current ? "rgba(255,165,0,0.9)" : "rgba(255,255,255,0.3)"
            }}
            className="h-1.5 rounded-full transition-all duration-500 cursor-pointer"
          />
        ))}
      </div>

      {/* Decorative Blur Element */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 blur-[100px] pointer-events-none rounded-full" />
    </div>
  );
}

function MobileActionGrid() {
  const actions = [
    {
      title: "eBook",
      description: "Automate your menu setup with AI",
      badge: "ULTRA FAST",
      href: "/ebook", 
      imageUrl: "/dashboard/ebook-premium-3d.png",
      rightOffset: "-right-12",
      bottomOffset: "-bottom-2",
      icon: ListOrdered,
      color: "text-orange-500/20",
      badgeColor: "bg-orange-100 text-orange-700"
    },
    {
      title: "Team Tracker",
      description: "Manage your team's workflow",
      badge: "PRO",
      href: "/templates",
      imageUrl: "/dashboard/clock-location-premium-3d.png",
      rightOffset: "-right-10",
      bottomOffset: "-bottom-3",
      icon: Layers,
      color: "text-blue-500/20",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      title: "Templates",
      description: "Curate your custom menu templates",
      badge: "DRAFTING",
      href: "/draft",
      imageUrl: "/dashboard/templates-premium-3d.png",
      rightOffset: "-right-5",
      bottomOffset: "bottom-1",
      imgWidth: "95px",
      imgHeight: "95px",
      icon: FileEdit,
      color: "text-purple-500/20",
      badgeColor: "bg-purple-100 text-purple-700"
    },
    {
      title: "Free Design",
      description: "Claim your complimentary services",
      href: "/order-history",
      isWidget: true
    },
  ];

  return (
    <div className="md:hidden mt-6">
      <div className="grid grid-cols-2 gap-1.5">
        {actions.map((action: any, i) => (
          <Link key={action.href} href={action.href} className="block group">
            <motion.div
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative border rounded-3xl flex flex-col items-start justify-between aspect-[1.15/1] transition-all duration-300 bg-card border-border/50 p-4 shadow-sm active:shadow-inner overflow-hidden",
                action.isWidget && "bg-transparent border-none p-0 overflow-hidden shadow-none"
              )}
            >
              {action.isWidget ? (
                <div className="flex flex-col gap-2 w-full h-full">
                  <div className="flex-[0.6] bg-card border border-border/50 rounded-2xl p-3 flex flex-row items-center justify-between shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col relative z-10 max-w-[60%]">
                      <span className="text-sm font-black text-foreground leading-tight tracking-tight">Free Design</span>
                      <p className="text-[9px] font-medium text-muted-foreground leading-tight mt-0.5 line-clamp-1">Limited time pro offers</p>
                    </div>
                    <div className="absolute -right-2 bottom-2 h-14 w-14 shrink-0 pointer-events-none opacity-95 drop-shadow-xl">
                      <img
                        src="/dashboard/color-palette-premium-3d.png"
                        alt="Free Design"
                        className="w-full h-full object-contain absolute inset-0"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-row gap-1.5 w-full">
                    <div className="flex-1 bg-white border border-border/50 rounded-2xl p-2.5 flex flex-col items-start justify-between shadow-sm relative overflow-hidden group">
                      <div className="flex flex-row items-center gap-1 text-foreground/90 font-black text-xs relative z-10 whitespace-nowrap">
                        MagicTab
                      </div>
                      <div className="absolute -right-1 -bottom-2 h-12 w-12 opacity-95">
                        <img src="/dashboard/magictab_3d_icon.png" alt="MagicTab" className="w-full h-full object-contain absolute inset-0" />
                      </div>
                    </div>
                    <div className="flex-1 bg-red-50/50 border border-red-100 rounded-2xl p-2.5 flex flex-col items-start justify-between shadow-sm relative overflow-hidden group">
                      <div className="flex flex-row items-center gap-1 text-red-600 font-black text-xs relative z-10 whitespace-nowrap">
                        Hiring <ChevronDown className="h-3 w-3" />
                      </div>
                      <RoleIconSlider />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative z-10">
                    <h3 className="text-lg font-black text-foreground leading-tight">{action.title}</h3>
                    <p className="text-[10px] font-medium text-muted-foreground leading-tight mt-1 max-w-[85%]">
                      {action.description}
                    </p>
                  </div>

                  {action.imageUrl ? (
                    <div className={cn("absolute z-0 pointer-events-none", action.rightOffset, action.bottomOffset)}>
                      <img 
                        src={action.imageUrl} 
                        alt={action.title} 
                        style={{ width: action.imgWidth || '135px', height: action.imgHeight || '135px', objectFit: 'contain' }}
                        className="drop-shadow-2xl"
                      />
                    </div>
                  ) : (
                    action.icon && (
                      <action.icon className={cn(
                        "h-16 w-16 absolute -right-3 top-14 rotate-12 transition-transform group-hover:scale-110", 
                        action.color
                      )} />
                    )
                  )}

                  <div className={cn(
                    "relative z-10 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 uppercase",
                    action.badgeColor
                  )}>
                    <ChevronDown className="h-3 w-3 rotate-180" />
                    {action.badge}
                  </div>
                </>
              )}
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function MobileDashboardHeader({ businessName, type }: { businessName?: string | null, type?: string | null }) {
  const avatarUrl = type?.toLowerCase() === 'restaurant' ? '/restaurant-avatar.png' : '/parlor-avatar.png';

  return (
    <header className="md:hidden sticky top-3 z-[60] h-14 w-[calc(100%-2rem)] mx-auto bg-background border border-border/40 shadow-lg shadow-black/5 rounded-2xl flex items-center justify-between px-5 transition-all">
      <div className="relative h-8 w-28 bg-black rounded-xl p-1 px-3 border border-white/10 flex items-center justify-center">
        <div className="relative h-full w-full">
          <img
            src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
            alt="Color Hut Logo"
            className="w-full h-full object-contain absolute inset-0"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 shadow-md transition-transform active:scale-95 relative">
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>
      </div>
    </header>
  );
}

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [topRatedTemplates, setTopRatedTemplates] = useState<ApiTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  
  const { clientUser, clientLoading } = useClientAuth();
  const [activeOfferTab, setActiveOfferTab] = useState("All");
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(-1);
  const [spotlights, setSpotlights] = useState<any[]>([]);

  const fetchSpotlights = useCallback(async () => {
    const res = await getDashboardSpotlights();
    if (res.success) setSpotlights(res.spotlights);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    fetchSpotlights();
    return () => clearTimeout(timer);
  }, [fetchSpotlights]);

  useEffect(() => {
    async function fetchTopRatedTemplates() {
      if (!clientUser?.type) return;

      setIsLoadingTemplates(true);
      setTemplatesError(null);
      try {
        const result = await getTemplatesFromMySql();
        if (!result.success) {
          throw new Error(result.message || "Failed to fetch templates from local DB.");
        }

        const fetchedTemplates: ApiTemplate[] = (result.data as any[]).map((t: any) => ({
          id: String(t.id),
          name: t.name,
          description: t.description,
          imageUrl: t.imageUrl || '',
          isPublished: Boolean(t.isPublished),
          isTopRated: Boolean(t.isTopRated),
          tags: Array.isArray(t.tags) ? t.tags : [],
        }));

        const filteredTopRated = fetchedTemplates.filter(
          template =>
            template.isPublished &&
            template.isTopRated &&
            template.tags.some(tag => tag.toLowerCase() === clientUser.type?.toLowerCase())
        );
        setTopRatedTemplates(filteredTopRated);

      } catch (e: any) {
        console.error("Failed to fetch top-rated templates:", e);
        setTemplatesError(e.message || "Failed to load top-rated templates.");
      } finally {
        setIsLoadingTemplates(false);
      }
    }

    if (!clientLoading && clientUser?.type) {
      fetchTopRatedTemplates();
    } else if (!clientLoading && !clientUser) {
      setIsLoadingTemplates(false);
    }
  }, [clientUser, clientLoading]);



  const showTemplateSkeletons = isLoadingTemplates || clientLoading;

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-hidden flex flex-col bg-background">
      <div className="flex-1 space-y-0 pb-12 transition-all pt-4">
        <div className="px-4 md:px-10 space-y-4 max-w-full overflow-hidden">
          <MobileImageSlider />
          <MobileActionGrid />
        </div>

        {/* Quick Actions Section (MOBILE ONLY) */}
        <div className="md:hidden px-4 md:px-10 mt-10 mb-8 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3 mb-2 mt-3">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
            <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase opacity-70">Quick Actions</span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
          </div>
          
          <div className="w-full overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth gap-2 pb-4">
            {/* Shop Card */}
            <motion.div 
              whileTap={{ scale: 0.97 }}
              className="group relative min-w-[53vw] md:min-w-[240px] snap-center bg-white dark:bg-slate-900 border-2 border-red-500/20 rounded-[1rem] p-1.5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="bg-red-600 text-[7px] font-black text-white px-1.5 py-0.5 rounded-md tracking-tighter uppercase">NEW</span>
                  <span className="text-red-600 font-black text-[9px]">Shop</span>
                </div>
                <h3 className="text-[11px] font-black text-foreground flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Explore products <ChevronDown className="h-2 w-2 -rotate-90" />
                </h3>
                <p className="text-[7.5px] text-muted-foreground font-medium truncate opacity-80">Toys, Stationery, Sports</p>
              </div>
              <div className="absolute -right-0.5 bottom-0.5 w-10 h-10 opacity-20 group-hover:opacity-60 transition-opacity duration-500">
                 <TrendingUp className="w-full h-full text-red-500/10" />
              </div>
            </motion.div>

            {/* PayLater Card */}
            <motion.div 
              whileTap={{ scale: 0.97 }}
              className="group relative min-w-[53vw] md:min-w-[240px] snap-center bg-indigo-50 dark:bg-indigo-950/30 rounded-[1rem] p-1.5 shadow-sm hover:shadow-md transition-all duration-300 border border-indigo-100 dark:border-indigo-900/50"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <div className="p-0.5 bg-white rounded-md shadow-sm">
                    <History className="h-2 w-2 text-indigo-600" />
                  </div>
                  <span className="text-indigo-600 font-black text-[9px]">PayLater</span>
                </div>
                <h3 className="text-[11px] font-black text-foreground leading-none tracking-tight">
                  Pay Smarter, Pay Later
                </h3>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* MenuSnap Spotlight Section (MOBILE ONLY) */}
      <div className="md:hidden px-4 md:px-10 mb-10 w-full max-w-full overflow-hidden">
        <h2 className="text-xl font-black text-foreground mb-4 tracking-tight">MenuSnap Spotlight</h2>
        <div className="w-full overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth gap-3 pb-6">
            {spotlights.map((item, idx) => (
              <motion.div
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentSpotlightIndex(idx)}
                className="min-w-[105px] aspect-[3/5] snap-center relative rounded-[1.25rem] overflow-hidden border-2 border-red-600 shadow-lg shadow-red-600/10 active:scale-95 transition-transform"
              >
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Exclusive Offers Section (MOBILE ONLY) */}
      <div className="md:hidden px-4 md:px-10 mb-10 w-full max-w-full overflow-hidden">
        <h2 className="text-xl font-black text-foreground mb-4 tracking-tight">Exclusive Offers</h2>
        
        {/* Filter Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {["All", "Food", "MagicAI", "Updates"].map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveOfferTab(chip)}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-black transition-all border shrink-0",
                activeOfferTab === chip 
                  ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20" 
                  : "bg-white dark:bg-slate-900 text-muted-foreground border-slate-200 dark:border-slate-800"
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Banners Scroller */}
        <div className="w-full overflow-hidden">
          <div 
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              const index = Math.round(target.scrollLeft / (target.offsetWidth * 0.85));
              setCurrentOfferIndex(index);
            }}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth gap-4 pb-2"
          >
            {[
              { id: 1, type: "Food", img: "/uploads/offers/food_50.png" },
              { id: 2, type: "MagicAI", img: "/uploads/offers/ai_25.png" }
            ]
            .filter(offer => activeOfferTab === "All" || offer.type === activeOfferTab)
            .map((offer) => (
              <motion.div
                key={offer.id}
                whileTap={{ scale: 0.98 }}
                className="min-w-[85vw] aspect-[2.2/1] snap-center relative rounded-[1.25rem] overflow-hidden shadow-2xl"
              >
                <img 
                  src={offer.img} 
                  alt="Special Offer"
                  className="w-full h-full object-cover absolute inset-0"
                />
              </motion.div>
            ))}
          </div>

          {/* Working Dynamic Pagination Indicators */}
          <div className="flex justify-center gap-1.5 mt-2">
            {[1, 2]
              .filter(() => activeOfferTab === "All") // Only show dots if both are there, or handle dynamic mapping
              .concat(activeOfferTab !== "All" ? [1] : []) // Adjust based on filter
              .slice(0, activeOfferTab === "All" ? 2 : 1) // Simple count for now
              .map((_, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    currentOfferIndex === idx 
                      ? "w-4 h-1.5 bg-red-600" 
                      : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700"
                  )}
                />
              ))}
          </div>
        </div>
      </div>
        
      {/* Welcome Popup */}
        
 
  {/* Immersive Spotlight Story View */}
  <AnimatePresence>
    {currentSpotlightIndex !== -1 && spotlights.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between md:hidden"
      >
        {/* Main Full Image Content (Full Screen Edge-to-Edge) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            key={currentSpotlightIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative"
          >
            <img 
              src={spotlights[currentSpotlightIndex].image_url} 
              alt={spotlights[currentSpotlightIndex].title} 
              className="w-full h-full object-cover absolute inset-0"
            />
            {/* Subtle dark overlay for readability */}
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </div>

        {/* Multiple Progress Bars (Facebook Style) */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1.5 h-[2.5px]">
          {spotlights.map((_, i) => (
            <div key={i} className="flex-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: i < currentSpotlightIndex ? "100%" : "0%" }}
                animate={{ width: i === currentSpotlightIndex ? "100%" : i < currentSpotlightIndex ? "100%" : "0%" }}
                transition={{ 
                   duration: i === currentSpotlightIndex ? 5 : 0, 
                   ease: "linear" 
                }}
                onAnimationComplete={() => {
                  if (i === currentSpotlightIndex) {
                    if (currentSpotlightIndex < spotlights.length - 1) {
                      setCurrentSpotlightIndex(prev => prev + 1);
                    } else {
                      setCurrentSpotlightIndex(-1);
                    }
                  }
                }}
                className="h-full bg-white"
              />
            </div>
          ))}
        </div>

        {/* Header / Profile Area */}
        <div className="w-full flex justify-between items-center z-10 mt-8 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-red-600 p-0.5 bg-white overflow-hidden">
              <img src="/menusnap_avatar_3d.png" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm tracking-tight">MenuSnap</span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-none">Sponsored</span>
            </div>
          </div>
          <button 
            onClick={() => setCurrentSpotlightIndex(-1)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
        </div>



        {/* Bottom Interactivity */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col items-center gap-4">
          <div 
            onClick={(e) => {
               e.stopPropagation();
               const url = spotlights[currentSpotlightIndex]?.link_url;
               if (url) window.location.href = url;
            }}
            className="flex flex-col items-center gap-1 opacity-70 cursor-pointer active:scale-95 transition-transform pointer-events-auto"
          >
            <ChevronDown className="h-5 w-5 text-white rotate-180 animate-bounce" />
            <span className="text-white font-black text-[10px] uppercase tracking-widest">
              {spotlights[currentSpotlightIndex]?.cta_text || 'Swipe up'}
            </span>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

      </div>
    </div>
  );
}
