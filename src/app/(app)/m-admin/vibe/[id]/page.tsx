
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
    Palette,
    Zap,
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
                "bg-primary/5 border-primary ring-primary focus-visible:ring-primary p-1 -m-1 rounded-md transition-all",
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

const CategorySection = memo(({ 
    category, 
    onAddCategory, 
    onRemoveCategory, 
    onCategoryNameChange, 
    onAddItemToCategory, 
    onEditItem, 
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
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{category.items.length}</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover/category:opacity-100" onClick={() => onRemoveCategory(category.id)}><X className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="ml-auto h-7 border-primary/20 hover:bg-primary/5 text-primary" onClick={() => onAddItemToCategory(category.id)}><PlusCircle className="h-4 w-4 mr-2" /> Add Item</Button>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {category.items.map((item: any) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card border border-primary/5 p-3 rounded-lg shadow-sm hover:border-primary/40 group/item relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <Sparkles className="h-3 w-3 text-primary/30" />
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="font-bold text-foreground">{decodeHtmlEntities(item.name)}</p>
                                        <p className="font-bold text-primary text-right">৳{item.price.toLocaleString()}</p>
                                    </div>
                                    {item.description && <p className="text-sm text-muted-foreground mt-1">{decodeHtmlEntities(item.description)}</p>}

                                    {item.subItems && item.subItems.length > 0 && (
                                        <>
                                            <Button variant="link" size="sm" onClick={() => onToggleSubItems(item.id)} className="text-xs h-auto p-1 text-primary -ml-1 mt-2">
                                                {expandedSubItems[item.id] ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                                                Variations
                                            </Button>
                                            {expandedSubItems[item.id] && (
                                                <div className="mt-2 space-y-2 border-l-2 border-primary/10 pl-3">
                                                    {item.subItems?.map((subItem: any, index: number) => (
                                                        <div key={subItem.id || index} className="flex justify-between items-center text-sm">
                                                            <p className="text-muted-foreground">- {decodeHtmlEntities(subItem.name)}</p>
                                                            <p className="text-muted-foreground font-medium">৳{subItem.price?.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                    <Button variant="outline" size="icon" className="h-7 w-7 border-primary/20 hover:bg-primary/5 text-primary" onClick={() => onEditItem(item)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/5" onClick={() => onRemoveItem(item.id)}><X className="h-4 w-4" /></Button>
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
                                <Label className="font-semibold text-primary flex items-center gap-2">
                                    <Zap className="h-4 w-4" /> Variations / Sizes
                                </Label>
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
                    <DialogFooter className="px-6 py-4 border-t mt-auto gap-2">
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

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
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-primary/20 bg-background/95 backdrop-blur-xl">
                <DialogHeader className="px-6 py-4 border-b border-primary/10">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Shuffle className="h-5 w-5 text-primary" /> Shuffle & Reorder
                    </DialogTitle>
                    <DialogDescription>Arrange categories and items to perfect your document vibe.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    <div className={cn("border-b lg:border-b-0 lg:border-r border-primary/10 bg-primary/5 transition-all duration-300", isSidebarCollapsed ? "h-12 lg:h-auto lg:w-12" : "h-auto max-h-[30vh] lg:max-h-none lg:w-64")}>
                        <div className="flex items-center justify-between p-2 h-12 lg:h-14 border-b border-primary/10">
                            {!isSidebarCollapsed && <span className="font-bold text-[10px] uppercase tracking-widest text-primary/60 px-2">Categories</span>}
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="h-7 w-7 text-primary">
                                <ChevronLeft className={cn("h-4 w-4 transition-transform", isSidebarCollapsed ? "rotate-90 lg:rotate-180" : "-rotate-90 lg:rotate-0")} />
                            </Button>
                        </div>
                        <ScrollArea className={cn("h-[calc(100%-56px)]", isSidebarCollapsed ? "p-1" : "p-2")}>
                            {orderedCategories.length > 0 && (
                                <Button
                                    variant="ghost"
                                    className={cn("w-full justify-start text-sm mb-1 h-9", !activeCategoryId ? "bg-primary text-white font-bold" : "hover:bg-primary/10 text-primary/60", isSidebarCollapsed ? "justify-center px-0" : "px-3")}
                                    onClick={() => setActiveCategoryId(null)}
                                >
                                    <FileText className="h-4 w-4 shrink-0" />
                                    {!isSidebarCollapsed && <span className="ml-2 truncate flex-1 text-left">All Items</span>}
                                </Button>
                            )}
                            <Reorder.Group axis="y" values={orderedCategories} onReorder={setOrderedCategories} className="space-y-1">
                                {orderedCategories.map(category => (
                                    <Reorder.Item key={category.id} value={category} className="bg-transparent rounded-md">
                                        <Button
                                            variant="ghost"
                                            className={cn("w-full justify-start text-sm mb-0 h-9 flex items-center transition-all", activeCategoryId === category.id ? "bg-primary/20 text-primary font-bold shadow-sm" : "hover:bg-primary/5 text-primary/40", isSidebarCollapsed ? "justify-center px-0" : "px-3")}
                                            onClick={() => setActiveCategoryId(category.id)}
                                            title={decodeHtmlEntities(category.name)}
                                        >
                                            <span className={cn("text-base w-4 h-4 flex items-center justify-center shrink-0", isSidebarCollapsed ? "" : "mr-2")}>{category.icon}</span>
                                            {!isSidebarCollapsed && <span className="truncate flex-1 text-left">{decodeHtmlEntities(category.name)}</span>}
                                            {!isSidebarCollapsed && <GripVertical className="h-4 w-4 text-primary/20 cursor-grab ml-1 shrink-0" />}
                                        </Button>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </ScrollArea>
                    </div>

                    <ScrollArea className="flex-1 p-6 bg-background/50">
                        {categoriesToDisplayInMainPanel.map(category => {
                            const items = itemsGroupedByCategory[category.id] || [];
                            if (items.length === 0) return null;
                            return (
                                <div key={category.id} className="mb-8 pl-2 sm:pl-0">
                                    <div className="flex items-center mb-4">
                                        <span className="text-xl mr-2 text-primary">{category.icon}</span>
                                        <h3 className="text-lg font-black tracking-tight text-foreground uppercase">{decodeHtmlEntities(category.name)}</h3>
                                        <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 font-bold">{items.length}</Badge>
                                    </div>
                                    <Reorder.Group
                                        axis="y"
                                        values={items}
                                        onReorder={(newOrder) => handleItemReorder(category.id, newOrder)}
                                        className="space-y-3"
                                    >
                                        {items.map(item => (
                                            <Reorder.Item key={item.id} value={item}>
                                                <div className="flex items-center p-4 border border-primary/5 rounded-2xl bg-card shadow-sm hover:border-primary/30 transition-all group/shuffle">
                                                    <GripVertical className="h-5 w-5 text-primary/20 cursor-grab mr-3" />
                                                    <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center mr-4 shrink-0 transition-transform group-hover/shuffle:scale-105">
                                                        <ImageIcon className="h-6 w-6 text-primary/20" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-bold text-sm text-foreground truncate">{decodeHtmlEntities(item.name)}</p>
                                                        {item.description && <p className="text-[10px] text-muted-foreground truncate">{decodeHtmlEntities(item.description)}</p>}
                                                    </div>
                                                    <div className="text-right ml-4 shrink-0">
                                                        <p className="font-black text-sm text-primary">৳{item.price.toLocaleString()}</p>
                                                        <Button
                                                            variant="ghost" size="sm"
                                                            className="text-destructive/40 hover:text-destructive hover:bg-destructive/5 h-auto p-0 text-[10px] font-bold uppercase tracking-widest mt-1"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Reorder.Item>
                                        ))}
                                    </Reorder.Group>
                                </div>
                            );
                        })}
                    </ScrollArea>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-primary/10 flex flex-col sm:flex-row gap-3 bg-primary/5">
                    <Button variant="ghost" className="w-full sm:w-auto text-primary" onClick={() => onOpenChange(false)}>Discard</Button>
                    <Button className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold" onClick={handleSaveAndClose}><Check className="h-4 w-4 mr-2" />Apply Vibe Order</Button>
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
    const orderId = params.id as string;

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

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [orderRes, resCatRes, parCatRes] = await Promise.all([
                getOrderByIdFromMySql(orderId),
                getCategoriesFromMySql('restaurant'),
                getCategoriesFromMySql('parlour')
            ]);

            const combinedCategories: any[] = [];
            if (resCatRes.success && Array.isArray(resCatRes.data)) combinedCategories.push(...resCatRes.data);
            if (parCatRes.success && Array.isArray(parCatRes.data)) combinedCategories.push(...parCatRes.data);
            setAllCategories(combinedCategories);

            if (!orderRes.success) throw new Error(orderRes.message || 'Failed to fetch vibe data.');
            const data = orderRes.data;

            if (data) {
                const formatted: ApiOrder = {
                    id: String(data.id),
                    orderId: String(data.orderId || data.id),
                    orderDate: String(data.orderDate || data.createdAt || new Date().toISOString()),
                    status: data.status as OrderStatus || "Pending",
                    customer: data.customerData || data.customer,
                    template: data.templateData || data.template,
                    totalAmount: parseFloat(data.totalAmount || 0),
                    items: (data.items || []).map((item: any, index: number): OrderItemDetail => ({
                        id: String(item.id || `vibe-item-${Date.now()}-${index}`),
                        name: String(item.name || 'New Vibe Item'),
                        quantity: Number(item.quantity || 1),
                        price: Number(item.price || 0),
                        categoryId: String(item.categoryId || 'uncategorized'),
                        categoryName: item.categoryName,
                        description: item.description || null,
                        subItems: Array.isArray(item.subItems) ? item.subItems : [],
                    })),
                };
                setOrder(formatted);
                setSaveStatus("saved");
            }
        } catch (e: any) {
            setError(e.message || 'Failed to load vibe mode.');
        } finally {
            setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        if (!isAdminLoggedIn || !orderId) {
            if (!adminLoading) setIsLoading(false);
            return;
        }
        fetchData();
    }, [orderId, isAdminLoggedIn, adminLoading, fetchData]);

    useEffect(() => {
        if (!order || saveStatus === "saved" || isSavingRef.current) return;

        const timer = setTimeout(async () => {
            isSavingRef.current = true;
            setSaveStatus("saving");
            try {
                const result = await updateOrderInMySql(order);
                if (!result.success) throw new Error("Save failed");
                lastSavedDataRef.current = JSON.stringify(order);
                setSaveStatus("saved");
            } catch (e) {
                setSaveStatus("unsaved");
            } finally {
                isSavingRef.current = false;
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [order, saveStatus]);

    const handleOrderUpdate = useCallback((updated: ApiOrder) => {
        setOrder(updated);
        setSaveStatus("unsaved");
    }, []);

    const handleShare = (mode: 'viewer' | 'editor') => {
        if (!order) return;
        const path = mode === 'viewer' ? 'share' : 'editor';
        const shareUrl = `${window.location.origin}/${path}/${order.id}`;
        navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link Copied", description: `${mode === 'viewer' ? 'Viewer' : 'Editor'} link copied to clipboard.` });
    };

    const categoriesForRender = useMemo(() => {
        if (!order?.items) return [];
        const categoryMap = new Map<string, { name: string, items: OrderItemDetail[] }>();
        order.items.forEach(item => {
            const catId = item.categoryId;
            if (!categoryMap.has(catId)) {
                const fullCat = allCategories.find(c => String(c.id) === catId);
                const name = decodeHtmlEntities(item.categoryName || fullCat?.name) || 'Unknown Vibe';
                categoryMap.set(catId, { name, items: [] });
            }
        });

        let filteredItems = order.items;
        if (debouncedSearch) {
            const term = debouncedSearch.toLowerCase();
            if (searchFilterType === 'items') {
                filteredItems = order.items.filter(i => decodeHtmlEntities(i.name).toLowerCase().includes(term));
            } else {
                const matches = new Set<string>();
                categoryMap.forEach((v, k) => { if (v.name.toLowerCase().includes(term)) matches.add(k); });
                filteredItems = order.items.filter(i => matches.has(i.categoryId));
            }
        }

        filteredItems.forEach(i => categoryMap.get(i.categoryId)?.items.push(i));
        const orderedCategoryIds = [...new Map(order.items.map(item => [item.categoryId, item])).keys()];

        return orderedCategoryIds
            .map(id => {
                const data = categoryMap.get(id);
                if (!data || data.items.length === 0) return null;
                const fullCat = allCategories.find(c => String(c.id) === id);
                return { id, name: data.name, items: data.items, icon: fullCat?.icon || '📁' };
            }).filter(Boolean);
    }, [order?.items, allCategories, debouncedSearch, searchFilterType]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleCategoryNameChange = (id: string, name: string) => {
        const newItems = order?.items?.map(i => i.categoryId === id ? { ...i, categoryName: name } : i);
        if (order) handleOrderUpdate({ ...order, items: newItems });
    };

    const handleAddItemToCategory = (catId: string) => { setAddingToCategoryId(catId); setEditingItem(null); setIsFormOpen(true); };
    const handleEditItem = (item: any) => { setEditingItem(item); setAddingToCategoryId(null); setIsFormOpen(true); };
    const handleRemoveItem = (id: string) => { handleOrderUpdate({ ...order!, items: order?.items?.filter(i => i.id !== id) }); };
    
    const handleFormSubmit = (data: any) => {
        if (!order) return;
        if (editingItem) {
            const items = order.items?.map(i => i.id === editingItem.id ? { ...i, ...data } : i);
            handleOrderUpdate({ ...order, items });
        } else {
            const cat = categoriesForRender.find(c => c.id === addingToCategoryId);
            const item = { id: `vibe-item-${Date.now()}`, ...data, quantity: 1, categoryId: addingToCategoryId, categoryName: cat?.name };
            handleOrderUpdate({ ...order, items: [...(order.items || []), item] });
        }
        setIsFormOpen(false);
    };

    if (adminLoading || isLoading) return <div className="bg-primary/5 min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 text-primary animate-spin" /></div>;
    if (!isAdminLoggedIn) return <div className="flex flex-col items-center justify-center min-h-screen"><AdminLoginForm /></div>;
    if (error || !order) return <div className="p-8 text-center text-destructive"><AlertTriangle className="h-12 w-12 mx-auto mb-4" /><p>{error || "Vibe not found"}</p><Button onClick={() => router.back()} className="mt-4">Go Back</Button></div>;

    return (
        <div className="bg-[#fdfdfd] min-h-screen flex flex-col selection:bg-primary/10 selection:text-primary">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-primary/5">
                <div className="max-w-7xl mx-auto h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-primary/5 text-primary">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black tracking-tight flex items-center gap-2 text-primary uppercase">
                                <Sparkles className="h-4 w-4" /> Vibe MODE
                            </h1>
                            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                {decodeHtmlEntities(order.customer?.restaurant)} • {order.orderId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin text-primary/40 mr-2" />}
                        <Button className="bg-primary text-white hover:bg-primary/90 font-black rounded-full shadow-lg shadow-primary/20 px-4 sm:px-8 h-10 sm:h-12 gap-2 text-xs sm:text-sm">
                            <Palette className="h-4 w-4" /> Apply Styles
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-grow p-4 sm:p-8 lg:p-12">
                <main className="max-w-4xl mx-auto bg-white p-6 sm:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[3rem] border border-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-orange-400 to-primary/20" />
                    
                    <div className="flex justify-between items-start border-b border-primary/10 pb-10 mb-10">
                        <div>
                            <h2 className="text-3xl sm:text-6xl font-black tracking-tighter uppercase text-primary leading-tight">
                                {decodeHtmlEntities(order.customer?.restaurant)}
                            </h2>
                            <p className="font-bold text-xs sm:text-sm text-muted-foreground mt-4 tracking-[0.2em] uppercase opacity-40">Creative Vibe Blueprint</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </div>

                    <section className="relative">
                        <div className="sticky top-[80px] sm:top-[100px] z-30 bg-white/95 backdrop-blur-md py-6 mb-10 border-b border-primary/10 -mx-6 px-6 sm:-mx-16 sm:px-16 flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative flex-grow w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/30" />
                                <Input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder={`Search vibe ${searchFilterType}...`}
                                    className="pl-12 h-12 bg-primary/5 border-none rounded-2xl font-bold placeholder:text-primary/20"
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-primary/10 text-primary shrink-0" onClick={() => setIsPreviewOpen(true)}>
                                <Shuffle className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {categoriesForRender.map(category => (
                                <CategorySection
                                    key={category.id}
                                    category={category}
                                    onAddCategory={() => {}}
                                    onRemoveCategory={() => {}}
                                    onCategoryNameChange={handleCategoryNameChange}
                                    onAddItemToCategory={handleAddItemToCategory}
                                    onEditItem={handleEditItem}
                                    onRemoveItem={handleRemoveItem}
                                    onToggleSubItems={id => setExpandedSubItems(p => ({ ...p, [id]: !p[id] }))}
                                    expandedSubItems={expandedSubItems}
                                />
                            ))}
                        </div>

                        <div className="mt-12 flex justify-center">
                            <Button variant="ghost" className="rounded-full py-8 px-12 border-2 border-dashed border-primary/10 text-primary/40 hover:text-primary hover:border-primary/40 hover:bg-primary/5 font-black uppercase tracking-widest gap-2">
                                <Plus className="h-5 w-5" /> Add New Vibe Section
                            </Button>
                        </div>
                    </section>
                </main>
            </div>

            <MenuItemForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={handleFormSubmit} initialData={editingItem} categoryName={editingItem ? '' : addingToCategoryId || ''} />
            {order && <OrderPreviewDialog isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen} initialOrder={order} allCategories={allCategories} onSaveChanges={items => handleOrderUpdate({ ...order, items })} />}
        </div>
    );
}
