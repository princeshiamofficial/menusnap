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

export default function ClientGalleryAdminPage() {
  const { adminUser, adminLoading } = useAdminAuth();
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'manage' | 'preview'>('manage');

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

  const handleSave = () => {
    if (!formData.title || !formData.imageUrl) {
      toast({ title: "Validation Error", description: "Please fill in Title and Image URL", variant: "destructive" });
      return;
    }

    if (editingItem) {
      setGalleryItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...formData } as GalleryItem : item));
      toast({ title: "Success", description: "Gallery item updated!" });
    } else {
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        title: formData.title || '',
        imageUrl: formData.imageUrl || '',
        column: Number(formData.column) || 1,
        size: (formData.size as any) || 'large',
        tags: formData.tags || '',
      };
      setGalleryItems(prev => [newItem, ...prev]);
      toast({ title: "Success", description: "New gallery item added!" });
    }
    setIsAddEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setGalleryItems(prev => prev.filter(item => item.id !== deleteTarget.id));
    toast({ title: "Deleted", description: "Gallery item deleted!" });
    setDeleteTarget(null);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <ImageIcon className="h-7 w-7 text-primary" />
            Client&apos;s Gallery Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the &quot;Our Happy Clients&quot; bento gallery grid images, positions, and mockups.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'manage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('manage')}
            className="gap-2 font-bold"
          >
            <Grid className="h-4 w-4" /> Manage Grid
          </Button>
          <Button 
            variant={activeTab === 'preview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('preview')}
            className="gap-2 font-bold"
          >
            <Eye className="h-4 w-4" /> Live Preview
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2 font-bold shadow-md">
            <Plus className="h-4 w-4" /> Add Gallery Image
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Total Gallery Items</span>
            <ImageIcon className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{galleryItems.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Active Bento Grid</span>
            <Grid className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">3 Columns</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Grid Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 mt-2">Live &amp; Responsive</p>
        </div>
      </div>

      {activeTab === 'preview' ? (
        /* Live Preview Tab */
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="mb-4 pb-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Live Bento Gallery Preview</span>
            <Badge variant="outline" className="text-primary border-primary">Exact Page Rendering</Badge>
          </div>
          <SocialsGallery />
        </div>
      ) : (
        /* Manage Grid Tab */
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search gallery images by title or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold">Preview</TableHead>
                  <TableHead className="font-bold">Title / Caption</TableHead>
                  <TableHead className="font-bold">Column</TableHead>
                  <TableHead className="font-bold">Card Size</TableHead>
                  <TableHead className="font-bold">Tags</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No gallery items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="relative h-12 w-16 rounded-lg overflow-hidden border border-border bg-muted">
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">Column {item.column}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {item.size}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.tags}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(item)} className="gap-2 cursor-pointer">
                              <Edit3 className="h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(item)} className="gap-2 text-destructive cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

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

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Image Title / Caption</label>
              <Input 
                value={formData.title || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Sultan's Dine Menu Mockup"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Image URL</label>
              <Input 
                value={formData.imageUrl || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="mt-1"
              />
            </div>

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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="font-bold">Save Image</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
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
