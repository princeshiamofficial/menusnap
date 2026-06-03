"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  ClipboardList, 
  Search, 
  RefreshCw, 
  Loader2, 
  Filter, 
  ArrowUpDown, 
  MessageSquare, 
  Zap, 
  Calendar, 
  Phone, 
  Building2, 
  Globe,
  MoreVertical,
  Layers,
  Sparkles,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getAllResponses } from "@/app/actions/responses";
import { useAdminAuth } from '@/hooks/use-admin-auth';

// WhatsApp Icon Component
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const TableRowSkeleton = () => (
  <TableRow className="border-slate-50">
    <TableCell className="pl-6 py-4 text-center">
      <Skeleton className="h-4 w-6 mx-auto rounded" />
    </TableCell>
    <TableCell className="py-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-5 w-32 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </TableCell>
    <TableCell className="py-4">
      <Skeleton className="h-4 w-28 rounded" />
    </TableCell>
    <TableCell className="py-4">
      <Skeleton className="h-6 w-20 rounded-full" />
    </TableCell>
    <TableCell className="py-4">
      <Skeleton className="h-4 w-36 rounded" />
    </TableCell>
    <TableCell className="py-4">
      <Skeleton className="h-4 w-28 rounded" />
    </TableCell>
    <TableCell className="text-right pr-6 py-4">
      <Skeleton className="h-9 w-9 rounded-full ml-auto" />
    </TableCell>
  </TableRow>
);

const MobileCardSkeleton = () => (
  <div className="bg-white rounded-[2rem] p-5 border border-slate-100 space-y-4 shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-[1.25rem]" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-10 rounded-2xl" />
    </div>
    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50 space-y-2">
      <Skeleton className="h-3.5 w-16" />
      <Skeleton className="h-4 w-full rounded" />
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-2 w-2 rounded-full" />
    </div>
  </div>
);

