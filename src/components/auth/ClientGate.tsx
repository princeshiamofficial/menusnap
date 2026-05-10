
"use client";

import { ReactNode, useState, useEffect, useRef } from 'react';
import { useClientAuth } from '@/hooks/use-client-auth';
import { ClientLoginForm } from './ClientLoginForm';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ClientGateProps {
  children: ReactNode;
}

export function ClientGate({ children }: ClientGateProps) {
  const { isClientLoggedIn, clientLoading } = useClientAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFullyAuthorized, setIsFullyAuthorized] = useState(false);
  const wasLoggedInOnMount = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      if (isClientLoggedIn) wasLoggedInOnMount.current = true;
      mounted.current = true;
    }
  }, [isClientLoggedIn]);

  useEffect(() => {
    if (isClientLoggedIn && !showSuccess && !isFullyAuthorized) {
      // If they were already logged in when they landed, skip the animation
      if (wasLoggedInOnMount.current) {
        setIsFullyAuthorized(true);
      }
      // Otherwise, the handleLoginSuccess will take care of it via the form callback
    }
  }, [isClientLoggedIn, showSuccess, isFullyAuthorized]);

  const handleLoginSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setIsFullyAuthorized(true);
    }, 2500);
  };

  if (clientLoading && !showSuccess) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {showSuccess ? (
        <motion.div
          key="success-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
        >
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-orange-600/20 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[100px] rounded-full" />
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 text-center space-y-6 px-6"
          >
            <div className="flex justify-center mb-8">
              <div className="bg-white/5 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-xl">
                <Image src="/menusnap-logo-white.png" alt="MenuSnap" width={140} height={40} className="object-contain" />
              </div>
            </div>

            <div className="relative flex justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-20 h-20 bg-gradient-to-tr from-orange-600 to-amber-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Access Granted</h2>
              <p className="text-slate-400 font-medium">Redirecting you to your requested feature...</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-orange-500 font-bold text-[10px] uppercase tracking-widest pt-4">
              <Loader2 className="w-3 h-3 animate-spin" /> Finalizing setup
            </div>
          </motion.div>
        </motion.div>
      ) : !isFullyAuthorized ? (
        <motion.div 
          key="login-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative" 
          style={{ backgroundImage: "url('/login-bg.png')" }}
        >
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
          <ClientLoginForm onSuccess={handleLoginSuccess} />
        </motion.div>
      ) : (
        <motion.div
          key="content-gate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
