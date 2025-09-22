
import type { ReactNode } from 'react';

export default function ShareLayout({ children }: { children: ReactNode }) {
  // This layout ensures that the share pages don't inherit the main app's sidebar or auth guards.
  return <>{children}</>;
}
