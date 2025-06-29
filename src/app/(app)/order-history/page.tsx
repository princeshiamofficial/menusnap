
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Search, ListFilter, AlertTriangle, ShoppingCart, CalendarDays, FileText as FileTextIcon, ChevronRight } from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { cn, decodeHtmlEntities } from '@/lib/utils';

type OrderStatus = "Pending" | "Processing" | "In Progress" | "Shipped" | "Delivered" | "Cancelled" | "Refunded" | "On Hold" | "Out for Delivery";

const ALL_ORDER_STATUSES: OrderStatus[] = ["Pending", "Processing", "In Progress", "Shipped", "Delivered", "Cancelled", "Refunded", "On Hold", "Out for Delivery"];

interface ApiOrder {
  id: string;
  orderId: string;
  orderDate: string;
  status: OrderStatus;
  templateName?: string;
  customerName?: string;
  businessName?: string;
  totalAmount?: number;
  itemCount: number;
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

const OrderCard = ({ order }: { order: ApiOrder }) => {
  const formattedDate = useMemo(() => {
    try {
      const date = parseISO(order.orderDate);
      return isValidDate(date) ? format(date, "MMM d, yyyy") : "Invalid Date";
    } catch {
      return "Invalid Date";
    }
  }, [order.orderDate]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col h-full bg-card">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg font-bold text-primary">Order #{order.orderId}</CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formattedDate}
                </p>
            </div>
            <Badge variant="outline" className={cn("text-xs py-1 px-2.5", statusColors[order.status] || statusColors.Pending)}>
                {order.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
            <FileTextIcon className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground truncate">{decodeHtmlEntities(order.templateName) || "Custom Selection"}</span>
        </div>
         <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span>{order.itemCount} items</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Link href={`/order-history/${order.id}`} passHref legacyBehavior>
            <Button as="a" variant="default" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                View Details <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const OrderCardSkeleton = () => (
    <Card className="shadow-md rounded-lg flex flex-col h-full bg-card">
        <CardHeader className="pb-4">
             <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-40" />
            </div>
             <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
            </div>
        </CardContent>
        <CardFooter className="p-4 border-t mt-auto">
             <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

export default function OrderHistoryPage() {
    const { clientUser, clientLoading } = useClientAuth();
    const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

    useEffect(() => {
        if (clientLoading) return;
        if (!clientUser) return;

        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('https://colorhutbd.xyz/vm/api/orders.php', { headers: { 'Accept': 'application/json' } });
                if (!response.ok) throw new Error(`API error! status: ${response.status}`);
                
                const result = await response.json();
                const rawOrdersArray = result.success ? (result.data.orders || result.data) : [];
                
                const fetchedOrders: ApiOrder[] = rawOrdersArray
                    .filter((order: any) => order.customer?.restaurant === clientUser.businessName)
                    .map((order: any, index: number): ApiOrder => ({
                        id: String(order.id || `mock-${index}-${Date.now()}`),
                        orderId: String(order.orderId || order.id),
                        orderDate: String(order.orderDate || order.createdAt || order.date),
                        status: ALL_ORDER_STATUSES.includes(order.status) ? order.status : "Pending",
                        templateName: order.template?.name,
                        customerName: order.customer?.name,
                        businessName: order.customer?.restaurant,
                        totalAmount: parseFloat(order.totalAmount || order.total || 0),
                        itemCount: Array.isArray(order.items) ? order.items.length : 0,
                    }));

                setAllOrders(fetchedOrders);
            } catch (e: any) {
                setError(e.message || "Failed to load orders.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [clientUser, clientLoading]);

    const filteredOrders = useMemo(() => {
        return allOrders
            .filter(order => {
                const matchesSearch = searchTerm ? order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) : true;
                const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [allOrders, searchTerm, statusFilter]);

    if (clientLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                 <Skeleton className="h-8 w-64 mb-2" />
                 <Skeleton className="h-5 w-96" />
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                    {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
                 </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
             <header>
                <div className="flex items-center gap-3">
                    <History className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Order History
                    </h1>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
                    Review your past orders and their statuses.
                </p>
            </header>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-card rounded-lg shadow border">
                 <div className="relative w-full sm:flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by Order ID..."
                        className="pl-10 w-full text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <div className="w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                           <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
                           <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {ALL_ORDER_STATUSES.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <main>
                {isLoading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                           <OrderCardSkeleton key={index} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center py-10 bg-card border border-destructive/50 rounded-lg shadow-md">
                        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                        <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
                        <p className="text-muted-foreground max-w-md">{error}</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-lg shadow border border-border">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground text-lg font-medium">
                            {searchTerm || statusFilter !== 'all' ? "No orders match your criteria." : "You haven't placed any orders yet."}
                        </p>
                    </div>
                ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
