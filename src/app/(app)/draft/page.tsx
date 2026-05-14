
"use client";

import type { ReactNode } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ChevronDown,
  FileText,
  AlertTriangle,
  Square,
  Utensils,
  Sparkles,
  FolderOpen
} from "lucide-react";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { format, formatDistanceToNowStrict, parseISO, isValid } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { getCategoriesFromMySql } from '@/app/actions/orders';

const STATIC_AVATAR_IMAGE_URL = '/assets/image.svg';
const DRAFTS_STORAGE_KEY = 'menuBuilderDrafts';


interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount?: number;
  status?: string;
  createdAt?: string;
  description?: string;
  visibleToUsers?: boolean;
}

interface DraftSubItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

interface DraftItem {
  id: string;
  name: string;
  createdAt: string;
  itemCount: number;
  primaryTag: string;
  price: number;
  previewAvatars: string[];
  items?: DraftSubItem[];
}

interface DraftCardProps {
  draft: DraftItem;
  isExpanded: boolean;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
  masterCategoryList: Category[];
}

const extractMenuTypeFromTag = (tag: string): string => {
  if (!tag) return 'Unknown Type';
  const parts = tag.split('-');
  if (parts.length > 0) {
    const type = parts[0];
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    if (capitalizedType === "Restaurant" || capitalizedType === "Parlour") {
      return capitalizedType;
    }
  }
  return 'Unknown Type';
};

