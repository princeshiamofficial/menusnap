
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
import { User, Phone, Mail, Building, MapPin, StickyNote } from 'lucide-react';

const customerDetailsSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  phoneNumber: z.string().min(10, "Phone number seems too short").max(20)
    .regex(/^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  companyName: z.string().max(100).optional(),
  deliveryAddress: z.string().max(250).optional(),
  notes: z.string().max(500).optional(),
});

export type CustomerDetailsFormValues = z.infer<typeof customerDetailsSchema>;

interface CustomerDetailsFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: CustomerDetailsFormValues) => void;
  selectedItems: MenuItem[]; // Receive selected items
}

export function CustomerDetailsForm({
  isOpen,
  onOpenChange,
  onSubmit,
  selectedItems, // Use selectedItems prop
}: CustomerDetailsFormProps): ReactNode {
  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      email: "",
      companyName: "",
      deliveryAddress: "",
      notes: "",
    },
    mode: "onChange",
  });

  const handleFormSubmit = (data: CustomerDetailsFormValues) => {
    onSubmit(data);
    form.reset(); // Reset form after submission
  };

  // Log selected items when the form is opened/updated (for debugging or if needed by the form)
  // React.useEffect(() => {
  //   if (isOpen) {
  //     console.log("Customer form opened with items:", selectedItems);
  //   }
  // }, [isOpen, selectedItems]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) form.reset(); // Reset form if dialog is closed without submitting
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Customer Details</DialogTitle>
          <DialogDescription>
            Please provide customer information to share the menu selection.
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
                      <FormLabel className="flex items-center"><User className="h-4 w-4 mr-2 text-muted-foreground"/>Customer Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer's full name" {...field} />
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
                      <FormLabel className="flex items-center"><Mail className="h-4 w-4 mr-2 text-muted-foreground"/>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="customer@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Building className="h-4 w-4 mr-2 text-muted-foreground"/>Company Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer's company name" {...field} />
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
                      <FormLabel className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground"/>Delivery Address (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full delivery address" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><StickyNote className="h-4 w-4 mr-2 text-muted-foreground"/>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any special instructions or notes..." {...field} rows={3}/>
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
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {form.formState.isSubmitting ? "Submitting..." : "Confirm Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

