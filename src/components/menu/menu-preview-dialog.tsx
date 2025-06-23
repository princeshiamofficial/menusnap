
"use client";

import type { ReactNode } from 'react';
import { useState, useMemo, useEffect } from 'react';
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, Send, ShoppingCart, FileText, GripVertical } from 'lucide-react';
import { CustomerDetailsForm, type CustomerDetailsFormValues } from './customer-details-form';
import { useToast } from "@/hooks/use-toast";


// Interfaces matching MenuItemsPage for consistency
interface Category {
  id: string;
  name: string;
  icon: string;
  itemCount?: number;
}

interface SubMenuItem {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
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
  selectedMenuType: string;
}

const STATIC_ITEM_IMAGE_URL = 'https://colorhutbd.xyz/image.svg';

export function MenuPreviewDialog({
  isOpen,
  onOpenChange,
  selectedItems,
  allCategories,
  onRemoveItem,
  selectedMenuType,
}: MenuPreviewDialogProps): ReactNode {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const derivedDisplayedCategories = useMemo(() => {
    const categoryIdsInSelection = new Set(selectedItems.map(item => item.category));
    return allCategories
      .filter(cat => categoryIdsInSelection.has(cat.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedItems, allCategories]);

  const [orderedDialogCategories, setOrderedDialogCategories] = useState<Category[]>(derivedDisplayedCategories);

  useEffect(() => {
    // This effect now correctly handles updates when the derived list changes,
    // preserving user's reordering unless the set of categories itself changes.
    const derivedCategoryIds = new Set(derivedDisplayedCategories.map(c => c.id));
    const currentOrderedCategoryIds = new Set(orderedDialogCategories.map(c => c.id));

    if (derivedCategoryIds.size !== currentOrderedCategoryIds.size || ![...derivedCategoryIds].every(id => currentOrderedCategoryIds.has(id))) {
      setOrderedDialogCategories(derivedDisplayedCategories);
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

  const categoriesToDisplayInMainPanel = useMemo(() => {
    if (activeCategoryId) {
      return orderedDialogCategories.filter(cat => cat.id === activeCategoryId);
    }
    return orderedDialogCategories;
  }, [activeCategoryId, orderedDialogCategories]);

  const handleCustomerFormSubmit = async (data: CustomerDetailsFormValues) => {
    setIsSubmitting(true);

    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const newOrderId = `client-${Date.now()}`;

    // Create the items payload based on the user's sorted category order
    const reorderedItemsPayload = orderedDialogCategories.flatMap(category => {
      const itemsInCategory = itemsGroupedByCategory[category.id] || [];
      return itemsInCategory.map(item => {
        const originalItemId = String(item.id).replace(/^restaurant-|^parlour-/, '');
        const originalCategoryId = String(item.category).replace(/^restaurant-|^parlour-/, '');
        
        return {
          id: originalItemId,
          name: item.name,
          quantity: 1, 
          price: item.price,
          categoryId: originalCategoryId,
          description: item.description || '',
        };
      });
    });

    const orderPayload = {
      id: newOrderId,
      customer: {
        name: data.customerName,
        email: data.email,
        phone: data.phoneNumber,
        address: data.deliveryAddress,
        restaurant: data.companyName, 
        role: data.role,
        userId: 'anonymous'
      },
      items: reorderedItemsPayload,
      total: totalAmount,
      status: 'Pending',
      orderDate: new Date().toISOString(),
      template: { 
          name: "Custom Menu Selection",
      }
    };
    
    try {
      const response = await fetch('https://colorhutbd.xyz/vm/api/orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to submit order. Status: ${response.status}`);
      }

      toast({
        title: "Order Submitted Successfully!",
        description: `Your order #${orderPayload.id} has been placed.`,
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


  return (
    <>
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
              {orderedDialogCategories.length > 0 && (
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
                  <FileText className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="ml-2 truncate flex-1 text-left">All Items</span>}
                </Button>
              )}
                <Reorder.Group axis="y" values={orderedDialogCategories} onReorder={setOrderedDialogCategories} className="space-y-1">
                  {orderedDialogCategories.map(category => (
                    <Reorder.Item key={category.id} value={category} className="bg-card rounded-md">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm mb-0 h-9 flex items-center",
                          activeCategoryId === category.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent",
                          isSidebarCollapsed ? "justify-center px-0" : "px-2"
                        )}
                        onClick={() => setActiveCategoryId(category.id)}
                        title={category.name}
                      >
                        <span className={cn("text-base w-4 h-4 flex items-center justify-center shrink-0", isSidebarCollapsed ? "" : "mr-2")}>{category.icon}</span>
                        {!isSidebarCollapsed && <span className="truncate flex-1 text-left">{category.name}</span>}
                        {!isSidebarCollapsed && <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab ml-1 shrink-0" />}
                      </Button>
                    </Reorder.Item>
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
                const items = itemsGroupedByCategory[category.id] || [];
                if (items.length === 0) return null;

                return (
                  <div key={category.id} className="mb-8">
                    <div className="flex items-center mb-4">
                      <span className="text-xl mr-2 text-primary">{category.icon}</span>
                      <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                      <Badge variant="secondary" className="ml-2 text-xs">{items.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center p-3 border rounded-lg bg-card shadow-sm">
                          <Image
                            src={STATIC_ITEM_IMAGE_URL}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-md object-contain mr-4 bg-muted"
                            data-ai-hint="item illustration"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            )}
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
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No items selected for preview.</p>
                  <p className="text-xs mt-1">Go back to select some items from the menu.</p>
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="px-6 py-4 border-t mt-auto">
            <Button
              variant="secondary"
              className="bg-foreground text-background hover:bg-foreground/90"
              onClick={() => setIsCustomerFormOpen(true)}
              disabled={selectedItems.length === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Share with Color Hut
            </Button>
            <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={selectedItems.length === 0}>
              <Send className="h-4 w-4 mr-2" /> Share with Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomerDetailsForm
        isOpen={isCustomerFormOpen}
        onOpenChange={setIsCustomerFormOpen}
        onSubmit={handleCustomerFormSubmit}
        selectedItems={selectedItems}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
