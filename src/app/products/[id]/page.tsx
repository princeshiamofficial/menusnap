
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  Video,
  PlayCircle,
  HelpCircle,
  MessageSquare,
  ShoppingCart,
} from "lucide-react";
import { decodeHtmlEntities, cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProduct, getProducts, type Product } from '@/lib/product-api';
import MDEditor from '@uiw/react-md-editor';


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

const mockReviews = [
  { id: 1, name: 'Sabbir Ahmed', rating: 5, comment: 'Absolutely top-notch quality and service! The menu books completely transformed our restaurant\'s image. Highly recommended.' },
  { id: 2, name: 'Jannatul Ferdous', rating: 4, comment: 'Great products and fast delivery. The business cards were exactly what we wanted. A little bit pricey but worth it.' },
  { id: 3, name: 'Rezaul Karim', rating: 5, comment: 'The X Banners are fantastic and very durable. Color Hut team was very helpful throughout the process.' },
  { id: 4, name: 'Fatima Akter', rating: 5, comment: 'We are very happy with the membership cards. The design is elegant and the quality is superb. Will order again.' },
];

const FAQS = [
  { q: "কাজ সম্পন্ন করতে কত সময় লাগবে?", a: "আপনার প্যাকেজের উপর নিরভর করে একটি লোগো করতে সর্বনিম্ন ২ দিন থেকে ৫ দিনের মধ্যে হয়ে যাবে। কিন্তু আপনার ফিডব্যাক নেওয়ার পর রিভিশন দিয়ে ফাইনাল লোগো পেতে আর ১/২ দিন বেশী সময় লাগবে। আর যদি আপনার খুবি আর্জেন্ট ডিজাইন প্রয়োজন হয় সে ক্ষেত্রে আলোচনা সাপেক্ষে কিছু টাকা বেশী দিয়ে দ্রুত লোগো করে নিতে পারবেন।" },
  { q: "ঢাকার বাইরে অবস্থান করলে কোনো সমস্যা হবে কি?", a: "আমরা সবসময়ই আমাদের ক্লায়েন্টদের খুশি রাখতে চেষ্টা করি এবং তাদের মন মত ভালো মানের ডিজাইন করে দেই লোগোর ক্ষেত্রে আপনি প্যাকেজ ভেদে সর্বনিম্ন ২ থেকে ৪ টি আলাদা আলাদা কনসেপ্ট পাবেন। এছাড়াও প্যাকেজ ভেদে রয়েছে ৩ টি থেকে আনলিমিটেড রিভিশনের সুযোগ। যদি এর পর আপনার লোগো ভালো না লাগে তাহলে কিছু টাকা আলাদা ভাবে আপনি দিয়ে নতুন কনসেপ্ট করাতে পারেন।" },
  { q: "ওপেনিংয়ের কতদিন আগে অর্ডার দিতে হবে?", a: "আমরা সবসময় উইনিক কাজ করার চেষ্টা করি। তাই আমাদের থেকে লোগো করানোর পর আপনি চাইলে গুগল ইমেজ সার্চ করে যাচাই করে নিতে পারেন আপনার লোগো কপি কিনা।" },
  { q: "ডিজাইন অনলাইনে হবে, নাকি সরাসরি বসে করতে হবে?", a: "অনলাইন জগতে আপনার ব্যবসা শুরু করার জন্য যা যা প্রয়োজন আপনি সবি পাবেন আমাদের কাছে। ফেসবুক পেজ সেটআপ , গুগল অ্যাড ক্যাম্পেইন, ওয়েবসাইট ডেভেলপমেন্ট থেকে শুরু করে আপনার যা যা প্রয়োজন সবি পাবেন আমাদের কাছে।" },
  { q: "ডেলিভারি আপনারা দেবেন, নাকি আমাদের নিতে হবে?", a: "আমরা প্রিন্টিং সার্ভিস দেইনা, তবে আপনি চাইলে আমরা আপনাকে আপনার ডিজাইন কোথা থেকে প্রিন্ট করতে পারেন সেই ঠিকানা দিয়ে দিতে পারবো।" },
  { q: "আপনারা কী কী অতিরিক্ত সাপোর্ট দেন?", a: "আমাদের সার্ভিস অর্ডার করার সিস্টেম অটোমেটিক, আপনার যে প্যাকেজ প্রয়োজন আপনি সেই প্যাকেজ টি সিলেক্ট করে সর্বমোট খরছের ৫০% এডভান্স করে দিবেন। সাইটে দেওয়া বিকাশ, নগদ নাম্বারে ।" },
  { q: "মেনুর ছবি কি আমাদের দিতে হবে?", a: "আমরা প্রিন্টিং সার্ভিস দেইনা, তবে আপনি চাইলে আমরা আপনাকে আপনার ডিজাইন কোথা থেকে প্রিন্ট করতে পারেন সেই ঠিকানা দিয়ে দিতে পারবো।" },
  { q: "মেনু লিস্টের কোনো গাইডলাইন কি পাব?", a: "আমাদের সার্ভিস অর্ডার করার সিস্টেম অটোমেটিক, আপনার যে প্যাকেজ প্রয়োজন আপনি সেই প্যাকেজ টি সিলেক্ট করে সর্বমোট খরছের ৫০% এডভান্স করে দিবেন। সাইটে দেওয়া বিকাশ, নগদ নাম্বারে ।" }
];

const DEFAULT_PRODUCT_IMAGE = "https://placehold.co/800x600.png";

type MediaType = {
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (error) {
    console.error("Invalid video URL:", url, error);
    return null;
  }
}

function getYouTubeThumbnail(url: string): string {
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
  } catch {
    // fall through
  }
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : DEFAULT_PRODUCT_IMAGE;
}


