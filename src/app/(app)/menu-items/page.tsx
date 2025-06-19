
"use client";

import type { ReactNode } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  FileText as DefaultCategoryIcon,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";

const DRAFTS_STORAGE_KEY = 'menuBuilderDrafts';

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
  const { toast } = useToast();
  const router = useRouter();

  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    setLoadingMenuItems(true);
    setErrorMenuItems(null);

    let categoriesResponse: Response | undefined;
    let menuItemsResponse: Response | undefined;

    const categoriesApiUrl = selectedMenuType === 'parlour'
      ? 'https://colorhutbd.xyz/vm/api/parlour-categories.php'
      : 'https://colorhutbd.xyz/vm/api/categories.php';

    let menuItemsApiUrl = selectedMenuType === 'parlour'
      ? 'https://colorhutbd.xyz/vm/api/parlour-items.php'
      : 'https://colorhutbd.xyz/vm/api/menu-items.php';

    menuItemsApiUrl += (menuItemsApiUrl.includes('?') ? '&' : '?') + 'visibleOnly=true';

    const prevSelectedCategoryId = selectedCategory?.id;

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
          icon: String(cat.icon || '📁'),
          itemCount: Number(cat.itemCount || 0),
          status: String(cat.status || 'active'),
          createdAt: String(cat.createdAt || new Date().toISOString()),
          description: String(cat.description || ''),
          visibleToUsers: cat.visibleToUsers !== undefined ? Boolean(cat.visibleToUsers) : true,
        }));

      const visibleCategories = fetchedApiCategories.filter(cat => cat.visibleToUsers);
      setApiCategories(visibleCategories);
      setOrderedCategories(visibleCategories);
      
      // Category selection logic
      if (visibleCategories.length > 0) {
          let categoryToSelect: Category | null = null;
          // Try to retain previous selection if it's still valid for the new menu type
          if (prevSelectedCategoryId) {
              categoryToSelect = visibleCategories.find(c => c.id === prevSelectedCategoryId) || null;
          }
          // If not restoring a draft and no valid previous selection, default to first category
          if (!localStorage.getItem('draftToRestoreId') && !categoryToSelect) {
               categoryToSelect = visibleCategories[0];
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

        if (Array.isArray(menuItemsApiResponse)) {
            rawItemsArray = menuItemsApiResponse;
        } else if (menuItemsApiResponse.success && Array.isArray(menuItemsApiResponse.data)) {
            rawItemsArray = menuItemsApiResponse.data;
        } else if (menuItemsApiResponse.success && menuItemsApiResponse.data && Array.isArray(menuItemsApiResponse.data.items)) {
            rawItemsArray = menuItemsApiResponse.data.items;
        }
        else {
            console.error("Invalid API response structure for menu items:", menuItemsApiResponse);
            throw new Error("Invalid data format for menu items from API");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenuType, setTheme]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    const draftIdToRestore = localStorage.getItem('draftToRestoreId');
    if (!draftIdToRestore) {
      return; // No draft to restore
    }

    // If categories or menu items for the *current* selectedMenuType are still loading, wait.
    // This ensures we operate on the correct dataset if a menu type switch is in progress.
    if (loadingCategories || loadingMenuItems) {
      return;
    }

    // At this point, loading is false. Data for the current selectedMenuType is available (or confirmed empty).
    const allDraftsString = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!allDraftsString) {
      localStorage.removeItem('draftToRestoreId'); // Drafts store missing, can't restore.
      toast({ title: "Error", description: "Could not find your saved drafts.", variant: "destructive" });
      return;
    }

    let allDrafts: DraftItem[];
    try {
      allDrafts = JSON.parse(allDraftsString);
    } catch (e) {
      console.error("Error parsing drafts from localStorage:", e);
      localStorage.removeItem('draftToRestoreId'); // Corrupted drafts store.
      toast({ title: "Error", description: "Saved draft data appears to be corrupted.", variant: "destructive" });
      return;
    }

    const draftToRestore = allDrafts.find(d => d.id === draftIdToRestore);
    if (!draftToRestore) {
      localStorage.removeItem('draftToRestoreId'); // Specific draft not found.
      toast({ title: "Error", description: `The selected draft (ID: ${draftIdToRestore}) was not found.`, variant: "destructive" });
      return;
    }

    const draftMenuType = draftToRestore.primaryTag.split('-')[0].toLowerCase();
    if (draftMenuType !== selectedMenuType) {
      // Menu type from draft doesn't match current. Switch menu type and let this effect re-run.
      // Do NOT remove draftIdToRestoreId yet.
      setSelectedMenuType(draftMenuType);
      return; // Exit to allow re-fetch for the correct menu type
    }

    // If we reach here, menu types match, and data for this menu type has been loaded.

    // Select category based on draft
    const tagParts = draftToRestore.primaryTag.split('-');
    const draftCategorySlug = tagParts.length > 2 ? tagParts.slice(1, -1).join('-') : 'general';
    let categorySetByDraft = false;

    if (draftCategorySlug && draftCategorySlug !== 'general' && apiCategories.length > 0) {
      const targetCategory = apiCategories.find(
        cat => cat.name.toLowerCase().replace(/\s+/g, '-') === draftCategorySlug
      );
      if (targetCategory) {
        setSelectedCategory(targetCategory);
        categorySetByDraft = true;
      } else {
        toast({ title: "Info", description: `Category "${draftCategorySlug}" from draft not found. Defaulting selection.`, variant: "default" });
      }
    }
    
    if (!categorySetByDraft && apiCategories.length > 0) {
        // If category wasn't specifically set by slug, or if it was general, or if target not found,
        // set to the first available category for the current menu type.
        setSelectedCategory(apiCategories[0]);
    } else if (apiCategories.length === 0) {
        setSelectedCategory(null); // No categories available for this menu type
    }


    // Select items based on draft
    let itemsActuallySelectedCount = 0;
    if (draftToRestore.items && draftToRestore.items.length > 0) {
      const newSelectedItemsState = draftToRestore.items.reduce((acc, subItem) => {
        if (allMenuItems.some(menuItem => menuItem.id === subItem.id && menuItem.category === subItem.categoryId)) {
          acc[subItem.id] = true;
          itemsActuallySelectedCount++;
        } else {
          console.warn(`Item ID ${subItem.id} (Category: ${subItem.categoryId}) from draft not found or mismatched in current menu items for type ${selectedMenuType}.`);
        }
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedItems(newSelectedItemsState);

      if (itemsActuallySelectedCount > 0) {
        toast({ title: "Draft Restored", description: `${itemsActuallySelectedCount} items have been selected from your draft.` });
      } else if (draftToRestore.items.length > 0) {
        toast({ title: "Draft Partially Restored", description: "Some items from the draft were not found in the current menu.", variant: "default" });
      } else {
        toast({ title: "Draft Restored", description: "No items were in the selected draft to restore." });
      }
    } else {
      setSelectedItems({}); // Clear selection if draft has no items
      toast({ title: "Draft Restored", description: "The selected draft had no items." });
    }

    localStorage.removeItem('draftToRestoreId'); // Successfully processed or decided nothing to restore for this draft.
  }, [
    selectedMenuType, 
    loadingCategories, 
    loadingMenuItems, 
    apiCategories, 
    allMenuItems, 
    setSelectedMenuType, 
    setSelectedCategory, 
    setSelectedItems, 
    toast
  ]);


  const currentMenuItems = useMemo(() => {
    let itemsToFilter = allMenuItems;
    if (selectedCategory) {
      itemsToFilter = allMenuItems.filter(item => item.category === selectedCategory.id);
    }
    
    return itemsToFilter
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(item => ({ ...item, iconPlaceholder: !item.image }));
  }, [selectedCategory, allMenuItems, searchTerm]);


  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => ({ ...prev, [String(itemId)]: !prev[String(itemId)] }));
  };

  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  const toggleSubItems = (itemId: string) => {
    setExpandedSubItems(prev => ({ ...prev, [String(itemId)]: !prev[String(itemId)] }));
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
      categoryId: item.category, 
    }));

    const totalPrice = actualSelectedMenuItems.reduce((sum, item) => sum + item.price, 0);

    const previewAvatarsArray = actualSelectedMenuItems
      .slice(0, 3)
      .map(item => item.name.substring(0, 2).toUpperCase());
    
    let draftNameCategoryPart = 'general';
    const firstSelectedItemWithCategory = actualSelectedMenuItems.find(item => item.category);
    
    if (selectedCategory) { // Prefer explicitly selected category
        draftNameCategoryPart = selectedCategory.name.toLowerCase().replace(/\s+/g, '-');
    } else if (firstSelectedItemWithCategory) { // Infer from first selected item if no overall category selected
        const categoryOfFirstItem = apiCategories.find(cat => cat.id === firstSelectedItemWithCategory.category);
        if (categoryOfFirstItem) {
            draftNameCategoryPart = categoryOfFirstItem.name.toLowerCase().replace(/\s+/g, '-');
        }
    }


    const newDraft: DraftItem = {
      id: `draft_${Date.now()}`,
      name: `Menu Selection ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      itemCount: actualSelectedMenuItems.length,
      primaryTag: `${selectedMenuType}-${draftNameCategoryPart}-${Date.now()}`,
      price: totalPrice,
      previewAvatars: previewAvatarsArray,
      items: draftSubItems,
    };

    try {
      const existingDraftsJSON = localStorage.getItem(DRAFTS_STORAGE_KEY);
      const existingDrafts: DraftItem[] = existingDraftsJSON ? JSON.parse(existingDraftsJSON) : [];

      existingDrafts.unshift(newDraft);

      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(existingDrafts));
      toast({ title: "Draft Saved!", description: "Your menu selection has been saved." });
    } catch (error) {
      console.error("Error saving draft to localStorage:", error);
      toast({ title: "Error", description: "Could not save draft. LocalStorage might be full or disabled.", variant: "destructive" });
    }
  }, [selectedCount, allMenuItems, selectedItems, selectedMenuType, selectedCategory, apiCategories, toast]);


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
      <div className="flex flex-col md:flex-row md:h-[calc(100vh-theme(spacing.16)-1px)]"> {/* Adjusted for mobile scroll */}
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 bg-card border-r border-border flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">All Categories</h2>
          </div>
          <ScrollArea className="flex-1">
            {loadingCategories && <p className="p-4 text-sm text-muted-foreground">Loading categories...</p>}
            {errorCategories && <p className="p-4 text-sm text-destructive">Error: {errorCategories}</p>}
            {!loadingCategories && !errorCategories && orderedCategories.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No visible categories found for {selectedMenuType} menu.</p>
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
                      <span className="mr-2 text-sm">{category.icon || <DefaultCategoryIcon className="h-4 w-4" />}</span>
                      <span className="flex-1 text-left truncate">{category.name}</span>
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                    </Button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-background overflow-hidden">
           {/* Header: Title, Search, Actions */}
          <div className="py-4 px-6 border-b border-border bg-card space-y-3 md:space-y-0">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Select Menu Items</h1>
              <Select value={selectedMenuType} onValueChange={setSelectedMenuType}>
                <SelectTrigger className="w-full md:w-[200px] text-sm">
                  <SelectValue placeholder="Select menu type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant Menu</SelectItem>
                  <SelectItem value="parlour">Parlour Menu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full md:flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search menu item..." className="pl-10 text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex w-full md:w-auto gap-2 mt-2 md:mt-0">
                    <Button variant="outline" className="text-sm flex-1 md:flex-none" onClick={handleSaveDraft}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button variant="default" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex-1 md:flex-none" onClick={() => setIsPreviewDialogOpen(true)} disabled={selectedCount === 0}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview ({selectedCount})
                    </Button>
                </div>
            </div>
          </div>

          {/* Mobile Category Selector */}
          <div className="md:hidden p-4 border-b border-border bg-card">
            <Label htmlFor="mobile-category-select" className="text-xs font-medium text-muted-foreground mb-1 block">Category</Label>
            <Select
              value={selectedCategory ? selectedCategory.id : 'all-categories'}
              onValueChange={(value) => {
                if (value === 'all-categories') {
                  setSelectedCategory(null);
                } else {
                  const newSelectedCategory = apiCategories.find(c => c.id === value) || null;
                  setSelectedCategory(newSelectedCategory);
                }
              }}
            >
              <SelectTrigger id="mobile-category-select" className="w-full text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {apiCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items List Area */}
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6">
              {selectedCount > 0 && (
                <div className="mb-4">
                  <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
                    {selectedCount} selected
                  </Badge>
                </div>
              )}
              {loadingMenuItems && (
                <div className="flex-1 flex items-center justify-center py-10">
                  <p className="text-muted-foreground">Loading menu items...</p>
                </div>
              )}
              {errorMenuItems && (
                <div className="flex-1 flex items-center justify-center py-10">
                  <p className="text-destructive">Error loading menu items: {errorMenuItems}</p>
                </div>
              )}

              {!loadingMenuItems && !errorMenuItems && (
                <>
                  {selectedCategory && (
                    <div className="flex items-center gap-2 mb-4">
                      {selectedCategory.icon ? <span className="text-xl">{selectedCategory.icon}</span> : <DefaultCategoryIcon className="h-5 w-5 text-primary" />}
                      <h2 className="text-xl font-semibold text-foreground">{selectedCategory.name}</h2>
                      <Badge variant="secondary" className="text-xs font-normal bg-muted text-muted-foreground">
                        {currentMenuItems.length}
                      </Badge>
                    </div>
                  )}
                  {!selectedCategory && !loadingCategories && (
                     <h2 className="text-xl font-semibold text-foreground mb-4">All Items</h2>
                  )}

                  <div className={cn("grid gap-4", itemsGridClass)}>
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
                                   <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center shrink-0 text-muted-foreground">
                                     <DefaultCategoryIcon className="h-5 w-5" />
                                   </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <label htmlFor={`item-${item.id}`} className="text-sm font-medium text-foreground cursor-pointer truncate block">
                                    {item.name}
                                  </label>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground font-semibold whitespace-nowrap">
                                  ৳{(item.price ?? 0).toLocaleString()}
                                </div>
                                {item.subItems && item.subItems.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground/70 hover:text-foreground shrink-0"
                                    onClick={() => toggleSubItems(String(item.id))}
                                    aria-expanded={!!expandedSubItems[String(item.id)]}
                                    aria-controls={`subitems-${item.id}`}
                                    aria-label={expandedSubItems[String(item.id)] ? "Hide variations" : "Show variations"}
                                  >
                                    {expandedSubItems[String(item.id)] ? <MinusCircle className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                                  </Button>
                                )}
                              </div>
                              {item.subItems && item.subItems.length > 0 && expandedSubItems[String(item.id)] && (
                                <div
                                  id={`subitems-${item.id}`}
                                  className="mt-3 pl-6 space-y-2 border-l-2 border-primary/20 ml-2 pt-2 pb-1 bg-muted/30 rounded-r-md"
                                >
                                  <h4 className="text-xs font-medium text-muted-foreground">Variations:</h4>
                                  <div className="space-y-1.5">
                                    {item.subItems.map(subItem => (
                                      <div
                                        key={subItem.id}
                                        className="flex justify-between items-center text-xs p-1.5 rounded-md bg-card shadow-sm"
                                      >
                                        <span className="text-foreground">{subItem.name}</span>
                                        <span className="text-foreground font-medium">৳{subItem.price.toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                    ) : (
                      <div className="text-center py-10 col-span-full">
                        <p className="text-muted-foreground text-sm">
                          {searchTerm ? "No items match your search." : (!selectedCategory && apiCategories.length > 0 ? "Select a category or search to view items." : "No items in this category.")}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
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

