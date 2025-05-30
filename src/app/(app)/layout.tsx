"use client";
import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarContent } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import { ScrollArea } from '@/components/ui/scroll-area';


export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border shadow-md">
          <SidebarNav />
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6 shadow-sm">
            <SidebarTrigger className="md:hidden" /> {/* Hidden on md and up, shown on mobile */}
            <div className="flex-1">
              {/* Optional: Breadcrumbs or page title can go here */}
            </div>
            <UserNav />
          </header>
          <ScrollArea className="h-[calc(100vh-4rem)]"> {/* Adjust height based on header */}
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              {children}
            </main>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
