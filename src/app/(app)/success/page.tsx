
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  ArrowRight, 
  Home, 
  MessageCircle, 
  Sparkles,
  Zap,
  Users,
  Palette
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    setType(searchParams.get('type'));
  }, [searchParams]);

  const getContent = () => {
    switch (type) {
      case 'hiring':
        return {
          icon: <Users className="h-8 w-8" />,
          title: "Hiring Request Received!",
          description: "We've received your request for professional staff. Our recruitment team will review your requirements and get back to you with the best candidates.",
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-100"
        };
      case 'free-design':
        return {
          icon: <Palette className="h-8 w-8" />,
          title: "Design Slot Booked!",
          description: "Congratulations! Your free professional design slot has been successfully reserved. Our design experts will reach out to discuss your brand vision.",
          color: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-100"
        };
      case 'team-tracker':
        return {
          icon: <Zap className="h-8 w-8" />,
          title: "Tracker Setup Initiated!",
          description: "Your request for Team Tracker has been logged. We'll help you set up the ultimate monitoring system for your business efficiency.",
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100"
        };
      case 'consultation':
        return {
          icon: <MessageCircle className="h-8 w-8" />,
          title: "Consultation Booked!",
          description: "Your strategic consultation session has been scheduled. Our growth experts will contact you shortly to confirm the best time for our call.",
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100"
        };
      default:
        return {
          icon: <CheckCircle2 className="h-8 w-8" />,
          title: "Request Submitted!",
          description: "Thank you for reaching out. Your request has been successfully processed. We will contact you shortly via WhatsApp or Phone.",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100"
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10"
      >
        <Card className="p-8 md:p-12 border-slate-200/60 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white/80 backdrop-blur-xl text-center space-y-8">
          
          {/* Animated Icon Container */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className={`h-24 w-24 rounded-3xl ${content.bg} ${content.color} flex items-center justify-center shadow-inner border ${content.border} relative`}
            >
              {content.icon}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute inset-0 rounded-3xl ${content.bg} -z-10`}
              />
              <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-yellow-400 animate-pulse" />
            </motion.div>
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight"
            >
              {content.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 font-medium text-lg leading-relaxed max-w-md mx-auto"
            >
              {content.description}
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 group flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              Go to Dashboard
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.open('https://wa.me/8801682328830', '_blank')}
              className="w-full h-14 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              Talk to Expert
            </Button>
          </motion.div>

          {/* Footer Note */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-slate-400 text-sm font-semibold uppercase tracking-[0.2em] pt-4"
          >
            MenuSnap • Premium Service
          </motion.p>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><CheckCircle2 className="h-12 w-12 animate-pulse text-slate-200" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
