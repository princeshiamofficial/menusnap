
"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpeedDialFAB } from '@/components/layout/SpeedDialFAB';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function ClientAuthGuard({ children }: { children: ReactNode }) {
  const { isClientLoggedIn, clientLoading, clientUser } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (!clientLoading && !isClientLoggedIn) {
      router.push('/login');
    }
  }, [isClientLoggedIn, clientLoading, router]);




  if (clientLoading || !isClientLoggedIn) {
    // Show a full-page loading skeleton while checking auth or redirecting
    return (
      <div className="flex h-screen w-full">
        <div className="hidden md:flex flex-col space-y-2 p-4 border-r bg-sidebar">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full mt-4" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-8 space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/m-admin') || pathname.startsWith('/panel');
  const isStandaloneRoute = pathname.startsWith('/marketing-consultation') || 
                            pathname.startsWith('/free-design') || 
                            pathname.startsWith('/team-tracker');

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For non-admin routes within the (app) group
  return (
    <ClientAuthGuard>
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md bg-sidebar">
          <SidebarNav />
        </Sidebar>
        <SidebarInset className="bg-background">
          <ScrollArea className={cn("h-screen", (pathname === "/magictab" || pathname === "/magictab/") ? "pb-0" : "pb-16 md:pb-0")}> 
            <main className={cn(
              "flex-1",
              (pathname === "/dashboard" || pathname === "/dashboard/" || pathname === "/magictab" || pathname === "/magictab/" || pathname === "/ebook" || pathname === "/ebook/" || pathname === "/marketing-consultation" || pathname === "/marketing-consultation/") ? "p-0" : "p-6 sm:p-8 md:p-10"
            )}>
              {children}
            </main>
          </ScrollArea>
        </SidebarInset>

        {pathname !== "/dashboard" && pathname !== "/dashboard/" && pathname !== "/magictab" && pathname !== "/magictab/" && <SpeedDialFAB />}
        <BottomNavigation />

      </SidebarProvider>
    </ClientAuthGuard>
  );
}
