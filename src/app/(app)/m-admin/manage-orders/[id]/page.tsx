
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
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

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center h-full">
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
             <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground max-w-md">The requested order could not be found.</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={() => router.push('/m-admin/manage-orders')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                    <Button variant="default"><Printer className="mr-2 h-4 w-4" /> Print</Button>
                </div>
            </header>

            <main className="space-y-6">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                        <div>
                            <CardTitle className="text-2xl font-bold text-primary">Order #{order.orderId}</CardTitle>
                            <p className="text-xs text-muted-foreground flex items-center pt-1">
                                <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                                Placed on {formatDate(order.orderDate)}
                            </p>
                        </div>
                        <Badge variant="outline" className={cn("text-sm py-1 px-3 font-medium", statusColors[order.status] || statusColors.Pending)}>
                            {order.status}
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Customer</h3>
                                <p className="flex items-center text-sm"><User className="mr-2 h-4 w-4 text-muted-foreground" /> {order.customerName}</p>
                                <p className="flex items-center text-sm"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /> {order.customerEmail || 'N/A'}</p>
                                <p className="flex items-center text-sm"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> {order.customerPhone || 'N/A'}</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Business</h3>
                                <p className="flex items-center text-sm"><Building2 className="mr-2 h-4 w-4 text-muted-foreground" /> {order.businessName || 'N/A'}</p>
                                <p className="flex items-center text-sm"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> {order.customerAddress || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileTextIcon className="mr-2 h-5 w-5 text-primary"/>
                            Ordered Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                       {order.items && order.items.length > 0 ? (
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex justify-between items-start py-3 px-4 border rounded-lg bg-muted/50 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">৳{(item.quantity * item.price).toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">@ ৳{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {order.totalAmount !== undefined && (
                                    <>
                                        <Separator className="my-4"/>
                                        <div className="flex justify-end pt-2 text-right">
                                            <div>
                                                <p className="text-muted-foreground">Subtotal</p>
                                                <p className="text-muted-foreground">Tax (0%)</p>
                                                <p className="text-lg font-bold text-foreground mt-1">Total Amount</p>
                                            </div>
                                            <div className="ml-8">
                                                <p>৳{order.totalAmount.toLocaleString()}</p>
                                                <p>৳0.00</p>
                                                <p className="text-lg font-bold text-primary mt-1">৳{order.totalAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </>
                                 )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">No items were found in this order.</p>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
