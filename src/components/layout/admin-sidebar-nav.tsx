
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ChevronRight, 
  ClipboardList, 
  LayoutList, 
  ShoppingCart, 
  LogOut, 
  Layers, 
  Package, 
  FolderOpen
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';

const adminNavItems: { href: string, label: string, icon: React.ElementType, hasChevron?: boolean }[] = [
  { href: '/m-admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/m-admin/contacts', label: 'Contacts', icon: Users, hasChevron: true },
  { href: '/m-admin/manage-orders', label: 'Orders', icon: ShoppingCart, hasChevron: true },
  { href: '/m-admin/manage-categories', label: 'Categories', icon: LayoutList, hasChevron: true },
  { href: '/m-admin/manage-magictab', label: 'MagicTab', icon: ClipboardList, hasChevron: true },
  { href: '/m-admin/manage-templates', label: 'Templates', icon: Layers, hasChevron: true },
  { href: '/m-admin/magic-docs', label: 'Magic Docs', icon: FolderOpen, hasChevron: true },
  { href: '/m-admin/settings', label: 'Settings', icon: Settings, hasChevron: true },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const { adminLogout } = useAdminAuth();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className={cn(
        "flex flex-col items-center justify-center border-b border-sidebar-border py-8 px-4 relative min-h-[100px]",
        "group-data-[collapsible=icon]:h-[60px] group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:min-h-0"
      )}>
        <div className="flex flex-col items-center group-data-[collapsible=icon]:hidden transition-all duration-300">
          <h1 className="text-lg font-black tracking-[0.15em] flex items-center justify-center gap-1.5 leading-none">
            <span className="text-sidebar-primary">ADMIN</span>
            <span className="text-sidebar-foreground">PANEL</span>
          </h1>
          <div className="h-0.5 w-6 bg-sidebar-primary/30 rounded-full mt-3" />
        </div>
        
        {/* Sidebar Trigger - Positioned Absolutely to keep text centered */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 group-data-[state=collapsed]:static group-data-[state=collapsed]:translate-y-0">
          <SidebarTrigger className="text-sidebar-foreground/40 hover:text-sidebar-primary transition-all duration-300" />
        </div>
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        {adminNavItems.length > 0 ? (
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    variant="default"
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      (pathname === item.href || (item.href !== '/m-admin' && pathname.startsWith(item.href)))
                        ? "bg-sidebar-accent text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground/80",
                      "group-data-[collapsible=icon]:justify-center"
                    )}
                    isActive={pathname === item.href || (item.href !== '/m-admin' && pathname.startsWith(item.href))}
                    tooltip={{
                      children: item.label,
                      className: "bg-popover text-popover-foreground border-border shadow-md",
                      sideOffset: 10
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden flex-1">{item.label}</span>
                    {item.hasChevron && <ChevronRight className="h-4 w-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ) : (
          <div className="p-4 text-sm text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            No admin navigation items.
          </div>
        )}
      </nav>
      <div className="p-2 border-t border-sidebar-border mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="default"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-destructive/80 hover:text-destructive-foreground",
                "group-data-[collapsible=icon]:justify-center"
              )}
              onClick={adminLogout}
              tooltip={{
                children: "Logout",
                className: "bg-popover text-popover-foreground border-border shadow-md",
                sideOffset: 10
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden flex-1">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </div>
  );
}
