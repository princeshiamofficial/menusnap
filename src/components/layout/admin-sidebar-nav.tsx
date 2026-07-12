
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
  FolderOpen,
  Zap,
  MessageSquare,
  UserCog,
  CalendarCheck
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission, getPermissionKey } from '@/lib/admin-permissions';

const adminNavItems: { href: string, label: string, icon: React.ElementType, hasChevron?: boolean }[] = [
  { href: '/m-admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/m-admin/quick-manager', label: 'Quick Manager', icon: Zap, hasChevron: true },
  { href: '/m-admin/contacts', label: 'Contacts', icon: Users, hasChevron: true },
  { href: '/m-admin/manage-orders', label: 'Orders', icon: ShoppingCart, hasChevron: true },
  { href: '/m-admin/responses', label: 'Responses', icon: MessageSquare, hasChevron: true },
  { href: '/m-admin/consultation-events', label: 'Consultations', icon: CalendarCheck, hasChevron: true },
  { href: '/m-admin/manage-categories', label: 'Categories', icon: LayoutList, hasChevron: true },
  { href: '/m-admin/manage-magictab', label: 'MagicTab', icon: ClipboardList, hasChevron: true },
  { href: '/m-admin/manage-templates', label: 'Templates', icon: Layers, hasChevron: true },
  { href: '/m-admin/magic-docs', label: 'Magic Docs', icon: FolderOpen, hasChevron: true },
  { href: '/m-admin/manage-users', label: 'Manage Users', icon: UserCog, hasChevron: true },
  { href: '/m-admin/settings', label: 'Settings', icon: Settings, hasChevron: true },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/^\/panel/, '/m-admin');
  const { adminLogout, adminUser } = useAdminAuth();

  const filteredNavItems = adminNavItems.filter(item => {
    const key = getPermissionKey(item.href);
    return checkClientPermission(adminUser, key, 'view');
  });

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className={cn(
        "flex flex-col border-b border-sidebar-border relative transition-all duration-300",
        "p-4 group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:items-center"
      )}>
        {/* Sidebar Trigger - Only visible when collapsed */}
        <div className="hidden group-data-[state=collapsed]:block mb-2">
          <SidebarTrigger className="text-sidebar-foreground/50 hover:text-sidebar-primary transition-all duration-300 h-8 w-8" />
        </div>

        {/* User Profile Card Section */}
        {adminUser && (
          <div className={cn(
            "flex items-center gap-3 p-2.5 rounded-2xl bg-sidebar-accent/30 border border-sidebar-border/55 transition-all duration-300 w-full",
            "group-data-[state=collapsed]:p-1 group-data-[state=collapsed]:bg-transparent group-data-[state=collapsed]:border-none group-data-[state=collapsed]:w-auto"
          )}>
            {/* Avatar */}
            <div className="relative shrink-0">
              {adminUser.avatar_url ? (
                <img 
                  src={adminUser.avatar_url} 
                  alt={adminUser.name || adminUser.email} 
                  className="h-10 w-10 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 rounded-xl object-cover border border-sidebar-border shadow-sm" 
                />
              ) : (
                <div className="h-10 w-10 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 rounded-xl bg-sidebar-accent border border-sidebar-border flex items-center justify-center text-sidebar-foreground font-black text-xs uppercase">
                  {(adminUser.name || adminUser.email).substring(0, 2)}
                </div>
              )}
              {/* Online Indicator Badge */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-sidebar shadow" />
            </div>

            {/* User Info (Hidden when collapsed) */}
            <div className="flex flex-col min-w-0 group-data-[state=collapsed]:hidden flex-1">
              <span className="font-bold text-xs text-sidebar-foreground truncate leading-tight">
                {adminUser.name || adminUser.email.split('@')[0]}
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 font-medium truncate mt-0.5">
                {adminUser.email}
              </span>
            </div>

            {/* Sidebar Trigger - Only visible when expanded */}
            <div className="group-data-[state=collapsed]:hidden shrink-0">
              <SidebarTrigger className="text-sidebar-foreground/50 hover:text-sidebar-primary transition-all duration-300 h-8 w-8" />
            </div>
          </div>
        )}
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        {filteredNavItems.length > 0 ? (
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  variant="default"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    (normalizedPathname === item.href || (item.href !== '/m-admin' && normalizedPathname.startsWith(item.href)))
                      ? "bg-sidebar-accent text-sidebar-primary-foreground font-semibold"
                      : "text-sidebar-foreground/80",
                    "group-data-[collapsible=icon]:justify-center"
                  )}
                  isActive={normalizedPathname === item.href || (item.href !== '/m-admin' && normalizedPathname.startsWith(item.href))}
                  tooltip={{
                    children: item.label,
                    className: "bg-popover text-popover-foreground border-border shadow-md",
                    sideOffset: 10
                  }}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden flex-1">{item.label}</span>
                    {item.hasChevron && <ChevronRight className="h-4 w-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />}
                  </Link>
                </SidebarMenuButton>
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
