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
  metadataBase: new URL('https://menusnap.io'),
  title: {
    default: 'MenuSnap — Restaurant Menu Research & Menu Builder Bangladesh',
    template: '%s | MenuSnap',
  },
  description: 'Explore 3,000+ restaurant & parlor menu references, 30,000+ food items & categories, research market prices, and build your own restaurant menu with MenuSnap.',
  keywords: [
    'Restaurant Menu Builder Bangladesh',
    'Restaurant Menu Software',
    'Menu Research Bangladesh',
    'Food Menu Builder',
    'Restaurant Menu Planning Software',
    'MenuSnap',
    'Restaurant pricing reference Bangladesh',
  ],
  alternates: {
    canonical: '/',
  },
  publisher: 'MenuSnap',
  authors: [{ name: 'MenuSnap Team', url: 'https://menusnap.io' }],
  creator: 'MenuSnap',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'MenuSnap — Restaurant Menu Research & Menu Builder Bangladesh',
    description: 'Explore 3,000+ restaurant & parlor menu references, 30,000+ food items & categories, research market prices, and build your own restaurant menu with MenuSnap.',
    url: 'https://menusnap.io',
    siteName: 'MenuSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuSnap — Restaurant Menu Research & Menu Builder Bangladesh',
    description: 'Explore 3,000+ restaurant & parlor menu references, 30,000+ food items & categories, research market prices, and build your own restaurant menu with MenuSnap.',
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
