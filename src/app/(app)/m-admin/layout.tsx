
"use client";
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { AdminSidebarNav } from '@/components/layout/admin-sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminAuthProvider, useAdminAuth } from '@/hooks/use-admin-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Menu } from 'lucide-react';

import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { AdminNotificationPopup } from '@/components/admin/admin-notification-popup';

function MobileSidebarTrigger() {
  const { setOpenMobile } = useSidebar();
  return (
    <div className="fixed bottom-6 right-6 md:hidden z-50">
      <button
        onClick={() => setOpenMobile(true)}
        className="h-14 w-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl shadow-slate-400 group border-4 border-white transition-all active:scale-95 hover:scale-105"
        style={{ transform: 'scale(1.1)' }}
        aria-label="Toggle Sidebar"
      >
        <Menu className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}

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
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md bg-sidebar">
        <AdminSidebarNav />
      </Sidebar>
      <SidebarInset className="bg-background min-w-0 w-full max-w-full overflow-x-hidden">
        <main className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden relative h-full">
          <AdminNotificationPopup />
          {children}
        </main>
      </SidebarInset>
      <MobileSidebarTrigger />
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

