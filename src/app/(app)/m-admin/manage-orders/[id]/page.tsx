
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CalendarDays,
  FileText as FileTextIcon,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Share2,
  Edit3,
  Save,
  Plus,
  X,
  PlusCircle,
} from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import { saveAs } from 'file-saver';
import { generateMenuDocx } from '@/lib/docx-generator';
import type { MenuItem, Category } from '@/components/menu/menu-preview-dialog';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


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

interface ApiOrder {
    id: string;
    orderId: string;
    orderDate: string;
    status: OrderStatus;
    templateName?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string; 
    businessName?: string; 
    businessRole?: string; 
    bio?: string; 
    totalAmount?: number;
    items?: OrderItemDetail[];
    templateImageUrl?: string;
    templateDescription?: string;
    templateTags?: string[];
}

const menuItemFormSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100, "Name must be 100 characters or less"),
  price: z.coerce.number().min(0, "Price must be a non-negative number. If using variations, this can be 0."),
  description: z.string().max(500, "Description must be 500 characters or less").optional().nullable(),
  subItems: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Variation name is required."),
      price: z.number().nonnegative("Price must be a non-negative number.").optional(),
    })
  ).optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;

interface MenuItemFormProps {
  initialData?: Partial<OrderItemDetail>;
  onSubmit: (data: MenuItemFormValues) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  categoryName?: string; 
}

