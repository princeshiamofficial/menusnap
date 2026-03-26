
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
  Star,
  XCircle,
  HelpCircle,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/ui/sidebar";
import { format } from 'date-fns';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { getLeads, updateClientNote, updateClientStage, getClientHistory } from '@/app/actions/clients';
import { useAdminAuth } from '@/hooks/use-admin-auth';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface Contact {
  id: number;
  business_name: string;
  business_type: string;
  whatsapp_number: string;
  latest_note: string | null;
  stage: string;
  last_login: string;
  created_at: string;
}

const STAGES = [
  { 
    value: 'New Lead', 
    label: 'New Lead', 
    icon: UserPlus,
    color: 'bg-slate-50 text-slate-600 border-slate-100',
    dotColor: 'bg-slate-400',
    hint: 'Initial contact received. What is the plan?',
    placeholder: 'e.g., "Assigned to sales team", "Waiting for reply"'
  },
  { 
    value: 'Contacted', 
    label: 'Contacted', 
    icon: MessageCircle,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    dotColor: 'bg-blue-500',
    hint: 'How did the first conversation go via WhatsApp or call?',
    placeholder: 'e.g., "Expressed interest in MenuBook template", "Asked for pricing details"'
  },
  { 
    value: 'Interested', 
    label: 'Interested', 
    icon: Star,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    dotColor: 'bg-amber-500',
    hint: 'What specifically are they interested in? Any specific features discussed?',
    placeholder: 'e.g., "Wants custom branding and QR code support", "Loves the glassmorphism design"'
  },
  { 
    value: 'Converted', 
    label: 'Converted', 
    icon: CheckCircle2,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    dotColor: 'bg-emerald-500',
    hint: 'Congratulations! What are the next steps for onboarding or delivery?',
    placeholder: 'e.g., "Order confirmed, payment received", "Onboarding scheduled for next Monday"'
  },
  { 
    value: 'Lost', 
    label: 'Lost', 
    icon: XCircle,
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    dotColor: 'bg-rose-500',
    hint: 'Why was the lead lost? This helps us improve our services.',
    placeholder: 'e.g., "Found competitor cheaper", "Not ready to digitize yet", "No response after 3 follow-ups"'
  },
];

