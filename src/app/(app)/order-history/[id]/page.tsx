
"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CalendarDays,
  FileText as FileTextIcon,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import { format, parseISO, isValid as isValidDate } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";


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

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl font-semibold mb-4 border-b-2 border-primary/20 pb-2 text-primary">{children}</h2>
);

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => (
    <div className="flex items-start">
        <Icon className="h-4 w-4 mr-3 mt-1 text-muted-foreground shrink-0" />
        <div>
            <p className="font-medium text-foreground">{decodeHtmlEntities(value) || "N/A"}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
);


const OrderItem = ({ name, description, price, quantity, subItems }: { name: string, description?: string|null, price: number, quantity: number, subItems?: SubItem[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasSubItems = subItems && subItems.length > 0;

    return (
        <div className="bg-card border p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{decodeHtmlEntities(name)}</h3>
                    {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{decodeHtmlEntities(description)}</p>}
                </div>
                {price > 0 && <p className="font-bold text-foreground ml-4 whitespace-nowrap">৳ {(price * quantity).toLocaleString()}</p>}
            </div>
            
            {hasSubItems && (
                <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs h-auto p-1 mt-2 text-primary hover:text-primary/80"
                >
                    {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                    {isExpanded ? 'Hide' : 'Show'} Variations ({subItems.length})
                </Button>
            )}

            {hasSubItems && isExpanded && (
                <div className="mt-2 pl-4 border-l-2 border-primary/20 space-y-1 bg-muted/30 p-2 rounded-r-md">
                    {subItems.map((sub, index) => (
                        <div key={sub.id || index} className="flex justify-between items-baseline text-sm p-1.5 bg-card/50 rounded-md">
                            <p className="text-foreground/90">{decodeHtmlEntities(sub.name)}</p>
                            {typeof sub.price === 'number' && <p className="font-medium">৳ {sub.price.toLocaleString()}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default function ClientOrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { clientUser, clientLoading } = useClientAuth();
    const orderIdFromUrl = params.id as string;
    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
    const { toast } = useToast();

    useEffect(() => {
        if (clientLoading) return;
        if (!clientUser) {
            router.push('/login');
            return;
        }
        if (!orderIdFromUrl) return;

        const fetchOrderAndCategoryDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                 // Fetch categories from API
                const [restaurantCategoriesResponse, parlourCategoriesResponse] = await Promise.all([
                    fetch('https://colorhutbd.xyz/vm/api/categories.php', { headers: { 'Accept': 'application/json' } }),
                    fetch('https://colorhutbd.xyz/vm/api/parlour-categories.php', { headers: { 'Accept': 'application/json' } })
                ]);
    
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

                // Get orders from local storage
                const storedOrdersRaw = localStorage.getItem('colorHutOrders');
                const rawOrdersArray = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];
                const orderData = rawOrdersArray.find((o:any) => String(o.id) === orderIdFromUrl);

                if (orderData) {
                    const orderBusinessName = orderData.customer?.restaurant;
                    if (orderBusinessName !== clientUser.businessName) {
                        setIsAuthorized(false);
                        setError("You are not authorized to view this order.");
                        setIsLoading(false);
                        return;
                    }

                    setIsAuthorized(true);
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
                        templateDescription: orderData.template?.description,
                        templateTags: orderData.template?.tags,
                    };
                    setOrder(formattedOrder);
                } else {
                    setError(`Order with ID ${orderIdFromUrl} not found.`);
                }
            } catch (e: any) {
                setError((e as Error).message || 'Failed to load order details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderAndCategoryDetails();
    }, [orderIdFromUrl, clientUser, clientLoading, router]);
    
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

    const handleShare = () => {
        if (!order) {
            toast({
                title: "Error",
                description: "Cannot share. Order details not loaded yet.",
                variant: "destructive",
            });
            return;
        }
        const shareUrl = `${window.location.origin}/share/${order.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            toast({
                title: "Link Copied!",
                description: "A shareable link is now on your clipboard.",
            });
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            toast({
                title: "Copy Failed",
                description: "Could not copy the link to your clipboard.",
                variant: "destructive"
            });
        });
    };

    if (isLoading || clientLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                 <header className="flex items-center justify-between mb-6">
                    <Skeleton className="h-10 w-40" />
                </header>
                <main className="bg-card text-card-foreground p-6 sm:p-8 rounded-lg shadow-lg space-y-8">
                    <div className="flex justify-between items-start border-b pb-6 mb-6">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-8 w-1/3 mb-4" />
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    </div>
                </main>
            </div>
        )
    }
    
    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-card p-8 rounded-lg shadow-lg border border-destructive/50">
                    {isAuthorized ? <AlertTriangle className="h-12 w-12 text-destructive mb-4 mx-auto" /> : <ShieldAlert className="h-12 w-12 text-destructive mb-4 mx-auto" />}
                    <h2 className="text-xl font-semibold text-destructive mb-2">{isAuthorized ? 'Error Loading Order' : 'Access Denied'}</h2>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <Button variant="outline" onClick={() => router.push('/order-history')} className="mt-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go to Order History
                    </Button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
             <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-card p-8 rounded-lg shadow-lg border">
                    <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                    <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                    <p className="text-muted-foreground max-w-md">The requested order could not be found.</p>
                    <Button variant="outline" onClick={() => router.push('/order-history')} className="mt-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go to Order History
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <header className="flex items-center justify-between mb-2">
                <Button variant="outline" onClick={() => router.push('/order-history')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Order History
                </Button>
                <Button onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
            </header>

            <main className="bg-card text-card-foreground p-6 sm:p-8 rounded-lg shadow-lg">
                 <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-6 mb-6 border-border">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Order #{order.orderId}
                        </h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                           <CalendarDays className="h-4 w-4" />
                           {formatDate(order.orderDate)}
                        </p>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                        <SectionTitle>Your Information</SectionTitle>
                        <DetailRow icon={User} label="Name" value={order.customerName} />
                        <DetailRow icon={Phone} label="Phone Number" value={order.customerPhone} />
                        <DetailRow icon={Mail} label="Email" value={order.customerEmail} />
                    </div>
                     <div className="space-y-4">
                        <SectionTitle>Business Information</SectionTitle>
                        <DetailRow icon={Building} label="Business Name" value={order.businessName} />
                        <DetailRow icon={Briefcase} label="Your Role" value={order.businessRole} />
                        <DetailRow icon={MapPin} label="Address" value={order.customerAddress} />
                    </div>
                </div>
                
                <Separator className="my-8" />
                
                {order.templateName !== 'Custom Selection' && order.templateImageUrl && (
                    <>
                        <section>
                            <SectionTitle>Selected Template</SectionTitle>
                            <Card className="overflow-hidden shadow-sm">
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/3 relative aspect-[4/3] bg-muted">
                                        <Image 
                                            src={order.templateImageUrl}
                                            alt={decodeHtmlEntities(order.templateName) || 'Template Image'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    </div>
                                    <div className="flex-1 p-6">
                                        <h3 className="text-lg font-bold text-foreground">{decodeHtmlEntities(order.templateName)}</h3>
                                        {order.templateDescription && <p className="text-sm text-muted-foreground mt-1">{decodeHtmlEntities(order.templateDescription)}</p>}
                                        {order.templateTags && order.templateTags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {order.templateTags.map(tag => (
                                                    <Badge key={tag} variant="secondary">{tag}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </section>
                        <Separator className="my-8" />
                    </>
                )}
                
                <section>
                    <SectionTitle>Selected Items</SectionTitle>
                    {groupedItems && Object.keys(groupedItems).length > 0 ? (
                        <div className="space-y-8">
                            {Object.entries(groupedItems).map(([categoryName, items]) => (
                                <div key={categoryName}>
                                    <h3 className="text-lg font-semibold mb-4 text-foreground/90">
                                        {categoryName}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {items.map((item, index) => (
                                            <OrderItem
                                                key={`${item.id}-${index}`}
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
                        <p className="text-muted-foreground text-center py-4">No items were found in this order.</p>
                    )}
                </section>

            </main>
        </div>
    )
}
