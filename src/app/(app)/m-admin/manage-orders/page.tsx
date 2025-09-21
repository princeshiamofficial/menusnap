
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Button,
  buttonVariants
} from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileText as FileTextIcon,
  ArrowUpDown,
  MoreVertical,
  Eye,
  ShoppingCart,
  CalendarDays,
  Tag,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Printer,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  X,
  FileArchive,
  Trash2,
  Copy,
} from "lucide-react";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface OrderItemDetailAdmin {
    id: string;
    name: string;
    quantity: number;
    price: number;
    categoryId: string;
    description?: string | null;
    subItems?: { id?: string; name: string; price?: number }[];
}
interface ApiOrder {
  id: string;
  orderId: string;
  orderDate: string;
  templateName?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string; 
  businessName?: string; 
  businessRole?: string; 
  bio?: string; 
  totalAmount?: number;
  items?: OrderItemDetailAdmin[];
  templateImageUrl?: string;
  templateDescription?: string;
  templateTags?: string[];
  customer?: { // Ensure customer object exists for cloning
    name: string;
    email: string;
    phone: string;
    address: string;
    restaurant: string;
    role: string;
  }
}

interface Category {
  id: string;
  name: string;
  icon?: string;
}

const ITEMS_PER_PAGE = 10;

const templateBadgeStyle = "bg-teal-100 text-teal-700 dark:bg-teal-700/20 dark:text-teal-400 border-teal-300 dark:border-teal-600";


type SortOptionOrders =
  | 'newest'
  | 'oldest'
  | 'company-asc'
  | 'company-desc'
  | 'customer-asc'
  | 'customer-desc'
  | 'orderId-asc'
  | 'orderId-desc';

const sortOptionsListOrders: { value: SortOptionOrders; label: string }[] = [
  { value: 'newest', label: 'Date (Newest First)' },
  { value: 'oldest', label: 'Date (Oldest First)' },
  { value: 'orderId-asc', label: 'Docs ID (Asc)' },
  { value: 'orderId-desc', label: 'Docs ID (Desc)' },
  { value: 'company-asc', label: 'Company (A-Z)' },
  { value: 'company-desc', label: 'Company (Z-A)' },
  { value: 'customer-asc', label: 'Customer (A-Z)' },
  { value: 'customer-desc', label: 'Customer (Z-A)' },
];


