
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  AlertTriangle, 
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
} from "lucide-react"; 
import { decodeHtmlEntities, cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

const MOCK_PRODUCTS: Product[] = Array.from({ length: 25 }, (_, i) => ({
  id: `prod_${i + 1}`,
  name: `Premium ${productCategories[i % productCategories.length].label}`,
  description: `An amazing premium product for your business. Discover its unique capabilities and how it can enhance your brand. This description can be quite long to demonstrate how text wraps and fills the space available, providing more context to potential customers who are interested in the product.`,
  category: productCategories[i % productCategories.length].value,
  imageUrls: [
    `https://placehold.co/800x600.png?text=P${i+1}-1`,
    `https://placehold.co/800x600.png?text=P${i+1}-2`,
    `https://placehold.co/800x600.png?text=P${i+1}-3`,
    `https://placehold.co/800x600.png?text=P${i+1}-4`,
  ],
  videoUrls: [],
  isPublished: Math.random() > 0.2,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

const mockReviews = [
    { id: 1, name: 'Sabbir Ahmed', rating: 5, comment: 'Absolutely top-notch quality and service! The menu books completely transformed our restaurant\'s image. Highly recommended.' },
    { id: 2, name: 'Jannatul Ferdous', rating: 4, comment: 'Great products and fast delivery. The business cards were exactly what we wanted. A little bit pricey but worth it.' },
    { id: 3, name: 'Rezaul Karim', rating: 5, comment: 'The X Banners are fantastic and very durable. Color Hut team was very helpful throughout the process.' },
    { id: 4, name: 'Fatima Akter', rating: 5, comment: 'We are very happy with the membership cards. The design is elegant and the quality is superb. Will order again.' },
];

const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/800x600.png";

function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden h-full transition-all duration-300 ease-in-out border-border/50 hover:border-primary/50 hover:shadow-lg">
        <div className="aspect-square relative">
          <Image
            src={product.imageUrls[0] || DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            data-ai-hint="related product"
          />
        </div>
        <CardContent className="p-3">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {decodeHtmlEntities(product.name)}
          </h3>
          <p className="text-xs text-muted-foreground">{product.category}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

const StarRating = ({ rating, className }: { rating: number; className?: string }) => (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "h-5 w-5",
            rating > index ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
);


export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      setError(null);
      // Mock fetching product data
      setTimeout(() => {
        const foundProduct = MOCK_PRODUCTS.find(p => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          setSelectedImage(foundProduct.imageUrls?.[0] || null);
        } else {
          setError("Product not found.");
        }
        setIsLoading(false);
      }, 500);
    }
  }, [productId]);

  const CategoryIcon = useMemo(() => {
    return productCategories.find(c => c.value === product?.category)?.icon || Package;
  }, [product?.category]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return MOCK_PRODUCTS
      .filter(p => p.id !== product.id && p.category === product.category && p.isPublished)
      .slice(0, 4);
  }, [product]);

  const handleContact = () => {
    toast({
      title: "Contact Us",
      description: "You can reach us via WhatsApp or Phone from the floating help button!",
    });
  };
  
  const averageRating = useMemo(() => {
    if (mockReviews.length === 0) return 0;
    const total = mockReviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((total / mockReviews.length).toFixed(1));
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl p-4 md:p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="mt-4 grid grid-cols-4 gap-4">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="aspect-square w-full rounded-md" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button variant="outline" onClick={() => router.push('/more')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-8">
        <Button variant="outline" onClick={() => router.push('/more')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Products
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Image Gallery */}
        <div className="sticky top-8">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedImage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg border bg-muted"
            >
              <Image 
                src={selectedImage || DEFAULT_PRODUCT_IMAGE} 
                alt={product.name} 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                data-ai-hint="product detail"
              />
            </motion.div>
          </AnimatePresence>
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2 md:gap-4">
              {product.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(url)}
                  className={cn(
                    "aspect-square w-full relative overflow-hidden rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    selectedImage === url ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={url} alt={`Thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint="product thumbnail"/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <Badge variant="outline" className="text-sm py-1 px-3">
            <CategoryIcon className="mr-2 h-4 w-4" />
            {product.category}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{decodeHtmlEntities(product.name)}</h1>
          <div className="text-muted-foreground space-y-3 leading-relaxed">
            <p>{decodeHtmlEntities(product.description)}</p>
          </div>
          <Button size="lg" className="w-full" onClick={handleContact}>
            Contact Us for Pricing & Details
          </Button>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-20">
        <Separator className="mb-10" />
        <h2 className="text-2xl font-bold text-center mb-2">What Our Customers Say</h2>
        <div className="flex justify-center items-center gap-2 mb-8">
          <StarRating rating={averageRating} />
          <span className="text-muted-foreground text-sm">({averageRating} average from {mockReviews.length} reviews)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockReviews.map(review => (
            <Card key={review.id} className="bg-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                    <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=${review.id}`} alt={review.name} data-ai-hint="person avatar"/>
                        <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">{review.name}</p>
                        <StarRating rating={review.rating} />
                    </div>
                </div>
                <p className="text-muted-foreground text-sm">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <Separator className="mb-10" />
          <h2 className="text-2xl font-bold text-center mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(relatedProduct => (
              <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

