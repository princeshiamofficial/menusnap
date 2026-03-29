"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { getTemplatesFromMySql } from '@/app/actions/orders';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
    MessageSquare, QrCode, ShieldCheck, AlertCircle, RefreshCw, 
    User, Phone, Check, Smartphone, Fingerprint, Activity, 
    CheckCircle, ChevronRight, Home, LayoutDashboard, Layers, 
    Plus, Search, EllipsisVertical, CirclePlus, 
    ArrowLeft, Bold, Italic, Link as LinkIcon, List as ListIcon, 
    Quote, Code, ChevronDown, Edit3, Trash2 
} from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getWhatsAppSettings, saveWhatsAppSettings, WhatsAppSettings } from '@/app/actions/whatsapp-settings';
import { useToast } from '@/hooks/use-toast';
import { getGreetings, addGreeting, updateGreeting, deleteGreeting, GreetingItem } from '@/app/actions/greetings';

export default function WhatsAppDashboard() {
    const { toast } = useToast();
    const [status, setStatus] = useState<string>('connecting');
    const [qr, setQr] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{ id: string; name?: string; avatar?: string | null } | null>(null);
    const [settings, setSettings] = useState<WhatsAppSettings>({
        isEnabled: false,
        isGreetingEnabled: false,
        greetingMessages: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState<'list' | 'add'>('list');
    const [isGreetingsLoading, setIsGreetingsLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newGreeting, setNewGreeting] = useState({ title: "", content: "" });
    const [greetingsList, setGreetingsList] = useState<GreetingItem[]>([]);

    const filteredGreetings = greetingsList.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const socketRef = useRef<any>(null);

    const loadGreetings = useCallback(async () => {
        setIsGreetingsLoading(true);
        const res = await getGreetings();
        if (res.success && res.data) {
            setGreetingsList(res.data);
        }
        setIsGreetingsLoading(false);
    }, []);

    useEffect(() => {
        // Fetch current settings
        getWhatsAppSettings().then(setSettings);
        loadGreetings();
        
        // Fetch templates
        getTemplatesFromMySql().then(res => {
            if (res.success) setTemplates(res.data);
        });

        if (!socketRef.current) {
            // Dynamic Connection Logic
            const isProd = window.location.protocol === 'https:';
            const bridgeUrl = isProd 
                ? `https://${window.location.hostname}` 
                : `http://${window.location.hostname}:9005`;

            console.log(`🔌 Connecting to Bridge (${isProd ? 'Production Proxy' : 'Local Direct'}):`, bridgeUrl);
 
            socketRef.current = io(bridgeUrl, {
                path: '/whatsapp-bridge/socket.io', // Consistent path for both dev and prod
                reconnection: true,
                reconnectionAttempts: Infinity,
                timeout: 20000,
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                console.log('✅ Connected to Bridge. Socket ID:', socket.id);
                // No need to setStatus here, the bridge will emit 'status' event immediately
            });

            socket.on('connect_error', (err: any) => {
                console.error('❌ Bridge Connection Error:', err);
                setStatus('error');
            });

            socket.on('status', (s: string) => {
                console.log('📊 Bridge Status:', s);
                setStatus(s);
            });

            socket.on('qr', (q: string) => {
                console.log('⚡ QR Received');
                setQr(q);
                setStatus('awaiting_qr');
            });

            socket.on('user-info', (info: any) => {
                console.log('👤 Profile info received');
                setUserInfo(info);
            });

            socket.on('disconnect', (reason: string) => {
                console.warn('🔌 Bridge Disconnected:', reason);
                setStatus('disconnected');
            });
        }

        return () => {
            if (socketRef.current) {
                console.log('🔌 Cleaning up socket connection...');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        if (!socketRef.current) return;
        setIsSyncing(true);
        socketRef.current.emit('sync-user-info');
        console.log('🔄 Sync requested...');
        // Reset animation after a few seconds
        setTimeout(() => setIsSyncing(false), 2000);
    };

    const handleSaveGreeting = async () => {
        if (!newGreeting.title || !newGreeting.content) {
            toast({ variant: "destructive", title: "Error", description: "Title and Message are required." });
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                const res = await updateGreeting(editingId, newGreeting.title, newGreeting.content);
                if (res.success) {
                    toast({ title: "Updated", description: "Greeting message updated successfully." });
                    setView('list');
                    loadGreetings();
                    setNewGreeting({ title: "", content: "" });
                    setEditingId(null);
                } else {
                    toast({ variant: "destructive", title: "Error", description: res.error });
                }
            } else {
                const res = await addGreeting(newGreeting.title, newGreeting.content);
                if (res.success) {
                    toast({ title: "Saved", description: "New greeting message added." });
                    setView('list');
                    loadGreetings();
                    setNewGreeting({ title: "", content: "" });
                } else {
                    toast({ variant: "destructive", title: "Error", description: res.error });
                }
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save greeting." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const res = await deleteGreeting(id);
        if (res.success) {
            toast({ title: "Deleted", description: "Greeting message removed." });
            loadGreetings();
        } else {
            toast({ variant: "destructive", title: "Error", description: res.error });
        }
    };

    const handleEdit = (item: GreetingItem) => {
        setNewGreeting({ title: item.title, content: item.content });
        setEditingId(item.id);
        setView('add');
    };

    const formatNumber = (id: string) => {
        return id.split('@')[0].split(':')[0];
    };

    const renderFormattedContent = (content: string) => {
        // Simple regex to detect URLs
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlRegex);

        return (
            <div className="whitespace-pre-wrap leading-relaxed text-[14px]">
                {parts.map((part, i) => (
                    urlRegex.test(part) ? (
                        <a 
                            key={i} 
                            href={part} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-emerald-600 hover:text-emerald-700 hover:underline transition-all font-semibold"
                        >
                            {part}
                        </a>
                    ) : (
                        <span key={i}>{part}</span>
                    )
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] w-full overflow-x-hidden relative selection:bg-primary/10">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none" />
            
            {/* Top Navigation Bar */}
            <div className="fixed top-0 right-0 left-0 md:left-[280px] h-16 bg-white/50 backdrop-blur-xl border-b border-slate-100 z-[40] px-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Link href="/m-admin" className="hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Dashboard
                    </Link>
                    <ChevronRight className="h-3 w-3 opacity-30" />
                    <span className="text-slate-900">WhatsApp Engine</span>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">

                        
                        <div className="flex items-center gap-3">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className={cn(
                                        "inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full px-4 py-1.5 text-[10px] uppercase font-black tracking-widest border-0 ring-1",
                                        status === 'ready' || status === 'authenticated' 
                                            ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20 hover:bg-emerald-100" 
                                            : "bg-rose-50 text-rose-600 ring-rose-500/20 hover:bg-rose-100"
                                    )}>
                                        <MessageSquare className="h-3 w-3 mr-2" />
                                        Greetings
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border shadow-lg duration-200 sm:rounded-3xl max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 bg-gray-50 dark:bg-gray-900 border-none overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {view === 'list' ? (
                                            <motion.div 
                                                key="list-view"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex flex-col h-full"
                                            >
                                                <div className="flex flex-col space-y-1.5 text-center sm:text-left p-8 pb-4">
                                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                        <DialogTitle className="tracking-tight text-3xl font-black text-gray-800 dark:text-gray-100">
                                                            Greeting's
                                                        </DialogTitle>
                                                        <div className="flex w-full sm:w-auto items-center gap-3">
                                                            <div className="relative flex-grow sm:w-72">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input 
                                                                    className="flex w-full border px-3 py-2 text-base md:text-sm pl-10 h-11 rounded-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500/20 shadow-sm" 
                                                                    placeholder="Search questions..." 
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => {
                                                                    setNewGreeting({ title: "", content: "" });
                                                                    setEditingId(null);
                                                                    setView('add');
                                                                }}
                                                                className="inline-flex items-center justify-center gap-2.5 px-6 h-11 rounded-full bg-[#eff2f6] hover:bg-[#e2e8f0] text-[#1e293b] text-sm font-semibold transition-all shrink-0"
                                                            >
                                                                <CirclePlus className="h-4 w-4" />
                                                                <span>Add New</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <ScrollArea className="h-[60vh] w-full px-8 pb-8">
                                                    <div className="w-full space-y-3 pb-4">
                                                        {filteredGreetings.map((item) => (
                                                            <div key={item.id} className="group relative bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
                                                                <Accordion type="single" collapsible className="w-full">
                                                                    <AccordionItem value={item.id.toString()} className="border-b-0">
                                                                        <AccordionTrigger className="flex flex-1 items-center justify-between transition-all px-6 py-5 text-left text-sm font-bold text-gray-700 dark:text-gray-200 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                                                                            {item.title}
                                                                        </AccordionTrigger>
                                                                        <AccordionContent className="px-6 pb-6 pt-1 text-[13px] text-gray-500/90 dark:text-gray-400 font-medium tracking-tight">
                                                                            {renderFormattedContent(item.content)}
                                                                        </AccordionContent>
                                                                    </AccordionItem>
                                                                </Accordion>

                                                                <div className="absolute top-1/2 -translate-y-1/2 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <button className="flex items-center justify-center rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 h-8 w-8 transition-colors">
                                                                                <EllipsisVertical className="h-4 w-4 text-gray-400" />
                                                                            </button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[140px] bg-white/80 backdrop-blur-xl">
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleEdit(item)}
                                                                                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-slate-50 transition-colors"
                                                                            >
                                                                                <Edit3 className="h-4 w-4 text-slate-600" />
                                                                                <span className="text-sm font-semibold text-slate-700">Edit</span>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleDelete(item.id)}
                                                                                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl hover:bg-rose-50 transition-colors group/delete"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 text-rose-500" />
                                                                                <span className="text-sm font-semibold text-rose-500">Delete</span>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        {filteredGreetings.length === 0 && (
                                                            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                                                                <div className="h-16 w-16 bg-slate-100/50 rounded-full flex items-center justify-center mb-4">
                                                                    <Search className="h-8 w-8 opacity-20" />
                                                                </div>
                                                                <p className="font-bold text-xs uppercase tracking-widest">No results found</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="add-view"
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                className="p-8 flex flex-col h-full bg-white dark:bg-gray-900"
                                            >
                                                <div className="mb-8 relative">
                                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                                        {editingId ? "Edit Greeting" : "Add New Greeting"}
                                                    </h2>
                                                    
                                                    <button 
                                                        onClick={() => {
                                                            setView('list');
                                                            setEditingId(null);
                                                            setNewGreeting({ title: "", content: "" });
                                                        }}
                                                        className="absolute top-0 right-0 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                                                    >
                                                        <Plus className="h-5 w-5 rotate-45" />
                                                    </button>
                                                </div>

                                                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700 ml-1">Title</Label>
                                                        <Input 
                                                            placeholder="Enter greeting title" 
                                                            className="h-11 rounded-xl bg-slate-50 border-slate-200/60 shadow-none focus-visible:ring-emerald-500/10 transition-all font-medium text-sm px-4 placeholder:text-slate-300"
                                                            value={newGreeting.title}
                                                            onChange={(e) => setNewGreeting(s => ({ ...s, title: e.target.value }))}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700 ml-1">Message</Label>
                                                        <div className="rounded-xl border border-slate-200/60 overflow-hidden bg-slate-50 flex flex-col group transition-all">
                                                            <Textarea 
                                                                placeholder="Type your message here..." 
                                                                className="min-h-[290px] border-0 focus-visible:ring-0 rounded-none text-sm font-medium leading-relaxed px-4 py-4 resize-none bg-transparent placeholder:text-slate-300"
                                                                value={newGreeting.content}
                                                                onChange={(e) => setNewGreeting(s => ({ ...s, content: e.target.value }))}
                                                            />
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-50">
                                                    <button 
                                                        onClick={() => {
                                                            setView('list');
                                                            setEditingId(null);
                                                            setNewGreeting({ title: "", content: "" });
                                                        }}
                                                        className="px-6 h-11 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-all"
                                                        disabled={isSaving}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={handleSaveGreeting}
                                                        className="px-8 h-11 rounded-xl bg-[#ff7a2e] hover:bg-[#ff6a1e] text-white text-sm font-bold transition-all shadow-md shadow-orange-100 disabled:opacity-50"
                                                        disabled={isSaving}
                                                    >
                                                        {isSaving ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                                        ) : null}
                                                        {isSaving ? "Saving..." : "Save"}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 mb-12">
                    <div>
                        <div className="h-1 w-12 bg-emerald-500 rounded-full mb-6" />
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
                            WhatsApp <span className="text-emerald-500 uppercase italic">Engine</span>
                        </h1>
                        <p className="text-slate-500 font-bold ml-1 uppercase tracking-widest text-[10px]">Private & Secure Local Integration</p>
                    </div>
                    
                    <Badge className={cn(
                        "rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest border shadow-sm",
                        status === 'connected' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                        status === 'awaiting_qr' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                        {status === 'connected' ? `ONLINE • ${userInfo?.name || 'Active'}` : status.replace('_', ' ')}
                    </Badge>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    <Card className="rounded-[2.5rem] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden bg-white/70 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                {status === 'connected' ? <User className="h-5 w-5 text-emerald-500" /> : <QrCode className="h-5 w-5 text-slate-400" />}
                                <div className="flex flex-col">
                                    <span className="text-sm font-black">{status === 'connected' ? 'Active Instance' : 'Connection Session'}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {status === 'connected' ? 'Authenticated & Monitoring' : 'Scan QR Code via WhatsApp Settings'}
                                    </span>
                                </div>
                            </div>
                            {status === 'connected' && (
                                <button 
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-500/10 disabled:opacity-50 group"
                                >
                                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                                    {isSyncing ? 'Syncing...' : 'Sync Profile'}
                                </button>
                            )}
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-12 gap-8">
                            <AnimatePresence mode="wait">
                                {status === 'connected' && userInfo ? (
                                    <motion.div 
                                        key="connected"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center text-center gap-6 w-full"
                                    >
                                        <div className="relative">
                                            <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                                                {userInfo.avatar ? (
                                                    <img src={userInfo.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-10 w-10 text-emerald-600" />
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                                                <Check className="h-4 w-4 stroke-[4]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 w-full">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{userInfo.name || 'WhatsApp Account'}</h3>
                                                <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                                    <Smartphone className="h-3 w-3" />
                                                    {formatNumber(userInfo.id)}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto">
                                                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                    <p className="text-xs font-black text-emerald-600 uppercase">Live</p>
                                                </div>
                                                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bridge</p>
                                                    <p className="text-xs font-black text-slate-600 uppercase">Port 9005</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : qr ? (
                                    <motion.div 
                                        key="qr"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative p-6 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border-4 border-slate-50"
                                    >
                                        <img src={qr} alt="WhatsApp QR Code" className="w-[300px] h-[300px]" />
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center gap-3 text-slate-300"
                                    >
                                        <RefreshCw className="h-12 w-12 animate-spin-slow" />
                                        <p className="font-bold text-xs uppercase tracking-widest">Waiting for bridge...</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Logic Summary */}
                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            {status === 'connected' ? (
                                <motion.div
                                    key="info"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <Card className="rounded-[2.5rem] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] bg-white/70 backdrop-blur-xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-emerald-500" />
                                                Instance Status
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                        <Fingerprint className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Instance ID</p>
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-400 font-bold">{userInfo?.id.split(':')[0] || 'Unknown'}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                        <Activity className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Connection</p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase">WebSocket Active</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                        <ShieldCheck className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Privacy</p>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">End-to-End Encrypted</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="steps"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <Card className="rounded-[2.5rem] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] bg-white/70 backdrop-blur-xl">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-black tracking-tight">How it works</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 shrink-0 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-black">1</div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Initialize Bridge</h4>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Our local Node.js bridge initializes a WhatsApp WebSocket directly from your server.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 shrink-0 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center font-black">2</div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Direct Tunneling</h4>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Instead of GreenAPI, messages are now tunneled via your own bridge—completely bypassing third-party limits.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 shrink-0 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center font-black">3</div>
                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Unlimited Messaging</h4>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed font-bold">You can send unlimited messages across unlimited chats for FREE.</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>
            </div>
        </div>
    );
}

