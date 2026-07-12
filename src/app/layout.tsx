import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { WhatsAppFloat } from '@/components/ui/whatsapp-float';
import { MicrosoftClarityLoader } from '@/components/layout/microsoft-clarity-loader';

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://menusnap.colorhutbd.xyz'),
  title: {
    default: 'MenuSnap - Smart Digital Menu & QR Order Management System',
    template: '%s | MenuSnap',
  },
  description: 'Create, manage, and customize interactive digital menus and QR ordering systems for restaurants, cafes, and beauty parlours seamlessly with MenuSnap.',
  keywords: [
    'MenuSnap',
    'digital menu',
    'QR code ordering',
    'restaurant menu management',
    'beauty parlour menu',
    'interactive menu builder',
  ],
  alternates: {
    canonical: '/',
  },
  publisher: 'MenuSnap',
  authors: [{ name: 'MenuSnap Team', url: 'https://menusnap.colorhutbd.xyz' }],
  creator: 'MenuSnap',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'MenuSnap - Smart Digital Menu & QR Order Management System',
    description: 'Create, manage, and customize interactive digital menus and QR ordering systems for restaurants, cafes, and beauty parlours seamlessly with MenuSnap.',
    url: 'https://menusnap.colorhutbd.xyz',
    siteName: 'MenuSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuSnap - Smart Digital Menu & QR Order Management System',
    description: 'Create, manage, and customize interactive digital menus and QR ordering systems for restaurants, cafes, and beauty parlours seamlessly with MenuSnap.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'MenuSnap',
  },
  applicationName: 'MenuSnap',
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <MicrosoftClarityLoader />
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <Providers>
          <WhatsAppFloat />
          {children}
        </Providers>
      </body>
    </html>
  );
}
