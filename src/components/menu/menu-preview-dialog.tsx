
"use client";

import React, { useState, useMemo, useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Reorder } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { X, ChevronLeft, ShoppingCart, FileText, GripVertical } from 'lucide-react';
import { CustomerDetailsForm, type CustomerDetailsFormValues } from './customer-details-form';
import { useToast } from "@/hooks/use-toast";
import type { ClientUser } from '@/hooks/use-client-auth';
import { submitOrderToMySql } from '@/app/actions/orders';


// Interfaces matching MenuItemsPage for consistency
export interface Category {
  id: string;
  originalId?: string;
  name: string;
  icon: string;
  itemCount?: number;
}

export interface SubMenuItem {
  id?: string;
  originalId?: string;
  name: string;
  price?: number;
}

export interface MenuItem {
  id: string;
  originalId?: string;
  name: string;
  price: number;
  category: string; // Category ID
  originalCategoryId?: string;
  description?: string | null;
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
  selectedMenuType: string;
  clientUser: ClientUser | null;
}

const STATIC_ITEM_IMAGE_URL = 'https://colorhutbd.xyz/image.svg';

export function MenuPreviewDialog({
  isOpen,
  onOpenChange,
  selectedItems,
  allCategories,
  onRemoveItem,
  selectedMenuType,
  clientUser,
}: MenuPreviewDialogProps): ReactNode {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const derivedDisplayedCategories = useMemo(() => {
    const categoryIdsInSelection = new Set(selectedItems.map(item => item.category));
    return allCategories
      .filter(cat => categoryIdsInSelection.has(cat.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedItems, allCategories]);

  const [orderedDialogCategories, setOrderedDialogCategories] = useState<Category[]>(derivedDisplayedCategories);

  useEffect(() => {
    const derivedCategoryIds = new Set(derivedDisplayedCategories.map(c => c.id));
    const currentOrderedCategoryIds = new Set(orderedDialogCategories.map(c => c.id));

    // Check if the set of IDs has changed or if data within nodes has changed
    const needsReset = derivedCategoryIds.size !== currentOrderedCategoryIds.size || 
                      ![...derivedCategoryIds].every(id => currentOrderedCategoryIds.has(id));

    if (needsReset) {
      setOrderedDialogCategories(derivedDisplayedCategories);
    } else {
      // Even if IDs are the same, some names/icons might have changed. Sync data but keep order.
      setOrderedDialogCategories(currentOrder => {
        const nextOrder = currentOrder.map(cat => 
          derivedDisplayedCategories.find(d => d.id === cat.id) || cat
        );
        // Only trigger update if data actually changed
        const isDifferent = nextOrder.some((cat, i) => cat !== currentOrder[i]);
        if (!isDifferent) return currentOrder;
        return nextOrder;
      });
    }
  }, [derivedDisplayedCategories, orderedDialogCategories]);


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

  // Per-category ordered item lists (for drag-to-reorder within each category)
  const [orderedItemsByCategory, setOrderedItemsByCategory] = useState<Record<string, MenuItem[]>>({});

  useEffect(() => {
    setOrderedItemsByCategory(prev => {
      const next: Record<string, MenuItem[]> = {};
      const grouped = itemsGroupedByCategory;
      for (const catId of Object.keys(grouped)) {
        const incoming = grouped[catId];
        const existing = prev[catId] || [];
        // Keep existing order, add new items at the end, remove missing ones
        const existingIds = new Set(existing.map(i => i.id));
        const incomingIds = new Set(incoming.map(i => i.id));
        const reordered = existing
          .filter(i => incomingIds.has(i.id))
          .map(i => incoming.find(newI => newI.id === i.id) || i); // Use the fresh data object while keeping the old order

        const added = incoming.filter(i => !existingIds.has(i.id));
        next[catId] = [...reordered, ...added];
      }
      return next;
    });
  }, [itemsGroupedByCategory]);

  const categoriesToDisplayInMainPanel = useMemo(() => {
    if (activeCategoryId) {
      return orderedDialogCategories.filter(cat => cat.id === activeCategoryId);
    }
    return orderedDialogCategories;
  }, [activeCategoryId, orderedDialogCategories]);

  const handleCustomerFormSubmit = async (data: CustomerDetailsFormValues) => {
    setIsSubmitting(true);

    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

    let newOrderId;
    if (selectedMenuType === 'restaurant') {
      const random3Digit = Math.floor(100 + Math.random() * 900);
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      newOrderId = `RO-${random3Digit}${day}${month}${year}`;
    } else {
      const random3Digit = Math.floor(100 + Math.random() * 900);
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      newOrderId = `PO-${random3Digit}${day}${month}${year}`;
    }

    const reorderedItemsPayload = orderedDialogCategories.flatMap(category => {
      const itemsInCategory = orderedItemsByCategory[category.id] || itemsGroupedByCategory[category.id] || [];
      return itemsInCategory.map(item => ({
        id: String(item.id),
        name: item.name,
        quantity: 1,
        price: Number(item.price),
        categoryId: String(category.id),
        categoryName: category.name,
        description: item.description || '',
        subItems: Array.isArray(item.subItems) ? item.subItems : [],
      }));
    });

    const orderPayload = {
      id: newOrderId,
      orderId: newOrderId,
      customer: {
        name: data.customerName,
        email: data.email,
        phone: data.phoneNumber,
        address: data.deliveryAddress,
        restaurant: data.businessName,
        role: data.role,
      },
      items: reorderedItemsPayload,
      total: Number(totalAmount),
      totalAmount: Number(totalAmount),
      status: 'Pending',
      orderDate: new Date().toISOString(),
      template: {
        name: "Custom Menu Selection",
      }
    };

    try {

      
      const result = await submitOrderToMySql(orderPayload);

      
      if (!result.success) {
        toast({
          title: "Order Error",
          description: result.message || "Failed to submit order directly to MySQL.",
          variant: "destructive"
        });
        throw new Error(result.message || "Failed to submit order to local MySQL.");
      }


      // Save order to local storage
      try {
        const existingOrdersRaw = localStorage.getItem('colorHutOrders');
        const existingOrders = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
        existingOrders.unshift(orderPayload);
        localStorage.setItem('colorHutOrders', JSON.stringify(existingOrders));
      } catch (e) {
        console.error("Failed to save order to local storage", e);
      }

      localStorage.setItem('pendingOrderIdForTemplate', newOrderId);
      
      toast({
        title: "Order Submitted Successfully!",
        description: `Your order #${newOrderId} has been placed. Now, please select a template.`,
      });
      setIsCustomerFormOpen(false);
      onOpenChange(false);
      router.push('/templates');

    } catch (error: any) {
      console.error("Error submitting order:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Could not submit your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeCategoryId && !derivedDisplayedCategories.some(cat => cat.id === activeCategoryId)) {
      setActiveCategoryId(null);
    }
    if (isOpen && orderedDialogCategories.length === 0 && activeCategoryId !== null) {
      setActiveCategoryId(null);
    }
  }, [isOpen, activeCategoryId, derivedDisplayedCategories, orderedDialogCategories]);


  const dialogInner = (
    <>
      <div className="relative px-6 pt-6 pb-5 bg-background border-b">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
            <ShoppingCart className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <DialogTitle className="text-lg font-bold leading-tight text-foreground">Menu Preview</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              Review your selected MagicTab items before finalizing.
            </DialogDescription>
          </div>
          <DialogClose className="rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </div>

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
            {orderedDialogCategories.length > 0 && (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm mb-1 h-9 rounded-lg",
                  !activeCategoryId ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-semibold" : "hover:bg-accent",
                  isSidebarCollapsed ? "justify-center px-0" : "px-3"
                )}
                onClick={() => setActiveCategoryId(null)}
                title="All Items"
              >
                <FileText className={cn("h-4 w-4 shrink-0", !activeCategoryId ? "text-orange-600 dark:text-orange-400" : "")} />
                {!isSidebarCollapsed && <span className="ml-2 truncate flex-1 text-left">All Items</span>}
              </Button>
            )}
            <Reorder.Group axis="y" values={orderedDialogCategories} onReorder={setOrderedDialogCategories} className="space-y-1">
              {orderedDialogCategories.map(category => (
                <CategoryReorderItem
                  key={category.id}
                  category={category}
                  isSidebarCollapsed={isSidebarCollapsed}
                  isActive={activeCategoryId === category.id}
                  onClick={() => setActiveCategoryId(category.id)}
                />
              ))}
            </Reorder.Group>
            {orderedDialogCategories.length === 0 && !isSidebarCollapsed && (
              <p className="text-xs text-muted-foreground p-2 text-center">No categories with selected items.</p>
            )}
          </ScrollArea>
        </div>

        {/* Right Content Panel */}
        <ScrollArea className="flex-1 p-6 bg-background">
          {categoriesToDisplayInMainPanel.map(category => {
            const items = orderedItemsByCategory[category.id] || itemsGroupedByCategory[category.id] || [];
            if (items.length === 0) return null;

            return (
              <div key={category.id} className="mb-8">
                <div className="flex items-center mb-4">
                  <span className="text-xl mr-2 text-primary">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground">{decodeHtmlEntities(category.name)}</h3>
                  <Badge variant="secondary" className="ml-2 text-xs">{items.length}</Badge>
                </div>
                <Reorder.Group
                  axis="y"
                  values={items}
                  onReorder={(newOrder) =>
                    setOrderedItemsByCategory(prev => ({ ...prev, [category.id]: newOrder }))
                  }
                  className="space-y-3"
                >
                  {items.map((item) => (
                    <MenuPreviewItemReorderItem
                      key={item.id}
                      item={item}
                      onRemove={() => onRemoveItem(item.id)}
                    />
                  ))}
                </Reorder.Group>
              </div>
            );
          })}
          {selectedItems.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No items selected for preview.</p>
              <p className="text-xs mt-1">Go back to select some items from the MagicTab.</p>
            </div>
          )}
        </ScrollArea>
      </div>

      <DialogFooter className="px-6 py-4 border-t mt-auto bg-background/50">
        <Button
          className={cn(
            "w-full h-11 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200",
            selectedItems.length > 0 && "animate-glow"
          )}
          onClick={() => setIsCustomerFormOpen(true)}
          disabled={selectedItems.length === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" /> Share with Color Hut
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="p-0 gap-0 rounded-t-2xl overflow-hidden border-0 shadow-2xl flex flex-col max-h-[95vh] [&>button]:hidden">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            {dialogInner}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 [&>button]:hidden">
            {dialogInner}
          </DialogContent>
        </Dialog>
      )}

      <CustomerDetailsForm
        isOpen={isCustomerFormOpen}
        onOpenChange={setIsCustomerFormOpen}
        onSubmit={handleCustomerFormSubmit}
        selectedItems={selectedItems}
        isSubmitting={isSubmitting}
        selectedMenuType={selectedMenuType}
        clientUser={clientUser}
      />
    </>
  );
}

