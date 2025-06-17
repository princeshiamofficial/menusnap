
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Button,
} from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from "@/components/ui/skeleton";
import {
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
  RefreshCw,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

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

const ITEMS_PER_PAGE = 10;

const statusColors: Record<OrderStatus, string> = {
  "Pending": "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600",
  "Processing": "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400 border-purple-300 dark:border-purple-600",
  "In Progress": "bg-purple-100 text-purple-700 dark:bg-purple-700/20 dark:text-purple-400 border-purple-300 dark:border-purple-600",
  "Shipped": "bg-indigo-100 text-indigo-700 dark:bg-indigo-700/20 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600",
  "Delivered": "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400 border-green-300 dark:border-green-600",
  "Cancelled": "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400 border-red-300 dark:border-red-600",
  "Refunded": "bg-gray-100 text-gray-700 dark:bg-gray-700/20 dark:text-gray-400 border-gray-300 dark:border-gray-600",
  "On Hold": "bg-orange-100 text-orange-700 dark:bg-orange-700/20 dark:text-orange-400 border-orange-300 dark:border-orange-600",
};

const templateBadgeStyle = "bg-teal-100 text-teal-700 dark:bg-teal-700/20 dark:text-teal-400 border-teal-300 dark:border-teal-600";


type SortOptionOrders =
  | 'newest'
  | 'oldest'
  | 'status-asc'
  | 'status-desc'
  | 'template-asc'
  | 'template-desc'
  | 'customer-asc'
  | 'customer-desc'
  | 'orderId-asc'
  | 'orderId-desc';

const sortOptionsListOrders: { value: SortOptionOrders; label: string }[] = [
  { value: 'newest', label: 'Date (Newest First)' },
  { value: 'oldest', label: 'Date (Oldest First)' },
  { value: 'orderId-asc', label: 'Order ID (Asc)' },
  { value: 'orderId-desc', label: 'Order ID (Desc)' },
  { value: 'template-asc', label: 'Template (A-Z)' },
  { value: 'template-desc', label: 'Template (Z-A)' },
  { value: 'customer-asc', label: 'Customer (A-Z)' },
  { value: 'customer-desc', label: 'Customer (Z-A)' },
  { value: 'status-asc', label: 'Status (A-Z)' },
  { value: 'status-desc', label: 'Status (Z-A)' },
];

export default function ManageOrdersPage(): ReactNode {
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOptionOrders>('newest');
  
  const [currentPage, setCurrentPage] = useState(1);

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
        templateName: order.template?.name ? String(order.template.name) : "Unknown Template",
        customerName: order.customer?.name ? String(order.customer.name) : "N/A",
        totalAmount: parseFloat(order.totalAmount || order.total || 0),
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
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, templateFilter, sortOption]);


  const handleRefresh = useCallback(() => {
    fetchOrders();
    setCurrentPage(1);
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Simulate API call
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
      case 'orderId-asc':
        orders.sort((a, b) => a.orderId.localeCompare(b.orderId));
        break;
      case 'orderId-desc':
        orders.sort((a, b) => b.orderId.localeCompare(a.orderId));
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
      case 'customer-asc':
        orders.sort((a, b) => (a.customerName || "").localeCompare(b.customerName || ""));
        break;
      case 'customer-desc':
        orders.sort((a, b) => (b.customerName || "").localeCompare(a.customerName || ""));
        break;
    }
    return orders;
  }, [allOrders, searchTerm, statusFilter, templateFilter, sortOption]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedOrders.length / ITEMS_PER_PAGE);
  }, [filteredAndSortedOrders.length]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedOrders.slice(startIndex, endIndex);
  }, [filteredAndSortedOrders, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };


  const formatDate = (dateString: string, includeTime: boolean = true): string => {
    try {
      const date = parseISO(dateString);
      if (!isValidDate(date)) return "Invalid Date";
      return includeTime ? format(date, "MMM d, yyyy, h:mm a") : format(date, "MMM d, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  const orderRowSkeletons = Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
      <motion.tr 
        key={`skeleton-${i}`} 
        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: i * 0.05 }}
      >
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 whitespace-nowrap" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
      </motion.tr>
  ));


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Order Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all customer orders.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
          </Button>
        </motion.div>
      </header>
      
      <section className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border flex flex-col flex-grow min-h-0">
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 pb-4 border-b border-border">
            <div className="relative flex-grow w-full sm:w-auto sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by Order ID, Template, or Customer..."
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
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOptionOrders)}>
                <SelectTrigger className="w-full sm:w-auto min-w-[180px] h-9 text-sm">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
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

        <div className="flex-grow min-h-0">
          {isLoading ? (
            <Table>
                <TableHeader>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                        <TableHead className="w-[180px]">Date</TableHead>
                        <TableHead className="w-[150px]">Order ID</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="text-right w-[100px]">Action</TableHead>
                    </motion.tr>
                </TableHeader>
                <TableBody><AnimatePresence>{orderRowSkeletons}</AnimatePresence></TableBody>
            </Table>
          ) : error ? (
            <motion.div 
              className="text-center py-10 text-destructive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg">Error loading orders: {error}</p>
              <Button variant="outline" onClick={handleRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" /> Try Again
              </Button>
            </motion.div>
          ) : paginatedOrders.length === 0 ? (
            <motion.div 
              className="text-center py-10 text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">No orders found.</p>
              {searchTerm && <p>Try adjusting your search or filters.</p>}
            </motion.div>
          ) : (
            <ScrollArea className="w-full h-full">
              <Table>
                <TableHeader>
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead className="w-[150px]">Order ID</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="text-right w-[100px]">Action</TableHead>
                  </motion.tr>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {paginatedOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: {duration: 0.15}}}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <TableCell className="text-xs text-muted-foreground">
                            <div className="flex items-center">
                                <CalendarDays className="h-3.5 w-3.5 mr-1.5 opacity-70"/>
                                {formatDate(order.orderDate)}
                            </div>
                        </TableCell>
                        <TableCell className="font-medium text-primary hover:underline cursor-pointer whitespace-nowrap">{order.orderId}</TableCell>
                        <TableCell>
                          {order.templateName !== 'Unknown Template' ? (
                            <Badge variant="outline" className={cn("text-xs py-1 px-2 font-normal", templateBadgeStyle)}>
                                <Tag className="h-3 w-3 mr-1 opacity-80"/>
                                {order.templateName}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground italic">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{order.customerName !== 'N/A' ? order.customerName : <span className="text-muted-foreground italic">N/A</span>}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs py-1 px-2", statusColors[order.status] || statusColors.Pending)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                      <Edit3 className="mr-2 h-4 w-4" />
                                      <span>Change Status</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                  <DropdownMenuSubContent>
                                      <DropdownMenuRadioGroup 
                                          value={order.status} 
                                          onValueChange={(newStatus) => handleStatusChange(order.id, newStatus as OrderStatus)}
                                      >
                                      {ALL_ORDER_STATUSES.map(s => (
                                          <DropdownMenuRadioItem key={s} value={s} className="text-xs">
                                          {s}
                                          </DropdownMenuRadioItem>
                                      ))}
                                      </DropdownMenuRadioGroup>
                                  </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                              </DropdownMenuSub>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border text-sm text-muted-foreground">
          <p>Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} orders.</p>
          <div className="flex items-center space-x-1">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button 
                variant={totalPages === 0 ? "outline" : "default"} 
                size="sm" 
                className="w-8 h-8 p-0" 
                disabled={totalPages === 0 || isLoading}
                onClick={() => setCurrentPage(1)}
              >
                {totalPages > 0 ? currentPage : '-'}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0 || isLoading}
              >
                Next
              </Button>
            </motion.div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Button variant="outline" size="sm" disabled>Export Orders</Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
    
