import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Custom Menu Design Service for Restaurants & Parlours',
  description: 'Request custom professional menu card and booklet designs for your restaurant, cafe, or beauty parlour completely free from expert designers at MenuSnap.',
  keywords: [
    'MenuSnap free design',
    'free restaurant menu design',
    'free parlour menu design',
    'custom menu card design',
    'salon menu design service',
  ],
  alternates: {
    canonical: '/free-design',
  },
  publisher: 'MenuSnap',
  authors: [{ name: 'MenuSnap Team', url: 'https://menusnap.colorhutbd.xyz' }],
  creator: 'MenuSnap',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Free Custom Menu Design Service for Restaurants & Parlours | MenuSnap',
    description: 'Request custom professional menu card and booklet designs for your restaurant, cafe, or beauty parlour completely free from expert designers at MenuSnap.',
    url: 'https://menusnap.colorhutbd.xyz/free-design',
    siteName: 'MenuSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Custom Menu Design Service for Restaurants & Parlours | MenuSnap',
    description: 'Request custom professional menu card and booklet designs for your restaurant, cafe, or beauty parlour completely free from expert designers at MenuSnap.',
  },
};

export default function FreeDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
