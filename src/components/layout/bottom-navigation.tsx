
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ListOrdered, Layers, FileEdit, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/menu-items', label: 'Menu', icon: ListOrdered },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/draft', label: 'Drafts', icon: FileEdit },
  { href: '/order-history', label: 'History', icon: History },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card shadow-t-lg md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium transition-colors w-1/5 h-full",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0 pointer-events-none", isActive ? "text-primary" : "")} />
              <span className={cn(
                "block text-center truncate text-[10px] leading-tight sm:text-xs pt-0.5 pointer-events-none",
                isActive ? "text-primary" : ""
               )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
