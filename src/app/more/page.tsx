
"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Layers, 
  Search, 
  Maximize, 
  AlertTriangle, 
  X, 
  Package,
  BookOpen,
  FileText,
  FileImage,
  CreditCard,
  Contact,
  Presentation,
  Book,
  BookCopy,
  Star,
  MonitorSmartphone,
  Gift,
  Building,
  Thermometer,
  Trees,
  Users,
  Sun,
  Palette,
  LayoutTemplate,
  KanbanSquare,
} from "lucide-react"; 
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { decodeHtmlEntities, cn } from '@/lib/utils';
import Link from 'next/link';
import { getProducts, type Product } from '@/lib/product-api';

const productCategories = [
    { value: 'Menu Cover', label: 'Menu Cover', icon: Book },
    { value: 'Restaurant Menu', label: 'Restaurant Menu', icon: BookOpen },
    { value: 'Parlour / Salon Menu', label: 'Parlour / Salon Menu', icon: FileText },
    { value: 'Business Card', label: 'Business Card', icon: Contact },
    { value: 'Restaurant Token / Coupon', label: 'Restaurant Token / Coupon', icon: Gift },
    { value: 'Membership Card', label: 'Membership Card', icon: CreditCard },
    { value: 'Leaflet / Brochure', label: 'Leaflet / Brochure', icon: BookCopy },
    { value: 'Banner', label: 'Banner', icon: Presentation },
    { value: 'Bill Folder', label: 'Bill Folder', icon: FileText },
    { value: 'Reservation Card', label: 'Reservation Card', icon: FileImage },
    { value: 'Packaging Box', label: 'Packaging Box', icon: Package },
    { value: 'Branded Carry Bag', label: 'Branded Carry Bag', icon: Package },
    { value: 'Air Conditioner (AC)', label: 'Air Conditioner (AC)', icon: Thermometer },
    { value: 'Furniture', label: 'Furniture', icon: Building },
    { value: 'Nursery / Indoor Plants', label: 'Nursery / Indoor Plants', icon: Trees },
    { value: 'Social Media Management', label: 'Social Media Management', icon: Users },
    { value: 'IPS / Solar Unit', label: 'IPS / Solar Unit', icon: Sun },
    { value: 'Sign Board', label: 'Sign Board', icon: Package },
    { value: '3D Wall Sticker / Wall Art', label: '3D Wall Sticker / Wall Art', icon: Palette },
    { value: 'Interior Design', label: 'Interior Design', icon: LayoutTemplate },
    { value: 'ERP System', label: 'ERP System', icon: KanbanSquare },
    { value: 'Team Tracker & Routine', label: 'Team Tracker & Routine', icon: KanbanSquare },
    { value: 'Digital Menu', label: 'Digital Menu', icon: MonitorSmartphone },
];

const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x400.png";

const StarRating = ({ rating, className }: { rating: number; className?: string }) => (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            rating > index ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
);

interface ProductPreviewDialogProps {
  imageUrl: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function ProductPreviewDialog({ imageUrl, isOpen, onOpenChange }: ProductPreviewDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-2 bg-transparent border-none shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Product Preview</DialogTitle>
            <DialogDescription>A larger view of the selected product image.</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt="Product Preview"
              fill
              className="object-contain"
              data-ai-hint="product full-view"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
            />
          </div>
          <DialogClose asChild>
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-10 w-10 bg-black/50 text-white hover:bg-black/70 rounded-full"
                aria-label="Close preview"
              >
                <X className="h-6 w-6" />
              </Button>
          </DialogClose>
      </DialogContent>
    </Dialog>
  );
}


interface ProductCardProps {
  product: Product;
  onPreview: (imageUrl: string) => void;
}

