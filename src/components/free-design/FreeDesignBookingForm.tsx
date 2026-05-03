"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClientAuth } from "@/hooks/use-client-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { saveFreeDesignRequest } from "@/app/actions/responses";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export function FreeDesignBookingForm() {
  const { clientUser } = useClientAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [requiredDesign, setRequiredDesign] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clientUser) {
      if (clientUser.businessName) setBusinessName(clientUser.businessName);
      if (clientUser.whatsappNumber) setPhone(clientUser.whatsappNumber);
      if (clientUser.type) setBusinessType(clientUser.type);
    }
  }, [clientUser]);

  const handleSubmit = async () => {
    if (!businessName || !phone || !businessType || !requiredDesign) {
      toast({
        title: "Information Required",
        description: "Please fill in all fields to book your slot.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveFreeDesignRequest({
        businessName,
        whatsappNumber: phone,
        businessType,
        requiredDesign
      });

      if (res.success) {
        router.push('/success?type=free-design');
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="booking-form" className="bg-white py-6 md:py-24 px-6 md:px-12 lg:px-24 font-bengali">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-[#1A1A1A] text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            এখনই আপনার <span className="text-[#F07C22]">ফ্রি স্লট বুক করুন</span>
          </h2>
          <p className="text-[#666666] text-lg max-w-2xl mx-auto font-medium px-4">
            সেরা মান নিশ্চিত করতে আমরা প্রতি মাসে মাত্র ১০টি ফ্রি স্লট দিয়ে থাকি।
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto mb-16 text-center"
        >
          <div className="flex justify-between items-end mb-3 px-1">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">এই মাসের স্লট</span>
            <span className="text-sm font-bold text-[#1A1A1A]">
              ৭টি বুকড — <span className="text-[#F07C22]">বাকি ৩টি</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "70%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-[#F07C22]" 
            />
          </div>
        </motion.div>

        {/* Form */}
        {clientUser ? (
          <div className="flex flex-col md:flex-row gap-6 items-end text-left mb-12 max-w-3xl mx-auto">
            <div className="flex-1 w-full space-y-2">
              <label className="text-slate-500 font-bold ml-2">কী ডিজাইন চান?</label>
              <Select onValueChange={setRequiredDesign} value={requiredDesign}>
                <SelectTrigger className="h-16 rounded-2xl border-slate-200 text-lg bg-white shadow-sm">
                  <SelectValue placeholder="বেছে নিন" />
                </SelectTrigger>
                <SelectContent className="font-bengali">
                  <SelectItem value="menu_card">মেনু কার্ড</SelectItem>
                  <SelectItem value="brochure">ব্রোশার</SelectItem>
                  <SelectItem value="price_list">প্রাইস লিস্ট</SelectItem>
                  <SelectItem value="visiting_card">ভিজিটিং কার্ড</SelectItem>
                  <SelectItem value="banner">ব্যানার</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full md:w-auto md:px-12 bg-[#F07C22] hover:bg-[#D96B19] text-white h-16 rounded-2xl text-lg font-bold shadow-lg shadow-[#F07C22]/20 transition-all active:scale-95 shrink-0"
            >
              {isSubmitting ? "..." : "স্লট বুক করুন"}
            </Button>
          </div>
        ) : (
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
              <div className="space-y-2">
                <label className="text-slate-500 font-bold ml-2">বিজনেসের নাম</label>
                <Input 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="আপনার রেস্টুরেন্ট বা শপের নাম লিখুন" 
                  className="h-16 rounded-2xl border-slate-200 focus:ring-[#F07C22] focus:border-[#F07C22] text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-500 font-bold ml-2">ফোন নম্বর</label>
                <Input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01X-XXXXXXXX" 
                  className="h-16 rounded-2xl border-slate-200 focus:ring-[#F07C22] focus:border-[#F07C22] text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 font-bold ml-2">বিজনেসের ধরন</label>
                <Select onValueChange={setBusinessType} value={businessType}>
                  <SelectTrigger className="h-16 rounded-2xl border-slate-200 text-lg">
                    <SelectValue placeholder="বেছে নিন" />
                  </SelectTrigger>
                  <SelectContent className="font-bengali">
                    <SelectItem value="restaurant">রেস্টুরেন্ট</SelectItem>
                    <SelectItem value="parlour">পার্লার</SelectItem>
                    <SelectItem value="mens_salon">মেনস সেলুন</SelectItem>
                    <SelectItem value="cafe">ক্যাফে</SelectItem>
                    <SelectItem value="other">অন্যান্য</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-500 font-bold ml-2">কী ডিজাইন চান?</label>
                <Select onValueChange={setRequiredDesign} value={requiredDesign}>
                  <SelectTrigger className="h-16 rounded-2xl border-slate-200 text-lg">
                    <SelectValue placeholder="বেছে নিন" />
                  </SelectTrigger>
                  <SelectContent className="font-bengali">
                    <SelectItem value="menu_card">মেনু কার্ড</SelectItem>
                    <SelectItem value="brochure">ব্রোশার</SelectItem>
                    <SelectItem value="price_list">প্রাইস লিস্ট</SelectItem>
                    <SelectItem value="visiting_card">ভিজিটিং কার্ড</SelectItem>
                    <SelectItem value="banner">ব্যানার</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full max-w-[280px] mx-auto bg-[#F07C22] hover:bg-[#D96B19] text-white h-14 rounded-2xl text-lg font-bold shadow-lg shadow-[#F07C22]/20 mb-12 flex items-center justify-center active:scale-95 transition-all"
            >
              {isSubmitting ? "বukিং হচ্ছে..." : "স্লট বুক করুন"}
            </Button>
          </div>
        )}

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-bengali {
          font-family: 'Hind Siliguri', sans-serif;
        }
      `}</style>
    </section>
  );
}
