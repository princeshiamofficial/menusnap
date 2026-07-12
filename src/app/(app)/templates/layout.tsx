import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Restaurant & Parlour Menu Design Gallery',
  description: 'Browse and discover beautiful, high-resolution restaurant, salon, and beauty parlour menu designs. Explore real menu layouts and creative design inspirations on MenuSnap.',
  keywords: [
    'MenuSnap design gallery',
    'restaurant menu designs',
    'parlour menu showcase',
    'browse menu layouts',
    'menu card designs',
  ],
  alternates: {
    canonical: '/templates',
  },
  publisher: 'MenuSnap',
  authors: [{ name: 'MenuSnap Team', url: 'https://menusnap.colorhutbd.xyz' }],
  creator: 'MenuSnap',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Explore Restaurant & Parlour Menu Design Gallery | MenuSnap',
    description: 'Browse and discover beautiful, high-resolution restaurant, salon, and beauty parlour menu designs. Explore real menu layouts and creative design inspirations on MenuSnap.',
    url: 'https://menusnap.colorhutbd.xyz/templates',
    siteName: 'MenuSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Restaurant & Parlour Menu Design Gallery | MenuSnap',
    description: 'Browse and discover beautiful, high-resolution restaurant, salon, and beauty parlour menu designs. Explore real menu layouts and creative design inspirations on MenuSnap.',
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
