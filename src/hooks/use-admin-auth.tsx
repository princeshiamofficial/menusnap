
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  role?: string;
  permissions?: Record<string, string[]>;
  avatar_url?: string | null;
  name?: string | null;
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
  const pathname = usePathname();

  const adminUserRef = useRef(adminUser);
  useEffect(() => {
    adminUserRef.current = adminUser;
  }, [adminUser]);

  const checkSession = useCallback(async () => {
    try {
      const session = await getAdminSessionAction();
      if (!session && adminUserRef.current) {
        setAdminUser(null);
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        router.push('/m-admin');
      } else if (session && JSON.stringify(session) !== JSON.stringify(adminUserRef.current)) {
        setAdminUser(session);
      }
    } catch {
      setAdminUser(null);
    }
  }, [toast, router]);

  // On mount, check if a valid session cookie exists
  useEffect(() => {
    async function checkSessionInitial() {
      try {
        const session = await getAdminSessionAction();
        setAdminUser(session);
      } catch {
        setAdminUser(null);
      } finally {
        setAdminLoading(false);
      }
    }
    checkSessionInitial();
  }, []);

  // Real-time checks: periodic, focus change
  useEffect(() => {
    if (!adminUser) return;

    // Check every 15 seconds
    const interval = setInterval(() => {
      checkSession();
    }, 15000);

    // Check when window gets focus
    const handleFocus = () => {
      checkSession();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [adminUser, checkSession]);

  // Check session status on navigation
  useEffect(() => {
    if (adminUser) {
      checkSession();
    }
  }, [pathname]);

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
    } catch (err: any) {
      toast({ title: "Login Failed", description: err.message || "An unexpected error occurred.", variant: "destructive" });
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
