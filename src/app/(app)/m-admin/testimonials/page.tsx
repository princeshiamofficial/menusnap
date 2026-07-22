"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission } from '@/lib/admin-permissions';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  HeartHandshake, 
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from '@/hooks/use-toast';
import { TeamCarousel, TeamMember } from "@/components/ui/team-carousel";

interface TestimonialItem {
  id: string;
  name: string;
  category: 'restaurant' | 'cafe' | 'bakery' | 'fast-food' | 'fine-dining';
  categoryLabel: string;
  location: string;
  rating: number;
  ordersCount: string;
  joinedYear: string;
  review: string;
  ownerName: string;
  isSpotlight: boolean;
  image?: string;
}

const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    name: "Sultan's Dine",
    category: 'restaurant',
    categoryLabel: 'Traditional Kacchi & Biryani',
    location: 'Dhaka',
    rating: 5.0,
    ordersCount: '50K+',
    joinedYear: '2023',
    review: 'Serving over 50,000+ happy diners monthly with instant digital table menus and zero order bottlenecks.',
    ownerName: 'Tanvir Hossain (Operations Head)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'North End Coffee',
    category: 'cafe',
    categoryLabel: 'Specialty Roastery & Cafe',
    location: 'Gulshan',
    rating: 4.9,
    ordersCount: '35K+',
    joinedYear: '2023',
    review: 'Dynamic seasonal menu updates published in real-time across 12 outlets in Bangladesh.',
    ownerName: 'Rick Hubbard (CEO)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Chillox Gourmet Burgers',
    category: 'fast-food',
    categoryLabel: 'Fast Casual Dining',
    location: 'Banani',
    rating: 4.9,
    ordersCount: '80K+',
    joinedYear: '2023',
    review: 'Processing over 80,000+ digital orders with lightning-fast QR code table scans and customizable toppings.',
    ownerName: 'Jubair Ahmed (Co-founder)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Secret Recipe',
    category: 'bakery',
    categoryLabel: 'Fine Cakes & Western Cuisine',
    location: 'Uttara',
    rating: 4.8,
    ordersCount: '42K+',
    joinedYear: '2024',
    review: 'Streamlined WhatsApp order dispatch and table reservation sync for seamless peak-hour turnover.',
    ownerName: 'Sharmin Akter (Branch Manager)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'The Garden Bistro',
    category: 'fine-dining',
    categoryLabel: 'Continental Fine Dining',
    location: 'Sylhet',
    rating: 5.0,
    ordersCount: '20K+',
    joinedYear: '2024',
    review: 'Delighting guests with glassmorphism digital menus that perfectly complement the luxury dining vibe.',
    ownerName: 'Dr. Faisal Rahman (Owner)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
];

export default function TestimonialsAdminPage() {
  const { adminUser, adminLoading } = useAdminAuth();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);
  
  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<TestimonialItem>>({
    name: '',
    category: 'restaurant',
    categoryLabel: '',
    location: '',
    rating: 5.0,
    ordersCount: '10K+',
    joinedYear: '2024',
    review: '',
    ownerName: '',
    isSpotlight: true,
    image: '',
  });

  const hasViewPermission = useMemo(() => {
    return checkClientPermission(adminUser, 'testimonials', 'view');
  }, [adminUser]);

  const spotlightCarouselMembers: TeamMember[] = useMemo(() => {
    return testimonials
      .filter(t => t.isSpotlight)
      .map((t) => ({
        id: t.id,
        name: t.name,
        role: `${t.categoryLabel || t.category.toUpperCase()} • ${t.location}`,
        bio: t.review,
        image: t.image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      }));
  }, [testimonials]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'restaurant',
      categoryLabel: 'Specialty Roastery & Cafe',
      location: 'Gulshan',
      rating: 5.0,
      ordersCount: '10K+',
      joinedYear: '2024',
      review: '',
      ownerName: '',
      isSpotlight: true,
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsAddEditOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.review || !formData.ownerName) {
      toast({ title: "Validation Error", description: "Please fill in all required fields (Name, Review, Owner Name)", variant: "destructive" });
      return;
    }

    if (editingItem) {
      setTestimonials(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...formData } as TestimonialItem : item));
      toast({ title: "Success", description: "Testimonial updated successfully!" });
    } else {
      const newItem: TestimonialItem = {
        id: Date.now().toString(),
        name: formData.name || '',
        category: (formData.category as any) || 'restaurant',
        categoryLabel: formData.categoryLabel || formData.category || 'Restaurant',
        location: formData.location || 'Dhaka',
        rating: Number(formData.rating) || 5.0,
        ordersCount: formData.ordersCount || '10K+',
        joinedYear: formData.joinedYear || '2024',
        review: formData.review || '',
        ownerName: formData.ownerName || '',
        isSpotlight: Boolean(formData.isSpotlight),
        image: formData.image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      };
      setTestimonials(prev => [newItem, ...prev]);
      toast({ title: "Success", description: "New testimonial added successfully!" });
    }
    setIsAddEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setTestimonials(prev => prev.filter(item => item.id !== deleteTarget.id));
    toast({ title: "Deleted", description: "Testimonial deleted successfully!" });
    setDeleteTarget(null);
  };

  if (adminLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
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
        <p className="text-sm text-muted-foreground mt-2">You do not have permission to view Testimonials Management.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-background min-h-screen">


      {/* Featured 3D Spotlight Carousel Section */}
      <div className="w-full max-w-6xl mx-auto">
        <TeamCarousel 
          members={spotlightCarouselMembers} 
          title="HAPPY CLIENTS"
          titleColor="rgba(245, 158, 11, 0.8)"
          cardWidth={300}
          cardHeight={400}
          autoPlay={4000}
          infoTextColor="hsl(var(--foreground))"
          infoPosition="bottom"
          className="min-h-0 py-2"
          actionSlot={(member) => {
            const item = testimonials.find(t => t.id === member.id);
            return (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handleOpenAdd}
                  className="h-8 px-3 gap-1.5 font-bold text-xs shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" /> Add New
                </Button>
                {item && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 px-3 gap-1.5 font-bold text-xs bg-background/80 backdrop-blur-md shadow-md border-border hover:bg-accent"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => setDeleteTarget(item)}
                      className="h-8 px-3 gap-1.5 font-bold text-xs shadow-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </>
                )}
              </div>
            );
          }}
        />
      </div>



      {/* Add / Edit Dialog */}
      <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure testimonial text, client details, and 3D Carousel photo URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Client Name</label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. North End Coffee"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Category / Subtitle Label</label>
              <Input 
                value={formData.categoryLabel || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, categoryLabel: e.target.value }))}
                placeholder="e.g. Specialty Roastery & Cafe"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">3D Carousel Photo URL</label>
              <Input 
                value={formData.image || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://images.unsplash.com/photo-1501339847302..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
                <select
                  value={formData.category || 'restaurant'}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full h-10 mt-1 px-3 rounded-md border border-input bg-background text-sm font-medium"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="bakery">Bakery</option>
                  <option value="fast-food">Fast Food</option>
                  <option value="fine-dining">Fine Dining</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Rating (1-5)</label>
                <Input 
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating || 5.0} 
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Location / Branch</label>
              <Input 
                value={formData.location || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Gulshan"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Owner / Representative Name</label>
              <Input 
                value={formData.ownerName || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                placeholder="e.g. Rick Hubbard (CEO)"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Review / Bio Content</label>
              <textarea 
                value={formData.review || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
                placeholder="Enter client testimonial text..."
                rows={3}
                className="w-full mt-1 p-3 rounded-md border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="font-bold">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete testimonial for &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
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
