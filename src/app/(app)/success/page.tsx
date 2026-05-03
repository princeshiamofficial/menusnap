"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowRight,
  Home,
  MessageCircle,
  Zap,
  Users,
  Palette
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    setType(searchParams.get('type'));

    // Celebratory Confetti Burst
    const end = Date.now() + 3 * 1000;
    const colors = ['#0f172a', '#10b981', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        zIndex: 9999
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        zIndex: 9999
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [searchParams]);

  const getContent = () => {
    switch (type) {
      case 'hiring':
        return {
          icon: <Users className="h-10 w-10" />,
          title: "Hiring Request Received",
          description: "We've received your request for professional staff. Our recruitment team will review your requirements and get back to you shortly.",
          color: "text-slate-900",
          bg: "bg-slate-100"
        };
      case 'free-design':
        return {
          icon: <Palette className="h-10 w-10" />,
          title: "Design Slot Booked",
          description: "Congratulations! Your free professional design slot has been successfully reserved. Our team will reach out to discuss your brand vision.",
          color: "text-slate-900",
          bg: "bg-slate-100"
        };
      case 'team-tracker':
        return {
          icon: <Zap className="h-10 w-10" />,
          title: "Tracker Setup Initiated",
          description: "Your request for Team Tracker has been logged. We'll help you set up the ultimate monitoring system for your business efficiency.",
          color: "text-slate-900",
          bg: "bg-slate-100"
        };
      default:
        return {
          icon: <CheckCircle2 className="h-10 w-10" />,
          title: "Request Submitted",
          description: "Thank you for reaching out. Your request has been successfully processed. We will contact you shortly via WhatsApp or Phone.",
          color: "text-emerald-600",
          bg: "bg-emerald-50"
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-slate-50 rounded-full blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-xl text-center space-y-10"
      >
        {/* Simple Icon */}
        <div className="flex justify-center">
          <div className={`h-24 w-24 rounded-full ${content.bg} ${content.color} flex items-center justify-center`}>
            {content.icon}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            {content.title}
          </h1>
          <p className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-md mx-auto font-medium">
            {content.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row items-center justify-center gap-3 pt-2 w-full max-w-sm mx-auto">
          <Button
            onClick={() => router.push('/dashboard')}
            className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200"
          >
            <ArrowRight className="h-4 w-4" />
            See More
          </Button>

          <Button
            variant="outline"
            onClick={() => window.open('https://wa.me/8801805561171', '_blank')}
            className="flex-1 h-11 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 transition-all bg-white"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            Chat
          </Button>
        </div>

      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-200"><CheckCircle2 className="h-10 w-10 animate-pulse" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
