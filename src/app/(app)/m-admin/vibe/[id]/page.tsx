
'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    ChevronLeft,
    Edit,
    FileArchive,
    Eye,
    Shuffle,
    ShoppingCart,
    FileText,
    Search,
    Users,
    PenSquare,
    Loader2,
    Check,
    MoreHorizontal,
    Sparkles,
    Image as ImageIcon
} from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateMenuDocx } from '@/lib/docx-generator';
import { saveAs } from 'file-saver';
import { 
    getOrderByIdFromMySql, 
    getCategoriesFromMySql, 
    updateOrderInMySql 
} from '@/app/actions/orders';
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, Category } from '@/components/menu/menu-preview-dialog';
import Image from 'next/image';


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

const EditableField = memo(({ value, onSave, placeholder = "Click to edit", multiline = false, className = '', inputClassName = '' }: { value?: string | number | null, onSave: (newValue: string) => void, placeholder?: string, multiline?: boolean, className?: string, inputClassName?: string }) => {
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

    const handleKeyDown = (e: any) => {
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
});
EditableField.displayName = "EditableField";

// --- Memoized Category Section ---
const CategorySection = memo(({ 
    category, 
    onAddCategory, 
    onRemoveCategory, 
    onCategoryNameChange, 
    onAddItemToCategory, 
    onEditItem, 
    onUpdateItem,
    onRemoveItem, 
    onToggleSubItems,
    expandedSubItems 
}: { 
    category: any;
    onAddCategory: () => void;
    onRemoveCategory: (id: string) => void;
    onCategoryNameChange: (id: string, name: string) => void;
    onAddItemToCategory: (id: string) => void;
    onEditItem: (item: any) => void;
    onUpdateItem: (itemId: string, updates: Partial<OrderItemDetail>) => void;
    onRemoveItem: (id: string) => void;
    onToggleSubItems: (id: string) => void;
    expandedSubItems: Record<string, boolean>;
}) => {
    return (
        <div className="mb-8 group/category">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-primary/20 pb-2">
                <span className="text-xl mr-2 text-primary">{category.icon}</span>
                <EditableField
                    value={category.name}
                    onSave={(val) => onCategoryNameChange(category.id, val)}
                    placeholder="Category Name"
                    className="text-xl font-semibold text-primary"
                    inputClassName="text-xl font-semibold"
                />
                <Badge variant="secondary">{category.items.length}</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover/category:opacity-100" onClick={() => onRemoveCategory(category.id)}><X className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="ml-auto h-7" onClick={() => onAddItemToCategory(category.id)}><PlusCircle className="h-4 w-4 mr-2" /> Add Item</Button>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {category.items.map((item: any) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card border p-3 rounded-lg shadow-sm hover:border-primary/50 group/item relative"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <EditableField
                                            value={decodeHtmlEntities(item.name)}
                                            onSave={(val) => onUpdateItem(item.id, { name: val })}
                                            placeholder="Item Name"
                                            className="font-bold text-foreground flex-grow"
                                            inputClassName="font-bold"
                                        />
                                        <div className="flex items-center gap-1 shrink-0">
                                            <span className="text-foreground font-bold">৳</span>
                                            <EditableField
                                                value={item.price}
                                                onSave={(val) => onUpdateItem(item.id, { price: parseFloat(val) })}
                                                placeholder="0"
                                                className="font-bold text-foreground min-w-[40px] text-right"
                                                inputClassName="font-bold text-right w-20"
                                            />
                                        </div>
                                    </div>
                                    <EditableField
                                        value={decodeHtmlEntities(item.description)}
                                        onSave={(val) => onUpdateItem(item.id, { description: val })}
                                        placeholder="Add a description..."
                                        multiline
                                        className="text-sm text-muted-foreground mt-1"
                                        inputClassName="text-sm"
                                    />

                                    {item.subItems && item.subItems.length > 0 && (
                                        <>
                                            <Button variant="link" size="sm" onClick={() => onToggleSubItems(item.id)} className="text-xs h-auto p-0 text-primary mt-2">
                                                {expandedSubItems[item.id] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                                                Variations ({item.subItems.length})
                                            </Button>
                                            {expandedSubItems[item.id] && (
                                                <div className="mt-2 space-y-2 border-l-2 border-muted/50 pl-4">
                                                    {item.subItems?.map((subItem: any, index: number) => (
                                                        <div key={subItem.id || index} className="flex justify-between items-center text-sm group/subitem">
                                                            <EditableField
                                                                value={decodeHtmlEntities(subItem.name)}
                                                                onSave={(val) => {
                                                                    const newSubItems = [...item.subItems];
                                                                    newSubItems[index] = { ...newSubItems[index], name: val };
                                                                    onUpdateItem(item.id, { subItems: newSubItems });
                                                                }}
                                                                placeholder="Variation Name"
                                                                className="text-muted-foreground flex-grow"
                                                            />
                                                            <div className="flex items-center gap-1 shrink-0 ml-4">
                                                                <span className="text-muted-foreground">৳</span>
                                                                <EditableField
                                                                    value={subItem.price}
                                                                    onSave={(val) => {
                                                                        const newSubItems = [...item.subItems];
                                                                        newSubItems[index] = { ...newSubItems[index], price: parseFloat(val) };
                                                                        onUpdateItem(item.id, { subItems: newSubItems });
                                                                    }}
                                                                    placeholder="0"
                                                                    className="text-muted-foreground min-w-[30px] text-right"
                                                                    inputClassName="text-right w-16"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onEditItem(item)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => onRemoveItem(item.id)}><X className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
});
CategorySection.displayName = "CategorySection";

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
                subItems: initialData?.subItems?.map(si => ({ ...si, name: decodeHtmlEntities(si.name) || "" })) || [],
            });
        }
    }, [isOpen, initialData, form]);

    const handleAddSubItemClick = () => {
        form.clearErrors("subItems");
        const nameVal = newSubItemName.trim();
        if (!nameVal) {
            form.setError("subItems", { type: "manual", message: "Variation name cannot be empty." });
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
                                <Input id="item-price" type="number" {...form.register("price")} placeholder="Enter base price" step="0.01" />
                                {form.formState.errors.price && <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="item-description">Description</Label>
                                <Textarea id="item-description" {...form.register("description")} placeholder="Item description (optional)" />
                            </div>
                            <div className="pt-4">
                                <Label className="font-semibold">Variations / Sizes</Label>
                                <div className="mt-2 flex items-start gap-2">
                                    <Input placeholder="Variation name" value={newSubItemName} onChange={e => setNewSubItemName(e.target.value)} className="flex-grow" />
                                    <Input placeholder="Price (optional)" type="number" value={newSubItemPrice} onChange={e => setNewSubItemPrice(e.target.value)} className="w-32" />
                                    <Button type="button" variant="outline" size="icon" onClick={handleAddSubItemClick}><Plus className="h-4 w-4" /></Button>
                                </div>
                                {form.formState.errors.subItems?.root && <p className="text-sm text-destructive mt-1">{form.formState.errors.subItems.root.message}</p>}
                            </div>
                            {fields.length > 0 && (
                                <div className="space-y-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <Input {...form.register(`subItems.${index}.name`)} className="flex-grow" />
                                            <Input {...form.register(`subItems.${index}.price`)} type="number" className="w-32" />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
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

interface OrderPreviewDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialOrder: ApiOrder;
    allCategories: any[];
    onSaveChanges: (newItems: OrderItemDetail[]) => void;
}
const STATIC_ITEM_IMAGE_URL = 'https://colorhutbd.xyz/image.svg';

function OrderPreviewDialog({ isOpen, onOpenChange, initialOrder, allCategories, onSaveChanges }: OrderPreviewDialogProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    const initialItems = useMemo(() => initialOrder.items || [], [initialOrder]);

    const initialCategories = useMemo(() => {
        if (!initialItems) return [];
        const orderedCategoryIds = [...new Map(initialItems.map(item => [item.categoryId, item])).keys()];
        return orderedCategoryIds
            .map(id => {
                const item = initialItems.find(i => i.categoryId === id);
                const categoryInfo = allCategories.find(c => String(c.id) === id);
                return {
                    id,
                    name: item?.categoryName || categoryInfo?.name || 'Unknown',
                    icon: categoryInfo?.icon || '📁'
                };
            })
            .filter(Boolean) as Category[];
    }, [initialItems, allCategories]);

    const [orderedCategories, setOrderedCategories] = useState<Category[]>(initialCategories);
    const [currentItems, setCurrentItems] = useState<OrderItemDetail[]>(initialItems);

    useEffect(() => {
        if (isOpen) {
            setCurrentItems(initialItems);
            setOrderedCategories(initialCategories);
            setActiveCategoryId(null);
        }
    }, [isOpen, initialItems, initialCategories]);

    const itemsGroupedByCategory = useMemo(() => {
        return currentItems.reduce((acc, item) => {
            const catId = item.categoryId;
            if (!acc[catId]) acc[catId] = [];
            acc[catId].push(item);
            return acc;
        }, {} as Record<string, OrderItemDetail[]>);
    }, [currentItems]);

    const categoriesToDisplayInMainPanel = useMemo(() => {
        if (activeCategoryId) {
            return orderedCategories.filter(cat => cat.id === activeCategoryId);
        }
        return orderedCategories;
    }, [activeCategoryId, orderedCategories]);

    const handleRemoveItem = (itemIdToRemove: string) => {
        setCurrentItems(prev => prev.filter(item => item.id !== itemIdToRemove));
    };

    const handleSaveAndClose = () => {
        // Rebuild the final item list based on the ordered categories to ensure it's correct.
        const finalOrderedItems = orderedCategories.flatMap(cat => itemsGroupedByCategory[cat.id] || []);
        onSaveChanges(finalOrderedItems);
        onOpenChange(false);
    };

    const handleItemReorder = (categoryId: string, reorderedItemsForCategory: OrderItemDetail[]) => {
        const newItemsGrouped = { ...itemsGroupedByCategory, [categoryId]: reorderedItemsForCategory };
        const newMasterItemsList = orderedCategories.flatMap(cat => newItemsGrouped[cat.id] || []);
        setCurrentItems(newMasterItemsList);
    };

    return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="text-xl">Shuffle & Reorder Menu</DialogTitle>
                    <DialogDescription>Drag and drop categories or items to change their order.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    <div className={cn("border-b lg:border-b-0 lg:border-r bg-muted/40 transition-all duration-300 ease-in-out", isSidebarCollapsed ? "h-12 lg:h-auto lg:w-12" : "h-auto max-h-[30vh] lg:max-h-none lg:w-64")}>
                        <div className="flex items-center justify-between p-2 h-12 lg:h-14 border-b">
                            {!isSidebarCollapsed && <span className="font-medium text-xs sm:text-sm px-2">Categories</span>}
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="h-7 w-7 sm:h-8 sm:w-8">
                                <ChevronLeft className={cn("h-4 w-4 transition-transform", isSidebarCollapsed ? "rotate-90 lg:rotate-180" : "-rotate-90 lg:rotate-0")} />
                            </Button>
                        </div>
                        <ScrollArea className={cn("h-[calc(100%-56px)]", isSidebarCollapsed ? "p-1" : "p-2")}>
                            {orderedCategories.length > 0 && (
                                <Button
                                    variant="ghost"
                                    className={cn("w-full justify-start text-sm mb-1 h-9", !activeCategoryId ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent", isSidebarCollapsed ? "justify-center px-0" : "px-2")}
                                    onClick={() => setActiveCategoryId(null)}
                                    title="All Items"
                                >
                                    <FileText className="h-4 w-4 shrink-0" />
                                    {!isSidebarCollapsed && <span className="ml-2 truncate flex-1 text-left">All Items</span>}
                                </Button>
                            )}
                            <Reorder.Group axis="y" values={orderedCategories} onReorder={setOrderedCategories} className="space-y-1">
                                {orderedCategories.map(category => (
                                    <Reorder.Item key={category.id} value={category} className="bg-card rounded-md">
                                        <Button
                                            variant="ghost"
                                            className={cn("w-full justify-start text-sm mb-0 h-9 flex items-center", activeCategoryId === category.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent", isSidebarCollapsed ? "justify-center px-0" : "px-2")}
                                            onClick={() => setActiveCategoryId(category.id)}
                                            title={decodeHtmlEntities(category.name)}
                                        >
                                            <span className={cn("text-base w-4 h-4 flex items-center justify-center shrink-0", isSidebarCollapsed ? "" : "mr-2")}>{category.icon}</span>
                                            {!isSidebarCollapsed && <span className="truncate flex-1 text-left">{decodeHtmlEntities(category.name)}</span>}
                                            {!isSidebarCollapsed && <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab ml-1 shrink-0" />}
                                        </Button>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </ScrollArea>
                    </div>

                    <ScrollArea className="flex-1 p-6 bg-background">
                        {categoriesToDisplayInMainPanel.map(category => {
                            const items = itemsGroupedByCategory[category.id] || [];
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
                                        onReorder={(newOrder) => handleItemReorder(category.id, newOrder)}
                                        className="space-y-3"
                                    >
                                        {items.map(item => (
                                            <Reorder.Item key={item.id} value={item}>
                                                <div className="flex items-center p-3 border rounded-lg bg-card shadow-sm hover:border-primary/50">
                                                    <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab mr-3" />
                                                    <Image
                                                        src={STATIC_ITEM_IMAGE_URL}
                                                        alt={decodeHtmlEntities(item.name)}
                                                        width={48} height={48}
                                                        className="h-12 w-12 rounded-md object-contain mr-4 bg-muted"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm text-foreground">{decodeHtmlEntities(item.name)}</p>
                                                        {item.description && <p className="text-xs text-muted-foreground">{decodeHtmlEntities(item.description)}</p>}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-sm text-foreground">৳{item.price.toLocaleString()}</p>
                                                        <Button
                                                            variant="link" size="sm"
                                                            className="text-destructive hover:text-destructive/80 h-auto p-0 text-xs"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                        >
                                                            <X className="h-3 w-3 mr-1" /> Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            );
                        })}
                        {currentItems.length === 0 && (
                            <div className="text-center text-muted-foreground py-10">
                                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No items in this selection.</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="w-full sm:w-auto" onClick={handleSaveAndClose}><Save className="h-4 w-4 mr-2" />Save & Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type SaveStatus = "unsaved" | "saving" | "saved";

export default function VibeModePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { isAdminLoggedIn, adminLoading } = useAdminAuth();
    const orderIdFromUrl = params.id as string;

    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
    const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({});

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<OrderItemDetail | null>(null);
    const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(null);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchFilterType, setSearchFilterType] = useState<'items' | 'categories'>('items');

    const lastSavedDataRef = useRef<string>("");
    const isSavingRef = useRef(false);

    const fetchOrderAndCategoryDetails = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [orderRes, resCatRes, parCatRes] = await Promise.all([
                getOrderByIdFromMySql(orderIdFromUrl),
                getCategoriesFromMySql('restaurant'),
                getCategoriesFromMySql('parlour')
            ]);

            const combinedCategories: any[] = [];
            if (resCatRes.success && Array.isArray(resCatRes.data)) {
                combinedCategories.push(...resCatRes.data);
            }
            if (parCatRes.success && Array.isArray(parCatRes.data)) {
                combinedCategories.push(...parCatRes.data);
            }
            setAllCategories(combinedCategories);

            if (!orderRes.success) throw new Error(orderRes.message || 'Failed to fetch docs.');
            const orderData = orderRes.data;

            if (orderData) {
                const formattedOrder: ApiOrder = {
                    id: String(orderData.id),
                    orderId: String(orderData.orderId || orderData.id),
                    orderDate: String(orderData.orderDate || orderData.createdAt || orderData.date || new Date().toISOString()),
                    status: ALL_ORDER_STATUSES.includes(orderData.status as any) ? orderData.status as OrderStatus : "Pending",
                    customer: orderData.customerData || orderData.customer,
                    template: orderData.templateData || orderData.template,
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
                setSaveStatus("saved");
            } else {
                setError(`Docs with ID ${orderIdFromUrl} not found.`);
            }
        } catch (e: any) {
            setError(e.message || 'Failed to load docs details.');
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

    // Robust saving effect with debounce
    useEffect(() => {
        if (!order || saveStatus === "saved" || isSavingRef.current) return;

        const currentDataString = JSON.stringify(order);
        if (currentDataString === lastSavedDataRef.current) {
            setSaveStatus("saved");
            return;
        }

        const timer = setTimeout(async () => {
            isSavingRef.current = true;
            setSaveStatus("saving");
            
            try {
                console.log("Auto-saving Vibe document:", order.orderId);
                const result = await updateOrderInMySql(order);
                
                if (!result.success) {
                    throw new Error(result.message || "Failed to save document changes.");
                }

                lastSavedDataRef.current = JSON.stringify(order);
                setSaveStatus("saved");
                console.log("Vibe Auto-save successful.");
            } catch (e: any) {
                console.error("Save error:", e);
                setSaveStatus("unsaved");
            } finally {
                isSavingRef.current = false;
            }
        }, 1500); // 1.5s debounce for stability

        return () => clearTimeout(timer);
    }, [order, saveStatus]);

    const handleOrderUpdate = useCallback((updatedOrder: ApiOrder) => {
        setOrder(updatedOrder);
        setSaveStatus("unsaved");
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (saveStatus === 'unsaved' || saveStatus === 'saving') {
                const message = "Changes you made may not be saved.";
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveStatus]);


    const handleShare = (mode: 'viewer' | 'editor') => {
        if (!order) return;
        const path = mode === 'viewer' ? 'share' : 'editor';
        const shareUrl = `${window.location.origin}/${path}/${order.id}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            toast({ title: "Link Copied", description: `${mode === 'viewer' ? 'Viewer' : 'Editor'} link copied.` });
        }).catch(err => {
            console.error('Failed to copy link: ', err);
        });
    };

    const handleDownloadDocx = async () => {
        if (!order || !order.items) {
            return;
        }

        try {
            const menuItemsForDocx: MenuItem[] = order.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.categoryId,
                description: item.description || undefined,
                subItems: item.subItems?.map(si => ({ ...si, id: si.id || si.name, price: si.price || 0 })),
            }));

            const categoriesForDocx: Category[] = categoriesForRender.map(c => {
                const fullCategory = allCategories.find(ac => String(ac.id) === c.id);
                return {
                    id: c.id,
                    name: c.name,
                    icon: fullCategory?.icon || '📁'
                };
            });

            const blob = await generateMenuDocx(menuItemsForDocx, categoriesForDocx, order.customer?.restaurant || "Menu Selection");
            saveAs(blob, `${order.customer?.restaurant || 'menu'}_${order.orderId}_vibe.docx`);

        } catch (error) {
            console.error("Failed to generate DOCX file:", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const categoriesForRender = useMemo(() => {
        if (!order?.items) return [];

        const categoryMap = new Map<string, { name: string, items: OrderItemDetail[] }>();

        order.items.forEach(item => {
            const catId = item.categoryId;
            if (!categoryMap.has(catId)) {
                const fullCategory = allCategories.find(c => String(c.id) === catId);
                const name = decodeHtmlEntities(item.categoryName || fullCategory?.name) || 'Uncategorized';
                categoryMap.set(catId, { name, items: [] });
            }
        });

        let filteredItems = order.items;
        const lowerCaseSearchTerm = debouncedSearch.toLowerCase();

        if (debouncedSearch) {
            if (searchFilterType === 'items') {
                filteredItems = order.items.filter(item =>
                    decodeHtmlEntities(item.name).toLowerCase().includes(lowerCaseSearchTerm)
                );
            } else {
                const matchingCategoryIds = new Set<string>();
                for (const [id, data] of categoryMap.entries()) {
                    if (data.name.toLowerCase().includes(lowerCaseSearchTerm)) {
                        matchingCategoryIds.add(id);
                    }
                }
                filteredItems = order.items.filter(item => matchingCategoryIds.has(item.categoryId));
            }
        }

        filteredItems.forEach(item => {
            const catData = categoryMap.get(item.categoryId);
            if (catData) {
                catData.items.push(item);
            }
        });

        const orderedCategoryIds = [...new Map(order.items.map(item => [item.categoryId, item])).keys()];

        return orderedCategoryIds
            .map(id => {
                const data = categoryMap.get(id);
                if (!data || data.items.length === 0) return null; // Only show categories that have matching items
                const fullCategory = allCategories.find(c => String(c.id) === id);
                return { id, name: data.name, items: data.items, icon: fullCategory?.icon || '📁' };
            })
            .filter(Boolean) as { id: string; name: string; items: OrderItemDetail[], icon: string }[];

    }, [order?.items, allCategories, searchTerm, searchFilterType]);

    const handleCategoryNameChange = (categoryId: string, newName: string) => {
        if (!order) return;
        const newItems = order.items?.map(item => item.categoryId === categoryId ? { ...item, categoryName: newName } : item);
        handleOrderUpdate({ ...order, items: newItems });
    };

    const handleUpdateItem = (itemId: string, updates: Partial<OrderItemDetail>) => {
        if (!order) return;
        const updatedItems = order.items?.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );
        handleOrderUpdate({ ...order, items: updatedItems });
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
        }
        setIsFormOpen(false);
        setEditingItem(null);
        setAddingToCategoryId(null);
    };


    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            // Standardize: if NO 'Z' and NO offset, append 'Z' for UTC interpretation
            // This ensures strings like "2026-04-10 02:51:00" from DB are correctly shifted to local time
            let standardized = dateString.replace(' ', 'T');
            if (!standardized.includes('Z') && !standardized.includes('+')) {
                standardized = standardized + 'Z';
            }
            
            const date = parseISO(standardized);
            return isValidDate(date) ? format(date, "MMM d, yyyy, h:mm a") : "Invalid Date";
        } catch { 
            const date = new Date(dateString);
            return isValidDate(date) ? format(date, "MMM d, yyyy, h:mm a") : "Invalid Date";
        }
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
    if (error) return <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center"><AlertTriangle className="h-12 w-12 text-destructive mb-4" /><h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Vibe</h2><p className="text-muted-foreground max-w-md">{error}</p><Button variant="outline" onClick={() => router.back()} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button></div>;
    if (!order) return <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center"><FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" /><h2 className="text-xl font-semibold mb-2">Vibe Order Not Found</h2><p className="text-muted-foreground max-w-md">The requested vibe document could not be found.</p><Button variant="outline" onClick={() => router.push('/m-admin/manage-orders')} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" /> Go to Documents History</Button></div>;

    const SaveStatusIndicator = () => {
        switch (saveStatus) {
            case 'saving':
                return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Saving...</div>;
            case 'saved':
                return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4" />Saved</div>;
            case 'unsaved':
                return <div className="flex items-center gap-2 text-sm text-yellow-600">Unsaved changes</div>;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="bg-muted min-h-screen flex flex-col">
                <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
                    <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Button variant="outline" size="sm" onClick={() => router.back()}>
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">Back</span>
                            </Button>
                            <div className="h-6 border-l border-border"></div>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    {decodeHtmlEntities(order.customer?.restaurant)}
                                </h1>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5 opacity-70">
                                    <CalendarDays className="h-3 w-3" />
                                    {formatDate(order.orderDate)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <SaveStatusIndicator />
                            <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                                <FileArchive className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Download</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="px-2 sm:px-3">
                                        <MoreHorizontal className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Actions</span>
                                        <ChevronDown className="h-4 w-4 ml-1 -mr-1 hidden sm:inline-flex" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onSelect={() => {
                                        setTimeout(() => setIsPreviewOpen(true), 100);
                                    }}>
                                        <Shuffle className="mr-2 h-4 w-4" />
                                        Shuffle Menu
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleShare('viewer')}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Share with viewer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleShare('editor')}>
                                        <PenSquare className="mr-2 h-4 w-4" />
                                        Share with editor
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => {
                                        router.push(`/m-admin/manage-orders/${order.id}`);
                                    }}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        General Mode
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                <div className="flex-grow px-2 pb-2 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
                    <main className="max-w-5xl mx-auto bg-card text-card-foreground p-4 sm:p-12 shadow-lg rounded-lg border border-border/50">


                        <section>
                            <div className="sticky top-[64px] z-30 bg-card/95 backdrop-blur-sm py-4 mb-6 border-b -mx-4 px-4 sm:-mx-12 sm:px-12 -mt-4 sm:-mt-12 shadow-sm">
                                <div className="flex items-center justify-center gap-3">


                                    {/* Action Group */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 overflow-x-auto no-scrollbar">
                                        <Button variant="outline" size="sm" onClick={handleAddCategory} className="h-10 gap-2 whitespace-nowrap flex-grow sm:flex-grow-0">
                                            <Plus className="h-4 w-4" /> Add Category
                                        </Button>
                                        <div className="h-8 w-px bg-border hidden sm:block mx-1"></div>
                                        <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} className="h-10 gap-2 whitespace-nowrap flex-grow sm:flex-grow-0">
                                            <Shuffle className="h-4 w-4" /> Shuffle
                                        </Button>
                                        <Button variant="secondary" size="sm" onClick={() => handleShare('viewer')} className="h-10 gap-2 whitespace-nowrap flex-grow sm:flex-grow-0">
                                            <Share2 className="h-4 w-4" /> Share
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="inline-block relative mb-6 px-4 py-1.5 text-sm font-bold uppercase tracking-widest text-white"
                                style={{ backgroundImage: 'url("https://erp.colorhutbd.xyz/file/uploads/68538749e7a83_brush-stroke-banner-6.png")', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', color: '#ffffff' }}
                            >
                                Vibe Summary
                            </div>

                            <div>
                                {categoriesForRender.map((category) => (
                                    <div key={category.id}>
                                       <CategorySection
                                            category={category}
                                            onAddCategory={handleAddCategory}
                                            onRemoveCategory={handleRemoveCategory}
                                            onCategoryNameChange={handleCategoryNameChange}
                                            onAddItemToCategory={handleOpenAddDialog}
                                            onEditItem={handleOpenEditDialog}
                                            onUpdateItem={handleUpdateItem}
                                            onRemoveItem={handleRemoveItem}
                                            onToggleSubItems={handleToggleSubItems}
                                            expandedSubItems={expandedSubItems}
                                       />
                                    </div>
                                ))}
                                {categoriesForRender.length === 0 && (
                                    <div className="text-center text-muted-foreground py-10">
                                        <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No vibe matches found.</p>
                                    </div>
                                )}
                            </div>

                            <Button variant="ghost" onClick={handleAddCategory} className="rounded-full bg-muted hover:bg-muted/80 text-muted-foreground mt-4">
                                <Plus className="mr-2 h-4 w-4" />Add Section
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
            {order && (
                <OrderPreviewDialog
                    isOpen={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                    initialOrder={order}
                    allCategories={allCategories}
                    onSaveChanges={(newItems) => handleOrderUpdate({ ...order, items: newItems })}
                />
            )}
        </>
    )
}
