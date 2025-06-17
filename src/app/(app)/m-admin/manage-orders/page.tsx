
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
} from "@/components/ui/card";
import {
  Badge
} from "@/components/ui/badge";
import {
  Input
} from "@/components/ui/input";
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
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import {
  cn
} from "@/lib/utils";
import {
  format,
  parseISO,
  isValid as isValidDate
} from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface StatCardProps {
  title: string;
  value: string | number | ReactNode;
  icon: React.ElementType;
  bgColorClass: string;
  iconContainerBgClass?: string;
}

function OrderStatCard({ title, value, icon: Icon, bgColorClass, iconContainerBgClass }: StatCardProps) {
  return (
    <Card className={cn("shadow-md rounded-lg text-white overflow-hidden", bgColorClass)}>
      <CardContent className="p-4 flex flex-col justify-start">
        <div className={cn("mb-2 h-10 w-10 rounded-lg flex items-center justify-center self-start", iconContainerBgClass || 'bg-black/20')}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="text-3xl font-bold mt-1">{value}</div>
        <p className="text-sm font-medium mt-1 opacity-90">{title}</p>
      </CardContent>
    </Card>
  );
}

type OrderStatus = "Pending" | "Processing" | "In Progress" | "Shipped" | "Delivered" | "Cancelled" | "Refunded" | "On Hold";

const ALL_ORDER_STATUSES: OrderStatus[] = ["Pending", "Processing", "In Progress", "Shipped", "Delivered", "Cancelled", "Refunded", "On Hold"];

interface ApiOrder {
  id: string;
  orderId: string;
  orderDate: string;
  status: OrderStatus;
  templateName?: string;
  customerName?: string;
  totalAmount?: number;
}

const statusColors: Record<OrderStatus, string> = {
  "Pending": "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600",
  "Processing": "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400 border-purple-300 dark:border-purple-600",
  "In Progress": "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400 border-purple-300 dark:border-purple-600", // Same as Processing as per image
  "Shipped": "bg-indigo-100 text-indigo-700 dark:bg-indigo-700/20 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600",
  "Delivered": "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400 border-green-300 dark:border-green-600",
  "Cancelled": "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400 border-red-300 dark:border-red-600",
  "Refunded": "bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400 border-gray-300 dark:border-gray-600",
  "On Hold": "bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-400 border-orange-300 dark:border-orange-600",
};

const TEMPLATE_BADGE_STYLE = "bg-teal-100 text-teal-700 dark:bg-teal-700/20 dark:text-teal-400 border-teal-300 dark:border-teal-600";

