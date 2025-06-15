
"use client";

import type { ReactNode } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Reorder } from "framer-motion";
import {
  Search,
  Power,
  Save,
  Eye,
  GripVertical,
  ChevronRight,
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
  icon: string;
  itemCount?: number;
  status?: string;
  createdAt?: string;
  description?: string;
  visibleToUsers?: boolean;
}

interface MenuItem {
  id: string | number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  status?: string;
  featured?: boolean;
  visibleToUsers?: boolean;
  subItems?: any[];
  createdAt?: string;
  updatedAt?: string;
  iconPlaceholder?: boolean;
}


export default function MenuItemsPage() {
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [isPowerOn, setIsPowerOn] = useState(true);
  
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);
  const [errorMenuItems, setErrorMenuItems] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      setLoadingMenuItems(true);
      setErrorMenuItems(null);

      try {
        const [categoriesResponse, menuItemsResponse] = await Promise.all([
          fetch('https://colorhutbd.xyz/vm/api/categories.php', {
            headers: { 'Accept': 'application/json' }
          }),
          fetch('https://colorhutbd.xyz/vm/api/menu-items.php', {
            headers: { 'Accept': 'application/json' }
          })
        ]);

        // Process Categories
        if (!categoriesResponse.ok) {
          throw new Error(`Categories API error! status: ${categoriesResponse.status}`);
        }
        const categoriesApiResponse = await categoriesResponse.json();
        if (!categoriesApiResponse.success || !categoriesApiResponse.data || !Array.isArray(categoriesApiResponse.data.categories)) {
          console.error("Invalid API response structure for categories:", categoriesApiResponse);
          throw new Error("Invalid data format for categories from API");
        }
        const fetchedApiCategories: Category[] = categoriesApiResponse.data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || '📁',
          itemCount: cat.itemCount || 0,
          status: cat.status,
          createdAt: cat.createdAt,
          description: cat.description,
          visibleToUsers: cat.visibleToUsers !== undefined ? cat.visibleToUsers : true,
        }));
        setApiCategories(fetchedApiCategories);
        setOrderedCategories(fetchedApiCategories);

        if (fetchedApiCategories.length > 0) {
            const currentSelectedId = selectedCategory?.id;
            const newSelectedCategory = currentSelectedId ? fetchedApiCategories.find(c => c.id === currentSelectedId) : null;
            if (newSelectedCategory) {
                setSelectedCategory(newSelectedCategory);
            } else {
                const defaultCat = fetchedApiCategories.find(c => c.id === 'burger') || fetchedApiCategories[0];
                setSelectedCategory(defaultCat);
            }
        } else {
            setSelectedCategory(null);
        }
        setErrorCategories(null);
      } catch (e: any) {
        console.error("Failed to fetch categories:", e);
        setErrorCategories(e.message);
        setApiCategories([]);
        setOrderedCategories([]);
        setSelectedCategory(null);
      } finally {
        setLoadingCategories(false);
      }

      // Process Menu Items
      try {
        if (!menuItemsResponse.ok) {
          throw new Error(`Menu Items API error! status: ${menuItemsResponse.status}`);
        }
        const menuItemsApiResponse = await menuItemsResponse.json();
        if (!menuItemsApiResponse.success || !Array.isArray(menuItemsApiResponse.data)) {
          console.error("Invalid API response structure for menu items:", menuItemsApiResponse);
          throw new Error("Invalid data format for menu items from API");
        }
        const fetchedMenuItems: MenuItem[] = menuItemsApiResponse.data.map((item: any) => ({
          ...item,
          id: String(item.id), // Ensure ID is a string for consistency with keys
          iconPlaceholder: !item.image,
        }));
        setAllMenuItems(fetchedMenuItems);
        setErrorMenuItems(null);
      } catch (e: any) {
        console.error("Failed to fetch menu items:", e);
        setErrorMenuItems(e.message);
        setAllMenuItems([]);
      } finally {
        setLoadingMenuItems(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentMenuItems = useMemo(() => {
    if (!selectedCategory || !allMenuItems.length) return [];
    return allMenuItems
      .filter(item => item.category === selectedCategory.id && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(item => ({ ...item, iconPlaceholder: !item.image }));
  }, [selectedCategory, allMenuItems, searchTerm]);


  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16)-1px)]">
      <aside className="w-72 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">All Categories</h2>
        </div>
        <ScrollArea className="flex-1">
          {loadingCategories && <p className="p-4 text-sm text-muted-foreground">Loading categories...</p>}
          {errorCategories && <p className="p-4 text-sm text-destructive">Error: {errorCategories}</p>}
          {!loadingCategories && !errorCategories && orderedCategories.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No categories found.</p>
          )}
          {!loadingCategories && !errorCategories && orderedCategories.length > 0 && (
            <Reorder.Group axis="y" values={orderedCategories} onReorder={setOrderedCategories} className="p-2 space-y-2.5">
              {orderedCategories.map(category => (
                <Reorder.Item key={category.id} value={category} className="bg-card rounded-md">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start items-center text-sm h-9 border border-border rounded-md ${
                      selectedCategory?.id === category.id 
                      ? 'bg-muted font-semibold text-foreground'
                      : 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-card-foreground'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span className="mr-2 text-sm">{category.icon}</span>
                    <span className="flex-1 text-left truncate">{category.name}</span>
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                  </Button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        <div className="py-6 px-6 border-b border-border bg-card flex items-center justify-between">
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

        <div className="flex-1 flex flex-col overflow-hidden py-6 px-6">
          {selectedCount > 0 && (
            <div className="mb-4">
              <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
                {selectedCount} selected
              </Badge>
            </div>
          )}
          
          {loadingMenuItems && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Loading menu items...</p>
            </div>
          )}
          {errorMenuItems && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-destructive">Error loading menu items: {errorMenuItems}</p>
            </div>
          )}

          {!loadingMenuItems && !errorMenuItems && selectedCategory && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                {selectedCategory.icon && <span className="text-xl">{selectedCategory.icon}</span>}
                <h2 className="text-xl font-semibold text-foreground">{selectedCategory.name}</h2>
                <Badge variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground">
                  {selectedCategory?.itemCount ?? currentMenuItems.length}
                </Badge>
              </div>
              
              <ScrollArea className="flex-1 -mx-1">
                <div className="px-1 space-y-3">
                  {currentMenuItems.length > 0 ? (
                    currentMenuItems.map(item => (
                        <Card 
                          key={item.id} 
                          className="p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-card"
                        >
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={!!selectedItems[String(item.id)]}
                            onCheckedChange={() => handleSelectItem(String(item.id))}
                            aria-label={`Select ${item.name}`}
                          />
                          {item.iconPlaceholder && (
                             <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                               {/* Placeholder for icon, e.g., first letter or generic icon */}
                             </div>
                          )}
                          {/* If you want to display the image:
                          {item.image && (
                            <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-full" />
                          )}
                          */}
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
                      <p className="text-muted-foreground text-sm">
                        {searchTerm ? "No items match your search." : "No items in this category."}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          {!loadingCategories && !selectedCategory && !loadingMenuItems && !errorMenuItems && (
              <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">Select a category to see menu items.</p>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}

