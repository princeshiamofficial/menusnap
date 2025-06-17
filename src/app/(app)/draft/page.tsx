
"use client";

import type { ReactNode } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Clock, 
  ListChecks, 
  RotateCcw, 
  Trash2, 
  CalendarDays,
  Tag,
  ChevronRight,
  FileText,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNowStrict, parseISO, isValid } from 'date-fns';

interface DraftItem {
  id: string;
  name: string; 
  createdAt: string; // ISO string
  itemCount: number;
  primaryTag: string; // e.g., "restaurant-expresso-based-classics-1749702507341"
  price: number;
  previewAvatars: string[]; // Initials for avatars
}

// Mock Data
const initialMockDrafts: DraftItem[] = [
  {
    id: "draft_1",
    name: "Menu Selection",
    createdAt: new Date().toISOString(),
    itemCount: 5,
    primaryTag: "restaurant-expresso-based-classics-1749702507341",
    price: 0,
    previewAvatars: ["CH", "RD", "FV"],
  },
  {
    id: "draft_2",
    name: "Menu Selection",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    itemCount: 8,
    primaryTag: "parlour-sweet-treats-1749702507555",
    price: 1200,
    previewAvatars: ["SC", "IC", "MK"],
  },
  {
    id: "draft_3",
    name: "Quick Lunch Ideas",
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(), // 1 hour 5 mins ago
    itemCount: 3,
    primaryTag: "cafe-light-bites-1749702507888",
    price: 750,
    previewAvatars: ["SW", "SL", "DR"],
  },
   {
    id: "draft_4",
    name: "Dinner Specials",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    itemCount: 12,
    primaryTag: "fine-dining-main-course-1749702507999",
    price: 3500,
    previewAvatars: ["ST", "PT", "WN"],
  },
];


interface DraftCardProps {
  draft: DraftItem;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onShowDetails: (id: string) => void;
}

function DraftCard({ draft, onRestore, onDelete, onShowDetails }: DraftCardProps): ReactNode {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const createdAtDate = parseISO(draft.createdAt);
  const isValidDate = isValid(createdAtDate);

  const formattedTitleDate = isValidDate ? format(createdAtDate, 'dd/MM/yyyy') : 'Invalid Date';
  const relativeTime = isValidDate && hasMounted ? formatDistanceToNowStrict(createdAtDate, { addSuffix: true }) : 'Calculating...';
  const formattedCreationDate = isValidDate ? format(createdAtDate, 'EEE, MMM d, hh:mm a') : 'Invalid Date';
  const formattedShortDateBadge = isValidDate ? format(createdAtDate, 'MMM d') : 'N/A';
  
  const totalAvatarsToShow = draft.previewAvatars.length;
  const avatarsToDisplay = draft.previewAvatars.slice(0, 3);
  const remainingAvatars = Math.max(0, draft.itemCount - avatarsToDisplay.length);


  return (
    <Card className="shadow-lg rounded-xl overflow-hidden bg-card border border-border transition-all hover:shadow-xl">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-primary">{`${draft.name} ${formattedTitleDate}`}</h3>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> {relativeTime}</span>
              <span className="flex items-center"><ListChecks className="h-3.5 w-3.5 mr-1" /> {draft.itemCount} items</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => console.log("Redo draft:", draft.id)} aria-label="Redo draft">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(draft.id)} aria-label="Delete draft">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-2 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-700/20 dark:text-orange-400 dark:border-orange-600 font-normal py-1 px-2.5 text-xs">
            <Tag className="h-3 w-3 mr-1.5 opacity-80"/>
            {draft.primaryTag}
          </Badge>
          <Badge variant="secondary" className="bg-muted text-muted-foreground font-semibold py-1 px-2.5 text-xs">
            ৳{draft.price.toLocaleString()}
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground font-medium py-1 px-2.5 text-xs">
            <CalendarDays className="h-3 w-3 mr-1.5 opacity-70"/>
            {formattedShortDateBadge}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {avatarsToDisplay.map((initial, index) => (
              <Avatar key={index} className="h-7 w-7 border-2 border-card shadow-sm">
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                  {initial}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {remainingAvatars > 0 && (
            <span className="text-xs font-medium text-muted-foreground ml-1">+{remainingAvatars}</span>
          )}
          <Button variant="link" className="text-xs h-auto p-0 text-primary hover:text-primary/80" onClick={() => onShowDetails(draft.id)}>
            Show details <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 px-5 py-3 flex justify-between items-center border-t border-border">
        <p className="text-xs text-muted-foreground">Created on {formattedCreationDate}</p>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-foreground text-background hover:bg-foreground/80"
          onClick={() => onRestore(draft.id)}
        >
          Restore Selection
        </Button>
      </CardFooter>
    </Card>
  );
}

function DraftSkeletonCard(): ReactNode {
  return (
    <Card className="shadow-lg rounded-xl overflow-hidden bg-card border-border">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-6 w-48 mb-1.5" />
            <div className="flex items-center space-x-3 mt-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pt-2 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Skeleton className="h-6 w-56 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 px-5 py-3 flex justify-between items-center border-t border-border">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </CardFooter>
    </Card>
  );
}


export default function DraftPage(): ReactNode {
  const [drafts, setDrafts] = useState<DraftItem[]>(initialMockDrafts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Simulate loading for now
  const [error, setError] = useState<string | null>(null);

  // Simulate API call for drafts in future if needed
  // useEffect(() => {
  //   setIsLoading(true);
  //   // Simulate API fetch
  //   setTimeout(() => {
  //     setDrafts(initialMockDrafts);
  //     setIsLoading(false);
  //   }, 1000);
  // }, []);

  const handleRestoreDraft = (id: string) => {
    console.log("Restore draft:", id);
    // Add logic to restore draft
  };

  const handleDeleteDraft = (id: string) => {
    console.log("Delete draft:", id);
    setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== id));
  };

  const handleShowDetails = (id: string) => {
    console.log("Show details for draft:", id);
    // Add logic to show draft details
  };

  const filteredDrafts = useMemo(() => {
    if (!searchTerm) return drafts;
    return drafts.filter(draft =>
      draft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft.primaryTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(parseISO(draft.createdAt), 'dd/MM/yyyy').includes(searchTerm)
    );
  }, [drafts, searchTerm]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
             <FileText className="h-8 w-8 mr-3 text-primary" />
            Saved Drafts
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Recover your previously selected menu items.
          </p>
        </div>
        <div className="relative w-full sm:w-auto sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search drafts..."
            className="pl-10 w-full text-sm h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search saved drafts"
          />
        </div>
      </header>

      <main className="space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => <DraftSkeletonCard key={index} />)
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-10 bg-card border border-destructive/50 rounded-lg shadow-md">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Drafts</h2>
            <p className="text-muted-foreground max-w-md">{error}</p>
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-lg shadow border border-border">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg font-medium">
              {searchTerm ? "No drafts match your search." : "You have no saved drafts."}
            </p>
          </div>
        ) : (
          filteredDrafts.map(draft => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onRestore={handleRestoreDraft}
              onDelete={handleDeleteDraft}
              onShowDetails={handleShowDetails}
            />
          ))
        )}
      </main>
    </div>
  );
}
