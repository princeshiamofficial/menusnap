
"use client";

import type { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Package } from "lucide-react";

export default function ManageProductsPage(): ReactNode {
  const { isAdminLoggedIn, adminLoading } = useAdminAuth();

  if (adminLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading Admin Area...</p>
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground flex items-center">
          <Package className="h-8 w-8 mr-3 text-primary" />
          Manage Products
        </h1>
        <p className="text-muted-foreground mt-1">
          This section is under construction.
        </p>
      </header>
      <div className="text-center py-20 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">Product management functionality will be available here soon.</p>
      </div>
    </div>
  );
}
