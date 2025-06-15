// src/hooks/use-auth.tsx
"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthUser {
  name: string;
  email: string;
  avatar?: string; 
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('bizViewUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('bizViewUser');
    }
    setLoading(false);
  }, []);

  const login = useCallback((email: string, name: string = 'Demo User') => {
    const mockUser: AuthUser = { name, email, avatar: `https://placehold.co/100x100.png?text=${name.charAt(0)}` };
    try {
      localStorage.setItem('bizViewUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
    setUser(mockUser);
    router.push('/transactions'); // Changed from /calendar
  }, [router]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('bizViewUser');
    } catch (error) {
      console.error("Failed to remove user from localStorage", error);
    }
    setUser(null);
    router.push('/');
  }, [router]);
  
  useEffect(() => {
    if (!loading && !user && pathname !== '/') {
      router.push('/');
    }
  }, [user, loading, router, pathname]);


  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
