
"use client";

import type { ReactNode } from 'react';
import React, { useMemo, useState, useEffect } from 'react';
import {
  Edit,
  PlusCircle,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
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
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  loading: boolean;
  error: string | null;
}

function CategoryListComponent({
  categories,
  onCategoryChange,
  onAddCategory,
  onEditCategory,
  loading,
  error,
}: CategoryListProps): ReactNode {

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a,b) => a.name.localeCompare(b.name));
  }, [categories]);

  return (
    <aside className="w-full md:w-72 bg-card border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border hidden md:flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">All Categories</h2>
        <Button variant="ghost" size="icon" onClick={onAddCategory} className="h-8 w-8" aria-label="Add New Category">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 flex md:block overflow-x-auto md:overflow-x-hidden md:overflow-y-auto no-scrollbar scroll-smooth h-14 md:h-auto"
      >
        {loading && (
          <div className="flex md:block p-2.5 space-x-2 md:space-x-0 md:space-y-2.5 min-w-full items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 md:w-full rounded-full md:rounded-md shrink-0" />
            ))}
          </div>
        )}
        
        {error && <p className="p-4 text-sm text-destructive whitespace-nowrap">Error: {error}</p>}
        
        {!loading && !error && sortedCategories.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground whitespace-nowrap">No categories found.</p>
        )}
        
        {!loading && !error && sortedCategories.length > 0 && (
          <div className="flex md:block p-2.5 transition-all md:p-3 space-x-2 md:space-x-0 md:space-y-2.5 min-w-full items-center">
            {/* Mobile Header Button for Adding Category */}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onAddCategory} 
              className="md:hidden h-9 w-9 shrink-0 rounded-full border-dashed"
              aria-label="Add Category"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>

            {sortedCategories.map(category => (
              <div 
                key={category.id} 
                data-category-id={category.id}
                className="shrink-0 group"
              >
                <div className={cn(
                    'flex justify-start items-center text-sm h-9 border transition-all duration-200',
                    'md:w-full md:rounded-md rounded-full px-1',
                     selectedCategoryId === category.id
                     ? 'bg-primary/10 font-semibold text-primary border-primary shadow-sm'
                     : 'bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-card-foreground'
                )}>
                  {selectedCategoryId === category.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-0.5 text-primary hover:bg-primary/20 rounded-full"
                      onClick={() => onEditCategory(category)}
                    >
                       <Edit className="h-3.5 w-3.5"/>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className={cn(
                        "h-full justify-start items-center py-0 rounded-full md:rounded-md",
                        selectedCategoryId === category.id ? "px-2 pl-1" : "px-4 md:px-2",
                        "md:w-full"
                    )}
                    onClick={() => handleSelectCategory(category.id)}
                  >
                    <span className="mr-2 text-base shrink-0">{category.icon || "📁"}</span>
                    <span className="whitespace-nowrap truncate">{decodeHtmlEntities(category.name)}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export const CategoryList = React.memo(CategoryListComponent);
