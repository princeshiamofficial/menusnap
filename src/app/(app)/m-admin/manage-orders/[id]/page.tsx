
'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  FileText as FileTextIcon,
  AlertTriangle,
  Share2,
  Edit3,
  Save,
  Plus,
  X,
  PlusCircle,
  Undo2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Edit,
  FileArchive,
} from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Reorder } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateMenuDocx } from '@/lib/docx-generator';
import { saveAs } from 'file-saver';
import type { MenuItem, Category } from '@/components/menu/menu-preview-dialog';


type OrderStatus = "Pending" | "Processing" | "In Progress" | "Shipped" | "Delivered" | "Cancelled" | "Refunded" | "On Hold" | "Out for Delivery";

const ALL_ORDER_STATUSES: OrderStatus[] = ["Pending", "Processing", "In Progress", "Shipped", "Delivered", "Cancelled", "Refunded", "On Hold", "Out for Delivery"];

interface SubItem {
  id?: string;
  name: string;
  price?: number;
}
interface OrderItemDetail {
    id: string;
    name: string;
    quantity: number;
    price: number;
    categoryId: string;
    categoryName?: string;
    description?: string | null;
    subItems?: SubItem[];
}

interface CustomerData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    restaurant?: string;
    role?: string;
    bio?: string;
}

interface TemplateData {
    name?: string;
    imageUrl?: string;
    description?: string;
    tags?: string[];
}

interface ApiOrder {
    id: string;
    orderId: string;
    orderDate: string;
    status: OrderStatus;
    customer?: CustomerData;
    template?: TemplateData;
    totalAmount?: number;
    items?: OrderItemDetail[];
}

