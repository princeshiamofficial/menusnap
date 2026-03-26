
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

    if (
      pathname.match(/\/manage-orders\/[^/]+/) ||
      pathname.match(/^\/share\/[^/]+/) ||
      pathname.match(/^\/editor\/[^/]+/)
    ) {
      return;
    }

    const segments = pathname.split('/').filter(Boolean);
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
