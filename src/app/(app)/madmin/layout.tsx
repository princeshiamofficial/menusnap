
"use client";
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebarNav } from '@/components/layout/admin-sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminAuthProvider, useAdminAuth } from '@/hooks/use-admin-auth';

// Inner component to access admin auth context after AdminAuthProvider is mounted
function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();

  if (adminLoading) {
    // The MAdminDashboardPage (children) will render its own full-page loading skeleton.
    // Return children directly to let the page control its loading display fully.
    return <>{children}</>;
  }

  if (!isAdminLoggedIn) {
    // If not logged in, render children (which will be the AdminLoginForm styled for full-screen)
    // directly without any sidebar structure.
    return <>{children}</>;
  }

  // If admin is logged in and not loading, render with sidebar structure
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md bg-sidebar">
        <AdminSidebarNav />
      </Sidebar>
      <SidebarInset className="bg-background">
        <ScrollArea className="h-screen">
          <main className="flex-1"> {/* Page controls its own padding */}
            {children}
          </main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function MAdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider> {/* AdminAuthProvider wraps AdminLayoutContent */}
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}
