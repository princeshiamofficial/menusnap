"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  ExternalLink,
  Download,
  Users,
  FileText,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { checkClientPermission } from "@/lib/admin-permissions";
import { FreeGuide, GuideLead, GuideChapter } from "@/lib/menusnap-types";
import {
  getAdminFreeGuidesAction,
  createFreeGuideAction,
  updateFreeGuideAction,
  deleteFreeGuideAction,
  getAdminGuideLeadsAction,
  deleteGuideLeadAction,
} from "@/app/actions/free-guides";
import { useToast } from "@/hooks/use-toast";

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
  DialogFooter,
} from "@/components/ui/dialog";

const DEFAULT_CHAPTERS: GuideChapter[] = [
  {
    title: "ফুড ফটোগ্রাফি",
    description: "প্রাকৃতিক আলো, সঠিক অ্যাঙ্গেল এবং প্রপস ব্যবহার করে কাস্টমারের ক্ষুধা জাগিয়ে তোলার কৌশল।",
  },
  {
    title: "সোশ্যাল মিডিয়া মার্কেটিং",
    description: "ফেসবুক ও ইনস্টাগ্রামে নিয়মিত পোস্ট, টার্গেটেড অ্যাড এবং ইউজার জেনারেটেড কন্টেন্টের সঠিক ব্যবহার।",
  },
  {
    title: "ভিডিও কন্টেন্ট",
    description: "Behind-the-scene ক্লিপ, ফুড প্রিপারেশন Reels এবং কাস্টমার রিভিউ — যা বিক্রি বাড়ায়।",
  },
  {
    title: "Local SEO ও Google Maps",
    description: "\"Best Restaurant near me\" সার্চে প্রথমে থাকতে Google Business Profile, রিভিউ ও লোকাল কীওয়ার্ড।",
  },
  {
    title: "রেস্টুরেন্ট অটোমেশন",
    description: "Smart POS, অনলাইন অর্ডার সিস্টেম, KDS এবং কাস্টমার ডেটাবেজ দিয়ে কাজের চাপ কমান।",
  },
  {
    title: "৭ সাকসেস ফর্মুলা",
    description: "ওয়েটার ট্রেনিং, আপ-সেলিং, বান্ডেল অফার, স্টুডেন্ট ডিল, কর্পোরেট গেস্ট — সব কৌশল একসাথে।",
  },
  {
    title: "মেনু ইঞ্জিনিয়ারিং",
    description: "BCG Matrix দিয়ে Stars, Plowhorses, Puzzles, Low আইটেম চিহ্নিত করে মুনাফা বাড়ান।",
  },
  {
    title: "কাস্টমার রিটেনশন",
    description: "লয়্যালটি প্রোগ্রাম, SMS মার্কেটিং এবং পার্সোনালাইজেশন দিয়ে পুরোনো কাস্টমার ধরে রাখুন।",
  },
];

interface GuideFormState {
  title: string;
  slug: string;
  description: string;
  category: string;
  badge_text: string;
  cover_image: string;
  file_url: string;
  chapters: GuideChapter[];
  sort_order: number;
  is_active: boolean;
}

const defaultFormState: GuideFormState = {
  title: "রেস্টুরেন্ট ডিজিটাল সাকসেস গাইড",
  slug: "",
  description: "আপনার রেস্টুরেন্টকে ব্র্যান্ডে পরিণত করার সম্পূর্ণ রোডম্যাপ।",
  category: "Business Growth",
  badge_text: "সম্পূর্ণ বিনামূল্যে",
  cover_image: "/Ebook.png",
  file_url: "/Business Growth Guide By Color Hut.pdf",
  chapters: DEFAULT_CHAPTERS,
  sort_order: 1,
  is_active: true,
};

