"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  ArrowLeftRight,
  BarChart3,
  Zap,
  LayoutList,
  Layers,
  ClipboardList,
  CalendarCheck,
  MessageSquare,
  Settings,
  UserCog,
  HeartHandshake,
  Image as ImageIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { checkClientPermission, getPermissionKey } from '@/lib/admin-permissions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const menuNavItems: NavItem[] = [
  { href: '/m-admin', label: 'Dashboard', icon: LayoutGrid },
  { href: '/m-admin/manage-orders', label: 'Orders', icon: ArrowLeftRight },
  { href: '/m-admin/contacts', label: 'Analytics & Leads', icon: BarChart3 },
  { href: '/m-admin/quick-manager', label: 'Quick Manager', icon: Zap },
  { href: '/m-admin/manage-categories', label: 'Categories', icon: LayoutList },
  { href: '/m-admin/manage-templates', label: 'Templates', icon: Layers },
  { href: '/m-admin/manage-magictab', label: 'MagicTab', icon: ClipboardList },
  { href: '/m-admin/consultation-events', label: 'Consultations', icon: CalendarCheck },
  { href: '/m-admin/responses', label: 'Responses', icon: MessageSquare },
];

const accountNavItems: NavItem[] = [
  { href: '/m-admin/settings', label: 'Settings', icon: Settings },
  { href: '/m-admin/magic-docs', label: 'Magic Docs', icon: FolderOpen },
  { href: '/m-admin/manage-users', label: 'Manage Users', icon: UserCog },
  { href: '/m-admin/summernote-docs', label: 'Docs Editor', icon: FileText },
  { href: '/m-admin/client-gallery', label: "Client Gallery", icon: ImageIcon },
  { href: '/m-admin/testimonials', label: 'Testimonials', icon: HeartHandshake },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/^\/panel/, '/m-admin');
  const { adminLogout, adminUser } = useAdminAuth();
  const { state, toggleSidebar } = useSidebar();

  const isCollapsed = state === "collapsed";

  const filterItems = (items: NavItem[]) => {
    return items.filter(item => {
      const key = getPermissionKey(item.href);
      return checkClientPermission(adminUser, key, 'view');
    });
  };

  const filteredMenuItems = filterItems(menuNavItems);
  const filteredAccountItems = filterItems(accountNavItems);

  const isItemActive = (href: string) => {
    if (href === '/m-admin') {
      return normalizedPathname === '/m-admin';
    }
    return normalizedPathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col h-full bg-[#0c0e14] select-none text-slate-200 transition-all duration-300">
        {/* Top Header */}
        <div className={cn(
          "shrink-0 transition-all duration-300",
          isCollapsed ? "pt-4 pb-2 px-2 flex justify-center" : "pt-4 pb-2 px-4 flex items-center justify-between"
        )}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="h-7 w-7 rounded-full border border-slate-800 bg-slate-900/90 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight className="h-4 w-4 stroke-[2.2]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs bg-slate-900 text-white border border-slate-800 rounded-lg px-2.5 py-1">
                Expand sidebar
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                Menu
              </span>
              <button
                type="button"
                onClick={toggleSidebar}
                className="h-6 w-6 rounded-full border border-slate-800 bg-slate-900/90 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-3.5 w-3.5 stroke-[2.2]" />
              </button>
            </>
          )}
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Main Menu Items */}
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 mx-auto",
                          active
                            ? "bg-white/10 text-white font-bold shadow-xs border border-white/10"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon className={cn("w-5 h-5 stroke-[1.8]", active ? "text-white" : "text-slate-400")} />
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium bg-slate-900 text-white border border-slate-800 rounded-lg px-2.5 py-1">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-[13.5px]",
                    active
                      ? "bg-white/10 text-white font-bold shadow-xs border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 stroke-[1.8]", active ? "text-white" : "text-slate-400")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Account Section Divider & Title */}
          <div className={cn(
            "transition-all duration-200",
            isCollapsed ? "my-2.5 border-t border-slate-800/80 w-8 mx-auto" : "pt-4 pb-1.5 px-3"
          )}>
            {!isCollapsed && (
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase block">
                Account
              </span>
            )}
          </div>

          {/* Account Items */}
          <div className="space-y-1">
            {filteredAccountItems.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 mx-auto",
                          active
                            ? "bg-white/10 text-white font-bold shadow-xs border border-white/10"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <Icon className={cn("w-5 h-5 stroke-[1.8]", active ? "text-white" : "text-slate-400")} />
                        <span className="sr-only">{item.label}</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-medium bg-slate-900 text-white border border-slate-800 rounded-lg px-2.5 py-1">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-[13.5px]",
                    active
                      ? "bg-white/10 text-white font-bold shadow-xs border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 stroke-[1.8]", active ? "text-white" : "text-slate-400")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}

          </div>
        </div>

        {/* User Profile Footer */}
        {adminUser && (
          isCollapsed ? (
            <div className="shrink-0 p-2 border-t border-slate-800/80 mt-auto flex flex-col items-center gap-2.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative cursor-pointer">
                    {adminUser.avatar_url ? (
                      <img
                        src={adminUser.avatar_url}
                        alt={adminUser.name || adminUser.email}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700/80 shadow-sm"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700/80 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                        {(adminUser.name || adminUser.email || "AD").substring(0, 2)}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c0e14]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs bg-slate-900 text-white border border-slate-800 rounded-lg px-3 py-2 space-y-0.5 shadow-xl">
                  <p className="font-semibold text-white">{adminUser.name || adminUser.email.split('@')[0]}</p>
                  <p className="text-slate-400 text-[10px]">{adminUser.email}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={adminLogout}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    aria-label="Log out"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.8]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium bg-red-600 text-white rounded-lg px-2.5 py-1">
                  Log out
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="shrink-0 p-2.5 border-t border-slate-800/80 mt-auto bg-[#0c0e14]">
              <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-all group">
                {/* Avatar with status indicator */}
                <div className="relative shrink-0">
                  {adminUser.avatar_url ? (
                    <img
                      src={adminUser.avatar_url}
                      alt={adminUser.name || adminUser.email}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700/80 shadow-sm"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700/80 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                      {(adminUser.name || adminUser.email || "AD").substring(0, 2)}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c0e14]" />
                </div>

                {/* User Info */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-semibold text-white truncate leading-tight">
                    {adminUser.name || adminUser.email.split('@')[0]}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate mt-0.5" title={adminUser.email}>
                    {adminUser.email}
                  </span>
                </div>

                {/* Log Out Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={adminLogout}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                      aria-label="Log out"
                    >
                      <LogOut className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-medium bg-red-600 text-white rounded-lg px-2 py-1">
                    Log out
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )
        )}
      </div>
    </TooltipProvider>
  );
}
