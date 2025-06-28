import type { ReactNode } from 'react';
import '../globals.css';

export const metadata = {
  title: 'Menu PDF',
  description: 'Printable menu selection.',
};

export default function PdfLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="theme-default">
      <body>{children}</body>
    </html>
  );
}
