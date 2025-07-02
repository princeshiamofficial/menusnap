
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
    <h2 className="text-2xl font-bold mt-10 mb-4 border-b-2 border-gray-300 dark:border-gray-600 pb-2 text-gray-800 dark:text-gray-200">
        {children}
    </h2>
);

const OrderItem = ({ name, description, price, quantity, subItems }: { name: string, description?: string|null, price: number, quantity: number, subItems?: SubItem[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubItems = subItems && subItems.length > 0;

    return (
        <div className="py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{decodeHtmlEntities(name)}</h3>
                {price > 0 && <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">৳{(price * quantity).toLocaleString()}</p>}
            </div>
            {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{decodeHtmlEntities(description)}</p>}
            
            {hasSubItems && (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs mt-2 text-primary hover:underline flex items-center"
                >
                    {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                    {isExpanded ? 'Hide' : 'Show'} Variations
                </button>
            )}

            {hasSubItems && isExpanded && (
                <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-1">
                    {subItems.map((sub, index) => (
                        <div key={index} className="flex justify-between items-baseline text-sm text-gray-700 dark:text-gray-300">
                            <p>• {decodeHtmlEntities(sub.name)}</p>
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
            <div className="bg-gray-200 dark:bg-gray-800 min-h-screen p-4 sm:p-8">
                <main className="max-w-4xl mx-auto bg-white dark:bg-black p-12 sm:p-16 rounded-sm shadow-2xl">
                    <header className="text-center border-b-2 border-black dark:border-white pb-6 mb-10">
                        <Skeleton className="h-12 w-40 mx-auto mb-4" />
                        <Skeleton className="h-12 w-3/4 mx-auto" />
                        <Skeleton className="h-5 w-1/2 mx-auto mt-2" />
                        <Skeleton className="h-4 w-1/3 mx-auto mt-4" />
                    </header>
                    <section>
                        <Skeleton className="h-8 w-1/3 mb-6" />
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </section>
                </main>
            </div>
        )
    }
    
    if (error) {
        return (
            <div className="bg-gray-200 dark:bg-gray-800 min-h-screen p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-white dark:bg-black p-8 rounded-lg shadow-xl border border-destructive/50 max-w-lg">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4 mx-auto" />
                    <h2 className="text-xl font-semibold text-destructive mb-2">Could Not Load Selection</h2>
                    <p className="text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="bg-gray-200 dark:bg-gray-800 min-h-screen p-4 sm:p-8 font-serif">
             <div className="max-w-4xl mx-auto flex justify-end gap-2 mb-4 print:hidden">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="bg-white/80 dark:bg-black/80 backdrop-blur-sm"><Printer className="h-4 w-4 mr-2" /> Print</Button>
                {isClient && navigator.share && <Button variant="outline" size="sm" onClick={() => navigator.share({title: `Menu Selection for ${order.businessName}`, url: window.location.href})} className="bg-white/80 dark:bg-black/80 backdrop-blur-sm"><Share2 className="h-4 w-4 mr-2" /> Share</Button>}
            </div>
            <main className="max-w-4xl mx-auto bg-white dark:bg-black text-black dark:text-white p-12 sm:p-16 rounded-sm shadow-2xl printable-area">
                <header className="text-center border-b-2 border-black dark:border-white pb-6 mb-10">
                    <Image
                        src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                        alt="Color Hut Logo"
                        width={150}
                        height={50}
                        className="object-contain mx-auto mb-4"
                    />
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-wider uppercase">
                        {decodeHtmlEntities(order.businessName) || "Menu Selection"}
                    </h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-2 font-sans-alt">
                       Shared by {decodeHtmlEntities(order.customerName) || 'our valued client'}.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 font-sans-alt">
                        {formatDate(order.orderDate)}
                    </p>
                </header>
                
                <section>
                    {groupedItems && Object.keys(groupedItems).length > 0 ? (
                        <div className="space-y-10">
                            {Object.entries(groupedItems).map(([categoryName, items]) => (
                                <div key={categoryName}>
                                    <SectionTitle>{categoryName}</SectionTitle>
                                    <div className="space-y-2">
                                        {items.map((item) => (
                                            <OrderItem
                                                key={item.id}
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
                        <p className="text-gray-500 text-center py-4">No items were found in this selection.</p>
                    )}
                </section>

            </main>
             <footer className="text-center text-gray-500 dark:text-gray-400 text-xs mt-8 print:hidden font-sans-alt">
                <p>Powered by Color Hut | For inquiries, call +8801919760626</p>
            </footer>
             <style jsx global>{`
                @media print {
                    body {
                        background-color: #fff !important;
                    }
                    .printable-area {
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        border: none;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                }
                .font-serif {
                    font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
                }
                .font-sans-alt {
                     font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                }
            `}</style>
        </div>
    );
}
