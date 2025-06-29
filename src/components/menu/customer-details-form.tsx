
"use client";

import * as React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MenuItem } from './menu-preview-dialog'; // Import MenuItem for typing
import { User, Phone, Mail, Building, MapPin, Briefcase } from 'lucide-react';
import type { ClientUser } from '@/hooks/use-client-auth';

const CUSTOMER_DETAILS_STORAGE_KEY = 'colorHutCustomerDetails';

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
  selectedMenuType: string;
  clientUser: ClientUser | null;
}

export function CustomerDetailsForm({
  isOpen,
  onOpenChange,
  onSubmit,
  selectedItems,
  isSubmitting,
  selectedMenuType,
  clientUser,
}: CustomerDetailsFormProps): ReactNode {
  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      email: "",
      businessName: clientUser?.businessName || "",
      role: "",
      deliveryAddress: "",
    },
    mode: "onChange",
  });
  
  React.useEffect(() => {
    // When the dialog opens, pre-fill with saved data or client user data.
    if (isOpen) {
      let defaultValues: CustomerDetailsFormValues = {
        customerName: "",
        phoneNumber: "",
        email: "",
        businessName: clientUser?.businessName || "",
        role: "",
        deliveryAddress: "",
      };
      try {
        const savedDetailsRaw = localStorage.getItem(CUSTOMER_DETAILS_STORAGE_KEY);
        if (savedDetailsRaw) {
          const savedDetails = JSON.parse(savedDetailsRaw);
          // Pre-fill form with saved data, but prioritize logged-in user's business name
          defaultValues = {
            customerName: savedDetails.customerName || "",
            phoneNumber: savedDetails.phoneNumber || "",
            email: savedDetails.email || "",
            businessName: clientUser?.businessName || savedDetails.businessName || "",
            role: savedDetails.role || "",
            deliveryAddress: savedDetails.deliveryAddress || "",
          };
        }
      } catch (error) {
        console.warn("Failed to load customer details from localStorage for form reset", error);
      }
      form.reset(defaultValues);
    }
  }, [isOpen, clientUser, form]);


  const businessTypeLabel = selectedMenuType ? `${selectedMenuType.charAt(0).toUpperCase() + selectedMenuType.slice(1)} Name` : 'Business Name';
  const businessNamePlaceholder = selectedMenuType ? `Your ${selectedMenuType} name` : 'Your business name';
  const addressLabel = selectedMenuType ? `${selectedMenuType.charAt(0).toUpperCase() + selectedMenuType.slice(1)} Address` : 'Delivery Address';
  const addressPlaceholder = selectedMenuType ? `Your ${selectedMenuType}'s full address` : 'Full delivery address';
  
  const restaurantRoles = ["Owner", "Chef", "Manager", "Management", "Official"];
  const parlourRoles = ["Owner", "Staff", "Management", "Official"];
  const roles = selectedMenuType === 'restaurant' ? restaurantRoles : parlourRoles;

  const handleFormSubmit = (data: CustomerDetailsFormValues) => {
    try {
      localStorage.setItem(CUSTOMER_DETAILS_STORAGE_KEY, JSON.stringify(data));
    } catch(error) {
        console.warn("Could not save customer details to localStorage", error);
    }
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                      <FormLabel className="flex items-center"><Building className="h-4 w-4 mr-2 text-muted-foreground"/>{businessTypeLabel}*</FormLabel>
                      <FormControl>
                        <Input placeholder={businessNamePlaceholder} {...field} />
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
                       <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground"/>{addressLabel}*</FormLabel>
                      <FormControl>
                        <Textarea placeholder={addressPlaceholder} {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="px-6 py-4 border-t mt-auto">
              <DialogClose asChild>
                <Button type="button" variant="outline">
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
