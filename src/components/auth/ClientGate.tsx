
"use client";

import { ReactNode, useState, useEffect } from 'react';
import { useClientAuth } from '@/hooks/use-client-auth';
import { ClientLoginForm } from './ClientLoginForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ClientGateProps {
  children: ReactNode;
}

export function ClientGate({ children }: ClientGateProps) {
  const { isClientLoggedIn, clientLoading, clientUser } = useClientAuth();
  const [isFullyAuthorized, setIsFullyAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isClientLoggedIn) {
      setIsFullyAuthorized(true);
    } else {
      setIsFullyAuthorized(false);
    }
  }, [isClientLoggedIn]);

  // One-time self-cleaning success handler
  useEffect(() => {
    if (isFullyAuthorized && typeof window !== 'undefined' && window.location.hash === '#login-success' && localStorage.getItem('loginToastShown') !== 'true') {
      localStorage.setItem('loginToastShown', 'true');
      toast({
        title: "Login Successful",
        description: `Welcome to ${clientUser?.businessName || "MenuSnap"}!`,
      });
    }
  }, [isFullyAuthorized, clientUser, toast]);

  const handleLoginSuccess = () => {
    setIsFullyAuthorized(true);
    
    // Store 20 seconds window and toast shown state
    if (typeof window !== 'undefined') {
      localStorage.setItem('loginSuccessUntil', (Date.now() + 20000).toString());
      localStorage.setItem('loginToastShown', 'false');
      window.location.hash = 'login-success';
    }
  };

  if (clientLoading) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {!isFullyAuthorized ? (
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
