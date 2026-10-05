"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  PlusCircle, 
  UserCog, 
  Target, 
  UserX, 
  UserCheck, 
  AlertTriangle, 
  Edit3, 
  MoreVertical, 
  KeyRound, 
  Trash2, 
  RefreshCw, 
  Loader2, 
  Filter, 
  Eye, 
  BadgeCheck, 
  Unlock, 
  Lock, 
  MapPin, 
  Search, 
  MessageCircle, 
  ExternalLink,
  Crown,
  Package as PackageIcon,
  Check,
  CheckCircle2,
  Sparkles,
  Utensils,
  Scissors,
  X,
  ChevronDown
} from "lucide-react";
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getMenuSnapUsersAction,
  toggleSubscriberStatusAction,
  updateUserPackageAction,
  adminCreateMenuSnapUserAction,
  adminUpdateMenuSnapUserAction,
  adminDeleteMenuSnapUserAction,
  adminResetClientPasswordAction,
  MenuSnapUser,
  MenuSnapUserStats,
} from '@/app/actions/menusnap-users';

export default function MenuSnapUsersPage() {
  const { toast } = useToast();
  
  // State
  const [users, setUsers] = useState<MenuSnapUser[]>([]);
  const [stats, setStats] = useState<MenuSnapUserStats>({
    totalUsers: 0,
    totalSubscribers: 0,
    totalFreeLeads: 0,
    totalRestaurants: 0,
    totalParlours: 0,
    proSubscribers: 0,
    starterSubscribers: 0,
  });
  const [availablePackages, setAvailablePackages] = useState<{ id: string; name: string; price: number }[]>([
    { id: 'free', name: 'Free Plan', price: 0 },
    { id: 'starter', name: 'Starter Lifetime', price: 499 },
    { id: 'pro', name: 'Pro Lifetime', price: 1499 },
    { id: 'enterprise', name: 'Enterprise Lifetime', price: 4999 },
  ]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'subscribers' | 'free'>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'restaurant' | 'parlour'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 20;

  // Dialogs
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState<boolean>(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState<boolean>(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<MenuSnapUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<MenuSnapUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'restaurant' as 'restaurant' | 'parlour',
    whatsappNumber: '',
    email: '',
    division: '',
    district: '',
    password: '',
    isSubscriber: false,
    subscriptionPackage: 'Pro Lifetime',
  });
  const [newPassword, setNewPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch Users
  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await getMenuSnapUsersAction({
        search: debouncedSearch,
        type: typeFilter,
        subscriberFilter: statusFilter,
        packageFilter: packageFilter,
        page: currentPage,
        limit: limit,
      });

      if (res.success) {
        setUsers(res.users);
        setTotalCount(res.total);
        setStats(res.stats);
        if (res.availablePackages?.length) {
          setAvailablePackages(res.availablePackages);
        }
      } else {
        toast({
          title: "Failed to load users",
          description: res.error || "Could not retrieve user directory.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, typeFilter, statusFilter, packageFilter, currentPage, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 1-Click VIP Switch Toggle
  const handleToggleSubscriber = async (user: MenuSnapUser, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const nextPackage = nextStatus ? 'Pro Lifetime' : 'Free Plan';

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSubscriber: nextStatus, subscriptionPackage: nextPackage } : u));
    setStats(prev => ({
      ...prev,
      totalSubscribers: nextStatus ? prev.totalSubscribers + 1 : prev.totalSubscribers - 1,
      totalFreeLeads: nextStatus ? prev.totalFreeLeads - 1 : prev.totalFreeLeads + 1,
    }));

    try {
      const res = await toggleSubscriberStatusAction(user.id, nextStatus, nextPackage);
      if (res.success) {
        toast({
          title: nextStatus ? "VIP Access Granted" : "VIP Access Revoked",
          description: `${user.businessName} updated to ${nextPackage}.`,
        });
      } else {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSubscriber: currentStatus, subscriptionPackage: user.subscriptionPackage } : u));
        toast({ title: "Update Failed", description: res.error, variant: "destructive" });
      }
    } catch (err: any) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSubscriber: currentStatus, subscriptionPackage: user.subscriptionPackage } : u));
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Quick Package Change
  const handleQuickPackageChange = async (user: MenuSnapUser, newPkgName: string) => {
    const isFree = newPkgName.toLowerCase().includes('free');
    const isSub = !isFree;

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, subscriptionPackage: newPkgName, isSubscriber: isSub } : u));

    try {
      const res = await updateUserPackageAction(user.id, newPkgName);
      if (res.success) {
        toast({
          title: "Package Updated",
          description: `${user.businessName} is now on ${newPkgName}.`,
        });
        fetchUsers();
      } else {
        fetchUsers();
        toast({ title: "Failed", description: res.error, variant: "destructive" });
      }
    } catch (err: any) {
      fetchUsers();
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim() || !formData.whatsappNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Business name and WhatsApp number are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const isSub = !formData.subscriptionPackage.toLowerCase().includes('free');
      const res = await adminCreateMenuSnapUserAction({
        ...formData,
        isSubscriber: isSub,
      });

      if (res.success) {
        toast({
          title: "User Added",
          description: `${formData.businessName} has been registered.`,
        });
        setIsAddUserDialogOpen(false);
        setFormData({
          businessName: '',
          businessType: 'restaurant',
          whatsappNumber: '',
          email: '',
          division: '',
          district: '',
          password: '',
          isSubscriber: false,
          subscriptionPackage: 'Pro Lifetime',
        });
        fetchUsers();
      } else {
        toast({ title: "Creation Failed", description: res.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit User
  const openEditModal = (user: MenuSnapUser) => {
    setSelectedUser(user);
    setFormData({
      businessName: user.businessName,
      businessType: user.businessType,
      whatsappNumber: user.whatsappNumber,
      email: user.email || '',
      division: user.division || '',
      district: user.district || '',
      password: '',
      isSubscriber: user.isSubscriber,
      subscriptionPackage: user.subscriptionPackage || (user.isSubscriber ? 'Pro Lifetime' : 'Free Plan'),
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const isSub = !formData.subscriptionPackage.toLowerCase().includes('free');
      const res = await adminUpdateMenuSnapUserAction(selectedUser.id, {
        ...formData,
        password: formData.password || undefined,
        isSubscriber: isSub,
      });

      if (res.success) {
        toast({
          title: "User Updated",
          description: `Profile for ${formData.businessName} saved.`,
        });
        setIsEditUserDialogOpen(false);
        fetchUsers();
      } else {
        toast({ title: "Update Failed", description: res.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await adminDeleteMenuSnapUserAction(userToDelete.id);
      if (res.success) {
        toast({ title: "User Deleted", description: "Account removed successfully." });
        setUserToDelete(null);
        fetchUsers();
      } else {
        toast({ title: "Delete Failed", description: res.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminResetClientPasswordAction(selectedUser.id, newPassword);
      if (res.success) {
        toast({ title: "Password Set", description: `Password for ${selectedUser.businessName} updated.` });
        setIsPasswordDialogOpen(false);
        setNewPassword('');
        fetchUsers();
      } else {
        toast({ title: "Failed", description: res.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initials generator
  const getInitials = (name: string) => {
    if (!name) return "MS";
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // WhatsApp Link
  const getWhatsAppLink = (phone: string, businessName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = encodeURIComponent(`Hello ${businessName}, this is MenuSnap Support.`);
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Render pagination numbers (ERPApp pattern)
  const renderPaginationItems = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage < 3) endPage = maxPagesToShow;
      else if (currentPage > totalPages - 2) startPage = totalPages - maxPagesToShow + 1;

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((p, index) => (
      <PaginationItem key={index}>
        {p === '...' ? (
          <PaginationEllipsis />
        ) : (
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(p as number);
            }}
            className={cn(
              currentPage === p && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {p}
          </PaginationLink>
        )}
      </PaginationItem>
    ));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Metric Cards - Modern Minimal SaaS Style */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-card border border-border/60 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Users</p>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : stats.totalUsers}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <UserCog className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Subscribers</p>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : stats.totalSubscribers}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Crown className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Free Leads</p>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : stats.totalFreeLeads}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Target className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Restaurants</p>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : stats.totalRestaurants}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Utensils className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Parlours</p>
            <h3 className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-0.5">
              {isLoading ? <Skeleton className="h-7 w-12" /> : stats.totalParlours}
            </h3>
          </div>
          <div className="h-9 w-9 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <Scissors className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm border border-border/60 bg-card rounded-2xl overflow-hidden">
        {/* Table Toolbar Header */}
        <CardHeader className="border-b border-border/50 p-4 sm:p-5 bg-card">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-foreground text-lg sm:text-xl font-bold tracking-tight">All MenuSnap Users</CardTitle>
              <CardDescription className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                Overview of all registered client restaurants, beauty parlours, subscription packages, and accounts.
              </CardDescription>
            </div>

            {/* Right Toolbar */}
            <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              {/* Search Bar */}
              <div className="relative flex-grow sm:flex-grow-0 sm:w-64 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8 bg-muted/40 hover:bg-muted/60 focus:bg-background border-border/60 h-9.5 text-xs rounded-xl shadow-2xs transition-all w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Package Filter */}
              <Select
                value={packageFilter}
                onValueChange={(val) => {
                  setPackageFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[130px] h-9.5 text-xs rounded-xl border-border/60 bg-muted/40 hover:bg-muted/60 transition-all font-medium">
                  <SelectValue placeholder="Package" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="all">All Packages</SelectItem>
                  <SelectItem value="Pro">Pro Lifetime</SelectItem>
                  <SelectItem value="Starter">Starter Lifetime</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="free">Free Plan</SelectItem>
                </SelectContent>
              </Select>

              {/* Business Type Filter */}
              <Select
                value={typeFilter}
                onValueChange={(val: any) => {
                  setTypeFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[110px] h-9.5 text-xs rounded-xl border-border/60 bg-muted/40 hover:bg-muted/60 transition-all font-medium">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="parlour">Parlour</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(val: any) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[120px] h-9.5 text-xs rounded-xl border-border/60 bg-muted/40 hover:bg-muted/60 transition-all font-medium">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/60">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="subscribers">Subscribers</SelectItem>
                  <SelectItem value="free">Free Leads</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchUsers(true)}
                disabled={isLoading || isRefreshing}
                className="h-9.5 w-9.5 rounded-xl border-border/60 bg-muted/40 hover:bg-muted/60 shrink-0"
                title="Refresh user list"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Add New User */}
              <Button
                onClick={() => {
                  setFormData({
                    businessName: '',
                    businessType: 'restaurant',
                    whatsappNumber: '',
                    email: '',
                    division: '',
                    district: '',
                    password: '',
                    isSubscriber: false,
                    subscriptionPackage: 'Pro Lifetime',
                  });
                  setIsAddUserDialogOpen(true);
                }}
                className="w-full sm:w-auto rounded-xl h-9.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs shadow-sm hover:shadow transition-all shrink-0"
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-white" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/40">
                <TableHead className="pl-6 w-[55px]">#</TableHead>
                <TableHead className="min-w-[250px]">Business & Client</TableHead>
                <TableHead className="min-w-[160px]">Plan / Tier</TableHead>
                <TableHead className="min-w-[190px]">Contact & WhatsApp</TableHead>
                <TableHead className="min-w-[140px]">Location</TableHead>
                <TableHead className="min-w-[110px]">VIP Access</TableHead>
                <TableHead className="min-w-[95px]">Security</TableHead>
                <TableHead className="pr-6 text-right w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <TableRow key={`skel-user-${i}`} className="border-b border-border/30">
                    <TableCell className="pl-6"><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </TableCell>
                    <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                    <TableCell className="pr-6 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 h-[300px]">
                    <PackageIcon className="mx-auto h-12 w-12 opacity-35 mb-3 text-muted-foreground" />
                    <p className="text-base text-muted-foreground font-medium">
                      {searchTerm ? "No users match your search." : "No MenuSnap users found."}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {searchTerm ? "Try searching with a different term or clear filters." : "Users will appear here once registered."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => {
                  const isPro = user.subscriptionPackage.toLowerCase().includes('pro');
                  const isStarter = user.subscriptionPackage.toLowerCase().includes('starter');
                  const isEnterprise = user.subscriptionPackage.toLowerCase().includes('enterprise');

                  return (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors border-b border-border/30">
                      {/* Serial Number */}
                      <TableCell className="pl-6 font-mono text-muted-foreground/60 text-xs">
                        {(currentPage - 1) * limit + index + 1}
                      </TableCell>

                      {/* Combined Business & Client Profile */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.businessType === 'parlour' ? (
                            <div 
                              className="h-9 w-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 flex items-center justify-center shrink-0 shadow-2xs"
                              title="Beauty Parlour"
                            >
                              <Scissors className="h-4.5 w-4.5" />
                            </div>
                          ) : (
                            <div 
                              className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0 shadow-2xs"
                              title="Restaurant"
                            >
                              <Utensils className="h-4.5 w-4.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-foreground truncate max-w-[240px] sm:max-w-sm" title={user.businessName}>
                              {user.businessName}
                            </div>
                            <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5 flex items-center gap-1.5">
                              <span>ID: #{user.id}</span>
                              <span>•</span>
                              <span>Joined {user.createdAt ? user.createdAt.split(' ')[0] : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Subscription Package Badge with Quick Dropdown */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="group/pkg inline-flex items-center gap-1.5 cursor-pointer focus:outline-none transition-all"
                              title="Click to switch package"
                            >
                              {isPro ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 group-hover/pkg:bg-amber-500/20 font-semibold text-xs transition-colors">
                                  <Crown className="h-3 w-3 text-amber-500" />
                                  {user.subscriptionPackage}
                                  <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover/pkg:opacity-100" />
                                </span>
                              ) : isStarter ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 group-hover/pkg:bg-blue-500/20 font-semibold text-xs transition-colors">
                                  <PackageIcon className="h-3 w-3 text-blue-500" />
                                  {user.subscriptionPackage}
                                  <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover/pkg:opacity-100" />
                                </span>
                              ) : isEnterprise ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 group-hover/pkg:bg-purple-500/20 font-semibold text-xs transition-colors">
                                  <Sparkles className="h-3 w-3 text-purple-500" />
                                  {user.subscriptionPackage}
                                  <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover/pkg:opacity-100" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground border border-border/50 group-hover/pkg:bg-muted font-medium text-xs transition-colors">
                                  {user.subscriptionPackage || 'Free Plan'}
                                  <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover/pkg:opacity-100" />
                                </span>
                              )}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-lg border border-border/60">
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Change Subscription</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {availablePackages.map((pkg) => (
                              <DropdownMenuItem
                                key={pkg.id}
                                onClick={() => handleQuickPackageChange(user, pkg.name)}
                                className="text-xs cursor-pointer flex items-center justify-between"
                              >
                                <span>{pkg.name}</span>
                                {user.subscriptionPackage === pkg.name && (
                                  <Check className="h-3.5 w-3.5 text-primary" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      {/* WhatsApp / Contact */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <a
                            href={getWhatsAppLink(user.whatsappNumber, user.businessName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-foreground/90 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 font-medium group/wa"
                            title="Chat on WhatsApp"
                          >
                            <span className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover/wa:bg-emerald-500 group-hover/wa:text-white transition-all">
                              <MessageCircle className="h-3 w-3" />
                            </span>
                            <span>{user.whatsappNumber}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-30 group-hover/wa:opacity-100 transition-opacity" />
                          </a>
                          <div className="text-[11px] text-muted-foreground/70 truncate max-w-[170px] pl-6 font-normal">
                            {user.email || <span className="opacity-30">—</span>}
                          </div>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                          <span className="truncate max-w-[140px]" title={user.address || [user.district, user.division].filter(Boolean).join(', ')}>
                            {(() => {
                              if (user.address && user.address.trim()) return user.address.trim();
                              const parts = [user.district?.trim(), user.division?.trim()].filter(Boolean) as string[];
                              if (parts.length === 0) return <span className="text-muted-foreground/40">—</span>;
                              if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
                                return parts[0];
                              }
                              return parts.join(', ');
                            })()}
                          </span>
                        </div>
                      </TableCell>

                      {/* VIP Access Switch */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.isSubscriber}
                            onCheckedChange={() => handleToggleSubscriber(user, user.isSubscriber)}
                            className="data-[state=checked]:bg-orange-500 scale-90"
                          />
                          <span className={cn(
                            "text-xs font-medium transition-colors",
                            user.isSubscriber 
                              ? "text-orange-600 dark:text-orange-400 font-semibold" 
                              : "text-muted-foreground/50"
                          )}>
                            {user.isSubscriber ? "Active" : "Off"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Auth Status */}
                      <TableCell>
                        {user.hasPassword ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Lock className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground/60 border border-border/40">
                            <Unlock className="h-3 w-3 opacity-60" />
                            None
                          </span>
                        )}
                      </TableCell>

                      {/* Actions Menu */}
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors" title="User Actions">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border border-border/60">
                              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                                Actions for <span className="font-semibold text-foreground">{user.businessName}</span>
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() => openEditModal(user)}
                                  className="cursor-pointer text-xs"
                                >
                                  <Edit3 className="mr-2 h-3.5 w-3.5 text-primary" /> Edit Profile & Package
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setNewPassword('');
                                    setIsPasswordDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-xs"
                                >
                                  <KeyRound className="mr-2 h-3.5 w-3.5 text-amber-500" /> Set / Reset Password
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  asChild
                                  className="cursor-pointer text-xs"
                                >
                                  <a
                                    href={getWhatsAppLink(user.whatsappNumber, user.businessName)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <MessageCircle className="mr-2 h-3.5 w-3.5 text-emerald-500" /> WhatsApp Chat
                                  </a>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  onClick={() => setUserToDelete(user)}
                                  className="cursor-pointer text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete User
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
        </CardContent>

        {/* Minimal Modern Pagination Footer */}
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-muted/20 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{users.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min(currentPage * limit, totalCount)}</span> of{' '}
            <span className="font-medium text-foreground">{totalCount}</span> results
          </div>

          {totalPages > 1 && (
            <Pagination className="justify-end w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={cn(currentPage <= 1 && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                    }}
                    className={cn(currentPage >= totalPages && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="bg-card text-card-foreground max-w-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-orange-500" />
              Add MenuSnap User
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Register a new client restaurant or parlour with initial subscription tier.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Business Name *</label>
              <Input
                required
                placeholder="e.g. Sultan's Dine"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Business Type</label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val: 'restaurant' | 'parlour') => setFormData(prev => ({ ...prev, businessType: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="parlour">Parlour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subscription Plan</label>
                <Select
                  value={formData.subscriptionPackage}
                  onValueChange={(val: string) => setFormData(prev => ({ ...prev, subscriptionPackage: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.name}>
                        {pkg.name} {pkg.price > 0 ? `(৳${pkg.price})` : '(Free)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">WhatsApp Number *</label>
              <Input
                required
                placeholder="017XXXXXXXX"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email (Optional)</label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Division</label>
                <Input
                  placeholder="Dhaka"
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">District</label>
                <Input
                  placeholder="Gulshan, Dhaka"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Initial Password (Optional)</label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="bg-card text-card-foreground max-w-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              Edit User Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Modify account info and assigned package for {selectedUser?.businessName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Business Name *</label>
              <Input
                required
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Business Type</label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val: 'restaurant' | 'parlour') => setFormData(prev => ({ ...prev, businessType: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="parlour">Parlour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Subscription Plan</label>
                <Select
                  value={formData.subscriptionPackage}
                  onValueChange={(val: string) => setFormData(prev => ({ ...prev, subscriptionPackage: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.name}>
                        {pkg.name} {pkg.price > 0 ? `(৳${pkg.price})` : '(Free)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">WhatsApp Number *</label>
              <Input
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Division</label>
                <Input
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditUserDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground font-medium"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-card text-card-foreground max-w-sm shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" />
              Set Password
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter new password for {selectedUser?.businessName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">New Password *</label>
              <Input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
              >
                {isSubmitting ? "Saving..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="bg-card text-card-foreground shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete <strong>{userToDelete?.businessName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
