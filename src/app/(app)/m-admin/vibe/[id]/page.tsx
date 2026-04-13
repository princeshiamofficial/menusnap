
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    Sparkles, 
    Undo2, 
    Palette, 
    Zap, 
    Layout, 
    Maximize2, 
    Type,
    Image as ImageIcon,
    Save,
    Share2,
    Eye,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrderByIdFromMySql } from '@/app/actions/orders';
import { decodeHtmlEntities } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

export default function VibeModePage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            const result = await getOrderByIdFromMySql(id as string);
            if (result.success) {
                setOrder(result.data);
            }
            setLoading(false);
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <Skeleton className="h-12 w-64 mb-4" />
                <Skeleton className="h-[60vh] w-full max-w-5xl rounded-3xl" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
                <AlertCircle className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Order not found</h1>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 selection:text-primary-foreground">
            {/* Glossy Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => router.back()}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Vibe Mode
                            </h1>
                            <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-tighter sm:tracking-widest font-bold">
                                {decodeHtmlEntities(order.customer?.restaurant)} • {order.orderId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="hidden sm:flex text-white/60 hover:text-white hover:bg-white/10 gap-2">
                            <Eye className="h-4 w-4" /> Preview
                        </Button>
                        <Button className="bg-primary text-white hover:bg-primary/90 gap-2 h-8 sm:h-10 px-3 sm:px-6 rounded-full font-bold shadow-lg shadow-primary/20">
                            <Save className="h-4 w-4" /> <span className="hidden sm:inline">Save Design</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-8 grid lg:grid-cols-[1fr_350px] gap-8">
                {/* Canvas Area */}
                <div className="relative group">
                    {/* Floating Controls */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1.5 bg-background/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white/60 hover:text-white rounded-xl"><Maximize2 className="h-5 w-5" /></Button>
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white/60 hover:text-white rounded-xl"><Layout className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white/60 hover:text-white rounded-xl"><Palette className="h-5 w-5" /></Button>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto lg:h-[75vh] w-full bg-[#111] rounded-[2rem] sm:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl overflow-y-auto no-scrollbar"
                    >
                        {/* Interactive Grid Background */}
                        <div className="absolute inset-0 bg-[url('/vibe-docs-grid.png')] bg-cover bg-center mix-blend-overlay opacity-20 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-orange-500/5 pointer-events-none" />

                        <div className="relative p-8 sm:p-16 flex flex-col items-center justify-center h-full text-center">
                            <div className="w-24 h-24 mb-8 relative">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <Sparkles className="h-20 w-20 text-primary opacity-20 blur-xl" />
                                </motion.div>
                                <Sparkles className="h-24 w-24 text-primary relative z-10" />
                            </div>
                            
                            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4">
                                Vibe <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Unleashed</span>
                            </h2>
                            <p className="max-w-md text-white/40 text-sm sm:text-lg mb-8 leading-relaxed">
                                You are now in the experimental Vibe Mode. Craft beautiful menu styles and experience next-gen document aesthetics.
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer">
                                    <Zap className="h-4 w-4 text-orange-400" /> Auto Vibe
                                </div>
                                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-primary">
                                    <Palette className="h-4 w-4" /> Style Creator
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Sidebar */}
                <aside className="space-y-6">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Presets</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {['Ethereal', 'Cyberpunk', 'Minimal', 'Lush'].map((preset) => (
                                <button key={preset} className="p-4 bg-white/5 hover:bg-primary/20 border border-white/5 rounded-2xl transition-all group">
                                    <div className="h-2 w-8 bg-white/10 group-hover:bg-primary mb-2 rounded-full" />
                                    <p className="text-xs font-bold text-white/60 group-hover:text-white">{preset}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="absolute -right-4 -top-4">
                            <Sparkles className="h-24 w-24 text-primary opacity-10 group-hover:scale-125 transition-transform" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-[2px] text-primary mb-2">Editor's Pick</h4>
                        <p className="text-xl font-bold leading-tight">Apply "Neo-Orange" Glossy Vibe</p>
                        <p className="text-xs text-primary/60 mt-2">Recommended for {decodeHtmlEntities(order.customer?.restaurant)}</p>
                    </div>

                    <div className="p-6 space-y-4">
                         <h4 className="text-xs font-black uppercase tracking-[2px] text-white/20">Coming Features</h4>
                         {[
                            { icon: Type, label: 'Custom Typography' },
                            { icon: ImageIcon, label: 'Asset Library' },
                            { icon: Share2, label: 'Direct Export' }
                         ].map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-3 text-white/30">
                                <Icon className="h-4 w-4" />
                                <span className="text-xs font-bold">{label}</span>
                            </div>
                         ))}
                    </div>
                </aside>
            </main>
        </div>
    );
}

function AlertCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    );
}
