"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react'; // Using Briefcase as a generic business icon

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Password field for UI, though mock auth won't use it
  const { login, loading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, any email will "log in" as Demo User
    login(email, 'Demo User');
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
           <Briefcase className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">BizView</CardTitle>
        <CardDescription>Sign in to manage your business</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Use any email and password for demo purposes.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
