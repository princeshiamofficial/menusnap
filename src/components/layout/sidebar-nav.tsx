"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase } from 'lucide-react'; // Removed ListChecks, CalendarDays
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'; 
import { cn } from '@/lib/utils';

const navItems: { href: string, label: string, icon: React.ElementType }[] = [
  // All nav items removed
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <Briefcase className="h-8 w-8 text-sidebar-primary" />
        <h1 className="text-2xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">BizView</h1>
      </div>
      <nav className="flex-grow p-2">
        {navItems.length > 0 ? (
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    variant="default"
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, className: "bg-popover text-popover-foreground border-border shadow-md" }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ) : (
          <div className="p-4 text-sm text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            No navigation items.
          </div>
        )}
      </nav>
    </div>
  );
}