function ProductCard({ product, onPreview }: ProductCardProps): ReactNode {
  const { imageUrls, name, description } = product;
  const primaryImage = imageUrls?.[0] || DEFAULT_PRODUCT_IMAGE;
  
  const mockRating = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < product.id.length; i++) {
        const char = product.id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    const rating = Math.abs(hash % 16) / 10 + 3.5;
    return parseFloat(rating.toFixed(1));
  }, [product.id]);

  return (
    <motion.div
      className="h-full"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Link href={`/products/${product.id}`} passHref>
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col h-full cursor-pointer">
          <CardHeader className="p-0 relative">
            <div className="aspect-[4/3] relative group">
              <Image
                src={primaryImage}
                alt={decodeHtmlEntities(name)}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="product image"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 h-9 w-9 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                aria-label="Maximize product preview"
                onClick={(e) => { e.preventDefault(); onPreview(primaryImage); }}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <h2 className="text-lg font-semibold mb-1.5 text-foreground">{decodeHtmlEntities(name)}</h2>
            <StarRating rating={mockRating} />
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed min-h-[40px] line-clamp-2">{decodeHtmlEntities(description)}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

function ProductSkeletonCard(): ReactNode {
  return (
    <Card className="overflow-hidden shadow-md rounded-lg flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <Skeleton className="aspect-[4/3] w-full" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />
      </CardContent>
    </Card>
  );
}


export default function MorePage(): ReactNode {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { toast } = useToast();

  const navItems = useMemo(() => [
    { value: 'all', label: 'All Products', icon: Layers },
    ...productCategories
  ], []);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (e: any) {
        console.error("Failed to fetch products:", e);
        setError(e.message || "Failed to load products. Please try again later.");
        toast({
            title: "Error Loading Products",
            description: e.message || "Could not retrieve products from the server.",
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [toast]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => product.isPublished);

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(product =>
            decodeHtmlEntities(product.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && decodeHtmlEntities(product.description).toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    return filtered.sort((a, b) => {
      try {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } catch {
          return 0;
      }
    });
  }, [products, searchTerm, activeCategory]);

  return (
    <div className="p-0 space-y-6">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary via-orange-400 to-amber-300" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center mb-1">
                      <Image src="https://colorhutbd.xyz/image/logo.png" alt="Color Hut Logo" width={200} height={60} className="mr-3" />
                      
                    </h1>
                    <p className="text-muted-foreground">Explore our wide range of quality products and services.</p>
                </div>
                 <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-10 w-full text-sm bg-muted border-border/70 focus:bg-background focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar - now on the left */}
        <aside className="hidden md:block w-1/4 lg:w-1/5 md:sticky md:top-28 self-start bg-card p-4 rounded-lg shadow-lg border">
           <h3 className="text-lg font-semibold mb-4">Categories</h3>
           <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-1">
                {navItems.map(item => (
                  <Button
                    key={item.value}
                    variant="ghost"
                    onClick={() => setActiveCategory(item.value)}
                    className={cn(
                      "w-full justify-start text-muted-foreground",
                      activeCategory === item.value && "bg-muted text-primary font-semibold"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4"/>
                    {item.label}
                  </Button>
                ))}
              </div>
           </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="w-full md:w-3/4 lg:w-4/5">
          {/* Mobile Category Dropdown */}
          <div className="md:hidden mb-6">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-2 pb-2">
                  {navItems.map(item => (
                    <Button
                      key={item.value}
                      variant={activeCategory === item.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(item.value)}
                      className="shrink-0"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <ProductSkeletonCard key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center py-10 bg-card border border-destructive/50 rounded-lg shadow-md">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
              <p className="text-muted-foreground max-w-md">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-6">
                Try Again
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
              <div className="text-center py-10 bg-card rounded-lg shadow border border-border">
                <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg font-medium">
                  {searchTerm ? "No products match your search." : "No products available in this category."}
                </p>
              </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                  {filteredProducts.map((product) => (
                  <ProductCard
                      key={product.id}
                      product={product}
                      onPreview={setPreviewImageUrl}
                  />
                  ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
        
      </div>

      <ProductPreviewDialog
        imageUrl={previewImageUrl}
        isOpen={!!previewImageUrl}
        onOpenChange={() => setPreviewImageUrl(null)}
      />
    </div>
  );
}
