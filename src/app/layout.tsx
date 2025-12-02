
'use client';

import type { ReactNode } from 'react';
import { Inter, Roboto_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ClientSideOnlyToaster } from '@/components/layout/client-side-only-toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClientAuthProvider } from '@/hooks/use-client-auth';

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
      <head>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel-script" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1333584174730496');
            fbq('track', 'PageView');
          `}
        </Script>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <noscript>
          <img height="1" width="1" style={{display: 'none'}}
            src="https://www.facebook.com/tr?id=1333584174730496&ev=PageView&noscript=1"
          />
        </noscript>
        <ClientAuthProvider>
          <ThemeProvider>
            {children}
            <ClientSideOnlyToaster />
          </ThemeProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