const EditableField = ({ value, onSave, placeholder = "Click to edit", multiline = false, className = '', inputClassName = '' }: { value?: string | number | null, onSave: (newValue: string) => void, placeholder?: string, multiline?: boolean, className?: string, inputClassName?: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(String(value || ''));
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentValue(String(value || ''));
    }, [value]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (String(value || '') !== currentValue) {
            onSave(currentValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            handleSave();
            e.preventDefault();
        } else if (e.key === 'Escape') {
            setCurrentValue(String(value || ''));
            setIsEditing(false);
        }
    };

    if (isEditing) {
        const commonProps = {
            ref: inputRef as any,
            value: currentValue,
            onChange: (e: React.ChangeEvent<any>) => setCurrentValue(e.target.value),
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            className: cn(
                "bg-yellow-100/50 dark:bg-yellow-900/50 border-primary ring-primary focus-visible:ring-primary p-1 -m-1 rounded-md transition-all",
                inputClassName
            ),
        };

        return multiline ? (
            <Textarea {...commonProps} rows={2} />
        ) : (
            <Input {...commonProps} type={typeof value === 'number' ? 'number' : 'text'} />
        );
    }
    
    return (
        <div 
            onClick={() => setIsEditing(true)} 
            className={cn("hover:bg-primary/10 p-1 -m-1 rounded-md cursor-pointer group relative min-h-[24px]", className)}
            role="button"
            tabIndex={0}
            onFocus={() => setIsEditing(true)}
        >
            {value || <span className="text-muted-foreground italic">{placeholder}</span>}
            <Edit3 className="h-3 w-3 text-muted-foreground absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};

// --- Add/Edit Item Form ---
const menuItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  description: z.string().optional().nullable(),
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
  initialData?: Partial<OrderItemDetail> | null;
  categoryName?: string;
}

function MenuItemForm({ isOpen, onOpenChange, onSubmit, initialData, categoryName }: MenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subItems",
  });

  const [newSubItemName, setNewSubItemName] = useState('');
  const [newSubItemPrice, setNewSubItemPrice] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: decodeHtmlEntities(initialData?.name) || "",
        price: initialData?.price || 0,
        description: decodeHtmlEntities(initialData?.description) || "",
        subItems: initialData?.subItems?.map(si => ({...si, name: decodeHtmlEntities(si.name) || "" })) || [],
      });
    }
  }, [isOpen, initialData, form]);

  const handleAddSubItemClick = () => {
    form.clearErrors("subItems.root");
    const nameVal = newSubItemName.trim();
    if (!nameVal) {
      form.setError("subItems.root", { type: "manual", message: "Variation name cannot be empty." });
      return;
    }
    const priceVal = newSubItemPrice ? parseFloat(newSubItemPrice) : undefined;
    append({ name: nameVal, price: priceVal });
    setNewSubItemName('');
    setNewSubItemPrice('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col h-[80vh] max-h-[750px] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {initialData ? `Edit "${decodeHtmlEntities(initialData.name)}"` : `Add New Item to "${categoryName}"`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <ScrollArea className="flex-grow p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="item-name">Item Name</Label>
                <Input id="item-name" {...form.register("name")} placeholder="Enter item name" />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="item-price">Base Price</Label>
                <Input id="item-price" type="number" {...form.register("price")} placeholder="Enter base price" step="0.01"/>
                {form.formState.errors.price && <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="item-description">Description</Label>
                <Textarea id="item-description" {...form.register("description")} placeholder="Item description (optional)"/>
              </div>
              <div className="pt-4">
                <Label className="font-semibold">Variations / Sizes</Label>
                <div className="mt-2 flex items-start gap-2">
                  <Input placeholder="Variation name" value={newSubItemName} onChange={e => setNewSubItemName(e.target.value)} className="flex-grow"/>
                  <Input placeholder="Price (optional)" type="number" value={newSubItemPrice} onChange={e => setNewSubItemPrice(e.target.value)} className="w-32"/>
                  <Button type="button" variant="outline" size="icon" onClick={handleAddSubItemClick}><Plus className="h-4 w-4"/></Button>
                </div>
                {form.formState.errors.subItems?.root && <p className="text-sm text-destructive mt-1">{form.formState.errors.subItems.root.message}</p>}
              </div>
              {fields.length > 0 && (
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input {...form.register(`subItems.${index}.name`)} className="flex-grow"/>
                      <Input {...form.register(`subItems.${index}.price`)} type="number" className="w-32"/>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4"/></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter className="px-6 py-4 border-t mt-auto">
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// --- End Form ---


export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAdminLoggedIn, adminLoading } = useAdminAuth();
    const orderIdFromUrl = params.id as string;
    
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [originalOrder, setOriginalOrder] = useState<ApiOrder | null>(null);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({});
    
    // State for the item form dialog
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<OrderItemDetail | null>(null);
    const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(null);
    
    const { toast } = useToast();

    const fetchOrderAndCategoryDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [ordersResponse, restaurantCategoriesResponse, parlourCategoriesResponse] = await Promise.all([
                fetch('https://colorhutbd.xyz/vm/api/orders.php', { headers: { 'Accept': 'application/json' } }),
                fetch('https://colorhutbd.xyz/vm/api/categories.php', { headers: { 'Accept': 'application/json' } }),
                fetch('https://colorhutbd.xyz/vm/api/parlour-categories.php', { headers: { 'Accept': 'application/json' } })
            ]);
            
            // Process all categories first
            const combinedCategories: any[] = [];
            if (restaurantCategoriesResponse.ok) {
                const resCatResult = await restaurantCategoriesResponse.json();
                if (resCatResult.success && Array.isArray(resCatResult.data.categories)) {
                    combinedCategories.push(...resCatResult.data.categories);
                }
            }
            if (parlourCategoriesResponse.ok) {
                const parCatResult = await parlourCategoriesResponse.json();
                if (parCatResult.success && Array.isArray(parCatResult.data.categories)) {
                    combinedCategories.push(...parCatResult.data.categories);
                }
            }
            setAllCategories(combinedCategories);

            // Process orders
            if (!ordersResponse.ok) throw new Error(`API error! status: ${ordersResponse.status}`);
            const result = await ordersResponse.json();

            let rawOrdersArray: any[] = [];
            if (result.success) {
                if (result.data && Array.isArray(result.data.orders)) {
                    rawOrdersArray = result.data.orders;
                } else if (Array.isArray(result.data)) {
                    rawOrdersArray = result.data;
                } else {
                    throw new Error('Invalid data format from API for orders.');
                }
            } else {
                throw new Error(result.message || 'API request for orders was not successful.');
            }
            
            const orderData = rawOrdersArray.find(o => String(o.id) === orderIdFromUrl);

            if (orderData) {
                const formattedOrder: ApiOrder = {
                    id: String(orderData.id),
                    orderId: String(orderData.orderId || orderData.id),
                    orderDate: String(orderData.orderDate || orderData.createdAt || orderData.date || new Date().toISOString()),
                    status: ALL_ORDER_STATUSES.includes(orderData.status) ? orderData.status : "Pending",
                    customer: orderData.customer,
                    template: orderData.template,
                    totalAmount: parseFloat(orderData.totalAmount || orderData.total || 0),
                    items: (orderData.items || []).map((item: any, index: number): OrderItemDetail => ({
                        id: String(item.id || `custom-item-${Date.now()}-${index}`),
                        name: String(item.name || 'Untitled Item'),
                        quantity: Number(item.quantity || 1),
                        price: Number(item.price || 0),
                        categoryId: String(item.categoryId || item.category || 'uncategorized'),
                        categoryName: item.categoryName,
                        description: item.description || null,
                        subItems: Array.isArray(item.subItems) ? item.subItems : [],
                    })),
                };
                setOrder(formattedOrder);
                setOriginalOrder(JSON.parse(JSON.stringify(formattedOrder))); // Deep copy for resetting
                setIsDirty(false);
            } else {
                setError(`Order with ID ${orderIdFromUrl} not found.`);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to load order details.');
        } finally {
            setIsLoading(false);
        }
    }, [orderIdFromUrl]);

    useEffect(() => {
        if (!isAdminLoggedIn || !orderIdFromUrl) {
            if (!adminLoading) setIsLoading(false);
            return;
        }
        fetchOrderAndCategoryDetails();
    }, [orderIdFromUrl, isAdminLoggedIn, adminLoading, fetchOrderAndCategoryDetails]);

    const handleOrderUpdate = (updatedOrder: ApiOrder, markDirty = true) => {
        setOrder(updatedOrder);
        if (markDirty) setIsDirty(true);
    };

    const handleSaveChanges = async () => {
        if (!order) return;
        try {
            const response = await fetch('https://colorhutbd.xyz/vm/api/orders.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(order),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to save order changes.");
            }
            toast({ title: "Success", description: "Order updated successfully." });
            setOriginalOrder(JSON.parse(JSON.stringify(order))); // Update original to new saved state
            setIsDirty(false);
        } catch (e: any) {
            toast({ title: "Save Error", description: e.message, variant: "destructive" });
        }
    };
    
    const handleDiscardChanges = () => {
        setOrder(originalOrder);
        setIsDirty(false);
        toast({ title: "Changes Discarded", description: "Your edits have been reverted." });
    };

    const handleShare = () => {
        if (!order) {
            toast({ title: "Error", description: "Cannot share. Order details not loaded yet.", variant: "destructive" });
            return;
        }
        const shareUrl = `${window.location.origin}/share/${order.id}`;
        
        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text).then(() => {
                toast({ title: "Link Copied!", description: "A shareable link is now on your clipboard." });
            }).catch(err => {
                console.error('Failed to copy link: ', err);
                toast({ title: "Copy Failed", description: "Could not copy the link to your clipboard.", variant: "destructive" });
            });
        };

        if (navigator.share) {
            navigator.share({
                title: `Order for ${order.customer?.restaurant || 'a client'}`,
                text: `View the details for order #${order.orderId}`,
                url: shareUrl,
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                    copyToClipboard(shareUrl);
                }
            });
        } else {
            copyToClipboard(shareUrl);
        }
    };
    
    const handleDownloadDocx = async () => {
        if (!order || !order.items) {
            toast({ title: "Error", description: "Order data is not available.", variant: "destructive" });
            return;
        }
        toast({ title: "Generating Document...", description: "Please wait, your DOCX file is being prepared." });

        try {
            const menuItemsForDocx: MenuItem[] = order.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.categoryId,
                description: item.description || undefined,
                subItems: item.subItems?.map(si => ({ ...si, id: si.id || si.name, price: si.price || 0 })),
            }));
            
            const reorderedCategoriesForDocx: Category[] = categoriesForRender.map(c => {
                const fullCategory = allCategories.find(ac => String(ac.id) === c.id);
                return {
                    id: c.id,
                    name: c.name,
                    icon: fullCategory?.icon || '📁'
                };
            });

            const blob = await generateMenuDocx(menuItemsForDocx, reorderedCategoriesForDocx, order.customer?.restaurant || "Menu Selection");
            saveAs(blob, `${order.customer?.restaurant || 'menu'}_${order.orderId}.docx`);

        } catch (error) {
            console.error("Failed to generate DOCX file:", error);
            toast({ title: "Generation Failed", description: "Could not create the document.", variant: "destructive" });
        }
    };

    const categoriesForRender = useMemo(() => {
        if (!order?.items) return [];
        const categoryMap = new Map<string, {name: string, items: OrderItemDetail[]}>();
        // Use a stable order of category IDs based on their first appearance in the items array
        const orderedCategoryIds = [...new Map(order.items.map(item => [item.categoryId, item])).keys()];
        
        order.items.forEach(item => {
            const catId = item.categoryId;
            if (!categoryMap.has(catId)) {
                categoryMap.set(catId, { name: decodeHtmlEntities(item.categoryName) || 'Uncategorized', items: [] });
            }
            categoryMap.get(catId)!.items.push(item);
        });
        
        return orderedCategoryIds.map(id => {
            const data = categoryMap.get(id)!;
            return { id, ...data };
        });
    }, [order?.items]);

    const handleCategoryNameChange = (categoryId: string, newName: string) => {
        if (!order) return;
        const newItems = order.items?.map(item => item.categoryId === categoryId ? { ...item, categoryName: newName } : item);
        handleOrderUpdate({ ...order, items: newItems });
    };

    const handleRemoveItem = (itemId: string) => {
        if (!order) return;
        const updatedItems = order.items?.filter(item => item.id !== itemId);
        handleOrderUpdate({ ...order, items: updatedItems });
    };

    const handleAddCategory = () => {
        if (!order) return;
        const newCategoryId = `custom-cat-${Date.now()}`;
        const newItem: OrderItemDetail = {
            id: `custom-item-${Date.now()}`,
            name: 'New Item',
            price: 0,
            quantity: 1,
            categoryId: newCategoryId,
            categoryName: 'New Category',
            description: '',
            subItems: []
        };
        const updatedItems = [...(order.items || []), newItem];
        handleOrderUpdate({ ...order, items: updatedItems });
    };

    const handleRemoveCategory = (categoryId: string) => {
        if (!order) return;
        const updatedItems = order.items?.filter(item => item.categoryId !== categoryId);
        handleOrderUpdate({ ...order, items: updatedItems });
    };
    
    const handleCategoryReorder = (reorderedCategories: { id: string; name: string; items: OrderItemDetail[] }[]) => {
      if (!order || !order.items) return;
      const newMasterItemsList = reorderedCategories.flatMap(cat => cat.items);
      handleOrderUpdate({ ...order, items: newMasterItemsList });
    };
    
    const handleItemReorder = (categoryId: string, reorderedItemsForCategory: OrderItemDetail[]) => {
        if (!order || !order.items) return;
        const otherItems = order.items.filter(item => item.categoryId !== categoryId);
        const categoryOrder = categoriesForRender.map(c => c.id);
        const newMasterItemsList: OrderItemDetail[] = [];
        
        categoryOrder.forEach(catId => {
          if (catId === categoryId) {
            newMasterItemsList.push(...reorderedItemsForCategory);
          } else {
            newMasterItemsList.push(...order.items!.filter(item => item.categoryId === catId));
          }
        });

        handleOrderUpdate({ ...order, items: newMasterItemsList });
    };

    const handleToggleSubItems = (itemId: string) => {
        setExpandedSubItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const handleOpenEditDialog = (item: OrderItemDetail) => {
      setEditingItem(item);
      setAddingToCategoryId(null);
      setIsFormOpen(true);
    };

    const handleOpenAddDialog = (categoryId: string) => {
      setEditingItem(null);
      setAddingToCategoryId(categoryId);
      setIsFormOpen(true);
    };

    const handleFormSubmit = (data: MenuItemFormValues) => {
        if (!order) return;

        if (editingItem) {
            const updatedItems = order.items?.map(item =>
                item.id === editingItem.id ? { ...item, ...data } : item
            );
            handleOrderUpdate({ ...order, items: updatedItems });
            toast({ title: "Item Updated" });
        } else if (addingToCategoryId) {
            const category = categoriesForRender.find(c => c.id === addingToCategoryId);
            const newItem: OrderItemDetail = {
                id: `custom-item-${Date.now()}`,
                ...data,
                quantity: 1,
                categoryId: addingToCategoryId,
                categoryName: category?.name || 'New Category',
            };
            handleOrderUpdate({ ...order, items: [...(order.items || []), newItem] });
            toast({ title: "Item Added" });
        }
        setIsFormOpen(false);
        setEditingItem(null);
        setAddingToCategoryId(null);
    };


    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
          const date = parseISO(dateString);
          return isValidDate(date) ? format(date, "MMM d, yyyy, h:mm a") : "Invalid Date";
        } catch { return "Invalid Date"; }
    };
    

    if (adminLoading || isLoading) {
        return (
            <div className="bg-muted min-h-screen flex flex-col">
                <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
                    <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-9 w-24" />
                            <div className="space-y-1">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                </header>
                <div className="flex-grow p-4 sm:p-6 lg:p-8">
                    <main className="max-w-5xl mx-auto bg-card p-8 sm:p-12 shadow-lg rounded-lg border border-border/50">
                        <div className="flex justify-between items-start border-b pb-8 mb-8">
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-64" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <div className="space-y-2 text-right">
                                <Skeleton className="h-5 w-56" />
                            </div>
                        </div>
                        <div className="mt-10 mb-6">
                            <Skeleton className="h-10 w-48" />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    if (!isAdminLoggedIn) return <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8"><AdminLoginForm /></div>;
    if (error) return <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center"><AlertTriangle className="h-12 w-12 text-destructive mb-4" /><h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Order</h2><p className="text-muted-foreground max-w-md">{error}</p><Button variant="outline" onClick={() => router.back()} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button></div>;
    if (!order) return <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center"><FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" /><h2 className="text-xl font-semibold mb-2">Order Not Found</h2><p className="text-muted-foreground max-w-md">The requested order could not be found.</p><Button variant="outline" onClick={() => router.push('/m-admin/manage-orders')} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" /> Go to Order History</Button></div>;

    return (
        <>
        <div className="bg-muted min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
                <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.push('/m-admin/manage-orders')}>
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">Orders</span>
                        </Button>
                        <div className="h-6 border-l border-border"></div>
                        <div className="flex flex-col">
                             <EditableField
                                value={order.customer?.restaurant}
                                onSave={(val) => handleOrderUpdate({ ...order, customer: { ...order.customer, restaurant: val } })}
                                placeholder="Business Name"
                                className="text-lg font-semibold text-foreground"
                                inputClassName="text-lg font-semibold"
                            />
                            <p className="text-xs text-muted-foreground">Order ID: {order.orderId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <AnimatePresence>
                            {isDirty && (
                                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                                    <Button size="sm" variant="ghost" onClick={handleDiscardChanges} className="text-muted-foreground">Discard</Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                         <AnimatePresence>
                            {isDirty && (
                                <motion.p 
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                    className="text-xs text-yellow-600 hidden lg:block"
                                >
                                    Unsaved changes
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <Button size="sm" onClick={handleSaveChanges} disabled={!isDirty}>
                            <Save className="h-4 w-4 sm:mr-2"/>
                            <span className="hidden sm:inline">Save</span>
                        </Button>
                         <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                            <FileArchive className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-grow p-4 sm:p-6 lg:p-8">
                <main className="max-w-5xl mx-auto bg-card text-card-foreground p-8 sm:p-12 shadow-lg rounded-lg border border-border/50">
                    <div className="flex justify-between items-start border-b pb-8 mb-4 border-border">
                         <div>
                             <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight uppercase text-foreground">
                                {decodeHtmlEntities(order.customer?.restaurant) || "Order"}
                            </h1>
                             <p className="font-bold text-lg text-muted-foreground mt-2">Order ID: {order.orderId}</p>
                        </div>
                        <div className="text-right text-muted-foreground text-sm space-y-1">
                            <p className="flex items-center justify-end gap-2"><CalendarDays className="h-4 w-4" />{formatDate(order.orderDate)}</p>
                        </div>
                    </div>
                    
                    <section>
                         <div
                            className="inline-block relative mb-6 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-white"
                            style={{ backgroundImage: 'url("https://erp.colorhutbd.xyz/file/uploads/68538749e7a83_brush-stroke-banner-6.png")', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', color: '#ffffff' }}
                        >
                            Order Summary
                        </div>

                         <Reorder.Group as="div" axis="y" values={categoriesForRender} onReorder={handleCategoryReorder}>
                        {categoriesForRender.map((category) => (
                          <Reorder.Item as="div" key={category.id} value={category}>
                            <div className="mb-8 group/category">
                                <div className="flex items-center gap-2 mb-4 border-b-2 border-primary/20 pb-2">
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab"/>
                                    <EditableField
                                        value={category.name}
                                        onSave={(val) => handleCategoryNameChange(category.id, val)}
                                        placeholder="Category Name"
                                        className="text-xl font-semibold text-primary"
                                        inputClassName="text-xl font-semibold"
                                    />
                                    <Badge variant="secondary">{category.items.length}</Badge>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover/category:opacity-100" onClick={() => handleRemoveCategory(category.id)}><X className="h-4 w-4"/></Button>
                                    <Button variant="outline" size="sm" className="ml-auto h-7" onClick={() => handleOpenAddDialog(category.id)}><PlusCircle className="h-4 w-4 mr-2" /> Add Item</Button>
                                </div>
                                
                                <Reorder.Group as="div" axis="y" values={category.items} onReorder={(newOrder) => handleItemReorder(category.id, newOrder)} className="space-y-3">
                                    <AnimatePresence>
                                        {category.items.map((item) => (
                                            <Reorder.Item
                                                as="div"
                                                key={item.id}
                                                value={item}
                                                layout
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                                className="bg-card border p-3 rounded-lg shadow-sm hover:border-primary/50 group/item relative"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab mt-1 shrink-0" />
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <p className="font-bold text-foreground">{decodeHtmlEntities(item.name)}</p>
                                                            <p className="font-bold text-foreground text-right">৳{item.price.toLocaleString()}</p>
                                                        </div>
                                                        {item.description && <p className="text-sm text-muted-foreground mt-1">{decodeHtmlEntities(item.description)}</p>}
                                                        
                                                        {item.subItems && item.subItems.length > 0 && (
                                                            <>
                                                                <Button variant="link" size="sm" onClick={() => handleToggleSubItems(item.id)} className="text-xs h-auto p-1 text-primary -ml-1 mt-2">
                                                                    {expandedSubItems[item.id] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                                                                    Variations
                                                                </Button>
                                                                {expandedSubItems[item.id] && (
                                                                    <div className="mt-2 space-y-2 border-l-2 border-muted/50 pl-3">
                                                                        {item.subItems?.map((subItem, index) => (
                                                                            <div key={subItem.id || index} className="flex justify-between items-center text-sm">
                                                                                <p className="text-muted-foreground">- {decodeHtmlEntities(subItem.name)}</p>
                                                                                <p className="text-muted-foreground">৳{subItem.price?.toLocaleString()}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                     <div className="flex flex-col gap-1 shrink-0">
                                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(item)}><Edit className="h-4 w-4"/></Button>
                                                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleRemoveItem(item.id)}><X className="h-4 w-4"/></Button>
                                                    </div>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </AnimatePresence>
                                </Reorder.Group>
                            </div>
                           </Reorder.Item>
                        ))}
                        </Reorder.Group>

                        <Button variant="ghost" onClick={handleAddCategory} className="rounded-full bg-muted hover:bg-muted/80 text-muted-foreground mt-4">
                           <Plus className="mr-2 h-4 w-4"/>Add Category
                        </Button>
                    </section>
                </main>
            </div>
        </div>
        <MenuItemForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={handleFormSubmit}
            initialData={editingItem}
            categoryName={
                editingItem
                    ? categoriesForRender.find(c => c.id === editingItem.categoryId)?.name
                    : categoriesForRender.find(c => c.id === addingToCategoryId)?.name
            }
        />
        </>
    )
}