export default function ResponsesPage() {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    hiring: any[];
    freeDesign: any[];
    teamTracker: any[];
  }>({
    hiring: [],
    freeDesign: [],
    teamTracker: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const { toast } = useToast();

  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllResponses();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast({
          title: "Error fetching responses",
          description: res.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to fetch responses:", err);
      toast({
        title: "Network Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchResponses();
    }
  }, [isAdminLoggedIn, fetchResponses]);

  const filterResponses = (list: any[]) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return list.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return list.filter(item => 
      item.business_name?.toLowerCase().includes(search) || 
      item.whatsapp_number?.includes(search)
    ).sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy • h:mm a");
    } catch {
      return dateString;
    }
  };

  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    const finalNumber = cleanNumber.startsWith('01') ? '88' + cleanNumber : cleanNumber;
    window.open(`https://wa.me/${finalNumber}`, '_blank');
  };



  const totalCount = data.hiring.length + data.freeDesign.length + data.teamTracker.length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 min-w-0 w-full max-w-full overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full max-w-full overflow-x-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 shrink-0">
                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="truncate">Service Responses</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
              Manage and track incoming service requests from potential clients.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 flex-1 sm:flex-none">
              {adminLoading || loading ? (
                <Skeleton className="h-9 w-32 rounded-full bg-slate-200" />
              ) : (
                <div className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-slate-200 flex-1 sm:flex-none whitespace-nowrap">
                  {totalCount} Total Requests
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchResponses} 
              disabled={loading} 
              className="gap-2 rounded-full h-10 px-5 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap"
            >
              <RefreshCw className={cn("h-4 w-4 shrink-0", loading && "animate-spin")} />
              Sync Requests
            </Button>
          </div>
        </div>

        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white w-full">
          <CardHeader className="px-5 sm:px-6 py-6 border-b border-slate-50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 w-full">
              <div className="flex flex-col gap-0.5 min-w-0">
                <CardTitle className="text-xl font-bold text-slate-800 truncate">Request Directory</CardTitle>
                <CardDescription className="text-slate-400 font-medium break-words text-sm sm:text-base">Real-time tracking of hiring, design, and tracker requests.</CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                {/* Search Input */}
                <div className="relative w-full lg:w-72 group shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <Input 
                    placeholder="Search by business or phone..." 
                    className="pl-10 h-11 w-full bg-slate-50/50 border-slate-200 rounded-2xl focus-visible:ring-slate-900 focus-visible:ring-offset-0 transition-all placeholder:text-slate-400 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="free-design" className="w-full">
              <div className="px-5 sm:px-6 py-4 bg-slate-50/30 border-b border-slate-50">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 w-full sm:w-auto overflow-x-auto no-scrollbar justify-start">
                  <TabsTrigger value="free-design" className="rounded-xl px-4 sm:px-6 font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2">
                    Free Design
                    <Badge variant="secondary" className="rounded-full bg-slate-200/50 text-slate-600 border-none px-2 py-0 h-5">
                      {data.freeDesign.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="team-tracker" className="rounded-xl px-4 sm:px-6 font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2">
                    Team Tracker
                    <Badge variant="secondary" className="rounded-full bg-slate-200/50 text-slate-600 border-none px-2 py-0 h-5">
                      {data.teamTracker.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="hiring" className="rounded-xl px-4 sm:px-6 font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2">
                    Hiring
                    <Badge variant="secondary" className="rounded-full bg-slate-200/50 text-slate-600 border-none px-2 py-0 h-5">
                      {data.hiring.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="free-design" className="mt-0">
                <ResponseTable 
                  items={filterResponses(data.freeDesign)} 
                  type="free-design" 
                  formatDate={formatDate}
                  openWhatsApp={openWhatsApp}
                  loading={loading}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="team-tracker" className="mt-0">
                <ResponseTable 
                  items={filterResponses(data.teamTracker)} 
                  type="team-tracker" 
                  formatDate={formatDate}
                  openWhatsApp={openWhatsApp}
                  loading={loading}
                  searchTerm={searchTerm}
                />
              </TabsContent>

              <TabsContent value="hiring" className="mt-0">
                <ResponseTable 
                  items={filterResponses(data.hiring)} 
                  type="hiring" 
                  formatDate={formatDate}
                  openWhatsApp={openWhatsApp}
                  loading={loading}
                  searchTerm={searchTerm}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResponseTable({ items, type, formatDate, openWhatsApp, loading, searchTerm }: any) {
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-20 px-6">
      <div className="p-5 bg-slate-50 rounded-3xl text-slate-200">
        <Search className="h-10 w-10" />
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-extrabold text-lg">No responses found</p>
        <p className="text-slate-400 font-medium text-sm">
          {searchTerm ? `No matches for "${searchTerm}"` : "Requests will appear here as they come in."}
        </p>
      </div>
    </div>
  );



  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-30 shadow-sm border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[60px] text-center font-bold text-[11px] uppercase tracking-widest text-slate-400 pl-6 py-5">SL</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Business Name</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">WhatsApp</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">
                {type === 'hiring' ? 'Designation' : 'Type'}
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">
                {type === 'hiring' ? 'Requirement' : type === 'team-tracker' ? 'Goal' : 'Design Needs'}
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Timestamp</TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-widest text-slate-400 pr-6">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))
            ) : items.length > 0 ? (
              items.map((item: any, index: number) => (
                <ResponseRow 
                  key={item.id} 
                  item={item} 
                  index={index + 1} 
                  type={type}
                  formatDate={formatDate}
                  onWhatsAppClick={() => openWhatsApp(item.whatsapp_number)}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden p-4 space-y-4 pb-20">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <MobileCardSkeleton key={index} />
          ))
        ) : items.length > 0 ? (
          items.map((item: any, index: number) => (
            <MobileResponseCard 
              key={item.id} 
              item={item} 
              index={index}
              type={type}
              formatDate={formatDate}
              onWhatsAppClick={() => openWhatsApp(item.whatsapp_number)}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function ResponseRow({ item, index, type, formatDate, onWhatsAppClick }: any) {
  const getBadgeStyles = (val: string) => {
    const v = val?.toLowerCase() || '';
    // Restaurant related
    if (v.includes('restaurant') || v.includes('chef') || v.includes('waiter') || v.includes('cashier')) {
      return 'bg-orange-50 text-orange-600 border-orange-100';
    }
    // Parlor related
    if (v.includes('parlour') || v.includes('beauty') || v.includes('beautician') || v.includes('makeup') || v.includes('receptionist')) {
      return 'bg-purple-50 text-purple-600 border-purple-100';
    }
    // General Manager (could be either, defaults to slate or indigo)
    if (v.includes('manager')) {
      return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    }
    if (v.includes('cafe')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (v.includes('shop') || v.includes('store')) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <TableRow className="group border-slate-50 hover:bg-slate-50/50 transition-all duration-200">
      <TableCell className="text-center font-mono text-[11px] text-slate-300 group-hover:text-slate-500 pl-6 transition-colors">
        {index.toString().padStart(2, '0')}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm tracking-tight capitalize">{item.business_name}</span>
          {type === 'hiring' && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.designation || 'General'}</span>}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 tabular-nums">
          <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
          {item.whatsapp_number}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("px-3 py-0.5 text-[10px] uppercase font-black rounded-full border-none shadow-sm", getBadgeStyles(item.business_type || item.designation || ''))}>
          {item.business_type || item.designation || 'General'}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[250px]">
        <p className="text-[13px] text-slate-500 font-medium truncate group-hover:text-slate-900 transition-colors leading-relaxed">
          {type === 'hiring' ? item.requirement : type === 'team-tracker' ? item.goal : item.required_design?.replace(/_/g, ' ')}
        </p>
      </TableCell>
      <TableCell className="text-[12px] text-slate-400 font-bold whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          {formatDate(item.created_at)}
        </div>
      </TableCell>
      <TableCell className="text-right pr-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100 group-hover:border-emerald-200"
          onClick={onWhatsAppClick}
        >
          <WhatsAppIcon className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function MobileResponseCard({ item, index, type, formatDate, onWhatsAppClick }: any) {
  const initials = item.business_name?.substring(0, 2).toUpperCase() || '??';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 hover:border-slate-200 transition-all relative overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[1.25rem] bg-slate-900 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-slate-200 shrink-0">
            {initials}
          </div>
          <div className="space-y-0.5 min-w-0">
            <h3 className="font-black text-slate-900 text-lg leading-tight truncate capitalize">{item.business_name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-2 py-0 h-5 text-[9px] uppercase font-black bg-slate-100 text-slate-500 border-none rounded-full">
                {item.business_type || item.designation || 'General'}
              </Badge>
              <span className="text-slate-200 text-[10px]">•</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 tabular-nums">
                <WhatsAppIcon className="h-2.5 w-2.5 text-[#25D366]" />
                {item.whatsapp_number}
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={onWhatsAppClick}
          className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 active:scale-90 transition-all"
        >
          <WhatsAppIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-50">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {type === 'hiring' ? 'Requirement' : type === 'team-tracker' ? 'Goal' : 'Required Design'}
          </span>
        </div>
        <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
          {type === 'hiring' ? item.requirement : type === 'team-tracker' ? item.goal : item.required_design?.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Calendar className="h-3 w-3" />
          {formatDate(item.created_at)}
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </motion.div>
  );
}
