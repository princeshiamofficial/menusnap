
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

const CLIENT_STORAGE_KEY = 'colorHutClientUser';

interface ClientUser {
    businessName: string;
    type: 'restaurant' | 'parlour';
}

interface ClientAuthContextType {
  clientUser: ClientUser | null;
  isClientLoggedIn: boolean;
  clientLoading: boolean;
  login: (businessName: string, type: 'restaurant' | 'parlour') => void;
  logout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [clientLoading, setClientLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
        const storedUser = localStorage.getItem(CLIENT_STORAGE_KEY);
        if (storedUser) {
            setClientUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse client user from localStorage", error);
        localStorage.removeItem(CLIENT_STORAGE_KEY);
    } finally {
        setClientLoading(false);
    }
  }, []);

  const login = useCallback((businessName: string, type: 'restaurant' | 'parlour') => {
    setClientLoading(true);
    // Mock authentication: In a real app, this would be an API call.
    // We'll accept any business name for now as a demo.
    if (businessName.trim() && (type === 'restaurant' || type === 'parlour')) {
        const userToStore = { businessName: businessName.trim(), type };
        localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(userToStore));
        setClientUser(userToStore);
        toast({
            title: "Login Successful",
            description: `Welcome, ${businessName}!`,
        });
        router.push('/dashboard');
    } else {
        toast({
            title: "Login Failed",
            description: "Please provide a valid business name and type.",
            variant: "destructive",
        });
    }
    setClientLoading(false);
  }, [router, toast]);

  const logout = useCallback(() => {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
    setClientUser(null);
    router.push('/login');
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
  }, [router, toast]);

  const isClientLoggedIn = !!clientUser;

  return (
    <ClientAuthContext.Provider value={{ clientUser, isClientLoggedIn, clientLoading, login, logout }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
}
