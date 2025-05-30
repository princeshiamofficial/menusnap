"use client";

import { useState, useEffect } from 'react';
import type { Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus } from 'lucide-react';

interface AppointmentFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (appointment: Appointment) => void;
  initialData?: Partial<Appointment> & { date?: Date };
}

export function AppointmentForm({ isOpen, onOpenChange, onSave, initialData }: AppointmentFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState(''); // Simple time input e.g., "10:00 AM"
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDate(initialData.date || new Date());
      setTime(initialData.time || '');
      setDescription(initialData.description || '');
    } else {
      // Reset form when opened without initial data
      setTitle('');
      setDate(new Date());
      setTime('');
      setDescription('');
    }
  }, [initialData, isOpen]);


  const handleSubmit = () => {
    if (!title || !date || !time) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, date, and time for the appointment.",
        variant: "destructive",
      });
      return;
    }

    const newAppointment: Appointment = {
      id: initialData?.id || crypto.randomUUID(), // crypto.randomUUID() is fine for client-side mock
      title,
      date,
      time,
      description,
    };
    onSave(newAppointment);
    onOpenChange(false); // Close dialog
    toast({
      title: "Appointment Saved",
      description: `"${title}" has been scheduled.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarPlus className="mr-2 h-5 w-5" />
            {initialData?.id ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the appointment. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Meeting with Client X"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <DatePicker date={date} setDate={setDate} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input
              id="time"
              type="time" // Using HTML5 time input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional notes for the appointment"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
