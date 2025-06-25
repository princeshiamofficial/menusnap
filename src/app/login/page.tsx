
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Utensils, Sparkles, LogIn } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const [businessName, setBusinessName] = useState('');
  const [type, setType] = useState<'restaurant' | 'parlour' | ''>('');
  const { login, clientLoading } = useClientAuth();
  const { setTheme } = useTheme();

  const handleTypeChange = (value: 'restaurant' | 'parlour') => {
    setType(value);
    setTheme(value === 'parlour' ? 'parlour' : 'default');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName && type) {
      login(businessName, type);
    }
  };
  
  const businessNameLabel = type === 'restaurant' ? 'Restaurant Name' : type === 'parlour' ? 'Parlour Name' : 'Business Name';
  const businessNamePlaceholder = `Enter your ${type ? type : 'business'} name`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl border-border">
        <CardHeader className="text-center p-8">
            <div className="bg-black p-4 rounded-lg mb-4">
                <Image
                    src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                    alt="Color Hut Logo"
                    width={200}
                    height={80}
                    className="object-contain mx-auto"
                    priority
                />
            </div>
          <CardDescription className="font-bold text-foreground">Access your dedicated menu builder</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business-name" className="flex items-center text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  {businessNameLabel}
              </Label>
              <Input
                id="business-name"
                type="text"
                placeholder={businessNamePlaceholder}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-type" className="flex items-center text-muted-foreground">
                {type === 'restaurant' ? <Utensils className="h-4 w-4 mr-2" /> : type === 'parlour' ? <Sparkles className="h-4 w-4 mr-2" /> : <Building className="h-4 w-4 mr-2" />}
                Business Type
              </Label>
              <Select onValueChange={handleTypeChange} required value={type}>
                <SelectTrigger id="business-type">
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
            <Button type="submit" className="w-full text-lg py-3" disabled={clientLoading || !businessName || !type}>
                {clientLoading ? 'Logging In...' : <> <LogIn className="mr-2 h-5 w-5" /> Login </>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
