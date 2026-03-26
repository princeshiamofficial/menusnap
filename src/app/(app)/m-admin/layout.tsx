
"use client";
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebarNav } from '@/components/layout/admin-sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminAuthProvider, useAdminAuth } from '@/hooks/use-admin-auth';
import { Skeleton } from '@/components/ui/skeleton';

import { AdminLoginForm } from '@/components/auth/admin-login-form';

// Inner component to access admin auth context after AdminAuthProvider is mounted
function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto bg-card" />
          <Skeleton className="h-8 w-48 mx-auto bg-card" />
          <Skeleton className="h-40 w-full mt-4 bg-card rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <AdminLoginForm />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md bg-sidebar">
        <AdminSidebarNav />
      </Sidebar>
      <SidebarInset className="bg-background">
        <ScrollArea className="h-screen">
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function MAdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider> {/* Wrap with AdminAuthProvider */}
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}

