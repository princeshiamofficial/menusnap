"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  Tag,
  ArrowRight,
  Layers,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  MoveUp,
  MoveDown,
  Coins,
  Star,
  Info,
  Infinity as InfinityIcon,
  MoreHorizontal,
  Copy,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Zap,
  SlidersHorizontal,
  X
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { checkClientPermission } from "@/lib/admin-permissions";
import { PricingPackage } from "@/lib/menusnap-types";
import {
  getPricingPackagesAction,
  createPricingPackageAction,
  updatePricingPackageAction,
  deletePricingPackageAction,
  togglePricingPackageActiveAction,
  reorderPricingPackagesAction
} from "@/app/actions/packages";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface PackageFormData {
  id?: number;
  package_id: string;
  name: string;
  tagline: string;
  badge_text: string;
  price: number;
  original_price: number | "";
  billing_period_text: string;
  discount_tag: string;
  coupon_code: string;
  coupon_discount: number;
  features: string[];
  feature_highlight_title: string;
  button_text: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

const DEFAULT_FORM_DATA: PackageFormData = {
  package_id: "",
  name: "",
  tagline: "",
  badge_text: "Lifetime Access",
  price: 999,
  original_price: 1999,
  billing_period_text: "Lifetime Access • One-time payment",
  discount_tag: "",
  coupon_code: "",
  coupon_discount: 0,
  features: [
    "3,000+ Menu Database Access",
    "Restaurant & Cuisine Browse",
    "Food Item Search",
    "Standard Price Reference",
    "Lifetime Blueprints & Future Updates",
  ],
  feature_highlight_title: "Features Included:",
  button_text: "Get Lifetime Access",
  is_popular: false,
  is_active: true,
  sort_order: 1,
};

const FEATURE_PRESETS = [
  "3,000+ Menu Blueprints Database",
  "Competitor Price Spread Comparison",
  "Unlimited Menu Building Projects",
  "Item Shortlist & Favorites",
  "Custom Category Organization",
  "Custom Portion Weights & Sizing",
  "Print-Ready PDF & Excel Export",
  "Lifetime Priority Updates",
  "Multiple Restaurant Blueprints",
  "Direct WhatsApp Support",
];

function SwirlBrandIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M8.2 3.8C4.8 3.8 2 6.6 2 10C2 14.2 6.2 16.5 10.5 16.5C12.2 16.5 13 15.2 13 13C13 9.8 10.8 3.8 8.2 3.8Z" />
      <path d="M19.8 24.2C23.2 24.2 26 21.4 26 18C26 13.8 21.8 11.5 17.5 11.5C15.8 11.5 15 12.8 15 15C15 18.2 17.2 24.2 19.8 24.2Z" />
    </svg>
  );
}

function CircleCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M4.8 8.2L6.8 10.2L11.2 5.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminPackagesPage() {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();

  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>(DEFAULT_FORM_DATA);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deletePackageId, setDeletePackageId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Permission checks
  const canCreate = checkClientPermission(adminUser, "packages", "create");
  const canEdit = checkClientPermission(adminUser, "packages", "edit");
  const canDelete = checkClientPermission(adminUser, "packages", "delete");

  // Fetch packages from server
  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPricingPackagesAction({ includeInactive: true });
      if (res.success && res.data) {
        setPackages(res.data);
      } else {
        toast({
          title: "Failed to load packages",
          description: res.error || "An error occurred while fetching packages.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load packages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.package_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.features.some((f) => f.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === "active") return pkg.is_active;
      if (statusFilter === "inactive") return !pkg.is_active;
      return true;
    });
  }, [packages, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = packages.length;
    const active = packages.filter((p) => p.is_active).length;
    const popular = packages.find((p) => p.is_popular);
    const minPrice = packages.length > 0 ? Math.min(...packages.map((p) => p.price)) : 0;
    const maxPrice = packages.length > 0 ? Math.max(...packages.map((p) => p.price)) : 0;
    return { total, active, popularName: popular?.name || "None", minPrice, maxPrice };
  }, [packages]);

  // Handle open create modal
  const handleOpenCreate = () => {
    const nextOrder = packages.length > 0 ? Math.max(...packages.map((p) => p.sort_order)) + 1 : 1;
    setFormData({
      ...DEFAULT_FORM_DATA,
      sort_order: nextOrder,
      is_popular: packages.length === 0,
    });
    setNewFeatureInput("");
    setIsEditing(false);
    setIsFormOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (pkg: PricingPackage) => {
    setFormData({
      id: pkg.id,
      package_id: pkg.package_id,
      name: pkg.name,
      tagline: pkg.tagline || "",
      badge_text: pkg.badge_text || "",
      price: pkg.price,
      original_price: pkg.original_price !== null && pkg.original_price !== undefined ? pkg.original_price : "",
      billing_period_text: pkg.billing_period_text || "Lifetime Access • One-time payment",
      discount_tag: pkg.discount_tag || "",
      coupon_code: pkg.coupon_code || "",
      coupon_discount: pkg.coupon_discount || 0,
      features: [...pkg.features],
      feature_highlight_title: pkg.feature_highlight_title || "",
      button_text: pkg.button_text || "Choose Plan",
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      sort_order: pkg.sort_order,
    });
    setNewFeatureInput("");
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Feature list manipulation
  const handleAddFeature = (text?: string) => {
    const target = (text || newFeatureInput).trim();
    if (!target) return;
    if (formData.features.includes(target)) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, target],
    }));
    if (!text) setNewFeatureInput("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index: number, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.features];
      updated[index] = val;
      return { ...prev, features: updated };
    });
  };

  // Save (Create or Update)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.package_id.trim()) {
      toast({
        title: "Validation Error",
        description: "Package name and slug are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        package_id: formData.package_id,
        name: formData.name,
        tagline: formData.tagline,
        badge_text: formData.badge_text || undefined,
        price: Number(formData.price) || 0,
        original_price: formData.original_price !== "" ? Number(formData.original_price) : null,
        billing_period_text: formData.billing_period_text,
        discount_tag: formData.discount_tag || undefined,
        coupon_code: formData.coupon_code || undefined,
        coupon_discount: Number(formData.coupon_discount) || 0,
        features: formData.features,
        feature_highlight_title: formData.feature_highlight_title,
        button_text: formData.button_text,
        is_popular: formData.is_popular,
        is_active: formData.is_active,
        sort_order: Number(formData.sort_order) || 0,
      };

      if (isEditing && formData.id) {
        const res = await updatePricingPackageAction(formData.id, payload);
        if (res.success) {
          toast({
            title: "Package Updated",
            description: `Lifetime package "${formData.name}" has been updated.`,
          });
          setIsFormOpen(false);
          loadPackages();
        } else {
          toast({
            title: "Update Failed",
            description: res.error || "Failed to update package.",
            variant: "destructive",
          });
        }
      } else {
        const res = await createPricingPackageAction(payload);
        if (res.success) {
          toast({
            title: "Package Created",
            description: `Lifetime package "${formData.name}" has been created.`,
          });
          setIsFormOpen(false);
          loadPackages();
        } else {
          toast({
            title: "Creation Failed",
            description: res.error || "Failed to create package.",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Active
  const handleToggleActive = async (pkg: PricingPackage) => {
    if (!canEdit) return;
    try {
      const newStatus = !pkg.is_active;
      const res = await togglePricingPackageActiveAction(pkg.id, newStatus);
      if (res.success) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, is_active: newStatus } : p))
        );
        toast({
          title: newStatus ? "Package Live" : "Package Hidden",
          description: `"${pkg.name}" is now ${newStatus ? "visible on the storefront" : "hidden from storefront"}.`,
        });
      } else {
        toast({
          title: "Status change failed",
          description: res.error || "Could not update status.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update package status.",
        variant: "destructive",
      });
    }
  };

  // Reorder Handler
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    if (!canEdit) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= packages.length) return;

    const newPackages = [...packages];
    const temp = newPackages[index];
    newPackages[index] = newPackages[targetIndex];
    newPackages[targetIndex] = temp;

    setPackages(newPackages);

    try {
      const orderedIds = newPackages.map((p) => p.id);
      await reorderPricingPackagesAction(orderedIds);
      toast({
        title: "Order Saved",
        description: "Display hierarchy updated.",
      });
    } catch (err) {
      loadPackages();
    }
  };

  // Delete Handler
  const handleDeletePackage = async () => {
    if (!deletePackageId || !canDelete) return;
    setIsDeleting(true);
    try {
      const res = await deletePricingPackageAction(deletePackageId);
      if (res.success) {
        toast({
          title: "Package Deleted",
          description: "Package removed permanently.",
        });
        setDeletePackageId(null);
        loadPackages();
      } else {
        toast({
          title: "Delete Failed",
          description: res.error || "Failed to delete package.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not delete package.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      {/* 1. Ultra-Clean Minimalist Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#FF5A36]">Pricing Packages</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Packages
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#FF5A36] border border-orange-200/60 dark:bg-orange-950/40 dark:border-orange-900/40">
              <InfinityIcon className="w-3 h-3" /> Lifetime Model
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPackages}
            disabled={loading}
            className="rounded-xl h-9 px-3 text-slate-500 hover:text-slate-900 dark:hover:text-white gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="text-xs">Refresh</span>
          </Button>

          {canCreate && (
            <Button
              onClick={handleOpenCreate}
              className="bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold rounded-xl gap-2 h-9 px-4 text-xs shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Package</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Sleek KPI Metrics Pill Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Plans</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Live on Store</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.active}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Featured Tier</p>
            <p className="text-sm font-black text-amber-500 truncate max-w-[110px] mt-1">{stats.popularName}</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Price Spread</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
              ৳{stats.minPrice.toLocaleString()} - ৳{stats.maxPrice.toLocaleString()}
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Search, Filter Pills & View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search plans or features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 rounded-xl border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Segmented status filter */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/50 dark:border-slate-800">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "active"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "inactive"
                  ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Hidden
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-400 hover:text-slate-800"
              }`}
              title="Card Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-400 hover:text-slate-800"
              }`}
              title="Data Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Packages Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 text-[#FF5A36] animate-spin mb-2" />
          <p className="text-xs font-medium text-slate-400">Loading packages...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center p-6">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No packages match</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-0.5 mb-5">
            {searchTerm ? "Try searching for a different keyword." : "Get started by adding your first lifetime package."}
          </p>
          {canCreate && (
            <Button
              onClick={handleOpenCreate}
              className="bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold rounded-xl text-xs h-9 px-4"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Lifetime Package
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Pixel-Perfect Reference Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
          {filteredPackages.map((pkg, idx) => {
            const isPop = pkg.is_popular;
            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-[36px] p-7 sm:p-8 transition-all duration-200 ${
                  isPop
                    ? "bg-[#141414] text-white shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
                    : "bg-white text-neutral-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-200/40"
                } ${!pkg.is_active ? "opacity-60" : ""}`}
              >
                <div>
                  {/* Top Bar: Admin ID/Order + Live Status */}
                  <div className={`flex items-center justify-between pb-3 mb-5 border-b ${isPop ? "border-neutral-800/80" : "border-neutral-100"}`}>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-[11px] font-bold ${isPop ? "text-neutral-400" : "text-neutral-400"}`}>
                        #{pkg.sort_order} · {pkg.package_id}
                      </span>
                      {canEdit && (
                        <div className="flex items-center">
                          <button
                            onClick={() => handleMoveOrder(idx, "up")}
                            disabled={idx === 0}
                            className={`p-1 disabled:opacity-20 rounded ${isPop ? "text-neutral-400 hover:text-white" : "text-neutral-400 hover:text-black"}`}
                            title="Move Up"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(idx, "down")}
                            disabled={idx === filteredPackages.length - 1}
                            className={`p-1 disabled:opacity-20 rounded ${isPop ? "text-neutral-400 hover:text-white" : "text-neutral-400 hover:text-black"}`}
                            title="Move Down"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold ${pkg.is_active ? "text-emerald-500" : "text-neutral-400"}`}>
                        {pkg.is_active ? "Live" : "Draft"}
                      </span>
                      <Switch
                        checked={pkg.is_active}
                        onCheckedChange={() => handleToggleActive(pkg)}
                        disabled={!canEdit}
                        className="data-[state=checked]:bg-emerald-600 scale-75"
                      />
                    </div>
                  </div>

                  {/* Brand Swirl Logo + Popular Pill */}
                  <div className="flex items-center justify-between mb-6">
                    <SwirlBrandIcon className={`w-7 h-7 ${isPop ? "text-white" : "text-black"}`} />
                    {isPop && (
                      <span className="px-3.5 py-1 rounded-full bg-[#272727] text-neutral-300 text-xs font-medium tracking-tight">
                        {pkg.badge_text || "Popular"}
                      </span>
                    )}
                  </div>

                  {/* Plan Name & Tagline */}
                  <div className="mb-6">
                    <h3 className={`text-xl font-bold tracking-tight ${isPop ? "text-white" : "text-black"}`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-xs mt-1 font-normal tracking-tight line-clamp-2 leading-relaxed ${isPop ? "text-neutral-400" : "text-neutral-500"}`}>
                      {pkg.tagline || `For ${pkg.name} most advance reliability.`}
                    </p>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline mb-7">
                    <span className={`text-4xl font-extrabold tracking-tight ${isPop ? "text-white" : "text-black"}`}>
                      ৳{pkg.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-400 font-normal ml-1">
                      /lifetime
                    </span>
                  </div>

                  {/* Pill Button Preview */}
                  <div
                    className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm transition-all text-center select-none ${
                      isPop
                        ? "bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.12)]"
                        : "bg-white text-black border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                    }`}
                  >
                    {pkg.button_text || (isPop ? "Subscribe Now" : "Started Now")}
                  </div>

                  {/* Divider Line */}
                  <div className={`h-px w-full my-7 ${isPop ? "bg-neutral-800/80" : "bg-neutral-100"}`} />

                  {/* Features Header */}
                  <p className={`text-xs font-semibold mb-4 tracking-tight ${isPop ? "text-white" : "text-black"}`}>
                    Features
                  </p>

                  {/* Features List with exact circular check SVG */}
                  <div className="space-y-3.5 mb-6">
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                        <CircleCheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-400" />
                        <span className={`font-normal leading-relaxed ${isPop ? "text-neutral-300" : "text-neutral-600"}`}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls: Edit & Delete */}
                <div className={`pt-4 border-t ${isPop ? "border-neutral-800/80" : "border-neutral-100"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(pkg)}
                      disabled={!canEdit}
                      className={`flex-1 rounded-full text-xs font-bold gap-1.5 h-9 ${
                        isPop
                          ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                          : "border-neutral-200 text-neutral-800 hover:bg-neutral-50"
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Package</span>
                    </Button>

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletePackageId(pkg.id)}
                        className="h-9 px-3 rounded-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Minimal Clean Table */
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Lifetime Fee</TableHead>
                <TableHead>Original</TableHead>
                <TableHead>Promo Tag / Coupon</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Live</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.map((pkg) => (
                <TableRow key={pkg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <TableCell className="font-mono font-bold text-xs text-slate-400">
                    {pkg.sort_order}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                        {pkg.name}
                        {pkg.badge_text && (
                          <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4">
                            {pkg.badge_text}
                          </Badge>
                        )}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{pkg.package_id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 dark:text-white text-xs">
                    ৳{pkg.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {pkg.original_price ? (
                      <span className="text-xs text-slate-400 line-through">
                        ৳{pkg.original_price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pkg.coupon_code ? (
                      <Badge className="bg-orange-500/10 text-[#FF5A36] border-orange-500/20 font-mono text-[10px]">
                        {pkg.coupon_code} (-৳{pkg.coupon_discount})
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {pkg.features.length} items
                    </span>
                  </TableCell>
                  <TableCell>
                    {pkg.is_popular ? (
                      <Badge className="bg-amber-500 text-white text-[10px] gap-1 font-bold h-5">
                        <Star className="w-2.5 h-2.5 fill-white" /> Popular
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">Regular</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={pkg.is_active}
                      onCheckedChange={() => handleToggleActive(pkg)}
                      disabled={!canEdit}
                      className="data-[state=checked]:bg-emerald-600 scale-75"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(pkg)}
                        disabled={!canEdit}
                        className="h-7 w-7 p-0 rounded-lg text-slate-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletePackageId(pkg.id)}
                          className="h-7 w-7 p-0 rounded-lg text-rose-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* 5. Minimalist Dialog Modal with Quick Feature Presets */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-[#FF5A36]" />
              <span>{isEditing ? "Edit Lifetime Package" : "New Lifetime Package"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Configure package identifiers, lifetime pricing, promotional deals, and features.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePackage} className="space-y-6 mt-3">
            {/* Section 1: Basic Info */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3 h-3" /> Package Overview
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Package Name *</Label>
                  <Input
                    required
                    placeholder="e.g. Starter, Pro, Agency"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name,
                        package_id: !isEditing && !prev.package_id
                          ? name.toLowerCase().replace(/[^a-z0-9]/g, "-")
                          : prev.package_id,
                      }));
                    }}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Package Slug (Unique ID) *</Label>
                  <Input
                    required
                    placeholder="e.g. starter, pro, agency"
                    value={formData.package_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        package_id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
                      }))
                    }
                    className="rounded-xl h-9 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Tagline</Label>
                <Input
                  placeholder="e.g. Complete menu research, market pricing & unlimited exports."
                  value={formData.tagline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="rounded-xl h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Badge Text (Optional)</Label>
                  <Input
                    placeholder="e.g. Most Popular • Lifetime Deal"
                    value={formData.badge_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge_text: e.target.value }))}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Button CTA Label</Label>
                  <Input
                    placeholder="e.g. Get Lifetime Pro"
                    value={formData.button_text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, button_text: e.target.value }))}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pricing */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3 h-3" /> Lifetime Pricing & Discounts (BDT)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Lifetime Price (৳) *</Label>
                  <Input
                    type="number"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                    }
                    className="rounded-xl h-9 font-bold text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Regular Price (Strike-through)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 2999"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        original_price: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className="rounded-xl h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Period Label</Label>
                  <Input
                    placeholder="Lifetime Access • One-time payment"
                    value={formData.billing_period_text}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, billing_period_text: e.target.value }))
                    }
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Discount Tag</Label>
                  <Input
                    placeholder="e.g. LIFETIME DEAL: MENUSNAP500"
                    value={formData.discount_tag}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount_tag: e.target.value }))}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Promo Coupon Code</Label>
                  <Input
                    placeholder="e.g. MENUSNAP500"
                    value={formData.coupon_code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, coupon_code: e.target.value.toUpperCase() }))
                    }
                    className="rounded-xl h-9 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Coupon Discount Amount (৳)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 500"
                    value={formData.coupon_discount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, coupon_discount: Number(e.target.value) }))
                    }
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Features Builder */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Check className="w-3 h-3" /> Included Features ({formData.features.length})
                </h4>
              </div>

              {/* Add Custom Feature */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a feature and press Enter..."
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="rounded-xl h-9 text-xs"
                />
                <Button
                  type="button"
                  onClick={() => handleAddFeature()}
                  className="bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-xl h-9 px-3 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Quick Feature Presets */}
              <div className="flex flex-wrap gap-1.5 py-1">
                {FEATURE_PRESETS.filter((p) => !formData.features.includes(p)).slice(0, 4).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddFeature(preset)}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Feature Chips */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                {formData.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      className="border-none shadow-none focus-visible:ring-0 text-xs h-6 px-1 font-medium bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Featured / Popular</Label>
                  <p className="text-[10px] text-slate-400">Highlighted on store</p>
                </div>
                <Switch
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_popular: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold">Live Status</Label>
                  <p className="text-[10px] text-slate-400">Show on public page</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>

              <div className="space-y-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <Label className="text-xs font-bold">Sort Order</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.sort_order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                  className="rounded-xl h-7 font-bold text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl h-10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#FF5A36] hover:bg-[#e64c29] text-white font-bold rounded-xl h-10 px-5 text-xs shadow-xs"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                )}
                {isEditing ? "Save Changes" : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deletePackageId !== null} onOpenChange={(open) => !open && setDeletePackageId(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black text-rose-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Confirm Delete</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              Are you sure you want to delete this package? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl text-xs h-9">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePackage}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs h-9"
            >
              {isDeleting ? "Deleting..." : "Delete Package"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
