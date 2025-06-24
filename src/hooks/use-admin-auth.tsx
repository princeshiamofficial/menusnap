
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
  type User,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  adminLoading: boolean;
  adminLogin: (email: string, pass: string) => void; 
  adminLogout: () => void;
  adminUser: User | null;
  updateAdminEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updateAdminPassword: (newPassword: string, currentPassword: string) => Promise<void>;
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
      toast({
        title: "Logout Error",
        description: "Could not log out. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  const updateAdminEmail = useCallback(async (newEmail: string, currentPassword: string) => {
    if (!adminUser || !adminUser.email) {
        throw new Error("User not authenticated or email not available.");
    }
    const credential = EmailAuthProvider.credential(adminUser.email, currentPassword);
    try {
        await reauthenticateWithCredential(adminUser, credential);
        await updateEmail(adminUser, newEmail);
    } catch (error: any) {
        let description = "An error occurred. Please try again.";
        if (error.code === 'auth/invalid-credential') {
            description = "The password you entered is incorrect.";
        } else if (error.code === 'auth/email-already-in-use') {
            description = "This email is already in use by another account.";
        } else if (error.code === 'auth/requires-recent-login') {
            description = "This action is sensitive. Please log out and log back in before trying again.";
        }
        toast({ title: "Email Update Failed", description, variant: "destructive" });
        throw error;
    }
}, [adminUser, toast]);

const updateAdminPassword = useCallback(async (newPassword: string, currentPassword: string) => {
    if (!adminUser || !adminUser.email) {
        throw new Error("User not authenticated or email not available.");
    }
    const credential = EmailAuthProvider.credential(adminUser.email, currentPassword);
    try {
        await reauthenticateWithCredential(adminUser, credential);
        await updatePassword(adminUser, newPassword);
        toast({ title: "Success", description: "Password updated successfully." });
    } catch (error: any) {
        let description = "An error occurred. Please try again.";
        if (error.code === 'auth/invalid-credential') {
            description = "The password you entered is incorrect.";
        } else if (error.code === 'auth/weak-password') {
            description = "The new password is too weak. It must be at least 6 characters long.";
        } else if (error.code === 'auth/requires-recent-login') {
            description = "This action is sensitive. Please log out and log back in before trying again.";
        }
        toast({ title: "Password Update Failed", description, variant: "destructive" });
        throw error;
    }
}, [adminUser, toast]);


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
