
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
  Globe
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { getLeads, updateClientNote } from '@/app/actions/clients';
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
  note: string | null;
  last_login: string;
  created_at: string;
}

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
  const { toast } = useToast();

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

  if (adminLoading) {
    return <div className="p-8 flex items-center justify-center h-[50vh]"><RefreshCw className="animate-spin mr-2 h-6 w-6 text-primary" /> Loading Admin...</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200">
              <Users className="h-6 w-6" />
            </div>
            Contacts
          </h1>
          <p className="text-slate-500 font-medium ml-1">
            Manage your customer base and track interactions.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 mr-2">
                {timezone && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-inner">
                        <Globe className="h-3 w-3" />
                        Viewing in {timezone}
                    </div>
                )}
                <div className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg shadow-slate-200">
                    {totalContacts} Total
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="gap-2 rounded-full h-10 px-5 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Sync Data
            </Button>
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex flex-col gap-0.5">
                <CardTitle className="text-xl font-bold text-slate-800">Customer Directory</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Real-time client synchronization with WhatsApp validation.</CardDescription>
              </div>
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <Input 
                  placeholder="Search clients..." 
                  className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-2xl focus-visible:ring-slate-900 focus-visible:ring-offset-0 transition-all placeholder:text-slate-400 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)] min-h-[500px] w-full">
              <Table>
                <TableHeader className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[60px] text-center font-bold text-[11px] uppercase tracking-widest text-slate-400 pl-8">SL</TableHead>
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
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400 w-64">Notes</TableHead>
                    <TableHead className="text-right font-bold text-[11px] uppercase tracking-widest text-slate-400 pr-8">Contact</TableHead>
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
                        <TableCell><Skeleton className="h-8 w-full rounded-lg" /></TableCell>
                        <TableCell className="text-right pr-8"><Skeleton className="h-10 w-28 ml-auto rounded-full" /></TableCell>
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
                        <TableCell className="text-center font-mono text-xs text-slate-300 group-hover:text-slate-500 pl-8 transition-colors">
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
                          <div className="relative group/note max-w-xs">
                            <Input 
                              placeholder="Add a quick note..." 
                              defaultValue={contact.note || ''}
                              className="h-9 text-[13px] border-transparent bg-transparent hover:bg-white focus:bg-white hover:border-slate-200 focus:border-slate-300 focus:ring-0 transition-all font-medium rounded-xl placeholder:text-slate-300"
                              onBlur={(e) => {
                                if (e.target.value !== (contact.note || '')) {
                                  handleNoteUpdate(contact.id, e.target.value);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                            />
                            <StickyNote className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-200 opacity-0 group-hover/note:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-8">
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
                  {hasMore && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0 border-none">
                        <div ref={observerTarget} className="h-10 flex items-center justify-center w-full">
                          {loadingMore && <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
    </div>
  );
}

