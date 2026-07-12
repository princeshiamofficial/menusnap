"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, MessageSquare, UploadCloud, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFileLocally } from "@/app/actions/uploads";
import { submitReview } from "@/app/actions/reviews";
import { compressImageFile } from "@/lib/utils";

export function FreeDesignAddReview() {
  const [businessName, setBusinessName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  // States for uploading and submitting
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    setIsUploading(true);
    try {
      const compressedFile = await compressImageFile(file, 1200, 0.8);
      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await uploadFileLocally(formData, "client-reviews");
      if (res.success && res.data?.url) {
        setImageUrl(res.data.url);
      } else {
        alert(res.message || "Failed to upload image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error occurred during image upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!businessName.trim()) {
      setSubmitError("Business name is required.");
      return;
    }
    if (!reviewText.trim()) {
      setSubmitError("Review text is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitReview(businessName, reviewText, imageUrl);
      if (res.success) {
        setIsSuccess(true);
        // Reset Form
        setBusinessName("");
        setReviewText("");
        setImageUrl("");
      } else {
        setSubmitError(res.error || "Failed to submit review.");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="add-review" className="w-full bg-white px-4 md:px-6 py-8 md:py-12 font-bengali border-t border-slate-100 relative overflow-hidden">
      {/* Soft background light blooms */}
      <div className="absolute -bottom-10 left-1/4 w-72 h-72 rounded-full bg-orange-400/5 blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-[#1A1A1A] text-3xl md:text-4xl font-serif mb-3 leading-tight">
            আপনার মতামত শেয়ার করুন
          </h2>
          <p className="text-[#666666] text-sm md:text-base max-w-lg mx-auto font-medium">
            আমাদের সার্ভিস নিয়ে আপনার অভিজ্ঞতা ও বিজনেস রিভিউ লিখুন।
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-xl mx-auto">
          <motion.div
            layout
            className="bg-[#FAF9F6] border border-slate-200/60 rounded-[2rem] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
          >
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Business Name Field */}
                  <div className="space-y-2">
                    <label htmlFor="businessName" className="block text-slate-700 text-sm font-bold pl-1">
                      Business Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Building className="w-4 h-4" />
                      </div>
                      <input
                        id="businessName"
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="আপনার রেস্টুরেন্ট বা সেলুনের নাম লিখুন"
                        className="w-full bg-white border border-slate-200 focus:border-[#F07C22] rounded-2xl py-3.5 pl-11 pr-4 text-slate-800 text-sm font-medium shadow-2xs outline-none transition-all focus:ring-2 focus:ring-[#F07C22]/10"
                      />
                    </div>
                  </div>

                  {/* Review Text Field */}
                  <div className="space-y-2">
                    <label htmlFor="reviewText" className="block text-slate-700 text-sm font-bold pl-1">
                      Review Text *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3.5 left-0 pl-4 flex pointer-events-none text-slate-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <textarea
                        id="reviewText"
                        required
                        rows={4}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="আমাদের ডিজাইন ও সার্ভিস নিয়ে আপনার মূল্যায়ন লিখুন..."
                        className="w-full bg-white border border-slate-200 focus:border-[#F07C22] rounded-2xl py-3.5 pl-11 pr-4 text-slate-800 text-sm font-medium shadow-2xs outline-none transition-all focus:ring-2 focus:ring-[#F07C22]/10 resize-none"
                      />
                    </div>
                  </div>

                  {/* Image Upload Zone */}
                  <div className="space-y-2">
                    <label className="block text-slate-700 text-sm font-bold pl-1">
                      Review Image (Optional)
                    </label>
                    
                    {!imageUrl ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-200 hover:border-[#F07C22]/50 bg-white rounded-2xl py-6 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-slate-50/50"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        {isUploading ? (
                          <>
                            <Loader2 className="w-8 h-8 text-[#F07C22] animate-spin" />
                            <span className="text-xs font-semibold text-slate-500">আপলোড হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-[#F07C22]" />
                            <span className="text-xs font-bold text-slate-600">ক্লিক করে ইমেজ আপলোড করুন</span>
                            <span className="text-[10px] text-slate-400">PNG, JPG, JPEG (Max 5MB)</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white p-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="w-12 h-12 object-cover rounded-xl border border-slate-100"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">ইমেজ আপলোড সম্পন্ন</span>
                            <span className="text-[10px] text-[#F07C22] font-semibold">Ready to submit</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all"
                          aria-label="Remove image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Error display */}
                  {submitError && (
                    <p className="text-red-500 text-xs font-bold text-center pl-1">
                      {submitError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="w-full bg-[#F07C22] hover:bg-[#D96B19] text-white py-6 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-55 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        সাবমিট হচ্ছে...
                      </>
                    ) : (
                      "রিভিউ সাবমিট করুন"
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 flex flex-col items-center justify-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-500 mb-2 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-[#1A1A1A] text-2xl font-bold font-bengali">
                    সাবমিট সম্পন্ন হয়েছে!
                  </h3>
                  <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
                    আপনার বিজনেসের মূল্যবান রিভিউটি সফলভাবে সেভ করা হয়েছে। মতামত দিয়ে পাশে থাকার জন্য ধন্যবাদ!
                  </p>
                  <Button
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    className="mt-4 border-slate-200 hover:bg-slate-100 rounded-xl font-bold px-6"
                  >
                    আরেকটি রিভিউ দিন
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

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
