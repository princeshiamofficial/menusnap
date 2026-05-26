import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Design | MenuSnap',
  description: 'Get your free restaurant or beauty parlour menu design',
};

export default function FreeDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
