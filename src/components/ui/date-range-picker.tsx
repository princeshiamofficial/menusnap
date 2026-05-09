"use client"

import * as React from "react"
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear, 
  subYears, 
  startOfDay, 
  endOfDay,
  isSameDay
} from "date-fns"
import { Calendar as CalendarIcon, X, ChevronDown } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DateRangePickerProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

const PRESETS = [
  { label: "Today", getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: "Yesterday", getValue: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: "Last 7 Days", getValue: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: "Last 30 Days", getValue: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "Last Month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "This Year", getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  { label: "Last Year", getValue: () => ({ from: startOfYear(subYears(new Date(), 1)), to: endOfYear(subYears(new Date(), 1)) }) },
];

export function DateRangePicker({
  date,
  setDate,
  className,
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const [isCustomOpen, setIsCustomOpen] = React.useState(false);

  // Determine if the current date matches a preset
  const activePreset = React.useMemo(() => {
    if (!date?.from || !date?.to) return null;
    return PRESETS.find(preset => {
      const val = preset.getValue();
      return val.from && val.to &&
        startOfDay(date.from!).getTime() === startOfDay(val.from).getTime() &&
        startOfDay(date.to!).getTime() === startOfDay(val.to).getTime();
    });
  }, [date]);

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setDate(preset.getValue());
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-semibold h-11 rounded-2xl bg-slate-50/50 border-slate-200 focus:ring-0 focus:border-slate-300 transition-all text-slate-900 hover:bg-slate-100/50 hover:text-slate-900 px-4",
              !date?.from && "text-slate-400 font-medium"
            )}
          >
            <CalendarIcon className="mr-2.5 h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">
              {activePreset ? (
                activePreset.label
              ) : date?.from ? (
                date.to ? (
                  isSameDay(date.from, date.to) ? (
                    format(date.from, "MMM d, yyyy")
                  ) : (
                    <>
                      {format(date.from, "LLL dd")} - {format(date.to, "LLL dd, yyyy")}
                    </>
                  )
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                placeholder
              )}
            </span>
            {(date?.from || date?.to) ? (
              <X 
                className="ml-auto h-4 w-4 opacity-30 hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-200 rounded-full" 
                onClick={(e) => {
                  e.stopPropagation();
                  setDate(undefined);
                }}
              />
            ) : (
              <ChevronDown className="ml-auto h-4 w-4 opacity-40" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 p-1.5 rounded-xl border-slate-200 shadow-2xl bg-white animate-in fade-in zoom-in-95 duration-100"
          sideOffset={8}
        >
          <DropdownMenuLabel className="px-3 py-2.5 text-[15px] font-bold text-[#1e293b]">Filter by Date</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100 mx-1 mb-1" />
          <div className="space-y-0.5">
            {PRESETS.map((preset) => (
              <DropdownMenuItem
                key={preset.label}
                onSelect={() => handlePresetSelect(preset)}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors cursor-pointer outline-none",
                  activePreset?.label === preset.label 
                    ? "bg-[#f97316] text-white focus:bg-[#f97316] focus:text-white shadow-sm" 
                    : "text-[#334155] focus:bg-slate-50 focus:text-[#1e293b]"
                )}
              >
                {preset.label}
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator className="bg-slate-100 mx-1 mt-1" />
          
          <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
            <PopoverTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setIsCustomOpen(true);
                }}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors cursor-pointer outline-none",
                  !activePreset 
                    ? "bg-[#f97316] text-white focus:bg-[#f97316] focus:text-white shadow-sm" 
                    : "text-[#334155] focus:bg-slate-50 focus:text-[#1e293b]"
                )}
              >
                Custom Range
              </DropdownMenuItem>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden bg-white" 
              align="end" 
              side="left" 
              sideOffset={12}
            >
              <div className="flex flex-col bg-white">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  className="p-3"
                />
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-8">
                  <div className="flex flex-col">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Custom Range</p>
                    <p className="text-[12px] text-slate-600 font-medium">Select dates on calendar</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-xl h-9 px-6 bg-[#1e293b] text-white hover:bg-slate-800 shadow-lg font-bold transition-all active:scale-95"
                    onClick={() => setIsCustomOpen(false)}
                  >
                    Apply Range
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
