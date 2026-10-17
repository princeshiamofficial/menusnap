"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle,
  Mail,
  KeyRound,
  ChefHat,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function PurchaseFlowSection() {
  const steps = [
    {
      num: "01",
      title: "Choose Plan",
      bangla: "প্ল্যান সিলেক্ট করুন",
      desc: "Select Starter, Pro, or Agency based on your restaurant business goals.",
      icon: <CreditCard className="w-5 h-5 text-[#FF5A36]" />,
    },
    {
      num: "02",
      title: "Secure Payment",
      bangla: "পেমেন্ট সম্পন্ন করুন",
      desc: "Instant payment via bKash, Nagad, Rocket, or local & international cards.",
      icon: <ShieldCheck className="w-5 h-5 text-[#FF5A36]" />,
    },
    {
      num: "03",
      title: "Account Activated",
      bangla: "অ্যাকাউন্ট ভেরিফিকেশন",
      desc: "Server automatically verifies payment and provisions your secure workspace.",
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    },
    {
      num: "04",
      title: "Check Your Email",
      bangla: "ইমেইল চেক করুন",
      desc: "Receive a one-time secure magic login link & password creation token.",
      icon: <Mail className="w-5 h-5 text-blue-500" />,
    },
    {
      num: "05",
      title: "Start Building",
      bangla: "লগইন করে মেন্যু বানান",
      desc: "Sign in immediately, research 500+ references, and build your menu list.",
      icon: <ChefHat className="w-5 h-5 text-[#FF5A36]" />,
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 text-[#FF5A36] text-xs font-bold tracking-wider uppercase mb-4 border border-orange-200/60">
          <KeyRound className="w-3.5 h-3.5" />
          Seamless Onboarding
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 font-bengali tracking-tight leading-tight mb-4">
          Payment-এর পর কী হবে?
        </h2>

        <p className="text-base sm:text-lg text-gray-600 font-sans max-w-xl mx-auto mb-16">
          Simple, automated, and secure. Receive your private access within seconds of completed payment.
        </p>

        {/* 5-Step Horizontal Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left relative">
          {steps.map((s, idx) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-[#FAFAF8] rounded-2xl p-5 border border-gray-200/80 flex flex-col justify-between relative group hover:border-orange-300 transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-gray-300 group-hover:text-[#FF5A36] transition-colors font-mono">
                    {s.num}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
                    {s.icon}
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-gray-950 mb-0.5">
                  {s.title}
                </h3>
                <p className="text-[11px] font-bold text-[#FF5A36] font-bengali mb-2">
                  {s.bangla}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Note */}
        <div className="mt-10 p-4 rounded-2xl bg-gray-50 border border-gray-200 max-w-2xl mx-auto flex items-center justify-center gap-2.5 text-xs text-gray-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Enterprise Security: We never store or email plain-text passwords. All activations use encrypted, one-time secure tokens.
          </span>
        </div>
      </div>
    </section>
  );
}
