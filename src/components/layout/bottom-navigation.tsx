
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ListOrdered, Layers, FileEdit, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/magictab', label: 'MagicTab', icon: ListOrdered },
  { href: '/templates', label: 'Templates', icon: Layers },
  { href: '/draft', label: 'Drafts', icon: FileEdit },
  { href: '/order-history', label: 'History', icon: History },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const navItemsRef = useRef<Map<string, HTMLAnchorElement | null>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const activeItem = useMemo(() => {
    let activeItemHref: string | undefined;
    const sortedNavItems = [...navItems].sort((a, b) => b.href.length - a.href.length);
    for (const item of sortedNavItems) {
      if (pathname.startsWith(item.href)) {
        activeItemHref = item.href;
        break;
      }
    }
    return navItems.find(item => item.href === activeItemHref) || navItems[0];
  }, [pathname]);

  useEffect(() => {
    const activeElement = navItemsRef.current.get(activeItem.href);
    if (activeElement) {
      const timeoutId = setTimeout(() => {
        setIndicatorStyle({
          left: activeElement.offsetLeft,
          width: activeElement.offsetWidth,
          opacity: 1,
        });
      }, 10);
      return () => clearTimeout(timeoutId);
    }
  }, [activeItem]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card md:hidden">
      <div className="relative mx-auto flex h-16 max-w-md items-stretch justify-around px-2 border-t border-border">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            ref={(el) => { navItemsRef.current.set(item.href, el); }}
            className="relative z-10 flex flex-col items-center justify-center p-2 text-xs font-medium w-1/5 h-full"
            aria-current={activeItem.href === item.href ? "page" : undefined}
          >
            <motion.div
              className="flex flex-col items-center text-muted-foreground"
              animate={{ opacity: activeItem.href === item.href ? 0 : 1, y: activeItem.href === item.href ? 10 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="block text-center truncate text-[10px] leading-tight sm:text-xs pt-0.5">
                {item.label}
              </span>
            </motion.div>
          </Link>
        ))}

        <AnimatePresence>
          {indicatorStyle.opacity === 1 && (
            <motion.div
              className="absolute h-16 flex flex-col items-center"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                top: '-1px', // Position the indicator to perfectly cover the top border
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
              }}
            >
              {/* This div creates the cutout illusion. It MUST match the page background. */}
              <div className="absolute top-0 w-20 h-4 bg-background" />

              <div className="w-14 h-14 -mt-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`indicator-icon-${activeItem.href}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <activeItem.icon className="h-6 w-6" />
                  </motion.div>
                </AnimatePresence>
              </div>

              <span className="text-xs text-primary font-bold mt-1 relative z-10">
                {activeItem.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
