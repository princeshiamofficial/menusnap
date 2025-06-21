
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  FileText as FileTextIcon,
  AlertTriangle,
  Printer,
  Download,
  Building,
} from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


type OrderStatus = "Pending" | "Processing" | "In Progress" | "Shipped" | "Delivered" | "Cancelled" | "Refunded" | "On Hold" | "Out for Delivery";

const ALL_ORDER_STATUSES: OrderStatus[] = ["Pending", "Processing", "In Progress", "Shipped", "Delivered", "Cancelled", "Refunded", "On Hold", "Out for Delivery"];

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
    items?: { id: string; name: string; quantity: number; price: number }[];
    templateImageUrl?: string;
    templateDescription?: string;
    templateTags?: string[];
}

const statusColors: Record<OrderStatus, string> = {
  "Pending": "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600",
  "Processing": "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400 border-purple-300 dark:border-purple-600",
  "In Progress": "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400 border-purple-300 dark:border-purple-600",
  "Out for Delivery": "bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400 border-blue-300 dark:border-blue-600",
  "Shipped": "bg-indigo-100 text-indigo-700 dark:bg-indigo-700/20 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600",
  "Delivered": "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400 border-green-300 dark:border-green-600",
  "Cancelled": "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400 border-red-300 dark:border-red-600",
  "Refunded": "bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400 border-gray-300 dark:border-gray-600",
  "On Hold": "bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-400 border-orange-300 dark:border-orange-600",
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-10 mb-6">
    <h2 className="inline-block bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded">
      {children}
    </h2>
  </div>
);

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
    <div className="flex items-start">
        <Icon className="h-4 w-4 mr-3 mt-1 text-primary shrink-0" />
        <div>
            <p className="font-semibold text-foreground">{value || 'N/A'}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
);

const OrderItem = ({ name, quantity, price }: { name: string, quantity: number, price: number }) => (
    <div>
        <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-foreground">{name}</h3>
            <p className="font-bold text-foreground">৳{(price * quantity).toLocaleString()}</p>
        </div>
        <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
    </div>
);


export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderIdFromUrl = params.id as string;
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderIdFromUrl) {
            setError("Order ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchOrderDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('https://colorhutbd.xyz/vm/api/orders.php', { headers: { 'Accept': 'application/json' } });
                if (!response.ok) throw new Error(`API error! status: ${response.status}`);
                const result = await response.json();

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
                        businessName: orderData.customer?.companyName,
                        totalAmount: parseFloat(orderData.totalAmount || orderData.total || 0),
                        items: orderData.items || [],
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

        fetchOrderDetails();
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
                     <SectionTitle><Skeleton className="h-6 w-32" /></SectionTitle>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
                        <Badge variant="outline" className={cn("text-xs py-1 px-2.5 font-medium", statusColors[order.status] || statusColors.Pending)}>
                            {order.status}
                        </Badge>
                    </div>
                </div>

                <section>
                    <SectionTitle>Customer Info</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem icon={User} label="Customer Name" value={order.customerName} />
                        <InfoItem icon={Phone} label="Phone Number" value={order.customerPhone} />
                        <InfoItem icon={Mail} label="Email Address" value={order.customerEmail} />
                        <InfoItem icon={Building} label="Business Name" value={order.businessName} />
                        <InfoItem icon={MapPin} label="Address" value={order.customerAddress} />
                    </div>
                </section>
                
                <section>
                    <SectionTitle>Order Summary</SectionTitle>
                    {order.items && order.items.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {order.items.map((item, index) => (
                                <OrderItem
                                    key={`${item.id}-${index}`}
                                    name={item.name}
                                    quantity={item.quantity}
                                    price={item.price}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No items were found in this order.</p>
                    )}
                </section>

                {order.totalAmount !== undefined && (
                    <section className="mt-12 pt-6 border-t border-border">
                        <div className="max-w-xs ml-auto text-right space-y-2 text-md">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-medium text-foreground">৳{subtotal.toLocaleString()}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax (0%):</span>
                                <span className="font-medium text-foreground">৳0.00</span>
                            </div>
                             <div className="flex justify-between text-xl font-bold text-primary">
                                <span>Total:</span>
                                <span>৳{order.totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </section>
                )}

            </main>
        </div>
    )
}
