
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
    Save,
    X,
    PlusCircle,
    GripVertical,
    ChevronDown,
    ChevronLeft,
    FileArchive,
    Shuffle,
    ShoppingCart,
    FileText,
    Users,
    PenSquare,
    Loader2,
    Check,
    MoreHorizontal,
    Eye,
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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateMenuDocx } from '@/lib/docx-generator';
import { saveAs } from 'file-saver';
import dynamic from 'next/dynamic';

import { 
    getOrderByIdFromMySql, 
    getCategoriesFromMySql, 
    updateOrderInMySql 
} from '@/app/actions/orders';
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, Category } from '@/components/menu/menu-preview-dialog';
import Image from 'next/image';

const GoogleDocsApp = dynamic(() => import("@/components/editor/google-docs/google-docs-app"), {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-[#f8f9fa] flex items-center justify-center animate-pulse text-gray-500 font-medium font-sans text-xl">Loading Brave Docs Editor...</div>
});


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



// --- Add/Edit Item Form ---


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
                                                        {item.description && <p className="text-xs text-muted-foreground leading-relaxed">{decodeHtmlEntities(item.description)}</p>}
                                                        {item.subItems && item.subItems.length > 0 && (
                                                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                                                                {item.subItems.map((si, idx) => (
                                                                    <div key={idx} className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                                                                        <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                                                                        <span className="font-medium">{decodeHtmlEntities(si.name)}</span>
                                                                        {si.price ? <span className="opacity-70">৳{si.price}</span> : null}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
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

export default function BraveModePage() {
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
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchFilterType, setSearchFilterType] = useState<'items' | 'categories'>('items');

    const handleBulkInputUpdate = useCallback((html: string) => {
        if (!html) return;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const nodes = doc.body.querySelectorAll('p, h1, h2, h3');
        
        const currentData = JSON.stringify(order?.items);
        const newItems: OrderItemDetail[] = [];
        let currentCategory: { id: string, name: string } | null = null;
        
        nodes.forEach((node, index) => {
            const trimmed = node.textContent?.trim();
            if (!trimmed) return;

            // 1. Category matching
            const isHeading = ['H1', 'H2', 'H3'].includes(node.tagName);
            const catMatch = trimmed.match(/^#+\s*(.*)$/);
            const isAllCaps = trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.includes('-') && !trimmed.match(/\d/);
            
            if (catMatch || isHeading || isAllCaps) {
                const catName = (catMatch ? catMatch[1].trim() : trimmed).replace(/^#+/, '').trim();
                const existingCat = allCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
                currentCategory = {
                    id: existingCat ? String(existingCat.id) : `new-${index}`,
                    name: catName
                };
                return;
            }

            // 2. Sub-item matching (starts with -)
            if (trimmed.startsWith('-') && newItems.length > 0) {
                const subItemText = trimmed.replace(/^-/, '').trim();
                const siPriceMatch = subItemText.match(/^(.*?)\s*[-:]?\s*(\d+(\.\d+)?)\s*(?:\/-)?\s*$/);
                
                const lastItem = newItems[newItems.length - 1];
                if (!lastItem.subItems) lastItem.subItems = [];
                
                if (siPriceMatch) {
                    lastItem.subItems.push({
                        id: `si-${index}`,
                        name: siPriceMatch[1].trim(),
                        price: parseFloat(siPriceMatch[2])
                    });
                } else {
                    lastItem.subItems.push({
                        id: `si-${index}`,
                        name: subItemText,
                        price: 0
                    });
                }
                return;
            }

            // 3. Item matching (has a price)
            const priceMatch = trimmed.match(/^(.*?)\s*[-:]?\s*(\d+(\.\d+)?)\s*(?:\/-)?\s*$/);
            if (priceMatch) {
                const itemName = priceMatch[1].trim();
                const priceMatchValue = priceMatch[2];
                const price = parseFloat(priceMatchValue);
                
                newItems.push({
                    id: `item-${index}`,
                    name: itemName,
                    price: price,
                    quantity: 1,
                    categoryId: currentCategory?.id || 'uncategorized',
                    categoryName: currentCategory?.name || 'Uncategorized',
                    description: '',
                    subItems: []
                });
                return;
            }

            // 4. Description logic (everything else following an item)
            if (newItems.length > 0) {
                const lastItem = newItems[newItems.length - 1];
                if (!lastItem.description) {
                    lastItem.description = trimmed;
                } else {
                    lastItem.description += ' ' + trimmed;
                }
            }
        });

        if (JSON.stringify(newItems) === currentData) return;

        setOrder(prev => {
            if (!prev) return prev;
            return { ...prev, items: newItems };
        });
        setSaveStatus("unsaved");
    }, [order?.items, allCategories]);

    const initialEditorContent = useMemo(() => {
        if (!order?.items) return "";
        let html = "";
        const categoryMap = new Map<string, OrderItemDetail[]>();
        
        order.items.forEach(item => {
            const catName = item.categoryName || "Uncategorized";
            if (!categoryMap.has(catName)) categoryMap.set(catName, []);
            categoryMap.get(catName)!.push(item);
        });

        let index = 0;
        categoryMap.forEach((items, catName) => {
            if (index > 0) html += "<p></p><p></p>";
            html += `<h2>${catName}</h2>`;
            index++;
            items.forEach(item => {
                html += `<p>${decodeHtmlEntities(item.name)}${item.price ? ` ${item.price}/-` : ''}</p>`;
                if (item.description) {
                    html += `<p><em>${decodeHtmlEntities(item.description)}</em></p>`;
                }
                if (item.subItems && item.subItems.length > 0) {
                    item.subItems.forEach(si => {
                        html += `<p>- ${decodeHtmlEntities(si.name)}${si.price ? ` ${si.price}/-` : ''}</p>`;
                    });
                }
            });
        });
        return html;
    }, [order?.id]);

    const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

    useEffect(() => {
        if (order && !isInitialLoadDone) {
            setIsInitialLoadDone(true);
        }
    }, [order, isInitialLoadDone]);

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
                console.log("Auto-saving Brave document:", order.orderId);
                const result = await updateOrderInMySql(order);
                
                if (!result.success) {
                    throw new Error(result.message || "Failed to save document changes.");
                }

                lastSavedDataRef.current = JSON.stringify(order);
                setSaveStatus("saved");
                console.log("Brave Auto-save successful.");
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
            saveAs(blob, `${order.customer?.restaurant || 'menu'}_${order.orderId}_brave.docx`);

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
    if (error) return <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center"><AlertTriangle className="h-12 w-12 text-destructive mb-4" /><h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Brave Docs</h2><p className="text-muted-foreground max-w-md">{error}</p><Button variant="outline" onClick={() => router.back()} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button></div>;
    if (!order) return <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center"><FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" /><h2 className="text-xl font-semibold mb-2">Brave Docs Not Found</h2><p className="text-muted-foreground max-w-md">The requested document could not be found.</p><Button variant="outline" onClick={() => router.push('/m-admin/manage-orders')} className="mt-6"><ArrowLeft className="mr-2 h-4 w-4" /> Go to Documents History</Button></div>;


    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#f8f9fa]">
            <GoogleDocsApp
                key={order.id}
                initialTitle={order.customer?.restaurant || "New Menu Document"}
                initialContent={initialEditorContent}
                onUpdateContent={handleBulkInputUpdate}
                hideRuler={true}
                onTitleChange={(newTitle) => {
                    if (order && order.customer) {
                        handleOrderUpdate({
                            ...order,
                            customer: { ...order.customer, restaurant: newTitle }
                        });
                    }
                }}
                docId={order.id}
                isVibeMode={true}
                onShare={handleShare}
                customActions={
                    <Button 
                        onClick={() => setIsPreviewOpen(true)}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 gap-2 h-9 rounded-full px-4 font-semibold text-xs transition-all shadow-sm"
                    >
                        <Eye className="w-4 h-4 text-primary" />
                        Preview Menu
                    </Button>
                }
            />

            {order && (
                <OrderPreviewDialog
                    isOpen={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                    initialOrder={order}
                    allCategories={allCategories}
                    onSaveChanges={(items) => handleOrderUpdate({ ...order, items })}
                />
            )}
        </div>
    );
}

