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
import { compressImage } from "@/lib/utils";
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
  const [isExpanded, setIsExpanded] = useState(false);
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!previewImage) return;
    setIsUploading(true);
    
    try {
      // Compress locally first to avoid CyberPanel proxy limits
      const compressedImage = await compressImage(previewImage, 1200, 0.7);
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
    const result = await deleteDashboardSlide(id);
    if (result.success) fetchData();
  };

  const handleSpotlightDelete = async (id: number) => {
    if (!confirm("Delete this spotlight?")) return;
    const result = await deleteDashboardSpotlight(id);
    if (result.success) fetchData();
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
    const result = await deleteExclusiveOffer(id);
    if (result.success) fetchData();
  };



  return (
    <div className="w-full max-w-[100vw] px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 mx-auto overflow-x-hidden min-h-screen relative">
      <div className="fixed -bottom-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[160px] pointer-events-none rounded-full -z-10 animate-pulse" />
      <div className="fixed -top-60 -right-60 w-[800px] h-[800px] bg-blue-500/5 blur-[160px] pointer-events-none rounded-full -z-10" />

      <Tabs defaultValue="slides" className="w-full space-y-8">
        <div className="flex justify-center md:justify-start">
          <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-border/40 p-1 rounded-2xl shadow-sm h-auto flex-wrap">
            <TabsTrigger value="slides" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <ImageIcon className="h-4 w-4 mr-2" />
              Slides
            </TabsTrigger>
            <TabsTrigger value="spotlights" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <Sparkles className="h-4 w-4 mr-2" />
              Spotlights
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <Tag className="h-4 w-4 mr-2" />
              Offers
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="slides" className="space-y-8 outline-none">
          {/* Slide Images Section */}
          <section className="space-y-4 md:space-y-6 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 w-full overflow-hidden">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <div className="p-2 md:p-3.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 rounded-xl md:rounded-[1.25rem] shadow-inner border border-blue-100/20 shrink-0">
              <ImageIcon className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-semibold text-foreground tracking-tight truncate">Slide Images</h2>
              <p className="hidden md:block text-[10px] md:text-sm text-muted-foreground font-medium mt-0.5 opacity-70 tracking-tight">Manage slider gallery</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            {/* Conditional expansion toggle - only shows if more than 5 slides */}
            {slides.length > 5 && (
              <Button 
                variant="ghost" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex text-primary font-semibold hover:bg-primary/5 gap-2 items-center transition-all duration-500 tracking-wider text-[10px] uppercase group"
              >
                {isExpanded ? 'See Less' : 'See More'}
                <ChevronRight className={`h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 ${isExpanded ? 'rotate-90' : ''}`} />
              </Button>
            )}
            <Dialog open={isUploadOpen} onOpenChange={(open) => {
              setIsUploadOpen(open);
              if (!open) setPreviewImage(null);
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl md:rounded-2xl bg-slate-950 text-white hover:bg-slate-800 transition-all active:scale-95 gap-1 md:gap-2 px-2.5 md:px-6 shadow-2xl shadow-black/10 font-semibold border border-white/10 h-9 md:h-11 text-xs md:text-sm shrink-0">
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Add New</span>
                  <span className="inline sm:hidden">Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent 
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-[450px] border-border/40 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden p-0"
              >
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Upload className="h-5 w-5" />
                  </div>
                  Upload New Slide
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-medium opacity-70">
                  Add a image for your dashboard carousel.
                </DialogDescription>
              </DialogHeader>
                
              <div className="px-6 py-4 space-y-4">
                  {/* Custom Upload Area */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative group cursor-pointer border-2 border-dashed rounded-[2rem] transition-all duration-500 overflow-hidden min-h-[220px] flex flex-col items-center justify-center gap-4
                      ${previewImage ? 'border-primary/40 bg-primary/5' : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'}
                    `}
                  >
                    {previewImage ? (
                      <>
                        <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-10 w-10 text-white drop-shadow-lg" />
                          <span className="text-white font-semibold text-sm drop-shadow-md">Change Photo</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(null);
                          }}
                          className="absolute top-4 right-4 h-8 w-8 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all scale-0 group-hover:scale-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="h-14 w-14 bg-muted rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-border/20">
                          <ImageIcon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-foreground text-lg tracking-tight">Click to browse</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">or drag and drop here</p>
                        </div>
                        <div className="absolute inset-0 border-primary/0 border-4 rounded-[2rem] pointer-events-none group-hover:border-primary/5 transition-all duration-500" />
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                  </div>

                </div>

                <DialogFooter className="p-6 pt-2">
                  <Button 
                    disabled={!previewImage || isUploading}
                    onClick={handleUpload}
                    className="w-full rounded-2xl bg-primary text-primary-foreground font-semibold h-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
                        Uploading...
                      </div>
                    ) : 'Upload Image'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Responsive Container: Fixed overflow and width */}
        <div className="flex overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 transition-all duration-1000 w-full overflow-y-hidden scroll-smooth">
          {isLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
               <Card key={i} className="min-w-[88vw] md:min-w-0 h-32 md:h-24 rounded-[2.5rem] bg-muted/40 animate-pulse border-border/20" />
             ))
          ) : slides.length > 0 ? (
            slides.map((slide, index) => (
            <Card 
              key={slide.id} 
              className={`
                min-w-[65vw] md:min-w-0 snap-center group relative border-border/30 shadow-md hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-700 rounded-3xl overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-2 hover:border-primary/20
                ${!isExpanded && index >= 5 ? 'md:hidden' : 'md:block'}
              `}
            >
              <div className="h-[120px] sm:h-[150px] md:h-48 lg:h-auto lg:aspect-[3/1] relative overflow-hidden">
                <img 
                  src={slide.image_url} 
                  alt=""
                  className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Minimalist Floating Actions */}
                <div className="absolute top-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <button 
                    onClick={() => handleDelete(slide.id)}
                    className="h-10 w-10 bg-red-500 shadow-2xl shadow-red-500/30 rounded-2xl flex items-center justify-center text-white hover:bg-red-600 hover:scale-110 active:scale-90 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
          ) : (
            <div className="col-span-full py-20 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40 flex flex-col items-center justify-center text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No slides found. Click "Add New" to begin.</p>
            </div>
          )}
        </div>
      </section>
    </TabsContent>

    <TabsContent value="spotlights" className="space-y-12 outline-none">
      {/* Dashboard Spotlights Section */}
      <section className="space-y-4 md:space-y-6 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 w-full overflow-hidden">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <div className="p-2 md:p-3.5 bg-gradient-to-br from-red-500/10 to-orange-500/10 text-red-600 rounded-xl md:rounded-[1.25rem] shadow-inner border border-red-100/20 shrink-0">
              <Sparkles className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-semibold text-foreground tracking-tight truncate">Spotlight Stories</h2>
              <p className="hidden md:block text-[10px] md:text-sm text-muted-foreground font-medium mt-0.5 opacity-70 tracking-tight">Manage immersive story visuals</p>
            </div>
          </div>
          <div className="shrink-0">
            <Dialog open={isSpotlightUploadOpen} onOpenChange={(open) => {
              setIsSpotlightUploadOpen(open);
              if (!open) { setPreviewImage(null); setSpotlightForm({ link: '', cta: '' }); }
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl md:rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all active:scale-95 gap-1 md:gap-2 px-2.5 md:px-6 shadow-2xl shadow-red-600/10 font-semibold border border-red-500/10 h-9 md:h-11 text-xs md:text-sm">
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>Add Story</span>
                </Button>
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
                      <select 
                        value={spotlightForm.category} 
                        onChange={(e) => setSpotlightForm({...spotlightForm, category: e.target.value})}
                        className="w-full rounded-xl border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
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
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-6 gap-3">
          {spotlights.map((spot) => (
            <Card key={spot.id} className="min-w-[150px] md:min-w-0 group relative rounded-2xl overflow-hidden border-border/20 shadow-sm hover:shadow-md transition-all border-2 hover:border-red-500/20">
              <div className="aspect-[3/5] relative">
                <img src={spot.image_url} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                   <div className="flex flex-col gap-1">
                     <span className="text-[8px] font-bold text-red-500 bg-white/90 px-1.5 py-0.5 rounded-full w-fit uppercase">{spot.group_name || 'General'}</span>
                     <p className="text-[10px] font-black text-white italic truncate">{spot.cta_text || 'Active Story'}</p>
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

      {/* Spotlight Categories Section */}
      <section className="space-y-4 md:space-y-6 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 w-full overflow-hidden">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <div className="p-2 md:p-3.5 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 text-amber-600 rounded-xl md:rounded-[1.25rem] shadow-inner border border-amber-100/20 shrink-0">
              <LayoutGrid className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-semibold text-foreground tracking-tight truncate">Spotlight Categories</h2>
              <p className="hidden md:block text-[10px] md:text-sm text-muted-foreground font-medium mt-0.5 opacity-70 tracking-tight">Create bubble groups for stories</p>
            </div>
          </div>
          <div className="shrink-0">
            <Dialog open={isCategoryUploadOpen} onOpenChange={(open) => {
              setIsCategoryUploadOpen(open);
              if (!open) { setPreviewImage(null); setCategoryForm({ name: '' }); }
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl md:rounded-2xl bg-amber-600 text-white hover:bg-amber-700 transition-all active:scale-95 gap-1 md:gap-2 px-2.5 md:px-6 shadow-2xl shadow-amber-600/10 font-semibold border border-amber-500/10 h-9 md:h-11 text-xs md:text-sm">
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>New Group</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] border-border/40 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                  <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-3">
                    <LayoutGrid className="h-5 w-5 text-amber-600" />
                    New Category Bubble
                  </DialogTitle>
                </DialogHeader>
                <div className="px-6 py-4 space-y-4">
                  <div 
                    onClick={() => categoryFileInputRef.current?.click()}
                    className="relative mx-auto cursor-pointer border-2 border-dashed rounded-full h-24 w-24 flex items-center justify-center overflow-hidden bg-slate-50 hover:bg-slate-100 transition-all"
                  >
                    {previewImage ? (
                      <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" />
                    ) : <ImageIcon className="h-6 w-6 text-slate-300" />}
                    <input type="file" ref={categoryFileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Group Avatar</p>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">GROUP NAME</Label>
                    <Input 
                      value={categoryForm.name} 
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="e.g. New Arrivals" 
                      className="rounded-xl border-border/40" 
                    />
                  </div>
                </div>
                <DialogFooter className="p-6 pt-2">
                  <Button disabled={!previewImage || !categoryForm.name || isUploading} onClick={handleCategoryUpload} className="w-full rounded-xl bg-amber-600 text-white font-semibold h-12 shadow-lg shadow-amber-600/20">
                    {isUploading ? "Creating..." : "Create Category"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="min-w-[120px] md:min-w-0 group relative rounded-[2rem] p-4 bg-white/40 backdrop-blur-xl border-border/20 shadow-sm hover:shadow-md transition-all border-2 hover:border-amber-500/20 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-amber-500/20 p-1 bg-white">
                <img src={cat.image_url} className="w-full h-full object-cover rounded-full" />
              </div>
              <p className="text-xs font-bold text-center truncate w-full">{cat.name}</p>
              <button 
                onClick={() => handleCategoryDelete(cat.id)}
                className="absolute top-2 right-2 h-6 w-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Card>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed border-border/40">
              No categories yet. Create one to group your stories.
            </div>
          )}
        </div>
      </section>
    </TabsContent>

    <TabsContent value="offers" className="space-y-8 outline-none">
      {/* Exclusive Offers Section */}
      <section className="space-y-4 md:space-y-6 w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 w-full overflow-hidden">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <div className="p-2 md:p-3.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-indigo-600 rounded-xl md:rounded-[1.25rem] shadow-inner border border-indigo-100/20 shrink-0">
              <Tag className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-semibold text-foreground tracking-tight truncate">Exclusive Offers</h2>
              <p className="hidden md:block text-[10px] md:text-sm text-muted-foreground font-medium mt-0.5 opacity-70 tracking-tight">Manage banner categories & deals</p>
            </div>
          </div>
          <div className="shrink-0">
            <Dialog open={isOfferUploadOpen} onOpenChange={(open) => {
              setIsOfferUploadOpen(open);
              if (!open) { setPreviewImage(null); setOfferForm({ category: 'Food' }); }
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl md:rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-95 gap-1 md:gap-2 px-2.5 md:px-6 shadow-2xl shadow-indigo-600/10 font-semibold border border-indigo-500/10 h-9 md:h-11 text-xs md:text-sm">
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span>Add Offer</span>
                </Button>
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
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 lg:grid-cols-4 gap-3">
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
