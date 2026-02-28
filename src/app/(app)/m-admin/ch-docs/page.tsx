"use client";

import type { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

export default function CHDocsPage(): ReactNode {
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
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 h-full flex flex-col">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center">
                        <FolderKanban className="h-8 w-8 mr-3 text-primary" />
                        CH Docs
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage Color Hut Documents</p>
                </div>
            </header>

            <section className="bg-card p-4 sm:p-6 rounded-lg shadow border border-border flex flex-col flex-grow min-h-0">
                <Card className="shadow-none border-0">
                    <CardHeader className="px-0">
                        <CardTitle>Coming Soon</CardTitle>
                        <CardDescription>
                            This section is currently under development. Here you will be able to manage all CH-specific internal documents.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <p className="text-muted-foreground text-sm">
                            Check back later for updates.
                        </p>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
