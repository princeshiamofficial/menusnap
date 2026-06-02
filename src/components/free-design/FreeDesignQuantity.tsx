"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

function Counter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = Math.floor(latest).toLocaleString();
          }
        }
      });
      return () => controls.stop();
    } else {
      if (ref.current) {
        ref.current.textContent = "0";
      }
    }
  }, [inView, value, duration]);

  return <span ref={ref}>0</span>;
}

export function FreeDesignQuantity() {
  return (
    <section id="quantity-info" className="scroll-mt-[120px] w-full bg-white px-4 md:px-6 pt-3 pb-3 md:pt-5 md:pb-6 font-sans relative overflow-hidden">
      {/* Background blobs for subtle depth */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 rounded-full bg-[#caa460]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-64 h-64 rounded-full bg-[#caa460]/3 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 px-2 sm:px-4">
        {/* Horizontal Stats Banner Outer Wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto bg-black p-[2px] shadow-2xl rounded-lg"
        >
          {/* Inner Gold-Bordered Box */}
          <div
            className="bg-black py-3.5 px-2.5 sm:px-4 flex items-center justify-between rounded-md"
            style={{ border: '1px solid #caa460' }}
          >
            {/* Far Left Divider */}
            <div className="h-8 sm:h-11 w-[1px] bg-[#caa460]/40 shrink-0" />

            {/* Left Stat - Delivered */}
            <div className="flex flex-col items-center justify-center text-center flex-1 mx-1 sm:mx-2">
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#caa460] font-oswald tracking-normal mb-0.5 select-none whitespace-nowrap">
                <Counter value={5931} /> +
              </span>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-normal text-white/90 tracking-wide">
                Delivered
              </p>
            </div>

            {/* Middle Divider */}
            <div className="h-8 sm:h-11 w-[1px] bg-[#caa460]/40 shrink-0" />

            {/* Right Stat - Processing */}
            <div className="flex flex-col items-center justify-center text-center flex-1 mx-1 sm:mx-2">
              <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#caa460] font-oswald tracking-normal mb-0.5 select-none whitespace-nowrap">
                <Counter value={185} /> +
              </span>
              <p className="text-[9px] sm:text-[10px] md:text-xs font-normal text-white/90 tracking-wide">
                Processing
              </p>
            </div>

            {/* Far Right Divider */}
            <div className="h-8 sm:h-11 w-[1px] bg-[#caa460]/40 shrink-0" />
          </div>
        </motion.div>
      </div>

      {/* Inject Google Font for Oswald to match typography perfectly */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap');
        .font-oswald {
          font-family: 'Oswald', sans-serif;
        }
      `}</style>
    </section>
  );
}
