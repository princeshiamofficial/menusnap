
"use client";

import type { ReactNode } from 'react';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from 'react-dom';
import {
  Search,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  Edit,
  X,
  Plus,
  UtensilsCrossed,
  Folder,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn, decodeHtmlEntities } from "@/lib/utils";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuPreviewDialog, type MenuItem, type SubMenuItem, type Category as MenuCategory } from '@/components/menu/menu-preview-dialog';
import { CategoryList } from '@/components/menu/category-list';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useClientAuth } from '@/hooks/use-client-auth';
import { getCategoriesFromMySql, getMenuItemsFromMySql } from '@/app/actions/orders';
import { ClientGate } from '@/components/auth/ClientGate';

const DRAFTS_STORAGE_KEY = 'menuBuilderDrafts';
const CUSTOM_CATEGORIES_STORAGE_KEY = 'colorHutCustomCategories';
const CUSTOM_MENU_ITEMS_STORAGE_KEY = 'colorHutCustomMenuItems';

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
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setScrolled(event.currentTarget.scrollTop > 0);
  };

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: decodeHtmlEntities(initialData?.name),
      price: initialData?.price || 0,
      description: decodeHtmlEntities(initialData?.description),
      subItems: initialData?.subItems?.map(si => ({ ...si, name: decodeHtmlEntities(si.name) })) || [],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subItems",
  });

  const [newSubItemName, setNewSubItemName] = useState('');
  const [newSubItemPrice, setNewSubItemPrice] = useState('');


  const handleAddSubItemClick = () => {
    form.clearErrors("subItems");
    const nameVal = newSubItemName.trim();
    const priceStr = newSubItemPrice.trim();

    if (!nameVal) {
      form.setError("subItems", { type: "manual", message: "Variation name cannot be empty." });
      return;
    }

    let priceVal: number | undefined = undefined;
    if (priceStr !== '') {
      const parsedPrice = parseFloat(priceStr);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        form.setError("subItems", { type: "manual", message: "Variation price must be a valid non-negative number if provided." });
        return;
      }
      priceVal = parsedPrice;
    }

    append({ name: nameVal, price: priceVal });
    setNewSubItemName('');
    setNewSubItemPrice('');
  };


  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: decodeHtmlEntities(initialData?.name),
        price: initialData?.price || 0,
        description: (initialData?.description === null ? undefined : decodeHtmlEntities(initialData?.description)) as string | undefined,
        subItems: initialData?.subItems?.map(si => ({ ...si, name: decodeHtmlEntities(si.name) })) || [],
      });
      setScrolled(false);
    }
  }, [isOpen, initialData, form]);

  // Detect mobile for bottom sheet behaviour
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Shared inner form markup ──────────────────────────────────── */
  const formInner = (
    <>
      {/* Header — icon + title + subtitle */}
      <div className={cn(
        "relative px-6 pt-6 pb-5 transition-shadow bg-background",
        scrolled && "shadow-md"
      )}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <DialogTitle className="text-lg font-bold leading-tight text-foreground">
              {initialData ? 'Edit' : 'Add'} {categoryName ? `${decodeHtmlEntities(categoryName)} Item` : 'MagicTab Item'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {initialData ? 'Update the details for this item.' : 'Fill in the details to add a new item.'}
            </DialogDescription>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden min-h-0">
        <ScrollArea className="flex-grow" onScroll={handleScroll}>
          <div className="px-6 pb-2 space-y-5">

            {/* Item Name & Base Price — side by side */}
            <div className="flex gap-3 items-start">
              <div className="flex-[2] space-y-1.5">
                <Label htmlFor="item-name" className="text-sm font-semibold text-foreground">Item Name</Label>
                <Input
                  id="item-name"
                  {...form.register("name")}
                  placeholder="e.g., Classic Burger"
                  className="rounded-full border-border/70 h-11 px-4 focus-visible:ring-orange-400 focus-visible:border-orange-400"
                />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div className="flex-[1] space-y-1.5">
                <Label htmlFor="item-price" className="text-sm font-semibold text-foreground">Base Price (৳)</Label>
                <Input
                  id="item-price"
                  type="number"
                  {...form.register("price")}
                  placeholder="0"
                  step="0.01"
                  className="rounded-full border-border/70 h-11 px-4 focus-visible:ring-orange-400 focus-visible:border-orange-400"
                />
                {form.formState.errors.price && <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="item-description" className="text-sm font-semibold text-foreground">Description</Label>
              <Textarea
                id="item-description"
                {...form.register("description")}
                placeholder="Describe the item"
                className="rounded-2xl border-border/70 px-4 pt-3 focus-visible:ring-orange-400 focus-visible:border-orange-400 resize-none min-h-[80px]"
              />
              {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
            </div>

            {/* Variations Section */}
            <div className="space-y-2 pt-1">
              <Label className="text-sm font-semibold text-foreground">Variations / Sizes</Label>
              <div className="flex items-start gap-2">
                <div className="flex-grow">
                  <Label htmlFor="new-subitem-name" className="sr-only">Variation Name</Label>
                  <Input
                    id="new-subitem-name"
                    placeholder="Variation name (e.g., Small)"
                    value={newSubItemName}
                    onChange={(e) => setNewSubItemName(e.target.value)}
                    className="rounded-full border-border/70 h-10 px-4 focus-visible:ring-orange-400 focus-visible:border-orange-400"
                  />
                </div>
                <div className="w-36">
                  <Label htmlFor="new-subitem-price" className="sr-only">Variation Price</Label>
                  <Input
                    id="new-subitem-price"
                    type="number"
                    placeholder="Price (opt.)"
                    value={newSubItemPrice}
                    onChange={(e) => setNewSubItemPrice(e.target.value)}
                    step="0.01"
                    className="rounded-full border-border/70 h-10 px-4 focus-visible:ring-orange-400 focus-visible:border-orange-400"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddSubItemClick}
                  className="h-10 w-10 shrink-0 rounded-full bg-orange-500 hover:bg-orange-600 text-white p-0"
                  aria-label="Add variation"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {form.formState.errors.subItems?.root?.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.subItems.root.message}</p>}
              {Array.isArray(form.formState.errors.subItems) && form.formState.errors.subItems.map((error, index) => (
                <div key={index}>
                  {error?.name && <p className="text-sm text-destructive mt-1">Variation {index + 1} Name: {error.name.message}</p>}
                  {error?.price && <p className="text-sm text-destructive mt-1">Variation {index + 1} Price: {error.price.message}</p>}
                </div>
              ))}
            </div>

            {/* Added Variations List */}
            {fields.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Added Variations: {fields.length}</Label>
                <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-3 max-h-44 overflow-y-auto">
                  {fields.map((field, index) => {
                    const currentPrice = form.watch(`subItems.${index}.price`);
                    return (
                      <div key={field.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-card shadow-sm border border-border/50">
                        <div className="flex items-center gap-2 flex-grow min-w-0">
                          <span className="text-sm text-foreground truncate">{form.watch(`subItems.${index}.name`)}</span>
                          {typeof currentPrice === 'number' && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-sm font-medium text-orange-500 whitespace-nowrap">
                                ৳{currentPrice.toLocaleString()}
                              </span>
                            </>
                          )}
                          {currentPrice === undefined && (
                            <span className="text-xs text-muted-foreground italic ml-1">(No price)</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0 rounded-full"
                          aria-label={`Remove ${form.watch(`subItems.${index}.name`)} variation`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </ScrollArea>

        {/* Footer — side by side Cancel & Save buttons */}
        <div className="px-6 pb-6 pt-4 flex gap-3 bg-background">
          {isMobile ? (
            <SheetClose asChild>
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-full text-muted-foreground">
                Cancel
              </Button>
            </SheetClose>
          ) : (
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1 h-11 rounded-full text-muted-foreground">
                Cancel
              </Button>
            </DialogClose>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-11 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Item')}
          </Button>
        </div>
      </form>
    </>
  );

  /* ── Mobile: bottom Sheet ─────────────────────────────────────── */
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="p-0 gap-0 rounded-t-2xl overflow-hidden border-0 shadow-2xl flex flex-col max-h-[92vh] [&>button]:hidden"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          {formInner}
        </SheetContent>
      </Sheet>
    );
  }

  /* ── Desktop: centered Dialog ─────────────────────────────────── */
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh] p-0 gap-0 rounded-2xl overflow-hidden border-0 shadow-2xl">
        {formInner}
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
    <Card 
      ref={ref} 
      className={cn(
        "shadow-sm hover:shadow-md transition-all rounded-lg bg-card border border-border h-full flex flex-col cursor-pointer select-none",
        isSelected ? "bg-primary/5 shadow-md" : ""
      )}
      onClick={() => onSelectItem(item.id, !isSelected)}
    >
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-4">
          <Checkbox 
            id={`item-${item.id}`} 
            checked={isSelected} 
            onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <label 
                htmlFor={`item-${item.id}`} 
                className="text-sm font-medium text-foreground cursor-pointer block truncate-2-lines"
                onClick={(e) => e.stopPropagation()}
              >
                {decodeHtmlEntities(item.name)}
              </label>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-sm text-muted-foreground font-semibold whitespace-nowrap">
                  {item.price > 0 && `৳${item.price.toLocaleString()}`}
                </div>
                <div className="h-7 w-7 flex items-center justify-center">
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditItem(item);
                          }} 
                          aria-label="Edit item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed pr-2">
                {decodeHtmlEntities(item.description)}
              </p>
            )}
          </div>
        </div>
        {item.subItems && item.subItems.length > 0 && (
          <div className="mt-3 pl-2 mt-auto pt-2">
            <Button 
              variant="link" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onToggleSubItems(item.id);
              }} 
              className="text-xs h-auto p-1 text-primary"
            >
              {isSubItemsExpanded ? 'Hide' : 'Show'} Variations ({item.subItems.length})
              {isSubItemsExpanded ? <ChevronDown className="h-3 w-3 ml-1" /> : <ChevronRight className="h-3 w-3 ml-1" />}
            </Button>
            {isSubItemsExpanded && (
              <div className="mt-2 pl-4 space-y-2 border-l-2 border-primary/20 pt-2 pb-1 bg-muted/30 rounded-r-md">
                {item.subItems.map((subItem, index) => (
                  <div key={subItem.id || index} className="flex justify-between items-center text-xs p-1.5 rounded-md bg-card shadow-sm">
                    <span className="text-foreground">{decodeHtmlEntities(subItem.name)}</span>
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

const Typewriter = React.memo(function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const typeSpeed = 150;
  const deleteSpeed = 75;
  const pauseDuration = 2000;

  useEffect(() => {
    if (!words || words.length === 0) return;

    const handleTyping = () => {
      const currentWord = words[wordIndex % words.length];

      if (isDeleting) {
        // Deleting text
        if (text.length > 0) {
          setText(prev => prev.substring(0, prev.length - 1));
        } else {
          // Finished deleting, switch to next word
          setIsDeleting(false);
          setWordIndex(prev => prev + 1);
        }
      } else {
        // Typing text
        if (text.length < currentWord.length) {
          setText(currentWord.substring(0, text.length + 1));
        } else {
          // Finished typing, pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    };

    const typingTimeout = setTimeout(handleTyping, isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(typingTimeout);
  }, [text, isDeleting, wordIndex, words, deleteSpeed, typeSpeed, pauseDuration]);

  const Cursor = () => (
    <motion.span
      className="inline-block text-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
    >
      /
    </motion.span>
  );

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span>{text}</span>
      <AnimatePresence mode="wait">
        <Cursor />
      </AnimatePresence>
    </span>
  );
});


export default function MagicTabPage() {
  const { clientUser, clientLoading, isClientLoggedIn } = useClientAuth();
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [selectedMenuType, setSelectedMenuType] = useState<string>('');
  const [itemsToSelectFromDraft, setItemsToSelectFromDraft] = useState<string[] | null>(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);

  const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [animations, setAnimations] = useState<{ id: number, startX: number, startY: number, endX: number, endY: number }[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const itemCardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const magicSearchRef = useRef<HTMLTextAreaElement>(null);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (magicSearchRef.current) {
        // Reset height to 0 to measure exact content height
        magicSearchRef.current.style.height = '0px';
        const scrollHeight = magicSearchRef.current.scrollHeight;
        
        // If there are no newlines, force back to the default height (44px)
        const hasNewLine = searchTerm.includes('\n');
        const newHeight = !hasNewLine ? 44 : Math.max(44, Math.min(scrollHeight, 300));
        
        magicSearchRef.current.style.height = `${newHeight}px`;
      }
    };

    // Use requestAnimationFrame to ensure we measure after the DOM has updated
    const animationId = requestAnimationFrame(handleResize);
    return () => cancelAnimationFrame(animationId);
  }, [searchTerm]);

  const selectedCategory = useMemo(() => {
    return apiCategories.find(c => c.id === activeCategoryId) || null;
  }, [apiCategories, activeCategoryId]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!clientLoading) {
      if (clientUser?.type) {
        setSelectedMenuType(clientUser.type);
      } else {
        setSelectedMenuType('restaurant');
      }
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

  // Scroll to top when searching
  useEffect(() => {
    if (debouncedSearchTerm && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }, [debouncedSearchTerm]);

  const loadCategories = useCallback(async (menuType: string) => {
    if (!menuType) return;
    setLoadingCategories(true);
    setError(null);
    try {
      const type = menuType === 'parlour' ? 'parlour' : 'restaurant';
      const result = await getCategoriesFromMySql(type, true); // true for visibleOnly
      
      if (!result.success) throw new Error(result.message || "Failed to fetch categories from local MySQL.");

      const serverCategories: Category[] = (result.data as any[])
        .map((cat: any) => ({ ...cat, id: String(cat.id) }));

      const localCategories: Category[] = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY) || '[]');
      const combinedCategories = [...serverCategories, ...localCategories];
      const uniqueCategories = Array.from(new Map(combinedCategories.map(cat => [cat.id, cat])).values());

      setApiCategories(uniqueCategories);

    } catch (err: any) {
      console.error("Local Categories Error:", err);
      setError(err.message || "Could not load categories.");
      setApiCategories([]);
      setActiveCategoryId(null);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadItems = useCallback(async (menuType: string) => {
    if (!menuType) return;
    setLoadingItems(true);
    try {
      const type = menuType === 'parlour' ? 'parlour' : 'restaurant';
      const result = await getMenuItemsFromMySql(type, true); // true for visibleOnly
      
      if (!result.success) throw new Error(result.message || "Failed to fetch items from local MySQL.");

      const serverItems: MenuItem[] = (result.data as any[]).map((item: any) => ({
          ...item,
          id: String(item.id),
          price: parseFloat(item.price) || 0,
          category: String(item.categoryId)
        }));

      const localItems: MenuItem[] = JSON.parse(localStorage.getItem(CUSTOM_MENU_ITEMS_STORAGE_KEY) || '[]');
      const combinedItems = [...serverItems, ...localItems];
      const uniqueItems = Array.from(new Map(combinedItems.map(item => [item.id, item])).values());
      setAllMenuItems(uniqueItems);

    } catch (err: any) {
      console.error("Local Items Error:", err);
      setError(err.message || "Could not load menu items.");
      setAllMenuItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    if (isClientLoggedIn && selectedMenuType) {
      loadCategories(selectedMenuType);
      loadItems(selectedMenuType);
    }
  }, [isClientLoggedIn, selectedMenuType, loadCategories, loadItems]);


  // Effect to handle restoring a draft on page load
  useEffect(() => {
    const draftIdToRestore = localStorage.getItem('draftToRestoreId');
    if (draftIdToRestore) {
      // Remove the key immediately to prevent re-triggering on refresh
      localStorage.removeItem('draftToRestoreId');
      try {
        const allDraftsRaw = localStorage.getItem(DRAFTS_STORAGE_KEY);
        if (allDraftsRaw) {
          const allDrafts = JSON.parse(allDraftsRaw);
          const draftToRestore = allDrafts.find((d: any) => d.id === draftIdToRestore);

          if (draftToRestore) {
            if (draftToRestore.primaryTag) {
              setSelectedMenuType(draftToRestore.primaryTag);
            }
            if (Array.isArray(draftToRestore.items)) {
              const itemIds = draftToRestore.items.map((item: { id: string }) => item.id);
              setItemsToSelectFromDraft(itemIds);
            }
          }
        }
      } catch (e) {
        console.error("Failed to restore draft:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  // Effect to apply selections after data has finished loading
  useEffect(() => {
    const loading = loadingCategories || loadingItems;
    if (!loading && itemsToSelectFromDraft) {
      const newSelectedItems: Record<string, boolean> = {};
      itemsToSelectFromDraft.forEach(itemId => {
        // Only select items that exist in the currently loaded menu items
        if (allMenuItems.some(menuItem => menuItem.id === itemId)) {
          newSelectedItems[itemId] = true;
        }
      });
      setSelectedItems(newSelectedItems);
      // Reset the pending selection state
      setItemsToSelectFromDraft(null);
    }
  }, [loadingCategories, loadingItems, itemsToSelectFromDraft, allMenuItems]);


  const handleOpenAddItem = () => {
    if (!selectedCategory) {
      return;
    }

    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      setEditingItem(null);
      setIsFormDialogOpen(true);
      return;
    }

    // Helper for title casing
    const toTitleCase = (str: string) => 
      str.toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const lines = trimmedSearch.split('\n').map(l => l.trim()).filter(l => l !== '');
    
    let itemName = '';
    let itemPrice = 0;
    let itemDescription: string | undefined = undefined;
    const subItems: any[] = [];

    // 1. Process First Line (Main Item)
    const firstLine = lines[0];
    
    // Check if description is on the first line (e.g., "Burger 100/- D: Spicy")
    const dMatch = firstLine.match(/(.+?)\s*d:\s*(.+)$/i);
    let lineToParseForPrice = firstLine;
    if (dMatch) {
        itemDescription = dMatch[2].trim();
        lineToParseForPrice = dMatch[1].trim();
    }

    const priceMatch = lineToParseForPrice.match(/(.+?)\s+(\d+(?:\.\d+)?)\/-\s*$/);
    if (priceMatch) {
        itemName = toTitleCase(priceMatch[1]);
        itemPrice = parseFloat(priceMatch[2]);
    } else {
        itemName = toTitleCase(lineToParseForPrice);
    }

    // 2. Process Subsequent Lines (Sub-items and extra description)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // Description marker (D: spicy)
        const dLineMatch = line.match(/^d:\s*(.+)$/i);
        if (dLineMatch) {
            itemDescription = (itemDescription ? itemDescription + '\n' : '') + dLineMatch[1].trim();
            continue;
        }

        // Sub-item marker with price (--Large 200/- or Large 200/-)
        const subItemMatch = line.match(/^(?:--)?(.+?)\s+(\d+(?:\.\d+)?)\/-\s*$/);
        if (subItemMatch) {
            subItems.push({
                name: toTitleCase(subItemMatch[1]),
                price: parseFloat(subItemMatch[2])
            });
            continue;
        }

        // Sub-item name only (--Extra Cheese)
        const nameOnlyMatch = line.match(/^--\s*(.+)$/);
        if (nameOnlyMatch) {
            subItems.push({
                name: toTitleCase(nameOnlyMatch[1]),
                price: undefined
            });
        }
    }

    setEditingItem({
      name: itemName,
      price: itemPrice,
      description: itemDescription,
      subItems: subItems.length > 0 ? subItems : undefined,
      category: selectedCategory.id,
      visibleToUsers: true,
    } as MenuItem);

    setIsFormDialogOpen(true);
  };

  const handleOpenEditItem = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setIsFormDialogOpen(true);
  }, []);

  const handleFormSubmit = useCallback((data: MenuItemFormValues) => {
    setIsSubmitting(true);

    let newItems: MenuItem[];
    let itemToSave: MenuItem;

    if (editingItem && editingItem.id) {
      itemToSave = { ...editingItem, ...data };
      newItems = allMenuItems.map(item =>
        item.id === editingItem.id ? itemToSave : item
      );
    } else {
      if (!selectedCategory) {
        setIsSubmitting(false);
        return;
      }
      itemToSave = {
        ...data,
        id: `custom-item-${Date.now()}`,
        category: selectedCategory.id,
        visibleToUsers: true,
        createdAt: new Date().toISOString(),
      } as MenuItem;
      newItems = [...allMenuItems, itemToSave];
      setSelectedItems(prev => ({ ...prev, [itemToSave.id]: true }));
    }

    try {
      const localItems: MenuItem[] = JSON.parse(localStorage.getItem(CUSTOM_MENU_ITEMS_STORAGE_KEY) || '[]');
      const existingIndex = localItems.findIndex(i => i.id === itemToSave.id);
      if (existingIndex > -1) {
        localItems[existingIndex] = itemToSave;
      } else {
        localItems.push(itemToSave);
      }
      localStorage.setItem(CUSTOM_MENU_ITEMS_STORAGE_KEY, JSON.stringify(localItems));
    } catch (e) {
      // Error handling without toast
    }

    setAllMenuItems(newItems);
    setIsFormDialogOpen(false);
    setEditingItem(null);
    setIsSubmitting(false);
  }, [allMenuItems, editingItem, selectedCategory]);


  const handleOpenEditCategory = useCallback((category: Category) => {
    const newName = window.prompt("Edit category name:", decodeHtmlEntities(category.name));
    if (!newName || newName.trim() === decodeHtmlEntities(category.name)) return;

    const updatedCategory = { ...category, name: newName.trim() };
    setApiCategories(prev => prev.map(cat => cat.id === category.id ? updatedCategory : cat));

    try {
      const localCategories: Category[] = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY) || '[]');
      const index = localCategories.findIndex(c => c.id === category.id);
      if (index > -1) {
        localCategories[index] = { ...localCategories[index], name: newName.trim() };
        localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(localCategories));
      }
    } catch (e) {
      // Error handling without toast
    }
  }, []);



  const handleQuickAddCategory = useCallback((name: string) => {
    if (!name.trim()) return;
    
    const formattedName = name.trim().toLowerCase().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    // Check if category already exists
    const exists = apiCategories.find(c => decodeHtmlEntities(c.name).toLowerCase() === formattedName.toLowerCase());
    if (exists) {
        setActiveCategoryId(exists.id);
        return;
    }

    const newCategory: Category = {
      id: `custom-category-${customSlugify(formattedName)}-${Date.now()}`,
      name: formattedName,
      icon: "📁",
      visibleToUsers: true,
      itemCount: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedCategories = [...apiCategories, newCategory];
    setApiCategories(updatedCategories);
    setActiveCategoryId(newCategory.id);

    try {
      const localCategories: any[] = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_STORAGE_KEY) || '[]');
      localCategories.push(newCategory);
      localStorage.setItem(CUSTOM_CATEGORIES_STORAGE_KEY, JSON.stringify(localCategories));
    } catch (e) {
      // Error handling without toast
    }
  }, [apiCategories, setActiveCategoryId]);

  const currentMenuItems = useMemo(() => {
    if (!activeCategoryId) {
      return [];
    }

    let itemsToFilter = allMenuItems.filter(item => item.category === activeCategoryId);

    if (!debouncedSearchTerm) {
      return itemsToFilter;
    }

    return itemsToFilter.filter(item => decodeHtmlEntities(item.name).toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [activeCategoryId, allMenuItems, debouncedSearchTerm]);

  const handleSelectItem = useCallback((itemId: string, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (isSelected) {
        newSelected[itemId] = true;
      } else {
        delete newSelected[itemId];
      }
      return newSelected;
    });

    if (isSelected) {
      try {
        const audio = new Audio('/audio/item-select.mp3');
        audio.play().catch(() => {
          /* Silence playback errors */
        });
      } catch (e) {
        /* Silence creation errors */
      }

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

  const handlePreviewAndSave = useCallback(() => {
    const itemsToSave = allMenuItems.filter(item => selectedItems[item.id]);
    if (itemsToSave.length === 0) {
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
      existingDrafts.unshift(draft);
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(existingDrafts));
    } catch (e) {
      // Error handling without toast
    }

    setIsPreviewDialogOpen(true);
  }, [allMenuItems, selectedItems, selectedMenuType]);

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

  const gridLayoutClasses = useMemo(() => {
    const itemCount = currentMenuItems.length;
    if (itemCount === 1) {
      return "grid-cols-1";
    }
    if (itemCount === 2) {
      return "grid-cols-1 md:grid-cols-2";
    }
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  }, [currentMenuItems.length]);

  const loading = loadingCategories || loadingItems;

  return (
    <ClientGate>
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

      <div className="flex flex-col md:flex-row h-[calc(100vh-theme(spacing.16))] md:h-screen overflow-hidden">

        <div className="hidden md:block h-full">
          <CategoryList
            categories={apiCategories}
            onCategoryChange={setActiveCategoryId}
            onEditCategory={handleOpenEditCategory}
            onQuickAdd={handleQuickAddCategory}
            loading={loadingCategories}
            error={error}
          />
        </div>

        <main className="flex-1 flex flex-col bg-background overflow-hidden">
          <div className="py-3 px-4 md:py-4 md:px-6 border-b border-border bg-card shadow-sm md:shadow-none flex flex-col gap-3">
            {/* First row: Search and Actions */}
            <div className="flex flex-col gap-3">
              {/* Row 1: Search and Add Item */}
              <div className="flex flex-row items-center gap-2 md:gap-4 relative">
                <div className={cn("relative flex-1 md:max-w-md transition-all duration-300", isMobileSearchActive && "flex-auto")}>
                   <Textarea 
                    ref={magicSearchRef}
                    placeholder={selectedCategory ? `Search ${decodeHtmlEntities(selectedCategory.name)} items` : "Search Items"}
                    className={cn(
                      "min-h-[40px] h-10 py-2.5 pl-5 rounded-3xl border-muted-foreground/20 bg-background focus:outline-none focus-visible:ring-0 transition-all shadow-sm resize-none overflow-hidden",
                      (searchTerm.includes('\n') || isMobileSearchActive) ? "pr-5" : "pr-12",
                      isMobileSearchActive ? "border-black focus:border-black" : "focus:border-primary"
                    )}
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      if (window.innerWidth < 768) {
                        setIsMobileSearchActive(true);
                      }
                    }}
                  />
                  {!searchTerm.includes('\n') && !isMobileSearchActive && (
                    <div 
                      onClick={() => magicSearchRef.current?.focus()}
                      className="absolute right-1 top-1 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      <Search className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {isMobileSearchActive && (
                  <button 
                    onClick={() => {
                      if (currentMenuItems.length === 0) {
                        handleOpenAddItem();
                      } else {
                        setSearchTerm('');
                        setIsMobileSearchActive(false);
                        magicSearchRef.current?.blur();
                      }
                    }}
                    className="md:hidden text-sm font-bold text-foreground px-1 py-2 whitespace-nowrap active:opacity-70 transition-opacity"
                  >
                    {currentMenuItems.length === 0 ? "Add Item" : "Cancel"}
                  </button>
                )}

                {/* Desktop Spacer to push buttons to right */}
                <div className="hidden md:block flex-1" />

                {/* Desktop Buttons (Always Row 1 on Desktop) */}
                <div className={cn("hidden md:flex flex-row items-center gap-2 shrink-0 ml-auto", isMobileSearchActive && "hidden")}>
                  <Button
                    ref={previewButtonRef}
                    onClick={handlePreviewAndSave}
                    disabled={selectedCount === 0}
                    className={cn(
                      "h-10 p-0 text-sm overflow-hidden rounded-full shadow-sm",
                      selectedCount > 0 && "animate-glow"
                    )}
                    variant="default"
                  >
                    <div className="flex items-stretch h-full">
                      <div className="hidden lg:flex bg-black text-white px-4 items-center transition-colors hover:bg-gray-800">
                        {clientUser?.businessName ? (
                          <Typewriter words={[clientUser.businessName, clientUser.type.charAt(0).toUpperCase() + clientUser.type.slice(1)]} />
                        ) : (
                          <span>Your Menu</span>
                        )}
                      </div>
                      <div className="bg-primary text-primary-foreground px-4 flex-grow flex items-center justify-center transition-colors hover:bg-primary/90">
                        <span>MagicTab ({selectedCount})</span>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="text-sm h-10 px-4 rounded-full border-muted-foreground/20" onClick={handleOpenAddItem}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>Add Item</span>
                  </Button>
                </div>

                {/* Mobile Add Item Button (Row 1 on Mobile) */}
                <div className={cn("md:hidden shrink-0", isMobileSearchActive && "hidden")}>
                  <Button variant="outline" className="text-xs font-bold h-10 px-3 rounded-full border-muted-foreground/20 bg-white shadow-sm" onClick={handleOpenAddItem}>
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    <span>Add Item</span>
                  </Button>
                </div>
              </div>

              {/* Row 2: Category Selector & MagicTab (Mobile only) */}
              <div className={cn("md:hidden flex flex-row items-center gap-2", isMobileSearchActive && "hidden")}>
                <div className="flex-1 h-10">
                  <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-full w-full bg-muted/50 hover:bg-muted text-xs font-bold rounded-full px-4 flex items-center justify-between gap-2 border border-border/50"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          {selectedCategory ? (
                            <span className="flex items-center gap-1.5 font-bold">
                              <span className="text-base leading-none">{selectedCategory.icon}</span>
                              <span className="truncate">{decodeHtmlEntities(selectedCategory.name)}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Folder className="h-3.5 w-3.5" />
                              <span>Category</span>
                            </span>
                          )}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="p-0 gap-0 rounded-t-2xl overflow-hidden border-0 shadow-2xl flex flex-col h-[94vh] [&>button]:hidden">
                      <div className="flex justify-center pt-3 pb-2">
                        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                      </div>
                      <div className="px-6 py-4 flex flex-col gap-4 flex-grow overflow-hidden">
                        <SheetHeader className="text-left space-y-0">
                          <div className="flex items-center justify-between">
                            <SheetTitle className="text-lg font-bold text-foreground">Select Category</SheetTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsCategorySheetOpen(false)} className="rounded-full h-8 w-8">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </SheetHeader>
                        
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search category..." 
                            className="pl-10 h-11 rounded-full bg-muted/30 border-none focus-visible:ring-orange-400"
                            value={categorySearchTerm}
                            onChange={(e) => setCategorySearchTerm(e.target.value)}
                          />
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col -mx-2">
                          <ScrollArea className="flex-1 w-full">
                            <div className="px-2 pb-10 space-y-1">
                              {categorySearchTerm.trim() && !apiCategories.some(cat => decodeHtmlEntities(cat.name).toLowerCase() === categorySearchTerm.trim().toLowerCase()) && (
                                <div className="pt-2">
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-start h-12 rounded-xl border-dashed border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 gap-3 px-4"
                                    onClick={() => {
                                      handleQuickAddCategory(categorySearchTerm);
                                      setIsCategorySheetOpen(false);
                                      setCategorySearchTerm('');
                                    }}
                                  >
                                    <PlusCircle className="h-5 w-5 shrink-0" />
                                    <span className="font-semibold truncate">Create "{categorySearchTerm}"</span>
                                  </Button>
                                </div>
                              )}

                              {apiCategories
                                .filter(cat => decodeHtmlEntities(cat.name).toLowerCase().includes(categorySearchTerm.toLowerCase()))
                                .sort((a,b) => a.name.localeCompare(b.name))
                                .map(cat => (
                                  <Button
                                    key={cat.id}
                                    variant={activeCategoryId === cat.id ? "secondary" : "ghost"}
                                    className={cn(
                                      "w-full justify-start h-12 rounded-xl px-4 gap-3 transition-all",
                                      activeCategoryId === cat.id ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "hover:bg-muted/50 active:scale-[0.98]"
                                    )}
                                    onClick={() => {
                                      setActiveCategoryId(cat.id);
                                      setIsCategorySheetOpen(false);
                                      setCategorySearchTerm('');
                                    }}
                                  >
                                    <span className="text-xl flex-shrink-0">{cat.icon}</span>
                                    <span className="font-semibold">{decodeHtmlEntities(cat.name)}</span>
                                    {activeCategoryId === cat.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
                                  </Button>
                                ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <Button
                  onClick={handlePreviewAndSave}
                  disabled={selectedCount === 0}
                  className={cn(
                    "h-10 px-4 text-xs font-bold rounded-full shadow-sm bg-primary text-primary-foreground flex-1 transition-all active:scale-95",
                    selectedCount > 0 ? "opacity-100" : "opacity-50"
                  )}
                >
                  MagicTab ({selectedCount})
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4 sm:p-6 bg-[#fafafa]/50">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-24 w-full rounded-xl" />)}</div>
            ) : error ? (
              <div className="text-center py-10"><p className="text-destructive font-medium">Error: {error}</p></div>
            ) : (
              <div className={cn("grid grid-cols-1 gap-3 md:gap-4", gridLayoutClasses)}>
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
                {currentMenuItems.length === 0 && (
                  <div className="text-center py-20 col-span-full">
                    <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-border">
                        <Search className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">No items found here.</p>
                  </div>
                )}
              </div>
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
        clientUser={clientUser}
      />
    </>
    </ClientGate>
  );
}
