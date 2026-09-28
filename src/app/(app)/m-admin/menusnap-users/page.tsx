"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Phone, 
  Building2, 
  Mail, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  KeyRound, 
  MoreHorizontal, 
  UserPlus, 
  Edit3, 
  Trash2, 
  MessageCircle, 
  CheckCircle2, 
  XCircle, 
  Utensils, 
  Scissors, 
  Lock, 
  Unlock, 
  Calendar, 
  Clock,
  ArrowRight,
  UserCheck,
  UserX,
  ExternalLink,
  Shield,
  Eye,
  EyeOff,
  ChevronRight,
  Crown,
  Package,
  Check,
  Filter,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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

export default function MenuSnapUsersAdminPage() {
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
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters & Pagination
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'restaurant' | 'parlour'>('all');
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'subscribers' | 'free'>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<MenuSnapUser | null>(null);
  const [selectedUser, setSelectedUser] = useState<MenuSnapUser | null>(null);

  // Form states
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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Data
  const loadUsers = useCallback(async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getMenuSnapUsersAction({
        search: debouncedSearch,
        type: typeFilter,
        subscriberFilter: subscriberFilter,
        packageFilter: packageFilter,
        page: page,
        limit: limit,
      });

      if (res.success) {
        setUsers(res.users);
        setTotalCount(res.total);
        setStats(res.stats);
        if (res.availablePackages && res.availablePackages.length > 0) {
          setAvailablePackages(res.availablePackages);
        }
      } else {
        toast({
          title: "Error fetching users",
          description: res.error || "Could not load MenuSnap users list.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Unexpected error",
        description: err.message || "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, typeFilter, subscriberFilter, packageFilter, page, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle VIP Subscriber Toggle
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
          title: nextStatus ? "VIP Access Enabled" : "VIP Access Disabled",
          description: `${user.businessName} updated to ${nextPackage}.`,
        });
      } else {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSubscriber: currentStatus, subscriptionPackage: user.subscriptionPackage } : u));
        toast({
          title: "Update Failed",
          description: res.error || "Failed to update subscriber status.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSubscriber: currentStatus, subscriptionPackage: user.subscriptionPackage } : u));
      toast({
        title: "Error",
        description: err.message || "Network error.",
        variant: "destructive",
      });
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
          description: `${user.businessName} changed to "${newPkgName}".`,
        });
        loadUsers();
      } else {
        loadUsers();
        toast({
          title: "Failed",
          description: res.error || "Could not change package.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      loadUsers();
      toast({
        title: "Error",
        description: err.message || "Network error.",
        variant: "destructive",
      });
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
        businessName: formData.businessName,
        businessType: formData.businessType,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        division: formData.division,
        district: formData.district,
        password: formData.password,
        isSubscriber: isSub,
        subscriptionPackage: formData.subscriptionPackage,
      });

      if (res.success) {
        toast({
          title: "User Created",
          description: `Successfully added ${formData.businessName}.`,
        });
        setIsAddModalOpen(false);
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
        loadUsers();
      } else {
        toast({
          title: "Creation Failed",
          description: res.error || "Failed to create user.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
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
    setIsEditModalOpen(true);
  };

  // Update User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

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

      const res = await adminUpdateMenuSnapUserAction(selectedUser.id, {
        businessName: formData.businessName,
        businessType: formData.businessType,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        division: formData.division,
        district: formData.district,
        password: formData.password || undefined,
        isSubscriber: isSub,
        subscriptionPackage: formData.subscriptionPackage,
      });

      if (res.success) {
        toast({
          title: "User Updated",
          description: `Profile for ${formData.businessName} updated.`,
        });
        setIsEditModalOpen(false);
        loadUsers();
      } else {
        toast({
          title: "Update Failed",
          description: res.error || "Failed to update user.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update user.",
        variant: "destructive",
      });
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
        toast({
          title: "User Deleted",
          description: `${userToDelete.businessName} has been removed.`,
        });
        setUserToDelete(null);
        loadUsers();
      } else {
        toast({
          title: "Delete Failed",
          description: res.error || "Failed to delete user.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminResetClientPasswordAction(selectedUser.id, newPassword);
      if (res.success) {
        toast({
          title: "Password Set",
          description: `New password saved for ${selectedUser.businessName}.`,
        });
        setIsPasswordModalOpen(false);
        setNewPassword('');
        loadUsers();
      } else {
        toast({
          title: "Failed",
          description: res.error || "Failed to set password.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Minimal package badge helper
  const renderPackageBadge = (pkgName: string) => {
    const lower = (pkgName || '').toLowerCase();
    if (lower.includes('pro')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>{pkgName}</span>
        </span>
      );
    }
    if (lower.includes('starter')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          <span>{pkgName}</span>
        </span>
      );
    }
    if (lower.includes('enterprise')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
          <span>{pkgName}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
        <span>{pkgName || 'Free Plan'}</span>
      </span>
    );
  };

  // Get Initials for Business Avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || 'MB';
  };

  // Format WhatsApp Link
  const getWhatsAppLink = (phone: string, businessName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = encodeURIComponent(`Hello ${businessName}, this is MenuSnap Support.`);
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      {/* 1. Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300">Users Directory</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              MenuSnap Users
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {totalCount} Total
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(true)}
            disabled={loading || refreshing}
            className="h-8 px-2.5 rounded-lg border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <Button
            size="sm"
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
              setIsAddModalOpen(true);
            }}
            className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            New Client
          </Button>
        </div>
      </div>

      {/* 2. Unified Minimal Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 shadow-2xs overflow-hidden">
        {/* Total Users */}
        <div className="p-4 sm:p-5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Clients</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {loading ? "--" : stats.totalUsers}
            </span>
            <span className="text-xs text-slate-400">accounts</span>
          </div>
        </div>

        {/* Pro Lifetime */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pro VIP</p>
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-amber-600 dark:text-amber-400 tracking-tight">
              {loading ? "--" : stats.proSubscribers}
            </span>
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70">active</span>
          </div>
        </div>

        {/* Starter Lifetime */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">Starter</p>
            <Package className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400 tracking-tight">
              {loading ? "--" : stats.starterSubscribers}
            </span>
            <span className="text-xs text-blue-600/70 dark:text-blue-400/70">active</span>
          </div>
        </div>

        {/* Free Plan */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Free Leads</p>
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
              {loading ? "--" : stats.totalFreeLeads}
            </span>
            <span className="text-xs text-slate-400">leads</span>
          </div>
        </div>
      </div>

      {/* 3. Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        {/* Minimal Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-2.5 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Filter by name, phone, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-lg focus-visible:ring-1 focus-visible:ring-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Package Filter */}
            <Select
              value={packageFilter}
              onValueChange={(val: string) => {
                setPackageFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[135px] h-8.5 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                <SelectValue placeholder="Package" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="Pro">Pro Lifetime</SelectItem>
                <SelectItem value="Starter">Starter Lifetime</SelectItem>
                <SelectItem value="free">Free Plan</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(val: 'all' | 'restaurant' | 'parlour') => {
                setTypeFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[125px] h-8.5 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="parlour">Parlour</SelectItem>
              </SelectContent>
            </Select>

            {/* Subscriber Filter */}
            <Select
              value={subscriberFilter}
              onValueChange={(val: 'all' | 'subscribers' | 'free') => {
                setSubscriberFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[130px] h-8.5 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="subscribers">Subscribers</SelectItem>
                <SelectItem value="free">Free Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Minimal Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800">
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider py-2.5 pl-5">Business</TableHead>
                <TableHead className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider py-2.5">Package</TableHead>
                <TableHead className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider py-2.5">WhatsApp / Contact</TableHead>
                <TableHead className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider py-2.5">Location</TableHead>
                <TableHead className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider py-2.5">VIP Access</TableHead>
                <TableHead className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider py-2.5">Auth</TableHead>
                <TableHead className="text-slate-400 dark:text-slate-500 font-medium text-[11px] uppercase tracking-wider py-2.5 text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100 dark:border-slate-800/40">
                    <TableCell className="pl-5 py-3"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right pr-5"><div className="h-6 w-6 bg-slate-100 dark:bg-slate-800 rounded ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    No client records found matching current criteria.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    {/* Business Column */}
                    <TableCell className="pl-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-[10px] ${
                          user.businessType === 'parlour'
                            ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {getInitials(user.businessName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                              {user.businessName}
                            </span>
                            <span className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                              user.businessType === 'parlour'
                                ? 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 dark:text-pink-400'
                                : 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {user.businessType === 'parlour' ? 'Parlour' : 'Rest'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            #{user.id} • {user.createdAt.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Subscription Package & Quick Changer */}
                    <TableCell className="py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            title="Click to change package"
                          >
                            {renderPackageBadge(user.subscriptionPackage)}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs shadow-md">
                          <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-slate-400">Set Package</DropdownMenuLabel>
                          {availablePackages.map((pkg) => (
                            <DropdownMenuItem
                              key={pkg.id}
                              onClick={() => handleQuickPackageChange(user, pkg.name)}
                              className="text-xs cursor-pointer flex items-center justify-between"
                            >
                              <span>{pkg.name}</span>
                              {user.subscriptionPackage === pkg.name && (
                                <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* WhatsApp / Contact */}
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <a
                          href={getWhatsAppLink(user.whatsappNumber, user.businessName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-mono font-medium"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{user.whatsappNumber}</span>
                        </a>
                        {user.email && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[160px]" title={user.email}>
                            {user.email}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-3">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {[user.district, user.division].filter(Boolean).join(', ') || '—'}
                      </span>
                    </TableCell>

                    {/* VIP Switch */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={user.isSubscriber}
                          onCheckedChange={() => handleToggleSubscriber(user, user.isSubscriber)}
                          className="scale-85 data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white"
                        />
                        <span className="text-[11px] text-slate-500">
                          {user.isSubscriber ? "On" : "Off"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Auth */}
                    <TableCell className="py-3">
                      {user.hasPassword ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          None
                        </span>
                      )}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="py-3 text-right pr-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-md">
                          <DropdownMenuItem
                            onClick={() => openEditModal(user)}
                            className="text-xs cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-2 text-slate-500" />
                            Edit Details
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setNewPassword('');
                              setIsPasswordModalOpen(true);
                            }}
                            className="text-xs cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-2 text-slate-500" />
                            {user.hasPassword ? "Reset Password" : "Set Password"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            asChild
                            className="text-xs cursor-pointer"
                          >
                            <a
                              href={getWhatsAppLink(user.whatsappNumber, user.businessName)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                              WhatsApp
                            </a>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                          <DropdownMenuItem
                            onClick={() => setUserToDelete(user)}
                            className="text-xs text-red-600 dark:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
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

        {/* Minimal Pagination */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-700 dark:text-slate-300 font-medium">{users.length > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, totalCount)}</strong> of {totalCount}
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-7 text-xs px-2.5 rounded-md border-slate-200 dark:border-slate-800"
            >
              Prev
            </Button>
            <span className="px-1.5 text-slate-500">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="h-7 text-xs px-2.5 rounded-md border-slate-200 dark:border-slate-800"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">New Client User</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Create a new client account with assigned subscription plan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Business Name *</label>
              <Input
                required
                placeholder="e.g. Sultan's Dine"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Business Type</label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val: 'restaurant' | 'parlour') => setFormData(prev => ({ ...prev, businessType: val }))}
                >
                  <SelectTrigger className="h-8.5 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="parlour">Parlour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Plan</label>
                <Select
                  value={formData.subscriptionPackage}
                  onValueChange={(val: string) => setFormData(prev => ({ ...prev, subscriptionPackage: val }))}
                >
                  <SelectTrigger className="h-8.5 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {availablePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.name}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">WhatsApp Phone *</label>
              <Input
                required
                placeholder="017XXXXXXXX"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                className="h-8.5 text-xs rounded-lg font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
              <Input
                type="email"
                placeholder="client@domain.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Division</label>
                <Input
                  placeholder="Dhaka"
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                  className="h-8.5 text-xs rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">District</label>
                <Input
                  placeholder="Gulshan, Dhaka"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="h-8.5 text-xs rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Initial Password (Optional)</label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8 text-xs rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              >
                {isSubmitting ? "Creating..." : "Create Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Client</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update information and package for {selectedUser?.businessName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Business Name *</label>
              <Input
                required
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Business Type</label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val: 'restaurant' | 'parlour') => setFormData(prev => ({ ...prev, businessType: val }))}
                >
                  <SelectTrigger className="h-8.5 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="parlour">Parlour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Plan</label>
                <Select
                  value={formData.subscriptionPackage}
                  onValueChange={(val: string) => setFormData(prev => ({ ...prev, subscriptionPackage: val }))}
                >
                  <SelectTrigger className="h-8.5 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {availablePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.name}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">WhatsApp Phone *</label>
              <Input
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                className="h-8.5 text-xs rounded-lg font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Division</label>
                <Input
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                  className="h-8.5 text-xs rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="h-8.5 text-xs rounded-lg"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="h-8 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8 text-xs rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-sm rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Set Password</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              New login password for {selectedUser?.businessName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">New Password *</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-8.5 text-xs rounded-lg pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(false)}
                className="h-8 text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-8 text-xs rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              >
                {isSubmitting ? "Saving..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Delete Client Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Are you sure you want to permanently delete <strong>{userToDelete?.businessName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <AlertDialogCancel className="h-8 text-xs rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="h-8 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
