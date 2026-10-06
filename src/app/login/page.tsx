"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Utensils, Sparkles, LogIn, AlertCircle, MapPin, Mail, Lock, Eye, EyeOff, UserPlus, Phone, CheckCircle2 } from 'lucide-react';
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

function LoginContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const emailParam = searchParams.get('email');
  const whatsappParam = searchParams.get('whatsapp') || searchParams.get('phone');
  const nameParam = searchParams.get('name') || searchParams.get('business');
  const identifierParam = searchParams.get('identifier');
  const fromParam = searchParams.get('from');
  const hasParams = Boolean(
    fromParam ||
    emailParam ||
    whatsappParam ||
    nameParam ||
    tabParam === 'register'
  );

  const [activeTab, setActiveTab] = useState<'login' | 'register'>((hasParams && tabParam !== 'login') ? 'register' : 'login');
  const [accountExists, setAccountExists] = useState<boolean>(false);
  const [accountNeedsPassword, setAccountNeedsPassword] = useState<boolean>(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(identifierParam || whatsappParam || emailParam || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [businessName, setBusinessName] = useState(nameParam || '');
  const [email, setEmail] = useState(emailParam || '');
  const [whatsapp, setWhatsapp] = useState(whatsappParam || '');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [type, setType] = useState<'restaurant' | 'parlour' | ''>('restaurant');
  const [division, setDivision] = useState<string>('Dhaka');
  const [district, setDistrict] = useState<string>('Dhaka');

  // Common state
  const [rememberMe, setRememberMe] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  const { login, loginWithCredentials, clientLoading, isClientLoggedIn } = useClientAuth();
  const { setTheme } = useTheme();
  const router = useRouter();

  // Check if account already exists from searchParams on mount
  useEffect(() => {
    const targetId = (identifierParam || whatsappParam || emailParam || '').trim();
    if (targetId) {
      let isCancelled = false;
      checkClientStatus(targetId)
        .then(res => {
          if (isCancelled) return;
          if (res.success && res.exists) {
            if (res.hasPassword) {
              setAccountExists(true);
              setAccountNeedsPassword(false);
              setLoginIdentifier(targetId);
              if (tabParam !== 'register') {
                setActiveTab('login');
              }
            } else {
              // Account exists in DB but has NO password -> show registration / set password view
              setAccountExists(false);
              setAccountNeedsPassword(true);
              setActiveTab('register');
              if (res.client) {
                if (res.client.businessName) setBusinessName(res.client.businessName);
                if (res.client.businessType) {
                  setType(res.client.businessType);
                  setTheme(res.client.businessType === 'parlour' ? 'parlour' : 'default');
                }
                if (res.client.division) setDivision(res.client.division);
                if (res.client.district) setDistrict(res.client.district);
                if (res.client.email) setEmail(res.client.email);
                if (res.client.whatsappNumber) setWhatsapp(res.client.whatsappNumber);
              }
            }
          }
        })
        .catch(() => {});

      return () => {
        isCancelled = true;
      };
    }
    if (emailParam) setEmail(emailParam);
    if (whatsappParam) {
      setWhatsapp(whatsappParam);
      setLoginIdentifier(whatsappParam);
    }
    if (nameParam) setBusinessName(nameParam);
  }, [identifierParam, whatsappParam, emailParam, nameParam, tabParam, setTheme]);

  // When WhatsApp or Email is typed in registration, check if client already exists
  useEffect(() => {
    const targetId = (whatsapp || email || '').trim();
    if (targetId && (isValidWhatsApp(targetId) || targetId.includes('@'))) {
      let isCancelled = false;
      checkClientStatus(targetId)
        .then(res => {
          if (isCancelled) return;
          if (res.success && res.exists) {
            if (res.hasPassword) {
              setAccountExists(true);
              setAccountNeedsPassword(false);
              setLoginIdentifier(targetId);
              if (activeTab === 'register') {
                setActiveTab('login');
              }
            } else {
              // Account exists but needs password -> stay in register mode, prefill details!
              setAccountExists(false);
              setAccountNeedsPassword(true);
              setActiveTab('register');
              if (res.client) {
                if (res.client.businessName && !businessName) setBusinessName(res.client.businessName);
                if (res.client.businessType && !type) {
                  setType(res.client.businessType);
                  setTheme(res.client.businessType === 'parlour' ? 'parlour' : 'default');
                }
                if (res.client.division && !division) setDivision(res.client.division);
                if (res.client.district && !district) setDistrict(res.client.district);
                if (res.client.email && !email) setEmail(res.client.email);
              }
            }
          } else if (res.success && !res.exists) {
            setAccountExists(false);
            setAccountNeedsPassword(false);
          }
        })
        .catch(() => {});

      return () => {
        isCancelled = true;
      };
    }
  }, [whatsapp, email, activeTab, businessName, type, division, district, setTheme]);

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

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isClientLoggedIn && !loggingIn) {
      router.push('/dashboard#login-success');
    }
  }, [isClientLoggedIn, router, loggingIn]);

  const handleTypeChange = (value: 'restaurant' | 'parlour') => {
    setType(value);
    setTheme(value === 'parlour' ? 'parlour' : 'default');
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = loginIdentifier.trim();
    if (!cleanId || !loginPassword) return;

    // Pre-check if account has no password set in database
    const statusRes = await checkClientStatus(cleanId);
    if (statusRes.success && statusRes.exists && !statusRes.hasPassword) {
      setAccountNeedsPassword(true);
      setAccountExists(false);
      setActiveTab('register');
      if (statusRes.client) {
        if (statusRes.client.businessName) setBusinessName(statusRes.client.businessName);
        if (statusRes.client.businessType) {
          setType(statusRes.client.businessType);
          setTheme(statusRes.client.businessType === 'parlour' ? 'parlour' : 'default');
        }
        if (statusRes.client.division) setDivision(statusRes.client.division);
        if (statusRes.client.district) setDistrict(statusRes.client.district);
        if (statusRes.client.email) setEmail(statusRes.client.email);
        if (statusRes.client.whatsappNumber) setWhatsapp(statusRes.client.whatsappNumber);
      }
      return;
    }

    setLoggingIn(true);
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'login_attempt',
        method: 'credentials',
        identifier: cleanId,
      });
    }

    const success = await loginWithCredentials(
      cleanId,
      loginPassword,
      rememberMe,
      '/dashboard#login-success'
    );

    if (success) {
      if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: 'login_success',
          method: 'credentials',
          identifier: cleanId,
        });
        localStorage.setItem('loginSuccessUntil', (Date.now() + 20000).toString());
        localStorage.setItem('loginToastShown', 'false');
      }
    } else {
      setLoggingIn(false);
    }
  };

  // Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveBusinessName = (businessName || nameParam || '').trim() || (type === 'parlour' ? 'My Parlour' : 'My Restaurant');
    const effectiveWhatsapp = (whatsapp || whatsappParam || '').trim();
    const effectiveEmail = (email || emailParam || '').trim();

    if (effectiveBusinessName && type && registerPassword && division && district) {
      if (effectiveWhatsapp && !isValidWhatsApp(effectiveWhatsapp)) {
        return;
      }
      if (registerPassword.length < 6) {
        return;
      }
      setLoggingIn(true);

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
        '/dashboard#login-success',
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
          localStorage.setItem('loginSuccessUntil', (Date.now() + 20000).toString());
          localStorage.setItem('loginToastShown', 'false');
        }
      } else {
        setLoggingIn(false);
      }
    }
  };

  const isWhatsAppInvalid = whatsapp.length > 0 && !isValidWhatsApp(whatsapp);
  const businessNameLabel = type === 'restaurant' ? 'Restaurant Name' : type === 'parlour' ? 'Parlour Name' : 'Business Name';
  const businessNamePlaceholder = `Enter your ${type ? type : 'business'} name`;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/login-bg.png')" }}>
      {/* Backdrop overlay for soft blur and focus */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none relative overflow-hidden z-10 bg-white">
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
          <div className="px-8 pt-5 pb-1">
            <CardDescription className="text-[#64748b] font-medium text-center text-sm">
              {activeTab === 'register'
                ? 'Complete your account registration'
                : accountExists
                ? 'Welcome back! Please login with your password'
                : 'Access your dedicated menu builder'}
            </CardDescription>

            {/* Segmented Tab Switcher */}
            <div className="mt-3 p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Registration
              </button>
            </div>

            {/* If account already exists with password */}
            {activeTab === 'login' && accountExists && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200/90 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 shadow-xs text-left">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-950">Account Already Exists</p>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    An existing account was found for <span className="font-semibold">{loginIdentifier || whatsapp}</span>. Please enter your password to login.
                  </p>
                </div>
              </div>
            )}

            {/* If account exists but needs password setup */}
            {activeTab === 'register' && accountNeedsPassword && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-xs text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Account Found — Complete Registration</p>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    An existing record was found for <span className="font-semibold">{whatsapp || email || loginIdentifier}</span>. Please choose a password and confirm your details to activate your account.
                  </p>
                </div>
              </div>
            )}

            {/* If redirected from checkout as a new user */}
            {activeTab === 'register' && hasParams && !accountNeedsPassword && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200/90 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 shadow-xs text-left">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">Payment Verified!</p>
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Please choose a password to complete your account registration.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-4">
          {activeTab === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in-50 duration-200">
              <div className="space-y-1.5">
                <Label htmlFor="login-identifier" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                  <WhatsAppIcon className="h-4 w-4 mr-2 text-green-600" />
                  WhatsApp or Email
                </Label>
                <Input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  className="h-12 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all text-sm"
                  placeholder="Enter your WhatsApp number or email"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                    <Lock className="h-4 w-4 mr-2 text-slate-600" />
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="h-12 pr-11 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all text-sm"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
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
                    id="login-remember-me"
                    checked={rememberMe}
                    onCheckedChange={(val) => setRememberMe(Boolean(val))}
                    className="border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                  />
                  <Label
                    htmlFor="login-remember-me"
                    className="text-xs font-semibold text-slate-600 cursor-pointer select-none"
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
                <p className="text-xs text-slate-500">
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
            /* ================= REGISTRATION FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="space-y-1">
                <Label htmlFor="business-type" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                  {type === 'restaurant' ? <Utensils className="h-4 w-4 mr-2" /> : type === 'parlour' ? <Sparkles className="h-4 w-4 mr-2" /> : <Building className="h-4 w-4 mr-2" />}
                  Business Type
                </Label>
                <Select onValueChange={handleTypeChange} required value={type}>
                  <SelectTrigger id="business-type" className="h-11 border-gray-200 rounded-xl focus:ring-orange-500 text-sm">
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

              <div className="space-y-1">
                <Label htmlFor="business-name" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                  <Building className="h-4 w-4 mr-2 text-slate-600" />
                  {businessNameLabel}
                </Label>
                <Input
                  id="business-name"
                  type="text"
                  placeholder={businessNamePlaceholder}
                  className="h-11 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all text-sm"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="register-whatsapp" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                    <WhatsAppIcon className="h-4 w-4 mr-1.5 text-green-600" />
                    WhatsApp
                  </Label>
                  <Input
                    id="register-whatsapp"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="h-11 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all text-sm"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="register-email" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                    <Mail className="h-4 w-4 mr-1.5 text-slate-600" />
                    Email (Optional)
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="name@email.com"
                    className="h-11 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="division" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    Division
                  </Label>
                  <Select onValueChange={(val) => { setDivision(val); setDistrict(''); }} required value={division}>
                    <SelectTrigger id="division" className="h-11 border-gray-200 rounded-xl focus:ring-orange-500 text-sm">
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
                  <Label htmlFor="district" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    District
                  </Label>
                  <Select onValueChange={setDistrict} required value={district} disabled={!division}>
                    <SelectTrigger id="district" className="h-11 border-gray-200 rounded-xl focus:ring-orange-500 text-sm">
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
                <Label htmlFor="register-password" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                  <Lock className="h-4 w-4 mr-2 text-slate-600" />
                  {accountNeedsPassword ? 'Set New Password' : 'Set Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    className="h-11 pr-11 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all text-sm"
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Must be at least 6 characters long to secure your account.
                </p>
              </div>

              {/* Remember Me Checkbox for Registration */}
              <div className="flex items-center space-x-2 pt-0.5">
                <Checkbox
                  id="register-remember-me"
                  checked={rememberMe}
                  onCheckedChange={(val) => setRememberMe(Boolean(val))}
                  className="border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label
                  htmlFor="register-remember-me"
                  className="text-xs font-semibold text-slate-600 cursor-pointer select-none"
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
                    {accountNeedsPassword ? 'Completing Setup...' : 'Creating Account...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    {accountNeedsPassword ? 'Complete Registration' : 'Create Account'}
                  </span>
                )}
              </Button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black/25">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
