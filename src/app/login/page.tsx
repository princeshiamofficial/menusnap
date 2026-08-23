
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Utensils, Sparkles, LogIn, AlertCircle, MapPin, Mail } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { isValidWhatsApp } from '@/lib/utils';

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

export default function LoginPage() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [type, setType] = useState<'restaurant' | 'parlour' | ''>('');
  const [division, setDivision] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [loggingIn, setLoggingIn] = useState(false);
  const { login, clientLoading, isClientLoggedIn } = useClientAuth();
  const { setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isClientLoggedIn && !loggingIn) {
      router.push('/dashboard#login-success');
    }
  }, [isClientLoggedIn, router, loggingIn]);

  const handleTypeChange = (value: 'restaurant' | 'parlour') => {
    setType(value);
    setTheme(value === 'parlour' ? 'parlour' : 'default');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName && type && whatsapp && division && district) {
      if (!isValidWhatsApp(whatsapp)) {
        return;
      }
      setLoggingIn(true);

      // Push GTM login_attempt event
      if (typeof window !== 'undefined') {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: 'login_attempt',
          business_type: type,
          business_name: businessName,
          email: email,
          division: division,
          district: district,
        });
      }

      const success = await login(businessName, type, whatsapp, division, district, email, '/dashboard#login-success');
      if (success) {
        if (typeof window !== 'undefined') {
          // Push GTM login_success event
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push({
            event: 'login_success',
            method: 'whatsapp',
            business_type: type,
            business_name: businessName,
            email: email,
          });
          (window as any).dataLayer.push({
            event: 'login_success',
            method: 'whatsapp',
            business_type: type,
            business_name: businessName,
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

      <Card className="w-full max-w-md shadow-2xl rounded-2xl border-none relative overflow-hidden z-10">
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
            <div className="px-8 pt-6 pb-2">
                <CardDescription className="text-[#64748b] font-medium text-center">Access your dedicated menu builder</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="p-8 pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="business-type" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                {type === 'restaurant' ? <Utensils className="h-4 w-4 mr-2" /> : type === 'parlour' ? <Sparkles className="h-4 w-4 mr-2" /> : <Building className="h-4 w-4 mr-2" />}
                Business Type
              </Label>
              <Select onValueChange={handleTypeChange} required value={type}>
                <SelectTrigger id="business-type" className="h-12 border-gray-200 rounded-xl focus:ring-orange-500">
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
                  <Building className="h-4 w-4 mr-2" />
                  {businessNameLabel}
              </Label>
              <Input
                id="business-name"
                type="text"
                className="h-12 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all"
                placeholder={businessNamePlaceholder}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="division" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Division
                </Label>
                <Select onValueChange={(val) => { setDivision(val); setDistrict(''); }} required value={division}>
                  <SelectTrigger id="division" className="h-12 border-gray-200 rounded-xl focus:ring-orange-500">
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
                  <MapPin className="h-4 w-4 mr-2" />
                  District
                </Label>
                <Select onValueChange={setDistrict} required value={district} disabled={!division}>
                  <SelectTrigger id="district" className="h-12 border-gray-200 rounded-xl focus:ring-orange-500">
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
              <Label htmlFor="email" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                className="h-12 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="whatsapp" className="flex items-center text-[#1a2b4b] font-bold text-sm">
                  <WhatsAppIcon className="h-4 w-4 mr-2" />
                  WhatsApp Number
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                className={`h-12 border-gray-200 rounded-xl focus-visible:ring-orange-500 transition-all ${isWhatsAppInvalid ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                placeholder="Enter your WhatsApp number"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
              {isWhatsAppInvalid && (
                <p className="text-xs text-red-500 flex items-center mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Please enter a valid active WhatsApp mobile number
                </p>
              )}
            </div>
            <Button 
                type="submit" 
                className="w-full text-lg h-14 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={clientLoading || !businessName || !type || !whatsapp || !division || !district || isWhatsAppInvalid}
            >
                {clientLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Verifying...
                  </span>
                ) : (
                  <> <LogIn className="mr-2 h-5 w-5" /> Login </>
                )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
