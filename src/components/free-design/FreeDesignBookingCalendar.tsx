"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Globe, ChevronLeft, ChevronRight, CheckCircle2, User, Mail, Phone, Calendar as CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBooking } from "@/app/actions/bookings";

// Time slots available for booking
const TIME_SLOTS = [
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
];

export function FreeDesignBookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null);

  // Form Details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");

  // Booking Flow States
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Details, 3: Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Get Calendar Info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Generate calendar days
  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // Next month leading days
  const totalSlots = 42; // standard 6-row calendar
  const nextMonthDaysCount = totalSlots - calendarDays.length;
  for (let i = 1; i <= nextMonthDaysCount; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  const formatSelectedDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatFullDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleNextStep = () => {
    if (selectedDate && selectedTime) {
      setConfirmedTime(selectedTime);
      setStep(2);
    }
  };

  const handleBackStep = () => {
    setStep(1);
    setConfirmedTime(null);
  };

  const handleScheduleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!selectedDate || !confirmedTime) return;
    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      setSubmitError("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const dateString = formatFullDateString(selectedDate);
      const res = await createBooking(name, email, whatsapp, dateString, confirmedTime, notes);

      if (res.success) {
        setStep(3);
      } else {
        setSubmitError(res.error || "Failed to schedule slot.");
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      setSubmitError("Failed to submit. Please check database connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTodaySelected = selectedDate && isToday(selectedDate);

  const filteredTimeSlots = TIME_SLOTS.filter((slot) => {
    if (!isTodaySelected) return true;

    const match = slot.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return true;
    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hour < 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;

    const now = new Date();
    const slotDate = new Date(selectedDate!);
    slotDate.setHours(hour, minute, 0, 0);

    return slotDate > now;
  });

  return (
    <section id="booking-calendar" className="w-full bg-white px-4 md:px-6 py-10 md:py-16 border-t border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-12 lg:px-20">
        
        {/* Main Calendly Mock Container */}
        <div className="max-w-5xl mx-auto bg-white border border-slate-200/60 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.06)] overflow-hidden min-h-[550px] grid grid-cols-1 md:grid-cols-12">
          
          {/* LEFT SIDEBAR: Meeting Details (Col Span 4) */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 p-6 md:p-8 flex flex-col justify-between bg-slate-50/50">
            <div>
              {/* Host Logo Wrapper */}
              <div className="bg-black inline-flex px-3 py-1.5 rounded-lg mb-6">
                <img 
                  src="/menusnap-logo-white.png" 
                  alt="MenuSnap Logo" 
                  className="h-5 w-auto object-contain"
                />
              </div>

              {/* Host Title */}
              <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">
                MenuSnap
              </h3>
              
              {/* Event Name */}
              <h1 className="text-slate-900 font-extrabold text-xl md:text-2xl leading-tight mb-4">
                Free Design Strategy Call
              </h1>

              {/* Meeting duration */}
              <div className="flex items-center gap-2.5 text-slate-600 font-bold text-sm mb-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>15 min</span>
              </div>

              {/* Delivery Details */}
              <div className="flex items-center gap-2.5 text-slate-600 font-bold text-sm mb-6">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>WhatsApp Call / Google Meet</span>
              </div>

              {/* Meeting Details Description */}
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
                A quick 15-minute consultation to review your menu structure, pricing strategy, and design options to boost your restaurant or salon sales.
              </p>
            </div>

            {/* Footer timezone hint */}
            <div className="text-slate-400 text-xs font-semibold flex items-center gap-1.5 mt-auto">
              <Globe className="w-3.5 h-3.5" />
              <span>Bangladesh Time (GMT+6)</span>
            </div>
          </div>

          {/* RIGHT VIEWPORT: Calendar / Time / Details Form (Col Span 8) */}
          <div className="md:col-span-8 p-6 md:p-8 flex flex-col relative justify-center bg-white">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full flex flex-col lg:flex-row gap-6 md:gap-8 justify-between"
                >
                  {/* Calendar Widget panel */}
                  <div className="flex-1 w-full max-w-md mx-auto lg:max-w-none">
                    <h2 className="text-slate-950 font-bold text-lg mb-6">
                      Select a Date & Time
                    </h2>

                    {/* Month Picker Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-700 font-bold text-sm">
                        {monthNames[month]} {year}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handlePrevMonth}
                          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextMonth}
                          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-bold text-slate-400 mb-2">
                      <span>SUN</span>
                      <span>MON</span>
                      <span>TUE</span>
                      <span>WED</span>
                      <span>THU</span>
                      <span>FRI</span>
                      <span>SAT</span>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2.5 gap-x-1.5 text-center">
                      {calendarDays.map((item, idx) => {
                        const past = isPastDate(item.date);
                        const current = item.isCurrentMonth;
                        const active = current && !past;
                        const selected = isSelected(item.date);
                        const today = isToday(item.date);

                        return (
                          <button
                            key={idx}
                            disabled={!active}
                            onClick={() => {
                              setSelectedDate(item.date);
                              setSelectedTime(null);
                            }}
                            className={`aspect-square w-full rounded-full flex flex-col items-center justify-center font-bold text-xs relative transition-all ${
                              selected
                                ? "bg-[#F07C22] text-white"
                                : active
                                ? "bg-orange-50 text-[#F07C22] hover:bg-[#F07C22]/20"
                                : "text-slate-300 cursor-not-allowed"
                            }`}
                          >
                            <span>{item.day}</span>
                            {today && !selected && (
                              <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#F07C22]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots Selector Sidebar (Triggered on active date click) */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full lg:w-60 shrink-0 flex flex-col max-w-md mx-auto lg:max-w-none"
                    >
                      <h4 className="text-slate-700 font-bold text-sm mb-4">
                        {formatSelectedDate(selectedDate)}
                      </h4>

                      <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-1">
                        {filteredTimeSlots.length > 0 ? (
                          filteredTimeSlots.map((time, idx) => {
                            const timeSelected = selectedTime === time;
                            return (
                              <div key={idx} className="flex flex-row gap-2 w-full">
                                <button
                                  onClick={() => setSelectedTime(time)}
                                  className={`py-3.5 px-4 border rounded-lg text-xs font-bold transition-all ${
                                    timeSelected
                                      ? "bg-slate-700 border-slate-700 text-white w-1/2"
                                      : "border-orange-500/30 text-[#F07C22] hover:border-[#F07C22] bg-white w-full"
                                  }`}
                                >
                                  {time}
                                </button>
                                
                                {timeSelected && (
                                  <motion.button
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={handleNextStep}
                                    className="w-1/2 py-3.5 bg-[#F07C22] hover:bg-[#D96B19] text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center"
                                  >
                                    Next
                                  </motion.button>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                            No slots available for today. Please select another date.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 2 && confirmedTime && selectedDate && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  {/* Back Navigation */}
                  <button
                    onClick={handleBackStep}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <h2 className="text-slate-950 font-extrabold text-lg mb-2">
                    Enter Details
                  </h2>
                  <p className="text-slate-400 text-xs font-bold mb-6">
                    {formatSelectedDate(selectedDate)} at {confirmedTime}
                  </p>

                  <form onSubmit={handleScheduleBooking} className="space-y-4 max-w-lg">
                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold pl-0.5">Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-white border border-slate-200 focus:border-[#F07C22] rounded-xl py-3 pl-10 pr-4 text-slate-800 text-sm font-medium shadow-2xs outline-none transition-all focus:ring-2 focus:ring-[#F07C22]/10"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold pl-0.5">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-white border border-slate-200 focus:border-[#F07C22] rounded-xl py-3 pl-10 pr-4 text-slate-800 text-sm font-medium shadow-2xs outline-none transition-all focus:ring-2 focus:ring-[#F07C22]/10"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Input */}
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold pl-0.5">WhatsApp Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="WhatsApp Number"
                          className="w-full bg-white border border-slate-200 focus:border-[#F07C22] rounded-xl py-3 pl-10 pr-4 text-slate-800 text-sm font-medium shadow-2xs outline-none transition-all focus:ring-2 focus:ring-[#F07C22]/10"
                        />
                      </div>
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-bold pl-0.5">Share notes / requirements</label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Please share anything that will help prepare for our meeting."
                        className="w-full bg-white border border-slate-200 focus:border-[#F07C22] rounded-xl py-3 px-4 text-slate-800 text-sm font-medium shadow-2xs outline-none transition-all focus:ring-2 focus:ring-[#F07C22]/10 resize-none"
                      />
                    </div>

                    {/* Error indicator */}
                    {submitError && (
                      <p className="text-red-500 text-xs font-bold">{submitError}</p>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#F07C22] hover:bg-[#D96B19] text-white font-bold py-3.5 px-6 rounded-full text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        "Schedule Event"
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 3 && selectedDate && confirmedTime && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full text-center flex flex-col items-center justify-center p-4 md:p-8"
                >
                  <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-500 mb-6 shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  
                  <h2 className="text-slate-900 font-extrabold text-2xl mb-2">
                    You are scheduled!
                  </h2>
                  <p className="text-slate-400 text-sm font-semibold mb-6">
                    A confirmation details overview is provided below.
                  </p>

                  <div className="w-full max-w-md border border-slate-100 rounded-2xl bg-slate-50/50 p-5 text-left mb-6 space-y-3.5">
                    <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm border-b border-slate-100 pb-2">
                      <div className="w-2 h-2 rounded-full bg-[#F07C22]" />
                      <span>Free Design Strategy Call</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-600 font-medium text-xs">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>15 min</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-600 font-medium text-xs">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-800">
                        {confirmedTime}, {formatSelectedDate(selectedDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-600 font-medium text-xs">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>Bangladesh Time (GMT+6)</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setStep(1);
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setName("");
                      setEmail("");
                      setWhatsapp("");
                      setNotes("");
                    }}
                    variant="outline"
                    className="border-slate-200 hover:bg-slate-100 rounded-full font-bold px-6 py-4"
                  >
                    Schedule another meeting
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
