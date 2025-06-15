
"use client";
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebarNav } from '@/components/layout/admin-sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminAuthProvider } from '@/hooks/use-admin-auth'; // Import AdminAuthProvider

export default function MAdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider> {/* Wrap with AdminAuthProvider */}
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md bg-sidebar">
          <AdminSidebarNav />
        </Sidebar>
        <SidebarInset className="bg-background">
          <ScrollArea className="h-screen">
            <main className="flex-1"> {/* Removed p-6 sm:p-8 md:p-10 to allow page to control padding */}
              {children}
            </main>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </AdminAuthProvider>
  );
}
