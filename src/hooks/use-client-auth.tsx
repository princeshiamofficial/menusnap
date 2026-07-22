
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { checkWhatsAppAvailability } from '@/app/actions/whatsapp';
import { saveClientLogin } from '@/app/actions/clients';

const CLIENT_STORAGE_KEY = 'colorHutClientUser';

export interface ClientUser {
  businessName: string;
  type: 'restaurant' | 'parlour';
  whatsappNumber?: string;
  division?: string;
  district?: string;
}

export interface ClientAuthContextType {
  clientUser: ClientUser | null;
  isClientLoggedIn: boolean;
  clientLoading: boolean;
  login: (businessName: string, type: 'restaurant' | 'parlour', whatsappNumber?: string, division?: string, district?: string, redirectTo?: string | null) => Promise<boolean>;
  logout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

const DEFAULT_GUEST_USER: ClientUser = {
  businessName: 'MenuSnap Demo',
  type: 'restaurant',
  whatsappNumber: '01700000000'
};

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [clientUser, setClientUser] = useState<ClientUser | null>(DEFAULT_GUEST_USER);
  const [clientLoading, setClientLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(CLIENT_STORAGE_KEY);
      if (storedUser) {
        setClientUser(JSON.parse(storedUser));
      } else {
        localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(DEFAULT_GUEST_USER));
      }
    } catch (error) {
      console.error("Failed to parse client user from localStorage", error);
    }
  }, []);

  const login = useCallback(async (businessName: string, type: 'restaurant' | 'parlour', whatsappNumber?: string, division?: string, district?: string, redirectTo?: string | null) => {
    setClientLoading(true);
    
    // 1. WhatsApp Presence Check using Green API (with Bypass & Cache)
    if (whatsappNumber) {
        // Simple Bypass Cache check
        const cacheKey = `wa_valid_${whatsappNumber.replace(/\D/g, '')}`;
        const cachedResult = localStorage.getItem(cacheKey);
        
        if (cachedResult !== 'true') { // If not already validated in this browser
            try {
                const check = await checkWhatsAppAvailability(whatsappNumber);
                
                // CRITICAL BYPASS: Only block if API explicitly says "exists: false"
                // If success is false (rate limit, API down, config error), we BYPASS and let them in.
                if (check.success) {
                    if (check.exists === false) {
                        toast({
                            title: "Status Check Failed",
                            description: "This mobile number does not have an active WhatsApp account.",
                            variant: "destructive",
                        });
                        setClientLoading(false);
                        return false;
                    } else if (check.exists === true) {
                        // Cache successful validation to avoid redundant API calls/rate limits
                        localStorage.setItem(cacheKey, 'true');
                    }
                } else {
                    console.warn("WhatsApp validation bypassed due to API error/rate limit:", check.error);
                }
            } catch (err) {
                console.error("WhatsApp status check failed (Bypassing):", err);
            }
        }
    }

    // 2. Database Sync: Save client login details
    let loginAction: 'created' | 'updated' = 'created';
    if (whatsappNumber) {
        try {
            const dbResult = await saveClientLogin(businessName.trim(), type, whatsappNumber.trim(), division, district);
            if (dbResult.success && dbResult.action) {
                loginAction = dbResult.action as 'created' | 'updated';
                console.log(`Client synced to DB successfully (${dbResult.action})`);
            } else if (!dbResult.success) {
                console.error("Failed to sync client to DB:", dbResult.error);
                // We'll proceed with frontend login anyway to avoid blocking the user
            }
        } catch (dbErr) {
            console.error("Database sync error:", dbErr);
        }
    }

    // 3. Mock authentication
    if (businessName.trim() && (type === 'restaurant' || type === 'parlour')) {
      const userToStore: ClientUser = { 
        businessName: businessName.trim(), 
        type,
        whatsappNumber: whatsappNumber?.trim(),
        division,
        district
      };
      localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(userToStore));
      setClientUser(userToStore);
      toast({
        title: "Login Successful",
        description: `Welcome, ${businessName}!`,
        variant: "success",
      });

      // Play welcome sound (handled gracefully if source is unavailable)
      try {
        const soundPath = loginAction === 'updated' ? '/audio/welcome_back.mp3' : '/audio/welcome.mp3';
        const welcomeSound = new Audio(soundPath);
        welcomeSound.play().catch(() => {
          /* Silence playback errors */
        });
      } catch (e) {
        /* Silence creation errors */
      }

      if (redirectTo !== null) {
        router.push(redirectTo || '/dashboard');
      }
      setClientLoading(false);
      return true;
    } else {
      toast({
        title: "Login Failed",
        description: "Please provide a valid business name and type.",
        variant: "destructive",
      });
      setClientLoading(false);
      return false;
    }
  }, [router, toast]);

  const logout = useCallback(() => {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
    setClientUser(null);
    router.push('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "success",
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
