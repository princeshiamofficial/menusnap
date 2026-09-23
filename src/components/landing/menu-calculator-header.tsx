"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  TrendingUp,
  ArrowRight,
  ArrowDownUp,
  CheckCircle2,
  Sparkles,
  QrCode,
  MessageSquare,
  Printer,
  ShieldCheck,
  Star,
  Zap,
  Sliders,
  Store,
  ChevronDown,
} from "lucide-react";

type Currency = "BDT" | "USD";
type CalculatorTab = "estimator" | "roi";

interface MenuTierOption {
  id: string;
  name: string;
  description: string;
  baseBDT: number;
  baseUSD: number;
  perTableBDT: number;
  perTableUSD: number;
  features: string[];
}

const MENU_TIERS: MenuTierOption[] = [
  {
    id: "qr-digital",
    name: "Smart Digital QR Menu",
    description: "Cloud-hosted web menu, instant scans, live updates",
    baseBDT: 1490,
    baseUSD: 19,
    perTableBDT: 40,
    perTableUSD: 0.5,
    features: [
      "Custom branded QR codes for all tables",
      "Instant real-time menu editing",
      "High-res food photography & badges",
      "Multi-language & allergy filters",
    ],
  },
  {
    id: "whatsapp-ordering",
    name: "QR + WhatsApp Direct Orders",
    description: "Diners order from table directly to your WhatsApp",
    baseBDT: 2490,
    baseUSD: 29,
    perTableBDT: 60,
    perTableUSD: 0.8,
    features: [
      "Everything in Smart QR Digital Menu",
      "1-Tap WhatsApp instant order dispatch",
      "Zero commission on every single order",
      "Kitchen receipt & customer billing bot",
    ],
  },
  {
    id: "digital-print-bundle",
    name: "Digital QR + Luxury Print Bundle",
    description: "Digital web menu plus premium acrylic stands & print books",
    baseBDT: 4990,
    baseUSD: 59,
    perTableBDT: 120,
    perTableUSD: 1.5,
    features: [
      "Full digital QR + WhatsApp ordering setup",
      "Physical high-grade acrylic QR table stands",
      "350 GSM matte laminated menu print books",
      "Doorstep courier delivery nationwide",
    ],
  },
  {
    id: "enterprise-suite",
    name: "VIP Multi-Outlet Suite",
    description: "CRM, staff permissions, multi-branch dashboard",
    baseBDT: 8990,
    baseUSD: 99,
    perTableBDT: 180,
    perTableUSD: 2.2,
    features: [
      "Multi-branch central menu management",
      "Staff role permissions & kitchen display",
      "Dedicated account manager & fast VIP print",
      "Custom domain & POS webhook integration",
    ],
  },
];

