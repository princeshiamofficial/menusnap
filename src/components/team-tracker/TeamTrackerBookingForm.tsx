"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function TeamTrackerBookingForm() {
  return (
    <section id="booking-form" className="bg-slate-50 dark:bg-slate-900/50 py-16 md:py-24 px-6 md:px-12 lg:px-24 font-bengali">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-[#1A1A1A] dark:text-white text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            টিমট্র্যাকার-এর <span className="text-[#F07C22]">ফ্রি ডেমো বুক করুন</span>
          </h2>
          <p className="text-[#666666] dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium px-4">
            আপনার ব্যবসার দক্ষতা বাড়াতে আমাদের বিশেষজ্ঞ টিমের সাথে একটি ফ্রি ডেমো সেশন সেশন আয়োজন করুন।
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
            <div className="space-y-2">
              <label className="text-slate-500 font-bold ml-2">আপনার নাম</label>
              <Input 
                placeholder="পুরো নাম লিখুন" 
                className="h-16 rounded-2xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 focus:ring-[#F07C22] focus:border-[#F07C22] text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-500 font-bold ml-2">ফোন নম্বর</label>
              <Input 
                placeholder="01X-XXXXXXXX" 
                className="h-16 rounded-2xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 focus:ring-[#F07C22] focus:border-[#F07C22] text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-500 font-bold ml-2">বিজনেসের ধরন</label>
              <Select>
                <SelectTrigger className="h-16 rounded-2xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-lg">
                  <SelectValue placeholder="বেছে নিন" />
                </SelectTrigger>
                <SelectContent className="font-bengali">
                  <SelectItem value="restaurant">রেস্টুরেন্ট/ক্যাফে</SelectItem>
                  <SelectItem value="office">কর্পোরেট অফিস</SelectItem>
                  <SelectItem value="logistics">লজিস্টিক ও ডেলিভারি</SelectItem>
                  <SelectItem value="factory">ম্যানুফ্যাকচারিং/ফ্যাক্টরি</SelectItem>
                  <SelectItem value="other">অন্যান্য</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-slate-500 font-bold ml-2">আপনার প্রধান চাহিদা</label>
              <Select>
                <SelectTrigger className="h-16 rounded-2xl border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-lg">
                  <SelectValue placeholder="বেছে নিন" />
                </SelectTrigger>
                <SelectContent className="font-bengali">
                  <SelectItem value="attendance">অ্যাটেনডেন্স ট্র্যাকিং</SelectItem>
                  <SelectItem value="geo_lock">জিও-লকিং (Location)</SelectItem>
                  <SelectItem value="payroll">পেরোল ইন্টিগ্রেশন</SelectItem>
                  <SelectItem value="team_mgmt">সম্পূর্ণ টিম ম্যানেজমেন্ট</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full bg-[#F07C22] hover:bg-[#D96B19] text-white h-16 rounded-2xl text-xl font-bold shadow-lg shadow-[#F07C22]/20 transition-all active:scale-95">
            ফ্রি ডেমো বুক করুন
          </Button>
        </motion.div>

        <p className="mt-8 text-slate-400 text-sm">
          * আমাদের টিম ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবে।
        </p>
      </div>
    </section>
  );
}
