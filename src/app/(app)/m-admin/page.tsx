
"use client";

import type { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LayoutDashboard, 
  LogOut,
  ShoppingCart,
  DollarSign,
  FileText,
  Undo2,
  Download,
  AlertTriangle,
  Redo2,
  Landmark, // Using Landmark for Expense, similar to a bank/financial institution
  Smile // Added Smile icon
} from "lucide-react";

interface StatCardAdminProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconTextClass: string;
}

function StatCardAdmin({ title, value, icon: Icon, iconBgClass, iconTextClass }: StatCardAdminProps): ReactNode {
  return (
    <Card className="shadow-md rounded-lg bg-card hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${iconBgClass} flex-shrink-0`}>
          <Icon className={`h-7 w-7 ${iconTextClass}`} /> {/* Increased icon size slightly */}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p> 
        </div>
      </CardContent>
    </Card>
  );
}

const adminStats: StatCardAdminProps[] = [
  { title: "Total Sales", value: "998,150.00", icon: ShoppingCart, iconBgClass: "bg-sky-100 dark:bg-sky-900/50", iconTextClass: "text-sky-600 dark:text-sky-400" },
  { title: "Net", value: "0.00", icon: DollarSign, iconBgClass: "bg-green-100 dark:bg-green-900/50", iconTextClass: "text-green-600 dark:text-green-400" },
  { title: "Invoice due", value: "588,685.00", icon: FileText, iconBgClass: "bg-amber-100 dark:bg-amber-900/50", iconTextClass: "text-amber-600 dark:text-amber-400" },
  { title: "Total Sell Return", value: "0.00", icon: Undo2, iconBgClass: "bg-pink-100 dark:bg-pink-900/50", iconTextClass: "text-pink-600 dark:text-pink-400" },
  { title: "Total purchase", value: "129,030.00", icon: Download, iconBgClass: "bg-indigo-100 dark:bg-indigo-900/50", iconTextClass: "text-indigo-600 dark:text-indigo-400" },
  { title: "Purchase due", value: "0.00", icon: AlertTriangle, iconBgClass: "bg-yellow-100 dark:bg-yellow-900/50", iconTextClass: "text-yellow-600 dark:text-yellow-400" },
  { title: "Total Purchase Return", value: "0.00", icon: Redo2, iconBgClass: "bg-rose-100 dark:bg-rose-900/50", iconTextClass: "text-rose-600 dark:text-rose-400" },
  { title: "Expense", value: "0.00", icon: Landmark, iconBgClass: "bg-red-100 dark:bg-red-900/50", iconTextClass: "text-red-600 dark:text-red-400" },
];

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

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      <div className="rounded-lg bg-gradient-to-r from-slate-900 via-amber-700 to-primary p-6 shadow-lg text-white">
        <h2 className="text-3xl font-bold flex items-center">
          Welcome Admin <Smile className="ml-2 h-8 w-8" />
        </h2>
        <p className="mt-1 text-sm text-slate-200">
          Here's an overview of your business activity.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <Button variant="outline" onClick={adminLogout} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
          </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {adminStats.map((stat) => (
          <StatCardAdmin 
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconBgClass={stat.iconBgClass}
            iconTextClass={stat.iconTextClass}
          />
        ))}
      </div>

      <Card className="shadow-md rounded-lg mt-8">
        <CardHeader className="bg-card border-b">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">System Overview</CardTitle>
              <CardDescription className="text-sm text-muted-foreground pt-1">
                Additional system information and controls.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            This section can be used for other administrative tasks, settings, or system status details.
            Use the sidebar navigation to access different admin modules.
          </p>
          {/* You can add more specific content or components here as needed */}
        </CardContent>
      </Card>
    </div>
  );
}
