
"use client";
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
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
  const { isClientLoggedIn, clientLoading } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (!clientLoading && !isClientLoggedIn) {
      const loginPath = '/login/';
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        router.push(loginPath);
        const timeout = setTimeout(() => {
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = loginPath;
          }
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [isClientLoggedIn, clientLoading, router]);

  if (clientLoading || !isClientLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading MenuSnap...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


function GlobalLoginSuccessTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: NodeJS.Timeout;

    const checkAndManageHash = () => {
      const loginSuccessUntilStr = localStorage.getItem('loginSuccessUntil');
      if (!loginSuccessUntilStr) {
        if (window.location.hash === '#login-success') {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState(null, '', cleanUrl);
        }
        return;
      }

      const loginSuccessUntil = parseInt(loginSuccessUntilStr, 10);
      const now = Date.now();

      if (now < loginSuccessUntil) {
        // Within 2-minute window: enforce hash
        if (window.location.hash !== '#login-success') {
          const newUrl = window.location.pathname + window.location.search + '#login-success';
          window.history.replaceState(null, '', newUrl);
        }

        // Set timer to auto-remove when the window expires
        const remaining = loginSuccessUntil - now;
        timer = setTimeout(() => {
          if (window.location.hash === '#login-success') {
            const cleanUrl = window.location.pathname + window.location.search;
            window.history.replaceState(null, '', cleanUrl);
          }
        }, remaining);
      } else {
        // Outside window: clean hash
        if (window.location.hash === '#login-success') {
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState(null, '', cleanUrl);
        }
      }
    };

    checkAndManageHash();

    // Check on navigation, back/forward, and hash modifications
    window.addEventListener('hashchange', checkAndManageHash);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('hashchange', checkAndManageHash);
    };
  }, [pathname]);

  return null;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    return (
      <>
        <GlobalLoginSuccessTracker />
        {children}
      </>
    );
  }

  // Only show as standalone (no sidebar) if not logged in
  if (isAppStandalone && !isClientLoggedIn) {
    if (clientLoading) return null;
    return (
      <>
        <GlobalLoginSuccessTracker />
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
      <GlobalLoginSuccessTracker />
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md bg-sidebar">
          <SidebarNav />
        </Sidebar>
        <SidebarInset className="bg-background">
          {isMobile ? (
            <div 
              className={cn(
                "h-[100dvh] w-full min-w-0 max-w-full",
                (pathname === "/magictab" || pathname === "/magictab/" || pathname === "/ebook" || pathname === "/ebook/") 
                  ? "overflow-hidden" 
                  : "overflow-y-auto pb-16"
              )}
            >
              <main className={cn(
                "flex-grow min-w-0 w-full max-w-full",
                (pathname === "/dashboard" || pathname === "/dashboard/" || pathname === "/magictab" || pathname === "/magictab/" || pathname === "/templates" || pathname === "/templates/" || pathname === "/draft" || pathname === "/draft/" || pathname === "/ebook" || pathname === "/ebook/" || pathname === "/marketing-consultation" || pathname === "/marketing-consultation/") ? "p-0" : "p-3.5 sm:p-5 md:p-6"
              )}>
                {children}
              </main>
            </div>
          ) : (
            <ScrollArea className={cn("h-screen", (pathname === "/magictab" || pathname === "/magictab/" || pathname === "/ebook" || pathname === "/ebook/") ? "pb-0" : "pb-16 md:pb-0")}> 
              <main className={cn(
                "flex-1 min-w-0 w-full max-w-full",
                (pathname === "/dashboard" || pathname === "/dashboard/" || pathname === "/magictab" || pathname === "/magictab/" || pathname === "/templates" || pathname === "/templates/" || pathname === "/draft" || pathname === "/draft/" || pathname === "/ebook" || pathname === "/ebook/" || pathname === "/marketing-consultation" || pathname === "/marketing-consultation/") ? "p-0" : "p-4 sm:p-6 md:p-8 lg:p-10"
              )}>
                {children}
              </main>
            </ScrollArea>
          )}
        </SidebarInset>

        {pathname !== "/dashboard" && pathname !== "/dashboard/" && pathname !== "/magictab" && pathname !== "/magictab/" && pathname !== "/templates" && pathname !== "/templates/" && pathname !== "/draft" && pathname !== "/draft/" && pathname !== "/ebook" && pathname !== "/ebook/" && pathname !== "/order-history" && pathname !== "/order-history/" && !pathname.startsWith("/success") && <SpeedDialFAB />}
        {pathname !== "/ebook" && pathname !== "/ebook/" && <BottomNavigation />}

      </SidebarProvider>
    </ClientAuthGuard>
  );
}
