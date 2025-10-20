
'use client';

import type { ReactNode } from 'react';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { ClientSideOnlyToaster } from '@/components/layout/client-side-only-toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClientAuthProvider } from '@/hooks/use-client-auth';
import { ReactLenis } from '@studio-freight/react-lenis'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ReactLenis root>
          <ClientAuthProvider>
            <ThemeProvider>
              {children}
              <ClientSideOnlyToaster />
            </ThemeProvider>
          </ClientAuthProvider>
        </ReactLenis>
      </body>
    </html>
  );
}
