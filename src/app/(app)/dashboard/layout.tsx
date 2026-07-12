import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Explore & Manage Your Menu Design Collection',
  description: 'Explore, showcase, and manage your restaurant and beauty parlour menu designs and custom design requests on the MenuSnap Dashboard.',
  keywords: [
    'MenuSnap dashboard',
    'menu design showcase dashboard',
    'restaurant menu collection',
    'parlour menu portfolio',
  ],
  alternates: {
    canonical: '/dashboard',
  },
  publisher: 'MenuSnap',
  authors: [{ name: 'MenuSnap Team', url: 'https://menusnap.colorhutbd.xyz' }],
  creator: 'MenuSnap',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Dashboard - Explore & Manage Your Menu Design Collection | MenuSnap',
    description: 'Explore, showcase, and manage your restaurant and beauty parlour menu designs and custom design requests on the MenuSnap Dashboard.',
    url: 'https://menusnap.colorhutbd.xyz/dashboard',
    siteName: 'MenuSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - Explore & Manage Your Menu Design Collection | MenuSnap',
    description: 'Explore, showcase, and manage your restaurant and beauty parlour menu designs and custom design requests on the MenuSnap Dashboard.',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