function OrderDetailsDialog({ order, isOpen, onOpenChange, allCategories }: { order: ApiOrder | null; isOpen: boolean; onOpenChange: (open: boolean) => void; allCategories: Category[]; }) {
  const router = useRouter();
  
  if (!order) return null;

  const formatDate = (dateString: string, includeTime: boolean = true): string => {
    try {
      const date = parseISO(dateString);
      if (!isValidDate(date)) return "Invalid Date";
      return includeTime ? format(date, "MMM d, yyyy, h:mm a") : format(date, "MMM d, yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Docs Details</DialogTitle>
          <DialogDescription>
            Docs ID: <span className="font-medium text-primary">{order.orderId}</span> placed on {formatDate(order.orderDate)}
          </DialogDescription>
           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start">
                  <User className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{decodeHtmlEntities(order.customerName) || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-foreground">{decodeHtmlEntities(order.customerEmail) || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Email Address</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-foreground">{decodeHtmlEntities(order.customerPhone) || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start">
                  <Building2 className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{decodeHtmlEntities(order.businessName) || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Business Name</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-foreground">{decodeHtmlEntities(order.businessRole) || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Role</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-foreground">{decodeHtmlEntities(order.customerAddress) || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Address</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-md border">
                    <FileTextIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{decodeHtmlEntities(order.templateName) || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{decodeHtmlEntities(order.templateDescription) || 'No description provided.'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Template Preview:</p>
                  <div className="aspect-[4/3] bg-muted rounded-md border overflow-hidden relative">
                    {order.templateImageUrl ? (
                      <Image 
                        src={order.templateImageUrl} 
                        alt={decodeHtmlEntities(order.templateName) || 'Template preview'} 
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        data-ai-hint={order.templateName ? order.templateName.toLowerCase().split(' ').slice(0,2).join(' ') : "menu design"}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        No Preview Available
                      </div>
                    )}
                  </div>
                </div>
                {order.templateTags && order.templateTags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1.5">Tags:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {order.templateTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-muted text-muted-foreground font-normal">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 py-4 border-t mt-auto bg-background flex justify-between">
          <Button
            variant="secondary"
            onClick={() => router.push(`/m-admin/manage-orders/${order.id}`)}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            View & Edit Items
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function ManageOrdersPage(): ReactNode {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOptionOrders>('newest');
  
  const [currentPage, setCurrentPage] = useState(1);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<ApiOrder | null>(null);
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDeleteInfo, setOrderToDeleteInfo] = useState<{ id: string; orderId: string } | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersResponse, restaurantCategoriesResponse, parlourCategoriesResponse] = await Promise.all([
        fetch('https://colorhutbd.xyz/vm/api/orders.php', { headers: { 'Accept': 'application/json' } }),
        fetch('https://colorhutbd.xyz/vm/api/categories.php', { headers: { 'Accept': 'application/json' } }),
        fetch('https://colorhutbd.xyz/vm/api/parlour-categories.php', { headers: { 'Accept': 'application/json' } })
      ]);
      
      const combinedCategories: Category[] = [];
      if (restaurantCategoriesResponse.ok) {
          const resCatResult = await restaurantCategoriesResponse.json();
          if (resCatResult.success && Array.isArray(resCatResult.data.categories)) {
              combinedCategories.push(...resCatResult.data.categories);
          }
      }
      if (parlourCategoriesResponse.ok) {
          const parCatResult = await parlourCategoriesResponse.json();
          if (parCatResult.success && Array.isArray(parCatResult.data.categories)) {
              combinedCategories.push(...parCatResult.data.categories);
          }
      }
      setAllCategories(combinedCategories);


      if (!ordersResponse.ok) throw new Error(`API error! status: ${ordersResponse.status}`);
      const result = await ordersResponse.json();

      let rawOrdersArray: any[] = [];
      if (result.success) {
        if (result.data && Array.isArray(result.data.orders)) {
          rawOrdersArray = result.data.orders;
        } else if (Array.isArray(result.data)) { 
          rawOrdersArray = result.data;
        } else {
          console.error('Invalid data format for orders: "orders" array not found in data.', result);
          throw new Error('Invalid data format from API for docs.');
        }
      } else {
        throw new Error(result.message || 'API request for docs was not successful.');
      }

      const fetchedOrders: ApiOrder[] = rawOrdersArray.map((order: any, index: number): ApiOrder => ({
        id: String(order.id || `mock-${index}-${Date.now()}`), 
        orderId: String(order.orderId || order.id || `ORD-${Date.now() + index}`), 
        orderDate: String(order.orderDate || order.createdAt || order.date || new Date(Date.now() - index * 86400000).toISOString()),
        templateName: order.template?.name ? String(order.template.name) : `Template ${index % 5 + 1}`,
        customerName: order.customer?.name ? String(order.customer.name) : `Customer ${index + 1}`,
        customerEmail: order.customer?.email || `customer${index+1}@example.com`,
        customerPhone: order.customer?.phone || `019100000${index % 100 < 10 ? '0' : ''}${index % 100}`,
        customerAddress: order.customer?.address || `${index+1} Dhaka, Bangladesh`,
        businessName: order.customer?.restaurant,
        businessRole: order.customer?.role,
        bio: `This is a sample bio for customer ${index+1}. They ordered template: ${order.template?.name || `Template ${index % 5 + 1}`}.`,
        totalAmount: parseFloat(order.totalAmount || order.total || (Math.random() * 1000 + 500).toFixed(2)),
        items: (order.items || []).map((item: any): OrderItemDetailAdmin => ({
            id: String(item.id),
            name: String(item.name),
            quantity: Number(item.quantity || 1),
            price: Number(item.price),
            categoryId: String(item.categoryId || item.category),
            description: item.description || null,
            subItems: Array.isArray(item.subItems) ? item.subItems.map((si: any) => ({id: String(si.id), name: String(si.name), price: si.price !== null && si.price !== undefined ? parseFloat(si.price) : undefined})) : [],
        })),
        templateImageUrl: order.template?.imageUrl || `https://placehold.co/600x400.png`, 
        templateDescription: order.template?.description || 'A fresh and floral design, ideal for spring menus or garden cafes.',
        templateTags: order.template?.tags || ['Restaurant', 'Cafe', 'Seasonal'],
        customer: order.customer,
      }));
      setAllOrders(fetchedOrders);
    } catch (e: any) {
      console.error('Failed to fetch orders:', e);
      setError(e.message || 'Failed to load docs.');
      setAllOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchOrders();
    }
  }, [fetchOrders, isAdminLoggedIn]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption]);


  const handleRefresh = useCallback(() => {
    fetchOrders();
    setCurrentPage(1);
  }, [fetchOrders]);
  
  const handleViewDetails = (order: ApiOrder) => {
    setSelectedOrderForDetails(order);
    setIsDetailsDialogOpen(true);
  };
  
  const handleDeleteOrder = (order: ApiOrder) => {
    setOrderToDeleteInfo({ id: order.id, orderId: order.orderId });
    setIsDeleteDialogOpen(true);
  };
  
  const handleCloneDocs = async (originalOrder: ApiOrder) => {
    const random3Digit = Math.floor(100 + Math.random() * 900);
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const newOrderId = `RO-${random3Digit}${day}${month}${year}`;

    // Create a deep copy and update necessary fields
    const clonedOrder = JSON.parse(JSON.stringify(originalOrder));
    clonedOrder.id = newOrderId;
    clonedOrder.orderId = newOrderId;
    clonedOrder.orderDate = date.toISOString();

    try {
        const response = await fetch('https://colorhutbd.xyz/vm/api/orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(clonedOrder),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to clone docs.');
        }

        toast({
            title: "Docs Cloned",
            description: `Docs #${originalOrder.orderId} has been cloned as #${newOrderId}.`,
        });
        fetchOrders(); // Refresh the list
    } catch (error: any) {
        toast({
            title: "Clone Failed",
            description: error.message,
            variant: "destructive",
        });
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDeleteInfo) return;
    try {
      const response = await fetch(`https://colorhutbd.xyz/vm/api/orders.php?id=${orderToDeleteInfo.id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      const result = await response.json();
      if (!response.ok || (result && result.success === false)) {
        throw new Error(result.message || 'Failed to delete docs.');
      }
      toast({ title: "Success", description: `Docs #${orderToDeleteInfo.orderId} deleted.` });
      fetchOrders();
    } catch (error: any) {
      toast({ title: "Error Deleting Docs", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDeleteInfo(null);
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let orders = allOrders.filter(order => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && decodeHtmlEntities(order.customerName).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.businessName && decodeHtmlEntities(order.businessName).toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
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
      case 'company-asc':
        orders.sort((a, b) => (decodeHtmlEntities(a.businessName) || "").localeCompare(decodeHtmlEntities(b.businessName) || ""));
        break;
      case 'company-desc':
        orders.sort((a, b) => (decodeHtmlEntities(b.businessName) || "").localeCompare(decodeHtmlEntities(a.businessName) || ""));
        break;
      case 'customer-asc':
        orders.sort((a, b) => (decodeHtmlEntities(a.customerName) || "").localeCompare(decodeHtmlEntities(b.customerName) || ""));
        break;
      case 'customer-desc':
        orders.sort((a, b) => (decodeHtmlEntities(b.customerName) || "").localeCompare(decodeHtmlEntities(a.customerName) || ""));
        break;
    }
    return orders;
  }, [allOrders, searchTerm, sortOption]);

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


  const formatDateForDisplay = (dateString: string, includeTime: boolean = true): string => {
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
          <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
      </motion.tr>
  ));

  if (adminLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading Admin Area...</p>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <AdminLoginForm />
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Docs Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all customer docs.</p>
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
                placeholder="Search by Docs ID, Company, or Customer..."
                className="pl-10 w-full h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0">
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
                        <TableHead className="w-[200px]">Date</TableHead>
                        <TableHead className="w-[150px]">Docs ID</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Customer</TableHead>
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
              <p className="text-lg">Error loading docs: {error}</p>
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
              <p className="text-lg">No docs found.</p>
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
                    <TableHead className="w-[200px]">Date</TableHead>
                    <TableHead className="w-[150px]">Docs ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Customer</TableHead>
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
                                {formatDateForDisplay(order.orderDate)}
                            </div>
                        </TableCell>
                        <TableCell className="font-medium text-primary hover:underline cursor-pointer whitespace-nowrap" onClick={() => router.push(`/m-admin/manage-orders/${order.id}`)}>{order.orderId}</TableCell>
                        <TableCell>{order.businessName ? decodeHtmlEntities(order.businessName) : <span className="text-muted-foreground italic">N/A</span>}</TableCell>
                        <TableCell>{order.customerName !== 'N/A' ? decodeHtmlEntities(order.customerName) : <span className="text-muted-foreground italic">N/A</span>}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleCloneDocs(order)}>
                                <Copy className="mr-2 h-4 w-4" /> Clone Docs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteOrder(order)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Docs
                              </DropdownMenuItem>
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
          <p>Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} docs.</p>
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
            <Button variant="outline" size="sm" disabled>Export Docs</Button>
          </motion.div>
        </div>
      </section>
      <OrderDetailsDialog 
        order={selectedOrderForDetails} 
        isOpen={isDetailsDialogOpen} 
        onOpenChange={setIsDetailsDialogOpen} 
        allCategories={allCategories}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete docs #{orderToDeleteInfo?.orderId}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDeleteInfo(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrder}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Yes, delete docs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