function getTemplateBadgeStyle(_templateName?: string): string {
  return TEMPLATE_BADGE_STYLE;
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

      let rawOrdersArray: any[] = [];
      if (result.success) {
        if (result.data && Array.isArray(result.data.orders)) {
          rawOrdersArray = result.data.orders;
        } else if (Array.isArray(result.data)) {
          rawOrdersArray = result.data;
        } else {
          console.error('Invalid data format for orders: "orders" array not found in data.', result);
          throw new Error('Invalid data format from API for orders.');
        }
      } else {
        throw new Error(result.message || 'API request for orders was not successful.');
      }

      const fetchedOrders: ApiOrder[] = rawOrdersArray.map((order: any): ApiOrder => ({
        id: String(order.id || Math.random().toString(36).substring(7)),
        orderId: String(order.orderId || order.id || 'N/A'),
        orderDate: String(order.orderDate || order.createdAt || order.date || new Date().toISOString()),
        status: ALL_ORDER_STATUSES.includes(order.status) ? order.status : "Pending",
        templateName: order.templateName ? String(order.templateName) : "Unknown Template",
        customerName: String(order.customerName || 'N/A'),
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
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    setAllOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast({
      title: "Status Updated",
      description: `Order ${allOrders.find(o => o.id === orderId)?.orderId || orderId} status changed to ${newStatus}.`,
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
    const stats: Record<OrderStatus | "Total" | "InProgressCombined", number> = {
      "Total": allOrders.length, "Pending": 0, "Processing": 0, "In Progress": 0, "Shipped": 0, "Delivered": 0, "Cancelled": 0, "Refunded": 0, "On Hold": 0, "InProgressCombined": 0
    };
    allOrders.forEach(order => {
      if (ALL_ORDER_STATUSES.includes(order.status)) {
        stats[order.status]++;
      }
    });
    stats["InProgressCombined"] = stats["Processing"] + stats["In Progress"];
    return stats;
  }, [allOrders]);

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return isValidDate(date) ? format(date, "MMM d, yyyy, h:mm a") : "Invalid Date";
    } catch {
      return "Invalid Date";
    }
  };

  const statCardSkeletons = Array.from({ length: 5 }).map((_, i) => (
      <Card key={i} className="shadow-md rounded-lg bg-muted/50">
          <CardContent className="p-4 flex flex-col justify-start">
              <Skeleton className="mb-2 h-10 w-10 rounded-lg bg-muted" />
              <Skeleton className="h-9 w-12 mt-1 bg-muted" />
              <Skeleton className="h-5 w-24 mt-1 bg-muted" />
          </CardContent>
      </Card>
  ));

  const orderRowSkeletons = Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-3 sm:gap-4 border-b border-border">
          <div className="flex-shrink-0 sm:w-48 md:w-56 space-y-1.5">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-grow">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div className="flex items-center gap-2 sm:ml-auto mt-2 sm:mt-0 w-full sm:w-auto">
              <Skeleton className="h-8 w-[100px] rounded-md" />
              <Skeleton className="h-8 w-[90px] rounded-md" />
          </div>
      </div>
  ));


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 h-full flex flex-col">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Order Statistics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of all customer orders (PHP API)</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {isLoading ? statCardSkeletons : (
          <>
            <OrderStatCard title="Total Orders" value={orderStats.Total} icon={Package} bgColorClass="bg-sky-500" iconContainerBgClass="bg-sky-600" />
            <OrderStatCard title="Pending Orders" value={orderStats.Pending} icon={Clock3} bgColorClass="bg-yellow-400" iconContainerBgClass="bg-yellow-500" />
            <OrderStatCard title="In Progress" value={orderStats.InProgressCombined} icon={Loader2} bgColorClass="bg-purple-500" iconContainerBgClass="bg-purple-600" />
            <OrderStatCard title="Delivered Orders" value={orderStats.Delivered} icon={CheckCircle} bgColorClass="bg-green-500" iconContainerBgClass="bg-green-600" />
            <OrderStatCard title="Cancelled Orders" value={orderStats.Cancelled} icon={XCircle} bgColorClass="bg-red-500" iconContainerBgClass="bg-red-600" />
          </>
        )}
      </section>

      <section className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border flex flex-col flex-grow min-h-0">
        <div className="pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                All Orders
                <Button variant="ghost" size="icon" onClick={handleRefresh} className="ml-2 h-7 w-7 text-muted-foreground hover:text-primary" disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                View and manage customer orders
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-grow w-full sm:w-auto sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="pl-10 w-full h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-auto min-w-[130px] h-9 text-sm">
                  <ListFilter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ALL_ORDER_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger className="w-full sm:w-auto min-w-[150px] h-9 text-sm">
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="All Templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {uniqueTemplateNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto min-w-[90px] h-9 text-sm">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOptionOrders)}>
                    {sortOptionsListOrders.map(option => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex-grow min-h-0 mt-1">
          {isLoading ? (
            <div className="divide-y divide-border">{orderRowSkeletons}</div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">Error loading orders: {error}</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No orders found.</p>
              {searchTerm && <p>Try adjusting your search or filters.</p>}
            </div>
          ) : (
            <ScrollArea className="w-full h-full">
              <div className="divide-y divide-border">
                {filteredAndSortedOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-x-4 gap-y-3 hover:bg-muted/30 transition-colors">
                    <div className="flex-shrink-0 sm:w-48 md:w-60"> {/* Increased width for Order ID & Date */}
                      <h3 className="text-sm font-semibold text-primary">{order.orderId}</h3>
                      <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-70" /> {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 flex-grow min-w-0">
                      <Badge variant="outline" className={cn("text-xs font-medium py-1 px-2.5", statusColors[order.status] || statusColors.Pending)}>
                        {order.status}
                      </Badge>
                      {order.templateName && order.templateName !== 'Unknown Template' && (
                        <Badge variant="outline" className={cn("text-xs font-medium py-1 px-2.5", getTemplateBadgeStyle(order.templateName))}>
                          <Tag className="h-3 w-3 mr-1 opacity-70" /> {order.templateName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                      <Button variant="outline" size="sm" className="text-xs h-8 flex-1 sm:flex-initial">
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> View Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs h-8 flex-1 sm:flex-initial">
                            Status <MoreVertical className="h-3.5 w-3.5 ml-1.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
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
