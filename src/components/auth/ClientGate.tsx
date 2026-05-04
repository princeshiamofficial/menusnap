
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
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
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
