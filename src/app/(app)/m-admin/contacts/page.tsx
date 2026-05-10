
"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  Filter,
  ArrowUpDown,
  MessageCircle,
  ExternalLink,
  StickyNote,
  Tag,
  Loader2,
  Globe,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  UserPlus, 
  MessageSquare,
  Zap,
  Heart,
  Star,
  XCircle,
  HelpCircle,
  Trash2,
  Trash,
  DoorOpen,
  ShieldAlert,
  Layers,
  ClipboardList,
  ShoppingCart,
  LayoutDashboard,
  Package,
  FolderOpen,
  LogOut,
  FileEdit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar";
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { getLeads, updateClientNote, updateClientStage, getClientHistory, deleteClient } from '@/app/actions/clients';
import { getStages, addStage, updateStage, deleteStage } from '@/app/actions/stages';
import { useAdminAuth } from '@/hooks/use-admin-auth';

// Help map icon names to Lucide icons
const IconMap: Record<string, React.ElementType> = {
  UserPlus, MessageCircle, Star, Heart, XCircle, DoorOpen, ShieldAlert, 
  HelpCircle, MessageSquare, Zap, Tag, StickyNote, RefreshCw, Layers, ClipboardList, ShoppingCart, Users, LayoutDashboard, Globe, AlertCircle, CheckCircle2, ChevronDown, Package, FolderOpen, LogOut, Building2, Phone, Calendar, Clock, Filter, ArrowUpDown, ExternalLink, Trash2, Trash, ShieldAlert
};