export default function AdminFreeGuidesPage() {
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"guides" | "leads">("guides");
  const [guides, setGuides] = useState<(FreeGuide & { leads_count?: number })[]>([]);
  const [leads, setLeads] = useState<GuideLead[]>([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Filters & Search
  const [guideSearch, setGuideSearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadGuideFilter, setLeadGuideFilter] = useState<string>("all");

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<FreeGuide | null>(null);
  const [formData, setFormData] = useState<GuideFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const canEdit = checkClientPermission(adminUser, "free-guides", "edit");
  const canDelete = checkClientPermission(adminUser, "free-guides", "delete");

  const fetchGuides = useCallback(async () => {
    setIsLoadingGuides(true);
    try {
      const res = await getAdminFreeGuidesAction();
      if (res.success && res.data) {
        setGuides(res.data);
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to load guides",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to load guides",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGuides(false);
    }
  }, [toast]);

  const fetchLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const res = await getAdminGuideLeadsAction();
      if (res.success && res.data) {
        setLeads(res.data);
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to load leads",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to load leads",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLeads(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  useEffect(() => {
    if (activeTab === "leads") {
      fetchLeads();
    }
  }, [activeTab, fetchLeads]);

  // Filtered Guides
  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      const q = guideSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        (g.category && g.category.toLowerCase().includes(q))
      );
    });
  }, [guides, guideSearch]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesGuide =
        leadGuideFilter === "all" ||
        String(lead.guide_id) === leadGuideFilter ||
        lead.guide_name === leadGuideFilter;

      const q = leadSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.full_name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.restaurant_name.toLowerCase().includes(q) ||
        lead.guide_name.toLowerCase().includes(q);

      return matchesGuide && matchesSearch;
    });
  }, [leads, leadGuideFilter, leadSearch]);

  const openCreateDialog = () => {
    setEditingGuide(null);
    setFormData({
      ...defaultFormState,
      chapters: DEFAULT_CHAPTERS,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (guide: FreeGuide) => {
    setEditingGuide(guide);
    const existingChapters =
      guide.chapters && guide.chapters.length >= 8
        ? guide.chapters
        : guide.chapters && guide.chapters.length > 0
        ? [...guide.chapters, ...DEFAULT_CHAPTERS.slice(guide.chapters.length)]
        : DEFAULT_CHAPTERS;

    setFormData({
      title: guide.title,
      slug: guide.slug,
      description: guide.description || "",
      category: guide.category || "Restaurant Growth",
      badge_text: guide.badge_text || "সম্পূর্ণ বিনামূল্যে",
      cover_image: guide.cover_image || "/Ebook.png",
      file_url: guide.file_url || "/Business Growth Guide By Color Hut.pdf",
      chapters: existingChapters,
      sort_order: guide.sort_order || 1,
      is_active: guide.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleChapterChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setFormData((prev) => {
      const nextChapters = [...(prev.chapters || DEFAULT_CHAPTERS)];
      while (nextChapters.length < 8) {
        nextChapters.push({ title: "", description: "" });
      }
      nextChapters[index] = {
        ...nextChapters[index],
        [field]: value,
      };
      return {
        ...prev,
        chapters: nextChapters,
      };
    });
  };

  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingGuide) {
        const res = await updateFreeGuideAction(editingGuide.id, formData);
        if (res.success) {
          toast({ title: "Updated", description: "Guide updated successfully." });
          setIsDialogOpen(false);
          fetchGuides();
        } else {
          toast({ title: "Error", description: res.error || "Update failed", variant: "destructive" });
        }
      } else {
        const res = await createFreeGuideAction(formData);
        if (res.success) {
          toast({ title: "Created", description: "Guide created successfully." });
          setIsDialogOpen(false);
          fetchGuides();
        } else {
          toast({ title: "Error", description: res.error || "Create failed", variant: "destructive" });
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Operation failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGuide = async (id: number) => {
    try {
      const res = await deleteFreeGuideAction(id);
      if (res.success) {
        toast({ title: "Deleted", description: "Guide deleted successfully." });
        setDeleteConfirmId(null);
        fetchGuides();
      } else {
        toast({ title: "Error", description: res.error || "Failed to delete guide", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete guide", variant: "destructive" });
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await deleteGuideLeadAction(id);
      if (res.success) {
        toast({ title: "Lead Deleted", description: "The lead has been removed." });
        fetchLeads();
      } else {
        toast({ title: "Error", description: res.error || "Failed to delete lead", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to delete lead", variant: "destructive" });
    }
  };

  // CSV Export for Leads
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast({ title: "No Data", description: "No leads to export." });
      return;
    }

    const headers = ["ID", "Guide Name", "Full Name", "Email", "Phone", "Restaurant Name", "Event ID", "Date"];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${(l.guide_name || "").replace(/"/g, '""')}"`,
      `"${(l.full_name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.restaurant_name || "").replace(/"/g, '""')}"`,
      `"${(l.event_id || "").replace(/"/g, '""')}"`,
      `"${l.created_at || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `guide_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalDownloads = guides.reduce((acc, g) => acc + (g.download_count || 0), 0);
  const activeGuidesCount = guides.filter((g) => g.is_active).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Free Guides & E-books</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
              Lead Generation
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage downloadable PDF guides, configure download links, and review captured restaurant owner leads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/free-guide"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/80 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span>View Public Page</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {canEdit && (
            <Button
              onClick={openCreateDialog}
              className="bg-[#FF5A36] hover:bg-[#e84d2a] text-white shadow-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add New Guide</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Guides</p>
              <p className="text-2xl font-bold text-foreground mt-1">{guides.length}</p>
              <p className="text-xs text-orange-600 font-medium mt-0.5">{activeGuidesCount} active on website</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Captured Leads</p>
              <p className="text-2xl font-bold text-foreground mt-1">{leads.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Verified restaurant contacts</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Topics</p>
              <p className="text-2xl font-bold text-foreground mt-1">{new Set(guides.map((g) => g.category)).size}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Resource categories</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/60 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("guides")}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === "guides"
              ? "text-[#FF5A36] font-semibold border-b-2 border-[#FF5A36]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Guides ({guides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === "leads"
              ? "text-[#FF5A36] font-semibold border-b-2 border-[#FF5A36]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Downloaded Leads {leads.length > 0 && `(${leads.length})`}</span>
        </button>
      </div>

      {/* Tab 1: Guides List */}
      {activeTab === "guides" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search guides by title, category, or slug..."
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                className="pl-9 h-9 text-xs sm:text-sm bg-background border-border/80"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchGuides}
              disabled={isLoadingGuides}
              className="h-9 px-3"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingGuides ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Guide Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Badge</th>
                    <th className="py-3 px-4 text-center">Downloads</th>
                    <th className="py-3 px-4 text-center">Leads</th>
                    <th className="py-3 px-4">PDF Link</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-normal">
                  {isLoadingGuides ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                        <span>Loading guides...</span>
                      </td>
                    </tr>
                  ) : filteredGuides.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No guides found. Click "Add New Guide" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredGuides.map((guide) => (
                      <tr key={guide.id} className="hover:bg-muted/20 transition-colors">
                        {/* Title & Slug */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground max-w-xs truncate">
                            {guide.title}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate max-w-xs mt-0.5">
                            /free-guide (slug: {guide.slug})
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-foreground">
                            {guide.category}
                          </span>
                        </td>

                        {/* Badge */}
                        <td className="py-3 px-4">
                          {guide.badge_text ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                              {guide.badge_text}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>

                        {/* Downloads */}
                        <td className="py-3 px-4 text-center font-medium">
                          {guide.download_count}
                        </td>

                        {/* Leads */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600">
                            {guide.leads_count ?? 0}
                          </span>
                        </td>

                        {/* File URL */}
                        <td className="py-3 px-4">
                          {guide.file_url ? (
                            <a
                              href={guide.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline max-w-[150px] truncate"
                              title={guide.file_url}
                            >
                              <span>Test Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-amber-600">Default fallback</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          {guide.is_active ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(guide)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteConfirmId(guide.id)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Downloaded Leads */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, email, phone, restaurant..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="pl-9 h-9 text-xs sm:text-sm bg-background border-border/80"
                />
              </div>

              <select
                value={leadGuideFilter}
                onChange={(e) => setLeadGuideFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-background border border-border/80 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Guides</option>
                {guides.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-9 px-3 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                <span>Export CSV</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchLeads}
                disabled={isLoadingLeads}
                className="h-9 px-3"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingLeads ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Contact Name</th>
                    <th className="py-3 px-4">Restaurant Name</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Guide Name</th>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-normal">
                  {isLoadingLeads ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
                        <span>Loading leads...</span>
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        No leads captured yet. Submissions from the /free-guide page will appear here.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-muted/20 transition-colors">
                        {/* Date */}
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "-"}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                          {lead.full_name}
                        </td>

                        {/* Restaurant */}
                        <td className="py-3 px-4 text-foreground whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{lead.restaurant_name}</span>
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 hover:underline font-mono"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </a>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <Mail className="w-3 h-3" />
                            <span>{lead.email}</span>
                          </a>
                        </td>

                        {/* Guide Name */}
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate">
                          {lead.guide_name}
                        </td>

                        {/* Event ID */}
                        <td className="py-3 px-4 text-[11px] font-mono text-muted-foreground truncate max-w-[120px]">
                          {lead.event_id || "-"}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Guide Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGuide ? "Edit Free Guide" : "Create New Free Guide"}
            </DialogTitle>
            <DialogDescription>
              Configure the guide details, category, chapters, and download URL for the public website.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveGuide} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Guide Title *</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Restaurant Menu Pricing Guide 2026"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. restaurant-pricing-guide"
                  className="mt-1"
                />
                <p className="text-[11px] text-muted-foreground mt-0.5">Leave blank to auto-generate.</p>
              </div>

              <div>
                <Label className="text-xs font-semibold">Category</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Menu Pricing, Marketing, Operations"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Badge Text</Label>
                <Input
                  value={formData.badge_text}
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  placeholder="e.g. সম্পূর্ণ বিনামূল্যে, Most Popular, Free PDF"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Short Description</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of key learnings, formulas, or takeaways..."
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">PDF File Download URL *</Label>
                <Input
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="/Business Growth Guide By Color Hut.pdf"
                  className="mt-1"
                />
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Direct URL or local path to downloadable PDF.
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold">Cover Image Path / URL</Label>
                <Input
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="/Ebook.png or image URL"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Chapters / Topics Editor (8 highlights for left and right columns) */}
            <div className="border border-border/80 rounded-xl p-4 bg-muted/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-500" />
                    <span>Guide Chapters & Topics (8 Highlights)</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chapters 1 to 4 appear on the left column, and Chapters 5 to 8 appear on the right column on /free-guide.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, chapters: DEFAULT_CHAPTERS })}
                  className="text-xs h-7 px-2.5"
                >
                  Reset Defaults
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Side (Chapters 1 to 4) */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border/50">
                    <span>Left Column (Chapters 1 - 4)</span>
                  </div>
                  {[0, 1, 2, 3].map((idx) => {
                    const ch = formData.chapters?.[idx] || { title: "", description: "" };
                    return (
                      <div key={idx} className="p-3 rounded-lg border border-border/60 bg-background/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-foreground">
                          <span className="font-semibold text-orange-500">Topic {idx + 1}</span>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Title</Label>
                          <Input
                            value={ch.title}
                            onChange={(e) => handleChapterChange(idx, "title", e.target.value)}
                            placeholder={`Topic ${idx + 1} Title`}
                            className="h-8 text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Description / Summary</Label>
                          <textarea
                            value={ch.description}
                            onChange={(e) => handleChapterChange(idx, "description", e.target.value)}
                            placeholder={`Short description for Topic ${idx + 1}`}
                            rows={2}
                            className="w-full text-xs mt-0.5 rounded-md border border-input bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Side (Chapters 5 to 8) */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-orange-500 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-border/50">
                    <span>Right Column (Chapters 5 - 8)</span>
                  </div>
                  {[4, 5, 6, 7].map((idx) => {
                    const ch = formData.chapters?.[idx] || { title: "", description: "" };
                    return (
                      <div key={idx} className="p-3 rounded-lg border border-border/60 bg-background/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-foreground">
                          <span className="font-semibold text-orange-500">Topic {idx + 1}</span>
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Title</Label>
                          <Input
                            value={ch.title}
                            onChange={(e) => handleChapterChange(idx, "title", e.target.value)}
                            placeholder={`Topic ${idx + 1} Title`}
                            className="h-8 text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] text-muted-foreground">Description / Summary</Label>
                          <textarea
                            value={ch.description}
                            onChange={(e) => handleChapterChange(idx, "description", e.target.value)}
                            placeholder={`Short description for Topic ${idx + 1}`}
                            rows={2}
                            className="w-full text-xs mt-0.5 rounded-md border border-input bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20">
              <div>
                <p className="text-xs font-semibold text-foreground">Active Status</p>
                <p className="text-[11px] text-muted-foreground">Visible to website visitors on /free-guide</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FF5A36] hover:bg-[#e84d2a] text-white"
              >
                {isSubmitting ? "Saving..." : editingGuide ? "Save Changes" : "Create Guide"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Guide?</DialogTitle>
            <DialogDescription>
              This will remove the guide from the website. Leads already captured will remain preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteGuide(deleteConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
