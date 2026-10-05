"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Utensils, Sparkles, LogIn, AlertCircle, MapPin, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useClientAuth } from '@/hooks/use-client-auth';
import { useTheme } from '@/context/ThemeContext';
import { isValidWhatsApp } from '@/lib/utils';
import { checkClientStatus } from '@/app/actions/clients';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.35-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.967c0 2.112.551 4.173 1.597 6.011L0 24l6.193-1.625A11.77 11.77 0 0012.048 24h.005c6.604 0 11.967-5.363 11.97-11.97a11.811 11.811 0 00-3.528-8.471z" />
  </svg>
);

const BD_ADDRESS_DATA: Record<string, string[]> = {
  "Dhaka": ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Faridpur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narsingdi", "Rajbari", "Shariatpur"],
  "Chattogram": ["Chattogram", "Cox's Bazar", "Cumilla", "Noakhali", "Feni", "Chandpur", "Brahmanbaria", "Lakshmipur", "Rangamati", "Khagrachhari", "Bandarban"],
  "Rajshahi": ["Rajshahi", "Bogura", "Pabna", "Sirajganj", "Naogaon", "Natore", "Joypurhat", "Chapainawabganj"],
  "Khulna": ["Khulna", "Jashore", "Satkhira", "Kushtia", "Bagerhat", "Jhenaidah", "Chuadanga", "Magura", "Narail", "Meherpur"],
  "Barishal": ["Barishal", "Patuakhali", "Bhola", "Pirojpur", "Barguna", "Jhalokathi"],
  "Sylhet": ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  "Rangpur": ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Nilphamari", "Panchagarh", "Thakurgaon", "Lalmonirhat"],
  "Mymensingh": ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
};

