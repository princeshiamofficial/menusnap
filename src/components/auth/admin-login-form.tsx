
"use client";

import { useState } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, LockKeyhole, ShieldCheck, Eye, EyeOff, UserCircle, KeyRound } from 'lucide-react'; // Added UserCircle, KeyRound

export function AdminLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin, adminLoading } = useAdminAuth(); // adminLoading might be useful for button state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminLogin(username, password);
  };

  return (
    <Card className="w-full max-w-md bg-card shadow-xl rounded-lg border border-border">
      <CardHeader className="text-center pt-8 pb-4">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit border border-primary/20">
           <ShieldCheck className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold text-foreground">Admin Access</CardTitle>
        <div className="mt-2">
          <Badge variant="secondary" className="bg-muted text-muted-foreground border border-border">
            <LockKeyhole className="h-3.5 w-3.5 mr-1.5" />
            Secure administrator login
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="admin-username" className="text-sm font-medium text-muted-foreground flex items-center">
              <UserCircle className="h-4 w-4 mr-2 text-muted-foreground/80" />
              Username
            </Label>
            <Input
              id="admin-username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="text-base bg-input border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium text-muted-foreground flex items-center">
              <KeyRound className="h-4 w-4 mr-2 text-muted-foreground/80" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base bg-input border-border focus:border-primary pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3" 
            disabled={adminLoading}
          >
            {adminLoading ? 'Logging In...' : 'Login'}
          </Button>
        </form>
        <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md flex items-start text-yellow-700 dark:text-yellow-400 dark:bg-yellow-700/10 dark:border-yellow-600/30">
          <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-500" />
          <p className="text-xs">
            This is a protected area. Unauthorized access attempts will be logged.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
