
"use client";

import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import {
  ListOrdered,
  Layers,
  FileEdit,
  Search,
  Power,
  Save,
  Eye,
  GripVertical,
  ChevronRight,
  Minus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  iconPlaceholder?: boolean;
}

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Expresso Based Classics', emoji: '☕' },
  { id: 'cat2', name: 'Dhakaiya Chaap', emoji: '🍖' },
  { id: 'cat3', name: 'Peshwari Kabab', emoji: '🍗' },
  { id: 'cat4', name: 'Drumstick', emoji: '🍗' },
  { id: 'cat5', name: 'Flavored Latte', emoji: '🥤' },
  { id: 'cat6', name: 'Lemonade', emoji: '🍋' },
  { id: 'cat7', name: 'Steak', emoji: '🥩' },
  { id: 'cat8', name: 'Italian Soda', emoji: '🍹' },
  { id: 'cat9', name: 'Arabian Cuisine', emoji: '🥗' },
  { id: 'cat10', name: 'Sushi Platter', emoji: '🍣' },
  { id: 'cat11', name: 'Bento', emoji: '🍱' },
  { id: 'cat12', name: 'Smoothie', emoji: '🥛' },
  { id: 'cat13', name: 'Masala', emoji: '🥘' },
  { id: 'cat14', name: 'Waffle', emoji: '🧇' },
  { id: 'cat15', name: 'Dosa', emoji: '🥞' },
  { id: 'cat16', name: 'BBQ', emoji: '🔥' },
  { id: 'cat17', name: 'Vegetable', emoji: '🥦' },
  { id: 'cat18', name: 'Mutton', emoji: '🐑' },
  { id: 'cat19', name: 'Noodles', emoji: '🍜' },
];

const mockMenuItems: { [categoryId: string]: MenuItem[] } = {
  cat1: [
    { id: 'item1-1', name: 'Ristretto', price: 0, iconPlaceholder: true },
    { id: 'item1-2', name: 'Lungo', price: 0, iconPlaceholder: true },
    { id: 'item1-3', name: 'Macchiato', price: 0, iconPlaceholder: true },
  ],
  cat2: [
    { id: 'item2-1', name: 'Chicken Dhakaiya Chaap', price: 0, iconPlaceholder: true },
    { id: 'item2-2', name: 'Beef Dhakaiya Chaap', price: 0, iconPlaceholder: true },
  ],
  cat3: [
    { id: 'item3-1', name: 'Chicken Peshwari Kabab', price: 0, iconPlaceholder: true },
    { id: 'item3-2', name: 'Chicken Boti Peshwari Kabab', price: 0, iconPlaceholder: true },
    { id: 'item3-3', name: 'Chicken Tikka', price: 0, iconPlaceholder: true },
    { id: 'item3-4', name: 'Rabbit Kabab', price: 0, iconPlaceholder: true },
  ],
  // Add more items for other categories if needed
};

export default function MenuItemsPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(mockCategories[1]); // Default to Dhakaiya Chaap
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [isPowerOn, setIsPowerOn] = useState(true);

  const currentMenuItems = selectedCategory ? (mockMenuItems[selectedCategory.id] || []) : [];

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16)-1px)]"> {/* Adjusted for typical header/padding */}
      {/* Left Sidebar - Categories */}
      <aside className="w-72 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">All Items</h2>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-2">
            {mockCategories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory?.id === category.id ? "secondary" : "ghost"}
                className={`w-full justify-start items-center text-sm h-9 border border-border ${selectedCategory?.id === category.id ? 'font-semibold':''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="mr-2 text-sm">{category.emoji}</span>
                <span className="flex-1 text-left truncate">{category.name}</span>
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Right Content Area */}
      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-border bg-card flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Select Menu Items</h1>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search menu item"
                className="pl-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setIsPowerOn(!isPowerOn)} className={isPowerOn ? "text-primary" : "text-muted-foreground"}>
              <Power className="h-5 w-5" />
            </Button>
            <Button variant="outline" className="text-sm">
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button variant="default" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <Eye className="h-4 w-4 mr-2" />
              Show Preview
            </Button>
          </div>
        </div>

        {/* Selected Count Badge and Menu Item List Section */}
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          {selectedCount > 0 && (
            <div className="mb-4">
              <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
                {selectedCount} selected
              </Badge>
            </div>
          )}
          
          {selectedCategory && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                {selectedCategory.emoji && <span className="text-xl">{selectedCategory.emoji}</span>}
                <h2 className="text-xl font-semibold text-foreground">{selectedCategory.name}</h2>
                <Badge variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground">{currentMenuItems.length}</Badge>
              </div>
              
              <ScrollArea className="flex-1 -mx-1"> {/* Negative margin to allow full-width cards if desired */}
                <div className="px-1 space-y-3">
                  {currentMenuItems.length > 0 ? (
                    currentMenuItems
                      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(item => (
                        <Card 
                          key={item.id} 
                          className="p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-card"
                        >
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={!!selectedItems[item.id]}
                            onCheckedChange={() => handleSelectItem(item.id)}
                            aria-label={`Select ${item.name}`}
                          />
                          {item.iconPlaceholder && (
                             <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                               {/* Placeholder for icon, e.g., first letter or generic icon */}
                               {/* <span className="text-muted-foreground text-lg">{item.name.charAt(0)}</span> */}
                             </div>
                          )}
                          <label htmlFor={`item-${item.id}`} className="flex-1 text-sm font-medium text-foreground cursor-pointer truncate">
                            {item.name}
                          </label>
                          <div className="text-sm text-muted-foreground font-semibold whitespace-nowrap">
                            ৳{item.price.toLocaleString()}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 hover:text-foreground">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground text-sm">No items in this category.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          {!selectedCategory && (
              <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Select a category to see menu items.</p>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}

