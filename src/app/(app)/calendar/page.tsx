import { AppointmentCalendarView } from '@/components/calendar/appointment-calendar-view';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointment Calendar</h1>
        <p className="text-muted-foreground">
          Schedule and manage your appointments.
        </p>
      </div>
      <AppointmentCalendarView />
    </div>
  );
}
