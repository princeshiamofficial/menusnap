'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CalendarDays,
  FileText as FileTextIcon,
  AlertTriangle,
  Printer,
  Download,
} from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


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


const OrderItem = ({ name, description, price, quantity, subItems }: { name: string, description?: string|null, price: number, quantity: number, subItems?: SubItem[] }) => (
    <div>
        <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-foreground">{name}</h3>
            {price > 0 && <p className="font-bold text-foreground">৳{(price * quantity).toLocaleString()}</p>}
        </div>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        {subItems && subItems.length > 0 && (
            <div className="mt-2 pl-4 border-l-2 border-muted/50 space-y-1">
                {subItems.map((sub, index) => (
                    <div key={sub.id || index} className="flex justify-between items-baseline text-sm text-muted-foreground">
                        <p className="text-foreground/90">{sub.name}</p>
                        {typeof sub.price === 'number' && <p className="font-medium">৳{sub.price.toLocaleString()}</p>}
                    </div>
                ))}
            </div>
        )}
    </div>
);


export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderIdFromUrl = params.id as string;
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());

    useEffect(() => {
        if (!orderIdFromUrl) {
            setError("Order ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchOrderAndCategoryDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [ordersResponse, restaurantCategoriesResponse, parlourCategoriesResponse] = await Promise.all([
                    fetch('https://colorhutbd.xyz/vm/api/orders.php', { headers: { 'Accept': 'application/json' } }),
                    fetch('https://colorhutbd.xyz/vm/api/categories.php', { headers: { 'Accept': 'application/json' } }),
                    fetch('https://colorhutbd.xyz/vm/api/parlour-categories.php', { headers: { 'Accept': 'application/json' } })
                ]);
    
                // Process categories first to build the map
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
    
    const subtotal = useMemo(() => {
        if (!order?.items) return 0;
        return order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }, [order?.items]);

    const groupedItems = useMemo(() => {
        if (!order?.items) return {};
        return order.items.reduce((acc, item) => {
            const catId = item.categoryId;
            if (!acc[catId]) {
                acc[catId] = [];
            }
            acc[catId].push(item);
            return acc;
        }, {} as Record<string, OrderItemDetail[]>);
    }, [order?.items]);

    if (isLoading) {
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
                    {/* The customer info skeleton section would have been here, it is now removed */}
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
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    <Button variant="default"><Printer className="mr-2 h-4 w-4" /> Print</Button>
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
                            {Object.entries(groupedItems).map(([categoryId, items]) => (
                                <div key={categoryId}>
                                    <h3 className="text-xl font-semibold mb-4 border-b-2 border-primary/20 pb-2 text-primary">
                                        {categoryMap.get(categoryId) || items[0]?.categoryName || 'Uncategorized'}
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
                        <p className="text-muted-foreground text-center py-4">No items were found in this order.</p>
                    )}
                </section>

            </main>
        </div>
    )
}