/* ── Long Press Reorder Helpers ───────────────────────────────────── */

interface CategoryReorderItemProps {
  category: Category;
  isSidebarCollapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}

function CategoryReorderItem({ category, isSidebarCollapsed, isActive, onClick }: CategoryReorderItemProps) {
  const controls = useDragControls();
  const timer = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (event: React.PointerEvent) => {
    const isTouch = event.pointerType === 'touch';
    if (isTouch) {
      timer.current = setTimeout(() => {
        controls.start(event);
      }, 300);
    }
  };

  const handlePointerUp = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  return (
    <Reorder.Item
      value={category}
      dragControls={controls}
      dragListener={false}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      whileDrag={{ 
        scale: 1.02, 
        backgroundColor: "var(--background)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        zIndex: 50 
      }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "bg-card rounded-lg overflow-hidden transition-colors h-9 flex items-center mb-1 group cursor-default select-none relative",
        isActive ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-semibold shadow-sm" : "hover:bg-accent"
      )}
    >
      <div 
        className={cn(
          "flex-1 h-full flex items-center min-w-0",
          isSidebarCollapsed ? "justify-center" : "px-3"
        )}
        onClick={onClick}
      >
        <span className={cn("text-base w-4 h-4 flex items-center justify-center shrink-0", !isSidebarCollapsed && "mr-2")}>
          {category.icon}
        </span>
        {!isSidebarCollapsed && (
          <span className="truncate flex-1 text-left text-sm">
            {decodeHtmlEntities(category.name)}
          </span>
        )}
      </div>
      
      {!isSidebarCollapsed && (
        <div 
          className="px-3 h-full flex items-center cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          onPointerDown={(e) => {
            e.stopPropagation();
            controls.start(e);
          }}
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
    </Reorder.Item>
  );
}

