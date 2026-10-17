"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Download, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { FreeGuide, GuideChapter } from "@/lib/menusnap-types";
import { submitGuideLeadAction } from "@/app/actions/free-guides";
import { trackEbookLead } from "@/lib/analytics";

interface FreeGuidesClientProps {
  initialGuides: FreeGuide[];
}

export const DEFAULT_CHAPTERS: GuideChapter[] = [
  {
    title: "ফুড ফটোগ্রাফি",
    description: "প্রাকৃতিক আলো, সঠিক অ্যাঙ্গেল এবং প্রপস ব্যবহার করে কাস্টমারের ক্ষুধা জাগিয়ে তোলার কৌশল।",
  },
  {
    title: "সোশ্যাল মিডিয়া মার্কেটিং",
    description: "ফেসবুক ও ইনস্টাগ্রামে নিয়মিত পোস্ট, টার্গেটেড অ্যাড এবং ইউজার জেনারেটেড কন্টেন্টের সঠিক ব্যবহার।",
  },
  {
    title: "ভিডিও কন্টেন্ট",
    description: "Behind-the-scene ক্লিপ, ফুড প্রিপারেশন Reels এবং কাস্টমার রিভিউ — যা বিক্রি বাড়ায়।",
  },
  {
    title: "Local SEO ও Google Maps",
    description: "\"Best Restaurant near me\" সার্চে প্রথমে থাকতে Google Business Profile, রিভিউ ও লোকাল কীওয়ার্ড।",
  },
  {
    title: "রেস্টুরেন্ট অটোমেশন",
    description: "Smart POS, অনলাইন অর্ডার সিস্টেম, KDS এবং কাস্টমার ডেটাবেজ দিয়ে কাজের চাপ কমান।",
  },
  {
    title: "৭ সাকসেস ফর্মুলা",
    description: "ওয়েটার ট্রেনিং, আপ-সেলিং, বান্ডেল অফার, স্টুডেন্ট ডিল, কর্পোরেট গেস্ট — সব কৌশল একসাথে।",
  },
  {
    title: "মেনু ইঞ্জিনিয়ারিং",
    description: "BCG Matrix দিয়ে Stars, Plowhorses, Puzzles, Low আইটেম চিহ্নিত করে মুনাফা বাড়ান।",
  },
  {
    title: "কাস্টমার রিটেনশন",
    description: "লয়্যালটি প্রোগ্রাম, SMS মার্কেটিং এবং পার্সোনালাইজেশন দিয়ে পুরোনো কাস্টমার ধরে রাখুন।",
  },
];

const TESTIMONIALS = [
  {
    name: "আরিফুল ইসলাম",
    role: "মালিক, চিল অ্যান্ড গ্রিল",
    text: "এই ইবুকটি পড়ার পর আমার রেস্টুরেন্টের মার্কেটিং করার ধরন পুরোপুরি বদলে গেছে। বিশেষ করে মেনু ইঞ্জিনিয়ারিং চ্যাপ্টারটি আমার প্রফিট অনেক বাড়িয়ে দিয়েছে।",
    avatar: "/avatars/ariful.png",
  },
  {
    name: "সাদিয়া রহমান",
    role: "ফাউন্ডার, দ্য পাস্তা হাট",
    text: "সোশ্যাল মিডিয়া নিয়ে অনেক কনফিউশন ছিল, কিন্তু এই গাইডে সব কিছু খুব সহজভাবে বুঝানো হয়েছে। রেস্টুরেন্ট ব্যবসার জন্য এটি একটি অসাধারণ রোডম্যাপ।",
    avatar: "/avatars/sadia.png",
  },
  {
    name: "রাকিবুল হাসান",
    role: "ম্যানেজার, ফুড এক্সপ্রেস",
    text: "অটোমেশন এবং কাস্টমার রিটেনশন চ্যাপ্টারটি আমাদের অপারেশনাল খরচ অনেক কমিয়ে দিয়েছে। নতুন এবং পুরাতন সব ব্যবসায়ীদের জন্য এটি মাস্ট-হ্যাভ।",
    avatar: "/avatars/rakibul.png",
  },
  {
    name: "ফারহান আহমেদ",
    role: "মালিক, বিরিয়ানি হাউস",
    text: "এই ইবুকটি শুধু একটি গাইড না, এটি রেস্টুরেন্ট ব্যবসার একটি পরিপূর্ণ রোডম্যাপ। কাস্টমার রিটেনশন নিয়ে এর চ্যাপ্টারগুলো অসাধারণ। মাত্র ১ মাসে আমার রিপিট কাস্টমার ২০% বেড়েছে।",
    avatar: "/avatars/farhan.png",
  },
];

