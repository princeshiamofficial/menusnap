"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Globe, ChevronLeft, ChevronRight, CheckCircle2, User, Mail, Phone, Calendar as CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBooking, getClientIP } from "@/app/actions/bookings";

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
  const [mounted, setMounted] = useState(false);
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

  // Countdown Timer states for ৳1,000 Discount
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isDiscountActive, setIsDiscountActive] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize and run client-side timer seeded by User IP
  useEffect(() => {
    async function initTimer() {
      try {
        const ipRes = await getClientIP();
        const clientIp = ipRes?.ip || "127.0.0.1";
        const storageKey = `menusnap_timer_deadline_${clientIp}`;
        
        let deadline = localStorage.getItem(storageKey);
        const now = Date.now();
        
        if (!deadline) {
          // Initialize 3 hours from now
          const threeHours = 3 * 60 * 60 * 1000;
          const newDeadline = now + threeHours;
          localStorage.setItem(storageKey, newDeadline.toString());
          deadline = newDeadline.toString();
        }
        
        const deadlineNum = parseInt(deadline);
        if (deadlineNum > now) {
          setTimeLeft(Math.floor((deadlineNum - now) / 1000));
          setIsDiscountActive(true);
        } else {
          setTimeLeft(0);
          setIsDiscountActive(false);
        }
      } catch (error) {
        console.error("Error initializing IP-based timer:", error);
      }
    }
    
    initTimer();
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          setIsDiscountActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTimeLeft = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const hrsStr = hrs.toString().padStart(2, "0");
    const minsStr = mins.toString().padStart(2, "0");
    const secsStr = secs.toString().padStart(2, "0");
    
    const timeStr = `${hrsStr}:${minsStr}:${secsStr}`;

    const englishToBengaliMap: { [key: string]: string } = {
      "0": "০",
      "1": "১",
      "2": "২",
      "3": "৩",
      "4": "৪",
      "5": "৫",
      "6": "৬",
      "7": "৭",
      "8": "৮",
      "9": "৯",
    };
    
    return timeStr
      .split("")
      .map((char) => englishToBengaliMap[char] || char)
      .join("");
  };

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
      
      let finalNotes = notes;
      if (isDiscountActive) {
        finalNotes = notes.trim()
          ? `${notes}\n[৳১,০০০ Discount Applied (3h IP-based countdown)]`
          : '[৳১,০০০ Discount Applied (3h IP-based countdown)]';
      }

      const res = await createBooking(name, email, whatsapp, dateString, confirmedTime, finalNotes);

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
    <section id="booking-calendar" className="scroll-mt-[120px] w-full bg-white px-1 md:px-6 pt-6 pb-3 md:pt-10 md:pb-5 border-t border-slate-100 font-sans">
      <div className="max-w-7xl mx-auto w-full px-1 md:px-6">
        
        {/* Main Calendly Mock Container */}
        <div className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden min-h-[580px] grid grid-cols-1 md:grid-cols-12">
          
          {/* LEFT SIDEBAR: Meeting Details (Col Span 4) */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-100 p-6 md:p-8 flex flex-col justify-between bg-slate-50/30">
            <div>


              {/* Event Name */}
              <h1 className="text-slate-900 font-bold text-lg md:text-xl lg:text-2xl leading-tight mb-4 md:mb-6 tracking-tight">
                Free Design Strategy Call
              </h1>

              {/* ৳1,000 Discount Indicator with IP-based Countdown */}
              {isDiscountActive && timeLeft !== null && timeLeft > 0 && (
                <div className="bg-red-50 border border-red-200/60 rounded-2xl p-4 mb-6 shadow-xs font-bengali">
                  <div className="flex items-center gap-2 text-red-600 font-extrabold text-sm mb-1.5 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                    <span>৳১,০০০ ডিসকাউন্ট অ্যাক্টিভ!</span>
                  </div>
                  <p className="text-slate-600 text-xs font-bold leading-relaxed mb-3">
                    পরবর্তী ৩ ঘণ্টার মধ্যে আপনার বুকিং সম্পন্ন করে আপনার মেনু ডিজাইন প্যাকেজে ফ্ল্যাট ৳১,০০০ ডিসকাউন্ট বুঝে নিন।
                  </p>
                  <div className="bg-white border border-red-100 rounded-xl py-2 px-3 flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">অফারের সময় বাকি:</span>
                    <span className="text-red-600 font-extrabold text-sm tracking-mono">{formatTimeLeft(timeLeft)}</span>
                  </div>
                </div>
              )}

              <div className="hidden md:block space-y-4 mb-6">
                {/* Meeting duration */}
                <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#F07C22] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>15 min</span>
                </div>

                {/* Delivery Details */}
                <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#F07C22] shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span>WhatsApp Call / Google Meet</span>
                </div>
              </div>

              {/* Meeting Details Description */}
              <p className="hidden md:block text-slate-500 text-xs md:text-sm leading-relaxed mb-6 font-medium">
                A quick 15-minute consultation to review your menu structure, pricing strategy, and design options to boost your restaurant or salon sales.
              </p>
            </div>

            {/* Footer timezone hint */}
            <div className="hidden md:flex text-slate-400 text-xs font-semibold items-center gap-2 mt-4 md:mt-auto">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Bangladesh Time (GMT+6)</span>
            </div>
          </div>

          {/* RIGHT VIEWPORT: Calendar / Time / Details Form (Col Span 8) */}
          <div className="md:col-span-8 px-1 py-2.5 sm:p-6 md:p-8 lg:p-10 flex flex-col relative justify-center bg-white min-h-[400px]">
            {!mounted ? (
              <div className="flex items-center justify-center py-20 w-full">
                <Loader2 className="w-8 h-8 animate-spin text-[#F07C22]" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full flex flex-row gap-0.5 sm:gap-8 justify-center items-start max-w-3xl mx-auto"
                >
                  {/* Calendar Widget panel */}
                  <div className="flex-1 w-full max-w-[280px] sm:max-w-sm mx-auto">
                    <h2 className="text-slate-900 font-bold text-base sm:text-lg mb-6 tracking-tight">
                      Select a Date & Time
                    </h2>

                    {/* Month Picker Header */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-800 font-bold text-sm sm:text-base pl-1">
                        {monthNames[month]} {year}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handlePrevMonth}
                          className="p-2 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all border border-slate-100 text-slate-500"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextMonth}
                          className="p-2 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all border border-slate-100 text-slate-500"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-y-2 text-center text-[8px] sm:text-[10px] font-bold text-slate-400 tracking-wider mb-3">
                      <span>SUN</span>
                      <span>MON</span>
                      <span>TUE</span>
                      <span>WED</span>
                      <span>THU</span>
                      <span>FRI</span>
                      <span>SAT</span>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 sm:gap-y-3 gap-x-0.5 sm:gap-x-1 text-center">
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
                            className={`h-7 w-7 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full flex items-center justify-center text-xs sm:text-sm relative transition-all mx-auto ${
                              selected
                                ? "bg-[#F07C22] text-white shadow-md shadow-[#F07C22]/30 font-bold"
                                : active
                                ? today
                                  ? "bg-orange-50/10 text-[#F07C22] border border-[#F07C22]/20 font-bold hover:bg-[#F07C22] hover:text-white"
                                  : "text-slate-800 hover:bg-orange-50 hover:text-[#F07C22] font-semibold"
                                : "text-slate-300/80 cursor-not-allowed font-normal"
                            }`}
                          >
                            <span>{item.day}</span>
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
                      className="w-[110px] sm:w-[180px] md:w-60 shrink-0 flex flex-col max-w-sm mx-auto"
                    >
                      <h4 className="text-slate-700 font-bold text-[10px] sm:text-sm mb-4 leading-tight">
                        {formatSelectedDate(selectedDate)}
                      </h4>

                      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[280px] sm:max-h-[380px] md:max-h-[480px] pr-1.5 scrollbar-thin">
                        {filteredTimeSlots.length > 0 ? (
                          filteredTimeSlots.map((time, idx) => {
                            const timeSelected = selectedTime === time;
                            return (
                              <div key={idx} className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 w-full">
                                <button
                                  onClick={() => setSelectedTime(time)}
                                  className={`py-2 px-1 sm:py-3 sm:px-4 border rounded-xl text-[10px] sm:text-sm font-semibold transition-all ${
                                    timeSelected
                                      ? "bg-slate-900 border-slate-900 text-white w-full sm:w-1/2"
                                      : "border-slate-200 text-slate-700 hover:border-[#F07C22] hover:bg-orange-50/20 bg-white w-full"
                                  }`}
                                >
                                  {time}
                                </button>
                                
                                {timeSelected && (
                                  <motion.button
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={handleNextStep}
                                    className="w-full sm:w-1/2 py-2 sm:py-3 bg-[#F07C22] hover:bg-[#D96B19] text-white rounded-xl text-[10px] sm:text-sm font-bold shadow-md shadow-[#F07C22]/20 transition-all flex items-center justify-center"
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
                  className="w-full max-w-lg mx-auto"
                >
                  {/* Back Navigation */}
                  <button
                    onClick={handleBackStep}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200/80 mb-6 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <h2 className="text-slate-950 font-extrabold text-xl mb-1 tracking-tight">
                    Enter Details
                  </h2>
                  <p className="text-slate-400 text-xs font-semibold mb-6">
                    {formatSelectedDate(selectedDate)} at {confirmedTime}
                  </p>

                  <form onSubmit={handleScheduleBooking} className="space-y-4">
                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="text-slate-600 text-xs font-semibold pl-0.5">Name *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-white border border-slate-200 focus:border-[#F07C22] focus:ring-4 focus:ring-[#F07C22]/10 rounded-2xl py-3 pl-10 pr-4 text-slate-800 text-sm font-medium outline-none transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="text-slate-600 text-xs font-semibold pl-0.5">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-white border border-slate-200 focus:border-[#F07C22] focus:ring-4 focus:ring-[#F07C22]/10 rounded-2xl py-3 pl-10 pr-4 text-slate-800 text-sm font-medium outline-none transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Input */}
                    <div className="space-y-1.5">
                      <label className="text-slate-600 text-xs font-semibold pl-0.5">WhatsApp Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                          placeholder="WhatsApp Number"
                          className="w-full bg-white border border-slate-200 focus:border-[#F07C22] focus:ring-4 focus:ring-[#F07C22]/10 rounded-2xl py-3 pl-10 pr-4 text-slate-800 text-sm font-medium outline-none transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Notes Field */}
                    <div className="space-y-1.5">
                      <label className="text-slate-600 text-xs font-semibold pl-0.5">Share notes / requirements</label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Please share anything that will help prepare for our meeting."
                        className="w-full bg-white border border-slate-200 focus:border-[#F07C22] focus:ring-4 focus:ring-[#F07C22]/10 rounded-2xl py-3 px-4 text-slate-800 text-sm font-medium outline-none transition-all resize-none shadow-xs"
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
                      className="w-full sm:w-auto bg-[#F07C22] hover:bg-[#D96B19] text-white font-bold py-3.5 px-8 rounded-full text-sm shadow-md shadow-[#F07C22]/20 hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-6 shadow-xs animate-pulse">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <h2 className="text-slate-900 font-extrabold text-2xl mb-2 tracking-tight">
                    You are scheduled!
                  </h2>
                  <p className="text-slate-450 text-sm font-semibold mb-8">
                    A confirmation details overview is provided below.
                  </p>

                  <div className="w-full max-w-md border border-slate-100 rounded-3xl bg-slate-50/40 p-6 text-left mb-8 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F07C22]" />
                      <span>Free Design Strategy Call</span>
                    </div>

                    {isDiscountActive && (
                      <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm bg-emerald-50 border border-emerald-100 rounded-2xl p-3 mb-2 animate-bounce font-bengali">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>৳১,০০০ ডিসকাউন্ট অফারটি সফলভাবে যুক্ত হয়েছে!</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#F07C22]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span>15 min</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#F07C22]">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-800">
                        {confirmedTime}, {formatSelectedDate(selectedDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#F07C22]">
                        <Globe className="w-4 h-4" />
                      </div>
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
                    className="border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-full font-bold px-8 py-3.5 text-sm transition-all shadow-xs"
                  >
                    Schedule another meeting
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            )}
            
            {/* Mobile-only timezone hint at the bottom */}
            <div className="flex md:hidden text-slate-400 text-xs font-semibold items-center justify-center gap-2 mt-6 pb-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Bangladesh Time (GMT+6)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
