"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from '@/components/auth/login-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    // Show a loading state or blank screen while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 p-8 rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full mx-auto bg-muted" />
          <Skeleton className="h-6 w-48 mx-auto bg-muted" />
          <Skeleton className="h-4 w-64 mx-auto bg-muted" />
        </div>
      </div>
    );
  }

  // If not loading and no user, show Login page
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary p-4 sm:p-6 md:p-8">
      <LoginForm />
    </main>
  );
}
