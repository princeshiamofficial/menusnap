
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Layers } from "lucide-react";

export default function ManageTemplatesPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-7 w-7 text-primary" />
            <CardTitle className="text-2xl font-bold">Manage Templates</CardTitle>
          </div>
          <CardDescription>
            View, edit, and manage all available templates for your users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Template management functionality will be implemented here.
          </p>
          {/* Placeholder for future template listing, filtering, and actions */}
        </CardContent>
      </Card>
    </div>
  );
}
