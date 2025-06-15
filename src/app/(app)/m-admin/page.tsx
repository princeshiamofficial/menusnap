"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminPanelPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="bg-muted/50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Admin Panel</CardTitle>
              <CardDescription className="text-muted-foreground pt-1">
                Centralized administration and management.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-lg text-foreground">
            Welcome to the Admin Panel.
          </p>
          <p className="mt-2 text-muted-foreground">
            This section is dedicated to system administration, user management, and overall application settings.
            More features will be integrated here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
