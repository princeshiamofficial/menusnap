
"use client";
import type { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'; // Removed SidebarTrigger, SidebarContent
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AppLayout({ children }: { children: ReactNode }) {
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
        <div className="fixed bottom-4 right-4 z-50"> {/* UserNav fixed to bottom right */}
          <UserNav />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
