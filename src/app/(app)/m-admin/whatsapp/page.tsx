"use client";

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, QrCode, ShieldCheck, AlertCircle, RefreshCw, User, Phone, Check, Smartphone, Fingerprint, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function WhatsAppDashboard() {
    const [status, setStatus] = useState<string>('connecting');
    const [qr, setQr] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{ id: string; name?: string; avatar?: string | null } | null>(null);

    const socketRef = useRef<any>(null);

    useEffect(() => {
        if (!socketRef.current) {
            const bridgeUrl = `https://${window.location.hostname}`;
            console.log('🔌 Connecting to Bridge (Secure Proxy):', bridgeUrl);

            socketRef.current = io(bridgeUrl, {
                path: '/whatsapp-bridge/socket.io',
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
                console.log('👤 User Info:', info);
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

    const formatNumber = (id: string) => {
        return id.split('@')[0].split(':')[0];
    };

    return (
        <div className="min-h-screen bg-[#fafbfc] w-full overflow-x-hidden relative selection:bg-primary/10">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none" />
            
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 mb-12">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">WhatsApp Engine</h1>
                        </div>
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

                        <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100 flex gap-4">
                            <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-xs font-black text-amber-700 uppercase tracking-tighter">Security Recommendation</p>
                                <p className="text-[10px] text-amber-600/80 font-bold leading-relaxed uppercase tracking-widest">Only use this bridge with a single authenticated session. Avoid bulk spamming to keep your number safe from bans.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

