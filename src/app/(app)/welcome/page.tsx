"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
            <Briefcase className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold">Welcome to BizView!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            This is your application's main dashboard area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            All primary features (Dashboard, Appointments, Transactions) have been removed or placeholder.
            You can now build new features or customize the application as needed.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Navigate using the sidebar or user menu if applicable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
