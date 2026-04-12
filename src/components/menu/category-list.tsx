"use client";

import type { ReactNode } from 'react';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Edit,
  PlusCircle,
  Search,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, decodeHtmlEntities } from "@/lib/utils";

// Re-defining the interface here to make the component self-contained
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

interface CategoryListProps {
  categories: Category[];
  onCategoryChange: (categoryId: string | null) => void;
  onEditCategory: (category: Category) => void;
  onQuickAdd?: (name: string) => void;
  loading: boolean;
  error: string | null;
}

function CategoryListComponent({
  categories,
  onCategoryChange,
  onEditCategory,
  onQuickAdd,
  loading,
  error,
}: CategoryListProps): ReactNode {

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If there's no selection or the current selection is no longer valid, select the first category
    if (categories.length > 0 && (!selectedCategoryId || !categories.some(c => c.id === selectedCategoryId))) {
      const firstCategoryId = [...categories].sort((a,b) => a.name.localeCompare(b.name))[0].id; // Create a copy to sort
      setSelectedCategoryId(firstCategoryId);
      onCategoryChange(firstCategoryId);
    } else if (categories.length === 0) {
      setSelectedCategoryId(null);
      onCategoryChange(null);
    }
  }, [categories, selectedCategoryId, onCategoryChange]);

  // Scroll to active category on mobile horizontal scroll
  useEffect(() => {
    if (selectedCategoryId && containerRef.current) {
        const activeElement = containerRef.current.querySelector(`[data-category-id="${selectedCategoryId}"]`);
        if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [selectedCategoryId]);

  const handleSelectCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    onCategoryChange(categoryId);
  };

  const filteredCategories = useMemo(() => {
    const sorted = [...categories].sort((a,b) => a.name.localeCompare(b.name));
    if (!catSearch.trim()) return sorted;
    
    const term = catSearch.toLowerCase();
    return sorted.filter(c => 
      c.name.toLowerCase().includes(term) || 
      (c.icon && c.icon.includes(term))
    );
  }, [categories, catSearch]);

  return (
    <aside className="w-full md:w-72 md:h-full bg-card border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border flex flex-col gap-3">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Categories</h2>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search categories..." 
            className="h-9 pl-9 pr-9 text-sm bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 transition-all rounded-lg"
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
          />
          {catSearch && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent text-muted-foreground hover:text-foreground"
              onClick={() => setCatSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          )}
          
          {error && (
            <div className="p-4 text-center">
              <p className="text-sm text-destructive">Error: {error}</p>
            </div>
          )}
          
          {!loading && !error && filteredCategories.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {catSearch ? `No matches found for "${catSearch}"` : "No categories yet."}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {catSearch ? "Create it now to start adding items." : "Click the + button to create one."}
                </p>
              </div>
              
              {catSearch && (
                <Button 
                  onClick={() => {
                    if (onQuickAdd) {
                      onQuickAdd(catSearch);
                      setCatSearch('');
                    }
                  }}
                  className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add "{catSearch}"
                </Button>
              )}
            </div>
          )}
          
          {!loading && !error && filteredCategories.length > 0 && filteredCategories.map(category => (
            <div 
              key={category.id} 
              className="group relative"
            >
              <div className={cn(
                  'flex items-center gap-1 rounded-lg px-2 py-1.5 transition-all duration-200 cursor-pointer',
                   selectedCategoryId === category.id
                   ? 'bg-primary/10 text-primary shadow-sm'
                   : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
                onClick={() => handleSelectCategory(category.id)}
              >
                <span className="text-xl flex-shrink-0 w-8 text-center">{category.icon || "📁"}</span>
                <span className="flex-1 font-medium truncate text-sm">
                  {decodeHtmlEntities(category.name)}
                </span>
                
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-background/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCategory(category);
                    }}
                  >
                     <Edit className="h-3.5 w-3.5"/>
                  </Button>
                </div>

                {selectedCategoryId === category.id && (
                  <motion.div 
                    layoutId="activeCategory"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}

export const CategoryList = React.memo(CategoryListComponent);
