import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MagicTab - AI Menu Builder & Digital Menu Creator',
  description: 'Create, manage, and customize interactive restaurant and salon digital menus instantly with MagicTab AI. Real-time collaborative menu builder.',
  keywords: [
    'MenuSnap',
    'MagicTab',
    'digital menu builder',
    'restaurant menu creator',
    'QR code ordering',
    'interactive salon menu',
    'AI menu maker',
  ],
  alternates: {
    canonical: '/magictab',
  },
  publisher: 'MenuSnap',
  authors: [{ name: 'MenuSnap Team', url: 'https://menusnap.colorhutbd.xyz' }],
  creator: 'MenuSnap',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'MagicTab - AI Menu Builder & Digital Menu Creator | MenuSnap',
    description: 'Create, manage, and customize interactive restaurant and salon digital menus instantly with MagicTab AI. Real-time collaborative menu builder.',
    url: 'https://menusnap.colorhutbd.xyz/magictab',
    siteName: 'MenuSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MagicTab - AI Menu Builder & Digital Menu Creator | MenuSnap',
    description: 'Create, manage, and customize interactive restaurant and salon digital menus instantly with MagicTab AI. Real-time collaborative menu builder.',
  },
};

export default function MagicTabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
