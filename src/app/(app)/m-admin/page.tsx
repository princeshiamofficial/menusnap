
"use client";

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function MAdminDashboardPage() {
  const { isAdminLoggedIn, adminLoading, adminLogout } = useAdminAuth();

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted dark:bg-neutral-900 p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto bg-card" />
          <Skeleton className="h-8 w-48 mx-auto bg-card" />
          <Skeleton className="h-6 w-64 mx-auto bg-card" />
          <Skeleton className="h-10 w-full mt-4 bg-card" />
          <Skeleton className="h-10 w-full bg-card" />
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <AdminLoginForm />
      </div>
    );
  }

  // If admin is logged in, show the dashboard
  return (
    <div className="space-y-6 p-6 sm:p-8 md:p-10">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <Button variant="outline" onClick={adminLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
      <Card className="shadow-md rounded-lg">
        <CardHeader className="bg-card">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Welcome to the Admin Panel</CardTitle>
              <CardDescription className="text-sm text-muted-foreground pt-1">
                Manage your application settings, users, and more from here.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground">
            This is the main dashboard for the administration section.
            Use the sidebar navigation to access different admin modules.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">125</p>
                    <p className="text-xs text-muted-foreground">Registered Users</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Content Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">842</p>
                    <p className="text-xs text-muted-foreground">Total Content Items</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-green-600 font-semibold">All Systems Operational</p>
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
