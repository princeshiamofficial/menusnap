
"use client";

import type { ReactNode } from 'react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Reorder } from "framer-motion";
import {
  Search,
  Save,
  Eye,
  GripVertical,
  ChevronRight,
  PlusCircle,
  Send,
  FileText as DefaultCategoryIcon,
  Edit,
  X,
  Plus,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const DRAFTS_STORAGE_KEY = 'menuBuilderDrafts';
const CLIENT_MENU_ITEMS_STORAGE_KEY = 'clientMenuItems';
const CLIENT_CATEGORIES_STORAGE_KEY = 'clientCategories';

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
  price?: number;
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

const menuItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100),
  price: z.coerce.number().min(0, "Price must be non-negative."),
  description: z.string().max(500).optional().nullable(),
  subItems: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Variation name is required."),
      price: z.coerce.number().min(0).optional(),
    })
  ).optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MenuItemFormValues) => void;
  initialData?: Partial<MenuItem>;
  categoryName?: string;
  isSubmitting: boolean;
}

function MenuItemForm({ isOpen, onOpenChange, onSubmit, initialData, categoryName, isSubmitting }: MenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      price: initialData?.price || 0,
      description: initialData?.description || "",
      subItems: initialData?.subItems?.map(si => ({ ...si })) || [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subItems",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialData?.name || "",
        price: initialData?.price || 0,
        description: initialData?.description || "",
        subItems: initialData?.subItems?.map(si => ({ ...si })) || [],
      });
    }
  }, [isOpen, initialData, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-80px)]">
        <DialogHeader>
          <DialogTitle className="text-xl">{initialData ? 'Edit' : 'Add'} {categoryName ? `${categoryName} Item` : 'Menu Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-grow overflow-hidden">
          <ScrollArea className="flex-grow min-h-0 p-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="item-name">Item Name</Label>
                <Input id="item-name" {...form.register("name")} placeholder="e.g., Classic Burger" />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="item-price">Base Price (৳)</Label>
                <Input id="item-price" type="number" {...form.register("price")} placeholder="0" step="0.01"/>
                {form.formState.errors.price && <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="item-description">Description</Label>
                <Textarea id="item-description" {...form.register("description")} placeholder="Describe the item"/>
                {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
              </div>

              <div className="pt-4">
                <Label className="font-semibold">Variations / Sizes</Label>
                <div className="space-y-2 mt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Input {...form.register(`subItems.${index}.name`)} placeholder="Variation name" className="h-8"/>
                      <Input {...form.register(`subItems.${index}.price`)} type="number" placeholder="Price (৳)" className="h-8 w-28" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive h-8 w-8"><X className="h-4 w-4"/></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", price: undefined })} className="mt-2"><Plus className="h-4 w-4 mr-2"/>Add Variation</Button>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


