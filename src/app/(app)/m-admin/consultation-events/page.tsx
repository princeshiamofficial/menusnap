"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  Search,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ChevronDown,
  StickyNote,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getBookings, updateBookingStatus, deleteBooking } from "@/app/actions/bookings";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

type Booking = {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
  status: string;
  created_at: string;
};

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600 border-amber-100", icon: AlertCircle },
  confirmed: { label: "Confirmed", className: "bg-blue-50 text-blue-600 border-blue-100", icon: CheckCircle2 },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-100", icon: XCircle },
};

export default function ConsultationEventsPage() {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      } else {
        toast({ title: "Error", description: res.error || "Failed to load bookings.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network Error", description: "Could not connect to the server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdminLoggedIn) fetchBookings();
  }, [isAdminLoggedIn, fetchBookings]);

  const handleStatusChange = async (id: number, status: string) => {
    setUpdatingId(id);
    const res = await updateBookingStatus(id, status);
    if (res.success) {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      toast({ title: "Status updated", description: `Booking marked as ${status}.` });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setUpdatingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteBooking(deleteId);
    if (res.success) {
      setBookings((prev) => prev.filter((b) => b.id !== deleteId));
      toast({ title: "Deleted", description: "Booking record removed." });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setDeleteId(null);
  };

  const openWhatsApp = (number: string) => {
    const clean = number.replace(/\D/g, "");
    const final = clean.startsWith("01") ? "88" + clean : clean;
    window.open(`https://wa.me/${final}`, "_blank");
  };

  const formatDate = (dateStr: string) => {
    try { return format(new Date(dateStr), "MMM d, yyyy • h:mm a"); } catch { return dateStr; }
  };

  const filtered = bookings.filter((b) => {
    const s = searchTerm.toLowerCase();
    return (
      b.name.toLowerCase().includes(s) ||
      b.email.toLowerCase().includes(s) ||
      b.whatsapp.includes(s) ||
      b.booking_date.includes(s)
    );
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  if (adminLoading || (loading && bookings.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-slate-900" />
        </div>
        <p className="text-slate-500 font-bold tracking-tight animate-pulse">Loading Consultations...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 min-w-0 w-full max-w-full overflow-x-hidden">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-in fade-in duration-500 w-full max-w-full overflow-x-hidden">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 shrink-0">
                <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="truncate">Consultation Events</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
              Manage Free Design Strategy Call bookings from your landing page.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            disabled={loading}
            className="gap-2 rounded-full h-10 px-5 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold text-xs sm:text-sm w-full md:w-auto"
          >
            <RefreshCw className={cn("h-4 w-4 shrink-0", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Bookings", value: stats.total, color: "bg-slate-900 text-white", icon: Users },
            { label: "Pending", value: stats.pending, color: "bg-amber-50 text-amber-600", icon: AlertCircle },
            { label: "Confirmed", value: stats.confirmed, color: "bg-blue-50 text-blue-600", icon: CheckCircle2 },
            { label: "Completed", value: stats.completed, color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
          ].map((stat) => (
            <div key={stat.label} className={cn("rounded-2xl p-4 flex items-center gap-3", stat.color)}>
              <stat.icon className="h-5 w-5 shrink-0 opacity-80" />
              <div>
                <p className="text-2xl font-black leading-none">{stat.value}</p>
                <p className="text-[11px] font-semibold opacity-70 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white w-full">
          <CardHeader className="px-5 sm:px-6 py-5 border-b border-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Booking Directory</CardTitle>
                <CardDescription className="text-slate-400 font-medium text-sm">
                  {filtered.length} of {bookings.length} records
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  placeholder="Search by name, email, phone..."
                  className="pl-10 h-11 w-full bg-slate-50/50 border-slate-200 rounded-2xl focus-visible:ring-slate-900 focus-visible:ring-offset-0 placeholder:text-slate-400 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[50px] text-center font-bold text-[11px] uppercase tracking-widest text-slate-400 pl-6 py-5">#</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Client</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Schedule</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Notes</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Booked On</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Status</TableHead>
                    <TableHead className="text-right font-bold text-[11px] uppercase tracking-widest text-slate-400 pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Records...</p>
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-5 bg-slate-50 rounded-3xl text-slate-200">
                            <CalendarCheck className="h-10 w-10" />
                          </div>
                          <div>
                            <p className="text-slate-900 font-extrabold text-lg">No bookings found</p>
                            <p className="text-slate-400 font-medium text-sm">
                              {searchTerm ? `No matches for "${searchTerm}"` : "Bookings will appear here as they come in."}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((booking, idx) => {
                      const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                      const StatusIcon = statusConfig.icon;
                      return (
                        <TableRow key={booking.id} className="group border-slate-50 hover:bg-slate-50/50 transition-all duration-200">
                          <TableCell className="text-center font-mono text-[11px] text-slate-300 group-hover:text-slate-500 pl-6">
                            {(idx + 1).toString().padStart(2, "0")}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-800 text-sm">{booking.name}</span>
                              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[160px]">{booking.email}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                <WhatsAppIcon className="h-3 w-3 text-[#25D366]" />
                                <span>{booking.whatsapp}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                <Calendar className="h-3.5 w-3.5 text-[#F07C22]" />
                                {booking.booking_date}
                              </div>
                              <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                                <Clock className="h-3 w-3 text-slate-300" />
                                {booking.booking_time}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            {booking.notes ? (
                              <p className="text-[13px] text-slate-500 font-medium truncate">{booking.notes}</p>
                            ) : (
                              <span className="text-slate-300 text-xs font-semibold italic">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-[12px] text-slate-400 font-bold whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-slate-300" />
                              {formatDate(booking.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  disabled={updatingId === booking.id}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border transition-all hover:opacity-80",
                                    statusConfig.className
                                  )}
                                >
                                  {updatingId === booking.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <StatusIcon className="h-3 w-3" />
                                  )}
                                  {statusConfig.label}
                                  <ChevronDown className="h-3 w-3 opacity-60" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="rounded-2xl shadow-xl border-slate-100 p-1 min-w-[160px]">
                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                  <DropdownMenuItem
                                    key={key}
                                    onClick={() => handleStatusChange(booking.id, key)}
                                    className={cn("rounded-xl font-semibold text-sm cursor-pointer gap-2 my-0.5", booking.status === key && "bg-slate-50")}
                                  >
                                    <cfg.icon className="h-4 w-4" />
                                    {cfg.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100 group-hover:border-emerald-200"
                                onClick={() => openWhatsApp(booking.whatsapp)}
                              >
                                <WhatsAppIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 group-hover:border-red-200"
                                onClick={() => setDeleteId(booking.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4 pb-24">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="p-5 bg-slate-50 rounded-3xl text-slate-200">
                    <CalendarCheck className="h-10 w-10" />
                  </div>
                  <p className="text-slate-900 font-extrabold">No bookings found</p>
                  <p className="text-slate-400 font-medium text-sm">
                    {searchTerm ? `No matches for "${searchTerm}"` : "Bookings will appear here."}
                  </p>
                </div>
              ) : (
                filtered.map((booking, idx) => {
                  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 hover:border-slate-200 transition-all"
                    >
                      {/* Top Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-sm font-black shadow-md shrink-0">
                            {booking.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-base leading-tight">{booking.name}</p>
                            <p className="text-xs text-slate-400 font-semibold">{booking.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openWhatsApp(booking.whatsapp)}
                            className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 active:scale-90 transition-all"
                          >
                            <WhatsAppIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(booking.id)}
                            className="h-9 w-9 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center border border-red-100 active:scale-90 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Schedule Info */}
                      <div className="flex items-center gap-4 mb-3 bg-slate-50 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          <Calendar className="h-4 w-4 text-[#F07C22]" />
                          {booking.booking_date}
                        </div>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <Clock className="h-4 w-4 text-slate-300" />
                          {booking.booking_time}
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="mb-3 bg-amber-50/50 border border-amber-100/60 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">
                            <StickyNote className="h-3 w-3" />
                            Notes
                          </div>
                          <p className="text-slate-600 text-xs font-medium leading-relaxed">{booking.notes}</p>
                        </div>
                      )}

                      {/* Status + Booked On */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              disabled={updatingId === booking.id}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border",
                                statusConfig.className
                              )}
                            >
                              {updatingId === booking.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <StatusIcon className="h-3 w-3" />}
                              {statusConfig.label}
                              <ChevronDown className="h-3 w-3 opacity-60" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="rounded-2xl shadow-xl border-slate-100 p-1 min-w-[150px]">
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                              <DropdownMenuItem
                                key={key}
                                onClick={() => handleStatusChange(booking.id, key)}
                                className="rounded-xl font-semibold text-sm cursor-pointer gap-2 my-0.5"
                              >
                                <cfg.icon className="h-4 w-4" />
                                {cfg.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border-slate-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-extrabold text-xl">Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This action cannot be undone. The booking record will be permanently deleted from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-full font-bold border-slate-200 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-red-500 hover:bg-red-600 font-bold shadow-lg shadow-red-200"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
