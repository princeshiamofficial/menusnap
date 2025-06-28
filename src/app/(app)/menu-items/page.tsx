
"use client";

import type { ReactNode } from 'react';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { createPortal } from 'react-dom';
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
  DialogDescription,
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
import { useClientAuth } from '@/hooks/use-client-auth';

const DRAFTS_STORAGE_KEY = 'menuBuilderDrafts';
const CUSTOM_CATEGORIES_STORAGE_KEY = 'colorHutCustomCategories';
const CUSTOM_MENU_ITEMS_STORAGE_KEY = 'colorHutCustomMenuItems';

// Helper component for the CSS typewriter animation
function TypingAnimation({ text, className }: { text: string; className?: string; }): ReactNode {
  // Create a unique animation name to avoid conflicts.
  const animationName = React.useMemo(() => `typewriter-${Math.random().toString(36).substring(2, 11)}`, []);

  // Estimate width in `ch` units (character width). Works best with monospace fonts.
  const textWidth = text.length;
  const animationDuration = `${text.length * 0.09}s`; // Adjust speed here

  // Define the dynamic keyframe for the typing animation
  const keyframes = `
    @keyframes ${animationName} {
      from { width: 0; }
      to { width: ${textWidth}ch; }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <span
        style={{
          fontFamily: "'Anonymous Pro', monospace",
          animation: `${animationName} ${animationDuration} steps(${text.length}) 1s 1 normal both, blinkTextCursor 500ms steps(${text.length}) infinite normal`
        }}
        className={cn(
          "inline-block overflow-hidden whitespace-nowrap border-r-2 pr-1", // pr-1 to give cursor some space
          className
        )}
      >
        {text}
      </span>
    </>
  );
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

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  onSelectItem: (id: string, isSelected: boolean) => void;
  onEditItem: (item: MenuItem) => void;
  onToggleSubItems: (id: string) => void;
  isSubItemsExpanded: boolean;
}

const MenuItemCard = React.memo(React.forwardRef<HTMLDivElement, MenuItemCardProps>(function MenuItemCard({ 
  item, 
  isSelected, 
  onSelectItem, 
  onEditItem, 
  onToggleSubItems,
  isSubItemsExpanded
}, ref) {
  return (
    <Card ref={ref} className="shadow-sm hover:shadow-md transition-shadow rounded-lg bg-card border border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox id={`item-${item.id}`} checked={isSelected} onCheckedChange={(checked) => onSelectItem(item.id, !!checked)} className="mt-1" />
          <div className="flex-1 min-w-0">
            <label htmlFor={`item-${item.id}`} className="text-sm font-medium text-foreground cursor-pointer truncate block">{item.name}</label>
            {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
          </div>
          <div className="text-sm text-muted-foreground font-semibold whitespace-nowrap">
            {item.price > 0 && (!item.subItems || item.subItems.length === 0) && `৳${item.price.toLocaleString()}`}
          </div>
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
                    {(typeof subItem.price === 'number' && subItem.price > 0) && <span className="text-foreground font-medium">৳{subItem.price.toLocaleString()}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}));
MenuItemCard.displayName = 'MenuItemCard';

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name is too long"),
  icon: z.string().min(1, "Icon is required").max(10, "Icon is too long"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormValues) => void;
  isSubmitting: boolean;
}

function CategoryForm({ isOpen, onOpenChange, onSubmit, isSubmitting }: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      icon: "📁",
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        icon: "📁",
      });
    }
  }, [isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>Create a new category to organize your menu items.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="category-name">Category Name</Label>
            <Input id="category-name" {...form.register("name")} placeholder="e.g., Appetizers" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="category-icon">Icon (Emoji or short text)</Label>
            <Input id="category-icon" {...form.register("icon")} placeholder="e.g., 🍔" />
            {form.formState.errors.icon && <p className="text-sm text-destructive mt-1">{form.formState.errors.icon.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Category'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const customSlugify = (text: string): string => {
  if (!text) return '';
  const parts = text.trim().split(/\s+/);
  if (parts.length === 0) return '';
  
  const firstWord = parts[0];
  const restOfText = parts.slice(1).join(' ');
  // Remove non-alphanumeric chars from the rest, but keep spaces to then remove them
  const sanitizedRest = restOfText.replace(/[^\w\s]/g, '').replace(/\s+/g, '');
  
  if (sanitizedRest) {
    return `${firstWord}-${sanitizedRest}`;
  }
  return firstWord;
};

function FlyingItem({ startX, startY, endX, endY, onComplete }: { startX: number, startY: number, endX: number, endY: number, onComplete: () => void }) {
  const duration = 0.8 + Math.random() * 0.5;
  const delay = Math.random() * 0.2;
  const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 100;
  const midY = Math.min(startY, endY) - (80 + Math.random() * 60);
  const size = 8 + Math.random() * 6;

  const colors = [
    'hsl(var(--primary))', '#fb923c', '#fde047', '#a78bfa', '#60a5fa', '#f472b6', '#34d399'
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full z-[100] pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        boxShadow: `0 0 8px ${color}`
      }}
      initial={{ x: startX - (size / 2), y: startY - (size / 2), scale: 0.5, opacity: 1 }}
      animate={{
        x: [startX - (size / 2), midX, endX - (size / 2)],
        y: [startY - (size / 2), midY, endY - (size / 2)],
        scale: [0.5, 1, 0],
        opacity: [1, 1, 0],
      }}
      transition={{ duration, ease: "easeOut", delay }}
      onAnimationComplete={onComplete}
    />
  );
}

export default function MenuItemsPage() {
  const { clientUser, clientLoading } = useClientAuth();
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({}); 
  const [selectedMenuType, setSelectedMenuType] = useState<string>('');

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
  
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  const [animations, setAnimations] = useState<{id: number, startX: number, startY: number, endX: number, endY: number}[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const itemCardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!clientLoading && clientUser?.type) {
      setSelectedMenuType(clientUser.type);
    }
  }, [clientUser, clientLoading]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const loadData = useCallback(async (menuType: string) => {
    if (!menuType) return;
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
      
      const serverCategories: Category[] = categoriesData.data.categories
        .filter((cat: any) => cat.visibleToUsers)
        .map((cat: any) => ({ ...cat, id: String(cat.id) }));

      const rawServerItems = Array.isArray(itemsData) ? itemsData : (itemsData.success && Array.isArray(itemsData.data)) ? itemsData.data : [];
      const serverItems: MenuItem[] = rawServerItems
        .filter((item: any) => item.visibleToUsers)
        .map((item: any) => ({ ...item, id: String(item.id), category: String(item.category || item.categoryId) }));

      const localCategories: Category[] = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY) || '[]');
      const localItems: MenuItem[] = JSON.parse(localStorage.getItem(CUSTOM_MENU_ITEMS_STORAGE_KEY) || '[]');
      
      const combinedCategories = [...serverCategories, ...localCategories];
      const combinedItems = [...serverItems, ...localItems];
      
      const uniqueCategories = Array.from(new Map(combinedCategories.map(cat => [cat.id, cat])).values());
      const uniqueItems = Array.from(new Map(combinedItems.map(item => [item.id, item])).values());

      setApiCategories(uniqueCategories);
      setOrderedCategories(uniqueCategories.sort((a,b) => a.name.localeCompare(b.name)));
      setAllMenuItems(uniqueItems);
      
      if (uniqueCategories.length > 0) {
        const currentCatExists = uniqueCategories.some((c: Category) => c.id === selectedCategory?.id);
        if (!currentCatExists) {
            setSelectedCategory(uniqueCategories[0]);
        }
      } else {
        setSelectedCategory(null);
      }

    } catch (err: any) {
      setError(err.message || "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory?.id]);

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

  const handleFormSubmit = useCallback((data: MenuItemFormValues) => {
    setIsSubmitting(true);
    
    let newItems;
    let itemToSave;

    if (editingItem) {
      itemToSave = { ...editingItem, ...data };
      newItems = allMenuItems.map(item =>
        item.id === editingItem.id ? itemToSave : item
      );
      toast({ title: "Item Updated", description: `"${data.name}" has been updated.` });
    } else {
      if (!selectedCategory) {
        toast({ title: "Error", description: "Cannot add item without a selected category.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      itemToSave = {
        ...data,
        id: `custom-item-${Date.now()}`,
        category: selectedCategory.id,
        visibleToUsers: true,
        createdAt: new Date().toISOString(),
      };
      newItems = [...allMenuItems, itemToSave];
      toast({ title: "Item Added", description: `"${data.name}" has been added.` });
    }
    
    if (itemToSave.id.startsWith('custom-')) {
      try {
        const localItems: MenuItem[] = JSON.parse(localStorage.getItem(CUSTOM_MENU_ITEMS_STORAGE_KEY) || '[]');
        const existingIndex = localItems.findIndex(i => i.id === itemToSave.id);
        if (existingIndex > -1) {
          localItems[existingIndex] = itemToSave;
        } else {
          localItems.push(itemToSave);
        }
        localStorage.setItem(CUSTOM_MENU_ITEMS_STORAGE_KEY, JSON.stringify(localItems));
      } catch(e) {
        toast({ title: "Error", description: "Could not save custom item locally.", variant: "destructive" });
      }
    }

    setAllMenuItems(newItems);
    setIsFormDialogOpen(false);
    setEditingItem(null);
    setIsSubmitting(false);
  }, [allMenuItems, editingItem, selectedCategory, toast]);

  const handleAddCategory = useCallback((data: CategoryFormValues) => {
    setIsCategorySubmitting(true);
    
    const newCategory: Category = {
      id: `custom-category-${customSlugify(data.name)}-${Date.now()}`,
      name: data.name,
      icon: data.icon,
      visibleToUsers: true,
      itemCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedCategories = [...apiCategories, newCategory];
    
    setApiCategories(updatedCategories);
    setOrderedCategories(updatedCategories.sort((a,b) => a.name.localeCompare(b.name)));
    
    try {
      const localCategories: Category[] = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY) || '[]');
      localCategories.push(newCategory);
      localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(localCategories));
      toast({ title: "Category Added", description: `"${data.name}" has been added locally.` });
    } catch(e) {
      toast({ title: "Error", description: "Could not save category locally.", variant: "destructive" });
    }
    
    setIsAddCategoryDialogOpen(false);
    setIsCategorySubmitting(false);
  }, [apiCategories, toast]);

  const currentMenuItems = useMemo(() => {
    if (!selectedCategory) {
        return [];
    }

    let itemsToFilter = allMenuItems.filter(item => item.category === selectedCategory.id);
    
    if (!debouncedSearchTerm) {
        return itemsToFilter;
    }
    
    return itemsToFilter.filter(item => item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [selectedCategory, allMenuItems, debouncedSearchTerm]);

  const handleSelectItem = useCallback((itemId: string, isSelected: boolean) => { 
    setSelectedItems(prev => {
        const newSelected = {...prev};
        if(isSelected) {
            newSelected[itemId] = true;
        } else {
            delete newSelected[itemId];
        }
        return newSelected;
    });

    if (isSelected) {
      const cardElement = itemCardRefs.current.get(itemId);
      const buttonElement = previewButtonRef.current;

      if (cardElement && buttonElement) {
        const cardRect = cardElement.getBoundingClientRect();
        const buttonRect = buttonElement.getBoundingClientRect();
        const burstId = Date.now();
        const newAnimations = Array.from({ length: 7 }).map((_, i) => ({
          id: burstId + i,
          startX: cardRect.left + cardRect.width / 2,
          startY: cardRect.top + cardRect.height / 2,
          endX: buttonRect.left + buttonRect.width / 2,
          endY: buttonRect.top + buttonRect.height / 2,
        }));
        setAnimations(prev => [...prev, ...newAnimations]);
      }
    }
  }, []);

  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  const toggleSubItems = useCallback((itemId: string) => { 
    setExpandedSubItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const handleSaveDraft = useCallback(() => {
    const itemsToSave = allMenuItems.filter(item => selectedItems[item.id]);
    if (itemsToSave.length === 0) {
      toast({ title: "No items selected", description: "Please select items to save in a draft.", variant: "destructive" });
      return;
    }

    const draftId = `draft-${Date.now()}`;
    const draftName = `Draft - ${new Date().toLocaleString()}`;
    const draft = {
      id: draftId,
      name: draftName,
      createdAt: new Date().toISOString(),
      itemCount: itemsToSave.length,
      primaryTag: selectedMenuType,
      previewAvatars: itemsToSave.slice(0, 3).map(i => i.name.charAt(0)),
      items: itemsToSave,
    };

    try {
      const existingDrafts = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || '[]');
      existingDrafts.unshift(draft); // Add to the beginning
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(existingDrafts));
      toast({ title: "Draft Saved!", description: `"${draftName}" has been saved.` });
      setSelectedItems({}); // Clear selection after saving
    } catch (e) {
      toast({ title: "Error Saving Draft", description: "Could not save draft to local storage.", variant: "destructive" });
    }
  }, [allMenuItems, selectedItems, selectedMenuType, toast]);

  const preparedSelectedItemsForPreview = useMemo(() => {
    return allMenuItems.filter(item => selectedItems[item.id]); 
  }, [allMenuItems, selectedItems]);

  const handleRemoveItemFromPreview = useCallback((itemIdToRemove: string) => { 
    setSelectedItems(prev => {
      const updated = { ...prev };
      delete updated[itemIdToRemove];
      return updated;
    });
  }, []);

  return (
    <>
      {isMounted && createPortal(
        <AnimatePresence>
          {animations.map(anim => (
            <FlyingItem
              key={anim.id}
              {...anim}
              onComplete={() => {
                setAnimations(prev => prev.filter(a => a.id !== anim.id));
              }}
            />
          ))}
        </AnimatePresence>,
        document.body
      )}

      <div className="flex flex-col md:flex-row md:h-[calc(100vh-theme(spacing.16)-1px)]">
        <aside className="hidden md:flex w-72 bg-card border-r border-border flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">All Categories</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsAddCategoryDialogOpen(true)} className="h-8 w-8" aria-label="Add New Category">
              <PlusCircle className="h-5 w-5" />
            </Button>
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
                      className={cn(
                        'w-full justify-start items-center text-sm h-9 border border-border rounded-md',
                        selectedCategory?.id === category.id
                        ? 'bg-muted font-semibold text-foreground border-primary'
                        : 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-card-foreground'
                      )}
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
          <div className="py-4 px-6 border-b border-border bg-card space-y-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Select Menu Items</h1>
              <Select value={selectedMenuType} onValueChange={setSelectedMenuType} disabled={clientLoading}>
                <SelectTrigger className="w-full md:w-[200px] text-sm"><SelectValue placeholder="Select menu type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant Menu</SelectItem>
                  <SelectItem value="parlour">Parlour Menu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Mobile-only Category Selector */}
            <div className="md:hidden flex items-end gap-2">
              <div className="flex-grow">
                <Label htmlFor="mobile-category-select">Category</Label>
                <Select
                  value={selectedCategory?.id || ''}
                  onValueChange={(value) => {
                    const category = apiCategories.find(c => c.id === value);
                    setSelectedCategory(category || null);
                  }}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="mobile-category-select"
                    className={cn("w-full mt-1", selectedCategory && "border-primary ring-1 ring-primary")}
                  >
                    {selectedCategory ? (
                      <div className="flex items-center gap-2">
                        <span className="text-base">{selectedCategory.icon}</span>
                        <span>{selectedCategory.name}</span>
                      </div>
                    ) : (
                       <span className="text-muted-foreground">Select a category...</span>
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {orderedCategories.length > 0 ? (
                      orderedCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                              <span className="text-base">{category.icon}</span>
                              <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsAddCategoryDialogOpen(true)}
                className="h-10 w-10 shrink-0"
                aria-label="Add New Category"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative w-full md:flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search menu item..." className="pl-10 text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex w-full md:w-auto gap-2 mt-2 md:mt-0">
                    <Button variant="outline" className="text-sm flex-1 md:flex-none" onClick={handleOpenAddItem}><PlusCircle className="h-4 w-4 mr-2" />Add Item</Button>
                    <Button variant="outline" className="text-sm flex-1 md:flex-none" onClick={handleSaveDraft}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
                    <Button ref={previewButtonRef} variant="default" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground flex-1 md:flex-none" onClick={() => setIsPreviewDialogOpen(true)} disabled={selectedCount === 0}>
                        {clientUser?.businessName ? (
                            <div className="flex items-center gap-2">
                                <TypingAnimation text={`(${clientUser.businessName})`} />
                                <span>Menu ({selectedCount})</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>Preview ({selectedCount})</span>
                            </div>
                        )}
                    </Button>
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
                {selectedCategory && 
                  <h2 className="text-xl font-semibold text-foreground mb-4 md:hidden">
                    {selectedCategory.name}
                  </h2>
                }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMenuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      ref={(el) => {
                        if (el) itemCardRefs.current.set(item.id, el);
                        else itemCardRefs.current.delete(item.id);
                      }}
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

      <CategoryForm 
        isOpen={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        onSubmit={handleAddCategory}
        isSubmitting={isCategorySubmitting}
      />

      <MenuPreviewDialog
        isOpen={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        selectedItems={preparedSelectedItemsForPreview} 
        allCategories={apiCategories} 
        onRemoveItem={handleRemoveItemFromPreview}
        selectedMenuType={selectedMenuType}
        clientUser={clientUser}
      />
    </>
  );
}
