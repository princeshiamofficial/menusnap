
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  PenSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Package,
} from "lucide-react";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { EditableField } from "@/components/ui/editable-field";
import { getOrdersFromMySql, deleteOrderFromMySql, submitOrderToMySql, updateOrderInMySql, getCategoriesFromMySql } from "@/app/actions/orders";

interface OrderItemDetailAdmin {
  id: string;
  name: string;
  quantity: number;
  price: number;
  categoryId: string;
  categoryName?: string;
  description?: string | null;
  subItems?: { id?: string; name: string; price?: number }[];
}
interface ApiOrder {
  id: string;
  orderId: string;
  orderDate: string;
  status?: string;
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
  };
  template?: any;
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

// --- Memoized Table Row for Performance ---
const OrderTableRow = React.memo(({ 
  order, 
  index, 
  totalCount, 
  onView, 
  onCopy, 
  onDelete 
}: { 
  order: ApiOrder; 
  index: number; 
  totalCount: number; 
  onView: (o: ApiOrder) => void; 
  onCopy: (o: ApiOrder) => void; 
  onDelete: (o: ApiOrder) => void; 
}) => {
  const router = useRouter();

  return (
    <motion.tr
      key={order.id}
      className="border-b transition-all duration-200 hover:bg-primary/5 cursor-default group/row"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.1) }} // Cap delay
    >
      <TableCell className="text-center font-mono font-medium text-muted-foreground/60 transition-colors group-hover/row:text-primary">
        {totalCount - index}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground tabular-nums font-medium whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 opacity-40 shrink-0" />
          <span>{order.orderDate}</span>
        </div>
      </TableCell>
      <TableCell 
        className="font-bold text-primary transition-all group-hover/row:underline cursor-pointer decoration-2 underline-offset-4" 
        onClick={() => router.push(`/m-admin/manage-orders/${order.id}`)}
      >
        {order.orderId}
      </TableCell>
      <TableCell className="font-medium tracking-tight">
        {order.businessName ? decodeHtmlEntities(order.businessName) : <span className="text-muted-foreground/40 italic">Not set</span>}
      </TableCell>
      <TableCell className="font-medium tracking-tight">
        {order.customerName !== 'N/A' ? decodeHtmlEntities(order.customerName) : <span className="text-muted-foreground/40 italic">Not set</span>}
      </TableCell>
      <TableCell>
        <StatusBadge status={order.status || 'Pending'} />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(order)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopy(order)}>
              <Copy className="h-4 w-4 mr-2" /> Copy Docs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(order)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Docs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </motion.tr>
  );
});
OrderTableRow.displayName = "OrderTableRow";


