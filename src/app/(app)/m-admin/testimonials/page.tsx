"use client";

import React, { useState, useMemo } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission } from '@/lib/admin-permissions';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Star, 
  HeartHandshake, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  MoreVertical,
  Eye,
  Layers
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
    categoryLabel: 'Traditional Biryani',
    location: 'Kacchi & Biryani • Dhaka',
    rating: 5.0,
    ordersCount: '50K+',
    joinedYear: '2023',
    review: 'Serving over 50,000+ happy diners monthly with instant digital table menus and zero order bottlenecks.',
    ownerName: 'Sultan Ahmed (Founder)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'North End Coffee',
    category: 'cafe',
    categoryLabel: 'Specialty Roastery & Cafe',
    location: 'Gulshan, Dhaka',
    rating: 4.9,
    ordersCount: '35K+',
    joinedYear: '2023',
    review: 'Dynamic seasonal menu updates published in real-time across 12 outlets in Bangladesh.',
    ownerName: 'Rick Hubbard (CEO)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Tasty Treat',
    category: 'bakery',
    categoryLabel: 'Bakery & Pastry',
    location: 'Dhanmondi, Dhaka',
    rating: 4.8,
    ordersCount: '42K+',
    joinedYear: '2024',
    review: 'Fast setup and extremely responsive interface. Managing orders via WhatsApp and digital table menus has doubled our peak-hour turnover.',
    ownerName: 'Sharmin Akter (Branch Manager)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    name: 'Chillox',
    category: 'fast-food',
    categoryLabel: 'Fast Food Burgers',
    location: 'Banani, Dhaka',
    rating: 4.9,
    ordersCount: '80K+',
    joinedYear: '2023',
    review: 'MenuSnap is lighting fast for our burger-hungry youth crowd. The order customization options and instantaneous loading are top-notch.',
    ownerName: 'Jubair Ahmed (Co-founder)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    name: 'The Garden Bistro',
    category: 'fine-dining',
    categoryLabel: 'Fine Dining & Grill',
    location: 'Sylhet Sadar, Sylhet',
    rating: 5.0,
    ordersCount: '20K+',
    joinedYear: '2024',
    review: 'The dark-mode glassmorphism aesthetics perfectly align with our high-end restaurant ambiance.',
    ownerName: 'Dr. Faisal Rahman (Owner)',
    isSpotlight: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
];

export default function TestimonialsAdminPage() {
  const { adminUser, adminLoading } = useAdminAuth();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'manage' | 'carousel'>('manage');
  
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
    isSpotlight: false,
    image: '',
  });

  const hasViewPermission = useMemo(() => {
    return checkClientPermission(adminUser, 'testimonials', 'view');
  }, [adminUser]);

  const filteredItems = useMemo(() => {
    return testimonials.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [testimonials, searchTerm, categoryFilter]);

  const spotlightCarouselMembers: TeamMember[] = useMemo(() => {
    return testimonials
      .filter(t => t.isSpotlight)
      .map((t) => ({
        id: t.id,
        name: t.name,
        role: `${t.categoryLabel || t.category.toUpperCase()} • ${t.location}`,
        bio: t.review,
        image: t.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      }));
  }, [testimonials]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'restaurant',
      categoryLabel: 'Restaurant & Cafe',
      location: 'Dhaka',
      rating: 5.0,
      ordersCount: '10K+',
      joinedYear: '2024',
      review: '',
      ownerName: '',
      isSpotlight: true,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
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
        image: formData.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
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
        <p className="text-sm text-muted-foreground mt-2">You do not have permission to view Testimonials Management.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <HeartHandshake className="h-7 w-7 text-primary" />
            Testimonials Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Happy Client reviews, spotlight 3D carousel items, and restaurant ratings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant={activeTab === 'manage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('manage')}
            className="gap-2 font-bold"
          >
            <Building2 className="h-4 w-4" /> Manage Table
          </Button>
          <Button 
            variant={activeTab === 'carousel' ? 'default' : 'outline'}
            onClick={() => setActiveTab('carousel')}
            className="gap-2 font-bold"
          >
            <Eye className="h-4 w-4" /> Live Carousel Preview
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2 font-bold shadow-md">
            <Plus className="h-4 w-4" /> Add Testimonial
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Total Clients</span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{testimonials.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Average Rating</span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">4.9 / 5.0</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Spotlight Carousel</span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">
            {testimonials.filter(t => t.isSpotlight).length} Cards
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Sync Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 mt-2">Active</p>
        </div>
      </div>

      {activeTab === 'carousel' ? (
        /* Live 3D Carousel Preview Section */
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
          <div className="mb-4 pb-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-bold text-foreground uppercase tracking-wider">Live 3D Spotlight Carousel Preview</span>
            </div>
            <Badge variant="outline" className="text-primary border-primary">Live Interactive Component</Badge>
          </div>
          <div className="w-full max-w-5xl mx-auto py-4">
            <TeamCarousel 
              members={spotlightCarouselMembers} 
              title="HAPPY CLIENTS"
              titleColor="rgba(245, 158, 11, 0.8)"
              cardWidth={300}
              cardHeight={400}
              autoPlay={4000}
              infoTextColor="hsl(var(--foreground))"
              infoPosition="bottom"
              className="min-h-0 py-4"
            />
          </div>
        </div>
      ) : (
        /* Manage Table Section */
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by client name, location, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'restaurant', 'cafe', 'bakery', 'fast-food', 'fine-dining'].map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className="capitalize text-xs font-semibold"
                >
                  {cat === 'all' ? 'All' : cat.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold">Client Name</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">Rating</TableHead>
                  <TableHead className="font-bold">Owner / Representative</TableHead>
                  <TableHead className="font-bold">Spotlight</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No testimonials found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-foreground">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[11px]">
                          {item.category.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.location}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 font-bold text-xs text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          {item.rating.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90">{item.ownerName}</TableCell>
                      <TableCell>
                        {item.isSpotlight ? (
                          <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px]">
                            Spotlight Card
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Standard</span>
                        )}
                      </TableCell>
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
              {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter restaurant testimonial details and 3D Carousel photo URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Client Name</label>
              <Input 
                value={formData.name || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sultan's Dine"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Carousel Photo URL</label>
              <Input 
                value={formData.image || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
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
              <label className="text-xs font-bold text-muted-foreground uppercase">Location / Subtitle</label>
              <Input 
                value={formData.location || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Banani, Dhaka"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Owner / Representative Name</label>
              <Input 
                value={formData.ownerName || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                placeholder="e.g. Sharmin Akter (Branch Manager)"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase">Review Content</label>
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
