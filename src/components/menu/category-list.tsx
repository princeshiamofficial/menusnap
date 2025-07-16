
"use client";

import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
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
  selectedCategory: Category | null;
  onSelectCategory: (category: Category | null) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  loading: boolean;
  error: string | null;
  categoryRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
}

function CategoryListComponent({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  loading,
  error,
  categoryRefs,
}: CategoryListProps): ReactNode {

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a,b) => a.name.localeCompare(b.name));
  }, [categories]);

  return (
    <aside className="hidden md:flex w-72 bg-card border-r border-border flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">All Categories</h2>
        <Button variant="ghost" size="icon" onClick={onAddCategory} className="h-8 w-8" aria-label="Add New Category">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {loading && (
          <div className="p-2 space-y-2.5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-md" />)}</div>
        )}
        {error && <p className="p-4 text-sm text-destructive">Error: {error}</p>}
        {!loading && !error && sortedCategories.length === 0 && <p className="p-4 text-sm text-muted-foreground">No categories found.</p>}
        {!loading && !error && sortedCategories.length > 0 && (
          <div className="p-2 space-y-2.5">
            {sortedCategories.map(category => (
              <div 
                key={category.id} 
                ref={(el) => categoryRefs.current.set(category.id, el)}
                className="bg-card rounded-md group"
              >
                <div className={cn(
                    'w-full flex justify-start items-center text-sm h-9 border border-border rounded-md',
                     selectedCategory?.id === category.id
                     ? 'bg-muted font-semibold text-foreground border-primary'
                     : 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-card-foreground'
                )}>
                  {selectedCategory?.id === category.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 ml-1 text-primary hover:bg-primary/10"
                      onClick={() => onEditCategory(category)}
                    >
                       <Edit className="h-4 w-4"/>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full h-full justify-start items-center px-2 py-0"
                    onClick={() => onSelectCategory(category)}
                  >
                    <span className="mr-2 text-sm">{category.icon || "📁"}</span>
                    <span className="flex-1 text-left truncate">{decodeHtmlEntities(category.name)}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}

export const CategoryList = React.memo(CategoryListComponent);
