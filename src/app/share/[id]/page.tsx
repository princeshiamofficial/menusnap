
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays,
  FileText as FileTextIcon,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Printer,
  Share2,
} from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { decodeHtmlEntities } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Interfaces
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

// Sub-components
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

const OrderItem = ({ name, description, price, quantity, subItems }: { name: string, description?: string|null, price: number, quantity: number, subItems?: SubItem[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubItems = subItems && subItems.length > 0;

    return (
        <div>
            <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-foreground">{decodeHtmlEntities(name)}</h3>
                {price > 0 && <p className="font-bold text-foreground">৳{(price * quantity).toLocaleString()}</p>}
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


// Main Page Component
export default function SharePage() {
    const params = useParams();
    const orderIdFromUrl = params.id as string;
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!orderIdFromUrl) {
            setError("No selection ID provided in the URL.");
            setIsLoading(false);
            return;
        };

        const fetchOrderAndCategoryDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [ordersResponse, restaurantCategoriesResponse, parlourCategoriesResponse] = await Promise.all([
                    fetch('https://colorhutbd.xyz/vm/api/orders.php', { headers: { 'Accept': 'application/json' } }),
                    fetch('https://colorhutbd.xyz/vm/api/categories.php', { headers: { 'Accept': 'application/json' } }),
                    fetch('https://colorhutbd.xyz/vm/api/parlour-categories.php', { headers: { 'Accept': 'application/json' } })
                ]);
    
                // Process categories
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
                        templateName: orderData.template?.name ? String(orderData.template.name) : 'Custom Selection',
                        customerName: orderData.customer?.name,
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
                    };
                    setOrder(formattedOrder);
                } else {
                    setError(`This shared link is invalid or the selection has been removed.`);
                }
            } catch (e: any) {
                setError(e.message || 'Failed to load the shared menu selection.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderAndCategoryDetails();
    }, [orderIdFromUrl]);
    
    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
          const date = parseISO(dateString);
          return isValidDate(date) ? format(date, "MMMM d, yyyy") : "Invalid Date";
        } catch {
          return "Invalid Date";
        }
    };
    
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

    if (isLoading) {
        return (
            <div className="bg-muted min-h-screen p-4 sm:p-6 lg:p-8">
                <header className="max-w-5xl mx-auto flex justify-end gap-2 mb-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </header>
                <main className="max-w-5xl mx-auto bg-card text-card-foreground p-8 sm:p-12 shadow-2xl rounded-lg">
                    <div className="flex justify-between items-start border-b pb-8 mb-8">
                        <Skeleton className="h-14 w-1/3" />
                        <div className="space-y-2 text-right">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-56" />
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
    
    if (error) {
        return (
            <div className="bg-muted min-h-screen p-8 flex flex-col items-center justify-center text-center">
                 <div className="bg-card p-8 rounded-lg shadow-xl border border-destructive/50 max-w-lg">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4 mx-auto" />
                    <h2 className="text-xl font-semibold text-destructive mb-2">Could Not Load Selection</h2>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="bg-muted min-h-screen p-4 sm:p-6 lg:p-8">
            <header className="max-w-5xl mx-auto flex justify-end gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="bg-card"><Printer className="h-4 w-4 mr-2" /> Print</Button>
                {isClient && navigator.share && <Button variant="outline" size="sm" onClick={() => navigator.share({title: `Menu Selection for ${order.businessName}`, url: window.location.href})} className="bg-card"><Share2 className="h-4 w-4 mr-2" /> Share</Button>}
            </header>
            <main className="max-w-5xl mx-auto bg-card text-card-foreground p-8 sm:p-12 shadow-2xl rounded-lg">
                 <div className="flex justify-between items-start border-b pb-8 mb-4 border-border">
                    <div>
                        <Image
                            src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                            alt="Color Hut Logo"
                            width={180}
                            height={72}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="text-right text-muted-foreground text-sm space-y-1">
                        <p className="font-bold text-lg text-foreground">For: {decodeHtmlEntities(order.businessName)}</p>
                        <p className="flex items-center justify-end gap-2">
                           <CalendarDays className="h-4 w-4" />
                           {formatDate(order.orderDate)}
                        </p>
                    </div>
                </div>
                
                <section>
                    <SectionTitle>Selected Items</SectionTitle>
                    {groupedItems && Object.keys(groupedItems).length > 0 ? (
                        <div className="space-y-8">
                            {Object.entries(groupedItems).map(([categoryName, items]) => (
                                <div key={categoryName}>
                                    <h3 className="text-xl font-semibold mb-4 border-b-2 border-primary/20 pb-2 text-primary">
                                        {categoryName}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        {items.map((item, index) => (
                                            <OrderItem
                                                key={`${item.id}-${index}`}
                                                name={item.name}
                                                description={item.description}
                                                quantity={item.quantity}
                                                price={item.price}
                                                subItems={item.subItems}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No items were found in this selection.</p>
                    )}
                </section>
                <footer className="text-center text-muted-foreground text-xs mt-12 pt-8 border-t border-border">
                    <p>Menu selection prepared with Color Hut Menu Builder.</p>
                    <p>For inquiries, please contact Color Hut at +8801919760626.</p>
                </footer>
            </main>
        </div>
    );
}
