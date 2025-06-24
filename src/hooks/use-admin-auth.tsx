
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  adminLoading: boolean;
  adminLogin: (username: string, pass: string) => void; 
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'colorHutAdminLoggedIn';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedAdminStatus = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (storedAdminStatus) {
        setIsAdminLoggedIn(JSON.parse(storedAdminStatus));
      }
    } catch (error) {
      console.error("Failed to parse admin status from localStorage", error);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
    setAdminLoading(false);
  }, []);

  const adminLogin = useCallback((username: string, pass: string) => {
    // Check against the hardcoded credentials
    if (username === 'colorhut' && pass === 'C0l0rhu7') {
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(true));
        setIsAdminLoggedIn(true);
        toast({
          title: "Login Successful",
          description: "Welcome, Admin!",
        });
      } catch (error) {
        console.error("Failed to save admin status to localStorage", error);
        toast({
          title: "Login Error",
          description: "Could not save session. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      // Handle failed login
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
      console.warn("Admin login attempt failed: incorrect credentials");
    }
  }, [toast]);

  const adminLogout = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove admin status from localStorage", error);
    }
    setIsAdminLoggedIn(false);
    // No automatic redirect here, page component will handle content change
    // If needed, router.push('/m-admin'); could be added but might cause loops if not handled carefully
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminLoading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
