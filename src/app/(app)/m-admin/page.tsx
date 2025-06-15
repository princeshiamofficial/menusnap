
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function MAdminDashboardPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            {/* Can add buttons or actions here later */}
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
