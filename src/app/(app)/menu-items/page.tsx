
"use client";

import type { ReactNode } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react'; // Added useCallback
import { Reorder } from "framer-motion";
import {
  Search,
  Save,
  Eye,
  GripVertical,
  ChevronRight,
  MinusCircle,
  PlusCircle,
  Send, 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from '@/context/ThemeContext';
import { MenuPreviewDialog } from '@/components/menu/menu-preview-dialog'; 
import { useToast } from "@/hooks/use-toast"; // Added useToast

// Define Draft types locally (ideally move to a shared types file later)
interface DraftSubItem {
  id: string;
  name: string;
  price: number;
}

interface DraftItem {
  id: string;
  name: string;
  createdAt: string; // ISO string
  itemCount: number;
  primaryTag: string;
  price: number;
  previewAvatars: string[];
  items?: DraftSubItem[];
}


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

interface SubMenuItem {
  id: string;
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  status?: string;
  featured?: boolean;
  visibleToUsers?: boolean;
  subItems?: SubMenuItem[];
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
  const [selectedMenuType, setSelectedMenuType] = useState<string>('restaurant');
  
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);
  const [errorMenuItems, setErrorMenuItems] = useState<string | null>(null);

  const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({});
  const { setTheme } = useTheme();
  const { toast } = useToast(); // Initialize useToast

  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false); 

  useEffect(() => {
    const fetchData = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      setLoadingMenuItems(true); 
      setErrorMenuItems(null);  

      let categoriesResponse: Response | undefined;
      let menuItemsResponse: Response | undefined;

      const categoriesApiUrl = selectedMenuType === 'parlour'
        ? 'https://colorhutbd.xyz/vm/api/parlour-categories.php'
        : 'https://colorhutbd.xyz/vm/api/categories.php';
      
      const menuItemsApiUrl = selectedMenuType === 'parlour'
        ? 'https://colorhutbd.xyz/vm/api/parlour-items.php'
        : 'https://colorhutbd.xyz/vm/api/menu-items.php';

      try {
        const fetchPromises: [Promise<Response>, Promise<Response>] = [
          fetch(categoriesApiUrl, { headers: { 'Accept': 'application/json' } }),
          fetch(menuItemsApiUrl, { headers: { 'Accept': 'application/json' } })
        ];
        
        const responses = await Promise.all(fetchPromises);
        categoriesResponse = responses[0];
        menuItemsResponse = responses[1];

      } catch (networkError: any) {
        console.error("Network error during initial data fetch:", networkError);
        setErrorCategories("Network error fetching categories.");
        setErrorMenuItems("Network error fetching menu items.");
        setApiCategories([]);
        setOrderedCategories([]);
        setSelectedCategory(null);
        setAllMenuItems([]);
        setLoadingCategories(false);
        setLoadingMenuItems(false);
        return; 
      }

      const prevSelectedCategoryId = selectedCategory?.id; 
      try {
        if (!categoriesResponse || !categoriesResponse.ok) {
          throw new Error(`Categories API error! status: ${categoriesResponse?.status || 'unknown'}`);
        }
        const categoriesApiResponse = await categoriesResponse.json();
        if (!categoriesApiResponse.success || !categoriesApiResponse.data || !Array.isArray(categoriesApiResponse.data.categories)) {
          console.error("Invalid API response structure for categories:", categoriesApiResponse);
          throw new Error("Invalid data format for categories from API");
        }
        
        const fetchedApiCategories: Category[] = categoriesApiResponse.data.categories
          .filter((cat: any) => cat.id !== null && cat.id !== undefined)
          .map((cat: any) => ({
            id: String(cat.id),
            name: String(cat.name || 'Unnamed Category'),
            icon: String(cat.icon || 'FileText'), 
            itemCount: Number(cat.itemCount || 0),
            status: String(cat.status || 'active'),
            createdAt: String(cat.createdAt || new Date().toISOString()),
            description: String(cat.description || ''),
            visibleToUsers: cat.visibleToUsers !== undefined ? Boolean(cat.visibleToUsers) : true,
          }));

        setApiCategories(fetchedApiCategories);
        setOrderedCategories(fetchedApiCategories);

        if (fetchedApiCategories.length > 0) {
            let categoryToSelect: Category | null = null;
            if (prevSelectedCategoryId) {
                categoryToSelect = fetchedApiCategories.find(c => c.id === prevSelectedCategoryId) || null;
            }
            if (!categoryToSelect) {
                categoryToSelect = fetchedApiCategories[0];
            }
            setSelectedCategory(categoryToSelect);
        } else {
            setSelectedCategory(null);
        }
        setErrorCategories(null);
      } catch (e: any) {
        console.error("Failed to fetch/process categories:", e);
        setErrorCategories(e.message || "Error processing categories data.");
        setApiCategories([]);
        setOrderedCategories([]);
        setSelectedCategory(null);
      } finally {
        setLoadingCategories(false);
      }

      if (menuItemsResponse) {
        try {
          if (!menuItemsResponse.ok) { 
            throw new Error(`Menu Items API error! status: ${menuItemsResponse?.status || 'unknown'}`);
          }
          const menuItemsApiResponse = await menuItemsResponse.json();
          let rawItemsArray: any[] = [];
          if (menuItemsApiResponse.success) {
            if (Array.isArray(menuItemsApiResponse.data)) { 
              rawItemsArray = menuItemsApiResponse.data;
            } else if (menuItemsApiResponse.data && Array.isArray(menuItemsApiResponse.data.items)) { 
              rawItemsArray = menuItemsApiResponse.data.items;
            } else {
              console.error("Invalid API response structure for menu items:", menuItemsApiResponse);
              throw new Error("Invalid data format for menu items from API (expected array or data.items array)");
            }
          } else {
            throw new Error(menuItemsApiResponse.message || "Menu Items API request not successful");
          }

          const fetchedMenuItems: MenuItem[] = rawItemsArray
            .filter((item: any) => item.id !== null && item.id !== undefined)
            .map((item: any) => ({
              id: String(item.id), 
              name: String(item.name || 'Unnamed Item'),
              price: parseFloat(item.price) || 0,
              category: String(item.category || 'uncategorized'),
              description: String(item.description || ''),
              image: item.image,
              status: String(item.status || 'active'),
              featured: Boolean(item.featured || false),
              visibleToUsers: item.visibleToUsers !== undefined ? Boolean(item.visibleToUsers) : true,
              createdAt: String(item.createdAt || new Date().toISOString()),
              updatedAt: String(item.updatedAt || new Date().toISOString()),
              iconPlaceholder: !item.image,
              subItems: Array.isArray(item.subItems) 
                ? item.subItems
                    .filter((sub: any) => sub.id !== null && sub.id !== undefined)
                    .map((sub: any) => ({
                      id: String(sub.id),
                      name: String(sub.name || 'Unnamed Sub-item'),
                      price: parseFloat(sub.price) || 0,
                    })) 
                : [],
            }));
          setAllMenuItems(fetchedMenuItems);
          setErrorMenuItems(null);
        } catch (e: any) {
          console.error("Failed to fetch/process menu items:", e);
          setErrorMenuItems(e.message || "Error processing menu items data.");
          setAllMenuItems([]);
        } finally {
          setLoadingMenuItems(false);
        }
      } else {
         setLoadingMenuItems(false);
         setErrorMenuItems("Menu items response was unexpectedly undefined.");
         setAllMenuItems([]);
      }
    };
    fetchData();

    if (selectedMenuType === 'parlour') {
      setTheme('parlour');
    } else {
      setTheme('default');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenuType, setTheme]); 

  const currentMenuItems = useMemo(() => {
    if (!selectedCategory || !allMenuItems.length) return [];
    return allMenuItems
      .filter(item => item.category === selectedCategory.id && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(item => ({ ...item, iconPlaceholder: !item.image }));
  }, [selectedCategory, allMenuItems, searchTerm]);


  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => ({ ...prev, [String(itemId)]: !prev[String(itemId)] }));
  };
  
  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  const toggleSubItems = (itemId: string) => {
    setExpandedSubItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSaveDraft = useCallback(() => {
    if (selectedCount === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to save a draft.",
        variant: "default", 
      });
      return;
    }

    const actualSelectedMenuItems: MenuItem[] = allMenuItems.filter(
      (item) => selectedItems[item.id]
    );

    const draftSubItems: DraftSubItem[] = actualSelectedMenuItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
    }));

    const totalPrice = actualSelectedMenuItems.reduce((sum, item) => sum + item.price, 0);

    const previewAvatarsArray = actualSelectedMenuItems
      .slice(0, 3)
      .map(item => item.name.substring(0, 2).toUpperCase());

    const newDraft: DraftItem = {
      id: `draft_${Date.now()}`,
      name: `Menu Selection ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      itemCount: actualSelectedMenuItems.length,
      primaryTag: `${selectedMenuType}-${selectedCategory ? selectedCategory.name.toLowerCase().replace(/\s+/g, '-') : 'general'}-${Date.now()}`,
      price: totalPrice,
      previewAvatars: previewAvatarsArray,
      items: draftSubItems,
    };

    const DRAFTS_STORAGE_KEY = 'menuBuilderDrafts';
    try {
      const existingDraftsJSON = localStorage.getItem(DRAFTS_STORAGE_KEY);
      const existingDrafts: DraftItem[] = existingDraftsJSON ? JSON.parse(existingDraftsJSON) : [];
      
      existingDrafts.unshift(newDraft); 
      
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(existingDrafts));
      toast({ title: "Draft Saved!", description: "Your menu selection has been saved." });
      // setSelectedItems({}); // Removed this line to keep items selected
    } catch (error) {
      console.error("Error saving draft to localStorage:", error);
      toast({ title: "Error", description: "Could not save draft. LocalStorage might be full or disabled.", variant: "destructive" });
    }
  }, [selectedCount, allMenuItems, selectedItems, selectedMenuType, selectedCategory, toast]);


  let itemsGridClass = 'grid-cols-1';
  if (currentMenuItems.length === 1) {
    itemsGridClass = 'grid-cols-1';
  } else if (currentMenuItems.length === 2) {
    itemsGridClass = 'grid-cols-1 md:grid-cols-2';
  } else if (currentMenuItems.length > 2) {
    itemsGridClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }

  const preparedSelectedItemsForPreview = useMemo(() => {
    return allMenuItems.filter(item => selectedItems[item.id]);
  }, [allMenuItems, selectedItems]);

  const handleRemoveItemFromPreview = (itemIdToRemove: string) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      delete updated[itemIdToRemove]; 
      return updated;
    });
  };


  return (
    <>
      <div className="flex h-[calc(100vh-theme(spacing.16)-1px)]">
        <aside className="w-72 bg-card border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">All Categories</h2>
          </div>
          <ScrollArea className="flex-1">
            {loadingCategories && <p className="p-4 text-sm text-muted-foreground">Loading categories...</p>}
            {errorCategories && <p className="p-4 text-sm text-destructive">Error: {errorCategories}</p>}
            {!loadingCategories && !errorCategories && orderedCategories.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No categories found for {selectedMenuType} menu.</p>
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
              <Select value={selectedMenuType} onValueChange={setSelectedMenuType}>
                <SelectTrigger className="w-[180px] text-sm">
                  <SelectValue placeholder="Select menu type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant Menu</SelectItem>
                  <SelectItem value="parlour">Parlour Menu</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="text-sm" onClick={handleSaveDraft}> {/* Updated onClick */}
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button variant="default" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsPreviewDialogOpen(true)} disabled={selectedCount === 0}>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview ({selectedCount})
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
                  <div className={cn("grid gap-4 px-1", itemsGridClass)}>
                    {currentMenuItems.length > 0 ? (
                      currentMenuItems.map(item => (
                          <Card 
                            key={item.id} 
                            className="shadow-sm hover:shadow-md transition-shadow rounded-lg bg-card"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <Checkbox
                                  id={`item-${item.id}`}
                                  checked={!!selectedItems[String(item.id)]}
                                  onCheckedChange={() => handleSelectItem(String(item.id))}
                                  aria-label={`Select ${item.name}`}
                                  className="mt-1" 
                                />
                                {item.iconPlaceholder && (
                                   <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                                   </div>
                                )}
                                <div className="flex-1"> 
                                  <label htmlFor={`item-${item.id}`} className="text-sm font-medium text-foreground cursor-pointer truncate block">
                                    {item.name}
                                  </label>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground font-semibold whitespace-nowrap">
                                  ৳{(item.price ?? 0).toLocaleString()}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground/70 hover:text-foreground shrink-0"
                                  onClick={() => item.subItems && item.subItems.length > 0 && toggleSubItems(String(item.id))}
                                  disabled={!item.subItems || item.subItems.length === 0}
                                >
                                  {item.subItems && item.subItems.length > 0 ? (
                                    expandedSubItems[String(item.id)] ? <MinusCircle className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 opacity-30" />
                                  )}
                                </Button>
                              </div>
                              {item.subItems && item.subItems.length > 0 && expandedSubItems[String(item.id)] && (
                                <div className="mt-3 pl-10 space-y-2">
                                  {item.subItems.map(subItem => (
                                    <div key={subItem.id} className="flex justify-between items-center text-xs">
                                      <span className="text-muted-foreground">{subItem.name}</span>
                                      <span className="text-muted-foreground font-medium">৳{subItem.price.toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                    ) : (
                      <div className="text-center py-10 col-span-full">
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
      <MenuPreviewDialog
        isOpen={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        selectedItems={preparedSelectedItemsForPreview}
        allCategories={apiCategories}
        onRemoveItem={handleRemoveItemFromPreview}
      />
    </>
  );
}
