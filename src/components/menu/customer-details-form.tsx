
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
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
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
      phoneNumber: clientUser?.whatsappNumber || "",
      email: "",
      businessName: clientUser?.businessName || "",
      role: "",
      deliveryAddress: "",
    },
    mode: "onChange",
  });
  
  // Mobile bottom sheet detection
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  React.useEffect(() => {
    // When the dialog opens, pre-fill with saved data or client user data.
    if (isOpen) {
      let defaultValues: CustomerDetailsFormValues = {
        customerName: "",
        phoneNumber: clientUser?.whatsappNumber || "",
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
            phoneNumber: clientUser?.whatsappNumber || savedDetails.phoneNumber || "",
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

  const formInner = (
    <>
      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 bg-background">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
            <User className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <DialogTitle className="text-lg font-bold leading-tight text-foreground">Your Details</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              Please provide your information to share the menu selection.
            </DialogDescription>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-grow">
            <div className="px-6 pb-2 space-y-5">

              {/* Name & Phone — side by side */}
              <div className="flex gap-3 items-start">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-orange-500" />Your Name*
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="rounded-full border-border/70 h-11 px-4 focus-visible:ring-orange-400 focus-visible:border-orange-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-orange-500" />Phone*
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+8801XXXXXXXXX"
                          {...field}
                          className="rounded-full border-border/70 h-11 px-4 focus-visible:ring-orange-400 focus-visible:border-orange-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-orange-500" />Email*
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="rounded-full border-border/70 h-11 px-4 focus-visible:ring-orange-400 focus-visible:border-orange-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Name & Role — side by side */}
              <div className="flex gap-3 items-start">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-orange-500" />{businessTypeLabel}*
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={businessNamePlaceholder}
                          {...field}
                          className="rounded-full border-border/70 h-11 px-4 focus-visible:ring-orange-400 focus-visible:border-orange-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-orange-500" />Your Role*
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-full border-border/70 h-11 px-4 focus:ring-orange-400 focus:border-orange-400">
                            <SelectValue placeholder="Select role" />
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
              </div>

              {/* Address */}
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-orange-500" />{addressLabel}*
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={addressPlaceholder}
                        {...field}
                        rows={3}
                        className="rounded-2xl border-border/70 px-4 pt-3 focus-visible:ring-orange-400 focus-visible:border-orange-400 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>

          <div className="px-6 pb-6 pt-4 flex gap-3 bg-background">
            {isMobile ? (
              <SheetClose asChild>
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-full text-muted-foreground">Cancel</Button>
              </SheetClose>
            ) : (
              <DialogClose asChild>
                <Button type="button" variant="outline" className="flex-1 h-11 rounded-full text-muted-foreground">Cancel</Button>
              </DialogClose>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="flex-1 h-11 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isSubmitting ? "Submitting..." : "Confirm Order"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="p-0 gap-0 rounded-t-2xl overflow-hidden border-0 shadow-2xl flex flex-col max-h-[95vh] [&>button]:hidden">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          {formInner}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden border-0 shadow-2xl">
        {formInner}
      </DialogContent>
    </Dialog>
  );
}