const MenuItemCard = React.memo(function MenuItemCard({ 
  item, 
  isSelected, 
  onSelectItem, 
  onEditItem, 
  onToggleSubItems,
  isSubItemsExpanded
}: {
  item: MenuItem;
  isSelected: boolean;
  onSelectItem: (id: string) => void;
  onEditItem: (item: MenuItem) => void;
  onToggleSubItems: (id: string) => void;
  isSubItemsExpanded: boolean;
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow rounded-lg bg-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={() => onSelectItem(item.id)} className="mt-1" />
          <div className="flex-1 min-w-0">
            <label htmlFor={`item-${item.id}`} className="text-sm font-medium text-foreground cursor-pointer truncate block">{item.name}</label>
            {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
          </div>
          <div className="text-sm text-muted-foreground font-semibold whitespace-nowrap">{item.price > 0 && `৳${item.price.toLocaleString()}`}</div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditItem(item)}><Edit className="h-4 w-4"/></Button>
          </div>
        </div>
        {item.subItems && item.subItems.length > 0 && (
          <div className="mt-3 pl-2">
            <Button variant="link" size="sm" onClick={() => onToggleSubItems(item.id)} className="text-xs h-auto p-1 text-primary">
              {isSubItemsExpanded ? 'Hide' : 'Show'} Variations ({item.subItems.length})
              {isSubItemsExpanded ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
            </Button>
            {isSubItemsExpanded && (
              <div className="mt-2 pl-4 space-y-2 border-l-2 border-primary/20 pt-2 pb-1 bg-muted/30 rounded-r-md">
                {item.subItems.map((subItem, index) => (
                  <div key={subItem.id || index} className="flex justify-between items-center text-xs p-1.5 rounded-md bg-card shadow-sm">
                    <span className="text-foreground">{subItem.name}</span>
                    {subItem.price && subItem.price > 0 && <span className="text-foreground font-medium">৳{subItem.price.toLocaleString()}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
MenuItemCard.displayName = 'MenuItemCard';

export default function MenuItemsPage() {
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({}); 
  const [selectedMenuType, setSelectedMenuType] = useState<string>('restaurant');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]); 
  
  const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({}); 
  const { toast } = useToast();
  const router = useRouter();

  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const sanitizeAndPrefixData = useCallback((items: any[], categories: any[], menuType: string): { sanitizedItems: MenuItem[], sanitizedCategories: Category[] } => {
    const idPrefix = menuType === 'restaurant' ? 'restaurant-' : 'parlour-';
    
    const sanitizedCategories: Category[] = categories
      .filter((cat: any) => cat.visibleToUsers)
      .map((cat: any) => ({
        ...cat,
        id: String(cat.id).startsWith(idPrefix) ? String(cat.id) : `${idPrefix}${cat.id}`,
      }));
      
    const sanitizedItems: MenuItem[] = items
      .filter((item: any) => item.visibleToUsers)
      .map((item: any) => {
        const itemIdStr = String(item.id);
        const prefixedItemId = itemIdStr.startsWith(idPrefix) ? itemIdStr : `${idPrefix}${itemIdStr}`;
        const categoryIdStr = String(item.category || item.categoryId);
        const prefixedCategoryId = categoryIdStr.startsWith(idPrefix) ? categoryIdStr : `${idPrefix}${categoryIdStr}`;

        return {
            ...item,
            id: prefixedItemId,
            category: prefixedCategoryId,
            subItems: Array.isArray(item.subItems) ? item.subItems.map((sub: any, index: number) => ({
                id: sub.id ? `${idPrefix}${sub.id}` : `${prefixedItemId}-sub-${index}`,
                name: sub.name,
                price: sub.price ? parseFloat(sub.price) : undefined
            })).filter(si => si.name) : [],
        };
    });

    return { sanitizedItems, sanitizedCategories };
  }, []);

  const fetchAndSeedData = useCallback(async (menuType: string) => {
    setLoading(true);
    setError(null);

    const categoriesApiUrl = menuType === 'parlour' ? 'https://colorhutbd.xyz/vm/api/parlour-categories.php' : 'https://colorhutbd.xyz/vm/api/categories.php';
    const menuItemsApiUrl = menuType === 'parlour' ? 'https://colorhutbd.xyz/vm/api/parlour-items.php?visibleOnly=true' : 'https://colorhutbd.xyz/vm/api/menu-items.php?visibleOnly=true';

    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch(categoriesApiUrl),
        fetch(menuItemsApiUrl)
      ]);

      if (!categoriesRes.ok || !itemsRes.ok) throw new Error("Failed to fetch initial data from API.");

      const categoriesData = await categoriesRes.json();
      const itemsData = await itemsRes.json();

      if (!categoriesData.success || !Array.isArray(categoriesData.data.categories)) throw new Error("Invalid category data format.");

      const rawItems = Array.isArray(itemsData) ? itemsData : (itemsData.success && Array.isArray(itemsData.data)) ? itemsData.data : [];
      
      const { sanitizedCategories, sanitizedItems } = sanitizeAndPrefixData(rawItems, categoriesData.data.categories, menuType);

      localStorage.setItem(`${CLIENT_CATEGORIES_STORAGE_KEY}_${menuType}`, JSON.stringify(sanitizedCategories));
      localStorage.setItem(`${CLIENT_MENU_ITEMS_STORAGE_KEY}_${menuType}`, JSON.stringify(sanitizedItems));

      setApiCategories(sanitizedCategories);
      setOrderedCategories(sanitizedCategories.sort((a,b) => a.name.localeCompare(b.name)));
      setAllMenuItems(sanitizedItems);
      setSelectedCategory(sanitizedCategories.length > 0 ? sanitizedCategories[0] : null);

    } catch (err: any) {
      setError(err.message || "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, [sanitizeAndPrefixData]);

  const loadData = useCallback(async (menuType: string) => {
    setLoading(true);
    const storedCategories = localStorage.getItem(`${CLIENT_CATEGORIES_STORAGE_KEY}_${menuType}`);
    const storedItems = localStorage.getItem(`${CLIENT_MENU_ITEMS_STORAGE_KEY}_${menuType}`);

    if (storedCategories && storedItems) {
      try {
        const categories = JSON.parse(storedCategories);
        const items = JSON.parse(storedItems);
        const { sanitizedCategories, sanitizedItems } = sanitizeAndPrefixData(items, categories, menuType);
        
        setApiCategories(sanitizedCategories);
        setOrderedCategories(sanitizedCategories.sort((a:Category, b:Category) => a.name.localeCompare(b.name)));
        setAllMenuItems(sanitizedItems);
        if (sanitizedCategories.length > 0) {
            const currentCatExists = sanitizedCategories.some((c: Category) => c.id === selectedCategory?.id);
            if (!currentCatExists) {
                setSelectedCategory(sanitizedCategories[0]);
            }
        } else {
            setSelectedCategory(null);
        }
        setLoading(false);
      } catch (e) {
        await fetchAndSeedData(menuType);
      }
    } else {
      await fetchAndSeedData(menuType);
    }
  }, [fetchAndSeedData, sanitizeAndPrefixData, selectedCategory?.id]);

  useEffect(() => {
    loadData(selectedMenuType);
  }, [selectedMenuType, loadData]);

  const handleOpenAddItem = () => {
    if (!selectedCategory) {
      toast({ title: "No Category Selected", description: "Please select a category to add an item to.", variant: "destructive" });
      return;
    }
    setEditingItem(null);
    setIsFormDialogOpen(true);
  };
  
  const handleOpenEditItem = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setIsFormDialogOpen(true);
  }, []);

  const handleFormSubmit = (data: MenuItemFormValues) => {
    setIsSubmitting(true);
    let newItems;
    const idPrefix = selectedMenuType === 'restaurant' ? 'restaurant-' : 'parlour-';

    if (editingItem) { // Editing existing item
      newItems = allMenuItems.map(item => item.id === editingItem.id ? { ...item, ...data } : item);
      toast({ title: "Item Updated", description: `"${data.name}" has been updated.` });
    } else { // Adding new item
      if (!selectedCategory) {
        toast({ title: "Error", description: "Cannot add item without a selected category.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      const newItem: MenuItem = {
        ...data,
        id: `${idPrefix}item-${Date.now()}`,
        category: selectedCategory.id,
        visibleToUsers: true,
        createdAt: new Date().toISOString(),
      };
      newItems = [...allMenuItems, newItem];
      toast({ title: "Item Added", description: `"${data.name}" has been added.` });
    }

    setAllMenuItems(newItems);
    localStorage.setItem(`${CLIENT_MENU_ITEMS_STORAGE_KEY}_${selectedMenuType}`, JSON.stringify(newItems));
    setIsFormDialogOpen(false);
    setEditingItem(null);
    setIsSubmitting(false);
  };

  const currentMenuItems = useMemo(() => {
    const currentExpectedPrefix = selectedMenuType === 'parlour' ? 'parlour-' : 'restaurant-';
    
    // Ensure allMenuItems have string IDs before filtering
    const itemsOfCurrentType = allMenuItems.filter(item => String(item.id).startsWith(currentExpectedPrefix));
    
    let itemsToFilter = itemsOfCurrentType;
    if (selectedCategory && String(selectedCategory.id).startsWith(currentExpectedPrefix)) {
      itemsToFilter = itemsOfCurrentType.filter(item => item.category === selectedCategory.id);
    }
    
    if (!debouncedSearchTerm) {
        return itemsToFilter;
    }
    
    return itemsToFilter.filter(item => item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [selectedCategory, allMenuItems, debouncedSearchTerm, selectedMenuType]);

  const handleSelectItem = useCallback((itemId: string) => { 
    setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  const toggleSubItems = useCallback((itemId: string) => { 
    setExpandedSubItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const handleSaveDraft = useCallback(() => {
    // This function can remain as is, since it reads from `allMenuItems` state.
  }, []);

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
      <div className="flex flex-col md:flex-row md:h-[calc(100vh-theme(spacing.16)-1px)]">
        <aside className="hidden md:flex w-72 bg-card border-r border-border flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">All Categories</h2>
          </div>
          <ScrollArea className="flex-1">
            {loading && (
              <div className="p-2 space-y-2.5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-md" />)}</div>
            )}
            {error && <p className="p-4 text-sm text-destructive">Error: {error}</p>}
            {!loading && !error && orderedCategories.length === 0 && <p className="p-4 text-sm text-muted-foreground">No categories found.</p>}
            {!loading && !error && orderedCategories.length > 0 && (
              <Reorder.Group axis="y" values={orderedCategories} onReorder={setOrderedCategories} className="p-2 space-y-2.5">
                {orderedCategories.map(category => (
                  <Reorder.Item key={category.id} value={category} className="bg-card rounded-md">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start items-center text-sm h-9 border border-border rounded-md ${selectedCategory?.id === category.id ? 'bg-muted font-semibold text-foreground' : 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-card-foreground'}`}
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

        <main className="flex-1 flex flex-col bg-background overflow-hidden">
        <div className="py-4 px-6 border-b border-border bg-card space-y-3 md:space-y-0">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Select Menu Items</h1>
              <Select value={selectedMenuType} onValueChange={setSelectedMenuType}>
                <SelectTrigger className="w-full md:w-[200px] text-sm"><SelectValue placeholder="Select menu type" /></SelectTrigger>
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
                    <Button variant="outline" className="text-sm flex-1 md:flex-none" onClick={handleOpenAddItem}><PlusCircle className="h-4 w-4 mr-2" />Add Item</Button>
                    <Button variant="outline" className="text-sm flex-1 md:flex-none" onClick={handleSaveDraft}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
                    <Button variant="default" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex-1 md:flex-none" onClick={() => setIsPreviewDialogOpen(true)} disabled={selectedCount === 0}><Eye className="h-4 w-4 mr-2" />Preview ({selectedCount})</Button>
                </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 sm:p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}</div>
            ) : error ? (
              <div className="text-center py-10"><p className="text-destructive">Error: {error}</p></div>
            ) : (
              <>
                {selectedCategory && <h2 className="text-xl font-semibold text-foreground mb-4">{selectedCategory.name}</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMenuItems.map((item, index) => (
                    <MenuItemCard
                      key={`${item.id}-${index}`}
                      item={item}
                      isSelected={!!selectedItems[item.id]}
                      onSelectItem={handleSelectItem}
                      onEditItem={handleOpenEditItem}
                      onToggleSubItems={toggleSubItems}
                      isSubItemsExpanded={!!expandedSubItems[item.id]}
                    />
                  ))}
                   {currentMenuItems.length === 0 && <div className="text-center py-10 col-span-full"><p className="text-muted-foreground text-sm">No items match your search or category.</p></div>}
                </div>
              </>
            )}
          </ScrollArea>
        </main>
      </div>
      
      <MenuItemForm 
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingItem || undefined}
        categoryName={selectedCategory?.name}
        isSubmitting={isSubmitting}
      />

      <MenuPreviewDialog
        isOpen={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        selectedItems={preparedSelectedItemsForPreview} 
        allCategories={apiCategories} 
        onRemoveItem={handleRemoveItemFromPreview}
        selectedMenuType={selectedMenuType}
      />
    </>
  );
}
