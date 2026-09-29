
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { checkWhatsAppAvailability } from '@/app/actions/whatsapp';
import { saveClientLogin, checkClientSubscription, clientLoginAction } from '@/app/actions/clients';

const CLIENT_STORAGE_KEY = 'colorHutClientUser';
export const REMEMBER_ME_STORAGE_KEY = 'menusnap_remember_me';
export const REMEMBER_ID_STORAGE_KEY = 'menusnap_remembered_identifier';

export interface ClientUser {
  id?: number;
  businessName: string;
  type: 'restaurant' | 'parlour';
  whatsappNumber?: string;
  division?: string;
  district?: string;
  email?: string;
  isSubscriber?: boolean;
  subscriptionPackage?: string;
}

export interface PackageLimits {
  isCategoryUnlimited: boolean;
  categoryLimit: number;
  isItemUnlimited: boolean;
  itemLimit: number;
}

export interface ClientAuthContextType {
  clientUser: ClientUser | null;
  isClientLoggedIn: boolean;
  clientLoading: boolean;
  isSubscriber: boolean;
  subscriptionLoading: boolean;
  currentPackage?: string | null;
  packageLimits?: PackageLimits;
  isAdmin?: boolean;
  refreshSubscription: (userToCheck?: ClientUser | null) => Promise<boolean>;
  login: (
    businessName: string,
    type: 'restaurant' | 'parlour',
    whatsappNumber: string,
    password?: string,
    division?: string,
    district?: string,
    email?: string,
    redirectTo?: string | null,
    rememberMe?: boolean
  ) => Promise<boolean>;
  loginWithCredentials: (
    identifier: string,
    password: string,
    rememberMe?: boolean,
    redirectTo?: string | null
  ) => Promise<boolean>;
  logout: () => void;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [clientLoading, setClientLoading] = useState(true);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<string | null>(null);
  const [packageLimits, setPackageLimits] = useState<PackageLimits>({
    isCategoryUnlimited: true,
    categoryLimit: 0,
    isItemUnlimited: true,
    itemLimit: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const refreshSubscription = useCallback(async (userToCheck?: ClientUser | null) => {
    const target = userToCheck !== undefined ? userToCheck : clientUser;
    if (!target) {
      try {
        const adminRes = await checkClientSubscription();
        if (adminRes.success && adminRes.isAdmin) {
          setIsAdmin(true);
          setIsSubscriber(true);
          if (adminRes.plan) setCurrentPackage(adminRes.plan);
          if (adminRes.limits) setPackageLimits(adminRes.limits);
          return true;
        }
      } catch {}
      setIsSubscriber(false);
      setCurrentPackage(null);
      setPackageLimits({
        isCategoryUnlimited: true,
        categoryLimit: 0,
        isItemUnlimited: true,
        itemLimit: 0,
      });
      return false;
    }
    setSubscriptionLoading(true);
    try {
      const res = await checkClientSubscription(target.whatsappNumber, target.email);
      const isSub = Boolean(res.success && res.isSubscriber);
      setIsSubscriber(isSub);
      if (res.isAdmin) setIsAdmin(true);
      if (res.plan) {
        setCurrentPackage(res.plan);
      }
      if (res.limits) {
        setPackageLimits(res.limits);
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(CLIENT_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            let hasChanged = false;
            if (parsed.isSubscriber !== isSub) {
              parsed.isSubscriber = isSub;
              hasChanged = true;
            }
            if (res.plan && parsed.subscriptionPackage !== res.plan) {
              parsed.subscriptionPackage = res.plan;
              hasChanged = true;
            }
            if (hasChanged) {
              localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(parsed));
              setClientUser({ ...parsed });
            }
          } catch {}
        }
      }
      return isSub;
    } catch (e) {
      console.error("Failed to check client subscription:", e);
      return false;
    } finally {
      setSubscriptionLoading(false);
    }
  }, [clientUser]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(CLIENT_STORAGE_KEY);
      if (storedUser) {
        const parsed: ClientUser = JSON.parse(storedUser);
        setClientUser(parsed);
        if (parsed.isSubscriber !== undefined) {
          setIsSubscriber(Boolean(parsed.isSubscriber));
        }
        if (parsed.subscriptionPackage) {
          setCurrentPackage(parsed.subscriptionPackage);
        }
        // Verify with server in background
        checkClientSubscription(parsed.whatsappNumber, parsed.email)
          .then((res) => {
            const isSub = Boolean(res.success && res.isSubscriber);
            setIsSubscriber(isSub);
            if (res.isAdmin) setIsAdmin(true);
            if (res.plan) {
              setCurrentPackage(res.plan);
            }
            let hasChanged = false;
            if (parsed.isSubscriber !== isSub) {
              parsed.isSubscriber = isSub;
              hasChanged = true;
            }
            if (res.plan && parsed.subscriptionPackage !== res.plan) {
              parsed.subscriptionPackage = res.plan;
              hasChanged = true;
            }
            if (hasChanged) {
              localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(parsed));
              setClientUser({ ...parsed });
            }
          })
          .catch((err) => {
            console.error("Failed background subscription check:", err);
          });
      } else {
        // Check if admin session is active
        checkClientSubscription()
          .then((res) => {
            if (res.success && res.isAdmin) {
              setIsAdmin(true);
              setIsSubscriber(true);
              if (res.plan) setCurrentPackage(res.plan);
            }
          })
          .catch(() => {});
      }
    } catch (error) {
      console.error("Failed to parse client user from localStorage", error);
      localStorage.removeItem(CLIENT_STORAGE_KEY);
    } finally {
      setClientLoading(false);
    }
  }, []);

  const login = useCallback(async (
    businessName: string,
    type: 'restaurant' | 'parlour',
    whatsappNumber: string,
    password?: string,
    division?: string,
    district?: string,
    email?: string,
    redirectTo?: string | null,
    rememberMe?: boolean
  ) => {
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

    // 2. Database Sync & Password Authentication
    let loginAction: 'created' | 'updated' = 'created';
    let dbIsSubscriber = false;
    let savedId: number | undefined;
    let dbSubPackage: string | undefined = undefined;
    if (whatsappNumber) {
        try {
            const dbResult = await saveClientLogin(
              businessName.trim(),
              type,
              whatsappNumber.trim(),
              division,
              district,
              email?.trim(),
              password
            );
            if (dbResult.success) {
                loginAction = (dbResult.action as 'created' | 'updated') || 'updated';
                dbIsSubscriber = Boolean(dbResult.isSubscriber);
                savedId = dbResult.clientId;
                dbSubPackage = dbResult.subscriptionPackage;
                console.log(`Client authenticated successfully (${dbResult.action})`);
            } else {
                toast({
                  title: "Authentication Failed",
                  description: dbResult.error || "Incorrect credentials or password.",
                  variant: "destructive",
                });
                setClientLoading(false);
                return false;
            }
        } catch (dbErr: any) {
            console.error("Database authentication error:", dbErr);
            toast({
              title: "Authentication Error",
              description: dbErr.message || "Failed to authenticate.",
              variant: "destructive",
            });
            setClientLoading(false);
            return false;
        }
    }

    // 3. Client Session Storage
    if (businessName.trim() && (type === 'restaurant' || type === 'parlour')) {
      const userToStore: ClientUser = { 
        id: savedId,
        businessName: businessName.trim(), 
        type,
        whatsappNumber: whatsappNumber?.trim(),
        division,
        district,
        email: email?.trim(),
        isSubscriber: dbIsSubscriber,
        subscriptionPackage: dbSubPackage,
      };
      localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(userToStore));
      setClientUser(userToStore);
      setIsSubscriber(dbIsSubscriber);
      if (dbSubPackage) {
        setCurrentPackage(dbSubPackage);
      }

      // Handle Remember Me
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_STORAGE_KEY, 'true');
          localStorage.setItem(REMEMBER_ID_STORAGE_KEY, whatsappNumber?.trim() || email?.trim() || '');
        } else {
          localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
          localStorage.removeItem(REMEMBER_ID_STORAGE_KEY);
        }
      }

      toast({
        title: loginAction === 'created' ? "Registration Successful" : "Login Successful",
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
        title: "Registration Failed",
        description: "Please provide a valid business name and type.",
        variant: "destructive",
      });
      setClientLoading(false);
      return false;
    }
  }, [router, toast]);

  const loginWithCredentials = useCallback(async (
    identifier: string,
    password: string,
    rememberMe?: boolean,
    redirectTo?: string | null
  ) => {
    setClientLoading(true);
    try {
      const cleanId = (identifier || '').trim();
      const res = await clientLoginAction(cleanId, password);

      if (!res.success || !res.client) {
        toast({
          title: "Login Failed",
          description: res.error || "Incorrect credentials or password.",
          variant: "destructive",
        });
        setClientLoading(false);
        return false;
      }

      const client = res.client;
      const userToStore: ClientUser = {
        id: client.id,
        businessName: client.businessName,
        type: client.businessType,
        whatsappNumber: client.whatsappNumber,
        division: client.division,
        district: client.district,
        email: client.email,
        isSubscriber: Boolean(client.isSubscriber),
        subscriptionPackage: client.subscriptionPackage,
      };

      localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(userToStore));
      setClientUser(userToStore);
      setIsSubscriber(Boolean(client.isSubscriber));
      if (client.subscriptionPackage) {
        setCurrentPackage(client.subscriptionPackage);
      }

      // Handle Remember Me
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_STORAGE_KEY, 'true');
          localStorage.setItem(REMEMBER_ID_STORAGE_KEY, cleanId);
        } else {
          localStorage.removeItem(REMEMBER_ME_STORAGE_KEY);
          localStorage.removeItem(REMEMBER_ID_STORAGE_KEY);
        }
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${client.businessName}!`,
        variant: "success",
      });

      // Play welcome sound
      try {
        const welcomeSound = new Audio('/audio/welcome_back.mp3');
        welcomeSound.play().catch(() => {});
      } catch (e) {}

      if (redirectTo !== null) {
        router.push(redirectTo || '/dashboard');
      }
      setClientLoading(false);
      return true;
    } catch (error: any) {
      console.error("Login with credentials error:", error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to log in. Please try again.",
        variant: "destructive",
      });
      setClientLoading(false);
      return false;
    }
  }, [router, toast]);

  const logout = useCallback(() => {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
    setClientUser(null);
    setIsSubscriber(false);
    setCurrentPackage(null);
    setPackageLimits({
      isCategoryUnlimited: true,
      categoryLimit: 0,
      isItemUnlimited: true,
      itemLimit: 0,
    });
    router.push('/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "success",
    });
  }, [router, toast]);

  const isClientLoggedIn = !!clientUser;

  return (
    <ClientAuthContext.Provider
      value={{
        clientUser,
        isClientLoggedIn,
        clientLoading,
        isSubscriber,
        subscriptionLoading,
        currentPackage,
        packageLimits,
        isAdmin,
        refreshSubscription,
        login,
        loginWithCredentials,
        logout,
      }}
    >
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
