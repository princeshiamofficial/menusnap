
"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Layers, Search, Star, Maximize, AlertTriangle, X, MoreHorizontal, Hand, BookOpen, FileText, FileImage } from "lucide-react"; 
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BubbleConfetti } from '@/components/ui/bubble-confetti';
import { useToast } from "@/hooks/use-toast";
import { useClientAuth } from '@/hooks/use-client-auth';
import { decodeHtmlEntities } from '@/lib/utils';
import Link from 'next/link';

interface ApiTemplate {
  id: string;
  name: string; 
  description: string;
  isTopRated?: boolean;
  isPublished: boolean;
  tags: string[];
  imageUrl: string;
  createdAt?: string; 
}

interface TemplatePreviewDialogProps {
  imageUrl: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function TemplatePreviewDialog({ imageUrl, isOpen, onOpenChange }: TemplatePreviewDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-2 bg-transparent border-none shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>A larger view of the selected template.</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt="Template Preview"
              fill
              className="object-contain"
              data-ai-hint="template full-view"
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


interface TemplateCardProps {
  template: ApiTemplate;
  onPreview: (imageUrl: string) => void;
  onSelect: (template: ApiTemplate) => void;
  isSelectionAllowed: boolean;
}

const DEFAULT_TEMPLATE_IMAGE_URL = 'https://erp.colorhutbd.xyz/file/uploads/68502bf9cec52_placeholder.svg';

function TemplateCard({
  template,
  onPreview,
  onSelect,
  isSelectionAllowed,
}: TemplateCardProps): ReactNode {
  const { imageUrl, name: title, description, tags, isTopRated } = template;
  const actualImageUrl = imageUrl || DEFAULT_TEMPLATE_IMAGE_URL;
  const isUsingPlaceholder = !imageUrl || imageUrl === DEFAULT_TEMPLATE_IMAGE_URL;
  
  const getImageHint = (name: string): string => {
    return name.toLowerCase().split(' ').slice(0, 2).join(' ') || 'template design';
  }

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
              src={actualImageUrl}
              alt={decodeHtmlEntities(title)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={isUsingPlaceholder ? "placeholder abstract" : getImageHint(title)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 h-9 w-9 bg-black/40 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
              aria-label="Maximize template preview"
              onClick={() => onPreview(actualImageUrl)}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h2 className="text-lg font-semibold mb-1.5 text-foreground">{decodeHtmlEntities(title)}</h2>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed min-h-[40px]">{decodeHtmlEntities(description)}</p>
        </CardContent>
        <CardFooter className="p-4 border-t mt-auto">
          {isSelectionAllowed && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSelect(template)}
              title="Select this template"
            >
              Select Template
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function TemplateSkeletonCard(): ReactNode {
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
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [templateToConfirm, setTemplateToConfirm] = useState<ApiTemplate | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const { clientUser, clientLoading } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchTemplates() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("https://colorhutbd.xyz/vm/api/templates.php", {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`API error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.success || !result.data || !Array.isArray(result.data.templates)) {
          console.error("Invalid API response structure:", result);
          throw new Error("Invalid data format from API");
        }
        const fetchedTemplates: ApiTemplate[] = result.data.templates.map((t: any, index: number) => ({
          ...t,
          isPublished: t.isPublished === undefined ? false : Boolean(t.isPublished),
          tags: Array.isArray(t.tags) ? t.tags : [],
          imageUrl: t.imageUrl || '', // Ensure imageUrl is at least an empty string
          createdAt: t.createdAt || new Date(Date.now() - Math.random() * 10000000000 * (index + 1)).toISOString(),
        }));
        setTemplates(fetchedTemplates);
      } catch (e: any) {
        console.error("Failed to fetch templates:", e);
        setError(e.message || "Failed to load templates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();

    const orderId = localStorage.getItem('pendingOrderIdForTemplate');
    if (orderId) {
      setPendingOrderId(orderId);
    }
  }, []);

  const handleSelectTemplate = (template: ApiTemplate) => {
    setTemplateToConfirm(template);
  };

  const handleConfirmSelection = async () => {
    if (!templateToConfirm || !pendingOrderId) return;

    try {
      // Step 1: Fetch all orders to find the one we need to update
      const ordersResponse = await fetch("https://colorhutbd.xyz/vm/api/orders.php");
      if (!ordersResponse.ok) {
        throw new Error("Could not fetch existing orders to update.");
      }
      const existingOrdersResult = await ordersResponse.json();
      
      let ordersArray = [];
      if (Array.isArray(existingOrdersResult)) {
          ordersArray = existingOrdersResult;
      } else if (existingOrdersResult.success && Array.isArray(existingOrdersResult.data)) {
          ordersArray = existingOrdersResult.data;
      } else if (existingOrdersResult.success && existingOrdersResult.data && Array.isArray(existingOrdersResult.data.orders)) {
          ordersArray = existingOrdersResult.data.orders;
      }

      const orderToUpdate = ordersArray.find((o: any) => String(o.id) === pendingOrderId);
      
      if (!orderToUpdate) {
        throw new Error(`Order #${pendingOrderId} not found on the server.`);
      }
      
      // Step 2: Create the updated payload by merging
      const updatedOrderPayload = {
        ...orderToUpdate, // This includes the existing 'items' array
        template: { // This adds/overwrites the template info
          id: templateToConfirm.id,
          name: templateToConfirm.name,
          imageUrl: templateToConfirm.imageUrl,
          description: templateToConfirm.description,
          tags: templateToConfirm.tags,
        },
      };

      // Step 3: Send the complete, updated object
      const updateResponse = await fetch("https://colorhutbd.xyz/vm/api/orders.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(updatedOrderPayload),
      });
      
      const updateResult = await updateResponse.json();
      if (!updateResponse.ok || !updateResult.success) {
        throw new Error(updateResult.message || "Failed to apply template to order.");
      }
      
      // Step 4: Update local storage as well
      try {
          const localOrdersRaw = localStorage.getItem('colorHutOrders');
          if (localOrdersRaw) {
              const localOrders = JSON.parse(localOrdersRaw);
              const orderIndex = localOrders.findIndex((o: any) => String(o.id) === pendingOrderId);
              if (orderIndex > -1) {
                  localOrders[orderIndex] = updatedOrderPayload;
                  localStorage.setItem('colorHutOrders', JSON.stringify(localOrders));
              }
          }
      } catch(e) {
          console.error("Could not update order in local storage", e);
          toast({
              title: "Local History Warning",
              description: "Your order was updated, but the local history might be out of sync.",
              variant: "default",
          });
      }

      setShowConfetti(true);
      toast({
        title: "Template Applied!",
        description: `Template "${decodeHtmlEntities(templateToConfirm.name)}" applied. Redirecting...`,
      });
      
      const orderIdToRedirect = pendingOrderId;
      localStorage.removeItem('pendingOrderIdForTemplate');
      setPendingOrderId(null);
      router.push(`/order-history/${orderIdToRedirect}`);

    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setTemplateToConfirm(null);
  };

  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => template.isPublished);

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(template =>
            decodeHtmlEntities(template.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            decodeHtmlEntities(template.description).toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    // Then sort the results
    return filtered.sort((a, b) => {
      if (a.isTopRated && !b.isTopRated) return -1;
      if (!a.isTopRated && b.isTopRated) return 1;
      if (a.createdAt && b.createdAt) {
        try {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } catch {
            return 0;
        }
      } else if (a.createdAt) {
        return -1; 
      } else if (b.createdAt) {
        return 1;  
      }
      return 0; 
    });
  }, [templates, searchTerm]);


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

  const isSelectionAllowed = !!pendingOrderId;

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
      <header>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-2 bg-card border rounded-lg shadow-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" asChild>
              <Link href="/more">
                <BookOpen className="mr-2 h-4 w-4" /> Menu Book
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/more">
                <FileText className="mr-2 h-4 w-4" /> Menu Card
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/more">
                <FileImage className="mr-2 h-4 w-4" /> Leaflet
              </Link>
            </Button>
          </div>
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-10 w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main>
        {isLoading || clientLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <TemplateSkeletonCard key={index} />
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
        ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? "No published templates match your search." : "No published templates available."}
              </p>
            </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredTemplates.map((template) => (
              <motion.div key={template.id} variants={itemVariants}>
                <TemplateCard
                  template={template}
                  onPreview={setPreviewImageUrl}
                  onSelect={handleSelectTemplate}
                  isSelectionAllowed={isSelectionAllowed}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <AlertDialog open={!!templateToConfirm} onOpenChange={(open) => !open && setTemplateToConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Template Selection</AlertDialogTitle>
            <AlertDialogDescription>
              Apply the "{decodeHtmlEntities(templateToConfirm?.name)}" template to your recent order #{pendingOrderId}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSelection}>
              Confirm &amp; Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showConfetti && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
          <BubbleConfetti onComplete={() => setShowConfetti(false)} />
        </div>
      )}

      <TemplatePreviewDialog
        imageUrl={previewImageUrl}
        isOpen={!!previewImageUrl}
        onOpenChange={() => setPreviewImageUrl(null)}
      />
    </div>
  );
}
