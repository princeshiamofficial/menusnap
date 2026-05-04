
"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Star, Maximize, AlertTriangle, X } from "lucide-react"; 
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BubbleConfetti } from '@/components/ui/bubble-confetti';
import { useToast } from "@/hooks/use-toast";
import { useClientAuth } from '@/hooks/use-client-auth';
import { decodeHtmlEntities } from '@/lib/utils';
import { getTemplatesFromMySql, updateOrderInMySql, getOrdersFromMySql } from '@/app/actions/orders';

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
      <DialogContent className="max-w-4xl w-[95vw] md:w-full h-[80vh] md:h-[90vh] p-0 bg-transparent border-none shadow-none outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>A larger view of the selected template.</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full bg-black/5 rounded-2xl overflow-hidden">
            <Image
              src={imageUrl}
              alt="Template Preview"
              fill
              className="object-contain"
              data-ai-hint="template full-view"
              sizes="(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 1000px"
              priority
            />
          </div>
          <DialogClose asChild>
             <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 h-10 w-10 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 rounded-full shadow-2xl z-50 transition-all active:scale-95"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
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
      <Card className="overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl flex flex-col h-full border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="p-0 relative">
          <div className="aspect-[4/3] relative group">
            <Image
              src={actualImageUrl}
              alt=""
              fill
              className="object-cover blur-xl opacity-95"
              priority={false}
              aria-hidden="true"
            />
            <Image
              src={actualImageUrl}
              alt={decodeHtmlEntities(title)}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-contain relative z-10 transition-all duration-500 group-hover:scale-105 drop-shadow-xl group-hover:drop-shadow-2xl"
              data-ai-hint={isUsingPlaceholder ? "placeholder abstract" : getImageHint(title)}
            />
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.15)] pointer-events-none z-20 group-hover:shadow-[inset_0_0_60px_rgba(0,0,0,0.2)] transition-shadow duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
            {isTopRated && (
              <Badge className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 border-yellow-500 font-bold py-0.5 px-1.5 shadow-lg border-none scale-75 md:scale-100 origin-top-left z-30">
                <Star className="h-3 w-3 mr-1 fill-current text-yellow-900" />
                TOP RATED
              </Badge>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-2 right-2 h-7 w-7 md:h-9 md:w-9 bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/40 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all rounded-full shadow-lg z-30"
              aria-label="Maximize template preview"
              onClick={() => onPreview(actualImageUrl)}
            >
              <Maximize className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-4 md:py-5 flex-grow bg-card transition-colors duration-300">
          <CardTitle className="text-lg md:text-xl font-bold tracking-tight mb-1.5 md:mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {decodeHtmlEntities(title)}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[40px]">
            {decodeHtmlEntities(description)}
          </CardDescription>
        </CardContent>
        {isSelectionAllowed && (
          <CardFooter className="p-2 md:p-4 border-t border-border/50 bg-muted/20">
            <Button
              variant="default"
              className="w-full h-8 md:h-11 text-[10px] md:text-sm font-semibold shadow-sm transition-all active:scale-[0.98] rounded-lg md:rounded-xl"
              onClick={() => onSelect(template)}
            >
              Select
            </Button>
          </CardFooter>
        )}
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

    </Card>
  );
}


import { ClientGate } from '@/components/auth/ClientGate';

export default function TemplatesPage(): ReactNode {
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm] = useState('');
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
        const result = await getTemplatesFromMySql();
        if (!result.success) throw new Error(result.message || "Failed to fetch local templates.");

        const fetchedTemplates: ApiTemplate[] = (result.data as any[]).map((t: any, index: number) => ({
          id: String(t.id),
          name: t.name,
          description: t.description,
          imageUrl: t.imageUrl || '',
          isPublished: Boolean(t.isPublished),
          isTopRated: Boolean(t.isTopRated),
          tags: Array.isArray(t.tags) ? t.tags : [],
          createdAt: t.createdAt || new Date().toISOString(),
        }));
        setTemplates(fetchedTemplates);
      } catch (e: any) {
        console.error("Failed to fetch templates:", e);
        setError(e.message || "Failed to load templates.");
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
      const ordersResult = await getOrdersFromMySql();
      if (!ordersResult.success) throw new Error(ordersResult.message || "Failed to fetch local orders.");

      const ordersArray = ordersResult.data as any[];
      const orderToUpdate = ordersArray.find((o: any) => String(o.id) === pendingOrderId);
      
      if (!orderToUpdate) {
        throw new Error(`Order #${pendingOrderId} not found.`);
      }
      
      const updatedOrderPayload = {
        ...orderToUpdate,
        template: {
          id: templateToConfirm.id,
          name: templateToConfirm.name,
          imageUrl: templateToConfirm.imageUrl,
          description: templateToConfirm.description,
          tags: templateToConfirm.tags,
        },
      };

      const updateResult = await updateOrderInMySql(updatedOrderPayload);
      if (!updateResult.success) {
        throw new Error(updateResult.message || "Failed to update order in local database.");
      }
      
      // Update local storage for sync if needed
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
          console.error("Could not update local storage sync", e);
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

  const getImageHint = (name: string): string => {
    return name.toLowerCase().split(' ').slice(0, 2).join(' ') || 'template design';
  }

  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => template.isPublished);

    // Filter by business type if the client is logged in
    if (clientUser?.type) {
      filtered = filtered.filter(template =>
        template.tags.some(tag => tag.toLowerCase() === clientUser.type)
      );
    }

    // Then filter by search term
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
  }, [templates, searchTerm, clientUser]);



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
    <ClientGate>
      <div className="flex flex-col min-h-screen bg-background pb-10">


        <main className="w-full py-0">
          {isLoading || clientLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-6">
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
                  {searchTerm ? "No published templates match your search." : "No published templates available for your business type."}
                </p>
              </div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-8"
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
                Confirm & Apply
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
    </ClientGate>
  );
}
