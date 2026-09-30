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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var K='chunk_reload_timestamp';function hit(e){if(!e)return false;var m=e.message||(e.reason&&e.reason.message)||'';var n=e.name||(e.reason&&e.reason.name)||'';return n==='ChunkLoadError'||m.indexOf('Loading chunk')>-1||m.indexOf('Failed to load chunk')>-1||m.indexOf('Loading CSS chunk')>-1;}function handle(ev){var err=ev.error||ev.reason;if(!hit(err))return;var last=0;try{last=Number(sessionStorage.getItem(K))||0;}catch(e){}var now=Date.now();if(now-last>10000){try{sessionStorage.setItem(K,String(now));}catch(e){}window.location.reload();}}window.addEventListener('error',handle);window.addEventListener('unhandledrejection',handle);})();`,
          }}
        />
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
