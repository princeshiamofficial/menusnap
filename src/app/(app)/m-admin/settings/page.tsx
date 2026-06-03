
"use client";

import type { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, KeyRound, Mail, Save, AlertTriangle, Facebook, MessageCircle, Trash2, ShieldCheck, Zap, Laptop, Globe as GlobeIcon, X } from 'lucide-react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getMetaPixelSettings, saveMetaPixelSettings, type MetaPixelSettings } from '@/app/actions/meta-events';
import {
  getBookingSlotsAction,
  addBookingSlotAction,
  deleteBookingSlotAction,
  clearAllBookingSlotsAction,
  generateBookingSlotsAction
} from '@/app/actions/bookings';


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

const whatsAppSettingsFormSchema = z.object({
  isEnabled: z.boolean(),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type MetaPixelFormValues = z.infer<typeof metaPixelFormSchema>;
type WhatsAppSettingsFormValues = z.infer<typeof whatsAppSettingsFormSchema>;


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
        description: "Your email has been updated successfully.",
        variant: "success",
      });
    } catch (error) {
    }
  }

  return (
    <Card className="rounded-[2.5rem] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden bg-white/70 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl">
                <Mail className="h-5 w-5" />
            </div>
            <div>
                <CardTitle className="text-xl font-black tracking-tight">Admin Email</CardTitle>
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security & Account</CardDescription>
            </div>
        </div>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Current Email</Label>
            <div className="px-4 py-3 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-500 font-medium text-sm select-none">
              {adminUser?.email || 'Loading...'}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newEmail" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">New Email Address</Label>
            <Input id="newEmail" type="email" {...form.register("newEmail")} placeholder="Enter new email address" className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-indigo-500/50 bg-white/50" />
            {form.formState.errors.newEmail && <p className="text-[11px] text-destructive font-bold mt-1 ml-1">{form.formState.errors.newEmail.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currentPasswordEmail" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Confirm Password</Label>
            <Input id="currentPasswordEmail" type="password" {...form.register("currentPassword")} placeholder="Enter current password" className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-indigo-500/50 bg-white/50" />
            {form.formState.errors.currentPassword && <p className="text-[11px] text-destructive font-bold mt-1 ml-1">{form.formState.errors.currentPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="pb-6 pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 text-sm font-bold transition-all active:scale-[0.98]">
            {isSubmitting ? "Updating..." : "Update Email Address"}
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
    }
  }

  return (
    <Card className="rounded-[2.5rem] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden bg-white/70 backdrop-blur-xl">
      <CardHeader className="pb-2">
         <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl">
                <KeyRound className="h-5 w-5" />
            </div>
            <div>
                <CardTitle className="text-xl font-black tracking-tight">Security</CardTitle>
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Change Admin Password</CardDescription>
            </div>
        </div>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPasswordPass" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Current Password</Label>
            <Input id="currentPasswordPass" type="password" {...form.register("currentPassword")} placeholder="Verify current password" className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-rose-500/50 bg-white/50" />
             {form.formState.errors.currentPassword && <p className="text-[11px] text-destructive font-bold mt-1 ml-1">{form.formState.errors.currentPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">New Password</Label>
            <Input id="newPassword" type="password" {...form.register("newPassword")} placeholder="Create secure password" className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-rose-500/50 bg-white/50" />
            {form.formState.errors.newPassword && <p className="text-[11px] text-destructive font-bold mt-1 ml-1">{form.formState.errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} placeholder="Repeat new password" className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-rose-500/50 bg-white/50" />
            {form.formState.errors.confirmPassword && <p className="text-[11px] text-destructive font-bold mt-1 ml-1">{form.formState.errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="pb-6 pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-100 text-sm font-bold transition-all active:scale-[0.98]">
            {isSubmitting ? "Saving..." : "Update Password"}
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
      }
    }
    loadSettings();
  }, [form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(data: MetaPixelFormValues) {
    try {
      await saveMetaPixelSettings(data);
      toast({
        title: "Success",
        description: "Meta Pixel settings updated.",
        variant: "success",
      });
    } catch (error: any) {
    }
  }

  return (
    <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden bg-white/70 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <Facebook className="h-5 w-5" />
                </div>
                <div>
                    <CardTitle className="text-xl font-black tracking-tight">Meta Events</CardTitle>
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pixel & Conversions API</CardDescription>
                </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50/50 px-4 py-2 rounded-2xl border border-slate-100">
                <Switch
                    id="isEnabled"
                    checked={form.watch("isEnabled")}
                    onCheckedChange={(checked) => form.setValue("isEnabled", checked)}
                    className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="isEnabled" className="text-xs font-black uppercase tracking-widest text-slate-500 cursor-pointer">{form.watch("isEnabled") ? "Active" : "Inactive"}</Label>
            </div>
        </div>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <Label htmlFor="pixelId" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Pixel ID</Label>
                <Input id="pixelId" {...form.register("pixelId")} placeholder="00000000000000" className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-blue-500/50 bg-white/50" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="testEventCode" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Test Event Code</Label>
                <Input id="testEventCode" {...form.register("testEventCode")} placeholder="TEST00000" className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-blue-500/50 bg-white/50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="accessToken" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Access Token</Label>
            <Input id="accessToken" type="password" {...form.register("accessToken")} placeholder="EAAb..." className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-blue-500/50 bg-white/50 font-mono text-sm" />
            <div className="flex items-center gap-1.5 ml-1 mt-2">
                <div className="h-1 w-1 bg-amber-400 rounded-full" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Token is encrypted and hidden for security</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pb-8 pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-100 text-sm font-bold transition-all active:scale-[0.98]">
            {isSubmitting ? "Syncing..." : "Apply Pixel Settings"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function BookingSlotsSettingsForm(): ReactNode {
  const { toast } = useToast();
  const [slots, setSlots] = useState<{ id: number; time_slot: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newSlot, setNewSlot] = useState("");

  // Generator states
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("09:00 PM");
  const [interval, setIntervalVal] = useState(30);
  const [generating, setGenerating] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await getBookingSlotsAction();
      if (res.success && res.data) {
        setSlots(res.data);
      } else {
        toast({ title: "Error", description: res.error || "Failed to load slots.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to connect to server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.trim()) return;

    setAdding(true);
    try {
      const res = await addBookingSlotAction(newSlot);
      if (res.success) {
        toast({ title: "Success", description: `Slot ${newSlot} added successfully.`, variant: "success" });
        setNewSlot("");
        fetchSlots();
      } else {
        toast({ title: "Error", description: res.error || "Failed to add slot.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSlot = async (id: number, time_slot: string) => {
    try {
      const res = await deleteBookingSlotAction(id);
      if (res.success) {
        toast({ title: "Deleted", description: `Slot ${time_slot} removed.`, variant: "success" });
        setSlots((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast({ title: "Error", description: res.error || "Failed to delete slot.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    }
  };

  const handleGenerateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await generateBookingSlotsAction(startTime, endTime, interval);
      if (res.success) {
        toast({ title: "Success", description: `Generated ${res.count} slots successfully.`, variant: "success" });
        fetchSlots();
      } else {
        toast({ title: "Error", description: res.error || "Failed to generate slots.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to delete all booking slots? Clients won't be able to book strategy calls until you add new slots.")) return;
    try {
      const res = await clearAllBookingSlotsAction();
      if (res.success) {
        toast({ title: "Success", description: "All slots cleared.", variant: "success" });
        setSlots([]);
      } else {
        toast({ title: "Error", description: res.error || "Failed to clear slots.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An error occurred.", variant: "destructive" });
    }
  };

  return (
    <Card className="rounded-[2.5rem] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden bg-white/70 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-2xl">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Consultation Slots</CardTitle>
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Time Slots</CardDescription>
            </div>
          </div>
          {slots.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-xl px-3 h-9 font-bold text-xs"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Current Slots Badges */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Active Slots ({slots.length})</Label>
          <div className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 min-h-[100px] flex flex-wrap gap-2 items-center justify-start">
            {loading ? (
              <p className="text-slate-400 text-xs font-semibold animate-pulse mx-auto">Loading available slots...</p>
            ) : slots.length === 0 ? (
              <p className="text-slate-400 text-xs font-semibold mx-auto">No active booking slots. Use the options below to add slots.</p>
            ) : (
              <AnimatePresence>
                {slots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-sm hover:border-orange-500/50 transition-colors"
                  >
                    <span>{slot.time_slot}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id, slot.time_slot)}
                      className="text-slate-400 hover:text-red-500 rounded-full p-0.5 transition-colors"
                      title="Remove Slot"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Add custom slot form */}
        <form onSubmit={handleAddSlot} className="space-y-2.5">
          <Label htmlFor="newSlot" className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Add Custom Slot</Label>
          <div className="flex gap-2">
            <Input
              id="newSlot"
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="e.g. 09:00 AM or 05:30 PM"
              className="h-12 rounded-2xl border-slate-100 focus:ring-0 focus:border-orange-500/50 bg-white/50 flex-1 font-semibold"
            />
            <Button
              type="submit"
              disabled={adding || !newSlot.trim()}
              className="h-12 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase active:scale-[0.98] transition-all"
            >
              Add Slot
            </Button>
          </div>
        </form>

        <hr className="border-slate-100 my-4" />

        {/* Quick Batch Generator */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-widest">Batch Generate Slots</Label>
            <p className="text-[11px] text-slate-400 font-medium ml-1">Generate a range of slots automatically (e.g., 9:00 AM to 9:00 PM).</p>
          </div>

          <form onSubmit={handleGenerateSlots} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Start Time</Label>
              <Input
                id="startTime"
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 09:00 AM"
                className="h-11 rounded-xl border-slate-100 bg-white/50 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">End Time</Label>
              <Input
                id="endTime"
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="e.g. 09:00 PM"
                className="h-11 rounded-xl border-slate-100 bg-white/50 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interval" className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Interval (Minutes)</Label>
              <select
                id="interval"
                value={interval}
                onChange={(e) => setIntervalVal(parseInt(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-slate-100 bg-white/50 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500/50"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 hour)</option>
                <option value={120}>120 Minutes (2 hours)</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-3 pt-2">
              <Button
                type="submit"
                disabled={generating}
                className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-100 text-white font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all"
              >
                {generating ? "Generating..." : "Generate Slots Range"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}


export default function AdminSettingsPage(): ReactNode {
  const { adminLoading } = useAdminAuth();

  if (adminLoading) return null;

  return (
    <div className="min-h-screen bg-[#fafbfc] w-full overflow-x-hidden relative selection:bg-primary/10">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-slate-100/50 to-transparent pointer-events-none" />
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-[-10%] w-[500px] h-[500px] bg-emerald-50/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-12"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-10">
                    <MetaPixelSettingsForm />
                    <BookingSlotsSettingsForm />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-10">

                    <div className="grid grid-cols-1 gap-8">
                        <ChangeEmailForm />
                        <ChangePasswordForm />
                    </div>
                </motion.div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
