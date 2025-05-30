"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full bg-muted" />
          <Skeleton className="h-6 w-[280px] bg-muted" />
          <Skeleton className="h-4 w-[220px] bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) {
    // router.push should handle redirection, this is a fallback or for initial render before effect runs
    return null; 
  }

  return <>{children}</>;
}
