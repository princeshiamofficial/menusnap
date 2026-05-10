"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Star, AlertTriangle, X, ListOrdered, Layers, FileEdit, History, TrendingUp, ChevronDown } from "lucide-react";
import { motion, animate, AnimatePresence } from "framer-motion";
import { useClientAuth } from '@/hooks/use-client-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { decodeHtmlEntities, cn } from '@/lib/utils';
import { getTemplatesFromMySql } from '@/app/actions/orders';
import { getDashboardSlides, getDashboardSpotlights, getExclusiveOffers, getSpotlightCategories } from '@/app/actions/storefront';
import { getClientTimer, saveClientTimer } from '@/app/actions/client-timer';
import { saveHiringRequest } from '@/app/actions/responses';



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


const getImageHint = (name: string): string => {
  return name.toLowerCase().split(' ').slice(0, 2).join(' ') || 'template design';
}



function RoleIconSlider() {
  const roles = [
    { src: '/beautician_3d.png', label: 'Beautician', offset: '-mr-3' },
    { src: '/chef_3d.png', label: 'Chef', offset: 'mr-1' },
    { src: '/restaurant_manager_3d.png', label: 'Manager', offset: '-mr-1' },
    { src: '/waiter_3d.png', label: 'Waiter', offset: '-mr-1' }
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
            x: ['120%', '0%', '0%', '-450%'],
            opacity: [0, 1, 1, 0],
            scale: [0.8, 1, 1, 0.9]
          }}
          transition={{
            duration: 3.8,
            times: [0, 0.15, 0.85, 1],
            ease: ["easeOut", "linear", "easeIn"]
          }}
          className="absolute -bottom-1 right-0 h-11 flex items-center"
        >
          <span className={cn(
            "text-[10px] font-bold text-black relative z-20 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] whitespace-nowrap",
            roles[index].offset
          )}>
            {roles[index].label}
          </span>
          <div className="h-9 w-9 shrink-0 relative z-10">
            <img src={roles[index].src} alt={roles[index].label} className="w-full h-full object-contain" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MobileImageSlider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<{ src: string, title: string, desc: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      try {
        const result = await getDashboardSlides();
        if (result.success && result.slides && result.slides.length > 0) {
          // Map database rows to slider format
          const mappedSlides = (Array.isArray(result.slides) ? result.slides : []).map((slide: any, index: number) => ({
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
    return null;
  }

  return (
    <div className="md:hidden w-full aspect-[3/1] relative rounded-[1.5rem] overflow-hidden group ring-1 ring-white/10 bg-slate-100 dark:bg-slate-900/50">
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

function MobileActionGrid({ setIsHiringOpen }: { setIsHiringOpen: (val: boolean) => void }) {
  const actions = [
    {
      title: "eBook",
      description: "The ultimate restaurant growth blueprint",
      badge: "STRATEGIC",
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
      badge: "MONITORING",
      href: "/team-tracker",
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
      badge: "PREMIUM",
      href: "/templates",
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
      description: "Limited time pro offers - pay after satisfaction",
      href: "/order-history",
      isWidget: true
    },
  ];

  return (
    <div className="md:hidden mt-6">
      <div className="grid grid-cols-2 gap-1.5">
        {actions.map((action: any, i) => (
          <div key={action.href} className="block group">
            <motion.div
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative border rounded-3xl flex flex-col items-start justify-between aspect-[1.15/1] transition-all duration-300 bg-card border-border/50 p-4 shadow-sm active:shadow-inner overflow-hidden",
                action.isWidget && "bg-transparent border-none p-0 overflow-hidden shadow-none"
              )}
            >
              {action.isWidget ? (
                <div className="flex flex-col gap-2 w-full h-full cursor-default relative z-10">
                  <div className="flex-[0.6] bg-card border border-slate-200 rounded-2xl p-3 flex flex-row items-center justify-between shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col relative z-20 max-w-[60%]">
                      <span className="text-sm font-black text-foreground leading-tight tracking-tight">Free Design</span>
                      <p className="text-[9px] font-medium text-muted-foreground leading-tight mt-0.5 line-clamp-1">Pay after satisfaction</p>
                    </div>
                    <Link href="/free-design" className="absolute inset-0 z-30" />
                    <div className="absolute -right-2 bottom-2 h-14 w-14 shrink-0 pointer-events-none opacity-95 drop-shadow-xl">
                      <img
                        src="/dashboard/color-palette-premium-3d.png"
                        alt="Free Design"
                        className="w-full h-full object-contain absolute inset-0"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-row gap-1.5 w-full">
                    <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-2.5 flex flex-col items-start justify-between shadow-sm relative overflow-hidden group">
                      <div className="flex flex-row items-center gap-1 text-foreground/90 font-black text-xs relative z-10 whitespace-nowrap">
                        MagicTab
                      </div>
                      <div className="absolute -right-1 -bottom-2 h-12 w-12 opacity-95">
                        <img src="/dashboard/magictab_3d_icon.png" alt="MagicTab" className="w-full h-full object-contain absolute inset-0" />
                      </div>
                      <Link href="/magictab" className="absolute inset-0 z-20" />
                    </div>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsHiringOpen(true);
                        window.location.hash = 'hiring';
                      }}
                      className="flex-1 bg-red-50/50 border border-red-100 rounded-2xl p-2.5 flex flex-col items-start justify-between shadow-sm relative overflow-hidden group cursor-pointer active:scale-95 transition-all z-30"
                    >
                      <div className="flex flex-row items-center gap-1 text-red-600 font-black text-xs relative z-10 whitespace-nowrap">
                        Hiring <ChevronDown className="h-3 w-3" />
                      </div>
                      <RoleIconSlider />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link href={action.href} className="absolute inset-0 z-30" />
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
          </div>
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
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const { clientUser, clientLoading } = useClientAuth();
  const { toast } = useToast();

  const [hiringBusinessName, setHiringBusinessName] = useState("");
  const [hiringPhone, setHiringPhone] = useState("");
  const [hiringRequirements, setHiringRequirements] = useState("");
  const [hiringIsSubmitting, setHiringIsSubmitting] = useState(false);

  useEffect(() => {
    if (clientUser) {
      if (clientUser.businessName) setHiringBusinessName(clientUser.businessName);
      if (clientUser.whatsappNumber) setHiringPhone(clientUser.whatsappNumber);
    }
  }, [clientUser]);

  useEffect(() => {
    const checkIsDesktop = window.innerWidth >= 768;
    setIsDesktop(checkIsDesktop);
    
    if (checkIsDesktop) {
      window.location.replace('/magictab');
    }

    setIsMounted(true);

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        window.location.replace('/magictab');
      }
    };
    
    window.addEventListener('resize', handleResize);

    // Deep link support for hiring
    if (window.location.hash === '#hiring') {
      setIsHiringOpen(true);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [topRatedTemplates, setTopRatedTemplates] = useState<ApiTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);


  const [activeOfferTab, setActiveOfferTab] = useState("All");
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(-1);
  const [isStoryPaused, setIsStoryPaused] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [spotlights, setSpotlights] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [exclusiveOffers, setExclusiveOffers] = useState<any[]>([]);
  const [isHiringOpen, setIsHiringOpen] = useState(false);
  const [isHiringFormView, setIsHiringFormView] = useState(false);
  const [selectedHiringService, setSelectedHiringService] = useState<any>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 24, minutes: 0, seconds: 0 });
  const [targetTime, setTargetTime] = useState<Date | null>(null);
  const [showSeeMore, setShowSeeMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function syncTimer() {
      if (!showWelcomePopup || !clientUser?.whatsappNumber) return;

      const res = await getClientTimer(clientUser.whatsappNumber);
      let target: Date;

      if (res.success && res.targetTime) {
        // Use the saved UTC timestamp (Unix ms)
        target = new Date(res.targetTime);
      } else {
        // First time initialization: create a fresh 24h target based on NOW
        target = new Date();
        target.setHours(target.getHours() + 23, 59, 59);
        
        // Save the numeric timestamp to avoid all timezone issues
        await saveClientTimer(clientUser.whatsappNumber, target.getTime());
      }
      setTargetTime(target);
    }
    syncTimer();
  }, [showWelcomePopup, clientUser?.whatsappNumber]);

  useEffect(() => {
    if (!targetTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  useEffect(() => {
    // Automatically show popup on mobile on page load
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // const timer = setTimeout(() => setShowWelcomePopup(true), 800);
      // return () => clearTimeout(timer);
    }
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const fetchSpotlights = useCallback(async () => {
    const res = await getDashboardSpotlights();
    if (res.success) setSpotlights(res.spotlights);
    
    const catRes = await getSpotlightCategories();
    if (catRes.success) setCategories(catRes.categories);
  }, []);

  const fetchExclusiveOffers = useCallback(async () => {
    const res = await getExclusiveOffers();
    if (res.success) setExclusiveOffers(res.offers);
  }, []);

  // Story Progress and Pause Logic
  useEffect(() => {
    if (currentSpotlightIndex === -1) {
      setStoryProgress(0);
      setIsStoryPaused(false);
      return;
    }
    setStoryProgress(0);
  }, [currentSpotlightIndex]);

  useEffect(() => {
    if (currentSpotlightIndex === -1 || isStoryPaused) return;

    const interval = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          const activeCategory = spotlights[currentSpotlightIndex]?.group_name || 'General';
          const groupSpotlights = spotlights.filter(s => (s.group_name || 'General') === activeCategory);
          const groupIdx = groupSpotlights.findIndex(s => s.id === spotlights[currentSpotlightIndex]?.id);

          if (groupIdx < groupSpotlights.length - 1) {
            const nextInGroup = groupSpotlights[groupIdx + 1];
            const actualIdx = spotlights.findIndex(s => s.id === nextInGroup.id);
            setCurrentSpotlightIndex(actualIdx);
          } else {
            // Find the next group
            const allGroups = Array.from(new Set(spotlights.map(s => s.group_name || 'General')));
            const currentGroupIdx = allGroups.indexOf(activeCategory);
            if (currentGroupIdx < allGroups.length - 1) {
              const nextGroup = allGroups[currentGroupIdx + 1];
              const firstInNextGroup = spotlights.find(s => (s.group_name || 'General') === nextGroup);
              if (firstInNextGroup) {
                const actualIdx = spotlights.findIndex(s => s.id === firstInNextGroup.id);
                setCurrentSpotlightIndex(actualIdx);
              } else {
                setCurrentSpotlightIndex(-1);
              }
            } else {
              setCurrentSpotlightIndex(-1);
            }
          }
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 50ms * 100 = 5000ms (5 seconds)

    return () => clearInterval(interval);
  }, [currentSpotlightIndex, isStoryPaused, spotlights]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    fetchSpotlights();
    fetchExclusiveOffers();
    return () => clearTimeout(timer);
  }, [fetchSpotlights, fetchExclusiveOffers]);

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

        const fetchedTemplates: ApiTemplate[] = (Array.isArray(result.data) ? result.data : []).map((t: any) => ({
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




  // While checking or if desktop, show nothing to prevent flickering
  if (!isMounted || isDesktop === true || isDesktop === null) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-hidden flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 space-y-0 pb-12 transition-all pt-4">
        <div className="px-4 md:px-10 space-y-4 max-w-full overflow-hidden">
          <MobileImageSlider />
          <MobileActionGrid setIsHiringOpen={setIsHiringOpen} />
        </div>

        {/* Hidden Preloader for Spotlight Images */}
        <div className="hidden" aria-hidden="true">
          {spotlights.map((s, i) => (
            <img key={`preload-spot-${i}`} src={s.image_url} alt="" />
          ))}
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
              {/* WhatsApp Support Card */}
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="group relative min-w-[53vw] md:min-w-[240px] snap-center bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500/20 rounded-[1rem] p-1.5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col gap-0.5 relative z-10">
                  <div className="flex items-center gap-1">
                    <span className="bg-emerald-600 text-[7px] font-black text-white px-1.5 py-0.5 rounded-md tracking-tighter uppercase">LIVE</span>
                    <span className="text-emerald-600 font-black text-[9px]">Support</span>
                  </div>
                  <h3 className="text-[11px] font-black text-foreground flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Marketing Consultation <ChevronDown className="h-2 w-2 -rotate-90" />
                  </h3>
                  <p className="text-[7.5px] text-muted-foreground font-medium truncate opacity-80">Growth & Strategy Guide</p>
                </div>
                <div className="absolute -right-2 -bottom-1 w-[60px] h-[60px] opacity-100 group-hover:scale-110 transition-transform duration-500 z-0">
                  <img src="/dashboard/whatsapp-cs-white-bg.png" alt="WhatsApp Support" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <Link href="/marketing-consultation" className="absolute inset-0 z-20" />
              </motion.div>

              {/* Expert Support Card */}
              <motion.div
                whileTap={{ scale: 0.97 }}
                className="group relative min-w-[53vw] md:min-w-[240px] snap-center bg-orange-50 dark:bg-orange-950/20 rounded-[1rem] p-1.5 shadow-sm hover:shadow-md transition-all duration-300 border border-orange-100 dark:border-orange-900/50 overflow-hidden"
              >
                <div className="flex flex-col gap-1 relative z-10">
                  <div className="flex items-center gap-1">
                    <span className="bg-orange-600 text-[7px] font-black text-white px-1.5 py-0.5 rounded-md tracking-tighter uppercase">LIVE</span>
                    <span className="text-orange-600 font-black text-[9px]">Support</span>
                  </div>
                  <h3 className="text-[11px] font-black text-foreground leading-none tracking-tight">
                    Expert Support Call
                  </h3>
                  <p className="text-[7.5px] text-muted-foreground font-medium truncate opacity-80 mt-1">Fast Response Team</p>
                </div>
                <div className="absolute -right-2 -bottom-2 w-[55px] h-[55px] opacity-100 group-hover:scale-110 transition-transform duration-500 z-0">
                  <img src="/dashboard/cs-man-orange.png" alt="Expert Support" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <a href="tel:+8801919760626" className="absolute inset-0 z-20" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* MenuSnap Spotlight Section (MOBILE ONLY) */}
        <div className="md:hidden px-4 md:px-10 mb-10 w-full max-w-full overflow-hidden">
          <h2 className="text-xl font-black text-foreground mb-4 tracking-tight">MenuSnap Spotlight</h2>
          <div className="w-full overflow-hidden">
            <div className="flex overflow-x-auto gap-2 pb-6 scrollbar-hide snap-x snap-mandatory px-1">
              {spotlights.reduce((acc: any[], spot) => {
                const category = spot.group_name || 'General';
                if (!acc.find(item => (item.group_name || 'General') === category)) {
                  acc.push(spot);
                }
                return acc;
              }, []).map((item, idx) => (
                <motion.div
                  key={item.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    // Find the actual index in the full spotlights array to start the viewer correctly
                    const actualIdx = spotlights.findIndex(s => s.id === item.id);
                    setCurrentSpotlightIndex(actualIdx);
                  }}
                  className="flex-shrink-0 w-[25.5vw] aspect-[3/4] snap-center relative rounded-[1rem] overflow-hidden border-2 border-red-600 shadow-lg shadow-red-600/10 active:scale-95 transition-transform bg-white dark:bg-slate-900 p-[1px]"
                >
                  <img
                    src={categories.find(c => c.name === (item.group_name || 'General'))?.image_url || item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover relative z-10 rounded-[0.95rem]"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Exclusive Offers Section (MOBILE ONLY) */}
        <div className="md:hidden px-4 md:px-10 mb-10 w-full max-w-full overflow-hidden">
          <h2 className="text-xl font-black text-foreground mb-4 tracking-tight">Exclusive Offers</h2>

          {/* Filter Chips */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide flex-nowrap w-full">
            {["All", ...Array.from(new Set(exclusiveOffers.map(o => o.category)))].map((chip) => (
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
              {exclusiveOffers
                .filter(offer => activeOfferTab === "All" || offer.category === activeOfferTab)
                .map((offer) => (
                  <motion.div
                    key={offer.id}
                    whileTap={{ scale: 0.98 }}
                    className="min-w-[85vw] aspect-video snap-center relative rounded-[1.25rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900 p-[1px]"
                  >
                    <img 
                      src={offer.image_url} 
                      alt="Special Offer"
                      className="w-full h-full object-cover rounded-[1.2rem] bg-slate-50 dark:bg-slate-950"
                    />
                  </motion.div>
                ))}
            </div>

            {/* Working Dynamic Pagination Indicators */}
            <div className="flex justify-center gap-1.5 mt-2">
              {exclusiveOffers
                .filter(offer => activeOfferTab === "All" || offer.category === activeOfferTab)
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

        {/* Welcome Popup for Mobile */}
        <AnimatePresence>
          {showWelcomePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-6 md:hidden"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden relative shadow-2xl border border-white/20 aspect-[4/5] sm:aspect-auto"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="/dashboard/offer.png" 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="px-6 pb-3 flex flex-col items-center justify-end h-full text-center relative z-10">
                  <div className="flex flex-col items-center w-full">
                    <div className="flex items-center gap-1.5">
                      <div className="flex flex-col items-center gap-1">
                        <div className="bg-black/40 w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-black border border-white/20 shadow-xl">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </div>
                        <span className="text-[7px] font-black text-white/60 uppercase tracking-tighter">Hours</span>
                      </div>
                      <span className="text-white/60 text-sm font-bold mb-3">:</span>
                      <div className="flex flex-col items-center gap-1">
                        <div className="bg-black/40 w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-black border border-white/20 shadow-xl">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </div>
                        <span className="text-[7px] font-black text-white/60 uppercase tracking-tighter">Minutes</span>
                      </div>
                      <span className="text-white/60 text-sm font-bold mb-3">:</span>
                      <div className="flex flex-col items-center gap-1">
                        <div className="bg-black/40 w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-black border border-white/20 shadow-xl">
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </div>
                        <span className="text-[7px] font-black text-white/60 uppercase tracking-tighter">Seconds</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close button in top right */}
                <button 
                  onClick={() => setShowWelcomePopup(false)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white/50 active:scale-90 transition-transform z-20 border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


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
              {(() => {
                const activeCategory = spotlights[currentSpotlightIndex]?.group_name || 'General';
                const groupSpotlights = spotlights.filter(s => (s.group_name || 'General') === activeCategory);
                const groupIdx = groupSpotlights.findIndex(s => s.id === spotlights[currentSpotlightIndex]?.id);

                return (
                  <>
                    {/* Main Full Image Content (Full Screen Edge-to-Edge) */}
                    <div 
                      className="absolute inset-0 z-0 overflow-hidden"
                      onPointerDown={() => setIsStoryPaused(true)}
                      onPointerUp={() => setIsStoryPaused(false)}
                      onPointerLeave={() => setIsStoryPaused(false)}
                    >
                      <AnimatePresence>
                        <motion.div
                          key={spotlights[currentSpotlightIndex].id}
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full h-full relative"
                        >
                          <img
                            src={spotlights[currentSpotlightIndex].image_url}
                            alt={spotlights[currentSpotlightIndex].title}
                            className="w-full h-full object-cover absolute inset-0"
                          />
                          {/* Subtle overlay removed for clarity */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />

                          {/* Navigation Tap Areas */}
                          <div className="absolute inset-0 z-10 flex">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (groupIdx > 0) {
                                  const prevInGroup = groupSpotlights[groupIdx - 1];
                                  const actualIdx = spotlights.findIndex(s => s.id === prevInGroup.id);
                                  setCurrentSpotlightIndex(actualIdx);
                                } else {
                                  // Move to previous group
                                  const allGroups = Array.from(new Set(spotlights.map(s => s.group_name || 'General')));
                                  const currentGroupIdx = allGroups.indexOf(activeCategory);
                                  if (currentGroupIdx > 0) {
                                    const prevGroup = allGroups[currentGroupIdx - 1];
                                    const groupStories = spotlights.filter(s => (s.group_name || 'General') === prevGroup);
                                    if (groupStories.length > 0) {
                                      const lastInPrevGroup = groupStories[groupStories.length - 1];
                                      const actualIdx = spotlights.findIndex(s => s.id === lastInPrevGroup.id);
                                      setCurrentSpotlightIndex(actualIdx);
                                    }
                                  }
                                }
                              }}
                              className="flex-1 h-full cursor-pointer"
                            />
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (groupIdx < groupSpotlights.length - 1) {
                                  const nextInGroup = groupSpotlights[groupIdx + 1];
                                  const actualIdx = spotlights.findIndex(s => s.id === nextInGroup.id);
                                  setCurrentSpotlightIndex(actualIdx);
                                } else {
                                  // Move to next group
                                  const allGroups = Array.from(new Set(spotlights.map(s => s.group_name || 'General')));
                                  const currentGroupIdx = allGroups.indexOf(activeCategory);
                                  if (currentGroupIdx < allGroups.length - 1) {
                                    const nextGroup = allGroups[currentGroupIdx + 1];
                                    const firstInNextGroup = spotlights.find(s => (s.group_name || 'General') === nextGroup);
                                    if (firstInNextGroup) {
                                      const actualIdx = spotlights.findIndex(s => s.id === firstInNextGroup.id);
                                      setCurrentSpotlightIndex(actualIdx);
                                    } else {
                                      setCurrentSpotlightIndex(-1);
                                    }
                                  } else {
                                    setCurrentSpotlightIndex(-1);
                                  }
                                }
                              }}
                              className="flex-1 h-full cursor-pointer"
                            />
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Multiple Progress Bars (Group-based) */}
                    <div className="absolute top-4 left-4 right-4 z-50 flex gap-1.5 h-[2.5px]">
                      {groupSpotlights.map((_, i) => (
                        <div key={i} className="flex-1 bg-white/20 rounded-full overflow-hidden">
                          {i < groupIdx ? (
                            <div className="h-full w-full bg-white" />
                          ) : i === groupIdx ? (
                            <div 
                              className="h-full bg-white transition-all duration-100 ease-linear"
                              style={{ width: `${storyProgress}%` }}
                            />
                          ) : (
                            <div className="h-full w-0 bg-white" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Header / Profile Area */}
                    <div className="w-full flex justify-end items-center z-[60] mt-8 px-6">
                      <button
                        onClick={() => setCurrentSpotlightIndex(-1)}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 active:scale-90 transition-transform"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Bottom Interactivity */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col items-center gap-4">
                      <motion.div
                        drag="y"
                        dragConstraints={{ top: -40, bottom: 0 }}
                        dragElastic={0.1}
                        onDragStart={() => setIsStoryPaused(true)}
                        onDragEnd={(e, info) => {
                          setIsStoryPaused(false);
                          if (info.offset.y < -20) {
                            const url = spotlights[currentSpotlightIndex]?.link_url;
                            if (url) window.location.href = url;
                          }
                        }}
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
                      </motion.div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hiring Career Overlay */}
        <AnimatePresence>
          {isHiringOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-end justify-center md:hidden"
              onClick={() => {
                setIsHiringOpen(false);
                setIsHiringFormView(false);
                setSelectedHiringService(null);
                window.history.replaceState(null, '', window.location.pathname);
              }}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white dark:bg-slate-900 rounded-t-[1.5rem] flex flex-col max-h-[92vh] overflow-hidden shadow-[0_-8px_30px_rgb(0,0,0,0.12)]"
              >
                {/* Header Section */}
                <div className="flex flex-col items-center pt-2 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mb-4" />
                  <div className="w-full px-6 flex justify-between items-center">
                    <div className="w-8">
                      {isHiringFormView && (
                        <button 
                          onClick={() => setIsHiringFormView(false)}
                          className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
                        >
                          <ChevronDown className="w-5 h-5 rotate-90" />
                        </button>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isHiringFormView ? `Hire ${selectedHiringService?.title}` : "Hiring Services"}
                    </h2>
                    <button
                      onClick={() => {
                        setIsHiringOpen(false);
                        setIsHiringFormView(false);
                        setSelectedHiringService(null);
                        window.history.replaceState(null, '', window.location.pathname);
                      }}
                      className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div
                  ref={scrollRef}
                  onScroll={(e) => {
                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                    if (scrollTop + clientHeight >= scrollHeight - 40) {
                      setShowSeeMore(false);
                    } else {
                      setShowSeeMore(true);
                    }
                  }}
                  className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20"
                >
                  {!isHiringFormView ? (
                    <div className="grid grid-cols-2 gap-3 p-4 pb-20">
                      {[
                        { title: "Manager", category: "RESTAURANT", desc: "Expert hospitality admin & team coordination", img: "/restaurant_manager_3d.png", badge: "PRO", badgeColor: "bg-blue-500" },
                        { title: "Beautician", category: "PARLOR", desc: "Premium salon & aesthetic care professional", img: "/beautician_3d.png", badge: "NEW", badgeColor: "bg-red-500" },
                        { title: "Chef", category: "RESTAURANT", desc: "Master culinary speed & kitchen operation", img: "/chef_3d.png", badge: "HOT", badgeColor: "bg-orange-500" },
                        { title: "Makeup Artist", category: "PARLOR", desc: "Creative artistry for events and shoots", img: "/makeup_artist_3d.png" },
                        { title: "Waiter", category: "RESTAURANT", desc: "Top-tier guest serving & floor management", img: "/waiter_3d.png" },
                        { title: "Manager", category: "PARLOR", desc: "Strategic parlor operations & staff lead", img: "/parlor_manager_3d.png" },
                        { title: "Cashier", category: "RESTAURANT", desc: "Secure billing & merchant payment control", img: "/cashier_3d.png", badge: "NEW", badgeColor: "bg-red-500" },
                        { title: "Receptionist", category: "PARLOR", desc: "Front desk booking & client coordination", img: "/receptionist_3d.png" }
                      ].map((service, idx) => (
                        <motion.div
                          key={`${service.title}-${idx}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedHiringService(service);
                            setIsHiringFormView(true);
                          }}
                          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 h-[140px] relative shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
                        >
                          <div className="flex flex-col h-full relative z-10 max-w-[65%]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{service.title}</h3>
                              {service.badge && (
                                <span className={cn("text-[8px] font-black text-white px-1.5 py-0.5 rounded-[4px]", service.badgeColor)}>{service.badge}</span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug line-clamp-3">{service.desc}</p>
                          </div>
                          <div className="absolute -right-2 bottom-1 w-[95px] h-[95px] pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            <img src={service.img} alt={service.title} className="w-full h-full object-contain drop-shadow-xl" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-white dark:bg-slate-900 min-h-full">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6 pb-20"
                      >
                        {clientUser ? (
                          <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Requirements</label>
                              <textarea 
                                value={hiringRequirements}
                                onChange={(e) => setHiringRequirements(e.target.value)}
                                placeholder="What kind of person are you looking for?"
                                className="w-full h-32 p-4 rounded-xl bg-white dark:bg-slate-900 border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                              />
                            </div>
                            <Button 
                              disabled={hiringIsSubmitting}
                              className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
                              onClick={async () => {
                                if (!hiringBusinessName || !hiringPhone || !hiringRequirements) {
                                  toast({
                                    title: "Required Info",
                                    description: "Please provide all details.",
                                    variant: "destructive"
                                  });
                                  return;
                                }

                                setHiringIsSubmitting(true);
                                try {
                                  const res = await saveHiringRequest({
                                    businessName: hiringBusinessName,
                                    whatsappNumber: hiringPhone,
                                    designation: selectedHiringService?.title,
                                    requirement: hiringRequirements
                                  });

                                  if (res.success) {
                                    router.push('/success?type=hiring');
                                  } else {
                                    throw new Error(res.error);
                                  }
                                } catch (err) {
                                  toast({
                                    title: "Submission Failed",
                                    description: "Something went wrong.",
                                    variant: "destructive"
                                  });
                                } finally {
                                  setHiringIsSubmitting(false);
                                }
                              }}
                            >
                              {hiringIsSubmitting ? "..." : "Hire Now"}
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Business Name</label>
                              <input 
                                type="text" 
                                value={hiringBusinessName}
                                onChange={(e) => setHiringBusinessName(e.target.value)}
                                placeholder="Enter your restaurant/shop name"
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">WhatsApp Number</label>
                              <input 
                                type="tel" 
                                value={hiringPhone}
                                onChange={(e) => setHiringPhone(e.target.value)}
                                placeholder="e.g. 017XXXXXXXX"
                                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Requirements</label>
                              <textarea 
                                value={hiringRequirements}
                                onChange={(e) => setHiringRequirements(e.target.value)}
                                placeholder="Tell us what kind of person you are looking for..."
                                rows={4}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                              />
                            </div>

                            <Button 
                              disabled={hiringIsSubmitting}
                              className="w-full h-14 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
                              onClick={async () => {
                                if (!hiringBusinessName || !hiringPhone || !hiringRequirements) {
                                  toast({
                                    title: "Required Info",
                                    description: "Please provide all details.",
                                    variant: "destructive"
                                  });
                                  return;
                                }

                                setHiringIsSubmitting(true);
                                try {
                                  const res = await saveHiringRequest({
                                    businessName: hiringBusinessName,
                                    whatsappNumber: hiringPhone,
                                    designation: selectedHiringService?.title,
                                    requirement: hiringRequirements
                                  });

                                  if (res.success) {
                                    router.push('/success?type=hiring');
                                  } else {
                                    throw new Error(res.error);
                                  }
                                } catch (err) {
                                  toast({
                                    title: "Submission Failed",
                                    description: "Something went wrong.",
                                    variant: "destructive"
                                  });
                                } finally {
                                  setHiringIsSubmitting(false);
                                }
                              }}
                            >
                              {hiringIsSubmitting ? "Submitting..." : "Submit Request"}
                            </Button>
                          </>
                        )}
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Floating See More */}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