export default function ContactsPage() {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalContacts, setTotalContacts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [timezone, setTimezone] = useState<string>('');
  
  // Pending Stage Change State
  const [pendingStage, setPendingStage] = useState<{ id: number; stage: string; currentNote: string } | null>(null);
  const [stageNote, setStageNote] = useState('');
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  // History State
  const [historyClientId, setHistoryClientId] = useState<number | null>(null);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { toast } = useToast();
  const { toggleSidebar, setOpenMobile } = useSidebar();

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  const fetchContacts = useCallback(async (pageNum: number, isRefresh = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await getLeads(pageNum, 20); 
      if (result.success) {
        if (pageNum === 1) {
          setContacts(result.leads as Contact[]);
        } else {
          setContacts(prev => [...prev, ...(result.leads as Contact[])]);
        }
        setHasMore(result.hasMore);
        setTotalContacts(result.total);
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
  }, [toast]);

  // Initial load
  useEffect(() => {
    if (isAdminLoggedIn) {
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



  const filteredContacts = useMemo(() => {
    return contacts
      .filter(contact => 
        contact.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.whatsapp_number.includes(searchTerm)
      )
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [contacts, searchTerm, sortOrder]);

  const formatDate = (dateString: string, includeTime = false) => {
    try {
      if (!dateString) return "-";
      // The server now provides ISO strings (with 'Z'), so new Date() or parseISO works perfectly
      const date = new Date(dateString);
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
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="truncate">Contacts</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
            Manage your customer base and track interactions.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 flex-1 sm:flex-none">
                {timezone && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-inner shrink-0">
                        <Globe className="h-3 w-3" />
                        Viewing in {timezone}
                    </div>
                )}
                <div className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-slate-200 flex-1 sm:flex-none whitespace-nowrap">
                    {totalContacts} Total
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="gap-2 rounded-full h-10 px-5 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap">
                <RefreshCw className={cn("h-4 w-4 shrink-0", loading && "animate-spin")} />
                Sync Data
            </Button>
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white w-full">
        <CardHeader className="px-5 sm:px-6 py-6 border-b border-slate-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 w-full">
            <div className="flex flex-col gap-0.5 min-w-0">
              <CardTitle className="text-xl font-bold text-slate-800 truncate">Customer Directory</CardTitle>
              <CardDescription className="text-slate-400 font-medium break-words text-sm sm:text-base">Real-time client synchronization with WhatsApp validation.</CardDescription>
            </div>
            <div className="relative w-full lg:w-72 group shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <Input 
                placeholder="Search clients..." 
                className="pl-10 h-11 w-full bg-slate-50/50 border-slate-200 rounded-2xl focus-visible:ring-slate-900 focus-visible:ring-offset-0 transition-all placeholder:text-slate-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                      <TableRow key={contact.id} className="group border-slate-50 hover:bg-slate-50/50 transition-all duration-200">
                        <TableCell className="text-center font-mono text-xs text-slate-300 group-hover:text-slate-500 pl-6 transition-colors">
                          {(filteredContacts.length - index).toString().padStart(2, '0')}
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
                            value={contact.stage || 'New Lead'} 
                            onValueChange={(val) => {
                              if (val !== (contact.stage || 'New Lead')) {
                                setPendingStage({ id: contact.id, stage: val, currentNote: contact.latest_note || '' });
                                setStageNote('');
                              }
                            }}
                          >
                            <SelectTrigger className={cn(
                              "h-8 w-40 text-[11px] font-bold uppercase tracking-wider rounded-full border px-3 transition-all hover:shadow-md",
                              STAGES.find(s => s.value === (contact.stage || 'New Lead'))?.color || STAGES[0].color
                            )}>
                              <div className="flex items-center gap-1.5">
                                {React.createElement(STAGES.find(s => s.value === (contact.stage || 'New Lead'))?.icon || HelpCircle, { className: "h-3 w-3" })}
                                <SelectValue placeholder="Select Stage" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                              {STAGES.map((stage) => (
                                <SelectItem 
                                  key={stage.value} 
                                  value={stage.value}
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
                              onClick={() => {
                                setHistoryClientId(contact.id);
                                fetchHistory(contact.id);
                              }}
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 px-5 rounded-full text-xs font-bold bg-[#25D366] text-white hover:bg-[#20ba5a] hover:text-white shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 ml-auto"
                            onClick={() => openWhatsApp(contact.whatsapp_number)}
                          >
                            <WhatsAppIcon className="h-4 w-4 flex-shrink-0" />
                            <span>WhatsApp</span>
                          </Button>
                        </TableCell>
                      </TableRow>
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
                        {filteredContacts.map((contact, index) => {
                            const stageInfo = STAGES.find(s => s.value === (contact.stage || 'New Lead')) || STAGES[0];
                            const initials = contact.business_name.substring(0, 2).toUpperCase();
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, type: "spring", damping: 25, stiffness: 200 }}
                                    key={contact.id}
                                    className="group bg-white rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 hover:border-slate-200 transition-all active:scale-[0.98]"
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
                                                    value={contact.stage || 'New Lead'} 
                                                    onValueChange={(val) => {
                                                        if (val !== (contact.stage || 'New Lead')) {
                                                            setPendingStage({ id: contact.id, stage: val, currentNote: contact.latest_note || '' });
                                                            setStageNote('');
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className={cn(
                                                        "h-6 w-fit text-[9px] font-black uppercase tracking-[0.1em] rounded-full border-none px-3 bg-opacity-10 shadow-none transition-all focus:ring-0",
                                                        stageInfo.color,
                                                        stageInfo.color.replace('bg-', 'text-')
                                                    )}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-3xl border-slate-100 shadow-2xl p-2">
                                                        {STAGES.map((stage) => (
                                                            <SelectItem 
                                                                key={stage.value} 
                                                                value={stage.value}
                                                                className="text-[12px] font-bold tracking-tight rounded-xl py-2.5 px-4 my-0.5 focus:bg-slate-50"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("h-2 w-2 rounded-full", STAGES.find(s => s.value === stage.value)?.dotColor)} />
                                                                    {stage.label}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{contact.business_type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-3 border-t border-slate-50/50">
                                        <div onClick={() => { setHistoryClientId(contact.id); fetchHistory(contact.id); }} className="flex-1 bg-slate-50/50 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3 active:bg-slate-100 transition-colors overflow-hidden">
                                            <div className="h-5 w-5 sm:h-6 sm:w-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-400" />
                                            </div>
                                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold truncate tracking-tight lowercase first-letter:uppercase italic">
                                                {contact.latest_note || 'No updates yet...'}
                                            </p>
                                        </div>
                                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => openWhatsApp(contact.whatsapp_number)} className="h-10 w-10 rounded-2xl bg-[#f0fdf4] text-[#25d366] flex items-center justify-center border border-[#25d366]/20 shadow-sm">
                                            <WhatsAppIcon className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
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
                {STAGES.find(s => s.value === pendingStage?.stage)?.hint}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder={STAGES.find(s => s.value === pendingStage?.stage)?.placeholder}
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
          <DialogContent className="sm:max-w-lg rounded-3xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Interaction History
              </DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Tracking all status changes and updates for {contacts.find(c => c.id === historyClientId)?.business_name}.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 px-6 py-4">
              {loadingHistory ? (
                <div className="flex flex-col gap-4 py-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              ) : clientHistory.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="p-3 bg-slate-50 rounded-full w-fit mx-auto text-slate-300">
                    <StickyNote className="h-6 w-6" />
                  </div>
                  <p className="text-slate-400 font-medium text-sm">No history found for this client.</p>
                </div>
              ) : (
                <div className="space-y-6 pb-4">
                  {clientHistory.map((item, idx) => {
                    const stageInfo = STAGES.find(s => s.value === item.stage) || STAGES[0];
                    const Icon = stageInfo.icon || HelpCircle;
                    
                    return (
                      <div key={item.id} className="relative flex gap-4 group">
                        {/* Timeline Line */}
                        {idx !== clientHistory.length - 1 && (
                          <div className="absolute left-[21px] top-10 bottom-[-24px] w-[1px] bg-slate-100 group-last:hidden" />
                        )}
                        
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border z-10",
                          stageInfo.color
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 space-y-1 pb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900 tracking-tight">{item.stage}</h4>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest tabular-nums">
                              {formatDate(item.created_at, true)}
                            </span>
                          </div>
                          <div className="py-1">
                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                              {item.note}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Mobile Sidebar Trigger - Premium FAB */}
        <div className="fixed bottom-6 right-6 md:hidden z-50">
            <button
                onClick={() => setOpenMobile(true)}
                className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-400 group border-4 border-white transition-all active:scale-95 hover:scale-105"
                style={{ 
                    opacity: 1, 
                    transform: 'scale(1.1)' 
                }}
            >
                <div style={{ transform: 'rotate(-3.60888deg)' }}>
                    <Menu className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </div>
            </button>
        </div>
      </div>
    </div>
  );
}