export function ClientLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [type, setType] = useState<'restaurant' | 'parlour' | ''>('');
  const [division, setDivision] = useState<string>('');
  const [district, setDistrict] = useState<string>('');

  // Common state
  const [rememberMe, setRememberMe] = useState(true);

  const { login, loginWithCredentials, clientLoading } = useClientAuth();
  const { setTheme } = useTheme();

  // Load Remember Me credentials on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRemember = localStorage.getItem('menusnap_remember_me');
      const storedId = localStorage.getItem('menusnap_remembered_identifier');
      if (storedRemember === 'true' && storedId) {
        setRememberMe(true);
        setLoginIdentifier(storedId);
        setWhatsapp(storedId);
      } else if (storedRemember === 'false') {
        setRememberMe(false);
      }
    }
  }, []);

  // When WhatsApp or Email is typed in registration, check if client already exists
  useEffect(() => {
    const targetId = (whatsapp || email || '').trim();
    if (activeTab === 'register' && (isValidWhatsApp(targetId) || targetId.includes('@'))) {
      let isCancelled = false;
      checkClientStatus(targetId)
        .then(res => {
          if (isCancelled) return;
          if (res.success && res.exists) {
            // Account already exists -> switch to login tab
            setActiveTab('login');
            setLoginIdentifier(targetId);
          }
        })
        .catch(() => {});

      return () => {
        isCancelled = true;
      };
    }
  }, [whatsapp, email, activeTab]);

  const handleTypeChange = (value: 'restaurant' | 'parlour') => {
    setType(value);
    setTheme(value === 'parlour' ? 'parlour' : 'default');
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) return;

    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'login_attempt',
        method: 'credentials',
        identifier: loginIdentifier,
      });
    }

    const success = await loginWithCredentials(
      loginIdentifier.trim(),
      loginPassword,
      rememberMe,
      null
    );

    if (success) {
      if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: 'login_success',
          method: 'credentials',
          identifier: loginIdentifier,
        });
      }
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  // Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveBusinessName = businessName.trim() || (type === 'parlour' ? 'My Parlour' : 'My Restaurant');
    const effectiveWhatsapp = whatsapp.trim();
    const effectiveEmail = email.trim();

    if (effectiveBusinessName && type && registerPassword && division && district) {
      if (effectiveWhatsapp && !isValidWhatsApp(effectiveWhatsapp)) return;
      if (registerPassword.length < 6) return;

      if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: 'register_attempt',
          business_type: type,
          business_name: effectiveBusinessName,
          email: effectiveEmail,
          division: division,
          district: district,
        });
      }

      const success = await login(
        effectiveBusinessName,
        type,
        effectiveWhatsapp,
        registerPassword,
        division,
        district,
        effectiveEmail,
        null,
        rememberMe
      );

      if (success) {
        if (typeof window !== 'undefined') {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: 'register_success',
            method: 'whatsapp',
            business_type: type,
            business_name: effectiveBusinessName,
            email: effectiveEmail,
          });
        }
        if (onSuccess) {
          onSuccess();
        }
      }
    }
  };

  const isWhatsAppInvalid = whatsapp.length > 0 && !isValidWhatsApp(whatsapp);
  const businessNameLabel = type === 'restaurant' ? 'Restaurant Name' : type === 'parlour' ? 'Parlour Name' : 'Business Name';
  const businessNamePlaceholder = `Enter your ${type ? type : 'business'} name`;

  return (
    <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none relative overflow-hidden z-10 bg-white dark:bg-slate-900 mx-auto">
      <CardHeader className="p-0">
        <div className="bg-black w-full py-4 px-8 flex justify-center items-center">
          <Image
            src="/menusnap-logo-white.png"
            alt="MenuSnap Logo"
            width={280}
            height={80}
            className="object-contain"
            priority
          />
        </div>
        <div className="px-8 pt-5 pb-1 text-center">
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Please log in or register to access this feature
          </CardDescription>

          {/* Segmented Tab Switcher */}
          <div className="mt-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1 border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Registration
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-4">
        {activeTab === 'login' ? (
          /* ================= LOGIN TAB ================= */
          <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5">
              <Label htmlFor="gate-login-identifier" className="flex items-center text-slate-700 dark:text-slate-300 font-bold text-sm">
                <WhatsAppIcon className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp or Email
              </Label>
              <Input
                id="gate-login-identifier"
                type="text"
                autoComplete="username"
                className="h-12 border-gray-200 dark:border-slate-800 rounded-xl focus-visible:ring-orange-500 transition-all bg-transparent text-sm"
                placeholder="Enter your WhatsApp number or email"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="gate-login-password" className="flex items-center text-slate-700 dark:text-slate-300 font-bold text-sm">
                  <Lock className="h-4 w-4 mr-2 text-slate-600" />
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="gate-login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="h-12 pr-11 border-gray-200 dark:border-slate-800 rounded-xl focus-visible:ring-orange-500 transition-all bg-transparent text-sm"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gate-login-remember-me"
                  checked={rememberMe}
                  onCheckedChange={(val) => setRememberMe(Boolean(val))}
                  className="border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label
                  htmlFor="gate-login-remember-me"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none"
                >
                  Remember me
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full text-base h-13 py-3.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={clientLoading || !loginIdentifier.trim() || !loginPassword}
            >
              {clientLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5" /> Login
                </span>
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 ml-1"
                >
                  Register Now
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* ================= REGISTRATION TAB ================= */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="space-y-1">
              <Label htmlFor="gate-business-type" className="flex items-center text-slate-700 dark:text-slate-300 font-bold text-sm">
                {type === 'restaurant' ? <Utensils className="h-4 w-4 mr-2" /> : type === 'parlour' ? <Sparkles className="h-4 w-4 mr-2" /> : <Building className="h-4 w-4 mr-2" />}
                Business Type
              </Label>
              <Select onValueChange={handleTypeChange} required value={type}>
                <SelectTrigger id="gate-business-type" className="h-11 border-gray-200 dark:border-slate-800 rounded-xl focus:ring-orange-500 bg-transparent text-sm">
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">
                    <div className="flex items-center"><Utensils className="h-4 w-4 mr-2 text-muted-foreground"/>Restaurant</div>
                  </SelectItem>
                  <SelectItem value="parlour">
                    <div className="flex items-center"><Sparkles className="h-4 w-4 mr-2 text-muted-foreground"/>Parlour</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="gate-division" className="flex items-center text-slate-700 dark:text-slate-300 font-bold text-sm">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  Division
                </Label>
                <Select onValueChange={(val) => { setDivision(val); setDistrict(''); }} required value={division}>
                  <SelectTrigger id="gate-division" className="h-11 border-gray-200 dark:border-slate-800 rounded-xl focus:ring-orange-500 bg-transparent text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(BD_ADDRESS_DATA).map(div => (
                      <SelectItem key={div} value={div}>{div}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="gate-district" className="flex items-center text-slate-700 dark:text-slate-300 font-bold text-sm">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  District
                </Label>
                <Select onValueChange={setDistrict} required value={district} disabled={!division}>
                  <SelectTrigger id="gate-district" className="h-11 border-gray-200 dark:border-slate-800 rounded-xl focus:ring-orange-500 bg-transparent text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {division && BD_ADDRESS_DATA[division].map(dist => (
                      <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="gate-register-password" className="flex items-center text-slate-700 dark:text-slate-300 font-bold text-sm">
                <Lock className="h-4 w-4 mr-2 text-slate-600" />
                Set Password
              </Label>
              <div className="relative">
                <Input
                  id="gate-register-password"
                  type={showRegisterPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  className="h-11 pr-11 border-gray-200 dark:border-slate-800 rounded-xl focus-visible:ring-orange-500 transition-all bg-transparent text-sm"
                  placeholder="Create password (min 6 characters)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Must be at least 6 characters long to secure your account.
              </p>
            </div>

            {/* Remember Me Checkbox for Registration */}
            <div className="flex items-center space-x-2 pt-0.5">
              <Checkbox
                id="gate-register-remember-me"
                checked={rememberMe}
                onCheckedChange={(val) => setRememberMe(Boolean(val))}
                className="border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <Label
                htmlFor="gate-register-remember-me"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none"
              >
                Remember me
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full text-base h-13 py-3.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2" 
              disabled={clientLoading || !businessName || !type || !whatsapp || !division || !district || !registerPassword || registerPassword.length < 6 || isWhatsAppInvalid}
            >
              {clientLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-5 w-5" /> Create Account
                </span>
              )}
            </Button>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 ml-1"
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
