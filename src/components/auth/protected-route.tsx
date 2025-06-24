
"use client";

import type { ReactNode } from 'react';

// This component is no longer used as the login page has been removed.
// It now simply renders its children to avoid breaking any potential imports.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
