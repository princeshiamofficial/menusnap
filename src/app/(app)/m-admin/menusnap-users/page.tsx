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
  EyeOff
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
  });
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters & Pagination
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'restaurant' | 'parlour'>('all');
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'subscribers' | 'free'>('all');
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
        page: page,
        limit: limit,
      });

      if (res.success) {
        setUsers(res.users);
        setTotalCount(res.total);
        setStats(res.stats);
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
  }, [debouncedSearch, typeFilter, subscriberFilter, page, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle VIP Subscriber 1-Click Toggle
  const handleToggleSubscriber = async (user: MenuSnapUser, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSubscriber: nextStatus } : u));
    setStats(prev => ({
      ...prev,
      totalSubscribers: nextStatus ? prev.totalSubscribers + 1 : prev.totalSubscribers - 1,
      totalFreeLeads: nextStatus ? prev.totalFreeLeads - 1 : prev.totalFreeLeads + 1,
    }));

    try {
      const res = await toggleSubscriberStatusAction(user.id, nextStatus);
      if (res.success) {
        toast({
          title: nextStatus ? "VIP Access Granted" : "Revoked VIP Access",
          description: `${user.businessName} is now ${nextStatus ? "a VIP Subscriber" : "a Free Lead"}.`,
        });
      } else {
        // Rollback
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSubscriber: currentStatus } : u));
        toast({
          title: "Update Failed",
          description: res.error || "Failed to update subscriber status.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isSubscriber: currentStatus } : u));
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
      const res = await adminCreateMenuSnapUserAction({
        businessName: formData.businessName,
        businessType: formData.businessType,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        division: formData.division,
        district: formData.district,
        password: formData.password,
        isSubscriber: formData.isSubscriber,
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
      const res = await adminUpdateMenuSnapUserAction(selectedUser.id, {
        businessName: formData.businessName,
        businessType: formData.businessType,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        division: formData.division,
        district: formData.district,
        password: formData.password || undefined,
        isSubscriber: formData.isSubscriber,
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

  // Format WhatsApp Click link
  const getWhatsAppLink = (phone: string, businessName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = encodeURIComponent(`Hello ${businessName}, this is MenuSnap Support. How can we help you today?`);
    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                MenuSnap Users
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  Clients & Subscribers
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage registered client restaurants, beauty parlours, subscriber statuses, and authentication.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers(true)}
            disabled={loading || refreshing}
            className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
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
              });
              setIsAddModalOpen(true);
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium shadow-md shadow-orange-500/20"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Users */}
        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {loading ? <span className="animate-pulse">--</span> : stats.totalUsers}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">All registered accounts</p>
          </CardContent>
        </Card>

        {/* Subscribers */}
        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">VIP Subscribers</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
              {loading ? <span className="animate-pulse">--</span> : stats.totalSubscribers}
            </div>
            <p className="text-[11px] text-amber-300/80 mt-1">Full MagicTab & Pro access</p>
          </CardContent>
        </Card>

        {/* Free Leads */}
        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Free Leads</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {loading ? <span className="animate-pulse">--</span> : stats.totalFreeLeads}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Unpaid / Trial users</p>
          </CardContent>
        </Card>

        {/* Restaurants */}
        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Restaurants</span>
              <Utensils className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {loading ? <span className="animate-pulse">--</span> : stats.totalRestaurants}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Food & Dine clients</p>
          </CardContent>
        </Card>

        {/* Parlours */}
        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Beauty Parlours</span>
              <Scissors className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {loading ? <span className="animate-pulse">--</span> : stats.totalParlours}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Salon & Beauty clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card & Controls */}
      <Card className="bg-slate-900/70 border-slate-800/90 shadow-xl backdrop-blur-md">
        {/* Filters Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search by name, phone, email, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950/60 border-slate-800 text-slate-200 placeholder:text-slate-500 rounded-xl focus-visible:ring-amber-500/30"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Business Type */}
            <Select
              value={typeFilter}
              onValueChange={(val: 'all' | 'restaurant' | 'parlour') => {
                setTypeFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[145px] bg-slate-950/60 border-slate-800 text-slate-200 rounded-xl">
                <SelectValue placeholder="Business Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
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
              <SelectTrigger className="w-[155px] bg-slate-950/60 border-slate-800 text-slate-200 rounded-xl">
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="subscribers">VIP Subscribers</SelectItem>
                <SelectItem value="free">Free Leads</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950/40 border-b border-slate-800">
              <TableRow className="hover:bg-transparent border-slate-800">
                <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5 pl-6">Business / Client</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">Contact Details</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">Location</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">VIP Subscriber</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5">Auth / Password</TableHead>
                <TableHead className="text-slate-400 font-semibold text-xs uppercase tracking-wider py-3.5 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-800/50">
                    <TableCell className="pl-6 py-4"><div className="h-5 w-40 bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-32 bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-24 bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-24 bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 w-20 bg-slate-800/60 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right pr-6"><div className="h-8 w-8 bg-slate-800/60 rounded ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-10 h-10 text-slate-600" />
                      <p className="text-base font-medium text-slate-400">No MenuSnap users found</p>
                      <p className="text-xs text-slate-500">Try adjusting your search terms or filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Business Info */}
                    <TableCell className="pl-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          user.businessType === 'parlour'
                            ? 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                            : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                        }`}>
                          {user.businessType === 'parlour' ? <Scissors className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                              {user.businessName}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 rounded ${
                                user.businessType === 'parlour'
                                  ? 'border-pink-500/30 text-pink-400 bg-pink-500/5'
                                  : 'border-orange-500/30 text-orange-400 bg-orange-500/5'
                              }`}
                            >
                              {user.businessType}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>ID: #{user.id}</span>
                            <span>•</span>
                            <span title={`Joined: ${user.createdAt}`}>Joined {user.createdAt.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact details & WhatsApp link */}
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={getWhatsAppLink(user.whatsappNumber, user.businessName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono hover:underline group/wa"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover/wa:scale-110 transition-transform" />
                            <span>{user.whatsappNumber}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </div>
                        {user.email ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate max-w-[200px]" title={user.email}>
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-600 italic">No email provided</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="py-4">
                      {user.district || user.division ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {[user.district, user.division].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Location unassigned</span>
                      )}
                    </TableCell>

                    {/* Subscriber VIP Status */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2.5">
                        <Switch
                          checked={user.isSubscriber}
                          onCheckedChange={() => handleToggleSubscriber(user, user.isSubscriber)}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-orange-500"
                        />
                        {user.isSubscriber ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3" />
                            VIP Access
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-slate-800 text-slate-400 text-[11px]">
                            Free Lead
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Password / Auth Status */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {user.hasPassword ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            Password Set
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-800/40 border border-slate-700/40 px-2 py-0.5 rounded-full">
                            <Unlock className="w-3 h-3 text-slate-500" />
                            No Password
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
                            className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-slate-200">
                          <DropdownMenuLabel className="text-xs text-slate-400">User Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => openEditModal(user)}
                            className="text-xs cursor-pointer hover:bg-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-2 text-blue-400" />
                            Edit Profile
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setNewPassword('');
                              setIsPasswordModalOpen(true);
                            }}
                            className="text-xs cursor-pointer hover:bg-slate-800"
                          >
                            <KeyRound className="w-3.5 h-3.5 mr-2 text-amber-400" />
                            {user.hasPassword ? "Reset Password" : "Set Password"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleToggleSubscriber(user, user.isSubscriber)}
                            className="text-xs cursor-pointer hover:bg-slate-800"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-2 text-orange-400" />
                            {user.isSubscriber ? "Revoke VIP Access" : "Grant VIP Access"}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            asChild
                            className="text-xs cursor-pointer hover:bg-slate-800"
                          >
                            <a
                              href={getWhatsAppLink(user.whatsappNumber, user.businessName)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                              WhatsApp Chat
                            </a>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-slate-800" />

                          <DropdownMenuItem
                            onClick={() => setUserToDelete(user)}
                            className="text-xs text-red-400 cursor-pointer hover:bg-red-500/10 focus:text-red-400"
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
        <div className="p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-medium">{users.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
            <span className="text-white font-medium">{Math.min(page * limit, totalCount)}</span> of{' '}
            <span className="text-white font-medium">{totalCount}</span> users
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="h-8 border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white"
            >
              Previous
            </Button>
            <span className="px-2 text-slate-400">
              Page <span className="text-white font-semibold">{page}</span> of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="h-8 border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#0c0e14] border-slate-800 text-slate-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              Add MenuSnap Client User
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Register a new restaurant or beauty parlour account to the platform.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Business Name *</label>
                <Input
                  required
                  placeholder="e.g. Sultan's Dine or Glamour Beauty Lounge"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Business Type *</label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val: 'restaurant' | 'parlour') => setFormData(prev => ({ ...prev, businessType: val }))}
                >
                  <SelectTrigger className="bg-slate-950/80 border-slate-800 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="restaurant">Restaurant / Food</SelectItem>
                    <SelectItem value="parlour">Beauty Parlour / Salon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">WhatsApp Phone *</label>
                <Input
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Email Address (Optional)</label>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Division</label>
                <Input
                  placeholder="e.g. Dhaka"
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">District</label>
                <Input
                  placeholder="e.g. Gulshan, Dhaka"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Initial Password (Optional)</label>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters (or leave empty)"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div>
                  <p className="text-xs font-semibold text-white">Grant VIP Subscriber Access</p>
                  <p className="text-[11px] text-slate-400">Unlock full MagicTab builder & VIP perks immediately.</p>
                </div>
                <Switch
                  checked={formData.isSubscriber}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSubscriber: checked }))}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-slate-800 bg-slate-900 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#0c0e14] border-slate-800 text-slate-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-400" />
              Edit Client Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update information and subscription settings for {selectedUser?.businessName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Business Name *</label>
                <Input
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Business Type *</label>
                <Select
                  value={formData.businessType}
                  onValueChange={(val: 'restaurant' | 'parlour') => setFormData(prev => ({ ...prev, businessType: val }))}
                >
                  <SelectTrigger className="bg-slate-950/80 border-slate-800 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="restaurant">Restaurant / Food</SelectItem>
                    <SelectItem value="parlour">Beauty Parlour / Salon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">WhatsApp Phone *</label>
                <Input
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Division</label>
                <Input
                  value={formData.division}
                  onChange={(e) => setFormData(prev => ({ ...prev, division: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">District</label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  className="bg-slate-950/80 border-slate-800 text-slate-200"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div>
                  <p className="text-xs font-semibold text-white">VIP Subscriber Access</p>
                  <p className="text-[11px] text-slate-400">Toggle active VIP access status.</p>
                </div>
                <Switch
                  checked={formData.isSubscriber}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSubscriber: checked }))}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="border-slate-800 bg-slate-900 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-[#0c0e14] border-slate-800 text-slate-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Set a new login password for <span className="text-white font-semibold">{selectedUser?.businessName}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">New Password *</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-950/80 border-slate-800 text-slate-200 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                className="border-slate-800 bg-slate-900 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="bg-[#0c0e14] border-slate-800 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Client User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-400">
              Are you sure you want to permanently delete <strong className="text-white">{userToDelete?.businessName}</strong> ({userToDelete?.whatsappNumber})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-slate-800 pt-3">
            <AlertDialogCancel className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800">
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
