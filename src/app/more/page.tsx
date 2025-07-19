
"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  Menu,
} from "lucide-react"; 
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { decodeHtmlEntities, cn } from '@/lib/utils';
import Link from 'next/link';
import { getProducts, type Product } from '@/lib/product-api';

const productCategories = [
  { value: 'Menu Book', label: 'Menu Book', icon: BookOpen },
  { value: 'Menu Card', label: 'Menu Card', icon: FileText },
  { value: 'Leaflet', label: 'Leaflet', icon: FileImage },
  { value: 'Brochure', label: 'Brochure', icon: BookCopy },
  { value: 'Membership Card', label: 'Membership Card', icon: CreditCard },
  { value: 'Business Card', label: 'Business Card', icon: Contact },
  { value: 'X Banner', label: 'X Banner', icon: Presentation },
  { value: 'Menu Book Cover', label: 'Menu Book Cover', icon: Book },
];

const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/600x400.png";


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

  return (
    <motion.div
      className="h-full"
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg flex flex-col h-full">
        <CardHeader className="p-0 relative">
          <div className="aspect-[4/3] relative group">
            <Image
              src={primaryImage}
              alt={decodeHtmlEntities(name)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint="product image"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 h-9 w-9 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
              aria-label="Maximize product preview"
              onClick={() => onPreview(primaryImage)}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h2 className="text-lg font-semibold mb-1.5 text-foreground">{decodeHtmlEntities(name)}</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed min-h-[40px] line-clamp-2">{decodeHtmlEntities(description)}</p>
        </CardContent>
        <CardFooter className="p-4 border-t mt-auto">
            <Button variant="outline" className="w-full" asChild>
                <Link href={`/products/${product.id}`}>View Details</Link>
            </Button>
        </CardFooter>
      </Card>
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
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-3" />
      </CardContent>
      <CardFooter className="p-4 border-t mt-auto">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
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
  const router = useRouter();

  const navItems = productCategories;

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


  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['all', ...uniqueCategories];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => product.isPublished);

    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(product =>
            decodeHtmlEntities(product.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && decodeHtmlEntities(product.description).toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    // Then sort the results by creation date
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
        <div className="h-2.5 bg-gradient-to-r from-primary via-orange-400 to-amber-300" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3">
            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-4">
                {navItems.slice(0, 4).map(item => (
                  <button key={item.label} onClick={() => setActiveCategory(item.label)} className={cn("flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors", activeCategory === item.label && "text-primary")}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="relative flex-grow max-w-xs mx-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 w-full text-sm bg-muted border-border/70 focus:bg-background focus:border-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                 {navItems.slice(4).map(item => (
                  <button key={item.label} onClick={() => setActiveCategory(item.label)} className={cn("flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors", activeCategory === item.label && "text-primary")}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Menu className="h-4 w-4" />
                                <span>Categories</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                        {navItems.map(item => (
                            <DropdownMenuItem key={item.label} onClick={() => setActiveCategory(item.label)} className={cn("flex items-center gap-2", activeCategory === item.label && "bg-accent")}>
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                <span>{item.label}</span>
                            </DropdownMenuItem>
                        ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="relative flex-grow max-w-[60%]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-10 w-full text-sm bg-muted border-border/70 focus:bg-background focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 md:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
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

      <ProductPreviewDialog
        imageUrl={previewImageUrl}
        isOpen={!!previewImageUrl}
        onOpenChange={() => setPreviewImageUrl(null)}
      />
    </div>
  );
}