const getIcon = (iconName: string) => IconMap[iconName] || HelpCircle;

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const toTitleCase = (str: string) => {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

interface Contact {
  id: number;
  business_name: string;
  business_type: string;
  whatsapp_number: string;
  division?: string;
  district?: string;
  latest_note: string | null;
  stage: string;
  last_login: string;
  created_at: string;
  _createdAtTimestamp?: number;
}

const DEFAULT_STAGES = [
  { 
    value: 'new-lead', 
    label: 'New Lead', 
    iconName: 'UserPlus',
    color: 'bg-slate-50 text-slate-600 border-slate-100',
    dotColor: 'bg-slate-400',
    hint: 'Initial contact received. What is the plan?',
    placeholder: 'e.g., "Assigned to sales team", "Waiting for reply"'
  },
  { 
    value: 'contacted', 
    label: 'Contacted', 
    iconName: 'MessageCircle',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    dotColor: 'bg-blue-500',
    hint: 'How did the first conversation go via WhatsApp or call?',
    placeholder: 'e.g., "Expressed interest in MenuBook template", "Asked for pricing details"'
  },
  { 
    value: 'interested', 
    label: 'Interested', 
    iconName: 'Star',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    dotColor: 'bg-amber-500',
    hint: 'Client is ready to pay or finalize the order.',
    placeholder: 'e.g., "Invoice sent", "Contract being reviewed"'
  },
  { 
    value: 'donated', 
    label: 'Donated', 
    iconName: 'Heart',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    dotColor: 'bg-rose-500',
    hint: 'The client has completed a transaction or contribution.',
    placeholder: 'e.g., "Payment received", "Success story"'
  },
  { 
    value: 'not-interested', 
    label: 'Not Interested', 
    iconName: 'XCircle',
    color: 'bg-gray-50 text-gray-500 border-gray-100',
    dotColor: 'bg-gray-400',
    hint: 'The client moved on or found another solution.',
    placeholder: 'e.g., "Too expensive", "Using competitor"'
  },
  { 
    value: 'exiting', 
    label: 'Exiting', 
    iconName: 'DoorOpen',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    dotColor: 'bg-indigo-500',
    hint: 'Why is the client leaving or terminating their service?',
    placeholder: 'e.g., "Season ended", "Switching to different provider"'
  },
  { 
    value: 'fake', 
    label: 'Fake', 
    iconName: 'ShieldAlert',
    color: 'bg-slate-100 text-slate-500 border-slate-200',
    dotColor: 'bg-slate-600',
    hint: 'Mark as bot, spam, or invalid contact.',
    placeholder: 'e.g., "Test entry", "Bot spam", "Invalid number"'
  },
];



export default function ContactsPage() {

  const { isAdminLoggedIn, adminLoading } = useAdminAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<any[]>(DEFAULT_STAGES);
  const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalContacts, setTotalContacts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterStage, setFilterStage] = useState<string>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [timezone, setTimezone] = useState<string>('');

  // Performance Optimization: Defer heavy state changes
  const deferredSearchTerm = React.useDeferredValue(searchTerm);
  const deferredDateRange = React.useDeferredValue(dateRange);
  const deferredFilterStage = React.useDeferredValue(filterStage);
  
  // Pending Stage Change State
  const [pendingStage, setPendingStage] = useState<{ id: number; stage: string; currentNote: string } | null>(null);
  const [stageNote, setStageNote] = useState('');
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // History State
  const [historyClientId, setHistoryClientId] = useState<number | null>(null);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newHistoryNote, setNewHistoryNote] = useState('');
  const [isAddingHistoryNote, setIsAddingHistoryNote] = useState(false);

  // Delete State
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [clientHistory, loadingHistory]);


  const { toast } = useToast();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (isAdminLoggedIn) {
      fetchStages();
    }
  }, [isAdminLoggedIn]);

  const fetchStages = async () => {
    try {
      const result = await getStages();
      if (result.success && result.data) {
        setStages(result.data.map((s: any) => ({
          ...s,
          iconName: s.icon // Store icon string to map back to icon component
        })));
      }
    } catch (err) {
      console.error("Failed to fetch stages:", err);
    }
  };
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const fetchContacts = useCallback(async (pageNum: number, isRefresh = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      // Prepare filters for server-side
      const filterParams = {
        search: deferredSearchTerm,
        stage: deferredFilterStage,
        dateFrom: deferredDateRange?.from ? format(deferredDateRange.from, 'yyyy-MM-dd') : undefined,
        dateTo: deferredDateRange?.to ? format(deferredDateRange.to, 'yyyy-MM-dd') : undefined
      };

      const result = await getLeads(pageNum, 20, filterParams); 
      if (result.success && Array.isArray(result.leads)) {
          const leads = result.leads.map(lead => {
            let stageVal = (lead.stage || 'new-lead').trim();
            // Final defensive fix for legacy names
            if (stageVal === 'New Lead' || stageVal === 'Lead') stageVal = 'new-lead';
            
            // Pre-calculate timestamp for performance
            const cleanString = lead.created_at.replace('T', ' ').replace(/\..*$/, '').replace('Z', '');
            const localParsingString = cleanString.replace(/-/g, '/');
            const timestamp = new Date(localParsingString).getTime();

            return {
              ...lead,
              stage: stageVal,
              _createdAtTimestamp: isNaN(timestamp) ? 0 : timestamp
            };
          });
        
        if (pageNum === 1) {
          setContacts(leads);
        } else {
          setContacts(prev => [...prev, ...leads]);
        }
        setHasMore(result.hasMore);
        setTotalContacts(result.total);
      } else if (result.success) {
        // success is true but leads is not an array (could happen if server returns partial error)
        console.warn("getLeads succeeded but returned non-array leads:", result.leads);
        if (pageNum === 1) setContacts([]);
      } else {
        toast({
          title: "Error fetching contacts",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      toast({
        title: "Network Error",
        description: "Could not connect to the database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [toast, deferredSearchTerm, deferredFilterStage, deferredDateRange]);

  // Filter-aware initial load and reset
  useEffect(() => {
    if (isAdminLoggedIn) {
      setPage(1);
      fetchContacts(1);
    }
  }, [isAdminLoggedIn, fetchContacts]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchContacts(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, loadingMore, loading, page, fetchContacts]);

  const handleRefresh = () => {
    setPage(1);
    fetchContacts(1, true);
  };

  const handleStageUpdate = async (clientId: number, stage: string, note: string) => {
    if (!note.trim()) {
      toast({
        title: "Note Required",
        description: "Please provide a reason for changing the stage.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingStage(true);
    try {
      const result = await updateClientStage(clientId, stage, note);
      if (result.success) {
        setContacts(prev => prev.map(c => c.id === clientId ? { ...c, stage, latest_note: note } : c));
        toast({
          title: "Stage updated",
          description: `Moved to ${stage}.`,
        });
        setPendingStage(null);
        setStageNote('');
      } else {
        toast({
          title: "Failed to update stage",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to update stage:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const fetchHistory = async (clientId: number) => {
    setLoadingHistory(true);
    try {
      const result = await getClientHistory(clientId);
      if (result.success) {
        setClientHistory(result.history || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddHistoryNote = async () => {
    if (!historyClientId || !newHistoryNote.trim()) return;
    
    const client = contacts.find(c => c.id === historyClientId);
    if (!client) return;

    setIsAddingHistoryNote(true);
    try {
      const result = await updateClientStage(historyClientId, client.stage, newHistoryNote);
      if (result.success) {
        setNewHistoryNote('');
        // Refresh history
        fetchHistory(historyClientId);
        // Refresh contacts list to show latest note
        setContacts(prev => prev.map(c => c.id === historyClientId ? { ...c, latest_note: newHistoryNote } : c));
        toast({ title: "Note added to history" });
      } else {
        toast({ title: "Failed to add note", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      console.error("Failed to add history note:", err);
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsAddingHistoryNote(false);
    }
  };

  const handleNoteUpdate = async (clientId: number, note: string) => {
    try {
      const result = await updateClientNote(clientId, note);
      if (result.success) {
        setContacts(prev => prev.map(c => c.id === clientId ? { ...c, note } : c));
        toast({
          title: "Note updated",
          description: "Saved successfully.",
        });
      } else {
        toast({
          title: "Failed to update note",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to update note:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteContact = async (clientId?: number) => {
    const targetId = clientId || deleteClientId;
    if (!targetId) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteClient(targetId);
      if (result.success) {
        setContacts(prev => prev.filter(c => c.id !== targetId));
        setTotalContacts(prev => prev - 1);
        toast({
          title: "Contact deleted",
          description: clientId ? "Removed instantly via your settings." : "The record has been permanently removed.",
          variant: "success",
        });
        setDeleteClientId(null);
      } else {
        toast({
          title: "Delete failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };




  const filteredContacts = useMemo(() => {
    // Sorting is still handled client-side for immediate responsiveness, 
    // but filtering is now primarily server-side.
    return [...contacts].sort((a, b) => {
      const dateA = a._createdAtTimestamp || 0;
      const dateB = b._createdAtTimestamp || 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [contacts, sortOrder]);

  const formatDate = (dateString: string, includeTime = false) => {
    try {
      if (!dateString) return "-";
      
      // Force the string into a format that browsers reliably treat as LOCAL time
      // Replace T with space and remove Z/milliseconds if present
      const cleanString = dateString.replace('T', ' ').replace(/\..*$/, '').replace('Z', '');
      
      // Use YYYY/MM/DD which is more cross-browser compatible for local parsing than YYYY-MM-DD
      const localParsingString = cleanString.replace(/-/g, '/');
      const date = new Date(localParsingString);
      
      if (isNaN(date.getTime())) return dateString;
      
      return format(date, includeTime ? "MMM d, yyyy • h:mm a" : "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    const finalNumber = cleanNumber.startsWith('01') ? '88' + cleanNumber : cleanNumber;
    window.open(`https://wa.me/${finalNumber}`, '_blank');
  };

  if (loading && totalContacts === 0) {
    return <div className="p-8 flex items-center justify-center h-[50vh]"><RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" /> Initializing Directory...</div>;
  }  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 min-w-0 w-full max-w-full overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 min-w-0 flex-1">          
          <div className="flex flex-row items-center justify-between gap-2 flex-nowrap">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 shrink-0">
              <div className="p-1.5 sm:p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 shrink-0">
                <Users className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <span className="truncate">Contacts</span>
            </h1>

            <div className="flex flex-row items-center gap-1.5 w-auto shrink-0">
                <div className="flex items-center gap-2">
                    {timezone && (
                        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-inner shrink-0">
                            <Globe className="h-3 w-3" />
                            Viewing in {timezone}
                        </div>
                    )}
                    <div 
                      onDoubleClick={() => setIsStageManagerOpen(true)}
                      className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] sm:text-sm font-bold shadow-lg shadow-slate-200 whitespace-nowrap cursor-pointer select-none h-9"
                    >
                        {totalContacts} Total
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="gap-2 rounded-full h-9 px-4 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold text-[10px] sm:text-sm whitespace-nowrap">
                    <RefreshCw className={cn("h-3.5 w-3.5 shrink-0", loading && "animate-spin")} />
                    Sync Data
                </Button>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
            Manage your customer base and track interactions.
          </p>
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white w-full">
        <CardHeader className="px-5 sm:px-6 py-6 border-b border-slate-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 w-full">
            <div className="flex flex-col gap-0.5 min-w-0">
              <CardTitle className="text-xl font-bold text-slate-800 truncate">Customer Directory</CardTitle>
              <CardDescription className="text-slate-400 font-medium break-words text-sm sm:text-base">Real-time client synchronization with WhatsApp validation.</CardDescription>
            </div>
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
              {/* Stage Filter */}
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="w-full sm:w-[140px] lg:w-44 h-11 rounded-2xl bg-slate-50/50 border-slate-200 focus:ring-0 focus:border-slate-300 transition-all font-bold text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-500 shrink-0 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    <SelectValue placeholder="All Stages" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1 min-w-[200px]">
                  <SelectItem value="All" className="text-[12px] font-bold tracking-tight rounded-xl py-2 px-3 focus:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      All Stages
                    </div>
                  </SelectItem>
                  {stages.map((stage) => (
                    <SelectItem 
                      key={stage.value} 
                      value={stage.value}
                      className="text-[12px] font-bold tracking-tight rounded-xl py-2 px-3 focus:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", stage.dotColor)} />
                        {stage.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              <DateRangePicker 
                date={dateRange} 
                setDate={setDateRange} 
                className="w-full sm:w-[220px] lg:w-64 shrink-0"
              />

              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px] lg:w-72 group shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <Input 
                  placeholder="Search clients..." 
                  className="pl-10 h-11 w-full bg-slate-50/50 border-slate-200 rounded-2xl focus-visible:ring-slate-900 focus-visible:ring-offset-0 transition-all placeholder:text-slate-400 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="w-full">
              {/* Desktop Table - Hidden on small screens */}
              <Table className="hidden md:table">
                <TableHeader className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[60px] text-center font-bold text-[11px] uppercase tracking-widest text-slate-400 pl-6">SL</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 py-5">Client Name</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Category</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">WhatsApp</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Address</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                      <div className="flex items-center gap-1.5">
                        Joined
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">
                      Last Activity
                    </TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 w-44">Stage</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 w-64">Updates</TableHead>
                    <TableHead className="text-right font-bold text-[11px] uppercase tracking-widest text-slate-400 pr-6">Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-slate-50">
                        <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48 mb-1" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-36 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="h-10 w-28 ml-auto rounded-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 py-10">
                            <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                                <Search className="h-8 w-8" />
                            </div>
                            <p className="text-slate-400 font-medium">No clients found matching your search.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact, index) => (
                      <ContactRow 
                        key={contact.id} 
                        contact={contact} 
                        stages={stages}
                        index={totalContacts - index}
                        onStageChange={(val: string) => {
                          setPendingStage({ id: contact.id, stage: val, currentNote: contact.latest_note || '' });
                          setStageNote('');
                        }}
                        onViewHistory={() => {
                          setHistoryClientId(contact.id);
                          fetchHistory(contact.id);
                        }}
                        onDeleteTrigger={() => {
                          setDeleteClientId(contact.id);
                        }}
                        onWhatsAppClick={() => openWhatsApp(contact.whatsapp_number)}
                        formatDate={formatDate}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Ultra-Modern Mobile CRM List */}
              <div className="md:hidden space-y-4 p-4 pb-24 bg-slate-50/40 min-h-screen">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100/50">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-14 w-14 rounded-[1.25rem]" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32 rounded-lg" />
                                            <Skeleton className="h-4 w-20 rounded-lg" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center gap-4 py-32"
                    >
                        <div className="h-20 w-20 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-200">
                            <Search className="h-10 w-10" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-slate-900 font-extrabold text-lg">No Results</p>
                            <p className="text-slate-400 text-sm font-medium">Try adjusting your filters</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-3.5">
                        {filteredContacts.map((contact, index) => (
                          <MobileContactCard 
                            key={contact.id} 
                            contact={contact} 
                            stages={stages}
                            index={index}
                            onStageChange={(val: string) => {
                              setPendingStage({ id: contact.id, stage: val, currentNote: contact.latest_note || '' });
                              setStageNote('');
                            }}
                            onViewHistory={() => {
                              setHistoryClientId(contact.id);
                              fetchHistory(contact.id);
                            }}
                            onDeleteTrigger={() => {
                              setDeleteClientId(contact.id);
                            }}
                            onWhatsAppClick={() => openWhatsApp(contact.whatsapp_number)}
                          />
                        ))}
                    </div>
                )}
              </div>
              {hasMore && (
                <div ref={observerTarget} className="h-20 flex items-center justify-center w-full">
                  {loadingMore && <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Stage Change Note Dialog */}
        <Dialog open={!!pendingStage} onOpenChange={(open) => !open && setPendingStage(null)}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary" />
                Change Stage to {pendingStage?.stage}
              </DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                {stages.find(s => s.value === pendingStage?.stage)?.hint}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder={stages.find(s => s.value === pendingStage?.stage)?.placeholder}
                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-slate-900 focus:border-slate-900 font-medium resize-none shadow-sm"
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="ghost" 
                onClick={() => setPendingStage(null)} 
                className="rounded-full font-bold text-slate-400 hover:text-slate-600"
                disabled={isUpdatingStage}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => pendingStage && handleStageUpdate(pendingStage.id, pendingStage.stage, stageNote)}
                className="rounded-full font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 px-6"
                disabled={isUpdatingStage || !stageNote.trim()}
              >
                {isUpdatingStage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Confirm Change'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={!!historyClientId} onOpenChange={(open) => !open && setHistoryClientId(null)}>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-white">
            <DialogHeader className="p-6 px-8 flex flex-row items-center justify-between border-b border-slate-50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shadow-inner">
                    {contacts.find(c => c.id === historyClientId)?.business_name?.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <DialogTitle className="text-base font-black text-slate-900 tracking-tight">
                    {contacts.find(c => c.id === historyClientId)?.business_name}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Log
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea ref={scrollRef} className="flex-1 px-6 py-6 bg-slate-50/30">
              {loadingHistory ? (
                <div className="flex flex-col gap-6 py-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                       <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                       <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-12 w-full rounded-xl" />
                       </div>
                    </div>
                  ))}
                </div>
              ) : clientHistory.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-300 font-bold text-sm tracking-tight">No activity recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-6 pb-8">
                  {(() => {
                    const groups: any[] = [];
                    clientHistory.forEach((item) => {
                      if (groups.length > 0 && groups[groups.length - 1].stage === item.stage) {
                        groups[groups.length - 1].items.push(item);
                      } else {
                        groups.push({ stage: item.stage, items: [item] });
                      }
                    });

                    return groups.map((group, gIdx) => (
                      <HistoryGroup 
                        key={`${group.stage}-${gIdx}`} 
                        group={group} 
                        stages={stages} 
                        formatDate={formatDate}
                        isLast={gIdx === groups.length - 1}
                      />
                    ));
                  })()}
                </div>
              )}
            </ScrollArea>

            {/* Chat-style Input Bar */}
            {!loadingHistory && (
              <div className="p-4 px-6 bg-white border-t border-slate-100">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative group">
                    <Textarea 
                      placeholder="Send a note..."
                      className="min-h-[48px] max-h-[120px] rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 font-medium py-3 px-4 pr-10 transition-all placeholder:text-slate-300 resize-none"
                      value={newHistoryNote}
                      onChange={(e) => setNewHistoryNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddHistoryNote();
                        }
                      }}
                    />
                    <div className="absolute right-3 bottom-3 opacity-30">
                        <Zap className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddHistoryNote}
                    disabled={isAddingHistoryNote || !newHistoryNote.trim()}
                    className="h-11 w-11 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all active:scale-90 disabled:opacity-50 shrink-0 p-0 flex items-center justify-center"
                  >
                    {isAddingHistoryNote ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <MessageSquare className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteClientId} onOpenChange={(open) => !open && setDeleteClientId(null)}>
          <AlertDialogContent className="rounded-3xl border-slate-200 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold flex items-center gap-3 text-slate-900">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Trash2 className="h-5 w-5" />
                </div>
                Verify Account Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium py-2">
                This will permanently delete <span className="font-bold text-slate-900 capitalize">{contacts.find(c => c.id === deleteClientId)?.business_name}</span> and all associated historical logs. This action cannot be reversed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 sm:gap-0">
              <AlertDialogCancel className="rounded-full font-bold border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                Keep Account
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDeleteContact()}
                className="rounded-full font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 px-6 transition-all border-none"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stage Manager Dialog */}
        <StageManagerDialog 
          isOpen={isStageManagerOpen} 
          onOpenChange={setIsStageManagerOpen} 
          stages={stages} 
          onRefresh={fetchStages} 
        />

      </div>
    </div>
  );
}

// Sub-components for better organization and performance
const ContactRow = React.memo(function ContactRow({ contact, index, stages, onStageChange, onViewHistory, onDeleteTrigger, onWhatsAppClick, formatDate }: any) {
  const currentStageInfo = stages.find((s: any) => s.value === contact.stage) || stages[0];

  return (
    <TableRow 
      onDoubleClick={onDeleteTrigger}
      className="group border-slate-50 hover:bg-rose-50/30 transition-all duration-200 cursor-context-menu select-none active:bg-rose-50/50"
    >
      <TableCell className="text-center font-mono text-xs text-slate-300 group-hover:text-slate-400 pl-6 transition-colors">
        {index.toString().padStart(2, '0')}
      </TableCell>
      <TableCell>
        <span className="font-bold text-slate-700 text-sm tracking-tight capitalize">{contact.business_name}</span>
      </TableCell>
      <TableCell>
          <Badge variant="secondary" className="px-3 py-0.5 text-[10px] uppercase font-extrabold bg-slate-100 text-slate-500 border-none rounded-full whitespace-nowrap group-hover:bg-slate-200 transition-colors">
              {contact.business_type}
          </Badge>
      </TableCell>
      <TableCell>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
              <span className="tabular-nums">{contact.whatsapp_number}</span>
          </div>
      </TableCell>
      <TableCell>
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 tracking-tight">
              <Globe className="h-3.5 w-3.5 text-slate-300" />
              {contact.district && contact.division ? `${toTitleCase(contact.district)}, ${toTitleCase(contact.division)}` : '-'}
          </div>
      </TableCell>
      <TableCell className="text-[13px] text-slate-400 font-medium whitespace-nowrap">
          <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-300" />
              {formatDate(contact.created_at)}
          </div>
      </TableCell>
      <TableCell className="text-[12px] text-slate-400 font-medium whitespace-nowrap">
        {formatDate(contact.last_login, true)}
      </TableCell>
      <TableCell>
        <Select 
          value={contact.stage} 
          onValueChange={onStageChange}
        >
          <SelectTrigger 
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className={cn(
            "h-8 w-40 text-[11px] font-bold uppercase tracking-wider rounded-full border px-3 transition-all hover:shadow-md flex items-center gap-1.5",
            currentStageInfo.color
          )}>
            {React.createElement(getIcon(currentStageInfo.iconName || 'HelpCircle'), { className: "h-3.5 w-3.5 shrink-0" })}
            <span className="truncate">{currentStageInfo.label}</span>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
            {stages.map((stage: any) => (
              <SelectItem 
                key={stage.value} 
                value={stage.value}
                textValue={stage.label}
                className="text-[12px] font-medium tracking-tight focus:bg-slate-50 rounded-xl py-2 px-3 my-0.5 group/item"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn("h-2 w-2 rounded-full", stage.dotColor)} />
                  <span className="text-slate-600 group-hover/item:text-slate-900 transition-colors">{stage.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="max-w-[250px]">
          <div className="flex items-center gap-2.5 group/update cursor-pointer" 
            title="Click to view history"
            onClick={(e) => {
              e.stopPropagation();
              onViewHistory();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
              <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg group-hover/update:bg-primary/10 group-hover/update:text-primary group-hover/update:shadow-sm transition-all shrink-0">
                  <Clock className="h-3.5 w-3.5" />
              </div>
              <span className="text-[13px] text-slate-500 font-medium truncate block leading-relaxed">
                  {contact.latest_note || <span className="text-slate-300 italic font-normal text-xs">Waiting for first update...</span>}
              </span>
          </div>
      </TableCell>
      <TableCell className="text-right pr-6">
        <div className="flex items-center justify-end gap-2 shrink-0">
           <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 sm:w-auto sm:px-5 rounded-full text-xs font-bold bg-[#25D366] text-white hover:bg-[#20ba5a] hover:text-white shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onWhatsAppClick();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <WhatsAppIcon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

const MobileContactCard = React.memo(function MobileContactCard({ contact, index, stages, onStageChange, onViewHistory, onDeleteTrigger, onWhatsAppClick }: any) {
  const stageInfo = stages.find((s: any) => s.value === contact.stage) || stages[0];
  const initials = contact.business_name.substring(0, 2).toUpperCase();

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.5), type: "spring", damping: 25, stiffness: 200 }}
        className="group bg-white rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 hover:border-slate-200 transition-all active:scale-[0.98] select-none"
        onDoubleClick={onDeleteTrigger}
    >
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className={cn(
                "h-12 w-12 sm:h-14 sm:w-14 rounded-[1.25rem] flex items-center justify-center text-xs sm:text-sm font-black shadow-inner shrink-0 border border-white/40 overflow-hidden relative",
                stageInfo.color.replace('bg-', 'bg-opacity-10 bg-').split(' ')[0],
                "bg-slate-50 text-slate-700"
            )}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                {initials}
            </div>
            <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="font-black text-[17px] text-slate-900 leading-none truncate capitalize tracking-tight">
                        {contact.business_name}
                    </h3>
                    <Select 
                        value={contact.stage} 
                        onValueChange={onStageChange}
                    >
                        <SelectTrigger 
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className={cn(
                            "h-6 w-fit text-[9px] font-black uppercase tracking-[0.1em] rounded-full border px-3 bg-opacity-10 shadow-none transition-all focus:ring-0 flex items-center gap-1.5",
                            stageInfo.color
                        )}>
                            {React.createElement(getIcon(stageInfo.iconName || 'HelpCircle'), { className: "h-3 w-3 shrink-0" })}
                            <span>{stageInfo.label}</span>
                        </SelectTrigger>
                        <SelectContent className="rounded-3xl border-slate-100 shadow-2xl p-2">
                            {stages.map((stage: any) => (
                                <SelectItem 
                                    key={stage.value} 
                                    value={stage.value}
                                    textValue={stage.label}
                                    className="text-[12px] font-bold tracking-tight rounded-xl py-2.5 px-4 my-0.5 focus:bg-slate-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-2 w-2 rounded-full", stage.dotColor)} />
                                        {stage.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{contact.business_type}</p>
                    {(contact.district || contact.division) && (
                        <>
                            <span className="text-slate-200 text-[10px]">•</span>
                            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold tracking-widest">
                                <Globe className="h-2.5 w-2.5" />
                                {toTitleCase(contact.district || contact.division || '')}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-slate-50/50">
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    onViewHistory();
                }} 
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="flex-1 bg-slate-50/50 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 active:bg-slate-100 transition-colors overflow-hidden"
            >
                <div className="h-5 w-5 sm:h-6 sm:w-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold truncate tracking-tight lowercase first-letter:uppercase italic">
                    {contact.latest_note || 'No updates yet...'}
                </p>
            </div>
            <motion.button 
                whileTap={{ scale: 0.9 }} 
                onClick={(e) => {
                    e.stopPropagation();
                    onWhatsAppClick();
                }} 
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="h-10 w-10 rounded-2xl bg-[#f0fdf4] text-[#25d366] flex items-center justify-center border border-[#25d366]/20 shadow-sm"
            >
                <WhatsAppIcon className="h-5 w-5" />
            </motion.button>
        </div>
    </motion.div>
  );
});

const COLOR_THEMES = [
  { name: 'Slate', color: '#64748b', classes: 'bg-slate-50 text-slate-600 border-slate-100', dot: 'bg-slate-400' },
  { name: 'Blue', color: '#3b82f6', classes: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500' },
  { name: 'Amber', color: '#f59e0b', classes: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' },
  { name: 'Rose', color: '#f43f5e', classes: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500' },
  { name: 'Emerald', color: '#10b981', classes: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
  { name: 'Indigo', color: '#6366f1', classes: 'bg-indigo-50 text-indigo-600 border-indigo-100', dot: 'bg-indigo-500' },
  { name: 'Violet', color: '#8b5cf6', classes: 'bg-violet-50 text-violet-600 border-violet-100', dot: 'bg-violet-500' },
  { name: 'Orange', color: '#f97316', classes: 'bg-orange-50 text-orange-600 border-orange-100', dot: 'bg-orange-500' },
  { name: 'Cyan', color: '#06b6d4', classes: 'bg-cyan-50 text-cyan-600 border-cyan-100', dot: 'bg-cyan-500' },
  { name: 'Pink', color: '#ec4899', classes: 'bg-pink-50 text-pink-600 border-pink-100', dot: 'bg-pink-500' },
  { name: 'Lime', color: '#84cc16', classes: 'bg-lime-50 text-lime-600 border-lime-100', dot: 'bg-lime-500' },
  { name: 'Sky', color: '#0ea5e9', classes: 'bg-sky-50 text-sky-600 border-sky-100', dot: 'bg-sky-500' },
  { name: 'Teal', color: '#14b8a6', classes: 'bg-teal-50 text-teal-600 border-teal-100', dot: 'bg-teal-500' },
  { name: 'Fuchsia', color: '#d946ef', classes: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100', dot: 'bg-fuchsia-500' },
  { name: 'Red', color: '#ef4444', classes: 'bg-red-50 text-red-600 border-red-100', dot: 'bg-red-500' },
  { name: 'Yellow', color: '#eab308', classes: 'bg-yellow-50 text-yellow-600 border-yellow-100', dot: 'bg-yellow-500' },
];

function StageManagerDialog({ isOpen, onOpenChange, stages, onRefresh }: any) {
  const [editingStage, setEditingStage] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (editingStage) {
      const theme = COLOR_THEMES.find(t => t.classes === editingStage.color) || COLOR_THEMES[0];
      setSelectedTheme(theme);
    }
  }, [editingStage]);

  // Fix for Radix UI body lock issue
  useEffect(() => {
    if (!isOpen) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const label = formData.get('label') as string;
    
    // Use the selected theme's classes
    const color = selectedTheme?.classes || COLOR_THEMES[0].classes;
    const dotColor = selectedTheme?.dot || COLOR_THEMES[0].dot;

    const stageData = {
      label,
      value: label.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
      iconName: formData.get('iconName'),
      color,
      dotColor,
      hint: formData.get('hint'),
      placeholder: formData.get('placeholder'),
    };

    setIsSaving(true);
    try {
      let result;
      if (editingStage?.id) {
        result = await updateStage(editingStage.id, { ...stageData, icon: stageData.iconName });
      } else {
        result = await addStage({ ...stageData, icon: stageData.iconName });
      }

      if (result.success) {
        toast({ title: editingStage?.id ? "Stage updated" : "Stage added" });
        onRefresh();
        setEditingStage(null);
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (stageId: number) => {
    setIsDeleting(true);
    try {
      const result = await deleteStage(stageId);
      if (result.success) {
        toast({ title: "Stage deleted", description: "Successfully removed the stage and migrated contacts." });
        
        // If we were editing the deleted stage, clear it
        if (editingStage && editingStage.id === stageId) {
          setEditingStage(null);
        }
        
        setConfirmDeleteId(null);
        
        // Brief delay to allow AlertDialog cleanup before refreshing state
        setTimeout(() => {
          onRefresh();
          document.body.style.pointerEvents = 'auto';
        }, 100);
      } else {
        toast({ 
          title: "Delete failed", 
          description: result.error || "Could not delete stage.", 
          variant: "destructive" 
        });
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast({ 
        title: "System Error", 
        description: "An unexpected error occurred while deleting.", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl rounded-2xl max-h-[90vh] flex flex-col p-0 border-none shadow-2xl overflow-hidden bg-white font-glancyr">
        <div className="p-8 pb-6 flex items-center gap-6 border-b border-slate-50">
          <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Tag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 font-glancyr">
              Manage Custom Stages
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold text-sm font-glancyr">
              Customize the workflow stages for your contact management system.
            </DialogDescription>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-white">
          {/* List of Stages */}
          <div className="w-full lg:w-[38%] p-6 border-r border-slate-50 flex flex-col bg-slate-50/20 font-glancyr">
            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-4 pl-1 font-glancyr">Existing Stages</h4>
            <ScrollArea className="flex-1 h-[400px]">
              <div className="space-y-2 pr-4">
                {stages.map((stage: any) => (
                  <div key={stage.id || stage.value} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer" onClick={() => setEditingStage(stage)}>
                    <div className="flex items-center gap-3">
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105", stage.color)}>
                        {React.createElement(getIcon(stage.iconName || 'HelpCircle'), { className: "h-4 w-4" })}
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-slate-800 tracking-tight font-glancyr leading-tight">{stage.label}</p>
                        <p className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-widest">ID: {stage.id || 'NEW'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingStage(stage);
                        }}
                      >
                        <FileEdit className="h-3.5 w-3.5" />
                      </Button>
                      {stage.id && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600" 
                            disabled={isDeleting}
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(stage.id);
                            }}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button 
                className="mt-4 rounded-xl font-black h-11 border-2 border-dashed border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group font-glancyr text-xs" 
                variant="outline"
                onClick={() => setEditingStage({ label: '', value: '', iconName: 'Tag', color: 'bg-slate-50 text-slate-600 border-slate-100', dotColor: 'bg-slate-400', hint: '', placeholder: '' })}
            >
              <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> Add New Stage
            </Button>
          </div>

          {/* Edit Form */}
          <div className="w-full lg:w-[62%] p-8 bg-white relative font-glancyr">
            {editingStage ? (
              <form onSubmit={handleSave} className="space-y-7 font-glancyr">
                <div className="grid grid-cols-2 gap-5 items-end">
                  <div className="space-y-2.5 font-glancyr">
                    <label className="text-[11px] uppercase font-black text-slate-400 tracking-wider pl-1 font-glancyr">Select Icon</label>
                    <Select name="iconName" defaultValue={editingStage.iconName || 'Tag'}>
                      <SelectTrigger className="rounded-xl h-14 text-sm font-bold border-slate-100 bg-slate-50/50 focus:ring-primary/20 transition-all font-glancyr">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-2xl p-3 min-w-[300px] font-glancyr">
                        <div className="grid grid-cols-5 gap-2">
                          {Object.keys(IconMap).map(iconName => {
                            const Icon = getIcon(iconName);
                            return (
                              <SelectItem 
                                key={iconName} 
                                value={iconName} 
                                className="rounded-lg flex items-center justify-center p-3 focus:bg-primary/10 group h-12 w-12"
                                textValue={iconName}
                              >
                                <Icon className="h-5 w-5 text-slate-400 group-hover:text-primary group-data-[state=checked]:text-primary transition-colors" />
                              </SelectItem>
                            );
                          })}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5 font-glancyr">
                    <label className="text-[11px] uppercase font-black text-slate-400 tracking-wider pl-1 font-glancyr">Stage Name</label>
                    <Input name="label" defaultValue={editingStage.label} placeholder="e.g. In Progress" required className="rounded-xl h-14 text-sm font-bold border-slate-100 bg-slate-50/50 focus:ring-primary/20 placeholder:text-slate-300 font-glancyr" />
                  </div>
                </div>

                <div className="space-y-3.5 font-glancyr">
                  <label className="text-[11px] uppercase font-black text-slate-400 tracking-wider pl-1 font-glancyr">Theme Color</label>
                  <div className="flex flex-wrap gap-3.5 p-5 bg-slate-50/50 rounded-2xl border border-slate-50 shadow-inner">
                    {COLOR_THEMES.map((theme) => (
                      <button
                        key={theme.name}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        className={cn(
                          "h-10 w-10 rounded-lg border-4 transition-all hover:scale-110 active:scale-95 shadow-md flex items-center justify-center",
                          selectedTheme?.name === theme.name ? "border-slate-900 scale-110" : "border-white"
                        )}
                        style={{ backgroundColor: theme.color }}
                      >
                         {selectedTheme?.name === theme.name && <div className="h-2 w-2 rounded-full bg-white shadow-sm" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 font-glancyr">
                  <label className="text-[11px] uppercase font-black text-slate-400 tracking-wider pl-1 font-glancyr">Helper Hint</label>
                  <Textarea name="hint" defaultValue={editingStage.hint} className="rounded-xl text-sm font-medium min-h-[120px] border-slate-100 bg-slate-50/50 focus:ring-primary/20 p-5 leading-relaxed font-glancyr" placeholder="What should the admin do in this stage?" />
                </div>

                <div className="flex gap-4 pt-4 font-glancyr">
                  <Button type="button" variant="ghost" className="flex-1 rounded-xl h-14 font-black text-slate-400 hover:text-slate-900 transition-all tracking-tight font-glancyr" onClick={() => setEditingStage(null)}>
                    Discard
                  </Button>
                  <Button type="submit" className="flex-[2.5] rounded-xl h-14 font-black bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] tracking-tight text-base font-glancyr" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingStage?.id ? "Apply Changes" : "Save New Stage")}
                  </Button>
                </div>
              </form>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-7 px-16 font-glancyr">
                    <div className="p-10 bg-slate-50 rounded-3xl animate-pulse">
                        <Layers className="h-20 w-20 text-slate-200" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 font-glancyr">Editor Active</h3>
                      <p className="text-[15px] font-bold text-slate-400 leading-relaxed max-w-sm mx-auto font-glancyr">Select a stage from the left list or click the add button to begin customizing your workflow system.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Non-blocking Delete Confirmation */}
    <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
      <AlertDialogContent className="rounded-3xl border-slate-200 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold flex items-center gap-3 text-slate-900 font-glancyr">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Trash2 className="h-5 w-5" />
            </div>
            Confirm Stage Deletion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 font-bold py-2 font-glancyr">
            Are you sure you want to delete <span className="text-slate-900">"{stages.find((s: any) => s.id === confirmDeleteId)?.label}"</span>? 
            <br />
            All clients currently in this stage will be rolled back to <span className="font-bold text-primary">New Lead</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 sm:gap-0 font-glancyr">
          <AlertDialogCancel className="rounded-full font-bold border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all h-12 px-6">
            Keep Stage
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            className="rounded-full font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 h-12 px-8 transition-all border-none"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

function HistoryGroup({ group, stages, formatDate, isLast }: any) {
  const stageInfo = stages.find((s: any) => s.value === group.stage) || stages[0];
  const Icon = getIcon(stageInfo.iconName || 'HelpCircle');

  return (
    <div className="space-y-6">
      {/* System Message / Stage Divider */}
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="h-px bg-slate-100 flex-1" />
        <div className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm",
            stageInfo.color.replace('border-', 'border-transparent bg-opacity-10 bg-')
        )}>
            <Icon className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">{group.stage}</span>
        </div>
        <div className="h-px bg-slate-100 flex-1" />
      </div>

      <div className="space-y-3">
        {group.items.map((item: any, idx: number) => (
          <motion.div 
            key={item.id} 
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: idx * 0.1, type: "spring", damping: 20 }}
            className="flex flex-col items-start gap-1 max-w-[85%]"
          >
            <div className="bg-white border border-slate-100 p-3.5 px-4 rounded-2xl rounded-tl-none shadow-sm shadow-slate-100/50">
              <p className="text-[14px] text-slate-700 font-medium leading-relaxed break-words tracking-tight">
                {item.note}
              </p>
            </div>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pl-1 tabular-nums">
              {formatDate(item.created_at, true)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

