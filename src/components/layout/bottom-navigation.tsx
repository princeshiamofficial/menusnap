"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ListOrdered, Layers, FileEdit, History, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const navItemsLeft = [
  { href: '/dashboard/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/magictab/', label: 'MagicTab', icon: ListOrdered },
];

const centerNavItem = { href: '/templates/', label: 'Templates', icon: Layers };

const navItemsRight = [
  { href: '/draft/', label: 'Drafts', icon: FileEdit },
  { href: '/order-history/', label: 'History', icon: History },
];

const allNavItems = [...navItemsLeft, centerNavItem, ...navItemsRight];

export function BottomNavigation() {
  const pathname = usePathname();

  const activeItem = useMemo(() => {
    let activeItemHref: string | undefined;
    const sorted = [...allNavItems].sort((a, b) => b.href.length - a.href.length);
    for (const item of sorted) {
      if (pathname.startsWith(item.href)) {
        activeItemHref = item.href;
        break;
      }
    }
    return allNavItems.find((item) => item.href === activeItemHref) || allNavItems[0];
  }, [pathname]);

  const isCenterActive = activeItem.href === centerNavItem.href;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none">
      <div className="relative w-full max-w-lg mx-auto h-20 flex items-end justify-between px-3 pb-2 pointer-events-auto">
        {/* Curved Notch SVG Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_-8px_20px_rgba(0,0,0,0.15)]">
          <svg
            viewBox="0 0 375 92"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-card/95 backdrop-blur-xl transition-colors duration-300"
            preserveAspectRatio="none"
          >
            <path
              d="M150 8C150 3.58172 146.418 0 142 0H18C8.05908 0 0 8.05859 0 18V92H375V18C375 8.05859 366.941 0 357 0H232C227.582 0 224 3.58172 224 8V21C224 34.8066 218.307 46 204.5 46H170C156.193 46 150 34.8066 150 21V8Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Left Nav Items */}
        <div className="relative z-10 flex items-center justify-around flex-1 h-14 pr-3">
          {navItemsLeft.map((item) => {
            const isActive = activeItem.href === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full transition-colors relative group",
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                  <span className="text-[10px] font-medium leading-tight mt-0.5 tracking-tight">
                    {item.label}
                  </span>
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="activeTabDot"
                    className="absolute -top-1 w-1.5 h-1.5 bg-primary rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Center Action Button (Elevated in Notch Curve) */}
        <div className="relative z-20 flex flex-col items-center -mt-8 mx-1">
          <Link href={centerNavItem.href} className="relative group">
            {/* Animated Conic Gradient Glow Ring */}
            <div className={cn(
              "absolute -inset-1 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity animate-spin-slow bg-gradient-to-r",
              isCenterActive 
                ? "from-amber-400 via-primary to-orange-500 opacity-100 blur-md" 
                : "from-primary/50 via-amber-500/40 to-primary/50"
            )} />

            {/* Main Center Button */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 transition-all duration-300",
                isCenterActive
                  ? "bg-gradient-to-br from-primary via-amber-500 to-amber-600 text-primary-foreground shadow-primary/40 scale-105"
                  : "bg-gradient-to-br from-card to-muted text-foreground hover:text-primary hover:border-primary/50"
              )}
            >
              <centerNavItem.icon className={cn("w-6 h-6 transition-transform", isCenterActive && "rotate-6")} />
            </motion.div>
          </Link>
          <span className={cn(
            "text-[10px] font-bold mt-1 tracking-tight transition-colors",
            isCenterActive ? "text-primary" : "text-muted-foreground"
          )}>
            {centerNavItem.label}
          </span>
        </div>

        {/* Right Nav Items */}
        <div className="relative z-10 flex items-center justify-around flex-1 h-14 pl-3">
          {navItemsRight.map((item) => {
            const isActive = activeItem.href === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full transition-colors relative group",
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center"
                >
                  <Icon className={cn("h-5 w-5 transition-transform duration-200", isActive && "scale-110")} />
                  <span className="text-[10px] font-medium leading-tight mt-0.5 tracking-tight">
                    {item.label}
                  </span>
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="activeTabDot"
                    className="absolute -top-1 w-1.5 h-1.5 bg-primary rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
