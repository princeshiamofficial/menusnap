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
    default: 'MenuSnap - Explore & Showcase Premium Restaurant & Parlour Menu Designs',
    template: '%s | MenuSnap',
  },
  description: 'Discover and browse stunning restaurant, cafe, and beauty parlour menu designs. Explore creative templates, showcase your menu layouts, and get custom design inspirations with MenuSnap.',
  keywords: [
    'MenuSnap',
    'menu design showcase',
    'restaurant menu designs',
    'parlour menu templates',
    'menu design inspiration',
    'browse menu designs',
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
    title: 'MenuSnap - Explore & Showcase Premium Restaurant & Parlour Menu Designs',
    description: 'Discover and browse stunning restaurant, cafe, and beauty parlour menu designs. Explore creative templates, showcase your menu layouts, and get custom design inspirations with MenuSnap.',
    url: 'https://menusnap.colorhutbd.xyz',
    siteName: 'MenuSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuSnap - Explore & Showcase Premium Restaurant & Parlour Menu Designs',
    description: 'Discover and browse stunning restaurant, cafe, and beauty parlour menu designs. Explore creative templates, showcase your menu layouts, and get custom design inspirations with MenuSnap.',
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
