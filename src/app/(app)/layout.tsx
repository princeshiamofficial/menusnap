
"use client";
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SpeedDialFAB } from '@/components/layout/SpeedDialFAB'; 

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/madmin');

  if (isAdminRoute) {
    // For admin routes, the admin-specific layout (madmin/layout.tsx) handles everything.
    // AppLayout should just pass through children, wrapped in ProtectedRoute for general app auth.
    // The admin section will use its own AdminAuthProvider.
    return (
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    );
  }

  // For non-admin routes within the (app) group
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen> {/* Default open, collapsible to icon */}
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md bg-sidebar">
          <SidebarNav />
        </Sidebar>
        <SidebarInset className="bg-background"> {/* Ensure SidebarInset takes up remaining space */}
          <ScrollArea className="h-screen"> {/* Make ScrollArea cover the full viewport height of the inset */}
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
