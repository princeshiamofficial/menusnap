
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    History, 
    Search, 
    AlertTriangle, 
    ShoppingCart, 
    CalendarDays, 
    FileText as FileTextIcon, 
    ChevronRight, 
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight
} from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import { getOrdersFromMySql } from '@/app/actions/orders';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiOrder {
    id: string;
    orderId: string;
    orderDate: string;
    templateName?: string;
    templateImageUrl?: string;
    customerName?: string;
    businessName?: string;
    totalAmount?: number;
    itemCount: number;
    status: string;
}

const StatusBadge = ({ status }: { status: string }) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'delivered') {
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 gap-1 capitalize"><CheckCircle2 className="h-3 w-3" /> {s}</Badge>;
    }
    if (s === 'pending' || s === 'awaiting') {
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 gap-1 capitalize"><Clock className="h-3 w-3" /> {s}</Badge>;
    }
    if (s === 'cancelled' || s === 'rejected') {
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 gap-1 capitalize"><XCircle className="h-3 w-3" /> {s}</Badge>;
    }
    return <Badge variant="secondary" className="gap-1 capitalize">{s}</Badge>;
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
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="group"
        >
            <Link href={`/order-history/${order.id}`} className="block h-full">
                <Card className="relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 flex flex-col h-full rounded-2xl group-hover:bg-card/60">
                    {/* Visual Status Side Accent */}
                    <div className={cn(
                        "absolute top-0 left-0 w-1 h-full transition-all duration-300 opacity-80 group-hover:opacity-100",
                        order.status.toLowerCase() === 'completed' ? "bg-emerald-500" : 
                        order.status.toLowerCase() === 'pending' ? "bg-amber-500" : 
                        "bg-rose-500"
                    )} />

                    <div className="p-4 flex flex-col h-full space-y-4">
                        {/* Top: ID & Status */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                    order.status.toLowerCase() === 'completed' ? "bg-emerald-500/10 text-emerald-600" : 
                                    order.status.toLowerCase() === 'pending' ? "bg-amber-500/10 text-amber-600" : 
                                    "bg-rose-500/10 text-rose-600"
                                )}>
                                    {order.status}
                                </span>
                                <span className="text-[11px] font-mono font-bold text-muted-foreground/60">#{order.orderId.slice(-8).toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-black text-primary">৳{order.totalAmount?.toLocaleString()}</span>
                        </div>

                        {/* Mid: Template Info */}
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 bg-primary/5 rounded-xl border border-primary/10 group-hover:scale-110 transition-transform overflow-hidden flex items-center justify-center">
                                {order.templateImageUrl ? (
                                    <Image 
                                        src={order.templateImageUrl} 
                                        alt="" 
                                        width={40} 
                                        height={40} 
                                        className="h-full w-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <FileTextIcon className="h-5 w-5 text-primary/40" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-foreground leading-tight truncate">
                                    {decodeHtmlEntities(order.templateName) || "Custom Selection"}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                                        <CalendarDays className="h-3 w-3" /> {formattedDate}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                                        <ShoppingCart className="h-3 w-3" /> {order.itemCount} items
                                    </span>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 hidden sm:block">
                                <ArrowRight className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
};

const OrderCardSkeleton = () => (
    <Card className="relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-md rounded-2xl">
        <div className="p-4 flex flex-col space-y-4">
            {/* Top Row: Status & Amount */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16 rounded-md opacity-40" />
                    <Skeleton className="h-3 w-12 rounded-sm opacity-20" />
                </div>
                <Skeleton className="h-4 w-10 rounded-md opacity-30" />
            </div>

            {/* Middle Row: Content */}
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl opacity-20" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-md opacity-30" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-2 w-14 rounded-full opacity-10" />
                        <Skeleton className="h-2 w-14 rounded-full opacity-10" />
                    </div>
                </div>
            </div>
        </div>
    </Card>
);

export default function OrderHistoryPage() {
    const { clientUser, clientLoading } = useClientAuth();
    const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOrders = useCallback(async () => {
        if (!clientUser) return;
        setIsLoading(true);
        setError(null);
        try {
            let mysqlOrders: any[] = [];
            try {
                const result = await getOrdersFromMySql();
                if (result.success) {
                    mysqlOrders = result.data as any[];
                }
            } catch (e) {
                console.error("MySQL Fetch error in history:", e);
            }

            let localOrders: any[] = [];
            try {
                const rawLocal = localStorage.getItem('colorHutOrders');
                if (rawLocal) {
                    localOrders = JSON.parse(rawLocal);
                }
            } catch (e) {
                console.error("Local storage search error in history:", e);
            }

            const combinedRaw = [...mysqlOrders, ...localOrders];
            const seenIds = new Set();
            const uniqueRaw = combinedRaw.filter(order => {
                const id = String(order.id || order.orderId);
                if (seenIds.has(id)) return false;
                seenIds.add(id);
                return true;
            });

            const mappedOrders: ApiOrder[] = uniqueRaw
                .filter((order: any) => {
                    const orderBusinessName = order.businessName || order.customer?.restaurant || order.customerData?.restaurant;
                    return orderBusinessName === clientUser.businessName;
                })
                .map((order: any): ApiOrder => ({
                    id: String(order.id || order.orderId),
                    orderId: String(order.orderId || order.id),
                    orderDate: String(order.orderDate || order.createdAt || new Date().toISOString()),
                    templateName: order.template?.name || order.templateData?.name || "Custom Selection",
                    templateImageUrl: order.template?.imageUrl || order.templateData?.imageUrl || null,
                    customerName: order.customer?.name || order.customerData?.name || "Customer",
                    businessName: order.businessName || order.customer?.restaurant || order.customerData?.restaurant,
                    totalAmount: parseFloat(order.totalAmount || order.total || 0),
                    itemCount: Array.isArray(order.items) ? order.items.length : 0,
                    status: order.status || 'Pending'
                }));

            setAllOrders(mappedOrders);
        } catch (e: any) {
            setError((e as Error).message || "Failed to load orders.");
        } finally {
            setIsLoading(false);
        }
    }, [clientUser]);

    useEffect(() => {
        if (clientLoading) return;
        if (!clientUser) return;

        fetchOrders();
    }, [clientUser, clientLoading, fetchOrders]);

    const filteredOrders = useMemo(() => {
        return allOrders
            .filter(order => {
                const matchesSearch = searchTerm ? order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     order.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
                
                const matchesStatus = statusFilter === 'all' ? true : order.status.toLowerCase() === statusFilter.toLowerCase();
                
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }, [allOrders, searchTerm, statusFilter]);

    if (clientLoading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Filters & Search */}
                <div className="flex flex-col xl:flex-row gap-6 sticky top-0 z-30 pt-4 pb-2 bg-background/80 backdrop-blur-md">
                    <div className="relative flex-grow group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                            type="search"
                            placeholder="Find an order by ID or template name..."
                            className="pl-12 h-14 w-full text-base rounded-2xl bg-card/40 border-border/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center py-20 bg-destructive/5 border border-destructive/20 rounded-3xl"
                        >
                            <div className="p-5 bg-destructive/10 rounded-full mb-6">
                                <AlertTriangle className="h-12 w-12 text-destructive" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">Service Interruption</h2>
                            <p className="text-muted-foreground max-w-md mx-auto mb-8">{error}</p>
                            <Button onClick={fetchOrders} variant="secondary">Try Again</Button>
                        </motion.div>
                    ) : filteredOrders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 bg-card/30 border-2 border-dashed border-border/50 rounded-3xl"
                        >
                            <div className="relative mx-auto w-32 h-32 mb-8">
                                <ShoppingCart className="h-24 w-24 text-muted-foreground/30 absolute inset-0 m-auto" />
                                <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-3xl opacity-50" />
                            </div>
                            <p className="text-muted-foreground text-2xl font-bold tracking-tight">
                                {searchTerm || statusFilter !== 'all' ? "No records found matching your filters." : "Your vault is currently empty."}
                            </p>
                            <p className="text-muted-foreground mt-2 mb-8">Start your journey by creating your first design.</p>
                            <Button asChild className="rounded-full px-8 h-12">
                                <Link href="/templates">Explore Templates</Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredOrders.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
