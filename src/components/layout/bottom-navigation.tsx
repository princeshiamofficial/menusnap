"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  ListOrdered, 
  FileEdit, 
  History, 
  MoreHorizontal, 
  Layers, 
  Heart, 
  FileText, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

const navItemsLeft = [
  { href: '/dashboard/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/magictab/', label: 'MagicTab', icon: ListOrdered },
];

const centerNavItem = { label: 'More', icon: MoreHorizontal };

const navItemsRight = [
  { href: '/draft/', label: 'Drafts', icon: FileEdit },
  { href: '/order-history/', label: 'History', icon: History },
];

const moreMenuItems = [
  { href: '/templates/', label: 'Templates', description: 'Browse professional menu layouts', icon: Layers, color: 'text-amber-500 bg-amber-500/10' },
  { href: '/happy-clients/', label: 'Happy Clients', description: 'See our customer testimonials', icon: Heart, color: 'text-rose-500 bg-rose-500/10' },
  { href: '/order-history/', label: 'Order History', description: 'View past orders and invoices', icon: History, color: 'text-blue-500 bg-blue-500/10' },
  { href: '/m-admin/magic-docs/', label: 'Magic Docs', description: 'AI generated documents', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' },
  { href: '/m-admin/', label: 'Admin Panel', description: 'CRM and system management', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-500/10' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const activeItemHref = useMemo(() => {
    const allHrefs = ['/dashboard/', '/magictab/', '/draft/', '/order-history/', '/templates/', '/happy-clients/'];
    const sorted = [...allHrefs].sort((a, b) => b.length - a.length);
    for (const href of sorted) {
      if (pathname.startsWith(href)) {
        return href;
      }
    }
    return '/dashboard/';
  }, [pathname]);

  const isMoreActive = ['/templates/', '/happy-clients/', '/m-admin/'].some(h => pathname.startsWith(h));

  return (
    <div data-wf--new-navbar--variant="primary" className="rd-navbar_wrapper md:hidden">
      <div className="relative w-full h-[80px] pointer-events-auto">
        {/* Main Grid Navigation */}
        <nav className="rd-navbar w-full h-full">
          {/* Curve Shape SVG Background */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 375 92"
            fill="none"
            className="rd-navbar_curve-shape"
            preserveAspectRatio="none"
          >
            <g filter="url(#filter0_i_14_1436_menusnap)">
              <path
                d="M150 8C150 3.58172 146.418 0 142 0H18C8.05908 0 0 8.05859 0 18V92H375V18C375 8.05859 366.941 0 357 0H232C227.582 0 224 3.58172 224 8V21C224 34.8066 218.307 46 204.5 46H170C156.193 46 150 34.8066 150 21V8Z"
                fill="#FFFFFF"
              />
            </g>
            <defs>
              <filter
                id="filter0_i_14_1436_menusnap"
                x="0"
                y="0"
                width="375"
                height="95"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="3" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.95 0 0 0 0 0.6 0 0 0 0 0.15 0 0 0 0.5 0"
                />
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_14_1436" />
              </filter>
            </defs>
          </svg>

          {/* Left Nav Items */}
          {navItemsLeft.map((item) => {
            const isActive = activeItemHref === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("rd-navbar_link group", isActive && "is-active")}
              >
                <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
                  <Icon className={cn("rd-navbar_link_icon transition-transform", isActive && "scale-110")} />
                  <span className="rd-navbar_link_text">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}

          {/* Center Notch Spacer */}
          <div className="w-[80px] h-full" />

          {/* Right Nav Items */}
          {navItemsRight.map((item) => {
            const isActive = activeItemHref === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("rd-navbar_link group", isActive && "is-active")}
              >
                <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
                  <Icon className={cn("rd-navbar_link_icon transition-transform", isActive && "scale-110")} />
                  <span className="rd-navbar_link_text">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Center "More" Sheet Action Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="rd-navbar_btn group cursor-pointer border-0 bg-transparent p-0 outline-none">
              <div className="rd-navbar_btn_bg" />
              <div className={cn("rd-navbar_btn_content", (isMoreActive || isOpen) && "is-active")}>
                <MoreHorizontal className={cn("rd-navbar_btn_icon transition-transform group-hover:scale-110", (isMoreActive || isOpen) && "rotate-90")} />
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl border-t border-border/40 p-6 pb-8 bg-background/95 backdrop-blur-xl">
            <SheetHeader className="pb-4 text-left">
              <SheetTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                More Options
              </SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-2.5">
              {moreMenuItems.map((menu) => {
                const Icon = menu.icon;
                return (
                  <SheetClose asChild key={menu.href}>
                    <Link
                      href={menu.href}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-card/60 hover:bg-card border border-border/40 transition-all active:scale-[0.98]"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", menu.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{menu.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{menu.description}</div>
                      </div>
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
