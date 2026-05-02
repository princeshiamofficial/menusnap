"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function FreeDesignFeatures() {
  const features = [
    {
      id: "#১",
      title: "টাকা দিয়ে হতাশার ভয়?",
      description: "ডিজাইনারকে পেমেন্ট করলেন কিন্তু কাজ মনের মতো হলো না? পুরো টাকাই লস—এমন চিন্তা আর করতে হবে না।"
    },
    {
      id: "#২",
      title: "রিভিশনের সময় নষ্ট?",
      description: "বারবার চেঞ্জ চাইতে গিয়ে সম্পর্ক খারাপ হওয়া বা কাজ শেষ না হওয়ার ঝামেলা এখন অতীত। আমরা প্রফেশনাল কাজ দিই প্রথমবারেই।"
    },
    {
      id: "#৩",
      title: "মানহীন ডিজাইনের অবসান",
      description: "মাঝারি ডিজাইন দিয়ে ব্যবসা চালিয়ে প্রথম ইম্প্রেশন হারাবেন না। আপনার ব্র্যান্ডের জন্য আমরা নিশ্চিত করি সেরা মান।"
    },
    {
      id: "#৪",
      title: "আগে ভরসা, পরে পেমেন্ট",
      description: "অচেনা কাউকে আগে টাকা দেওয়ার সাহস পাচ্ছেন না? আমাদের ওপর ভরসা রাখা সহজ, কারণ আগে আমরা কাজ করে দেখাই।"
    }
  ];

  return (
    <section className="bg-white py-6 md:py-24 px-6 md:px-12 lg:px-24 border-t border-slate-100 font-bengali">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-[#1A1A1A] text-4xl md:text-6xl font-serif mb-6 leading-tight">
            আগে টাকা দেওয়া মানে <br className="hidden md:block" />
            অনেক রিস্ক নেওয়া
          </h2>
          <p className="text-[#666666] text-xl max-w-3xl mx-auto font-medium">
            বেশিরভাগ বিজনেস ওনার ভালো ডিজাইন চান, কিন্তু না জেনে আগে পেমেন্ট করতে ভয় পান। এই ভয়টা সম্পূর্ণ যুক্তিসঙ্গত, আর আমরা এখানে সেই ভয় দূর করতেই কাজ করি।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Floating Books */}
          <div className="relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full aspect-square max-w-[500px]"
            >
              <Image
                src="/floating-books.png"
                alt="Floating Books"
                fill
                className="object-contain"
              />
            </motion.div>
          </div>

          {/* Right Side - Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#F07C22] text-2xl font-bold group-hover:scale-110 transition-transform">{feature.id}</span>
                  <h3 className="text-[#1A1A1A] text-2xl font-bold">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[#666666] text-lg leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
  
  .font-serif {
    font-family: 'Playfair Display', serif;
  }
  
  .font-bengali {
    font-family: 'Hind Siliguri', sans-serif;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
