
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, ChevronRight, ClipboardList, LayoutList } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const adminNavItems: { href: string, label: string, icon: React.ElementType, hasChevron?: boolean }[] = [
  { href: '/m-admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  { href: '/m-admin/manage-categories', label: 'Manage Categories', icon: LayoutList, hasChevron: true },
  { href: '/m-admin/manage-menu-items', label: 'Manage Menu Items', icon: ClipboardList, hasChevron: true },
  { href: '/m-admin/settings', label: 'Admin Settings', icon: Settings, hasChevron: true },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className={cn(
        "flex items-center justify-between border-b border-sidebar-border",
        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:px-2.5",
        "group-data-[state=expanded]:p-4"
      )}>
        <div className="flex flex-col items-start gap-1 group-data-[collapsible=icon]:hidden">
          <h1 className="text-xl font-bold">
            <span className="text-sidebar-primary">ADMIN</span>
            <span className="text-sidebar-foreground">PANEL</span>
          </h1>
        </div>
        <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" />
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        {adminNavItems.length > 0 ? (
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
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
    </div>
  );
}