export function MenuCalculatorHeader() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>("estimator");
  const [currency, setCurrency] = useState<Currency>("BDT");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // Estimator Tab State
  const [tableCount, setTableCount] = useState<number>(25);
  const [selectedTierId, setSelectedTierId] = useState<string>("whatsapp-ordering");
  const [tierDropdownOpen, setTierDropdownOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // ROI Tab State
  const [monthlyOrders, setMonthlyOrders] = useState<number>(1200);
  const [avgTicket, setAvgTicket] = useState<number>(650); // 650 BDT or 25 USD
  const [aggregatorCommission, setAggregatorCommission] = useState<number>(28); // 28%

  const selectedTier = MENU_TIERS.find((t) => t.id === selectedTierId) || MENU_TIERS[1];

  // Price calculations
  const rawPrice =
    currency === "BDT"
      ? selectedTier.baseBDT + tableCount * selectedTier.perTableBDT
      : selectedTier.baseUSD + tableCount * selectedTier.perTableUSD;

  // Annual discount: 20% off
  const finalPrice = billingCycle === "annual" ? Math.round(rawPrice * 0.8) : rawPrice;

  // ROI calculations
  const totalAggregatorSpend = Math.round(monthlyOrders * avgTicket * (aggregatorCommission / 100));
  const yearlySavings = totalAggregatorSpend * 12;

  const triggerSwapAnimation = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setActiveTab((prev) => (prev === "estimator" ? "roi" : "estimator"));
    }, 280);
  };

  const currencySymbol = currency === "BDT" ? "৳" : "$";

  return (
    <section className="relative w-full pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-gradient-to-b from-orange-400/15 via-amber-300/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -left-48 w-[420px] h-[420px] bg-orange-500/8 blur-[120px] rounded-full" />
        <div className="absolute top-1/4 -right-48 w-[480px] h-[480px] bg-amber-500/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Hero Copy & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Top Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-200/80 shadow-[0_2px_10px_rgba(240,124,34,0.08)] mb-5">
              <span className="flex h-2 w-2 rounded-full bg-[#F07C22] animate-pulse" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-gray-900 tracking-tight flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F07C22]" />
                Interactive Menu Cost & Savings Calculator
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-gray-950 tracking-tight leading-[1.12] mb-5">
              Calculate Your Digital Menu Package &{" "}
              <span className="bg-gradient-to-r from-[#F07C22] via-orange-500 to-amber-500 bg-clip-text text-transparent">
                0% Commission ROI
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal mb-8 max-w-2xl">
              Stop losing 25% to 30% of your restaurant profits to third-party delivery aggregators. 
              Deploy modern QR codes, instant WhatsApp ordering, and luxury print menus in under 24 hours.
            </p>

            {/* 4 Key Benefit Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-8">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-gray-100 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-[#F07C22]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-gray-900 leading-snug">0% Commission</h4>
                  <p className="text-[12px] text-gray-500 leading-normal">Keep 100% of diner order revenue directly</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-gray-100 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-[#F07C22]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-gray-900 leading-snug">1-Tap WhatsApp Orders</h4>
                  <p className="text-[12px] text-gray-500 leading-normal">Fast table ordering sent straight to your staff</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-gray-100 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-[#F07C22]">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-gray-900 leading-snug">Real-Time Menu Edits</h4>
                  <p className="text-[12px] text-gray-500 leading-normal">Update prices & 86 items instantly without reprint</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-gray-100 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-[#F07C22]">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-gray-900 leading-snug">Print & Stands Included</h4>
                  <p className="text-[12px] text-gray-500 leading-normal">350 GSM books & acrylic QR stands delivered</p>
                </div>
              </div>
            </div>

            {/* Social Proof Strip */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-200/80 w-full">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Customer avatar" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Customer avatar" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Customer avatar" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Customer avatar" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-gray-900 ml-1">4.9 / 5.0</span>
                </div>
                <span className="text-[11.5px] text-gray-500 font-medium">
                  Trusted by 5,000+ restaurant owners & managers
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Interactive Calculator Exchange Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 w-full"
          >
            <div className="relative rounded-[28px] bg-white/95 backdrop-blur-xl border border-gray-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] p-5 sm:p-7 overflow-hidden transition-all">
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F07C22] via-amber-400 to-orange-600" />

              {/* Calculator Header: Tabs & Currency Controls */}
              <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-gray-100">
                {/* Mode Selector Tabs */}
                <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/70">
                  <button
                    type="button"
                    onClick={() => setActiveTab("estimator")}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                      activeTab === "estimator"
                        ? "text-gray-950 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {activeTab === "estimator" && (
                      <motion.div
                        layoutId="calc-active-tab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-[#F07C22]" />
                      Package Quote
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("roi")}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                      activeTab === "roi"
                        ? "text-gray-950 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {activeTab === "roi" && (
                      <motion.div
                        layoutId="calc-active-tab"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Savings (ROI)
                    </span>
                  </button>
                </div>

                {/* Currency Switcher */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-1 py-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setCurrency("BDT")}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                      currency === "BDT"
                        ? "bg-[#0c0d12] text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    ৳ BDT
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                      currency === "USD"
                        ? "bg-[#0c0d12] text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    $ USD
                  </button>
                </div>
              </div>

              {/* TAB 1: MENU PACKAGE ESTIMATOR */}
              {activeTab === "estimator" && (
                <div className="space-y-4">
                  {/* INPUT ROW: Number of Tables */}
                  <div className="bg-gray-50/90 rounded-2xl p-3.5 border border-gray-200/80 transition-all hover:border-gray-300">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
                      <span>RESTAURANT SCALE</span>
                      <span className="text-[#F07C22] font-bold">
                        {tableCount} Tables Setup
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-orange-100/70 border border-orange-200 flex items-center justify-center text-[#F07C22]">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <input
                            type="number"
                            min={1}
                            max={200}
                            value={tableCount}
                            onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="text-xl sm:text-2xl font-black text-gray-900 bg-transparent outline-none w-20"
                          />
                          <p className="text-[11px] text-gray-500 -mt-0.5">Dining Tables</p>
                        </div>
                      </div>

                      {/* Stepper Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTableCount((c) => Math.max(1, c - 5))}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center text-sm shadow-2xs transition-colors"
                          aria-label="Decrease tables"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setTableCount((c) => Math.min(200, c + 5))}
                          className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center text-sm shadow-2xs transition-colors"
                          aria-label="Increase tables"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Table Quick Preset Pills */}
                    <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-gray-200/60">
                      {[10, 25, 50, 100].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setTableCount(count)}
                          className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                            tableCount === count
                              ? "bg-gray-900 text-white font-semibold"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {count} Tables
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PACKAGE TIER SELECTOR DROPDOWN */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTierDropdownOpen(!tierDropdownOpen)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-orange-300 transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-[#F07C22] flex items-center justify-center flex-shrink-0">
                          <Sliders className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {selectedTier.name}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {selectedTier.description}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                          tierDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {tierDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute top-full left-0 right-0 z-30 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 space-y-1"
                        >
                          {MENU_TIERS.map((tier) => (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => {
                                setSelectedTierId(tier.id);
                                setTierDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                                selectedTier.id === tier.id
                                  ? "bg-orange-50/80 text-orange-950 font-semibold"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <div>
                                <p className="font-bold">{tier.name}</p>
                                <p className="text-[11px] text-gray-500 font-normal">
                                  {tier.description}
                                </p>
                              </div>
                              {selectedTier.id === tier.id && (
                                <CheckCircle2 className="w-4 h-4 text-[#F07C22]" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* CENTRAL EXCHANGE CONVERTER BUTTON / BADGE */}
                  <div className="relative py-1 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-gray-200" />
                    </div>
                    <button
                      type="button"
                      onClick={triggerSwapAnimation}
                      title="Switch to Commission Savings Calculator"
                      className="relative z-10 inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-400 text-gray-700 hover:text-[#F07C22] shadow-sm px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <motion.span
                        animate={isSwapping ? { rotate: 180 } : { rotate: 0 }}
                        transition={{ duration: 0.28 }}
                      >
                        <ArrowDownUp className="w-3.5 h-3.5 text-[#F07C22]" />
                      </motion.span>
                      <span>Live Calculator Rate: 0% Comm.</span>
                    </button>
                  </div>

                  {/* OUTPUT ROW: Calculated Price & Included Items */}
                  <div className="bg-gradient-to-br from-[#0c0d12] to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                        ESTIMATED QUOTE
                      </span>
                      {/* Monthly / Annual billing pill */}
                      <div className="flex items-center bg-white/10 p-0.5 rounded-lg text-[10.5px]">
                        <button
                          type="button"
                          onClick={() => setBillingCycle("monthly")}
                          className={`px-2 py-0.5 rounded ${
                            billingCycle === "monthly" ? "bg-white text-gray-950 font-bold" : "text-gray-300"
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillingCycle("annual")}
                          className={`px-2 py-0.5 rounded ${
                            billingCycle === "annual" ? "bg-[#F07C22] text-white font-bold" : "text-gray-300"
                          }`}
                        >
                          Annual (20% OFF)
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {currencySymbol} {finalPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        / {billingCycle === "annual" ? "year (save 20%)" : "month"}
                      </span>
                    </div>

                    {/* Included Features Bullet Points */}
                    <div className="space-y-1.5 pt-3 border-t border-white/10 text-[11.5px] text-gray-300">
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{tableCount} custom QR stands included</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Instant WhatsApp order dispatch bot</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Real-time digital menu updates (no reprint fee)</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMMISSION SAVINGS (ROI) CALCULATOR */}
              {activeTab === "roi" && (
                <div className="space-y-4">
                  {/* Orders Input */}
                  <div className="bg-gray-50/90 rounded-2xl p-3.5 border border-gray-200/80">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5">
                      <span>MONTHLY DELIVERY / TAKEAWAY ORDERS</span>
                      <span className="text-emerald-600 font-bold">
                        {monthlyOrders.toLocaleString()} Orders / mo
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={10000}
                      step={50}
                      value={monthlyOrders}
                      onChange={(e) => setMonthlyOrders(parseInt(e.target.value))}
                      className="w-full accent-[#F07C22] h-2 bg-gray-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                      <span>100 Orders</span>
                      <span>5,000 Orders</span>
                      <span>10,000+ Orders</span>
                    </div>
                  </div>

                  {/* Average Ticket & Commission Inputs Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50/90 rounded-xl p-3 border border-gray-200/80">
                      <span className="text-[10.5px] font-semibold text-gray-500 block mb-1">
                        AVG. ORDER VALUE
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-400">{currencySymbol}</span>
                        <input
                          type="number"
                          min={50}
                          max={50000}
                          value={avgTicket}
                          onChange={(e) => setAvgTicket(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full text-base font-black text-gray-900 bg-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50/90 rounded-xl p-3 border border-gray-200/80">
                      <span className="text-[10.5px] font-semibold text-gray-500 block mb-1">
                        AGGREGATOR CUT
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[20, 25, 28, 30].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setAggregatorCommission(rate)}
                            className={`flex-1 py-1 text-[11px] rounded font-bold transition-colors ${
                              aggregatorCommission === rate
                                ? "bg-red-500 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* EXCHANGE DIVIDER */}
                  <div className="relative py-1 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-gray-200" />
                    </div>
                    <button
                      type="button"
                      onClick={triggerSwapAnimation}
                      title="Switch to Package Estimator"
                      className="relative z-10 inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-emerald-400 text-gray-700 hover:text-emerald-600 shadow-sm px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <ArrowDownUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="inline-flex items-center gap-1">
                        Switch: Aggregator 28% <ArrowRight className="w-3 h-3 text-emerald-600 inline" /> MenuSnap 0%
                      </span>
                    </button>
                  </div>

                  {/* SAVINGS RESULT DISPLAY */}
                  <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-black text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        DIRECT PROFIT SAVED MONTHLY
                      </span>
                      <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        100% Kept In Pocket
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                        {currencySymbol} {totalAggregatorSpend.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-300 font-medium">/ month</span>
                    </div>

                    <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs text-gray-300">
                      <span>Annual Projected Savings:</span>
                      <span className="font-extrabold text-white">
                        {currencySymbol} {yearlySavings.toLocaleString()} / year
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION CTA BUTTON */}
              <div className="mt-5 space-y-2.5">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-2 bg-[#F07C22] hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer select-none group"
                >
                  <span>Claim Your Smart Menu Package</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Trust and Safety Badges */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    14-Day Risk-Free Trial
                  </span>
                  <span>•</span>
                  <span>Fast 24-Hour Setup</span>
                  <span>•</span>
                  <span>No Credit Card Needed</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