function DraftCard({ draft, isExpanded, onRestore, onDelete, onToggleExpand, masterCategoryList }: DraftCardProps): ReactNode {
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

  const avatarsToShowCount = Math.min(draft.itemCount > 0 ? 3 : draft.previewAvatars.length, 3);
  const remainingAvatars = Math.max(0, draft.itemCount - avatarsToShowCount);

  const menuTypeDisplay = extractMenuTypeFromTag(draft.primaryTag);
  const MenuTypeIcon = menuTypeDisplay === 'Parlour' ? Sparkles : Utensils;

  const idPrefixForDraft = useMemo(() => {
    const type = draft.primaryTag.split('-')[0].toLowerCase();
    return (type === "restaurant" || type === "parlour") ? type : "unknown";
  }, [draft.primaryTag]);

  const itemsByCategoryId = useMemo(() => {
    if (!draft.items || idPrefixForDraft === "unknown") return {};
    return draft.items.reduce((acc, item) => {
      const prefixedCatId = `${idPrefixForDraft}-${item.categoryId}`;
      if (!acc[prefixedCatId]) acc[prefixedCatId] = [];
      acc[prefixedCatId].push(item);
      return acc;
    }, {} as Record<string, DraftSubItem[]>);
  }, [draft.items, idPrefixForDraft]);

  const categoriesInDraftOrder = useMemo(() => {
    if (!draft.items || !masterCategoryList || idPrefixForDraft === "unknown") return [];

    const categoryIdsInDraft = new Set<string>();
    const orderedPrefixedCategoryIds: string[] = [];

    draft.items.forEach(item => {
      const prefixedCatId = `${idPrefixForDraft}-${item.categoryId}`;
      if (!categoryIdsInDraft.has(prefixedCatId)) {
        categoryIdsInDraft.add(prefixedCatId);
        orderedPrefixedCategoryIds.push(prefixedCatId);
      }
    });

    return orderedPrefixedCategoryIds
      .map(prefixedId => masterCategoryList.find(cat => cat.id === prefixedId))
      .filter((cat): cat is Category => cat !== undefined);
  }, [draft.items, masterCategoryList, idPrefixForDraft]);


  return (
    <Card className="shadow-lg rounded-xl overflow-hidden bg-card border border-border transition-all hover:shadow-xl">
      <CardHeader className="p-2 pb-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold text-primary truncate max-w-[200px]">{`${decodeHtmlEntities(draft.name)}`}</h3>
            <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-0.5">
              <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {relativeTime}</span>
              <span className="flex items-center"><ListChecks className="h-3 w-3 mr-1" /> {draft.itemCount} items</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => console.log("Redo draft:", draft.id)} aria-label="Redo draft">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(draft.id)} aria-label="Delete draft">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2 pt-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-700/20 dark:text-orange-400 dark:border-orange-600 font-normal py-0.5 px-2 text-[9px]">
            <MenuTypeIcon className="h-2.5 w-2.5 mr-1 opacity-80" />
            {menuTypeDisplay}
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground font-medium py-0.5 px-2 text-[9px]">
            <CalendarDays className="h-2.5 w-2.5 mr-1 opacity-70" />
            {formattedShortDateBadge}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {Array.from({ length: avatarsToShowCount }).map((_, index) => (
              <Avatar key={index} className="h-7 w-7 border-2 border-card shadow-sm bg-muted">
                <AvatarImage
                  src={STATIC_AVATAR_IMAGE_URL}
                  alt="Item preview"
                  data-ai-hint="item illustration"
                  className="object-contain"
                />
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                  {draft.previewAvatars[index] || '?'}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {remainingAvatars > 0 && (
            <span className="text-xs font-medium text-muted-foreground ml-1">+{remainingAvatars}</span>
          )}
          <Button
            variant="link"
            className="text-xs h-auto p-0 text-primary hover:text-primary/80"
            onClick={() => onToggleExpand(draft.id)}
            disabled={!draft.items || draft.items.length === 0}
          >
            {isExpanded ? "Hide details" : "Show details"}
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5 ml-0.5" /> : <ChevronRight className="h-3.5 w-3.5 ml-0.5" />}
          </Button>
        </div>
        {isExpanded && draft.items && draft.items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            {categoriesInDraftOrder.map(category => {
              const itemsForCategory = itemsByCategoryId[category.id] || [];
              if (itemsForCategory.length === 0) return null;

              return (
                <div key={category.id}>
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2 text-primary">{category.icon || <FolderOpen className="h-5 w-5" />}</span>
                    <h4 className="text-md font-semibold text-foreground">{decodeHtmlEntities(category.name)}</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {itemsForCategory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                        <div className="flex items-center overflow-hidden mr-2">
                          <Square className="h-4 w-4 text-muted-foreground mr-2 opacity-50 shrink-0" />
                          <span className="text-foreground truncate" title={decodeHtmlEntities(item.name)}>{decodeHtmlEntities(item.name)}</span>
                        </div>
                        <span className="text-muted-foreground font-medium whitespace-nowrap">৳{item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {categoriesInDraftOrder.length === 0 && (
              <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
                Could not match items to any known categories for this draft type.
              </div>
            )}
          </div>
        )}
        {isExpanded && (!draft.items || draft.items.length === 0) && (
          <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            No item details available for this draft.
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/20 px-2 py-1.5 flex justify-between items-center border-t border-border/50">
        <p className="text-[9px] text-muted-foreground opacity-70">Saved {formattedCreationDate}</p>
        <Button
          variant="default"
          size="sm"
          className="h-7 text-[10px] bg-foreground text-background hover:bg-foreground/80 font-bold px-3"
          onClick={() => onRestore(draft.id)}
        >
          Restore
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
          <Skeleton className="h-6 w-24 rounded-full" /> { }
          <Skeleton className="h-6 w-20 rounded-full" /> { }
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
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDrafts, setExpandedDrafts] = useState<Record<string, boolean>>({});
  const [masterCategoryList, setMasterCategoryList] = useState<Category[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchAllCategories() {
      setIsLoadingCategories(true);
      try {
        const result = await getCategoriesFromMySql();

        if (!result.success) {
            throw new Error(result.message || "Failed to fetch categories from local DB");
        }

        const categories = result.data as any[];
        const combinedCategories: Category[] = categories.map((cat: any): Category => ({
            id: `${cat.type}-${String(cat.id)}`,
            name: String(cat.name || 'Unnamed Category'),
            icon: String(cat.icon || (cat.type === 'parlour' ? '✨' : '📁')),
            visibleToUsers: Boolean(cat.visibleToUsers)
        }));

        setMasterCategoryList(combinedCategories);
      } catch (e) {
        console.error("Error fetching master category list:", e);
        toast({ title: "Error", description: "Could not load category details from local DB.", variant: "destructive" });
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchAllCategories();
  }, [toast]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    try {
      const storedDrafts = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (storedDrafts) {
        const parsedDrafts: any[] = JSON.parse(storedDrafts);
        const validatedDrafts = parsedDrafts.map(draft => {
          const validatedItems = Array.isArray(draft.items) ? draft.items.map((item: any) => {
            const finalCatId = item.categoryId || item.category; // Check for new property, fallback to old
            return {
              ...item,
              categoryId: finalCatId === null || finalCatId === undefined ? 'unknown' : String(finalCatId),
            };
          }) : [];

          return {
            ...draft,
            items: validatedItems,
            previewAvatars: Array.isArray(draft.previewAvatars) ? draft.previewAvatars : [],
          };
        });
        setDrafts(validatedDrafts);
      } else {
        setDrafts([]);
      }
    } catch (e: any) {
      console.error("Error loading drafts from localStorage:", e);
      setError("Failed to load drafts. They might be corrupted.");
      setDrafts([]);
      toast({
        title: "Error Loading Drafts",
        description: "Could not retrieve drafts from local storage. Data might be corrupted.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleRestoreDraft = (id: string) => {
    try {
      localStorage.setItem('draftToRestoreId', id);
      router.push('/magictab');
      toast({ title: "Restoring Draft...", description: "You will be redirected to the MagicTab page." });
    } catch (e) {
      console.error("Error setting item in localStorage for draft restoration:", e);
      toast({ title: "Error", description: "Could not initiate draft restoration.", variant: "destructive" });
    }
  };

  const handleDeleteDraft = (id: string) => {
    const draftName = drafts.find(d => d.id === id)?.name || "Draft";

    try {
      const storedDrafts = localStorage.getItem(DRAFTS_STORAGE_KEY);
      let updatedDrafts: DraftItem[] = [];
      if (storedDrafts) {
        const parsedDrafts: DraftItem[] = JSON.parse(storedDrafts);
        updatedDrafts = parsedDrafts.filter(draft => draft.id !== id);
        localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));
      }
      setDrafts(prevDrafts => prevDrafts.filter(draft => draft.id !== id));
      setExpandedDrafts(prev => {
        const newExpanded = { ...prev };
        delete newExpanded[id];
        return newExpanded;
      });
      toast({ title: "Draft Deleted", description: `"${decodeHtmlEntities(draftName)}" has been removed.` });
    } catch (e) {
      console.error("Error deleting draft from localStorage:", e);
      toast({ title: "Error", description: "Could not remove draft from storage.", variant: "destructive" });
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedDrafts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDrafts = useMemo(() => {
    if (!searchTerm) return drafts;
    return drafts.filter(draft =>
      decodeHtmlEntities(draft.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      extractMenuTypeFromTag(draft.primaryTag).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (isValid(parseISO(draft.createdAt)) && format(parseISO(draft.createdAt), 'dd/MM/yyyy').includes(searchTerm))
    );
  }, [drafts, searchTerm]);

  return (
    <div className="container mx-auto p-2 sm:p-3 lg:p-4 space-y-4 pb-24 md:pb-10">

      <main className="space-y-6">
        {isLoading || isLoadingCategories ? (
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
            {!searchTerm && drafts.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Looks like your draft list is empty. Go to the MagicTab page to start selecting!
              </p>
            )}
          </div>
        ) : (
          filteredDrafts.map(draft => (
            <DraftCard
              key={draft.id}
              draft={draft}
              isExpanded={!!expandedDrafts[draft.id]}
              onRestore={handleRestoreDraft}
              onDelete={handleDeleteDraft}
              onToggleExpand={handleToggleExpand}
              masterCategoryList={masterCategoryList}
            />
          ))
        )}
      </main>
    </div>
  );
}
