
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useClientAuth } from '@/hooks/use-client-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Utensils, Sparkles, LogIn } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const [companyName, setCompanyName] = useState('');
  const [type, setType] = useState<'restaurant' | 'parlour' | ''>('');
  const { login, clientLoading } = useClientAuth();
  const { setTheme } = useTheme();

  const handleTypeChange = (value: 'restaurant' | 'parlour') => {
    setType(value);
    setTheme(value === 'parlour' ? 'parlour' : 'default');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName && type) {
      login(companyName, type);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl border-border">
        <CardHeader className="text-center p-8">
            <Image
                src="https://erp.colorhutbd.xyz/file/uploads/68515c4146a92_Color%20hut%20logo.png"
                alt="Color Hut Logo"
                width={200}
                height={80}
                className="object-contain mx-auto mb-4"
                priority
            />
          <CardTitle className="text-2xl font-bold">Client Login</CardTitle>
          <CardDescription>Access your dedicated menu builder</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="flex items-center text-muted-foreground">
                  <Building className="h-4 w-4 mr-2" />
                  Company Name
              </Label>
              <Input
                id="company-name"
                type="text"
                placeholder="Enter your company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-type" className="flex items-center text-muted-foreground">
                {type === 'restaurant' ? <Utensils className="h-4 w-4 mr-2" /> : type === 'parlour' ? <Sparkles className="h-4 w-4 mr-2" /> : <Building className="h-4 w-4 mr-2" />}
                Company Type
              </Label>
              <Select onValueChange={handleTypeChange} required value={type}>
                <SelectTrigger id="company-type">
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
            <Button type="submit" className="w-full text-lg py-3" disabled={clientLoading || !companyName || !type}>
                {clientLoading ? 'Logging In...' : <> <LogIn className="mr-2 h-5 w-5" /> Login </>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
