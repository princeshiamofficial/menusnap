
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Star, AlertTriangle, X, ListOrdered, Layers, FileEdit, History, TrendingUp, ChevronDown } from "lucide-react";
import { motion, animate, AnimatePresence } from "framer-motion";
import { useClientAuth } from '@/hooks/use-client-auth';
import { decodeHtmlEntities, cn } from '@/lib/utils';
import { getTemplatesFromMySql } from '@/app/actions/orders';



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
            <Image
              src={actualImageUrl}
              alt=""
              fill
              className="object-cover blur-xl opacity-95"
              priority={false}
              aria-hidden="true"
            />
            <Image
              src={actualImageUrl}
              alt={decodeHtmlEntities(title)}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain relative z-10 drop-shadow-xl"
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

function MobileImageSlider() {
  const [current, setCurrent] = useState(0);
  const images = [
    {
      src: "/dashboard/slider1.png",
      title: "Design Your Dream Menu",
      desc: "Customize templates with your branding"
    },
    {
      src: "/dashboard/slider2.png",
      title: "Real-time Collaboration",
      desc: "Edit together in real-time with your team"
    },
    {
      src: "/dashboard/slider3.png",
      title: "WhatsApp Integration",
      desc: "Share your menu directly with customers"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="md:hidden w-full h-[120px] sm:h-[150px] relative rounded-3xl overflow-hidden shadow-2xl group ring-1 ring-white/20">
      {/* Hidden preloader for all slider images */}
      <div className="hidden" aria-hidden="true">
        {images.map((img, i) => (
          <Image key={`preload-${i}`} src={img.src} alt="" width={1} height={1} priority />
        ))}
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ x: '100%', opacity: 0, scale: 1.1 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: '-100%', opacity: 0, scale: 0.9 }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.1, 0.25, 1], // Custom slow ease-in-out
            opacity: { duration: 0.8 }
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent z-10" />
          <Image
            src={images[current].src}
            alt={images[current].title}
            fill
            className="object-cover scale-105"
            priority={current === 0}
          />

        </motion.div>
      </AnimatePresence>

      {/* Premium Pagination Dots */}
      <div className="absolute top-4 right-6 flex flex-col gap-2 z-30">
        {images.map((_, i) => (
          <motion.div
            key={i}
            onClick={() => setCurrent(i)}
            animate={{
              height: i === current ? 24 : 8,
              backgroundColor: i === current ? "rgba(255,165,0,0.9)" : "rgba(255,255,255,0.3)"
            }}
            className="w-1.5 rounded-full transition-all duration-500 cursor-pointer"
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
      title: "MagicTab",
      description: "Automate your menu setup with AI",
      badge: "ULTRA FAST",
      href: "/magictab",
      icon: ListOrdered,
      color: "text-orange-500/20",
      badgeColor: "bg-orange-100 text-orange-700"
    },
    {
      title: "Team Tracker",
      description: "Manage your team's workflow",
      badge: "PRO",
      href: "/templates",
      icon: Layers,
      color: "text-blue-500/20",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      title: "Designs",
      description: "Curate your custom menu designs",
      badge: "DRAFTING",
      href: "/draft",
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
        {actions.map((action, i) => (
          <Link key={action.href} href={action.href} className="block group">
            <motion.div
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative border rounded-3xl flex flex-col items-start justify-between aspect-[1.15/1] transition-all duration-300 bg-card border-border/50 p-4 shadow-sm active:shadow-inner overflow-hidden",
                action.isWidget && "bg-transparent border-none p-0 overflow-visible shadow-none"
              )}
            >
              {action.isWidget ? (
                <div className="flex flex-col gap-2 w-full h-full">
                  <div className="flex-[0.6] bg-card border border-border/50 rounded-2xl p-3 flex flex-row items-center justify-between shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col z-10 max-w-[60%]">
                      <span className="text-sm font-black text-foreground leading-tight tracking-tight">Free Design</span>
                      <p className="text-[9px] font-medium text-muted-foreground leading-tight mt-0.5 line-clamp-1">Limited time pro offers</p>
                    </div>
                    <div className="relative h-11 w-11 shrink-0 transition-transform group-hover:scale-110 duration-500">
                      <Image
                        src="/total_orders_3d_icon.png"
                        alt="Total Orders"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-row gap-1.5 w-full">
                    <div className="flex-1 bg-white border border-border/50 rounded-2xl p-3 flex flex-col items-start justify-between shadow-sm relative overflow-hidden group">
                      <div className="flex flex-row items-center gap-1 text-foreground/90 font-black text-sm z-10 whitespace-nowrap">
                        e-Book
                      </div>
                      <div className="absolute -right-1 -bottom-1 h-10 w-10 opacity-80 transition-transform group-hover:scale-110 duration-500">
                        <Image src="/ebook_3d_icon.png" alt="e-Book" fill className="object-contain" />
                      </div>
                    </div>
                    <div className="flex-1 bg-red-50/50 border border-red-100 rounded-2xl p-3 flex flex-col items-start justify-between shadow-sm relative overflow-hidden group">
                      <div className="flex flex-row items-center gap-1 text-red-600 font-black text-sm z-10 whitespace-nowrap">
                        All <ChevronDown className="h-3 w-3" />
                      </div>
                      <div className="absolute -right-1 -bottom-1 h-10 w-10 opacity-80 transition-transform group-hover:scale-110 duration-500">
                        <Image src="/analytics_all_3d_icon.png" alt="All" fill className="object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="z-10">
                    <h3 className="text-lg font-black text-foreground leading-tight">{action.title}</h3>
                    <p className="text-[10px] font-medium text-muted-foreground leading-tight mt-1 max-w-[85%]">
                      {action.description}
                    </p>
                  </div>

                  {action.icon && <action.icon className={cn("h-16 w-16 absolute -right-3 top-14 rotate-12 transition-transform group-hover:scale-110", action.color)} />}

                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider flex items-center gap-1 z-10 uppercase",
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
          <Image
            src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
            alt="Color Hut Logo"
            fill
            sizes="112px"
            className="object-contain"
            priority
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 shadow-md transition-transform active:scale-95 relative">
          <Image
            src={avatarUrl}
            alt="User Avatar"
            fill
            sizes="36px"
            className="object-cover"
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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const { clientUser, clientLoading } = useClientAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const hasSeenPopup = sessionStorage.getItem('dashboard_welcome_seen');
    if (isMobile && !hasSeenPopup) {
      setShowWelcomePopup(true);
    }
  }, []);

  const handleCloseWelcomePopup = () => {
    sessionStorage.setItem('dashboard_welcome_seen', 'true');
    setShowWelcomePopup(false);
  };

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
    <div className="min-h-full flex flex-col">
      <div className="flex-1 space-y-0 pb-8 transition-all pt-6">
        <div className="px-4 md:px-10 space-y-3">
          <MobileImageSlider />
          <MobileActionGrid />
        </div>
        {/* Welcome Popup */}
        <Dialog open={showWelcomePopup} onOpenChange={(open) => { if (!open) handleCloseWelcomePopup(); }}>
          <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-sm w-full" style={{ boxShadow: 'none' }}>
            <DialogTitle className="sr-only">Welcome to Dashboard</DialogTitle>
            <div className="relative">
              <button
                onClick={handleCloseWelcomePopup}
                className="absolute top-2 right-2 z-50 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                aria-label="Close welcome popup"
              >
                <X className="h-4 w-4" />
              </button>
              <Image
                src="/dashboard-welcome-popup.png"
                alt="Welcome to Dashboard"
                width={600}
                height={800}
                className="rounded-2xl w-full h-auto"
                priority
              />
            </div>
          </DialogContent>
        </Dialog>


        <div
          className={cn(
            "transform transition-all duration-700 ease-out px-4 md:px-10",
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          )}
          style={{ transitionDelay: isMounted ? '150ms' : '0ms' }}
        >
          <div className="flex items-center mb-4">
            <Star className="h-6 w-6 text-primary mr-2" />
            <h2 className="text-2xl font-semibold text-foreground">Top-Rated Templates</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Our most popular professionally designed templates for your {clientUser?.type || 'business'}.
          </p>

          {showTemplateSkeletons ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <TemplateSkeletonCard key={index} />
              ))}
            </div>
          ) : templatesError ? (
            <div className="flex flex-col items-center justify-center text-center py-10 bg-card border border-destructive/50 rounded-lg shadow-md">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
              <p className="text-muted-foreground max-w-md">{templatesError}</p>
            </div>
          ) : topRatedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topRatedTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  imageUrl={template.imageUrl}
                  imageHint={getImageHint(template.name)}
                  title={template.name}
                  description={template.description}
                  tags={template.tags || []}
                  isTopRated={template.isTopRated}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No top-rated templates available for your business type at the moment.</p>
          )}
        </div>

        <div
          className={`text-center mt-12 px-4 md:px-10 transform transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          style={{ transitionDelay: isMounted ? '300ms' : '0ms' }}
        >
          <Button asChild size="lg" variant="default" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link href="/templates">View All Templates</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
