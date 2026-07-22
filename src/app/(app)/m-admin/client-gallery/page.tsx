"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission } from '@/lib/admin-permissions';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Layers, 
  Grid, 
  Sparkles, 
  MoreVertical, 
  ExternalLink,
  Eye,
  CheckCircle2,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { SocialsGallery } from '@/components/ui/socials-gallery';
import { ImageUploader } from "@/components/ui/image-uploader";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  column: number; // 1, 2, 3
  size: 'large' | 'small';
  tags: string;
}

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: '1',
    title: 'Book of Esther Cover Design',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    column: 1,
    size: 'large',
    tags: 'Esther, Green Roll, Menu Cover',
  },
  {
    id: '2',
    title: 'Open Menu Book Showcase',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    column: 1,
    size: 'small',
    tags: 'Open Book, Table Scene',
  },
  {
    id: '3',
    title: 'Book Cover Art Mockup',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    column: 2,
    size: 'small',
    tags: 'Mockup, Artwork',
  },
  {
    id: '4',
    title: 'Stacked Pages Texture',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    column: 2,
    size: 'small',
    tags: 'Paper Texture, Pages',
  },
  {
    id: '5',
    title: 'Psalms Landscape Showcase',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    column: 2,
    size: 'large',
    tags: 'Psalms, Landscape, Full Cover',
  },
  {
    id: '6',
    title: 'Psalms Book Cover with Floral Element',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    column: 3,
    size: 'large',
    tags: 'Psalms, Floral Twig',
  },
  {
    id: '7',
    title: 'Esther Mini Cover',
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
    column: 3,
    size: 'small',
    tags: 'Esther Mini',
  },
  {
    id: '8',
    title: 'Creative Cover Showcase',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    column: 3,
    size: 'small',
    tags: 'Creative Cover',
  },
];

import { getClientGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem, clearClientGallery, GalleryItemData } from '@/app/actions/client-gallery';

