
"use client";

import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, Send, Users, Trash2, FileText, Coffee, Beef } from 'lucide-react'; // Placeholder icons

// Interfaces matching MenuItemsPage for consistency
interface Category {
  id: string;
  name: string;
  icon: string; // Emoji or Lucide icon name string
  itemCount?: number;
}

interface SubMenuItem {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string; // Category ID
  description?: string;
  image?: string; // URL for image
  status?: string;
  featured?: boolean;
  visibleToUsers?: boolean;
  subItems?: SubMenuItem[];
  iconPlaceholder?: boolean;
}

interface MenuPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedItems: MenuItem[];
  allCategories: Category[];
  onRemoveItem: (itemId: string) => void;
}

const STATIC_ITEM_IMAGE_URL = 'https://colorhutbd.xyz/image.svg';

// Helper to get Lucide icon component from string
const getIconComponent = (iconName: string): React.ElementType => {
  const iconMap: Record<string, React.ElementType> = {
    "default": FileText, // Default icon
    "expresso": Coffee, // Example, map your icon strings to components
    "dhakaiya": Beef,   // Example
    "filetext": FileText,
    "coffee": Coffee,
    "beef": Beef,
    // Add more mappings as needed from your category.icon strings
  };
  return iconMap[iconName.toLowerCase()] || FileText;
};


export function MenuPreviewDialog({
  isOpen,
  onOpenChange,
  selectedItems,
  allCategories,
  onRemoveItem,
}: MenuPreviewDialogProps): ReactNode {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const itemsGroupedByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    selectedItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [selectedItems]);

  const displayedCategories = useMemo(() => {
    const categoryIdsInSelection = new Set(selectedItems.map(item => item.category));
    return allCategories.filter(cat => categoryIdsInSelection.has(cat.id));
  }, [selectedItems, allCategories]);

  const categoriesToDisplayInMainPanel = useMemo(() => {
    if (activeCategoryId) {
      return displayedCategories.filter(cat => cat.id === activeCategoryId);
    }
    return displayedCategories;
  }, [activeCategoryId, displayedCategories]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Menu Preview</DialogTitle>
          <DialogDescription>
            Review your selected menu items before finalizing.
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className={cn(
            "border-r bg-muted/40 transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-12" : "w-64"
          )}>
            <div className="flex items-center justify-between p-2 h-14 border-b">
              {!isSidebarCollapsed && <span className="font-medium text-sm px-2">Categories</span>}
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="h-8 w-8">
                <ChevronLeft className={cn("h-4 w-4 transition-transform", isSidebarCollapsed && "rotate-180")} />
              </Button>
            </div>
            <ScrollArea className={cn("h-[calc(100%-56px)]", isSidebarCollapsed ? "p-1" : "p-2")}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm mb-1 h-9",
                  !activeCategoryId ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent",
                  isSidebarCollapsed ? "justify-center px-0" : "px-2"
                )}
                onClick={() => setActiveCategoryId(null)}
                title="All Items"
              >
                <FileText className="h-4 w-4" />
                {!isSidebarCollapsed && <span className="ml-2 truncate">All Items</span>}
              </Button>
              {displayedCategories.map(category => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sm mb-1 h-9",
                      activeCategoryId === category.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent",
                      isSidebarCollapsed ? "justify-center px-0" : "px-2"
                    )}
                    onClick={() => setActiveCategoryId(category.id)}
                    title={category.name}
                  >
                    <IconComponent className="h-4 w-4" />
                    {!isSidebarCollapsed && <span className="ml-2 truncate">{category.name}</span>}
                  </Button>
                );
              })}
            </ScrollArea>
          </div>

          {/* Right Content Panel */}
          <ScrollArea className="flex-1 p-6 bg-background">
            {categoriesToDisplayInMainPanel.map(category => {
              const IconComponent = getIconComponent(category.icon);
              const items = itemsGroupedByCategory[category.id] || [];
              if (items.length === 0) return null;

              return (
                <div key={category.id} className="mb-8">
                  <div className="flex items-center mb-4">
                    <IconComponent className="h-5 w-5 mr-2 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                    <Badge variant="secondary" className="ml-2 text-xs">{items.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center p-3 border rounded-lg bg-card shadow-sm">
                        <Image
                          src={item.image || STATIC_ITEM_IMAGE_URL}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-md object-cover mr-4 bg-muted"
                          data-ai-hint="menu item food"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.id}</p> {/* Using item.id as tagline */}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-foreground">৳{item.price.toLocaleString()}</p>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-destructive hover:text-destructive/80 h-auto p-0 text-xs"
                            onClick={() => onRemoveItem(item.id)}
                          >
                            <X className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {selectedItems.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                <p>No items selected for preview.</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t mt-auto">
          <Button variant="secondary" className="bg-foreground text-background hover:bg-foreground/90">
            <Users className="h-4 w-4 mr-2" /> Share with Color Hut
          </Button>
          <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="h-4 w-4 mr-2" /> Share with Partner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
