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
  deleteDashboardSpotlight
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
  Link
} from "lucide-react";
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

export default function QuickManagerPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [spotlights, setSpotlights] = useState<any[]>([]);
  const [isSpotlightUploadOpen, setIsSpotlightUploadOpen] = useState(false);
  const [spotlightForm, setSpotlightForm] = useState({ link: '', cta: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const spotlightFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [slidesRes, spotlightsRes] = await Promise.all([
      getDashboardSlides(),
      getDashboardSpotlights()
    ]);

    if (slidesRes.success) setSlides(slidesRes.slides);
    if (spotlightsRes.success) setSpotlights(spotlightsRes.spotlights);
    
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
      const result = await addDashboardSlide(previewImage);
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
      const result = await addDashboardSpotlight({
        title: '', // Removed requested fields
        offer: '', 
        linkUrl: spotlightForm.link,
        ctaText: spotlightForm.cta,
        imageUrl: previewImage
      });
      if (result.success) {
        toast({ title: "Success", description: "Spotlight added." });
        setIsSpotlightUploadOpen(false);
        setSpotlightForm({ link: '', cta: '' });
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



  return (
    <div className="w-full max-w-[100vw] px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 mx-auto overflow-x-hidden min-h-screen relative">
      <div className="fixed -bottom-60 -left-60 w-[800px] h-[800px] bg-primary/5 blur-[160px] pointer-events-none rounded-full -z-10 animate-pulse" />
      <div className="fixed -top-60 -right-60 w-[800px] h-[800px] bg-blue-500/5 blur-[160px] pointer-events-none rounded-full -z-10" />

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
                   <p className="text-[10px] font-black text-white italic truncate">{spot.cta_text || 'Active Story'}</p>
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
    </div>
  );
}
