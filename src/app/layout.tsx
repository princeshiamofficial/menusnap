
'use client';

import type { ReactNode } from 'react';
import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { ClientSideOnlyToaster } from '@/components/layout/client-side-only-toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClientAuthProvider } from '@/hooks/use-client-auth';
import { MetaPixelScriptLoader } from '@/components/layout/meta-pixel-loader';

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata can't be exported from a client component, so we remove it.
// Next.js will use a default title or you can add a <Head> component in pages.

function PageTitleManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Check exclusion routes as requested by user
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

    // Capitalize and replace dashes
    const formattedName = pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    document.title = `${formattedName} | MenuSnap`;
  }, [pathname]);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* The hardcoded Meta Pixel script has been removed from here to prevent duplication. */}
        {/* The MetaPixelScriptLoader component below now handles script injection. */}
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
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
      </body>
    </html>
  );
}
