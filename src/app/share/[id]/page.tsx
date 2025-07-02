
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { cn, decodeHtmlEntities } from '@/lib/utils';

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
    <h2 className="text-2xl font-bold mb-4 border-b-2 border-primary/30 pb-2 text-primary flex items-center gap-3">
        {children}
    </h2>
);

const OrderItem = ({ name, description, price, quantity, subItems }: { name: string, description?: string|null, price: number, quantity: number, subItems?: SubItem[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubItems = subItems && subItems.length > 0;

    return (
        <div className="bg-white dark:bg-card border p-4 rounded-lg shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{decodeHtmlEntities(name)}</h3>
                    {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{decodeHtmlEntities(description)}</p>}
                </div>
                {price > 0 && <p className="font-semibold text-foreground ml-4 whitespace-nowrap">৳ {(price * quantity).toLocaleString()}</p>}
            </div>
            
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
                <div className="mt-2 pl-4 border-l-2 border-primary/20 space-y-1 bg-muted/50 p-3 rounded-r-md">
                    {subItems.map((sub, index) => (
                        <div key={sub.id || index} className="flex justify-between items-baseline text-sm p-1.5 bg-card/50 rounded-md">
                            <p className="text-foreground/90">{decodeHtmlEntities(sub.name)}</p>
                            {typeof sub.price === 'number' && <p className="font-medium">৳ {sub.price.toLocaleString()}</p>}
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
    const router = useRouter();
    const orderIdFromUrl = params.id as string;
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        if (!orderIdFromUrl) return;

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
                if (result.success && result.data && Array.isArray(result.data.orders)) {
                    rawOrdersArray = result.data.orders;
                } else if (result.success && Array.isArray(result.data)) {
                    rawOrdersArray = result.data;
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
          return isValidDate(date) ? format(date, "MMM d, yyyy, h:mm a") : "Invalid Date";
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
            <div className="bg-muted min-h-screen p-4 sm:p-6 lg:p-12">
                <main className="max-w-4xl mx-auto bg-card text-card-foreground p-8 sm:p-12 rounded-lg shadow-2xl">
                    <div className="flex justify-between items-start border-b pb-8 mb-8">
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-56" />
                            <Skeleton className="h-5 w-72" />
                        </div>
                    </div>
                    <div>
                        <Skeleton className="h-8 w-1/3 mb-6" />
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
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
        return null; // Should be covered by error state
    }

    return (
        <div className="bg-muted min-h-screen p-4 sm:p-6 lg:p-12 font-sans">
             <header className="max-w-4xl mx-auto mb-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Image
                        src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                        alt="Color Hut Logo"
                        width={120}
                        height={40}
                        className="object-contain"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button>
                    {navigator.share && <Button variant="outline" size="sm" onClick={() => navigator.share({title: `Menu Selection for ${order.businessName}`, url: window.location.href})}><Share2 className="h-4 w-4 mr-2" /> Share</Button>}
                </div>
            </header>
            <main className="max-w-4xl mx-auto bg-card text-card-foreground p-8 sm:p-12 rounded-lg shadow-2xl printable-area">
                 <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-8 mb-8 border-border">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                            {decodeHtmlEntities(order.businessName) || "Menu Selection"}
                        </h1>
                        <p className="text-md text-muted-foreground mt-2">
                           Shared by {decodeHtmlEntities(order.customerName) || 'one of our clients'}.
                        </p>
                    </div>
                    <div className="text-right text-muted-foreground text-sm space-y-1 mt-4 sm:mt-0">
                        <p className="font-bold text-lg text-foreground">Order ID: {order.orderId}</p>
                        <p className="flex items-center justify-end gap-2">
                           <CalendarDays className="h-4 w-4" />
                           {formatDate(order.orderDate)}
                        </p>
                    </div>
                </div>
                
                <section>
                    <SectionTitle>
                       <FileTextIcon className="h-6 w-6" />
                       Selected Items
                    </SectionTitle>
                    {groupedItems && Object.keys(groupedItems).length > 0 ? (
                        <div className="space-y-8">
                            {Object.entries(groupedItems).map(([categoryName, items]) => (
                                <div key={categoryName}>
                                    <h3 className="text-xl font-semibold mb-4 text-foreground/90 flex items-center gap-2">
                                        <Badge variant="secondary" className="text-lg">{items[0]?.icon || '🍴'}</Badge> 
                                        {categoryName}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <style jsx global>{\`
                    @media print {
                        body {
                            background-color: #fff;
                        }
                        .printable-area {
                            box-shadow: none !important;
                            margin: 0;
                            max-width: 100%;
                            border-radius: 0;
                        }
                        header {
                           display: none;
                        }
                    }
                \`}</style>
            </main>
             <footer className="text-center text-muted-foreground text-xs mt-8">
                <p>Powered by Color Hut | For inquiries, call +8801919760626</p>
            </footer>
        </div>
    )
}
