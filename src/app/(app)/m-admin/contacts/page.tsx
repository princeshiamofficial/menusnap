
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
  Smartphone,
  CheckCircle2,
  ExternalLink
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { getLeads } from '@/app/actions/clients';
import { useAdminAuth } from '@/hooks/use-admin-auth';

interface Contact {
  id: number;
  business_name: string;
  business_type: string;
  whatsapp_number: string;
  last_login: string;
  created_at: string;
}

export default function ContactsPage() {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const { toast } = useToast();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getLeads(); // Keep server action name as is or rename if asked
      if (result.success) {
        setContacts(result.leads as Contact[]);
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
    }
  }, [toast]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchContacts();
    }
  }, [fetchContacts, isAdminLoggedIn]);

  const filteredContacts = useMemo(() => {
    return contacts
      .filter(contact => 
        contact.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.whatsapp_number.includes(searchTerm)
      )
      .sort((a, b) => {
        const dateA = new Date(a.last_login).getTime();
        const dateB = new Date(b.last_login).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [contacts, searchTerm, sortOrder]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy • h:mm a");
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Monitor and manage clients who logged into MenuSnap.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 bg-primary/5 border-primary/20 text-primary font-semibold">
                Total Contacts: {contacts.length}
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchContacts} disabled={loading} className="gap-2">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg">Contact Directory</CardTitle>
                <CardDescription>View all businesses registered via WhatsApp login.</CardDescription>
              </div>
              <div className="relative w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search name or number..." 
                  className="pl-9 bg-background focus-visible:ring-primary shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead className="w-[60px] text-center font-bold">#</TableHead>
                    <TableHead className="font-bold">Business Entity</TableHead>
                    <TableHead className="font-bold">WhatsApp Contact</TableHead>
                    <TableHead className="font-bold cursor-pointer hover:text-primary transition-colors" onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                      <div className="flex items-center gap-1">
                        Last Activity
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right font-bold pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48 mb-2" /><Skeleton className="h-3 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                        No contacts found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact, index) => (
                      <TableRow key={contact.id} className="group hover:bg-muted/40 transition-colors">
                        <TableCell className="text-center font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm tracking-tight capitalize">{contact.business_name}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] uppercase font-bold bg-primary/5 text-primary border-primary/10">
                                    {contact.business_type}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    Joined {format(new Date(contact.created_at), "MMM d")}
                                </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                <MessageCircle className="h-3.5 w-3.5 text-green-500 fill-green-500/10" />
                                <span className="tabular-nums tracking-tight">{contact.whatsapp_number}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(contact.last_login)}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-200/50 shadow-sm"
                            onClick={() => openWhatsApp(contact.whatsapp_number)}
                          >
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            Message
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="space-y-6">
            <Card className="border-green-100 bg-green-50/20 shadow-sm">
                <CardHeader className="pb-3 border-b border-green-100">
                    <CardTitle className="text-md flex items-center gap-2 text-green-700 font-bold uppercase tracking-wider text-xs">
                        <Smartphone className="h-4 w-4" />
                        Quick Action
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <p className="text-sm text-green-700/80 font-medium leading-relaxed">
                        These contacts are verified via <strong>Green API</strong> WhatsApp checks. You can directly contact them on WhatsApp to offer premium services.
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-white/80 border border-green-100 rounded-lg shadow-inner">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-xs font-bold text-green-800">100% Verified WhatsApp Contacts</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/10 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary/60">System Notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Smartphone className="h-4 w-4 mt-0.5 text-primary" />
                        <div>
                            <p className="text-sm font-bold leading-tight">Last activity sync</p>
                            <p className="text-xs text-muted-foreground italic">Real-time sync active</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
