
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Search, Star, Maximize, AlertTriangle } from "lucide-react"; 
import type { ReactNode } from 'react';

interface ApiTemplate {
  id: string;
  name: string; 
  description: string;
  isTopRated?: boolean;
  isPublished: boolean;
  tags: string[];
  imageUrl: string;
  createdAt?: string; 
}

interface TemplateCardProps {
  id: string;
  imageUrl: string;
  imageHint: string;
  title: string;
  description: string;
  tags: string[];
  isTopRated?: boolean;
}

const DEFAULT_TEMPLATE_IMAGE_URL = 'https://erp.colorhutbd.xyz/file/uploads/68502bf9cec52_placeholder.svg';

function TemplateCard({
  imageUrl,
  imageHint,
  title,
  description,
  tags,
  isTopRated,
}: TemplateCardProps): ReactNode {
  const actualImageUrl = imageUrl || DEFAULT_TEMPLATE_IMAGE_URL;
  const isUsingPlaceholder = !imageUrl || imageUrl === DEFAULT_TEMPLATE_IMAGE_URL;

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative group">
          <Image
            src={actualImageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={isUsingPlaceholder ? "placeholder abstract" : imageHint}
          />
          {isTopRated && (
            <Badge className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 border-yellow-500 font-semibold py-1 px-2.5 shadow">
              <Star className="h-4 w-4 mr-1.5 fill-current text-yellow-900" />
              TOP RATED
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 h-9 w-9 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
            aria-label="Maximize template preview"
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h2 className="text-lg font-semibold mb-1.5 text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed min-h-[40px]">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Button variant="outline" className="w-full">
          Select Template
        </Button>
      </CardFooter>
    </Card>
  );
}

function TemplateSkeletonCard(): ReactNode {
  return (
    <Card className="overflow-hidden shadow-md rounded-lg flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}


export default function TemplatesPage(): ReactNode {
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchTemplates() {
      setIsLoading(true);
      setError(null);
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
          console.error("Invalid API response structure:", result);
          throw new Error("Invalid data format from API");
        }
        const fetchedTemplates: ApiTemplate[] = result.data.templates.map((t: any, index: number) => ({
          ...t,
          isPublished: t.isPublished === undefined ? false : Boolean(t.isPublished),
          tags: Array.isArray(t.tags) ? t.tags : [],
          imageUrl: t.imageUrl || '', // Ensure imageUrl is at least an empty string
          createdAt: t.createdAt || new Date(Date.now() - Math.random() * 10000000000 * (index + 1)).toISOString(),
        }));
        setTemplates(fetchedTemplates);
      } catch (e: any) {
        console.error("Failed to fetch templates:", e);
        setError(e.message || "Failed to load templates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const getImageHint = (name: string): string => {
    return name.toLowerCase().split(' ').slice(0, 2).join(' ') || 'template design';
  }

  const filteredTemplates = templates
    .filter(template => template.isPublished)
    .filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (a.isTopRated && !b.isTopRated) return -1;
      if (!a.isTopRated && b.isTopRated) return 1;
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (a.createdAt) {
        return -1; 
      } else if (b.createdAt) {
        return 1;  
      }
      return 0; 
    });

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              All Templates
            </h1>
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Choose a template that best represents your brand. Perfect for various businesses and services.
          </p>
        </div>
        <div className="relative w-full sm:w-auto mt-4 sm:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search all templates..."
            className="pl-10 w-full sm:w-64 md:w-72 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <TemplateSkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-10 bg-card border border-destructive/50 rounded-lg shadow-md">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
            <p className="text-muted-foreground max-w-md">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-6">
              Try Again
            </Button>
          </div>
        ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? "No published templates match your search." : "No published templates available at the moment."}
              </p>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                title={template.name}
                description={template.description}
                imageUrl={template.imageUrl}
                imageHint={getImageHint(template.name)}
                tags={template.tags || []}
                isTopRated={template.isTopRated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
    
