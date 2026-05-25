"use client";

import { motion } from "framer-motion";
import { Layout, Book, Package, Truck } from "lucide-react";
import Image from "next/image";

export function FreeDesignServices() {
  const services = [
    {
      icon: <Layout className="w-8 h-8 text-[#F07C22]" />,
      title: "প্রিন্ট",
      description: "হাই-কোয়ালিটি প্রিন্টিং — রঙ ও কাগজের মান নিশ্চিত।"
    },
    {
      icon: <Book className="w-8 h-8 text-[#F07C22]" />,
      title: "বাইন্ডিং",
      description: "প্রফেশনাল বাইন্ডিং — দীর্ঘস্থায়ী ও স্মার্ট দেখতে।"
    },
    {
      icon: <Package className="w-8 h-8 text-[#F07C22]" />,
      title: "প্যাকেজিং",
      description: "সুন্দরভাবে প্যাক — পৌঁছানো পর্যন্ত নিখুঁত থাকে।"
    },
    {
      icon: <Truck className="w-8 h-8 text-[#F07C22]" />,
      title: "কুরিয়ার ডেলিভারি",
      description: "সারাদেশে আপনার ঠিকানায় পাঠানো হয়।"
    }
  ];

  return (
    <section id="services" className="bg-white py-6 md:py-24 px-6 md:px-12 lg:px-24 font-bengali border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Side - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center"
          >
            <Image
              src="/printing_delivery_workflow.png"
              alt="Design to Delivery Workflow"
              width={800}
              height={800}
              className="object-contain relative z-10 rounded-[2rem]"
            />
          </motion.div>

          {/* Right Side - Content */}
          <div className="flex flex-col">
            <div className="mb-12">
              <span className="text-[#F07C22] font-bold mb-4 block uppercase tracking-widest text-sm">আমাদের সার্ভিস</span>
              <h2 className="text-[#1A1A1A] text-2xl md:text-4xl lg:text-5xl font-serif mb-6 leading-[1.1] tracking-tight">
                ডিজাইন থেকে ডেলিভারি — সব এক জায়গায়
              </h2>
              <p className="text-[#666666] text-lg leading-relaxed font-medium">
                ডিজাইন পছন্দ হলে আমাদের লজিস্টিক টিম বাকি সব সামলায়। আপনাকে আর কোথাও যেতে হবে না।
              </p>
            </div>

            <div className="relative flex flex-col gap-6 w-full">
              {/* Connecting Line */}
              <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#F07C22] via-[#F07C22]/50 to-transparent hidden md:block" />

              {services.map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex items-center gap-6 group"
                >
                  {/* Step Number Bubble */}
                  <div className="relative z-10 w-12 h-12 bg-white border-2 border-[#F07C22] rounded-2xl flex items-center justify-center text-[#F07C22] font-bold text-xl flex-shrink-0 group-hover:bg-[#F07C22] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                    {["১", "২", "৩", "৪"][i]}
                  </div>
                  
                  {/* Content Card */}
                  <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-50 shadow-sm group-hover:shadow-2xl group-hover:shadow-[#F07C22]/5 group-hover:-translate-y-1 transition-all duration-500 flex-1 flex items-center gap-4 md:gap-6">
                    <div>
                      <h3 className="text-[#1A1A1A] text-lg font-bold group-hover:text-[#F07C22] transition-colors duration-300">
                        {service.title}
                      </h3>
                      <p className="text-[#666666] text-sm leading-relaxed font-medium mt-0.5">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
