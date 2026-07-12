import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Restaurant Marketing eBook | MenuSnap',
  description: 'Download our comprehensive guide to mastering digital menu marketing, QR ordering strategies, and restaurant growth.',
  alternates: {
    canonical: '/ebook',
  },
  publisher: 'MenuSnap',
  authors: [{ name: 'MenuSnap Team', url: 'https://menusnap.colorhutbd.xyz' }],
  openGraph: {
    title: 'Free Restaurant Marketing eBook | MenuSnap',
    description: 'Download our comprehensive guide to mastering digital menu marketing, QR ordering strategies, and restaurant growth.',
    url: 'https://menusnap.colorhutbd.xyz/ebook',
    siteName: 'MenuSnap',
    type: 'website',
  },
};

export default function EbookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
