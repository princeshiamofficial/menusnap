
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
      // Ensure we redirect to the login page with a trailing slash
      const loginPath = '/login/';
      if (window.location.pathname !== loginPath) {
        router.push(loginPath);
        // Fallback to hard redirect if router.push doesn't trigger
        const timeout = setTimeout(() => {
          if (window.location.pathname !== loginPath) {
            window.location.href = loginPath;
          }
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [isClientLoggedIn, clientLoading, router]);




  if (clientLoading || !isClientLoggedIn) {
    return null;
  }

  return <>{children}</>;
}


export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/m-admin') || pathname.startsWith('/panel');
  const isMarketingStandalone = pathname.startsWith('/marketing-consultation') || 
                                pathname.startsWith('/free-design') || 
                                pathname.startsWith('/ebook') || 
                                pathname.startsWith('/ebook/success') || 
                                pathname.startsWith('/team-tracker') ||
                                pathname.startsWith('/success');

  const isAppStandalone = pathname.startsWith('/magictab') || 
                          pathname.startsWith('/templates');

  const { isClientLoggedIn, clientLoading } = useClientAuth();

  if (isMarketingStandalone) {
    return <>{children}</>;
  }

  // Only show as standalone (no sidebar) if not logged in
  if (isAppStandalone && !isClientLoggedIn) {
    if (clientLoading) return null;
    return (
      <>
        {children}
        <BottomNavigation />
      </>
    );
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
          <ScrollArea className={cn("h-screen", (pathname === "/magictab" || pathname === "/magictab/" || pathname === "/ebook" || pathname === "/ebook/") ? "pb-0" : "pb-16 md:pb-0")}> 
            <main className={cn(
              "flex-1",
              (pathname === "/dashboard" || pathname === "/dashboard/" || pathname === "/magictab" || pathname === "/magictab/" || pathname === "/templates" || pathname === "/templates/" || pathname === "/draft" || pathname === "/draft/" || pathname === "/ebook" || pathname === "/ebook/" || pathname === "/marketing-consultation" || pathname === "/marketing-consultation/") ? "p-0" : "p-6 sm:p-8 md:p-10"
            )}>
              {children}
            </main>
          </ScrollArea>
        </SidebarInset>

        {pathname !== "/dashboard" && pathname !== "/dashboard/" && pathname !== "/magictab" && pathname !== "/magictab/" && pathname !== "/templates" && pathname !== "/templates/" && pathname !== "/draft" && pathname !== "/draft/" && pathname !== "/ebook" && pathname !== "/ebook/" && pathname !== "/order-history" && pathname !== "/order-history/" && !pathname.startsWith("/success") && <SpeedDialFAB />}
        {pathname !== "/ebook" && pathname !== "/ebook/" && <BottomNavigation />}

      </SidebarProvider>
    </ClientAuthGuard>
  );
}
