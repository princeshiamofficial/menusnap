
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import {
  adminLoginAction,
  adminLogoutAction,
  getAdminSessionAction,
  updateAdminEmailAction,
  updateAdminPasswordAction,
} from '@/app/actions/admin-auth';

export interface AdminUser {
  email: string;
  id: number;
}

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  adminLoading: boolean;
  adminLogin: (email: string, pass: string) => void;
  adminLogout: () => void;
  adminUser: AdminUser | null;
  updateAdminEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updateAdminPassword: (newPassword: string, currentPassword: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // On mount, check if a valid session cookie exists
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getAdminSessionAction();
        setAdminUser(session);
      } catch {
        setAdminUser(null);
      } finally {
        setAdminLoading(false);
      }
    }
    checkSession();
  }, []);

  const adminLogin = useCallback(async (email: string, pass: string) => {
    setAdminLoading(true);
    try {
      const result = await adminLoginAction(email, pass);
      if (result.success) {
        // Re-fetch session to populate adminUser
        const session = await getAdminSessionAction();
        setAdminUser(session);
        toast({ title: "Login Successful", description: "Welcome, Admin!", variant: "success" });
      } else {
        toast({ title: "Login Failed", description: result.error || "Invalid credentials.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Login Failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setAdminLoading(false);
    }
  }, [toast]);

  const adminLogout = useCallback(async () => {
    try {
      await adminLogoutAction();
      setAdminUser(null);
      router.push('/m-admin');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch {
      toast({ title: "Logout Error", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  }, [router, toast]);

  const updateAdminEmail = useCallback(async (newEmail: string, currentPassword: string) => {
    const result = await updateAdminEmailAction(newEmail, currentPassword);
    if (result.success) {
      setAdminUser(prev => prev ? { ...prev, email: newEmail } : null);
    } else {
      toast({ title: "Email Update Failed", description: result.error, variant: "destructive" });
      throw new Error(result.error);
    }
  }, [toast]);

  const updateAdminPassword = useCallback(async (newPassword: string, currentPassword: string) => {
    const result = await updateAdminPasswordAction(newPassword, currentPassword);
    if (result.success) {
      toast({ title: "Success", description: "Password updated successfully." });
    } else {
      toast({ title: "Password Update Failed", description: result.error, variant: "destructive" });
      throw new Error(result.error);
    }
  }, [toast]);

  const isAdminLoggedIn = !!adminUser;

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminLoading, adminLogin, adminLogout, adminUser, updateAdminEmail, updateAdminPassword }}>
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
