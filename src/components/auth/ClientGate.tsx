
"use client";

import { ReactNode } from 'react';
import { useClientAuth } from '@/hooks/use-client-auth';
import { ClientLoginForm } from './ClientLoginForm';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientGateProps {
  children: ReactNode;
}

export function ClientGate({ children }: ClientGateProps) {
  const { isClientLoggedIn, clientLoading } = useClientAuth();

  if (clientLoading) {
    return null;
  }

  if (!isClientLoggedIn) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative" 
        style={{ backgroundImage: "url('/login-bg.png')" }}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"></div>
        <ClientLoginForm />
      </div>
    );
  }

  return <>{children}</>;
}
