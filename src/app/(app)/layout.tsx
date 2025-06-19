
"use client";
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpeedDialFAB } from '@/components/layout/SpeedDialFAB'; 
import { MobileAppRedirect } from '@/components/layout/MobileAppRedirect'; // Added import

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/m-admin'); 

  if (isAdminRoute) {
    // For admin routes, madmin/layout.tsx handles everything.
    return <>{children}</>; 
  }

  // For non-admin routes within the (app) group
  return (
    <ProtectedRoute> {/* Main app authentication */}
      <MobileAppRedirect /> {/* Added MobileAppRedirect component */}
      <SidebarProvider defaultOpen> 
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md bg-sidebar">
          <SidebarNav />
        </Sidebar>
        <SidebarInset className="bg-background"> 
          <ScrollArea className="h-screen"> 
            <main className="flex-1 p-6 sm:p-8 md:p-10">
              {children}
            </main>
          </ScrollArea>
        </SidebarInset>
        
        <SpeedDialFAB /> 
        
      </SidebarProvider>
    </ProtectedRoute>
  );
}
