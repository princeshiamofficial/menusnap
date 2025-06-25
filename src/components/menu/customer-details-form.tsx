
"use client";

import type { ReactNode } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { MenuItem } from './menu-preview-dialog'; // Import MenuItem for typing
import { User, Phone, Mail, Building, MapPin, Briefcase } from 'lucide-react';

const customerDetailsSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phoneNumber: z.string().min(10, "Phone number seems too short").max(20)
    .regex(/^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/, "Invalid phone number format"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  businessName: z.string().min(1, "Business name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  deliveryAddress: z.string().min(1, "Delivery address is required").max(250),
});

export type CustomerDetailsFormValues = z.infer<typeof customerDetailsSchema>;

interface CustomerDetailsFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: CustomerDetailsFormValues) => void;
  selectedItems: MenuItem[]; // Receive selected items
  isSubmitting: boolean;
}

export function CustomerDetailsForm({
  isOpen,
  onOpenChange,
  onSubmit,
  selectedItems,
  isSubmitting,
}: CustomerDetailsFormProps): ReactNode {
  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      email: "",
      businessName: "",
      role: "",
      deliveryAddress: "",
    },
    mode: "onChange",
  });

  const handleFormSubmit = (data: CustomerDetailsFormValues) => {
    onSubmit(data);
    // Do not reset form here, parent component handles it.
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset(); // Reset form if dialog is closed without submitting
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Your Details</DialogTitle>
          <DialogDescription>
            Please provide your information to share the menu selection.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-grow px-6 py-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><User className="h-4 w-4 mr-2 text-muted-foreground"/>Your Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Phone className="h-4 w-4 mr-2 text-muted-foreground"/>Phone Number*</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="e.g., +8801XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Mail className="h-4 w-4 mr-2 text-muted-foreground"/>Email*</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Building className="h-4 w-4 mr-2 text-muted-foreground"/>Business Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Your business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Briefcase className="h-4 w-4 mr-2 text-muted-foreground"/>Your Role*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Owner, Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground"/>Delivery Address*</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full delivery address" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 py-4 border-t mt-auto">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => form.reset()}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? "Submitting..." : "Confirm Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
