
// src/hooks/use-auth.tsx
"use client";

import { ReactNode } from 'react';

// This hook is a stub because login functionality has been removed.
// It returns a null user so that components like UserNav won't render.

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

interface User {
  name: string;
  email: string;
  avatar?: string;
}

export function useAuth() {
  return {
    user: null as User | null,
    loading: false,
    login: () => { },
    logout: () => { },
  };
}
