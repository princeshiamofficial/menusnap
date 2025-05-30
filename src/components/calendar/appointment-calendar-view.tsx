"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Appointment } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppointmentForm } from './appointment-form';
import { PlusCircle, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app, this would come from an API/DB
const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'apt1', date: new Date(2024, 6, 15), time: '10:00', title: 'Meeting with John Doe' }, // July 15th
  { id: 'apt2', date: new Date(2024, 6, 15), time: '14:00', title: 'Project Sync Up' },    // July 15th
  { id: 'apt3', date: new Date(2024, 6, 17), time: '11:30', title: 'Client Call - Acme Corp' }, // July 17th
];


export function AppointmentCalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Partial<Appointment> & { date?: Date } | undefined>(undefined);
  const { toast } = useToast();

  const todaysAppointments = useMemo(() => {
    return selectedDate ? appointments.filter(apt => isSameDay(apt.date, selectedDate)).sort((a,b) => a.time.localeCompare(b.time)) : [];
  }, [selectedDate, appointments]);

  const handleSaveAppointment = (appointment: Appointment) => {
    setAppointments(prev => {
      const existingIndex = prev.findIndex(a => a.id === appointment.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = appointment;
        return updated;
      }
      return [...prev, appointment];
    });
  };
  
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment({ ...appointment, date: new Date(appointment.date) });
    setIsFormOpen(true);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(a => a.id !== appointmentId));
    toast({
      title: "Appointment Deleted",
      description: "The appointment has been removed.",
    });
  };
  
  const handleAddNewAppointment = () => {
    setEditingAppointment({ date: selectedDate || new Date() }); // Pass selected date to form
    setIsFormOpen(true);
  };


  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-1 shadow-lg">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Select a date to view appointments.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{ booked: appointments.map(apt => apt.date) }}
            modifiersStyles={{ booked: { fontWeight: 'bold', color: 'hsl(var(--primary))' } }}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              Appointments for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
            </CardTitle>
            <CardDescription>
              {todaysAppointments.length > 0 
                ? `You have ${todaysAppointments.length} appointment(s) scheduled.` 
                : 'No appointments for this day.'}
            </CardDescription>
          </div>
          <Button onClick={handleAddNewAppointment} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button>
        </CardHeader>
        <CardContent>
          {todaysAppointments.length > 0 ? (
            <ul className="space-y-3">
              {todaysAppointments.map(apt => (
                <li key={apt.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-foreground">{apt.title}</p>
                    <p className="text-sm text-muted-foreground">{apt.time}{apt.description ? ` - ${apt.description}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditAppointment(apt)}>
                      <Edit3 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the appointment titled "{apt.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAppointment(apt.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for this day.</p>
              <p className="text-sm">Select another date or add a new appointment.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveAppointment}
        initialData={editingAppointment}
      />
    </div>
  );
}
