
"use client";

import type { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, KeyRound, Mail, Save, AlertTriangle, Facebook } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';
import { getMetaPixelSettings, saveMetaPixelSettings, type MetaPixelSettings } from '@/app/actions/meta-events';

// Zod schemas for validation
const emailFormSchema = z.object({
  newEmail: z.string().email("Invalid email address."),
  currentPassword: z.string().min(1, "Current password is required."),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const metaPixelFormSchema = z.object({
  isEnabled: z.boolean(),
  pixelId: z.string().optional(),
  accessToken: z.string().optional(),
  testEventCode: z.string().optional(),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type MetaPixelFormValues = z.infer<typeof metaPixelFormSchema>;

function ChangeEmailForm(): ReactNode {
  const { adminUser, updateAdminEmail } = useAdminAuth();
  const { toast } = useToast();
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    }
  });
  
  const { isSubmitting } = form.formState;

  async function onSubmit(data: EmailFormValues) {
    try {
      await updateAdminEmail(data.newEmail, data.currentPassword);
      form.reset();
      toast({
        title: "Success",
        description: "Your email has been updated. You will need to log in with the new email next time.",
      });
    } catch (error) {
      // Error toast is handled in the hook, so no need to show another one here.
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5" /> Change Email</CardTitle>
        <CardDescription>Update the email address associated with your admin account.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Current Email</Label>
            <Input value={adminUser?.email || 'Loading...'} disabled />
          </div>
          <div className="space-y-1">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input id="newEmail" type="email" {...form.register("newEmail")} placeholder="Enter new email address" />
            {form.formState.errors.newEmail && <p className="text-sm text-destructive mt-1">{form.formState.errors.newEmail.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="currentPasswordEmail">Current Password</Label>
            <Input id="currentPasswordEmail" type="password" {...form.register("currentPassword")} placeholder="Enter current password"/>
            {form.formState.errors.currentPassword && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Email"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function ChangePasswordForm(): ReactNode {
  const { updateAdminPassword } = useAdminAuth();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: PasswordFormValues) {
    try {
      await updateAdminPassword(data.newPassword, data.currentPassword);
      form.reset();
    } catch (error) {
       // Error toast is handled in the hook
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5" /> Change Password</CardTitle>
        <CardDescription>Update the password for your admin account.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="currentPasswordPass">Current Password</Label>
            <Input id="currentPasswordPass" type="password" {...form.register("currentPassword")} placeholder="Enter current password" />
             {form.formState.errors.currentPassword && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" {...form.register("newPassword")} placeholder="Enter new password" />
            {form.formState.errors.newPassword && <p className="text-sm text-destructive mt-1">{form.formState.errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} placeholder="Confirm new password" />
            {form.formState.errors.confirmPassword && <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
             <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function MetaPixelSettingsForm(): ReactNode {
  const { toast } = useToast();
  const form = useForm<MetaPixelFormValues>({
    resolver: zodResolver(metaPixelFormSchema),
    defaultValues: {
      isEnabled: false,
      pixelId: "",
      accessToken: "",
      testEventCode: "",
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getMetaPixelSettings();
        form.reset(settings);
      } catch (error: any) {
        toast({
          title: "Error Loading Settings",
          description: "Could not load Meta Pixel settings.",
          variant: "destructive",
        });
      }
    }
    loadSettings();
  }, [form, toast]);

  const { isSubmitting } = form.formState;

  async function onSubmit(data: MetaPixelFormValues) {
    try {
      await saveMetaPixelSettings(data);
      toast({
        title: "Success",
        description: "Meta Pixel settings have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Settings",
        description: error.message || "Could not save Meta Pixel settings.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center"><Facebook className="mr-2 h-5 w-5" /> Meta Pixel & Conversions API</CardTitle>
        <CardDescription>Manage server-side event tracking for Meta (Facebook).</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="isEnabled"
              checked={form.watch("isEnabled")}
              onCheckedChange={(checked) => form.setValue("isEnabled", checked)}
            />
            <Label htmlFor="isEnabled" className="cursor-pointer">Enable Server-Side Tracking</Label>
          </div>
          <div className="space-y-1">
            <Label htmlFor="pixelId">Pixel ID</Label>
            <Input id="pixelId" {...form.register("pixelId")} placeholder="Enter your Meta Pixel ID" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input id="accessToken" type="password" {...form.register("accessToken")} placeholder="Enter your Conversions API Access Token" />
            <p className="text-xs text-muted-foreground">Your token is stored securely and will not be displayed again.</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="testEventCode">Test Event Code</Label>
            <Input id="testEventCode" {...form.register("testEventCode")} placeholder="Optional: Enter code from Events Manager" />
             <p className="text-xs text-muted-foreground">Use this to test your server events in Meta's Events Manager.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function AdminSettingsPage(): ReactNode {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <AdminLoginForm />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
       <header>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3 text-primary" />
            Admin Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account credentials and integration settings.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MetaPixelSettingsForm />
            <ChangeEmailForm />
            <ChangePasswordForm />
        </div>
         <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md flex items-start text-yellow-700 dark:text-yellow-400 dark:bg-yellow-700/10 dark:border-yellow-600/30">
          <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-500" />
          <p className="text-sm">
            For security, changing your email or password requires you to enter your current password. Updating your credentials will not log you out of your current session.
          </p>
        </div>
    </div>
  );
}
