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
  deleteExclusiveOffer,
  updateSpotlightCategory,
  updateDashboardSpotlight,
  updateExclusiveOffer
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
  LayoutGrid,
  ChevronDown
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [editingSlideId, setEditingSlideId] = useState<number | null>(null);
  const [editingSpotlightId, setEditingSpotlightId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);
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
      const compressedImage = previewImage.startsWith('data:image')
        ? await compressImage(previewImage, 1080, 0.75)
        : previewImage;

      const formData = new FormData();
      formData.append('imageUrl', compressedImage);
      formData.append('linkUrl', spotlightForm.link);
      formData.append('ctaText', spotlightForm.cta);
      formData.append('groupName', spotlightForm.category);

      let result;
      if (editingSpotlightId) {
        formData.append('id', editingSpotlightId.toString());
        result = await updateDashboardSpotlight(formData);
      } else {
        result = await addDashboardSpotlight(formData);
      }

      if (result.success) {
        toast({ title: "Success", description: editingSpotlightId ? "Spotlight updated." : "Spotlight added." });
        setIsSpotlightUploadOpen(false);
        setEditingSpotlightId(null);
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
      const compressedImage = previewImage.startsWith('data:image') 
        ? await compressImage(previewImage, 500, 0.7) 
        : previewImage;

      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('imageUrl', compressedImage);

      let result;
      if (editingCategoryId) {
        formData.append('id', editingCategoryId.toString());
        result = await updateSpotlightCategory(formData);
      } else {
        result = await addSpotlightCategory(formData);
      }

      if (result.success) {
        toast({ title: "Success", description: editingCategoryId ? "Category updated." : "Category added." });
        setIsCategoryUploadOpen(false);
        setEditingCategoryId(null);
        setCategoryForm({ name: '' });
        setPreviewImage(null);
        fetchData();
      } else {
        toast({ title: "Failed", description: result.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Failed to save category. Please check if the file is too large.", 
        variant: "destructive" 
      });
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
      const compressedImage = previewImage.startsWith('data:image')
        ? await compressImage(previewImage, 1080, 0.75)
        : previewImage;

      let result;
      if (editingOfferId) {
        result = await updateExclusiveOffer(editingOfferId, {
          category: offerForm.category,
          imageUrl: compressedImage
        });
      } else {
        result = await addExclusiveOffer({
          category: offerForm.category,
          imageUrl: compressedImage
        });
      }

      if (result.success) {
        toast({ title: "Success", description: editingOfferId ? "Offer updated." : "Offer added." });
        setIsOfferUploadOpen(false);
        setEditingOfferId(null);
        setOfferForm({ category: 'Offer' });
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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

          {/* Manage Categories Button & Dialog */}
          <Dialog open={isCategoryUploadOpen} onOpenChange={(open) => {
            setIsCategoryUploadOpen(open);
            if (!open) { 
              setPreviewImage(null); 
              setCategoryForm({ name: '' }); 
              setEditingCategoryId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-2xl h-11 px-6 border-border/40 bg-white/50 backdrop-blur-xl hover:bg-black hover:text-white transition-all shadow-sm font-black text-xs uppercase tracking-widest">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Manage Groups
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-border/40 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-amber-600" />
                  Spotlight Groups
                </DialogTitle>
                <DialogDescription className="text-xs font-medium opacity-70">
                  Manage categories for your dashboard story bubbles.
                </DialogDescription>
              </DialogHeader>
              
              <div className="p-6 space-y-6">
                {/* Current Groups List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">EXISTING GROUPS</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-hide">
                    {categories.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No groups created yet</p>
                      </div>
                    ) : (
                      categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white/50 border border-slate-100 group hover:border-amber-200 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                              <img src={cat.image_url} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setEditingCategoryId(cat.id);
                                setCategoryForm({ name: cat.name });
                                setPreviewImage(cat.image_url);
                              }} 
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-full"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCategoryDelete(cat.id)} className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add New Group Section */}
                <div className="pt-6 border-t border-border/40 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {editingCategoryId ? 'EDIT SELECTED GROUP' : 'CREATE NEW GROUP'}
                  </h4>
                  <div className={cn(
                    "flex gap-4 items-start p-4 rounded-[1.5rem] border transition-all",
                    editingCategoryId ? "bg-blue-50/50 border-blue-100 shadow-inner" : "bg-slate-50/50 border-slate-100"
                  )}>
                    <div 
                      onClick={() => categoryFileInputRef.current?.click()}
                      className="relative cursor-pointer border-2 border-dashed border-slate-200 rounded-full h-16 w-16 flex items-center justify-center overflow-hidden bg-white hover:border-amber-500/40 transition-all shrink-0"
                    >
                      {previewImage ? (
                        <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" />
                      ) : <Upload className="h-5 w-5 text-slate-300" />}
                      <input type="file" ref={categoryFileInputRef} className="hidden" accept="image/*,.gif" onChange={handleFileChange} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input 
                        value={categoryForm.name} 
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        placeholder="e.g. Recommended" 
                        className="rounded-xl bg-white border-slate-200 h-10 text-sm"
                      />
                      <div className="flex gap-2">
                        {editingCategoryId && (
                          <Button 
                            variant="ghost"
                            onClick={() => {
                              setEditingCategoryId(null);
                              setCategoryForm({ name: '' });
                              setPreviewImage(null);
                            }}
                            className="rounded-xl h-10 text-xs font-bold uppercase tracking-widest"
                          >
                            Cancel
                          </Button>
                        )}
                        <Button 
                          disabled={!previewImage || !categoryForm.name || isUploading} 
                          onClick={handleCategoryUpload}
                          className={cn(
                            "flex-1 rounded-xl h-10 font-bold text-xs uppercase tracking-widest shadow-lg",
                            editingCategoryId ? "bg-blue-600 text-white shadow-blue-600/10" : "bg-black text-white shadow-black/10"
                          )}
                        >
                          {isUploading ? "Processing..." : (editingCategoryId ? "Update Group" : "Add Group")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="slides" className="space-y-8 outline-none">
          {/* Slide Images Section */}
          <section className="space-y-4 md:space-y-6 w-full overflow-hidden">

        {/* Pixel-Perfect Slide Images Flex Grid */}
        <div className="flex flex-wrap gap-3 md:gap-4 w-full">
          {/* Upload Card - Direct Action */}
          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "group relative flex flex-col items-center justify-center w-auto max-w-[200px] h-20 md:h-24 aspect-[2.2/1] rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer p-4 overflow-hidden",
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
              accept="image/*,.gif" 
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
              <div key={slide.id} className="group space-y-2">
                <div className="relative w-auto max-w-[200px] h-20 md:h-24 aspect-[2.2/1] rounded-xl overflow-hidden bg-slate-100 shadow-sm">
                  <img 
                    src={slide.image_url} 
                    alt=""
                    className="object-cover w-full h-full"
                  />
                  
                  {/* Delete Button - Top Right */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(slide.id);
                    }}
                    className="absolute top-2 right-2 h-7 w-7 bg-red-500/90 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg hover:bg-red-600 z-20"
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {/* Add Story Card */}
          <Dialog open={isSpotlightUploadOpen} onOpenChange={(open) => {
            setIsSpotlightUploadOpen(open);
            if (!open) { 
              setPreviewImage(null); 
              setSpotlightForm({ link: '', cta: '', category: '' }); 
              setEditingSpotlightId(null);
            }
          }}>
            <DialogTrigger asChild>
              <div className="group relative flex flex-col items-center justify-center aspect-[3/5] rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer p-4 border-2 border-dashed border-slate-200 hover:border-red-500/40">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-3 bg-red-500/10 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Add Story</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-border/40 bg-white/80 backdrop-blur-2xl rounded-2xl p-0 overflow-hidden">
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
                  <input type="file" ref={spotlightFileInputRef} className="hidden" accept="image/*,.gif" onChange={handleFileChange} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">SELECT GROUP</Label>
                    <Select 
                      value={spotlightForm.category} 
                      onValueChange={(val) => setSpotlightForm({...spotlightForm, category: val})}
                    >
                      <SelectTrigger className="rounded-xl border-border/40 bg-white cursor-pointer">
                        <SelectValue placeholder="Select a Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40 bg-white/80 backdrop-blur-xl">
                        <SelectItem value="General" className="rounded-xl cursor-pointer">General</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name} className="rounded-xl cursor-pointer">
                            <div className="flex items-center gap-2">
                              {cat.image_url && (
                                <img src={cat.image_url} className="w-4 h-4 rounded-full object-cover" />
                              )}
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <Button disabled={!previewImage || isUploading || !spotlightForm.category} onClick={handleSpotlightUpload} className="w-full rounded-xl bg-red-600 text-white font-semibold h-12 shadow-lg shadow-red-600/20">
                  {isUploading ? "Processing..." : (editingSpotlightId ? "Update Spotlight" : "Save Spotlight")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {spotlights.map((spot) => (
            <Card key={spot.id} className="min-w-[150px] md:min-w-0 group relative rounded-2xl overflow-hidden border border-border/40 shadow-sm p-[1px] bg-white dark:bg-slate-900">
              <div className="aspect-[3/5] relative overflow-hidden rounded-[0.9rem]">
                <img src={spot.image_url} className="object-cover w-full h-full bg-slate-50 dark:bg-slate-900" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 p-2 flex flex-col justify-end">
                   <div className="flex justify-start">
                     <div className="px-1.5 py-0.5 bg-orange-600 text-white text-[8px] font-black rounded-full border border-orange-500 uppercase tracking-tighter shadow-sm flex items-center gap-1.5">
                       {categories.find(c => c.name === spot.group_name)?.image_url && (
                         <img 
                           src={categories.find(c => c.name === spot.group_name)?.image_url} 
                           className="w-4 h-4 rounded-full object-cover border border-white/40 shadow-sm"
                         />
                       )}
                       {spot.group_name || 'General'}
                     </div>
                   </div>
                </div>
                 <button 
                  onClick={() => {
                    setEditingSpotlightId(spot.id);
                    setSpotlightForm({ link: spot.link_url || '', cta: spot.cta_text || '', category: spot.group_name || '' });
                    setPreviewImage(spot.image_url);
                    setIsSpotlightUploadOpen(true);
                  }}
                  className="absolute top-1.5 left-1.5 h-5 w-5 bg-slate-800/80 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer"
                >
                  <Edit2 className="h-2.5 w-2.5" />
                </button>
                <button 
                  onClick={() => handleSpotlightDelete(spot.id)}
                  className="absolute top-1.5 right-1.5 h-5 w-5 bg-red-500/90 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer"
                >
                  <Trash2 className="h-2.5 w-2.5" />
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
        <div className="flex flex-wrap gap-3 md:gap-4 w-full">
          {/* Add Offer Card */}
          <Dialog open={isOfferUploadOpen} onOpenChange={(open) => {
            setIsOfferUploadOpen(open);
            if (!open) { 
              setPreviewImage(null); 
              setOfferForm({ category: 'Offer' }); 
              setEditingOfferId(null);
            }
          }}>
            <DialogTrigger asChild>
            <div className="group relative flex flex-col items-center justify-center w-auto max-w-[220px] h-24 md:h-28 aspect-[2.2/1] rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer p-4 border-2 border-dashed border-slate-200 hover:border-indigo-500/40">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-600 group-hover:scale-110 transition-transform">
                    <Tag className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Add Offer</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-border/40 bg-white/80 backdrop-blur-2xl rounded-2xl p-0 overflow-hidden">
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
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">SELECT CATEGORY</Label>
                    <Select 
                      value={offerForm.category} 
                      onValueChange={(val) => setOfferForm({...offerForm, category: val})}
                    >
                      <SelectTrigger className="rounded-xl border-border/40 bg-white cursor-pointer">
                        <SelectValue placeholder="Select a Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40 bg-white/80 backdrop-blur-xl">
                        <SelectItem value="Offer" className="rounded-xl cursor-pointer">Offer</SelectItem>
                        <SelectItem value="Food" className="rounded-xl cursor-pointer">Food</SelectItem>
                        <SelectItem value="Drink" className="rounded-xl cursor-pointer">Drink</SelectItem>
                        <SelectItem value="Desert" className="rounded-xl cursor-pointer">Desert</SelectItem>
                        <SelectItem value="Special" className="rounded-xl cursor-pointer">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 pt-2">
                <Button disabled={!previewImage || isUploading || !offerForm.category} onClick={handleOfferUpload} className="w-full rounded-xl bg-indigo-600 text-white font-semibold h-12 shadow-lg shadow-indigo-600/20">
                  {isUploading ? "Processing..." : (editingOfferId ? "Update Offer" : "Save Offer")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {offers.map((offer) => (
            <Card key={offer.id} className="w-auto max-w-[220px] h-24 md:h-28 group relative rounded-2xl overflow-hidden border-border/20 shadow-sm border-2 p-[1px] bg-white dark:bg-slate-900">
              <div className="aspect-[2.2/1] relative h-full overflow-hidden rounded-[0.9rem]">
                <img src={offer.image_url} className="object-cover w-full h-full bg-slate-50 dark:bg-slate-900" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-md shadow-lg">
                  {offer.category}
                </div>
                 <button 
                  onClick={() => {
                    setEditingOfferId(offer.id);
                    setOfferForm({ category: offer.category });
                    setPreviewImage(offer.image_url);
                    setIsOfferUploadOpen(true);
                  }}
                  className="absolute top-2 right-2 mr-9 h-7 w-7 bg-blue-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30 cursor-pointer"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => handleOfferDelete(offer.id)}
                  className="absolute top-2 right-2 h-7 w-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30 cursor-pointer"
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
