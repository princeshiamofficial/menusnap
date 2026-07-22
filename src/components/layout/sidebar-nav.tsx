
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ListOrdered,
  Layers,
  FileEdit,
  ChevronRight,
  LogOut,
  Building,
  History as HistoryIcon,
  MoreHorizontal,
  UploadCloud,
  ShoppingBag,
  HeartHandshake,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Skeleton } from '@/components/ui/skeleton';

const mainNavItems: { href: string, label: string, icon: React.ElementType, hasChevron?: boolean }[] = [
  { href: '/magictab/', label: 'MagicTab', icon: ListOrdered, hasChevron: true },
  { href: '/templates/', label: 'Templates', icon: Layers, hasChevron: true },
  { href: '/draft/', label: 'Draft', icon: FileEdit, hasChevron: true },
  { href: '/order-history/', label: 'Order History', icon: HistoryIcon, hasChevron: true },
  { href: '/happy-clients/', label: 'Happy Clients', icon: HeartHandshake, hasChevron: true },
  { href: 'https://store.colorhutbd.xyz', label: 'Store', icon: ShoppingBag },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { clientUser, logout, clientLoading } = useClientAuth();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className={cn(
        "flex items-center justify-between border-b border-sidebar-border",
        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:px-2.5",
        "group-data-[state=expanded]:p-4 group-data-[state=expanded]:h-[80px]"
      )}>
        <Link 
          href="/magictab/" 
          className="group-data-[collapsible=icon]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm flex items-center"
        >
          <div className="relative h-12 w-44 sm:w-48">
            <Image
              src="/menusnap-logo-white.png"
              alt="MenuSnap Logo"
              fill
              sizes="(max-width: 640px) 176px, 192px"
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" />
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        {mainNavItems.length > 0 ? (
          <SidebarMenu>
            {mainNavItems.map((item) => {
              const isExternal = item.href.startsWith('http');
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    variant="default"
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                        ? "bg-sidebar-accent text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground/80",
                      "group-data-[collapsible=icon]:justify-center"
                    )}
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                    tooltip={{
                      children: item.label,
                      className: "bg-popover text-popover-foreground border-border shadow-md",
                      sideOffset: 10
                    }}
                  >
                    <Link 
                      href={item.href} 
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden flex-1">{item.label}</span>
                      {item.hasChevron && <ChevronRight className="h-4 w-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        ) : (
          <div className="p-4 text-sm text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            No navigation items.
          </div>
        )}
      </nav>

      {/* User Info and Logout Section */}
      <div className="p-2 border-t border-sidebar-border mt-auto">
        <div className="group-data-[collapsible=icon]:hidden p-2">
          {clientLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
          ) : clientUser ? (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-sidebar-accent">
                <Building className="h-4 w-4 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{clientUser.businessName}</p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">{clientUser.type}</p>
              </div>
            </div>
          ) : null}
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="default"
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-destructive/80 hover:text-destructive-foreground",
                "group-data-[collapsible=icon]:justify-center"
              )}
              onClick={logout}
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