function RelatedProductCard({ product }: { product: Product }) {
  // Create a deterministic "mock" rating based on product ID for related products
  const mockRating = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < product.id.length; i++) {
      const char = product.id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    const rating = Math.abs(hash % 16) / 10 + 3.5; // Results in a range from 3.5 to 5.0
    return parseFloat(rating.toFixed(1));
  }, [product.id]);

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
          <StarRating rating={mockRating} className="mt-1" />
          <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
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
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mediaGallery, setMediaGallery] = useState<MediaType[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  const [productLink, setProductLink] = useState('');

  useEffect(() => {
    // This effect runs only on the client side after the component mounts,
    // so `window` is safely available.
    setProductLink(window.location.href);
  }, []);

  useEffect(() => {
    async function fetchProductData() {
      if (!productId) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetchedProduct = await getProduct(productId);
        setProduct(fetchedProduct);

        const images: MediaType[] = (fetchedProduct.imageUrls || []).map(url => ({ type: 'image', url, thumbnail: url }));
        let video: MediaType | null = null;
        if (fetchedProduct.videoUrl) {
          video = {
            type: 'video',
            url: getYouTubeEmbedUrl(fetchedProduct.videoUrl) || fetchedProduct.videoUrl,
            thumbnail: getYouTubeThumbnail(fetchedProduct.videoUrl)
          };
        }

        let gallery: MediaType[] = [...images];
        if (video) {
          // Insert video at the second position if there are images, otherwise first.
          gallery.splice(gallery.length > 0 ? 1 : 0, 0, video);
        }

        setMediaGallery(gallery);
        setSelectedMedia(gallery[0] || null);

        // Fetch related products
        const allProducts = await getProducts();
        const related = allProducts
          .filter(p => p.id !== fetchedProduct.id && p.category === fetchedProduct.category && p.isPublished)
          .slice(0, 4);
        setRelatedProducts(related);

      } catch (err: any) {
        setError(err.message || "Failed to fetch product details.");
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProductData();
  }, [productId, toast]);

  const CategoryIcon = useMemo(() => {
    return productCategories.find(c => c.value === product?.category)?.icon || Package;
  }, [product?.category]);

  const averageRating = useMemo(() => {
    if (mockReviews.length === 0) return 0;
    const total = mockReviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((total / mockReviews.length).toFixed(1));
  }, []);

  const whatsappText = `Hello, I’m interested in this product (${productLink}). Can you please provide more information?`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=8801919760626&text=${encodeURIComponent(whatsappText)}`;


  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl p-4 md:p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="mt-4 grid grid-cols-5 gap-4">
              <Skeleton className="aspect-square w-full rounded-md" />
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
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="mt-6">
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
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Products
        </Button>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-2 md:items-start gap-8 lg:gap-12">
        {/* Media Gallery */}
        <div className="md:sticky md:top-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMedia?.url}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg border bg-muted"
            >
              {selectedMedia?.type === 'image' ? (
                <Image
                  src={selectedMedia.url || DEFAULT_PRODUCT_IMAGE}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  data-ai-hint="product detail"
                  priority
                />
              ) : selectedMedia?.type === 'video' ? (
                <iframe
                  className="w-full h-full"
                  src={selectedMedia.url}
                  title={`Product Video for ${product.name}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No media selected</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {mediaGallery.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2 md:gap-4">
              {mediaGallery.map((media, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMedia(media)}
                  className={cn(
                    "aspect-square w-full relative overflow-hidden rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    selectedMedia?.url === media.url ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={media.thumbnail} alt={`Thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint="product thumbnail" />
                  {media.type === 'video' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <PlayCircle className="h-8 w-8 text-white/90" />
                    </div>
                  )}
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
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} />
            <span className="text-muted-foreground text-sm">({averageRating} average from {mockReviews.length} reviews)</span>
          </div>

          <Button size="lg" className="w-full" asChild>
            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Contact Us for Pricing & Details
            </Link>
          </Button>


          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <section className="p-4 bg-card rounded-lg shadow-md drop-shadow-md" data-color-mode="light">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3 flex items-center"><FileText className="mr-2 h-5 w-5" />Description</h3>
                  <MDEditor.Markdown source={product.description} className="bg-white text-black p-2" />
                </section>
                <section className="p-4 bg-card rounded-lg shadow-md drop-shadow-md">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3 flex items-center"><MessageSquare className="mr-2 h-5 w-5" />Review</h3>
                  <p className="text-muted-foreground">Customer reviews will be shown here.</p>
                </section>
                <section className="p-4 bg-card rounded-lg shadow-md drop-shadow-md">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3 flex items-center"><ShoppingCart className="mr-2 h-5 w-5" />How to Order</h3>
                  <p className="text-muted-foreground">Instructions on how to order this product will be listed here.</p>
                </section>
                <section className="p-4 bg-card rounded-lg shadow-inner drop-shadow-xl">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-3 flex items-center"><HelpCircle className="mr-2 h-5 w-5" />FAQ</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {FAQS.map((faq, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{faq.q}</AccordionTrigger>
                        <AccordionContent>
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              </div>
            </TabsContent>
            <TabsContent value="details" className="mt-4">
              <p className="text-muted-foreground">Detailed specifications of the product will be listed here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Related Products Section */}
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

      {/* Reviews Section */}
      <div className="mt-20">
        <Separator className="mb-10" />
        <h2 className="text-2xl font-bold text-center mb-8">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockReviews.map(review => (
            <Card key={review.id} className="bg-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={`https://i.pravatar.cc/40?u=${review.id}`} alt={review.name} data-ai-hint="person avatar" />
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
    </div>
  );
}
