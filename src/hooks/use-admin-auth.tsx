
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  type User
} from 'firebase/auth';

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  adminLoading: boolean;
  adminLogin: (email: string, pass: string) => void; 
  adminLogout: () => void;
  adminUser: User | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
      setAdminLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const adminLogin = useCallback(async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({
        title: "Login Successful",
        description: "Welcome, Admin!",
      });
    } catch (error: any) {
      let description = "An unknown error occurred.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
          description = "Invalid email or password.";
      }
      toast({
        title: "Login Failed",
        description,
        variant: "destructive",
      });
    }
  }, [toast]);

  const adminLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase logout error:", error);
      toast({
        title: "Logout Error",
        description: "Could not log out. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const isAdminLoggedIn = !!adminUser;

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminLoading, adminLogin, adminLogout, adminUser }}>
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