function MenuItemForm({ initialData, onSubmit, onOpenChange, isEditMode, categoryName }: MenuItemFormProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: decodeHtmlEntities(initialData?.name),
      price: initialData?.price || 0,
      description: decodeHtmlEntities(initialData?.description),
      subItems: initialData?.subItems?.map(si => ({ 
        id: si.id, 
        name: decodeHtmlEntities(si.name), 
        price: si.price
      })) || [],
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
    form.clearErrors("subItems.root"); 
    const nameVal = newSubItemName.trim();
    const priceStr = newSubItemPrice.trim();

    if (!nameVal) {
      form.setError("subItems.root", { type: "manual", message: "Variation name cannot be empty." });
      return;
    }
    
    let priceVal: number | undefined = undefined;
    if (priceStr !== '') {
      const parsedPrice = parseFloat(priceStr);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        form.setError("subItems.root", { type: "manual", message: "Variation price must be a valid non-negative number if provided." });
        return;
      }
      priceVal = parsedPrice;
    }

    append({ name: nameVal, price: priceVal });
    setNewSubItemName('');
    setNewSubItemPrice('');
  };


  const handleSubmit = async (data: MenuItemFormValues) => {
    await onSubmit(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-grow overflow-hidden">
      <DialogHeader className="px-6 py-4 border-b">
         <DialogTitle className="text-xl">
            {isEditMode ? `Edit ${decodeHtmlEntities(initialData?.name) || 'Menu Item'}` : `Add New ${categoryName ? decodeHtmlEntities(categoryName) + ' Item' : 'Menu Item'}`}
        </DialogTitle>
      </DialogHeader>
      <ScrollArea className="flex-grow min-h-0">
        <div className="space-y-4 p-6">
          <div>
            <Label htmlFor="item-name">Item name</Label>
            <Input id="item-name" {...form.register("name")} placeholder="Enter item name" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="item-price">Base Price</Label>
            <Input id="item-price" type="number" {...form.register("price")} placeholder="Enter base price (0 if only variations)" step="0.01"/>
            {form.formState.errors.price && <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>}
          </div>
          <div>
            <Label htmlFor="item-description">Description (optional)</Label>
            <Textarea 
              id="item-description" 
              {...form.register("description")} 
              placeholder="Enter item description" 
              rows={3} 
            />
            {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
          </div>

          <Separator className="my-6" />

          <div>
            <Label className="text-base font-semibold">Item Variations / Sizes (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Add different sizes or variations for this item, like Small, Medium, Large.</p>
            <div className="mt-3 flex items-start gap-2">
              <div className="flex-grow space-y-1">
                <Label htmlFor="new-subitem-name" className="sr-only">Variation Name</Label>
                <Input 
                  id="new-subitem-name"
                  placeholder="Variation name (e.g., Small)"
                  value={newSubItemName}
                  onChange={(e) => setNewSubItemName(e.target.value)}
                />
              </div>
              <div className="w-40 space-y-1">
                <Label htmlFor="new-subitem-price" className="sr-only">Variation Price</Label>
                <Input 
                  id="new-subitem-price"
                  type="number"
                  placeholder="Price (optional)"
                  value={newSubItemPrice}
                  onChange={(e) => setNewSubItemPrice(e.target.value)}
                  step="0.01"
                />
              </div>
              <Button type="button" variant="outline" size="icon" onClick={handleAddSubItemClick} className="mt-0 h-10 w-10 shrink-0" aria-label="Add variation">
                <Plus className="h-5 w-5" />
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

          {fields.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-foreground">Added Variations: {fields.length}</Label>
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="text-destructive hover:text-destructive/80 h-auto p-0 text-xs" 
                  onClick={() => remove()} 
                >
                  Clear All
                </Button>
              </div>
              <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3 max-h-48 overflow-y-auto">
                {fields.map((field, index) => {
                  const currentPrice = form.watch(`subItems.${index}.price`);
                  return (
                    <div key={field.id} className="flex items-center justify-between p-2 rounded-md bg-card shadow-sm">
                      <div className="flex items-center gap-2 flex-grow">
                         <span className="text-sm text-foreground truncate">{form.watch(`subItems.${index}.name`)}</span>
                         {typeof currentPrice === 'number' && (
                           <>
                             <span className="text-xs text-muted-foreground">-</span>
                             <span className="text-sm font-medium text-foreground whitespace-nowrap">
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
                        className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
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
      <DialogFooter className="px-6 py-4 border-t mt-auto">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {form.formState.isSubmitting ? (isEditMode ? "Saving..." : "Adding...") : <><Save className="h-4 w-4 mr-2"/>{isEditMode ? "Save Changes" : "Add Item"}</>}
        </Button>
      </DialogFooter>
    </form>
  );
}


const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-10 mb-6">
        <div
            className="inline-block relative px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-white"
            style={{
                backgroundImage: 'url("https://erp.colorhutbd.xyz/file/uploads/68538749e7a83_brush-stroke-banner-6.png")',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                color: '#ffffff'
            }}
        >
            {children}
        </div>
    </div>
);


const OrderItem = ({ item, onEdit }: { item: OrderItemDetail, onEdit: (item: OrderItemDetail) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { name, description, price, quantity, subItems } = item;
    const hasSubItems = subItems && subItems.length > 0;

    return (
        <div>
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-foreground">{decodeHtmlEntities(name)}</h3>
                <div className="flex items-center gap-2">
                  {price > 0 && <p className="font-bold text-foreground">৳{(price * quantity).toLocaleString()}</p>}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => onEdit(item)} aria-label={`Edit ${name}`}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
            </div>
            {description && <p className="text-sm text-muted-foreground mt-1">{decodeHtmlEntities(description)}</p>}
            
            {hasSubItems && (
                <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs h-auto p-1 mt-2 text-primary hover:text-primary/80"
                >
                    {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                    {isExpanded ? 'Hide' : 'Show'} Variations ({subItems.length})
                </Button>
            )}

            {hasSubItems && isExpanded && (
                <div className="mt-2 pl-4 border-l-2 border-muted/50 space-y-1 bg-muted/30 p-2 rounded-r-md">
                    {subItems.map((sub, index) => (
                        <div key={sub.id || index} className="flex justify-between items-baseline text-sm text-muted-foreground p-1.5 bg-card shadow-sm rounded-md">
                            <p className="text-foreground/90">{decodeHtmlEntities(sub.name)}</p>
                            {typeof sub.price === 'number' && <p className="font-medium">৳{sub.price.toLocaleString()}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAdminLoggedIn, adminLoading } = useAdminAuth();
    const orderIdFromUrl = params.id as string;
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
    const { toast } = useToast();

    const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
    const [editingItemData, setEditingItemData] = useState<OrderItemDetail | null>(null);

    const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<{ id: string; name: string } | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
    const [addingItemToCategory, setAddingItemToCategory] = useState<Category | null>(null);

    const fetchOrderAndCategoryDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [ordersResponse, restaurantCategoriesResponse, parlourCategoriesResponse] = await Promise.all([
                fetch('https://colorhutbd.xyz/vm/api/orders.php', { headers: { 'Accept': 'application/json' } }),
                fetch('https://colorhutbd.xyz/vm/api/categories.php', { headers: { 'Accept': 'application/json' } }),
                fetch('https://colorhutbd.xyz/vm/api/parlour-categories.php', { headers: { 'Accept': 'application/json' } })
            ]);

            const newCategoryMap = new Map<string, string>();
            if (restaurantCategoriesResponse.ok) {
                const resCatResult = await restaurantCategoriesResponse.json();
                if (resCatResult.success && Array.isArray(resCatResult.data.categories)) {
                    resCatResult.data.categories.forEach((cat: any) => newCategoryMap.set(String(cat.id), cat.name));
                }
            }
            if (parlourCategoriesResponse.ok) {
                const parCatResult = await parlourCategoriesResponse.json();
                if (parCatResult.success && Array.isArray(parCatResult.data.categories)) {
                    parCatResult.data.categories.forEach((cat: any) => newCategoryMap.set(String(cat.id), cat.name));
                }
            }
            setCategoryMap(newCategoryMap);

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
                    templateName: orderData.template?.name ? String(orderData.template.name) : 'Unknown Template',
                    customerName: orderData.customer?.name ? String(orderData.customer.name) : 'N/A',
                    customerEmail: orderData.customer?.email,
                    customerPhone: orderData.customer?.phone,
                    customerAddress: orderData.customer?.address,
                    businessName: orderData.customer?.restaurant,
                    businessRole: orderData.customer?.role,
                    totalAmount: parseFloat(orderData.totalAmount || orderData.total || 0),
                    items: (orderData.items || []).map((item: any, index: number): OrderItemDetail => ({
                        id: String(item.id),
                        name: String(item.name),
                        quantity: Number(item.quantity || 1),
                        price: Number(item.price),
                        categoryId: String(item.categoryId || item.category || `custom-${index}`),
                        categoryName: item.categoryName,
                        description: item.description || null,
                        subItems: Array.isArray(item.subItems) ? item.subItems : [],
                    })),
                    templateImageUrl: orderData.template?.imageUrl,
                    templateTags: orderData.template?.tags || [],
                };
                setOrder(formattedOrder);
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
            if (!adminLoading) {
                setIsLoading(false);
            }
            return;
        }
        fetchOrderAndCategoryDetails();
    }, [orderIdFromUrl, isAdminLoggedIn, adminLoading, fetchOrderAndCategoryDetails]);

    const handleOpenEditDialog = (item: OrderItemDetail) => {
        setEditingItemData(item);
        setIsEditItemDialogOpen(true);
    };
    
    const handleOpenAddItemDialog = (categoryId: string, categoryName: string) => {
        setAddingItemToCategory({ id: categoryId, name: categoryName, icon: '' });
        setIsAddItemDialogOpen(true);
    };

    const handleOpenEditCategoryDialog = (categoryId: string, currentName: string) => {
        setCategoryToEdit({ id: categoryId, name: currentName });
        setNewCategoryName(currentName);
        setIsEditCategoryDialogOpen(true);
    };

    const saveOrderUpdate = async (updatedOrder: ApiOrder, successMessage: string) => {
        const originalOrder = order;
        setOrder(updatedOrder); // Optimistic UI update

        try {
            const response = await fetch('https://colorhutbd.xyz/vm/api/orders.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(updatedOrder),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to save order changes.");
            }
            toast({ title: "Success", description: successMessage });
            await fetchOrderAndCategoryDetails();
        } catch (e: any) {
            toast({ title: "Save Error", description: e.message, variant: "destructive" });
            setOrder(originalOrder); // Revert on failure
        }
    };
    
    const handleEditMenuItem = async (formData: MenuItemFormValues) => {
        if (!editingItemData || !order) {
            toast({ title: "Error", description: "No item or order data available for editing.", variant: "destructive" });
            return;
        }
        const updatedItems = order.items?.map(item => 
            item.id === editingItemData.id 
                ? { ...item, name: formData.name, price: formData.price, description: formData.description, subItems: formData.subItems }
                : item
        );
        await saveOrderUpdate({ ...order, items: updatedItems }, `Item "${decodeHtmlEntities(formData.name)}" updated.`);
        setIsEditItemDialogOpen(false);
        setEditingItemData(null);
    };

    const handleAddItem = async (formData: MenuItemFormValues) => {
        if (!addingItemToCategory || !order) {
            toast({ title: "Error", description: "Cannot add item without a category context.", variant: "destructive" });
            return;
        }
        const newItem: OrderItemDetail = {
            id: `custom-item-${Date.now()}`,
            name: formData.name,
            price: formData.price,
            description: formData.description,
            subItems: formData.subItems,
            quantity: 1,
            categoryId: addingItemToCategory.id,
            categoryName: addingItemToCategory.name,
        };
        const updatedItems = [...(order.items || []), newItem];
        await saveOrderUpdate({ ...order, items: updatedItems }, `Item "${decodeHtmlEntities(formData.name)}" added to order.`);
        setIsAddItemDialogOpen(false);
        setAddingItemToCategory(null);
    };

    const handleUpdateCategoryName = async () => {
        if (!categoryToEdit || !order || !newCategoryName.trim()) {
            toast({ title: "Error", description: "Invalid data for category update.", variant: "destructive" });
            return;
        }
        const updatedItems = order.items?.map(item =>
            item.categoryId === categoryToEdit.id ? { ...item, categoryName: newCategoryName.trim() } : item
        );
        await saveOrderUpdate({ ...order, items: updatedItems }, `Category name updated to "${decodeHtmlEntities(newCategoryName)}".`);
        
        const newMap = new Map(categoryMap);
        newMap.set(categoryToEdit.id, newCategoryName.trim());
        setCategoryMap(newMap);

        setIsEditCategoryDialogOpen(false);
        setCategoryToEdit(null);
    };
    
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
          const date = parseISO(dateString);
          return isValidDate(date) ? format(date, "MMM d, yyyy, h:mm a") : "Invalid Date";
        } catch {
          return "Invalid Date";
        }
    };
    
    const subtotal = useMemo(() => {
        if (!order?.items) return 0;
        return order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }, [order?.items]);

    const groupedItems = useMemo(() => {
        if (!order?.items) return {};
        return order.items.reduce((acc, item) => {
            const catId = item.categoryId;
            const categoryName = decodeHtmlEntities(categoryMap.get(catId)) || decodeHtmlEntities(item.categoryName) || 'Uncategorized';
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(item);
            return acc;
        }, {} as Record<string, OrderItemDetail[]>);
    }, [order?.items, categoryMap]);

    const handleDownloadDocx = async () => {
        if (!order || !order.items) {
            toast({ title: "Error", description: "Order data is not available.", variant: "destructive" });
            return;
        }

        toast({ title: "Generating Document...", description: "Please wait while your DOCX file is prepared." });

        try {
            const menuItemsForDocx: MenuItem[] = order.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.categoryId,
                description: item.description || undefined,
                subItems: item.subItems?.map(si => ({ ...si, id: si.id || si.name })),
            }));
            
            const usedCategoryIds = new Set(menuItemsForDocx.map(item => item.category));
            const categoriesForDocx: Category[] = Array.from(usedCategoryIds).map(id => ({
                id,
                name: categoryMap.get(id) || order.items?.find(i => i.categoryId === id)?.categoryName || 'Uncategorized',
                icon: '📁',
            }));
            
            const blob = await generateMenuDocx(menuItemsForDocx, categoriesForDocx, order.businessName || "Menu Selection");
            saveAs(blob, `${order.businessName || 'menu'}_${order.orderId}.docx`);

        } catch (error) {
            console.error("Failed to generate DOCX file:", error);
            toast({ title: "Generation Failed", description: "Could not create the document. Please try again.", variant: "destructive" });
        }
    };

    const handleShare = () => {
        if (!order) {
            toast({
                title: "Error",
                description: "Cannot share. Order details not loaded yet.",
                variant: "destructive",
            });
            return;
        }
        const shareUrl = `${window.location.origin}/share/${order.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast({
                title: "Link Copied!",
                description: "The shareable link is now on your clipboard.",
            });
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            toast({
                title: "Copy Failed",
                description: "Could not copy the link. Please try again.",
                variant: "destructive"
            });
        });
    };


    if (adminLoading || isLoading) {
        return (
            <div className="bg-muted min-h-screen p-4 sm:p-6 lg:p-8">
                 <header className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
                    <Skeleton className="h-10 w-36" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-36" />
                        <Skeleton className="h-10 w-28" />
                    </div>
                </header>
                <main className="max-w-5xl mx-auto bg-card text-card-foreground p-8 sm:p-12 shadow-2xl rounded-lg">
                    <div className="flex justify-between items-start border-b pb-8 mb-8">
                        <Skeleton className="h-14 w-1/3" />
                        <div className="space-y-2 text-right">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-56" />
                            <Skeleton className="h-6 w-24 ml-auto" />
                        </div>
                    </div>
                    <SectionTitle><Skeleton className="h-6 w-40" /></SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                         {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </main>
            </div>
        )
    }

    if (!isAdminLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
                <AdminLoginForm />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Order</h2>
                <p className="text-muted-foreground max-w-md">{error}</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    if (!order) {
        return (
             <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center">
                <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground max-w-md">The requested order could not be found.</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-muted min-h-screen p-4 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
                <Button variant="outline" onClick={() => router.push('/m-admin/manage-orders')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="default" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" /> Share Link</Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto bg-card text-card-foreground p-8 sm:p-12 shadow-2xl rounded-lg">
                 <div className="flex justify-between items-start border-b pb-8 mb-4 border-border">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight uppercase text-foreground">
                        Order Details
                    </h1>
                    <div className="text-right text-muted-foreground text-sm space-y-1">
                        <p className="font-bold text-lg text-foreground">Order ID: {order.orderId}</p>
                        <p className="flex items-center justify-end gap-2">
                           <CalendarDays className="h-4 w-4" />
                           {formatDate(order.orderDate)}
                        </p>
                    </div>
                </div>
                
                <section>
                    <SectionTitle>Order Summary</SectionTitle>
                    {groupedItems && Object.keys(groupedItems).length > 0 ? (
                        <div className="space-y-8">
                            {Object.entries(groupedItems).map(([categoryName, items]) => {
                                const categoryId = items[0]?.categoryId;
                                return (
                                <div key={categoryName}>
                                    <div className="flex items-center gap-2 mb-4 border-b-2 border-primary/20 pb-2">
                                        <h3 className="text-xl font-semibold text-primary">
                                            {categoryName}
                                        </h3>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => handleOpenEditCategoryDialog(categoryId, categoryName)}>
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="ml-auto h-7" onClick={() => handleOpenAddItemDialog(categoryId, categoryName)}>
                                            <PlusCircle className="h-4 w-4 mr-2" /> Add Item
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        {items.map((item, index) => (
                                            <OrderItem
                                                key={`${item.id}-${index}`}
                                                item={item}
                                                onEdit={handleOpenEditDialog}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No items were found in this order.</p>
                    )}
                </section>

            </main>

            {editingItemData && (
              <Dialog open={isEditItemDialogOpen} onOpenChange={(open) => {
                  setIsEditItemDialogOpen(open);
                  if (!open) setEditingItemData(null);
                }}>
                <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-40px)] p-0 gap-0">
                  <MenuItemForm 
                    initialData={editingItemData}
                    onSubmit={handleEditMenuItem} 
                    onOpenChange={(open) => {
                      setIsEditItemDialogOpen(open);
                      if (!open) setEditingItemData(null);
                    }}
                    isEditMode={true}
                    categoryName={categoryMap.get(editingItemData.categoryId)}
                  />
                </DialogContent>
              </Dialog>
            )}

            {addingItemToCategory && (
                <Dialog open={isAddItemDialogOpen} onOpenChange={(open) => {
                    setIsAddItemDialogOpen(open);
                    if(!open) setAddingItemToCategory(null);
                }}>
                   <DialogContent className="sm:max-w-lg md:max-w-xl flex flex-col max-h-[calc(100vh-40px)] p-0 gap-0">
                     <MenuItemForm 
                       onSubmit={handleAddItem} 
                       onOpenChange={(open) => {
                           setIsAddItemDialogOpen(open);
                           if(!open) setAddingItemToCategory(null);
                       }}
                       isEditMode={false}
                       categoryName={addingItemToCategory.name}
                     />
                   </DialogContent>
                </Dialog>
            )}

            {isEditCategoryDialogOpen && categoryToEdit && (
                <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Category Name</DialogTitle>
                            <DialogDescription>
                                Change the name of the category for this order only.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="category-name-edit" className="text-right">Name</Label>
                                <Input
                                    id="category-name-edit"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditCategoryDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdateCategoryName}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
