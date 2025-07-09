
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ListOrdered, Layers, FileEdit, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/menu-items', label: 'Menu', icon: ListOrdered },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/draft', label: 'Drafts', icon: FileEdit },
  { href: '/order-history', label: 'History', icon: History },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const navItemsRef = useRef<Map<string, HTMLAnchorElement | null>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isIndicatorVisible, setIsIndicatorVisible] = useState(false);

  useEffect(() => {
    // Find the href of the most specific active item
    let activeItemHref: string | undefined;

    // Sort items by href length descending to match more specific paths first (e.g., /order-history/1 before /order-history)
    const sortedNavItems = [...navItems].sort((a, b) => b.href.length - a.href.length);

    for (const item of sortedNavItems) {
      if (pathname.startsWith(item.href)) {
        activeItemHref = item.href;
        break;
      }
    }
    
    // Fallback to dashboard if no other match
    if (!activeItemHref && pathname === '/dashboard') {
        activeItemHref = '/dashboard';
    } else if (!activeItemHref) {
        // If still no match, might be a page not in nav, fallback to dashboard
        activeItemHref = '/dashboard';
    }


    const activeElement = navItemsRef.current.get(activeItemHref);

    if (activeElement) {
       // A short delay to allow the browser to paint and calculate the correct offset after navigation
      setTimeout(() => {
        setIndicatorStyle({
          left: activeElement.offsetLeft,
          width: activeElement.offsetWidth,
        });
        if (!isIndicatorVisible) {
          setIsIndicatorVisible(true);
        }
      }, 50);
    }
  }, [pathname, isIndicatorVisible]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card shadow-t-lg md:hidden">
      <div className="relative mx-auto flex h-16 max-w-md items-center justify-around px-2">
        <motion.div
          className="absolute top-3 h-10 rounded-full bg-primary/10"
          style={{
            opacity: isIndicatorVisible ? 1 : 0,
          }}
          animate={indicatorStyle}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
          aria-hidden="true"
        />

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => navItemsRef.current.set(item.href, el)}
              className={cn(
                "relative z-10 flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium transition-colors w-1/5 h-full",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="block text-center truncate text-[10px] leading-tight sm:text-xs pt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
