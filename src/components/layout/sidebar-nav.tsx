
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
  Sparkles,
  Utensils,
} from 'lucide-react';
import { useMemo } from 'react';
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
  const { clientUser, logout, clientLoading, isSubscriber, currentPackage, isAdmin } = useClientAuth();

  const displayPackage = useMemo(() => {
    const raw = currentPackage || clientUser?.subscriptionPackage;
    if (raw) {
      let clean = raw.trim();
      clean = clean.replace(/_plan$/i, '').replace(/ plan$/i, '');
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    if (isAdmin) return 'Admin';
    if (isSubscriber) return 'Pro';
    return 'Free';
  }, [currentPackage, clientUser?.subscriptionPackage, isAdmin, isSubscriber]);

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className={cn(
        "flex items-center justify-between border-b border-sidebar-border",
        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:px-2.5",
        "group-data-[state=expanded]:p-4 group-data-[state=expanded]:h-[80px]"
      )}>
        <Link 
          href="/dashboard" 
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
                      {item.href.includes('/magictab') && !isSubscriber && (
                        <span className="group-data-[collapsible=icon]:hidden text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs mr-1">
                          PRO
                        </span>
                      )}
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

      {/* Modern User Info and Logout Section */}
      <div className="p-2.5 border-t border-sidebar-border mt-auto">
        {clientLoading ? (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl bg-white/10 shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <Skeleton className="h-3.5 w-24 bg-white/10 rounded" />
              <Skeleton className="h-2.5 w-16 bg-white/10 rounded" />
            </div>
          </div>
        ) : clientUser ? (
          <>
            {/* Expanded State: Premium Modern Glassmorphism Card */}
            <div className="group-data-[collapsible=icon]:hidden p-3 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/[0.08] shadow-lg shadow-black/20 hover:border-white/[0.16] hover:from-white/[0.09] hover:to-white/[0.04] transition-all duration-200 group">
              <div className="flex items-center gap-3">
                {/* Modern Avatar with Glow & Active Status Dot */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5A36] via-orange-500 to-amber-400 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-orange-500/25 border border-white/20 uppercase tracking-wide">
                    {clientUser.businessName ? clientUser.businessName.charAt(0) : <Building className="w-5 h-5" />}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#18181b] rounded-full shadow-xs" title="Online" />
                </div>

                {/* Business Info & Plan Badge */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white tracking-tight truncate leading-tight group-hover:text-orange-400 transition-colors">
                    {clientUser.businessName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[11px] font-medium text-slate-400 capitalize truncate flex items-center gap-1">
                      {clientUser.type === 'restaurant' ? (
                        <Utensils className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : clientUser.type === 'parlour' ? (
                        <Sparkles className="w-3 h-3 text-slate-400 shrink-0" />
                      ) : null}
                      {clientUser.type}
                    </span>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-orange-500/15 via-amber-500/20 to-orange-500/15 text-orange-400 border border-orange-500/30 shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5 mr-1 text-amber-400 shrink-0" />
                      {displayPackage === 'Admin' ? 'Admin' : `${displayPackage}`}
                    </span>
                  </div>
                </div>

                {/* Quick Sleek Logout Button */}
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsed State (Icon-only mode) */}
            <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-2 py-1">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5A36] to-amber-400 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-orange-500/20 uppercase cursor-pointer border border-white/20"
                title={`${clientUser.businessName} (${displayPackage})`}
              >
                {clientUser.businessName ? clientUser.businessName.charAt(0) : <Building className="w-4 h-4" />}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
