
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Star, AlertTriangle, X } from "lucide-react";
import { motion, animate } from "framer-motion";
import { useClientAuth } from '@/hooks/use-client-auth';
import { decodeHtmlEntities } from '@/lib/utils';
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
    <div className="space-y-8">
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
        className={`transform transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
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
        className={`text-center mt-12 transform transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        style={{ transitionDelay: isMounted ? '300ms' : '0ms' }}
      >
        <Button asChild size="lg" variant="default" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Link href="/templates">View All Templates</Link>
        </Button>
      </div>
    </div>
  );
}
