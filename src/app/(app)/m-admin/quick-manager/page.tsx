"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  getDashboardSlides, 
  addDashboardSlide, 
  deleteDashboardSlide,
  getDashboardSpotlights,
  addDashboardSpotlight,
  deleteDashboardSpotlight,
  getSpotlightCategories,
  addSpotlightCategory,
  deleteSpotlightCategory,
  getExclusiveOffers,
  addExclusiveOffer,
  deleteExclusiveOffer
} from "@/app/actions/storefront";
import { 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  Edit2, 
  Save, 
  ChevronRight, 
  Upload, 
  X,
  CheckCircle2,
  Sparkles,
  Link,
  Tag,
  LayoutGrid
} from "lucide-react";
import { compressImage, cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QuickManagerPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [spotlights, setSpotlights] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [isSpotlightUploadOpen, setIsSpotlightUploadOpen] = useState(false);
  const [isCategoryUploadOpen, setIsCategoryUploadOpen] = useState(false);
  const [isOfferUploadOpen, setIsOfferUploadOpen] = useState(false);
  const [spotlightForm, setSpotlightForm] = useState({ link: '', cta: '', category: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [offerForm, setOfferForm] = useState({ category: 'Offer' });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const spotlightFileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const offerFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [slidesRes, spotlightsRes, categoriesRes, offersRes] = await Promise.all([
      getDashboardSlides(),
      getDashboardSpotlights(),
      getSpotlightCategories(),
      getExclusiveOffers()
    ]);

    if (slidesRes.success) setSlides(slidesRes.slides);
    if (spotlightsRes.success) setSpotlights(spotlightsRes.spotlights);
    if (categoriesRes.success) setCategories(categoriesRes.categories);
    if (offersRes.success) setOffers(offersRes.offers);
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, autoUpload = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        if (autoUpload) {
          handleUpload(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (image?: string) => {
    const targetImage = image || previewImage;
    if (!targetImage) return;
    setIsUploading(true);
    
    try {
      // Compress locally first to avoid CyberPanel proxy limits
      const compressedImage = await compressImage(targetImage, 1200, 0.7);
      const result = await addDashboardSlide(compressedImage);
      if (result.success) {
        toast({ title: "Success", description: "New slide added." });
        setIsUploadOpen(false);
        setPreviewImage(null);
        fetchData();
      } else {
        toast({ 
          title: "Upload Failed", 
          description: result.error || "Please check image size. Max 10MB.", 
          variant: "destructive" 
        });
      }
    } catch (err: any) {
      toast({ 
        title: "Connection Error", 
        description: "Failed to reach the server. Try again.", 
        variant: "destructive" 
      });
    } finally { setIsUploading(false); }
  };

  const handleSpotlightUpload = async () => {
    if (!previewImage) return;
    setIsUploading(true);
    
    try {
      // Compress locally first
      const compressedImage = await compressImage(previewImage, 1080, 0.75);
      const result = await addDashboardSpotlight({
        title: '', 
        offer: '', 
        linkUrl: spotlightForm.link,
        ctaText: spotlightForm.cta,
        groupName: spotlightForm.category,
        imageUrl: compressedImage
      });
      if (result.success) {
        toast({ title: "Success", description: "Spotlight added." });
        setIsSpotlightUploadOpen(false);
        setSpotlightForm({ link: '', cta: '', category: '' });
        setPreviewImage(null);
        fetchData();
      } else {
        toast({ 
          title: "Spotlight Failed", 
          description: result.error || "Please check image size.", 
          variant: "destructive" 
        });
      }
    } catch (err: any) {
      toast({ 
        title: "Connection Error", 
        description: "Failed to save spotlight.", 
        variant: "destructive" 
      });
    } finally { setIsUploading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this slide?")) return;
    try {
      const result = await deleteDashboardSlide(id);
      if (result.success) {
        toast({ title: "Deleted", description: "Slide image removed." });
        fetchData();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete slide.", variant: "destructive" });
    }
  };

  const handleSpotlightDelete = async (id: number) => {
    if (!confirm("Delete this spotlight?")) return;
    try {
      const result = await deleteDashboardSpotlight(id);
      if (result.success) {
        toast({ title: "Deleted", description: "Spotlight removed." });
        fetchData();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete spotlight.", variant: "destructive" });
    }
  };

  const handleCategoryUpload = async () => {
    if (!previewImage || !categoryForm.name) return;
    setIsUploading(true);
    
    try {
      const compressedImage = await compressImage(previewImage, 500, 0.7);
      const result = await addSpotlightCategory(categoryForm.name, compressedImage);
      if (result.success) {
        toast({ title: "Success", description: "Category added." });
        setIsCategoryUploadOpen(false);
        setCategoryForm({ name: '' });
        setPreviewImage(null);
        fetchData();
      } else {
        toast({ title: "Failed", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save category.", variant: "destructive" });
    } finally { setIsUploading(false); }
  };

  const handleCategoryDelete = async (id: number) => {
    if (!confirm("Delete this category? This won't delete spotlights but they'll lose their group.")) return;
    const result = await deleteSpotlightCategory(id);
    if (result.success) fetchData();
  };

  const handleOfferUpload = async () => {
    if (!previewImage) return;
    setIsUploading(true);
    
    try {
      const compressedImage = await compressImage(previewImage, 1080, 0.75);
      const result = await addExclusiveOffer({
        category: offerForm.category,
        imageUrl: compressedImage
      });
      if (result.success) {
        toast({ title: "Success", description: "Exclusive offer added." });
        setIsOfferUploadOpen(false);
        setOfferForm({ category: 'Food' });
        setPreviewImage(null);
        fetchData();
      } else {
        toast({ title: "Upload Failed", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save offer.", variant: "destructive" });
    } finally { setIsUploading(false); }
  };

  const handleOfferDelete = async (id: number) => {
    if (!confirm("Delete this offer?")) return;
    try {
      const result = await deleteExclusiveOffer(id);
      if (result.success) {
        toast({ title: "Deleted", description: "Offer removed." });
        fetchData();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete offer.", variant: "destructive" });
    }
  };



  return (
    <div className="w-full max-w-[100vw] px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 mx-auto overflow-x-hidden min-h-screen relative">
      <div className="fixed -bottom-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[160px] pointer-events-none rounded-full -z-10 animate-pulse" />
      <div className="fixed -top-60 -right-60 w-[800px] h-[800px] bg-blue-500/5 blur-[160px] pointer-events-none rounded-full -z-10" />

      <Tabs defaultValue="slides" className="w-full space-y-8">
        <div className="flex justify-center md:justify-start">
          <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-border/40 p-1 rounded-2xl shadow-sm h-auto flex-wrap">
            <TabsTrigger value="slides" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <ImageIcon className="h-4 w-4 mr-2" />
              Slides
            </TabsTrigger>
            <TabsTrigger value="spotlights" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Sparkles className="h-4 w-4 mr-2" />
              Spotlights
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all">
              <Tag className="h-4 w-4 mr-2" />
              Offers
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="slides" className="space-y-8 outline-none">
          {/* Slide Images Section */}
          <section className="space-y-4 md:space-y-6 w-full overflow-hidden">

        {/* Pixel-Perfect Slide Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 w-full">
          {/* Upload Card - Direct Action */}
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "group relative flex flex-col items-center justify-center aspect-[2/1] rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer p-4 overflow-hidden",
              isUploading && "opacity-60 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary animate-spin rounded-full" />
                <p className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-wider">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex flex-col items-center -space-y-1">
                  <Upload className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-bold text-slate-600 tracking-tight">Drop file to upload</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, true)} 
            />
          </div>

          {/* Image Cards */}
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="aspect-square rounded-xl bg-slate-100" />
                <div className="h-3 w-2/3 bg-slate-100 rounded mx-auto" />
              </div>
            ))
          ) : slides.map((slide, index) => {
            const filename = slide.image_url.split('/').pop()?.split('-').slice(1).join('-') || `slide-${slide.id}.jpg`;
            const isFirst = index === 0;

            return (
              <div key={slide.id} className="group space-y-2 animate-in fade-in zoom-in duration-500">
                <div className="relative aspect-[2/1] rounded-xl overflow-hidden bg-slate-100 shadow-sm transition-all group-hover:shadow-md">
                  <img 
                    src={slide.image_url} 
                    alt=""
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  

                  {/* Delete Button - Top Right */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(slide.id);
                    }}
                    className="absolute top-2 right-2 h-7 w-7 bg-red-500/90 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-red-600 active:scale-90 z-20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </TabsContent>

    <TabsContent value="spotlights" className="space-y-12 outline-none">


      <section className="space-y-4 md:space-y-6 w-full overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Add Story Card */}
          <Dialog open={isSpotlightUploadOpen} onOpenChange={(open) => {
            setIsSpotlightUploadOpen(open);
            if (!open) { setPreviewImage(null); setSpotlightForm({ link: '', cta: '', category: '' }); }
          }}>
            <DialogTrigger asChild>
              <div className="group relative flex flex-col items-center justify-center aspect-[3/5] rounded-[2.5rem] bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer p-4 border-2 border-dashed border-slate-200 hover:border-red-500/40">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-3 bg-red-500/10 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Add Story</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-border/40 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-red-600" />
                  New Spotlight Story
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium opacity-70">
                  Upload an immersive image for your dashboard story.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 py-4 space-y-4">
                <div 
                  onClick={() => spotlightFileInputRef.current?.click()}
                  className="relative cursor-pointer border-2 border-dashed rounded-[1.5rem] h-[150px] flex items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  {previewImage ? (
                    <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" />
                  ) : <ImageIcon className="h-8 w-8 text-slate-300" />}
                  <input type="file" ref={spotlightFileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CATEGORY</Label>
                    <Input 
                      value={spotlightForm.category} 
                      onChange={(e) => setSpotlightForm({...spotlightForm, category: e.target.value})}
                      placeholder="e.g. General, MagicAI" 
                      className="rounded-xl border-border/40" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CTA TEXT</Label>
                      <Input value={spotlightForm.cta} onChange={(e) => setSpotlightForm({...spotlightForm, cta: e.target.value})} placeholder="e.g. Swipe up" className="rounded-xl border-border/40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">LINK URL</Label>
                    <Input value={spotlightForm.link} onChange={(e) => setSpotlightForm({...spotlightForm, link: e.target.value})} placeholder="/order" className="rounded-xl border-border/40" />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 pt-2">
                <Button disabled={!previewImage || isUploading} onClick={handleSpotlightUpload} className="w-full rounded-xl bg-red-600 text-white font-semibold h-12 shadow-lg shadow-red-600/20">
                  {isUploading ? "Uploading..." : "Save Spotlight"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {spotlights.map((spot) => (
            <Card key={spot.id} className="min-w-[150px] md:min-w-0 group relative rounded-[2.5rem] overflow-hidden border-2 border-red-500 shadow-xl transition-all hover:scale-[1.02] active:scale-95 duration-300">
              <div className="aspect-[3/5] relative">
                <img src={spot.image_url} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 p-4 flex flex-col justify-between">
                   <div className="flex flex-col items-center text-center">
                     <p className="text-[10px] md:text-[12px] font-black text-white leading-tight uppercase tracking-tighter drop-shadow-lg">
                       {spot.group_name || 'General'}
                     </p>
                     <p className="text-[14px] md:text-[16px] font-black text-white leading-tight uppercase tracking-tighter drop-shadow-lg">
                       {spot.cta_text || 'VIEW NOW'}
                     </p>
                   </div>
                   <div className="flex justify-center">
                     {/* Empty for now to match reference clean bottom or pedestal look */}
                   </div>
                </div>
                <button 
                  onClick={() => handleSpotlightDelete(spot.id)}
                  className="absolute top-2 right-2 h-7 w-7 bg-red-500/90 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>

    </TabsContent>

    <TabsContent value="offers" className="space-y-8 outline-none">
      {/* Exclusive Offers Section */}
      <section className="space-y-4 md:space-y-6 w-full overflow-hidden">
        <div className="flex overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Add Offer Card */}
          <Dialog open={isOfferUploadOpen} onOpenChange={(open) => {
            setIsOfferUploadOpen(open);
            if (!open) { setPreviewImage(null); setOfferForm({ category: 'Food' }); }
          }}>
            <DialogTrigger asChild>
              <div className="group relative flex flex-col items-center justify-center aspect-[2/1] rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer p-4 border-2 border-dashed border-slate-200 hover:border-indigo-500/40">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                    <Tag className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Add Offer</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-border/40 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-3">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  New Exclusive Offer
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium opacity-70">
                  Upload a deal banner and select a category.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 py-4 space-y-4">
                <div 
                  onClick={() => offerFileInputRef.current?.click()}
                  className="relative cursor-pointer border-2 border-dashed rounded-[1.5rem] h-[150px] flex items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  {previewImage ? (
                    <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" />
                  ) : <ImageIcon className="h-8 w-8 text-slate-300" />}
                  <input type="file" ref={offerFileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">CATEGORY</Label>
                    <Input 
                      value={offerForm.category} 
                      onChange={(e) => setOfferForm({...offerForm, category: e.target.value})}
                      placeholder="e.g. Food, MagicAI, Summer" 
                      className="rounded-xl border-border/40" 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 pt-2">
                <Button disabled={!previewImage || isUploading} onClick={handleOfferUpload} className="w-full rounded-xl bg-indigo-600 text-white font-semibold h-12 shadow-lg shadow-indigo-600/20">
                  {isUploading ? "Uploading..." : "Save Offer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {offers.map((offer) => (
            <Card key={offer.id} className="min-w-[200px] md:min-w-0 group relative rounded-2xl overflow-hidden border-border/20 shadow-sm hover:shadow-md transition-all border-2 hover:border-indigo-500/20">
              <div className="aspect-[2.2/1] relative">
                <img src={offer.image_url} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md shadow-lg">
                  {offer.category}
                </div>
                <button 
                  onClick={() => handleOfferDelete(offer.id)}
                  className="absolute top-2 right-2 h-7 w-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </TabsContent>
  </Tabs>
</div>
  );
}
