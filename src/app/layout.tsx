
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { ClientSideOnlyToaster } from '@/components/layout/client-side-only-toaster';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClientAuthProvider } from '@/hooks/use-client-auth'; // Import ClientAuthProvider

const inter = Inter({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Color Hut - Menu Builder',
  description: 'Design and build beautiful menus with Color Hut.',
  icons: {
    icon: 'https://colorhutbd.xyz/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ClientAuthProvider>
          <ThemeProvider>
            {children}
            <ClientSideOnlyToaster />
          </ThemeProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