function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || 'pending';
  
  const config: Record<string, { label: string; icon: any; className: string }> = {
    pending: { label: 'Pending', icon: Clock, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200" },
    processing: { label: 'Processing', icon: RefreshCw, className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" },
    ready: { label: 'Ready', icon: Package, className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200" },
    shipped: { label: 'Shipped', icon: Truck, className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200" },
    completed: { label: 'Completed', icon: CheckCircle2, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200" },
    cancelled: { label: 'Cancelled', icon: XCircle, className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200" },
  };

  const { label, icon: Icon, className } = config[s] || config.pending;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 px-2 py-0.5 font-medium border shadow-sm transition-all duration-300", className)}>
      <Icon className={cn("h-3 w-3", s === 'processing' && "animate-spin-slow")} />
      {label}
    </Badge>
  );
}


function OrderDetailsDialog({ order, isOpen, onOpenChange, allCategories, onUpdateOrder }: { order: ApiOrder | null; isOpen: boolean; onOpenChange: (open: boolean) => void; allCategories: Category[]; onUpdateOrder: (updated: ApiOrder) => void; }) {
  const router = useRouter();

  if (!order) return null;

  const formatDate = (input: string | Date, includeTime: boolean = true): string => {
    try {
      if (!input) return "N/A";
      
      // If it's a string, attempt to interpret it as UTC if it doesn't have a timezone already
      const dateStr = typeof input === 'string' ? (input.endsWith('Z') || input.includes('+') ? input : `${input}Z`) : input;
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
      
      if (!isValidDate(date)) {
        const fallbackDate = new Date(dateStr);
        if (isValidDate(fallbackDate)) {
           return includeTime ? format(fallbackDate, "MMM d, yyyy, h:mm a") : format(fallbackDate, "MMM d, yyyy");
        }
        return "Invalid Date";
      }
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
            <Card className="shadow-sm border border-border/50 bg-card/10 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 py-3 border-b border-border/20">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Personal Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-sm font-medium">
                <div className="flex items-start group">
                  <User className="h-4 w-4 mr-3 mt-1 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                  <div>
                    <EditableField
                      value={order.customerName}
                      onSave={(val: string) => onUpdateOrder({ ...order, customerName: val, customer: { ...order.customer, name: val } } as ApiOrder)}
                      placeholder="Customer Name"
                      className="font-medium text-foreground"
                    />
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
            <Card className="shadow-sm border border-border/50 bg-card/10 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 py-3 border-b border-border/20">
                <Building2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Business Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-sm font-medium">
                <div className="flex items-start group">
                  <Building2 className="h-4 w-4 mr-3 mt-1 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                  <div>
                    <EditableField
                      value={order.businessName}
                      onSave={(val: string) => onUpdateOrder({ ...order, businessName: val, customer: { ...order.customer, restaurant: val } } as ApiOrder)}
                      placeholder="Business Name"
                      className="font-medium text-foreground"
                    />
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
                        data-ai-hint={order.templateName ? order.templateName.toLowerCase().split(' ').slice(0, 2).join(' ') : "menu design"}
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState<SortOptionOrders>('newest');

  const [currentPage, setCurrentPage] = useState(1);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<ApiOrder | null>(null);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDeleteInfo, setOrderToDeleteInfo] = useState<{ id: string; orderId: string } | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const catResult = await getCategoriesFromMySql();
      const combinedCategories: Category[] = [];
      if (catResult.success && Array.isArray(catResult.data)) {
        combinedCategories.push(...(catResult.data as any[]));
      }
      setAllCategories(combinedCategories);

      const result = await getOrdersFromMySql();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch orders from local database.');
      }

      const rawOrdersArray = result.data || [];

      const fetchedOrders: ApiOrder[] = rawOrdersArray.map((order: any, index: number): ApiOrder => ({
        id: String(order.id),
        orderId: String(order.orderId || order.orderid || order.id || ""),
        orderDate: (order.orderDate || order.orderdate || ""),
        templateName: order.template?.name,
        customerName: order.customer?.name,
        customerEmail: order.customer?.email,
        customerPhone: order.customer?.phone,
        customerAddress: order.customer?.address,
        businessName: order.customer?.restaurant,
        businessRole: order.customer?.role,
        bio: order.bio || "",
        totalAmount: Number(order.totalAmount || order.total || 0),
        items: (order.items || []).map((item: any): OrderItemDetailAdmin => ({
          id: String(item.id),
          name: String(item.name),
          quantity: Number(item.quantity || 1),
          price: Number(item.price),
          categoryId: String(item.categoryId),
          categoryName: item.categoryName,
          description: item.description || null,
          subItems: Array.isArray(item.subItems) ? item.subItems : [],
        })),
        status: order.status || 'Pending',
        template: order.template,
        customer: order.customer,
      }));
      setAllOrders(fetchedOrders);
    } catch (e: any) {
      console.error('Failed to fetch orders from local MySQL:', e);
      setError(e.message || 'Failed to load docs from database.');
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
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, sortOption]);


  const handleRefresh = useCallback(() => {
    fetchOrders();
    setCurrentPage(1);
  }, [fetchOrders]);

  const handleUpdateOrder = async (updatedOrder: ApiOrder) => {
    try {
      // Update local state first for immediate feedback
      setAllOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (selectedOrderForDetails && selectedOrderForDetails.id === updatedOrder.id) {
        setSelectedOrderForDetails(updatedOrder);
      }

      const result = await updateOrderInMySql(updatedOrder);

      if (result.success) {
        toast({ title: "Order Updated", description: "The order has been updated successfully." });
      } else {
        throw new Error(result.message || 'Failed to update order on server.');
      }
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
      fetchOrders(); // Rollback
    }
  };

  const handleViewDetails = (order: ApiOrder) => {
    setSelectedOrderForDetails(order);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteOrder = (order: ApiOrder) => {
    setOrderToDeleteInfo({ id: order.id, orderId: order.orderId });
    setIsDeleteDialogOpen(true);
  };

  const handleCopyDocs = async (originalOrder: ApiOrder) => {
    const random3Digit = Math.floor(100 + Math.random() * 900);
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const newOrderId = `RO-${random3Digit}${day}${month}${year}`;

    // Construct exactly as menu-preview-dialog.tsx does it
    const itemsWithCategory = (originalOrder.items || []).map(item => {
      const cat = allCategories.find(c => String(c.id) === String(item.categoryId));
      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        categoryId: item.categoryId,
        categoryName: item.categoryName || (cat ? cat.name : 'Unknown'),
        description: item.description || '',
        subItems: item.subItems || []
      };
    });

    const cleanedCustomer = originalOrder.customer ? {
      name: originalOrder.customer.name,
      email: originalOrder.customer.email,
      phone: originalOrder.customer.phone,
      address: originalOrder.customer.address,
      restaurant: originalOrder.customer.restaurant ? `${originalOrder.customer.restaurant} (copy)` : '',
      role: originalOrder.customer.role,
      userId: (originalOrder.customer as any).userId || 'anonymous'
    } : {
      name: decodeHtmlEntities(originalOrder.customerName || ''),
      email: originalOrder.customerEmail || '',
      phone: originalOrder.customerPhone || '',
      address: decodeHtmlEntities(originalOrder.customerAddress || ''),
      restaurant: originalOrder.businessName ? `${decodeHtmlEntities(originalOrder.businessName)} (copy)` : '',
      role: originalOrder.businessRole || '',
      userId: 'anonymous'
    };

    const clonePayload = {
      id: newOrderId,
      orderId: newOrderId,
      customer: cleanedCustomer,
      items: itemsWithCategory,
      total: originalOrder.totalAmount,
      totalAmount: originalOrder.totalAmount,
      status: 'Pending',
      orderDate: date.toISOString(),
      template: originalOrder.template || {
        name: originalOrder.templateName || "Copied Selection",
      }
    };

    try {
      const result = await submitOrderToMySql(clonePayload);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to clone docs locally.');
      }

      toast({
        title: "Docs Copied",
        description: `Docs #${originalOrder.orderId} has been copied as #${newOrderId} in local database.`,
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Local Copy Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDeleteInfo) return;
    try {
      const result = await deleteOrderFromMySql(orderToDeleteInfo.id);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete from local database.');
      }

      toast({
        title: "Deleted",
        description: "Order removed from local database.",
      });
      fetchOrders();
    } catch (e: any) {
      toast({
        title: "Delete Failed",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDeleteInfo(null);
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let orders = allOrders.filter(order => {
      const lowerSearch = debouncedSearch.toLowerCase();
      const matchesSearch =
        order.orderId.toLowerCase().includes(lowerSearch) ||
        (order.customerName && decodeHtmlEntities(order.customerName).toLowerCase().includes(lowerSearch)) ||
        (order.businessName && decodeHtmlEntities(order.businessName).toLowerCase().includes(lowerSearch));
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
    return filteredAndSortedOrders.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredAndSortedOrders, currentPage]);

  const hasMore = currentPage < totalPages;

  const sentinelRef = useCallback((node: HTMLTableRowElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    if (node && hasMore) {
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setCurrentPage(prev => prev + 1);
          }
        },
        { threshold: 0.1, rootMargin: '100px' } // Add rootMargin for smoother loading
      );
      observer.current.observe(node);
    }
  }, [hasMore, isLoading]);



  const formatDateForDisplay = useCallback((input: string | Date, includeTime: boolean = true): string => {
    try {
      if (!input) return "N/A";
      const dateStr = typeof input === 'string' ? (input.endsWith('Z') || input.includes('+') ? input : `${input}Z`) : input;
      const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
      if (!isValidDate(date)) {
        const fallbackDate = new Date(dateStr);
        if (isValidDate(fallbackDate)) {
           return includeTime ? format(fallbackDate, "MMM d, yyyy, h:mm a") : format(fallbackDate, "MMM d, yyyy");
        }
        return "Invalid Date";
      }
      return includeTime ? format(date, "MMM d, yyyy, h:mm a") : format(date, "MMM d, yyyy");
    } catch { return "Invalid Date"; }
  }, []);

  const fetchedOrdersCount = allOrders.length;
  // Pre-formatted dates to avoid calculating them inside row renders
  const formattedOrders = useMemo(() => {
    return paginatedOrders.map(o => ({
      ...o,
      orderDate: formatDateForDisplay(o.orderDate)
    }));
  }, [paginatedOrders, formatDateForDisplay]);

  const orderRowSkeletons = Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
    <motion.tr
      key={`skeleton-${i}`}
      className="border-b transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: i * 0.05 }}
    >
      <TableCell><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-20 rounded-full" /></TableCell>
      <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 relative">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse" />


      <section className="bg-white/70 dark:bg-black/40 backdrop-blur-xl p-0 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 flex flex-col overflow-hidden group">
        <div className="px-6 py-6 border-b border-border/50 bg-background/80 backdrop-blur-md flex flex-col sm:flex-row items-center gap-4 shadow-md">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
            <Input
              type="search"
              placeholder="Filter by ID, Company, or Customer..."
              className="pl-11 pr-4 w-full h-11 bg-muted/50 border-2 border-transparent focus-visible:border-primary/30 focus-visible:ring-0 transition-all text-base rounded-xl shadow-inner hover:bg-muted/80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOptionOrders)}>
              <SelectTrigger className="w-full sm:w-auto min-w-[200px] h-11 bg-muted/50 border-2 border-transparent focus:border-primary/30 transition-all rounded-xl shadow-inner hover:bg-muted/80">
                <ArrowUpDown className="h-4 w-4 mr-2.5 text-muted-foreground/60" />
                <SelectValue placeholder="Sort orders" />
              </SelectTrigger>
              <SelectContent className="rounded-xl p-1">
                {sortOptionsListOrders.map(option => (
                  <SelectItem key={option.value} value={option.value} className="rounded-lg">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-grow min-h-0 relative">
          {isLoading && allOrders.length === 0 ? (
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="w-[60px] text-center font-bold">SL</TableHead>
                    <TableHead className="w-[180px] font-bold">Date</TableHead>
                    <TableHead className="w-[140px] font-bold">Docs ID</TableHead>
                    <TableHead className="font-bold">Company</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="w-[140px] font-bold">Status</TableHead>
                    <TableHead className="text-right w-[80px] font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody><AnimatePresence>{orderRowSkeletons}</AnimatePresence></TableBody>
              </Table>
            </div>
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
            <Table wrapperClassName="w-full h-[65vh] 2xl:h-[75vh]" className="relative">
                <TableHeader className="sticky top-0 bg-muted border-b z-20 shadow-sm">
                  <TableRow className="bg-muted hover:bg-muted [&>th]:bg-transparent">
                    <TableHead className="w-16 text-center font-bold">SL</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Docs ID</TableHead>
                    <TableHead className="font-bold">Company</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="w-32 font-bold">Status</TableHead>
                    <TableHead className="text-right w-20 font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="relative z-10">
                  <AnimatePresence mode="popLayout">
                    {formattedOrders.map((order, index) => (
                      <OrderTableRow 
                        key={order.id}
                        order={order}
                        index={index}
                        totalCount={filteredAndSortedOrders.length}
                        onView={handleViewDetails}
                        onCopy={handleCopyDocs}
                        onDelete={handleDeleteOrder}
                      />
                    ))}
                  </AnimatePresence>
                  {hasMore && (
                    <tr ref={sentinelRef} className="h-10">
                      <TableCell colSpan={7} className="text-center py-4">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Loading more...</span>
                        </div>
                      </TableCell>
                    </tr>
                  )}
                </TableBody>
              </Table>
          )}
        </div>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border text-sm text-muted-foreground">
          <p>Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} docs.</p>
          <div className="flex items-center space-x-2">
            {!hasMore && filteredAndSortedOrders.length > 0 && (
              <span className="text-xs italic bg-muted px-2 py-1 rounded">All docs loaded</span>
            )}
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Button variant="outline" size="sm" disabled>Export Docs</Button>
            </motion.div>
          </div>
        </div>
      </section>
      <OrderDetailsDialog
        order={selectedOrderForDetails}
        isOpen={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        allCategories={allCategories}
        onUpdateOrder={handleUpdateOrder}
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
