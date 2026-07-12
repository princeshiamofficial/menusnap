
'use client';

import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClientAuthProvider } from '@/hooks/use-client-auth';
import { ClientSideOnlyToaster } from '@/components/layout/client-side-only-toaster';
import { MetaPixelScriptLoader } from '@/components/layout/meta-pixel-loader';

function PageTitleManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const segments = pathname.split('/').filter(Boolean);
    const isMagicDoc = pathname.includes('/magic-docs/') || pathname.includes('/docs/edit/') || pathname.includes('/docs/view/');
    
    if (
      pathname.match(/\/manage-orders\/[^/]+/) ||
      pathname.match(/^\/share\/[^/]+/) ||
      pathname.match(/^\/editor\/[^/]+/) ||
      (isMagicDoc && segments.length > segments.indexOf('magic-docs') + 1) ||
      (pathname.includes('/docs/edit/') && segments.length > segments.indexOf('edit') + 1) ||
      (pathname.includes('/docs/view/') && segments.length > segments.indexOf('view') + 1)
    ) {
      // For dynamic doc pages, if we haven't set a title yet, set a placeholder
      if (isMagicDoc && (document.title === 'MenuSnap' || document.title === '')) {
          document.title = 'Magic Doc | MenuSnap';
      }
      return;
    }

    const cleanPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

    const seoTitles: Record<string, string> = {
      '/templates': 'Explore Restaurant & Parlour Menu Design Gallery | MenuSnap',
      '/free-design': 'Free Custom Menu Design Service for Restaurants & Parlours | MenuSnap',
      '/dashboard': 'Dashboard - Explore & Manage Your Menu Design Collection | MenuSnap',
      '/magictab': 'MagicTab - AI Menu Builder & Creative Layout Designer | MenuSnap',
      '/marketing-consultation': 'Restaurant Marketing & Menu Consultation Service | MenuSnap',
    };

    if (seoTitles[cleanPath]) {
      document.title = seoTitles[cleanPath];
      return;
    }

    let pageName = 'Home';
    if (segments.length > 0) {
      pageName = segments[segments.length - 1];
    }

    const formattedName = pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    document.title = `${formattedName} | MenuSnap`;
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <ThemeProvider>
        <Suspense fallback={null}>
          <MetaPixelScriptLoader />
          <PageTitleManager />
        </Suspense>
        {children}
        <ClientSideOnlyToaster />
      </ThemeProvider>
    </ClientAuthProvider>
  );
}