interface MenuPreviewItemReorderItemProps {
  item: MenuItem;
  onRemove: () => void;
}

function MenuPreviewItemReorderItem({ item, onRemove }: MenuPreviewItemReorderItemProps) {
  const controls = useDragControls();
  const timer = React.useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (event: React.PointerEvent) => {
    const isTouch = event.pointerType === 'touch';
    if (isTouch) {
      timer.current = setTimeout(() => {
        controls.start(event);
      }, 500); // 500ms long-tap threshold
    }
  };

  const handlePointerUp = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  return (
    <Reorder.Item
      value={item}
      dragControls={controls}
      dragListener={false}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      whileDrag={{ 
        scale: 1.01, 
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        backgroundColor: "var(--background)",
        zIndex: 50 
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "flex items-center p-3 border rounded-lg bg-card shadow-sm transition-all border-orange-200/50"
      )}
    >
      <div className="shrink-0 mr-2 p-1 cursor-grab" style={{ touchAction: 'none' }} onPointerDown={(e) => controls.start(e)}>
        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
      </div>
      <Image
        src={STATIC_ITEM_IMAGE_URL}
        alt={decodeHtmlEntities(item.name)}
        width={48}
        height={48}
        className="h-12 w-12 rounded-md object-contain mr-4 bg-muted"
        data-ai-hint="item illustration"
      />
      <div className="flex-1">
        <p className="font-medium text-sm text-foreground">{decodeHtmlEntities(item.name)}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground">{decodeHtmlEntities(item.description)}</p>
        )}
      </div>
      <div className="text-right">
        <p className="font-semibold text-sm text-foreground">৳{item.price.toLocaleString()}</p>
        <Button
          variant="link"
          size="sm"
          className="text-destructive hover:text-destructive/80 h-auto p-0 text-xs"
          onClick={onRemove}
        >
          <X className="h-3 w-3 mr-1" /> Remove
        </Button>
      </div>
    </Reorder.Item>
  );
}

