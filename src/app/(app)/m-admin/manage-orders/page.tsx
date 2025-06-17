
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Button,
  buttonVariants
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Badge
} from "@/components/ui/badge";
import {
  Input
} from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"; // Though not a table, using for structure consistency if expanded
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScrollArea
} from '@/components/ui/scroll-area';
import {
  Skeleton
} from "@/components/ui/skeleton";
import {
  Package,
  Clock3,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  ListFilter,
  FileText,
  ArrowUpDown,
  MoreVertical,
  Eye,
  ShoppingCart,
  CalendarDays,
  Tag,
  AlertTriangle
} from "lucide-react";
import {
  cn
} from "@/lib/utils";
import {
  format,
  parseISO,
  isValid
} from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  bgColorClass: string;
  iconColorClass: string;
  description?: string;
}

function OrderStatCard({ title, value, icon: Icon, bgColorClass, iconColorClass, description }: StatCardProps) {
  return (
    <Card className={cn("shadow-lg rounded-xl text-white overflow-hidden", bgColorClass)}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium uppercase tracking-wider opacity-90">{title}</h3>
          <div className={cn("p-2 rounded-full bg-white/20", iconColorClass)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="text-4xl font-bold mb-1">{value}</div>
        {description && <p className="text-xs opacity-80">{description}</p>}
      </CardContent>
    </Card>
  );
}

type OrderStatus = "Pending" | "Processing" | "In Progress" | "Shipped" | "Delivered" | "Cancelled" | "Refunded" | "On Hold";

const ALL_ORDER_STATUSES: OrderStatus[] = ["Pending", "Processing", "In Progress", "Shipped", "Delivered", "Cancelled", "Refunded", "On Hold"];


interface ApiOrder {
  id: string;
  orderId: string; // The display ID like ORD-XXXX
  orderDate: string; // ISO string or parsable date string
  status: OrderStatus;
  templateName?: string; // Optional, might not be on all orders
  customerName?: string;
  totalAmount?: number;
  // items: OrderItem[]; 
}

const statusColors: Record<OrderStatus, string> = {
  "Pending": "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600",
  "Processing": "bg-blue-100 text-blue-700 dark:bg-blue-700/20 dark:text-blue-400 border-blue-300 dark:border-blue-600",
  "In Progress": "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400 border-purple-300 dark:border-purple-600",
  "Shipped": "bg-indigo-100 text-indigo-700 dark:bg-indigo-700/20 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600",
  "Delivered": "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400 border-green-300 dark:border-green-600",
  "Cancelled": "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400 border-red-300 dark:border-red-600",
  "Refunded": "bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400 border-gray-300 dark:border-gray-600",
  "On Hold": "bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-400 border-orange-300 dark:border-orange-600",
};

const templateColors: string[] = [
  "bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-400 border-sky-300 dark:border-sky-600",
  "bg-teal-100 text-teal-700 dark:bg-teal-700/20 dark:text-teal-400 border-teal-300 dark:border-teal-600",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-400 border-emerald-300 dark:border-emerald-600",
  "bg-rose-100 text-rose-700 dark:bg-rose-700/20 dark:text-rose-400 border-rose-300 dark:border-rose-600",
  "bg-pink-100 text-pink-700 dark:bg-pink-700/20 dark:text-pink-400 border-pink-300 dark:border-pink-600",
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-700/20 dark:text-fuchsia-400 border-fuchsia-300 dark:border-fuchsia-600",
];
const templateNameToColorMap = new Map<string, string>();
let colorIndex = 0;

function getTemplateColor(templateName: string): string {
  if (!templateNameToColorMap.has(templateName)) {
    templateNameToColorMap.set(templateName, templateColors[colorIndex % templateColors.length]);
    colorIndex++;
  }
  return templateNameToColorMap.get(templateName) as string;
}


type SortOptionOrders =
  | 'newest'
  | 'oldest'
  | 'status-asc'
  | 'status-desc'
  | 'template-asc'
  | 'template-desc';

const sortOptionsListOrders: { value: SortOptionOrders; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status-asc', label: 'Status (A-Z)' },
  { value: 'status-desc', label: 'Status (Z-A)' },
  { value: 'template-asc', label: 'Template (A-Z)' },
  { value: 'template-desc', label: 'Template (Z-A)' },
];

export default function ManageOrdersPage(): ReactNode {
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOptionOrders>('newest');

  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://colorhutbd.xyz/vm/api/orders.php', { headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error(`API error! status: ${response.status}`);
      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        console.error('Invalid API response structure for orders:', result);
        throw new Error('Invalid data format from API for orders.');
      }
      
      const fetchedOrders: ApiOrder[] = result.data.map((order: any): ApiOrder => ({
        id: String(order.id),
        orderId: String(order.orderId || order.id), 
        orderDate: String(order.orderDate || order.createdAt || new Date().toISOString()),
        status: ALL_ORDER_STATUSES.includes(order.status) ? order.status : "Pending",
        templateName: order.templateName || undefined,
        customerName: order.customerName || 'N/A',
        totalAmount: parseFloat(order.totalAmount) || 0,
      }));
      setAllOrders(fetchedOrders);
    } catch (e: any) {
      console.error('Failed to fetch orders:', e);
      setError(e.message || 'Failed to load orders.');
      setAllOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Simulate API call for status update
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setAllOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast({
      title: "Status Updated",
      description: `Order ${allOrders.find(o=>o.id === orderId)?.orderId || orderId} status changed to ${newStatus}.`,
    });
  };

  const uniqueTemplateNames = useMemo(() => {
    const names = new Set(allOrders.map(order => order.templateName).filter(Boolean) as string[]);
    return Array.from(names).sort();
  }, [allOrders]);

  const filteredAndSortedOrders = useMemo(() => {
    let orders = allOrders.filter(order => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.templateName && order.templateName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesTemplate = templateFilter === 'all' || order.templateName === templateFilter;
      return matchesSearch && matchesStatus && matchesTemplate;
    });

    switch (sortOption) {
      case 'newest':
        orders.sort((a, b) => {
            try { return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(); } catch { return 0; }
        });
        break;
      case 'oldest':
        orders.sort((a, b) => {
            try { return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(); } catch { return 0; }
        });
        break;
      case 'status-asc':
        orders.sort((a, b) => a.status.localeCompare(b.status));
        break;
      case 'status-desc':
        orders.sort((a, b) => b.status.localeCompare(a.status));
        break;
      case 'template-asc':
        orders.sort((a, b) => (a.templateName || "").localeCompare(b.templateName || ""));
        break;
      case 'template-desc':
        orders.sort((a, b) => (b.templateName || "").localeCompare(a.templateName || ""));
        break;
    }
    return orders;
  }, [allOrders, searchTerm, statusFilter, templateFilter, sortOption]);

  const orderStats = useMemo(() => {
    const stats: Record<OrderStatus | "Total", number> = {
      "Total": allOrders.length, "Pending": 0, "Processing": 0, "In Progress": 0, "Shipped": 0, "Delivered": 0, "Cancelled": 0, "Refunded": 0, "On Hold": 0,
    };
    allOrders.forEach(order => {
      if (stats[order.status] !== undefined) {
        stats[order.status]++;
      }
    });
    return stats;
  }, [allOrders]);
  
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM d, yyyy, h:mm a") : "Invalid Date";
    } catch {
      return "Invalid Date";
    }
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <ShoppingCart className="h-8 w-8 mr-3 text-primary" />
          Order Statistics
        </h1>
        <p className="text-muted-foreground mt-1">Overview of all customer orders (PHP API)</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        <OrderStatCard title="Total Orders" value={isLoading ? <Skeleton className="h-9 w-12 bg-white/30" /> : orderStats.Total} icon={Package} bgColorClass="bg-sky-600" iconColorClass="text-sky-100" />
        <OrderStatCard title="Pending Orders" value={isLoading ? <Skeleton className="h-9 w-12 bg-white/30" /> : orderStats.Pending} icon={Clock3} bgColorClass="bg-yellow-500" iconColorClass="text-yellow-100" />
        <OrderStatCard title="In Progress" value={isLoading ? <Skeleton className="h-9 w-12 bg-white/30" /> : orderStats["In Progress"]} icon={Loader2} bgColorClass="bg-purple-500" iconColorClass="text-purple-100" />
        <OrderStatCard title="Delivered Orders" value={isLoading ? <Skeleton className="h-9 w-12 bg-white/30" /> : orderStats.Delivered} icon={CheckCircle} bgColorClass="bg-green-500" iconColorClass="text-green-100" />
        <OrderStatCard title="Cancelled Orders" value={isLoading ? <Skeleton className="h-9 w-12 bg-white/30" /> : orderStats.Cancelled} icon={XCircle} bgColorClass="bg-red-500" iconColorClass="text-red-100" />
      </section>

      <section className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border flex flex-col flex-grow min-h-0">
        <div className="pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-foreground">All Orders</h2>
              <p className="text-sm text-muted-foreground mt-1 sm:mt-0">
                View and manage customer orders.
              </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[250px] lg:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders by ID, customer, template..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-auto min-w-[150px]">
                <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {ALL_ORDER_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {uniqueTemplateNames.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOptionOrders)}>
              <SelectTrigger className="w-full sm:w-auto min-w-[170px]">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                  {sortOptionsListOrders.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                          {option.label}
                      </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex-grow min-h-0 mt-4"> 
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">Error loading orders: {error}</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">Try Again</Button>
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No orders found.</p>
              {searchTerm && <p>Try adjusting your search or filters.</p>}
            </div>
          ) : (
            <ScrollArea className="w-full h-full">
              <div className="space-y-3 pr-2">
                {filteredAndSortedOrders.map((order) => (
                  <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="mb-2 sm:mb-0">
                          <h3 className="text-md font-semibold text-primary">{order.orderId}</h3>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {formatDate(order.orderDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-8">
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> View Details
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs h-8">
                                    Status: {order.status} <MoreVertical className="h-3.5 w-3.5 ml-1.5" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={order.status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus as OrderStatus)}>
                                    {ALL_ORDER_STATUSES.map(s => (
                                    <DropdownMenuRadioItem key={s} value={s}>
                                        {s}
                                    </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs font-medium", statusColors[order.status] || statusColors.Pending)}>
                          {order.status}
                        </Badge>
                        {order.templateName && (
                          <Badge variant="outline" className={cn("text-xs font-medium", getTemplateColor(order.templateName))}>
                            <Tag className="h-3 w-3 mr-1.5 opacity-70" /> {order.templateName}
                          </Badge>
                        )}
                        {order.customerName && order.customerName !== 'N/A' && (
                           <Badge variant="secondary" className="text-xs font-normal">
                             {order.customerName}
                           </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <div className="mt-auto pt-4 border-t border-border text-sm text-muted-foreground">
          Showing {filteredAndSortedOrders.length} of {allOrders.length} orders.
        </div>
      </section>
    </div>
  );
}
    