export default function ClientGalleryAdminPage() {
  const { adminUser, adminLoading } = useAdminAuth();
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'manage' | 'preview'>('manage');
  const [dbLoading, setDbLoading] = useState(true);

  // Load from database on mount
  React.useEffect(() => {
    async function loadGalleryData() {
      setDbLoading(true);
      const res = await getClientGallery();
      if (res.success && res.data) {
        setGalleryItems(res.data.map(item => ({
          id: item.id || Date.now().toString(),
          title: item.title,
          imageUrl: item.imageUrl,
          column: item.column || 1,
          size: item.size || 'large',
          tags: item.tags || '',
        })));
      }
      setDbLoading(false);
    }
    loadGalleryData();
  }, []);

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: '',
    imageUrl: '',
    column: 1,
    size: 'large',
    tags: '',
  });

  const hasViewPermission = useMemo(() => {
    return checkClientPermission(adminUser, 'client-gallery', 'view');
  }, [adminUser]);

  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => {
      return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.tags.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [galleryItems, searchTerm]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      column: 1,
      size: 'large',
      tags: 'Client, Menu Showcase',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsAddEditOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast({ title: "Validation Error", description: "Please fill in Title and Image URL", variant: "destructive" });
      return;
    }

    if (editingItem) {
      const updatePayload: Partial<GalleryItemData> = {
        title: formData.title,
        imageUrl: formData.imageUrl,
        column: formData.column,
        size: formData.size,
        tags: formData.tags,
      };

      const res = await updateGalleryItem(editingItem.id, updatePayload);
      if (res.success) {
        setGalleryItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...formData } as GalleryItem : item));
        toast({ title: "Success", description: "Gallery item updated and saved to DB!" });
      } else {
        toast({ title: "Error", description: res.error || "Failed to update in DB", variant: "destructive" });
      }
    } else {
      const newPayload: GalleryItemData = {
        id: Date.now().toString(),
        title: formData.title || '',
        imageUrl: formData.imageUrl || '',
        column: Number(formData.column) || 1,
        size: (formData.size as any) || 'large',
        tags: formData.tags || '',
      };

      const res = await createGalleryItem(newPayload);
      if (res.success && res.data) {
        const newItem: GalleryItem = {
          id: res.data.id || Date.now().toString(),
          title: res.data.title,
          imageUrl: res.data.imageUrl,
          column: res.data.column || 1,
          size: res.data.size || 'large',
          tags: res.data.tags || '',
        };
        setGalleryItems(prev => [newItem, ...prev]);
        toast({ title: "Success", description: "New gallery item saved to DB!" });
      } else {
        toast({ title: "Error", description: res.error || "Failed to save to DB", variant: "destructive" });
      }
    }
    setIsAddEditOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setDeleteTarget(null);

    const res = await deleteGalleryItem(targetId);
    setGalleryItems(prev => prev.filter(item => item.id !== targetId));
    if (res.success) {
      toast({ title: "Deleted", description: "Gallery item deleted from DB!" });
    } else {
      toast({ title: "Removed", description: "Gallery item removed from view." });
    }
  };

  const handleClearDb = async () => {
    if (!confirm("Are you sure you want to clear and reset the gallery database?")) return;
    const res = await clearClientGallery();
    if (res.success && res.data) {
      setGalleryItems(res.data.map(item => ({
        id: item.id || Date.now().toString(),
        title: item.title,
        imageUrl: item.imageUrl,
        column: item.column || 1,
        size: item.size || 'large',
        tags: item.tags || '',
      })));
      toast({ title: "DB Cleared & Reset", description: "Gallery DB cleared and reset to clean 9-item Bento grid!" });
    } else {
      toast({ title: "Error", description: res.error || "Failed to clear DB", variant: "destructive" });
    }
  };

  if (adminLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLoginForm />;
  }

  if (!hasViewPermission) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-2">You do not have permission to view Client's Gallery Management.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      {/* Top Action Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground tracking-tight">Client&apos;s Gallery Management</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleClearDb} className="gap-1.5 font-bold text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" /> Clear DB
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2 font-bold shadow-md">
            <Plus className="h-4 w-4" /> Add Gallery Image
          </Button>
        </div>
      </div>

      {/* Same-to-Same Bento Gallery View with Hover Edit/Delete Controls */}
      <div className="w-full max-w-6xl mx-auto">
        <SocialsGallery 
          items={galleryItems}
          showTitle={false}
          actionSlot={(item) => {
            const itemToUse: GalleryItem = {
              id: item.id || Date.now().toString(),
              title: item.title || 'Untitled Image',
              imageUrl: item.imageUrl || '',
              column: item.column || 1,
              size: item.size || 'large',
              tags: item.tags || '',
            };
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 shadow-md"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border-border shadow-xl">
                  <DropdownMenuItem 
                    onSelect={() => {
                      const target = galleryItems.find(g => g.id === item.id) || itemToUse;
                      setTimeout(() => {
                        document.body.style.pointerEvents = "";
                        handleOpenEdit(target);
                      }, 50);
                    }} 
                    className="gap-2 font-bold cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit Image
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onSelect={() => {
                      const target = galleryItems.find(g => g.id === item.id) || itemToUse;
                      setTimeout(() => {
                        document.body.style.pointerEvents = "";
                        setDeleteTarget(target);
                      }, 50);
                    }} 
                    className="gap-2 text-destructive font-bold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }}
        />
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingItem ? 'Edit Gallery Image' : 'Add Gallery Image'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure image URL, bento column position, and card dimensions.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] pr-3 my-2">
            <div className="space-y-4 py-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Image Title / Caption</label>
                <Input 
                  value={formData.title || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Sultan's Dine Menu Mockup"
                  className="mt-1"
                />
              </div>

              {/* Image Uploader with File Select, Drag & Drop, and Clipboard Paste */}
              <ImageUploader 
                value={formData.imageUrl || ''} 
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                label="Gallery Image Photo"
                subDir="spotlights"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Bento Column</label>
                  <select
                    value={formData.column || 1}
                    onChange={(e) => setFormData(prev => ({ ...prev, column: Number(e.target.value) }))}
                    className="w-full h-10 mt-1 px-3 rounded-md border border-input bg-background text-sm font-medium"
                  >
                    <option value={1}>Column 1 (Left)</option>
                    <option value={2}>Column 2 (Center)</option>
                    <option value={3}>Column 3 (Right)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Card Size</label>
                  <select
                    value={formData.size || 'large'}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value as any }))}
                    className="w-full h-10 mt-1 px-3 rounded-md border border-input bg-background text-sm font-medium"
                  >
                    <option value="large">Large (380px)</option>
                    <option value="small">Small (180px)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Tags / Keywords</label>
                <Input 
                  value={formData.tags || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g. Menu Cover, Esthetique, Green"
                  className="mt-1"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="font-bold">Save Image</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog 
        open={!!deleteTarget} 
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setTimeout(() => { document.body.style.pointerEvents = ""; }, 50);
          }
        }}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Delete Gallery Item</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot; from the bento gallery?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-white font-bold">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