export function FreeGuidesClient({ initialGuides }: FreeGuidesClientProps) {
  const [guides] = useState<FreeGuide[]>(initialGuides);
  const [activeGuide, setActiveGuide] = useState<FreeGuide>(
    initialGuides[0] || {
      id: 1,
      title: "রেস্টুরেন্ট ডিজিটাল সাকসেস গাইড",
      slug: "restaurant-digital-success-guide",
      description: "আপনার রেস্টুরেন্টকে ব্র্যান্ডে পরিণত করার সম্পূর্ণ রোডম্যাপ।",
      cover_image: "/Ebook.png",
      file_url: "/Business Growth Guide By Color Hut.pdf",
      category: "Business Growth",
      badge_text: "সম্পূর্ণ বিনামূল্যে",
      chapters: DEFAULT_CHAPTERS,
      download_count: 0,
      is_active: true,
      sort_order: 1,
    }
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    restaurantName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active guide chapters or fallback to default 8 chapters
  const chapters: GuideChapter[] =
    activeGuide.chapters && activeGuide.chapters.length >= 8
      ? activeGuide.chapters
      : DEFAULT_CHAPTERS;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.restaurantName.trim()
    ) {
      setErrorMessage("দয়া করে সব কয়টি তথ্য সঠিকভাবে পূরণ করুন।");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitGuideLeadAction({
        guideId: activeGuide.id,
        guideName: activeGuide.title,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        restaurantName: formData.restaurantName.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।");
        setIsSubmitting(false);
        return;
      }

      // Track lead event in GTM dataLayer and Meta Pixel
      trackEbookLead({
        eventId: res.eventId,
        leadId: res.leadId ? String(res.leadId) : `lead_${Date.now()}`,
        ebookName: activeGuide.title,
        leadType: "free_ebook",
        formId: "ebook_lead_form",
      });

      const fileToOpen =
        res.fileUrl ||
        activeGuide.file_url ||
        "/Business Growth Guide By Color Hut.pdf";

      setDownloadUrl(fileToOpen);
      setSubmitSuccess(true);

      // Trigger instant direct download
      if (typeof window !== "undefined") {
        const link = document.createElement("a");
        link.href = fileToOpen;
        link.download = fileToOpen.split("/").pop() || "Business Growth Guide By Color Hut.pdf";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      console.error("Guide lead submit error:", err);
      setErrorMessage(err?.message || "সাবমিট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden pt-20">
      {/* Hero Section / Chapter Overview (Identical to /ebook) */}
      <section className="relative pt-8 md:pt-20 pb-16 md:pb-36 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Guide switcher tabs if multiple guides exist */}
          {guides.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {guides.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setActiveGuide(g);
                    setSubmitSuccess(false);
                    setErrorMessage(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeGuide.id === g.id
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-500/25"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>
          )}

          {/* Heading */}
          <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20 px-4">
            <div className="w-fit mx-auto text-center mb-3">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-2">
                {activeGuide.title}
              </h1>
              <div className="h-[2px] w-full bg-orange-500/50" />
            </div>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed mt-2">
              {activeGuide.description || "আপনার রেস্টুরেন্টকে ব্র্যান্ডে পরিণত করার সম্পূর্ণ রোডম্যাপ।"}
            </p>
          </div>

          {/* 3-Column Chapter Layout */}
          <div className="lg:bg-transparent bg-[#0a0a0a] text-white -mx-4 px-6 pt-8 pb-6 md:px-8 lg:p-0 rounded-2xl border border-white/5 lg:border-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-6 items-center max-w-6xl mx-auto">
              {/* Left Column (Chapters 1 to 4) */}
              <div className="lg:col-span-3 space-y-10 md:space-y-14 order-2 lg:order-1">
                {chapters.slice(0, 4).map((chapter, index) => (
                  <div key={index} className="text-center lg:text-right">
                    <h4 className="text-base sm:text-lg font-bold text-white mb-2">
                      {chapter.title}
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto lg:ml-auto lg:mr-0 font-light">
                      {chapter.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Center Column: 3D Ebook Cover with Circular Badge & Download CTA */}
              <div className="lg:col-span-6 flex justify-center order-1 lg:order-2 mb-4 lg:mb-0">
                <div className="relative px-4 md:px-0">
                  {/* Circular Stamp Sticker */}
                  <div className="absolute -top-3 -right-2 md:top-2 md:right-3 z-20 pointer-events-none rotate-12">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-50 via-orange-100 to-orange-200 border-2 border-orange-600 shadow-2xl flex items-center justify-center p-2 text-center">
                      <div className="w-full h-full rounded-full border border-dashed border-orange-600 flex flex-col items-center justify-center">
                        <span className="text-xs md:text-sm font-extrabold text-orange-950 leading-tight">
                          {activeGuide.badge_text || "সম্পূর্ণ বিনামূল্যে"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-white/5">
                    <Image
                      src={activeGuide.cover_image || "/Ebook.png"}
                      alt={activeGuide.title}
                      width={600}
                      height={840}
                      priority
                      className="w-full max-w-[340px] md:max-w-[440px] lg:max-w-[500px] h-auto object-cover rounded-sm"
                    />
                  </div>

                  {/* Download Button */}
                  <div className="mt-8 flex justify-center">
                    <a
                      href="#download-section"
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-8 rounded-full shadow-xl shadow-orange-500/20 flex items-center gap-2 text-sm uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      <span>ইবুকটি ডাউনলোড করুন</span>
                      <svg
                        className="w-4 h-4 animate-bounce"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column (Chapters 5 to 8) */}
              <div className="lg:col-span-3 space-y-10 md:space-y-14 order-3">
                {chapters.slice(4, 8).map((chapter, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <h4 className="text-base sm:text-lg font-bold text-white mb-2">
                      {chapter.title}
                    </h4>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto lg:ml-0 font-light">
                      {chapter.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (Identical to /ebook) */}
      <section className="pt-16 pb-12 md:pb-32 px-6 relative z-10 bg-[#050505] md:bg-white text-white md:text-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              রেস্টুরেন্ট মালিকরা কী বলছেন
            </h2>
            <div className="h-[2px] w-24 bg-orange-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-white/5 md:border-gray-100 bg-white/[0.03] md:bg-gray-50 shadow-sm relative"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 md:border-gray-200">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white md:text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-gray-400 md:text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 md:text-gray-600 text-sm leading-relaxed font-light italic">
                  "{testimonial.text}"
                </p>
                <div className="mt-4 flex text-orange-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Section (Full Form: Name, Email, Phone, Restaurant Name) */}
      <section
        id="download-section"
        className="pt-14 pb-24 md:py-24 px-6 relative z-10 bg-[#0a0a0a] border-t border-white/5"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              আপনার ফ্রি কপিটি সংগ্রহ করুন
            </h2>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
              আপনার তথ্য দিয়ে নিচের সম্পূর্ণ ফর্মটি পূরণ করুন। তাৎক্ষণিকভাবে আপনার
              ইবুকটি ডাউনলোড শুরু হয়ে যাবে।
            </p>

            {submitSuccess ? (
              /* Success Message */
              <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white/[0.04] border border-orange-500/30 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  আপনার ইবুকটি প্রস্তুত!
                </h3>
                <p className="text-gray-300 text-sm mt-2">
                  ধন্যবাদ! আপনার ডাউনলোড কিছুক্ষণের মধ্যে শুরু হবে।
                </p>
                {downloadUrl && (
                  <div className="mt-6">
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>ডাউনলোড শুরু না হলে এখানে ক্লিক করুন</span>
                      <ExternalLink className="w-4 h-4 opacity-75" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* Full Form */
              <form
                onSubmit={handleDownloadSubmit}
                className="max-w-2xl mx-auto bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 text-left space-y-4 mt-8 shadow-2xl"
              >
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="যেমন: তানময় আহমেদ"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      আপনার ইমেইল অ্যাড্রেস *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="যেমন: owner@restaurant.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      ফোন / হোয়াটসঅ্যাপ নম্বর *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="যেমন: 017XXXXXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>

                  {/* Restaurant Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      রেস্টুরেন্ট / ব্যবসার নাম *
                    </label>
                    <input
                      type="text"
                      name="restaurantName"
                      required
                      value={formData.restaurantName}
                      onChange={handleInputChange}
                      placeholder="যেমন: ক্যাফে রিভারভিউ"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>পাঠানো হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>ইবুকটি ডাউনলোড করুন (Free PDF)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Book Info */}
            <div className="flex items-center justify-center gap-4 pt-6 opacity-60">
              <Image
                src={activeGuide.cover_image || "/Ebook.png"}
                alt="Ebook Thumbnail"
                width={36}
                height={54}
                className="rounded-xs object-cover"
              />
              <div className="text-left text-xs text-gray-400">
                <p className="font-bold uppercase tracking-wider text-white">
                  {activeGuide.title}
                </p>
                <p>MenuSnap • PDF • Instant Access</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
