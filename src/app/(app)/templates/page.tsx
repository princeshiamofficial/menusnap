
"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, Search, Star, Maximize } from "lucide-react";
import type { ReactNode } from 'react';

interface TemplateCardProps {
  id: string;
  imageUrl: string;
  imageHint: string;
  title: string;
  description: string;
  tags: string[];
  isTopRated?: boolean;
}

const templateData: TemplateCardProps[] = [
  {
    id: "1",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "modern menu design",
    title: "Golden Delights",
    description: "Modern orange &amp; gold design with bold food photography.",
    tags: ["Restaurant", "Cafe", "Popular"],
    isTopRated: true,
  },
  {
    id: "2",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "elegant script menu",
    title: "Crimson Quill",
    description: "An elegant script-style menu, perfect for handwritten specials or a classic feel.",
    tags: ["Restaurant", "Menu", "Classic"],
    isTopRated: false,
  },
  {
    id: "3",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "floral spring menu",
    title: "Azure Bloom",
    description: "A fresh and floral design, ideal for spring menus or garden cafes.",
    tags: ["Restaurant", "Cafe", "Seasonal"],
    isTopRated: false,
  },
  {
    id: "4",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "rustic menu design",
    title: "Rustic Eatery",
    description: "A charming rustic design that gives a homemade, cozy atmosphere.",
    tags: ["Restaurant", "Bistro"],
    isTopRated: false,
  },
  {
    id: "5",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "minimalist cafe menu",
    title: "Simply Stated",
    description: "Clean and minimalist layout, focusing on typography and clarity.",
    tags: ["Cafe", "Minimalist", "Modern"],
    isTopRated: true,
  },
  {
    id: "6",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "vintage diner menu",
    title: "Retro Diner",
    description: "Fun retro vibes with classic diner aesthetics for a nostalgic feel.",
    tags: ["Diner", "Retro", "Fun"],
    isTopRated: false,
  },
];

function TemplateCard({
  imageUrl,
  imageHint,
  title,
  description,
  tags,
  isTopRated,
}: TemplateCardProps): ReactNode {
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <div className="aspect-[4/3] relative group"> {/* Aspect ratio for image consistency */}
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={imageHint}
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
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed min-h-[40px]">{description}</p> {/* min-h for consistent description height */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto"> {/* mt-auto pushes footer to bottom */}
        <Button variant="outline" className="w-full">
          Select Template
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function TemplatesPage(): ReactNode {
  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Restaurant Templates
            </h1>
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Choose a restaurant template that best represents your dining establishment. Perfect for restaurants, cafes, and food services.
          </p>
        </div>
        <div className="relative w-full sm:w-auto mt-4 sm:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search restaurant templates..."
            className="pl-10 w-full sm:w-64 md:w-72 text-sm"
          />
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {templateData.map((template) => (
            <TemplateCard key={template.id} {...template} />
          ))}
        </div>
      </main>
    </div>
  );
}
