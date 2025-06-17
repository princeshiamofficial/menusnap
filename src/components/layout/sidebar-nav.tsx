
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ListOrdered, Layers, FileEdit, ChevronRight, Bell, User } from 'lucide-react'; 
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const mainNavItems: { href: string, label: string, icon: React.ElementType, hasChevron?: boolean }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/menu-items', label: 'Menu Items', icon: ListOrdered, hasChevron: true },
  { href: '/templates', label: 'Templates', icon: Layers, hasChevron: true },
  { href: '/draft', label: 'Draft', icon: FileEdit, hasChevron: true },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className={cn(
        "flex items-center justify-between border-b border-sidebar-border",
        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:py-3 group-data-[collapsible=icon]:px-2.5",
        "group-data-[state=expanded]:p-4 group-data-[state=expanded]:h-[73px]" // Added fixed height for expanded state
      )}>
        <Link href="/dashboard" passHref legacyBehavior>
          <a className="group-data-[collapsible=icon]:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-sm flex items-center">
            <div className="relative h-10 w-36 sm:w-40"> {/* Adjusted width, use sm for responsive width */}
              <Image
                src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                alt="Color Hut Logo"
                fill
                sizes="(max-width: 640px) 144px, 160px" // Corresponds to w-36 and w-40
                className="object-contain"
                priority 
              />
            </div>
          </a>
        </Link>
        <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" />
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        {mainNavItems.length > 0 ? (
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    variant="default"
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      pathname === item.href ? "bg-sidebar-accent text-sidebar-primary-foreground font-semibold" : "text-sidebar-foreground/80",
                      "group-data-[collapsible=icon]:justify-center"
                    )}
                    isActive={pathname === item.href}
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
            No navigation items.
          </div>
        )}
      </nav>
      <div className="p-3 border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="notifications" className="border-none">
            <AccordionTrigger className="hover:no-underline py-2 px-2 text-sm font-medium text-sidebar-foreground/80 hover:text-sidebar-foreground rounded-md data-[state=open]:text-sidebar-primary [&[data-state=open]>svg:last-child]:text-sidebar-primary [&[data-state=open]>svg:last-child]:rotate-90">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pl-1">
              <Link href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm text-sidebar-foreground/70">
                <User className="h-4 w-4" />
                <span>New User</span>
              </Link>
              {/* Add more notification items here */}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

