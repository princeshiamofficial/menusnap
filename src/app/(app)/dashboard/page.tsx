
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileArchive, BookOpenCheck, FileText, Building2, Globe2, Star, AlertTriangle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  bgColorClass: string;
  textColorClass: string;
  iconColorClass: string;
}

function StatCard({ title, value, icon: Icon, bgColorClass, textColorClass, iconColorClass }: StatCardProps) {
  return (
    <Card className={`${bgColorClass} ${textColorClass} shadow-lg rounded-xl overflow-hidden`}>
      <CardContent className="p-4 sm:p-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-white/20 ${iconColorClass}`}>
          <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold">{value}+</p>
          <p className="text-xs sm:text-sm opacity-90">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <Card className="shadow-xl rounded-xl overflow-hidden w-full max-w-md mx-auto sm:max-w-sm flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative">
          <Image
            src={actualImageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            data-ai-hint={isUsingPlaceholder ? "placeholder abstract" : (imageHint || "template design")}
          />
        </div>
        {isTopRated && (
          <Badge variant="default" className="absolute top-3 right-3 bg-primary text-primary-foreground">
            <Star className="h-3 w-3 mr-1 fill-current" />
            TOP RATED
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold mb-1">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3 min-h-[40px]">{description}</CardDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 mt-auto">
        <Button variant="secondary" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">View Template</Button>
      </CardFooter>
    </Card>
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
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
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

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchTopRatedTemplates() {
      setIsLoadingTemplates(true);
      setTemplatesError(null);
      try {
        const response = await fetch("https://colorhutbd.xyz/vm/api/templates.php", {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`API error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success || !result.data || !Array.isArray(result.data.templates)) {
          console.error("Invalid API response structure for templates:", result);
          throw new Error("Invalid data format from API");
        }
        
        const fetchedTemplates: ApiTemplate[] = result.data.templates.map((t: any) => ({
          ...t,
          isPublished: t.isPublished === undefined ? false : Boolean(t.isPublished),
          tags: Array.isArray(t.tags) ? t.tags : [],
          imageUrl: t.imageUrl || '', // Ensure imageUrl is at least an empty string
        }));

        const filteredTopRated = fetchedTemplates.filter(
          template => template.isPublished && template.isTopRated
        );
        setTopRatedTemplates(filteredTopRated);

      } catch (e: any) {
        console.error("Failed to fetch top-rated templates:", e);
        setTemplatesError(e.message || "Failed to load top-rated templates.");
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    fetchTopRatedTemplates();
  }, []);

  const stats = [
    { title: "Designs", value: "12,365", icon: FileArchive, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
    { title: "Customers", value: "4,332", icon: Users, bgColorClass: "bg-primary", textColorClass: "text-primary-foreground", iconColorClass: "text-white" },
    { title: "Menu Book Production", value: "57,650", icon: BookOpenCheck, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
    { title: "Menu Card Production", value: "43,456", icon: FileText, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
    { title: "Our Coverage Thana", value: "639", icon: Building2, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
    { title: "Our Coverage County", value: "13", icon: Globe2, bgColorClass: "bg-secondary", textColorClass: "text-secondary-foreground", iconColorClass: "text-white" },
  ];

  return (
    <div className="space-y-8">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transform transition-all duration-700 ease-out ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div
        className={`transform transition-all duration-700 ease-out ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
        style={{ transitionDelay: isMounted ? '150ms' : '0ms' }}
      >
        <div className="flex items-center mb-4">
          <Star className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-2xl font-semibold text-foreground">Top-Rated Templates</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Our most popular professionally designed templates for your restaurant menu.
        </p>
        
        {isLoadingTemplates ? (
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
          <p className="text-muted-foreground text-center py-4">No top-rated templates available at the moment.</p>
        )}
      </div>

      <div
        className={`text-center mt-12 transform transition-all duration-700 ease-out ${
          isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
        style={{ transitionDelay: isMounted ? '300ms' : '0ms' }}
      >
        <Link href="/templates" passHref>
          <Button as="a" size="lg" variant="default" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">View All Templates</Button>
        </Link>
      </div>
    </div>
  );
}
