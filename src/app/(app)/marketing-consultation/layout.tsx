import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restaurant Marketing & Menu Consultation Service',
  description: 'Book a professional marketing and digital menu consultation to boost revenue and streamline ordering for your restaurant or parlour with MenuSnap.',
  keywords: [
    'restaurant marketing consultation',
    'menu engineering consultant',
    'digital menu marketing',
    'MenuSnap consultation',
  ],
  alternates: {
    canonical: '/marketing-consultation',
  },
  publisher: 'MenuSnap',
  authors: [{ name: 'MenuSnap Team', url: 'https://menusnap.colorhutbd.xyz' }],
  creator: 'MenuSnap',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Restaurant Marketing & Menu Consultation Service | MenuSnap',
    description: 'Book a professional marketing and digital menu consultation to boost revenue and streamline ordering for your restaurant or parlour with MenuSnap.',
    url: 'https://menusnap.colorhutbd.xyz/marketing-consultation',
    siteName: 'MenuSnap',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Marketing & Menu Consultation Service | MenuSnap',
    description: 'Book a professional marketing and digital menu consultation to boost revenue and streamline ordering for your restaurant or parlour with MenuSnap.',
  },
};

export default function MarketingConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
