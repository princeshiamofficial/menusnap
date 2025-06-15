
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";

export default function CPanelPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SlidersHorizontal className="mr-2 h-6 w-6 text-primary" />
            cPanel - Control Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to the cPanel. Manage your application settings and configurations here.
          </p>
          {/* Placeholder for cPanel content */}
          <div className="mt-6 p-8 border border-dashed rounded-lg text-center text-muted-foreground">
            cPanel Functionality Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
