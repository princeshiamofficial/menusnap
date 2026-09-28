"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TicketPercent,
  Plus,
  Edit2,
  Trash2,
  Check,
  Tag,
  Search,
  RefreshCw,
  Copy,
  Users,
  CheckCircle2,
  Dices,
  Layers,
  ChevronRight,
  CheckCheck,
  AlertCircle
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { checkClientPermission } from "@/lib/admin-permissions";
import { Coupon, PricingPackage } from "@/lib/menusnap-types";
import {
  getCouponsAction,
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  toggleCouponStatusAction,
  CreateCouponPayload,
} from "@/app/actions/coupons";
import { getPricingPackagesAction } from "@/app/actions/packages";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminCouponsPage() {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "fixed" | "percentage">("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateCouponPayload>({
    code: "",
    discount_type: "fixed",
    discount_value: 500,
    applicable_package: "all",
    min_amount: 0,
    max_discount: null,
    usage_limit: null,
    expires_at: null,
    is_active: true,
    description: "",
  });

  const canCreate = checkClientPermission(adminUser, "coupons", "create");
  const canEdit = checkClientPermission(adminUser, "coupons", "edit");
  const canDelete = checkClientPermission(adminUser, "coupons", "delete");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [couponsRes, pkgsRes] = await Promise.all([
        getCouponsAction(),
        getPricingPackagesAction({ includeInactive: true })
      ]);

      if (couponsRes.success && couponsRes.data) {
        setCoupons(couponsRes.data);
      } else {
        toast({
          title: "Error",
          description: couponsRes.error || "Failed to load coupons",
          variant: "destructive"
        });
      }

      if (pkgsRes.success && pkgsRes.data) {
        setPackages(pkgsRes.data);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discount_type: "fixed",
      discount_value: 500,
      applicable_package: "all",
      min_amount: 0,
      max_discount: null,
      usage_limit: null,
      expires_at: null,
      is_active: true,
      description: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      applicable_package: coupon.applicable_package || "all",
      min_amount: coupon.min_amount || 0,
      max_discount: coupon.max_discount || null,
      usage_limit: coupon.usage_limit || null,
      expires_at: coupon.expires_at ? coupon.expires_at.split("T")[0] : null,
      is_active: coupon.is_active,
      description: coupon.description || "",
    });
    setIsFormOpen(true);
  };

  const handleGenerateCode = () => {
    const prefixes = ["SNAP", "PROMO", "SAVE", "OFFER", "VIP", "DEAL"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      code: `${prefix}${randomNum}`
    }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Copied!",
      description: `Coupon code '${code}' copied to clipboard.`
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!canEdit) return;
    const newStatus = !currentStatus;
    // Optimistic UI update
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: newStatus } : c));

    const res = await toggleCouponStatusAction(id, newStatus);
    if (!res.success) {
      // Revert on failure
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: currentStatus } : c));
      toast({
        title: "Error",
        description: res.error || "Failed to update coupon status",
        variant: "destructive"
      });
    } else {
      toast({
        title: newStatus ? "Coupon Activated" : "Coupon Deactivated",
        description: `Coupon is now ${newStatus ? "active and usable at checkout" : "inactive"}.`
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) return;
    setIsSubmitting(true);
    try {
      const res = await deleteCouponAction(id);
      if (res.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        toast({
          title: "Deleted",
          description: "Coupon has been deleted successfully."
        });
        setIsDeletingId(null);
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to delete coupon",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Coupon code is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.discount_value <= 0) {
      toast({
        title: "Validation Error",
        description: "Discount value must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCoupon) {
        const res = await updateCouponAction(editingCoupon.id, formData);
        if (res.success && res.data) {
          setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? res.data! : c));
          toast({
            title: "Updated",
            description: `Coupon '${res.data.code}' updated successfully.`
          });
          setIsFormOpen(false);
        } else {
          toast({
            title: "Error",
            description: res.error || "Failed to update coupon",
            variant: "destructive"
          });
        }
      } else {
        const res = await createCouponAction(formData);
        if (res.success && res.data) {
          setCoupons(prev => [res.data!, ...prev]);
          toast({
            title: "Coupon Created",
            description: `Coupon '${res.data.code}' created successfully.`
          });
          setIsFormOpen(false);
        } else {
          toast({
            title: "Error",
            description: res.error || "Failed to create coupon",
            variant: "destructive"
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered List
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && c.is_active) ||
        (statusFilter === "inactive" && !c.is_active);

      const matchesType =
        typeFilter === "all" ||
        c.discount_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coupons, searchQuery, statusFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.is_active).length;
    const totalUses = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
    return { total, active, totalUses };
  }, [coupons]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full text-slate-900 dark:text-slate-100">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#FF5A36]">Coupons</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Coupons
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#FF5A36] border border-orange-200/60 dark:bg-orange-950/40 dark:border-orange-900/40">
              <TicketPercent className="w-3.5 h-3.5" /> Promo Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="rounded-xl h-9 px-3 text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {canCreate && (
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="rounded-xl h-9 px-4 bg-[#FF5A36] hover:bg-[#e64c29] text-white font-bold text-xs shadow-sm shadow-orange-500/20 gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Create Coupon
            </Button>
          )}
        </div>
      </div>

      {/* 2. Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-500">Total Coupons</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-500">Active Coupons</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-500">Total Redemptions</p>
              <p className="text-2xl font-black text-[#FF5A36]">{stats.totalUses}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-[#FF5A36]">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl focus-visible:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="fixed">Fixed (৳)</SelectItem>
              <SelectItem value="percentage">Percent (%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 4. Coupons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <TicketPercent className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No coupons found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? "Try adjusting your search terms or filters" : "Create your first discount coupon to get started"}
          </p>
          {canCreate && !searchQuery && (
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="mt-4 h-9 bg-[#FF5A36] hover:bg-[#e64c29] text-white text-xs font-bold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create Coupon
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredCoupons.map((coupon) => {
              const isExpired = coupon.expires_at && new Date() > new Date(coupon.expires_at);
              const isLimitReached = coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit;
              const isEffectiveActive = coupon.is_active && !isExpired && !isLimitReached;

              return (
                <motion.div
                  key={coupon.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`group relative rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    coupon.is_active
                      ? "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md"
                      : "bg-slate-50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-900 opacity-75"
                  }`}
                >
                  <div>
                    {/* Top Row: Code Badge + Active Toggle */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-wider bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#FF5A36]" />
                          {coupon.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(coupon.code)}
                          title="Copy Code"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          {copiedCode === coupon.code ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {canEdit && (
                          <Switch
                            checked={coupon.is_active}
                            onCheckedChange={() => handleToggleActive(coupon.id, coupon.is_active)}
                            className="data-[state=checked]:bg-emerald-600 scale-90"
                          />
                        )}
                      </div>
                    </div>

                    {/* Discount Value */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}%`
                            : `৳${coupon.discount_value.toLocaleString()}`}
                        </span>
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          {coupon.discount_type === "percentage" ? "Off Plan Price" : "Flat Discount"}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {coupon.description}
                        </p>
                      )}
                    </div>

                    {/* Meta details */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>Applicable Plan:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium capitalize">
                          {coupon.applicable_package === "all" ? "All Packages" : coupon.applicable_package}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Used Count:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {coupon.used_count} {coupon.usage_limit ? `/ ${coupon.usage_limit} limit` : "uses"}
                        </span>
                      </div>

                      {coupon.min_amount ? (
                        <div className="flex items-center justify-between">
                          <span>Min Spend:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">৳{coupon.min_amount.toLocaleString()}</span>
                        </div>
                      ) : null}

                      {coupon.expires_at ? (
                        <div className="flex items-center justify-between">
                          <span>Expires:</span>
                          <span className={isExpired ? "text-red-500 font-medium" : "text-slate-800 dark:text-slate-200 font-medium"}>
                            {new Date(coupon.expires_at).toLocaleDateString()} {isExpired ? "(Expired)" : ""}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      {isEffectiveActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700/50">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(coupon)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setIsDeletingId(coupon.id)}
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-500/20 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 5. Create / Edit Coupon Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-lg rounded-3xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <TicketPercent className="w-5 h-5 text-[#FF5A36]" />
              {editingCoupon ? "Edit Discount Coupon" : "Create New Coupon"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure promo code, discount amounts, plan applicability, and redemption rules.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
            {/* Coupon Code Input + Generator */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Coupon Code</Label>
              <div className="flex items-center gap-2">
                <Input
                  required
                  placeholder="e.g. MENUSNAP500"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="h-10 font-mono font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus-visible:ring-orange-500 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCode}
                  className="h-10 px-3 border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs shrink-0 cursor-pointer"
                  title="Generate Random Code"
                >
                  <Dices className="w-4 h-4 mr-1.5" />
                  Generate
                </Button>
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Discount Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v: "fixed" | "percentage") => setFormData({ ...formData, discount_type: v })}
                >
                  <SelectTrigger className="h-10 text-xs bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                    <SelectItem value="fixed">Fixed Amount (৳ BDT)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {formData.discount_type === "percentage" ? "Discount Percentage (%)" : "Discount Amount (৳ BDT)"}
                </Label>
                <Input
                  type="number"
                  required
                  min={1}
                  max={formData.discount_type === "percentage" ? 100 : undefined}
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  className="h-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus-visible:ring-orange-500"
                />
              </div>
            </div>

            {/* Applicable Package */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Applicable Plan</Label>
              <Select
                value={formData.applicable_package}
                onValueChange={(v) => setFormData({ ...formData, applicable_package: v })}
              >
                <SelectTrigger className="h-10 text-xs bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                  <SelectItem value="all">All Plans / Packages</SelectItem>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.package_id}>
                      {pkg.name} ({pkg.package_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Usage Limit & Expiry Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Usage Limit (Optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 100 (Leave blank for unlimited)"
                  value={formData.usage_limit ?? ""}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                  className="h-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expiration Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.expires_at ?? ""}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value || null })}
                  className="h-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Minimum Amount & Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description / Notes</Label>
              <Input
                placeholder="e.g. 500 TK off for new customer onboarding"
                value={formData.description ?? ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-10 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-xs"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-slate-900 dark:text-white">Enable Coupon</Label>
                <p className="text-[11px] text-slate-500">Make this coupon available for checkout redemption</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFormOpen(false)}
                className="h-10 text-xs text-slate-500 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 bg-[#FF5A36] hover:bg-[#e64c29] text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : editingCoupon ? "Save Changes" : "Create Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Confirmation Dialog */}
      <Dialog open={isDeletingId !== null} onOpenChange={(open) => !open && setIsDeletingId(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-sm rounded-3xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Delete Coupon
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you want to permanently delete this coupon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeletingId(null)}
              className="h-9 text-xs text-slate-500 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={() => isDeletingId && handleDelete(isDeletingId)}
              className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              {isSubmitting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
