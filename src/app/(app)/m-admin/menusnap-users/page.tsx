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
  MoreVertical, 
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
  Coins
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  // Handle VIP Subscriber 1-Click Toggle
  const handleToggleSubscriber = async (user: MenuSnapUser, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const nextPackage = nextStatus ? 'Pro Lifetime' : 'Free Plan';

    // Optimistic update
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
          title: nextStatus ? "VIP Access Granted" : "Revoked VIP Access",
          description: `${user.businessName} is now set to ${nextPackage}.`,
        });
      } else {
        // Rollback
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

  // Handle 1-Click Package Change from Table Dropdown
  const handleQuickPackageChange = async (user: MenuSnapUser, newPkgName: string) => {
    const isFree = newPkgName.toLowerCase().includes('free');
    const isSub = !isFree;

    // Optimistic update
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, subscriptionPackage: newPkgName, isSubscriber: isSub } : u));

    try {
      const res = await updateUserPackageAction(user.id, newPkgName);
      if (res.success) {
        toast({
          title: "Package Updated",
          description: `${user.businessName} package changed to "${newPkgName}".`,
        });
        loadUsers();
      } else {
        loadUsers();
        toast({
          title: "Failed to Update",
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

  // Handle Add New User
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
          description: `Successfully added ${formData.businessName} (${formData.subscriptionPackage}).`,
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

  // Handle Update User
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
          description: `Profile for ${formData.businessName} updated successfully.`,
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

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await adminDeleteMenuSnapUserAction(userToDelete.id);
      if (res.success) {
        toast({
          title: "User Deleted",
          description: `User ${userToDelete.businessName} has been deleted.`,
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

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminResetClientPasswordAction(selectedUser.id, newPassword);
      if (res.success) {
        toast({
          title: "Password Updated",
          description: `Password for ${selectedUser.businessName} has been set.`,
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

  // Helper for rendering package badge styling
  const renderPackageBadge = (pkgName: string) => {
    const lower = pkgName.toLowerCase();
    if (lower.includes('pro')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 shadow-2xs">
          <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{pkgName}</span>
        </span>
      );
    }
    if (lower.includes('starter')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800 shadow-2xs">
          <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>{pkgName}</span>
        </span>
      );
    }
    if (lower.includes('enterprise')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{pkgName}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
        <span>{pkgName || 'Free Plan'}</span>
      </span>
    );
  };

  // Format WhatsApp Click link
  const getWhatsAppLink = (phone: string, businessName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = encodeURIComponent(`Hello ${businessName}, this is MenuSnap Support. How can we help you today?`);
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      {/* 1. Ultra-Clean Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-orange-600 font-medium">MenuSnap Users</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              MenuSnap Users
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/40 dark:border-orange-900/40">
              <Crown className="w-3.5 h-3.5 text-orange-500" /> Subscription & Client Management
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View registered client accounts, subscription packages, VIP status, passwords, and contact info.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(true)}
            disabled={loading || refreshing}
            className="rounded-xl h-9 px-3 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
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
            className="rounded-xl h-9 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold text-xs shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add New User
          </Button>
        </div>
      </div>

      {/* 2. Sleek KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? <span className="animate-pulse">--</span> : stats.totalUsers}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Registered accounts</p>
          </div>
        </div>

        {/* VIP Pro Subscribers */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pro Lifetime</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {loading ? <span className="animate-pulse">--</span> : stats.proSubscribers}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">VIP Pro accounts</p>
          </div>
        </div>

        {/* Starter Subscribers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Starter Lifetime</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {loading ? <span className="animate-pulse">--</span> : stats.starterSubscribers}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Starter accounts</p>
          </div>
        </div>

        {/* Free Leads */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Free Plan Leads</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {loading ? <span className="animate-pulse">--</span> : stats.totalFreeLeads}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Unpaid / Trial users</p>
          </div>
        </div>

        {/* Restaurants & Parlours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Types Breakdown</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{stats.totalRestaurants} <span className="text-xs font-normal text-slate-500">Rest</span></span>
              <span>•</span>
              <span>{stats.totalParlours} <span className="text-xs font-normal text-slate-500">Parlour</span></span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Categorized businesses</p>
          </div>
        </div>
      </div>

      {/* 3. Main Filter & Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name, phone, email, district, package..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-orange-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Package Filter */}
            <Select
              value={packageFilter}
              onValueChange={(val: string) => {
                setPackageFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Subscription Package" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="Pro">Pro Lifetime (VIP)</SelectItem>
                <SelectItem value="Starter">Starter Lifetime</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
                <SelectItem value="free">Free Plan</SelectItem>
              </SelectContent>
            </Select>

            {/* Business Type */}
            <Select
              value={typeFilter}
              onValueChange={(val: 'all' | 'restaurant' | 'parlour') => {
                setTypeFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[130px] h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Business Type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="restaurant">Restaurants</SelectItem>
                <SelectItem value="parlour">Parlours</SelectItem>
              </SelectContent>
            </Select>

            {/* Subscriber Status */}
            <Select
              value={subscriberFilter}
              onValueChange={(val: 'all' | 'subscribers' | 'free') => {
                setSubscriberFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="subscribers">Subscribers Only</SelectItem>
                <SelectItem value="free">Free Leads Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5 pl-6">Business / Client</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">Subscription Package</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">Contact Details</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">Location</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">VIP Switch</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">Auth / Login</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-100 dark:border-slate-800/50">
                    <TableCell className="pl-6 py-4"><div className="h-5 w-36 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-28 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-32 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-24 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-16 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-20 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right pr-6"><div className="h-8 w-8 bg-slate-100 dark:bg-slate-800/60 rounded ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No MenuSnap users found</p>
                      <p className="text-xs text-slate-400">Try adjusting your package or search filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Business Info */}
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          user.businessType === 'parlour'
                            ? 'bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-950/30 dark:border-pink-900/40 dark:text-pink-400'
                            : 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/30 dark:border-orange-900/40 dark:text-orange-400'
                        }`}>
                          {user.businessType === 'parlour' ? <Scissors className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {user.businessName}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 rounded ${
                                user.businessType === 'parlour'
                                  ? 'border-pink-200 text-pink-600 bg-pink-50/50 dark:border-pink-900/40 dark:text-pink-400 dark:bg-pink-950/20'
                                  : 'border-orange-200 text-orange-600 bg-orange-50/50 dark:border-orange-900/40 dark:text-orange-400 dark:bg-orange-950/20'
                              }`}
                            >
                              {user.businessType}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>ID: #{user.id}</span>
                            <span>•</span>
                            <span title={`Joined: ${user.createdAt}`}>Joined {user.createdAt.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Subscription Package & Quick Changer */}
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="cursor-pointer hover:opacity-85 transition-opacity text-left group/pkg"
                            title="Click to change package"
                          >
                            {renderPackageBadge(user.subscriptionPackage)}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-lg">
                          <DropdownMenuLabel className="text-xs text-slate-500">Change Package</DropdownMenuLabel>
                          {availablePackages.map((pkg) => (
                            <DropdownMenuItem
                              key={pkg.id}
                              onClick={() => handleQuickPackageChange(user, pkg.name)}
                              className="text-xs cursor-pointer flex items-center justify-between"
                            >
                              <span className="font-medium">{pkg.name}</span>
                              {user.subscriptionPackage === pkg.name && (
                                <Check className="w-3.5 h-3.5 text-orange-600" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Contact & WhatsApp */}
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div>
                          <a
                            href={getWhatsAppLink(user.whatsappNumber, user.businessName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-mono font-medium hover:underline group/wa"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover/wa:scale-110 transition-transform" />
                            <span>{user.whatsappNumber}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </div>
                        {user.email ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]" title={user.email}>
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No email</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-4">
                      {user.district || user.division ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {[user.district, user.division].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Subscriber VIP Switch */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.isSubscriber}
                          onCheckedChange={() => handleToggleSubscriber(user, user.isSubscriber)}
                          className="data-[state=checked]:bg-orange-500"
                        />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {user.isSubscriber ? "Active" : "Off"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Password Status */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {user.hasPassword ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                            <Unlock className="w-3 h-3 text-slate-400" />
                            None
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-lg">
                          <DropdownMenuLabel className="text-xs text-slate-500">User Options</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => openEditModal(user)}
                            className="text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-2 text-blue-600" />
                            Edit Profile & Package
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setNewPassword('');
                              setIsPasswordModalOpen(true);
                            }}
                            className="text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-2 text-amber-600" />
                            {user.hasPassword ? "Reset Password" : "Set Password"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleToggleSubscriber(user, user.isSubscriber)}
                            className="text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-2 text-orange-500" />
                            {user.isSubscriber ? "Revoke VIP Access" : "Grant VIP Pro Access"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            asChild
                            className="text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <a
                              href={getWhatsAppLink(user.whatsappNumber, user.businessName)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                              WhatsApp Chat
                            </a>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                          <DropdownMenuItem
                            onClick={() => setUserToDelete(user)}
                            className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete Account
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="text-slate-900 dark:text-white font-semibold">{users.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
            <span className="text-slate-900 dark:text-white font-semibold">{Math.min(page * limit, totalCount)}</span> of{' '}
            <span className="text-slate-900 dark:text-white font-semibold">{totalCount}</span> users
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
            >
              Previous
            </Button>
            <span className="px-2 text-slate-600 dark:text-slate-400">
              Page <span className="text-slate-900 dark:text-white font-semibold">{page}</span> of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="h-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-orange-500" />
              Add MenuSnap Client User
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Register a new restaurant or beauty parlour account with assigned subscription package.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business Name *</label>
                <Input
                  required
                  placeholder="e.g. Sultan's Dine or Glamour Beauty Lounge"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business Type *</label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val: 'restaurant' | 'parlour') => setFormData(prev => ({ ...prev, businessType: val }))}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectItem value="restaurant">Restaurant / Food</SelectItem>
                    <SelectItem value="parlour">Beauty Parlour / Salon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subscription Package *</label>
                <Select
                  value={formData.subscriptionPackage}
                  onValueChange={(val: string) => setFormData(prev => ({ ...prev, subscriptionPackage: val }))}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    {availablePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.name}>
                        {pkg.name} {pkg.price > 0 ? `(৳${pkg.price.toLocaleString()})` : '(Free)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">WhatsApp Phone *</label>
                <Input
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Division</label>
                <Input
                  placeholder="e.g. Dhaka"
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">District</label>
                <Input
                  placeholder="e.g. Gulshan, Dhaka"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initial Password (Optional)</label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters (or leave empty)"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-slate-200 dark:border-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Edit Client Profile & Package
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update information and subscription package settings for {selectedUser?.businessName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business Name *</label>
                <Input
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Business Type *</label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val: 'restaurant' | 'parlour') => setFormData(prev => ({ ...prev, businessType: val }))}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectItem value="restaurant">Restaurant / Food</SelectItem>
                    <SelectItem value="parlour">Beauty Parlour / Salon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subscription Package *</label>
                <Select
                  value={formData.subscriptionPackage}
                  onValueChange={(val: string) => setFormData(prev => ({ ...prev, subscriptionPackage: val }))}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    {availablePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.name}>
                        {pkg.name} {pkg.price > 0 ? `(৳${pkg.price.toLocaleString()})` : '(Free)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">WhatsApp Phone *</label>
                <Input
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Division</label>
                <Input
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="border-slate-200 dark:border-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Set a new login password for <span className="font-semibold text-slate-900 dark:text-white">{selectedUser?.businessName}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password *</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                className="border-slate-200 dark:border-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Client User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Are you sure you want to permanently delete <strong>{userToDelete?.businessName}</strong> ({userToDelete?.whatsappNumber})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <AlertDialogCancel className="border-slate-200 dark:border-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
