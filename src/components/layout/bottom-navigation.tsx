"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ListOrdered, Layers, FileEdit, History, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const navItemsLeft = [
  { href: '/dashboard/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/magictab/', label: 'MagicTab', icon: ListOrdered },
];

const centerNavItem = { href: '/happy-clients/', label: 'More', icon: HeartHandshake };

const navItemsRight = [
  { href: '/templates/', label: 'Templates', icon: Layers },
  { href: '/draft/', label: 'Draft', icon: FileEdit },
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
            const isActive = activeItem.href === item.href;
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
            const isActive = activeItem.href === item.href;
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

        {/* Center Action Button (Absolute Centered in Notch) */}
        <Link href={centerNavItem.href} className="rd-navbar_btn group">
          <div className="rd-navbar_btn_bg" />
          <div className={cn("rd-navbar_btn_content", isCenterActive && "is-active")}>
            <centerNavItem.icon className={cn("rd-navbar_btn_icon transition-transform group-hover:scale-110", isCenterActive && "rotate-6")} />
          </div>
        </Link>
      </div>
    </div>
  );
}
