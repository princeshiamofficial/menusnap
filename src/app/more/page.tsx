
"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Layers, Search, Maximize, AlertTriangle, X, Package } from "lucide-react"; 
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { decodeHtmlEntities } from '@/lib/utils';
import Link from 'next/link';

// Use the same Product interface from the admin page
interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrls: string[];
  videoUrls: string[];
  isPublished: boolean;
  createdAt: string;
}

// Mock data, same as in the admin page for consistency
const MOCK_PRODUCTS: Product[] = Array.from({ length: 25 }, (_, i) => ({
  id: `prod_${i + 1}`,
  name: `Premium Gadget ${i + 1}`,
  description: `An amazing premium gadget with feature set ${String.fromCharCode(65 + i)}. Discover its unique capabilities and how it can enhance your daily life.`,
  category: ['Electronics', 'Home Goods', 'Apparel', 'Books'][i % 4],
  imageUrls: [`https://placehold.co/600x400.png?text=P${i+1}`],
  videoUrls: [],
  isPublished: Math.random() > 0.2,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

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
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
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
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        // MOCK API Call
        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts(MOCK_PRODUCTS);
      } catch (e: any) {
        console.error("Failed to fetch products:", e);
        setError(e.message || "Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);


  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => product.isPublished);
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(product =>
            decodeHtmlEntities(product.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && decodeHtmlEntities(product.description).toLowerCase().includes(searchTerm.toLowerCase())) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [products, searchTerm]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Our Products
            </h1>
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Browse our collection of high-quality products.
          </p>
        </div>
        <div className="relative w-full sm:w-auto mt-4 sm:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10 w-full sm:w-64 md:w-72 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      <main>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
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
                {searchTerm ? "No products match your search." : "No products available at the moment."}
              </p>
            </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard
                  product={product}
                  onPreview={setPreviewImageUrl}
                />
              </motion.div>
            ))}
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
